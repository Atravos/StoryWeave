// client/src/pages/StorySession.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StoryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StoryContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StoryHeader = styled.div`
  padding: 1.5rem;
  background-color: ${props => {
    switch(props.category) {
      case 'fantasy': return '#9b59b6';
      case 'sci-fi': return '#3498db';
      case 'mystery': return '#f39c12';
      case 'romance': return '#e74c3c';
      case 'horror': return '#2c3e50';
      case 'comedy': return '#27ae60';
      default: return '#6b8afd';
    }
  }};
  color: white;
`;

const StoryTitle = styled.h1`
  font-size: 2rem;
  margin: 0 0 0.5rem;
`;

const StoryPrompt = styled.div`
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-style: italic;
`;

const StoryTextContainer = styled.div`
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
`;

const StoryTextSection = styled.div`
  margin-bottom: 2rem;
  position: relative;
`;

const ContributionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ContributorAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 0.75rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ContributorName = styled.span`
  font-weight: 500;
`;

const ContributionTime = styled.span`
  font-size: 0.875rem;
  color: #777;
  margin-left: auto;
`;

const ContributionText = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
  background-color: ${props => props.isCurrentUser ? '#f0f7ff' : 'transparent'};
  padding: ${props => props.isCurrentUser ? '1rem' : '0'};
  border-radius: ${props => props.isCurrentUser ? '4px' : '0'};
`;

const ContributionForm = styled.form`
  padding: 1.5rem;
  border-top: 1px solid #eee;
`;

const TextareaContainer = styled.div`
  position: relative;
`;

const ContributionTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #6b8afd;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const CharacterCounter = styled.div`
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.isExceeded ? '#e74c3c' : '#777'};
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #6b8afd;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #5a75e6;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ParticipantsCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0;
  color: #333;
`;

const ParticipantsList = styled.ul`
  list-style: none;
  padding: 1rem;
  margin: 0;
`;

const ParticipantItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  position: relative;
`;

const ParticipantAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 0.75rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ParticipantName = styled.span`
  font-weight: ${props => props.isCurrentTurn ? '600' : '400'};
  color: ${props => props.isCurrentTurn ? '#6b8afd' : '#333'};
`;

const CurrentTurnIndicator = styled.span`
  position: absolute;
  right: 0;
  font-size: 0.875rem;
  color: #6b8afd;
`;

const StoryInfoCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StoryInfoList = styled.ul`
  list-style: none;
  padding: 1rem;
  margin: 0;
`;

const StoryInfoItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #777;
`;

const InfoValue = styled.span`
  font-weight: 500;
  color: #333;
`;

const TurnNotification = styled.div`
  background-color: ${props => props.isYourTurn ? '#ebfaeb' : '#fff8e6'};
  border: 1px solid ${props => props.isYourTurn ? '#c3e6cb' : '#ffeeba'};
  color: ${props => props.isYourTurn ? '#155724' : '#856404'};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
`;

const TypingIndicator = styled.div`
  font-style: italic;
  color: #777;
  padding: 0.5rem 1.5rem;
  border-top: 1px solid #eee;
