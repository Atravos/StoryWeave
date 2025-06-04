// client/src/pages/Lobby.js
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import config from '../config/environment';

const LobbyContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #6b8afd;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #5a75e6;
  }
`;

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SessionCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SessionHeader = styled.div`
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

const SessionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
`;

const SessionCategory = styled.span`
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const SessionBody = styled.div`
  padding: 1.5rem;
`;

const SessionInfo = styled.div`
  margin-bottom: 1rem;
`;

const SessionPrompt = styled.p`
  font-style: italic;
  margin-bottom: 1.5rem;
  color: #555;
`;

const SessionCreator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const CreatorAvatar = styled.div`
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

const CreatorName = styled.span`
  font-weight: 500;
`;

const ParticipantsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ParticipantCount = styled.span`
  color: #555;
`;

const JoinButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #6b8afd;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #5a75e6;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  grid-column: 1 / -1;
`;

const EmptyStateMessage = styled.p`
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 1.5rem;
`;

const Lobby = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
    
    // Poll for new sessions every 30 seconds
    const interval = setInterval(fetchSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const configHeaders = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      const res = await axios.get(`${config.API_URL}/api/stories/active`, configHeaders);
      setSessions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setLoading(false);
    }
  };

  const joinSession = async (sessionId, storyId) => {
    try {
      const token = localStorage.getItem('token');
      const configHeaders = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      await axios.post(`${config.API_URL}/api/stories/${storyId}/join`, {}, configHeaders);
      navigate(`/story/${storyId}`);
    } catch (err) {
      console.error('Error joining session:', err);
      alert(err.response?.data?.message || 'Error joining session');
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <LobbyContainer>
      <Header>
        <Title>Story Sessions</Title>
        <Link to="/create-story">
          <CreateButton>Create New Story</CreateButton>
        </Link>
      </Header>
      
      <SessionsGrid>
        {sessions.length === 0 ? (
          <EmptyState>
            <EmptyStateMessage>
              No active story sessions found. Create one to get started!
            </EmptyStateMessage>
            <Link to="/create-story">
              <CreateButton>Create New Story</CreateButton>
            </Link>
          </EmptyState>
        ) : (
          sessions.map(session => {
            const { story } = session;
            const isCreator = story.creator._id === user?._id;
            const isParticipant = story.participants.some(p => p._id === user?._id);
            const isFull = story.participants.length >= story.maxParticipants;
            
            return (
              <SessionCard key={session._id}>
                <SessionHeader category={story.prompt?.category || 'random'}>
                  <SessionTitle>{story.title}</SessionTitle>
                  {story.prompt?.category && (
                    <SessionCategory>{story.prompt.category}</SessionCategory>
                  )}
                </SessionHeader>
                
                <SessionBody>
                  <SessionInfo>
                    {story.prompt?.text && (
                      <SessionPrompt>"{story.prompt.text}"</SessionPrompt>
                    )}
                    
                    <SessionCreator>
                      <CreatorAvatar>
                        <img 
                          src={story.creator.avatar || '/default-avatar.png'} 
                          alt={story.creator.username} 
                        />
                      </CreatorAvatar>
                      <CreatorName>
                        Started by {story.creator.username}
                      </CreatorName>
                    </SessionCreator>
                    
                    <ParticipantsInfo>
                      <ParticipantCount>
                        {story.participants.length}/{story.maxParticipants} participants
                      </ParticipantCount>
                    </ParticipantsInfo>
                  </SessionInfo>
                  
                  {isParticipant ? (
                    <JoinButton 
                      onClick={() => navigate(`/story/${story._id}`)}
                    >
                      Continue Story
                    </JoinButton>
                  ) : (
                    <JoinButton 
                      onClick={() => joinSession(session._id, story._id)}
                      disabled={isFull}
                    >
                      {isFull ? 'Session Full' : 'Join Session'}
                    </JoinButton>
                  )}
                </SessionBody>
              </SessionCard>
            );
          })
        )}
      </SessionsGrid>
    </LobbyContainer>
  );
};

export default Lobby;