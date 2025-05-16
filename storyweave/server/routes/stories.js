// server/routes/stories.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Story = require('../models/Story');
const Session = require('../models/Session');
const User = require('../models/User');
const Prompt = require('../models/Prompt');

// Create a new story
router.post('/', auth, async (req, res) => {
  try {
    const { title, promptId, maxParticipants, turnLimit } = req.body;

    // Create new story
    const story = new Story({
      title,
      prompt: promptId,
      creator: req.user.id,
      participants: [req.user.id],
      maxParticipants: maxParticipants || 5,
      turnLimit: turnLimit || 10
    });

    // Save story
    await story.save();

    // Create a new session for this story
    const session = new Session({
      story: story._id,
      currentTurnUserId: req.user.id,
      turnStartTime: new Date()
    });

    // Save session
    await session.save();

    // Update prompt usage count if a prompt was used
    if (promptId) {
      await Prompt.findByIdAndUpdate(
        promptId,
        { $inc: { usageCount: 1 } }
      );
    }

    // Add story to user's stories array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { stories: story._id } }
    );

    res.status(201).json({ story, session });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all active story sessions (lobby)
router.get('/active', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true })
      .populate({
        path: 'story',
        select: 'title prompt creator participants maxParticipants turnLimit currentTurn',
        populate: [
          { path: 'creator', select: 'username avatar' },
          { path: 'prompt', select: 'text category' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific story by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('participants', 'username avatar')
      .populate('prompt', 'text category')
      .populate({
        path: 'contributions',
        populate: { path: 'author', select: 'username avatar' }
      });

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    res.json(story);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Story not found' });
    }
    res.status(500).send('Server error');
  }
});

// Join a story session
router.post('/:id/join', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if story is full
    if (story.participants.length >= story.maxParticipants) {
      return res.status(400).json({ message: 'Story session is full' });
    }

    // Check if user is already a participant
    if (story.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a participant' });
    }

    // Get the session
    const session = await Session.findOne({ story: story._id });

    if (!session || !session.isActive) {
      return res.status(400).json({ message: 'Session is not active' });
    }

    // Add user to participants
    await Story.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: req.user.id } }
    );

    // Add user to session's active users
    await Session.findByIdAndUpdate(
      session._id,
      { 
        $addToSet: { 
          activeUsers: { 
            userId: req.user.id
          } 
        } 
      }
    );

    // Add story to user's stories
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { stories: story._id } }
    );

    res.json({ message: 'Joined story successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a contribution to a story
router.post('/:id/contribute', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user is a participant
    if (!story.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a participant in this story' });
    }

    // Get the session
    const session = await Session.findOne({ story: story._id });

    if (!session || !session.isActive) {
      return res.status(400).json({ message: 'Session is not active' });
    }

    // Check if it's the user's turn
    if (session.currentTurnUserId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not your turn' });
    }

    // Add contribution
    const contribution = {
      author: req.user.id,
      content
    };

    story.contributions.push(contribution);
    story.currentTurn += 1;

    // Check if story is complete
    if (story.currentTurn >= story.turnLimit) {
      story.isComplete = true;
      session.isActive = false;
    } else {
      // Find next user's turn
      const participantIndex = story.participants.findIndex(
        id => id.toString() === req.user.id
      );
      const nextIndex = (participantIndex + 1) % story.participants.length;
      const nextUserId = story.participants[nextIndex];

      // Update session with next user's turn
      session.currentTurnUserId = nextUserId;
      session.turnStartTime = new Date();
    }

    await story.save();
    await session.save();

    res.json({ 
      message: 'Contribution added successfully',
      isComplete: story.isComplete
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all completed stories
router.get('/completed', auth, async (req, res) => {
  try {
    const stories = await Story.find({ isComplete: true })
      .populate('creator', 'username avatar')
      .populate('prompt', 'text category')
      .sort({ updatedAt: -1 });

    res.json(stories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all stories by current user
router.get('/user/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'stories',
        populate: [
          { path: 'creator', select: 'username avatar' },
          { path: 'prompt', select: 'text category' }
        ]
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.stories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;