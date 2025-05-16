// server/socketHandler.js
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Story = require('./models/Story');
const Session = require('./models/Session');

module.exports = function(io) {
  // Middleware for authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded.user;
      next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join a story session room
    socket.on('join-session', async ({ sessionId }) => {
      try {
        const session = await Session.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Join the room
        socket.join(sessionId);

        // Update the user's socket ID in the session
        let userExists = false;
        
        for (let i = 0; i < session.activeUsers.length; i++) {
          if (session.activeUsers[i].userId.toString() === socket.user.id) {
            session.activeUsers[i].socketId = socket.id;
            session.activeUsers[i].isConnected = true;
            session.activeUsers[i].lastActive = new Date();
            userExists = true;
            break;
          }
        }

        if (!userExists) {
          session.activeUsers.push({
            userId: socket.user.id,
            socketId: socket.id,
            isConnected: true,
            lastActive: new Date()
          });
        }

        await session.save();

        // Get the full story data
        const story = await Story.findById(session.story)
          .populate('creator', 'username avatar')
          .populate('participants', 'username avatar')
          .populate('prompt', 'text category')
          .populate({
            path: 'contributions',
            populate: { path: 'author', select: 'username avatar' }
          });

        // Notify room about the new user
        const user = await User.findById(socket.user.id).select('username avatar');
        socket.to(sessionId).emit('user-joined', user);

        // Send session and story data to the client
        socket.emit('session-joined', { session, story });
      } catch (error) {
        console.error('Join session error:', error);
        socket.emit('error', { message: 'Error joining session' });
      }
    });

    // User is typing
    socket.on('typing', ({ sessionId, isTyping }) => {
      socket.to(sessionId).emit('user-typing', {
        userId: socket.user.id,
        isTyping
      });
    });

    // New contribution added
    socket.on('new-contribution', async ({ sessionId, content }) => {
      try {
        const session = await Session.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Verify it's the user's turn
        if (session.currentTurnUserId.toString() !== socket.user.id) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        const story = await Story.findById(session.story);
        
        // Add contribution
        const contribution = {
          author: socket.user.id,
          content,
          timestamp: new Date()
        };

        story.contributions.push(contribution);
        story.currentTurn += 1;

        // Check if story is complete
        if (story.currentTurn >= story.turnLimit) {
          story.isComplete = true;
          session.isActive = false;
          
          await story.save();
          await session.save();
          
          io.to(sessionId).emit('story-complete', {
            storyId: story._id,
            message: 'Story is now complete!'
          });
          
          return;
        }

        // Find next user's turn
        const participantIndex = story.participants.findIndex(
          id => id.toString() === socket.user.id
        );
        const nextIndex = (participantIndex + 1) % story.participants.length;
        const nextUserId = story.participants[nextIndex];

        // Update session with next user's turn
        session.currentTurnUserId = nextUserId;
        session.turnStartTime = new Date();

        await story.save();
        await session.save();

        // Populate the contribution with author data
        const populatedContribution = await Story.populate(contribution, {
          path: 'author',
          select: 'username avatar'
        });

        // Get the next user data
        const nextUser = await User.findById(nextUserId).select('username avatar');

        // Notify all users in the session
        io.to(sessionId).emit('contribution-added', {
          contribution: populatedContribution,
          nextTurn: {
            userId: nextUserId,
            username: nextUser.username,
            avatar: nextUser.avatar
          },
          currentTurn: story.currentTurn
        });
      } catch (error) {
        console.error('New contribution error:', error);
        socket.emit('error', { message: 'Error adding contribution' });
      }
    });

    // Leave session
    socket.on('leave-session', async ({ sessionId }) => {
      try {
        const session = await Session.findById(sessionId);
        
        if (session) {
          // Update user's connection status
          for (let i = 0; i < session.activeUsers.length; i++) {
            if (session.activeUsers[i].userId.toString() === socket.user.id) {
              session.activeUsers[i].isConnected = false;
              session.activeUsers[i].lastActive = new Date();
              break;
            }
          }
          
          await session.save();
          
          // Notify others that user has left
          socket.to(sessionId).emit('user-left', {
            userId: socket.user.id
          });
        }
        
        socket.leave(sessionId);
      } catch (error) {
        console.error('Leave session error:', error);
      }
    });

    // Handle disconnections
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.id}`);
      
      try {
        // Find all sessions this user is active in
        const sessions = await Session.find({
          'activeUsers.userId': socket.user.id,
          'activeUsers.isConnected': true
        });
        
        // Update user's connection status in all sessions
        for (const session of sessions) {
          for (let i = 0; i < session.activeUsers.length; i++) {
            if (session.activeUsers[i].userId.toString() === socket.user.id) {
              session.activeUsers[i].isConnected = false;
              session.activeUsers[i].lastActive = new Date();
              break;
            }
          }
          
          await session.save();
          
          // Notify others in each session that user has left
          io.to(session._id.toString()).emit('user-left', {
            userId: socket.user.id
          });
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};