`;

const StorySession = () => {
  const { id: storyId } = useParams();
  const [story, setStory] = useState(null);
  const [session, setSession] = useState(null);
  const [contribution, setContribution] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const textAreaRef = useRef(null);
  const storyTextContainerRef = useRef(null);
  
  const MAX_CONTRIBUTION_LENGTH = 1000;
  
  useEffect(() => {
    fetchStory();
    
    // Initialize socket connection with correct port
    const newSocket = io('http://localhost:5002', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [storyId]);
  
  useEffect(() => {
    if (socket && session) {
      // Join the story session
      socket.emit('join-session', { sessionId: session._id });
      
      // Listen for socket events
      socket.on('session-joined', ({ session: updatedSession, story: updatedStory }) => {
        setSession(updatedSession);
        setStory(updatedStory);
      });
      
      socket.on('user-joined', (newUser) => {
        console.log('User joined:', newUser);
        // Update participants list
        setStory(prevStory => {
          if (!prevStory.participants.some(p => p._id === newUser._id)) {
            return {
              ...prevStory,
              participants: [...prevStory.participants, newUser]
            };
          }
          return prevStory;
        });
      });
      
      socket.on('user-left', ({ userId }) => {
        console.log('User left:', userId);
        // Could update UI to indicate user is disconnected
      });
      
      socket.on('user-typing', ({ userId, isTyping }) => {
        if (isTyping) {
          setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== userId));
        }
      });
      
      socket.on('contribution-added', ({ contribution: newContribution, nextTurn, currentTurn }) => {
        // Add new contribution to the story
        setStory(prevStory => {
          const updatedStory = {
            ...prevStory,
            contributions: [...prevStory.contributions, newContribution],
            currentTurn
          };
          return updatedStory;
        });
        
        // Update current turn in session
        setSession(prevSession => ({
          ...prevSession,
          currentTurnUserId: nextTurn.userId,
          turnStartTime: new Date()
        }));
        
        // Clear contribution input if it was your turn
        if (user && user._id === session.currentTurnUserId) {
          setContribution('');
        }
        
        // Scroll to the bottom of the story text container
        if (storyTextContainerRef.current) {
          storyTextContainerRef.current.scrollTop = storyTextContainerRef.current.scrollHeight;
        }
      });
      
      socket.on('story-complete', ({ storyId, message }) => {
        alert(message);
        
        setTimeout(() => {
          window.location.href = `/stories/${storyId}`;
        }, 100);
      });
      
      socket.on('error', ({ message }) => {
        setError(message);
      });
    }
    
    return () => {
      if (socket && session) {
        // Clean up event listeners
        socket.off('session-joined');
        socket.off('user-joined');
        socket.off('user-left');
        socket.off('user-typing');
        socket.off('contribution-added');
        socket.off('story-complete');
        socket.off('error');
        
        // Leave the session room
        socket.emit('leave-session', { sessionId: session._id });
      }
    };
  }, [socket, session, user, navigate]);
  
  // Scroll to bottom when story loads or new contributions are added
  useEffect(() => {
    if (storyTextContainerRef.current && story) {
      storyTextContainerRef.current.scrollTop = storyTextContainerRef.current.scrollHeight;
    }
  }, [story?.contributions?.length]);
  
  // Handle typing events
  useEffect(() => {
    if (socket && session) {
      const typingTimeout = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          socket.emit('typing', {
            sessionId: session._id,
            isTyping: false
          });
        }
      }, 2000);
      
      return () => clearTimeout(typingTimeout);
    }
  }, [contribution, isTyping, socket, session]);
  
  const fetchStory = async () => {
    try {
      // Get token for authentication
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const storyRes = await axios.get(`http://localhost:5002/api/stories/${storyId}`, config);
      setStory(storyRes.data);
      
      // Check if story is already complete and redirect
      if (storyRes.data.isComplete) {
        navigate(`/stories/${storyId}`);
        return;
      }
      
      // Find active session for this story - use correct URL
      const sessionsRes = await axios.get('http://localhost:5002/api/stories/active', config);
      const storySession = sessionsRes.data.find(s => s.story._id === storyId);
      
      if (storySession) {
        setSession(storySession);
      } else {
        // If no active session is found, consider that the story might be complete
        navigate(`/stories/${storyId}`);
        return;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError('Error loading story session');
      setLoading(false);
    }
  };
  
  const handleContributionChange = (e) => {
    setContribution(e.target.value);
    
    if (socket && session && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        sessionId: session._id,
        isTyping: true
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!contribution.trim() || contribution.length > MAX_CONTRIBUTION_LENGTH) {
      return;
    }
    
    if (socket && session) {
      // Submit contribution via socket
      socket.emit('new-contribution', {
        sessionId: session._id,
        content: contribution.trim()
      });
      
      setContribution('');
      
      // Reset typing status
      setIsTyping(false);
      socket.emit('typing', {
        sessionId: session._id,
        isTyping: false
      });
    }
  };
  
  if (loading) {
    return <div>Loading story session...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!story || !session) {
    return <div>Story or session not found</div>;
  }
  
  const isYourTurn = user && session.currentTurnUserId === user._id;
  const typingParticipants = story.participants.filter(p => 
    typingUsers.includes(p._id) && p._id !== user?._id
  );
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <StoryContainer>
      <StoryContent>
        <StoryHeader category={story.prompt?.category || 'random'}>
          <StoryTitle>{story.title}</StoryTitle>
          {story.prompt && (
            <StoryPrompt>"{story.prompt.text}"</StoryPrompt>
          )}
        </StoryHeader>
        
        <StoryTextContainer ref={storyTextContainerRef}>
          {story.contributions && story.contributions.map((contribution, index) => {
            // Skip rendering if contribution or author is missing/null
            if (!contribution || !contribution.author) return null;
            
            return (
              <StoryTextSection key={index}>
                <ContributionHeader>
                  <ContributorAvatar>
                    <img 
                      src={(contribution.author.avatar) || '/default-avatar.png'} 
                      alt={contribution.author.username || 'Unknown User'} 
                    />
                  </ContributorAvatar>
                  <ContributorName>{contribution.author.username || 'Unknown User'}</ContributorName>
                  <ContributionTime>
                    {formatDate(contribution.timestamp)}
                  </ContributionTime>
                </ContributionHeader>
                <ContributionText 
                  isCurrentUser={user && contribution.author._id === user._id}
                >
                  {contribution.content}
                </ContributionText>
              </StoryTextSection>
            );
          })}
        </StoryTextContainer>
        
        {typingParticipants.length > 0 && (
          <TypingIndicator>
            {typingParticipants.length === 1 
              ? `${typingParticipants[0].username} is typing...` 
              : `${typingParticipants.length} people are typing...`}
          </TypingIndicator>
        )}
        
        <ContributionForm onSubmit={handleSubmit}>
          {isYourTurn && !story.isComplete ? (
            <TurnNotification isYourTurn={true}>
              It's your turn to contribute to the story!
            </TurnNotification>
          ) : story.isComplete ? (
            <TurnNotification>
              This story is now complete!
            </TurnNotification>
          ) : (
            <TurnNotification isYourTurn={false}>
              Waiting for {story.participants.find(p => 
                p._id === session.currentTurnUserId
              )?.username || 'another participant'} to contribute...
            </TurnNotification>
          )}
          
          <TextareaContainer>
            <ContributionTextarea 
              ref={textAreaRef}
              value={contribution}
              onChange={handleContributionChange}
              placeholder={isYourTurn 
                ? "Continue the story..." 
                : "Wait for your turn to contribute"
              }
              disabled={!isYourTurn}
            />
            <CharacterCounter isExceeded={contribution.length > MAX_CONTRIBUTION_LENGTH}>
              {contribution.length}/{MAX_CONTRIBUTION_LENGTH}
            </CharacterCounter>
          </TextareaContainer>
          
          <SubmitButton 
            type="submit" 
            disabled={
              !isYourTurn || 
              !contribution.trim() || 
              contribution.length > MAX_CONTRIBUTION_LENGTH ||
              story.isComplete  // Add this condition
            }
          >
            Submit Contribution
          </SubmitButton>
        </ContributionForm>
      </StoryContent>
      
      <SidePanel>
        <ParticipantsCard>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <ParticipantsList>
            {story.participants.map(participant => {
              if (!participant) return null;
              const isCurrentTurn = session.currentTurnUserId === participant._id;
              return (
                <ParticipantItem key={participant._id}>
                  <ParticipantAvatar>
                    <img 
                      src={participant.avatar || '/default-avatar.png'} 
                      alt={participant.username} 
                    />
                  </ParticipantAvatar>
                  <ParticipantName isCurrentTurn={isCurrentTurn}>
                    {participant.username}
                    {participant._id === user?._id && ' (You)'}
                  </ParticipantName>
                  {isCurrentTurn && (
                    <CurrentTurnIndicator>Current Turn</CurrentTurnIndicator>
                  )}
                </ParticipantItem>
              );
            })}
          </ParticipantsList>
        </ParticipantsCard>
        
        <StoryInfoCard>
          <CardHeader>
            <CardTitle>Story Info</CardTitle>
          </CardHeader>
          <StoryInfoList>
            <StoryInfoItem>
              <InfoLabel>Creator</InfoLabel>
              <InfoValue>{story.creator.username}</InfoValue>
            </StoryInfoItem>
            <StoryInfoItem>
              <InfoLabel>Category</InfoLabel>
              <InfoValue>
                {story.prompt?.category 
                  ? story.prompt.category.charAt(0).toUpperCase() + 
                    story.prompt.category.slice(1) 
                  : 'Random'}
              </InfoValue>
            </StoryInfoItem>
            <StoryInfoItem>
              <InfoLabel>Turn</InfoLabel>
              <InfoValue>{story.currentTurn + 1}/{story.turnLimit}</InfoValue>
            </StoryInfoItem>
            <StoryInfoItem>
              <InfoLabel>Participants</InfoLabel>
              <InfoValue>{story.participants.length}/{story.maxParticipants}</InfoValue>
            </StoryInfoItem>
            <StoryInfoItem>
              <InfoLabel>Created</InfoLabel>
              <InfoValue>{formatDate(story.createdAt)}</InfoValue>
            </StoryInfoItem>
          </StoryInfoList>
        </StoryInfoCard>
      </SidePanel>
    </StoryContainer>
  );
};

export default StorySession;