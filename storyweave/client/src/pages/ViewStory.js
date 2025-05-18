// client/src/pages/ViewStory.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ViewStoryContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
`;

const StoryContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const StoryHeader = styled.div`
  padding: 2rem;
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
  font-size: 2.5rem;
  margin: 0 0 1rem;
`;

const StoryPrompt = styled.div`
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-style: italic;
  margin-bottom: 1rem;
`;

const StoryMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
`;

const MetaLabel = styled.span`
  margin-right: 0.5rem;
  opacity: 0.8;
`;

const StoryCategory = styled.span`
  display: inline-block;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const StoryTextContainer = styled.div`
  padding: 2rem;
`;

const StoryTextSection = styled.div`
  margin-bottom: 2.5rem;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:not(:last-child):after {
    content: '';
    position: absolute;
    bottom: -1.25rem;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 1px;
    background-color: #ddd;
  }
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

const ContributionText = styled.div`
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
`;

const ParticipantsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ContainerHeader = styled.div`
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
`;

const ContainerTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0;
  color: #333;
`;

const ParticipantsList = styled.div`
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ParticipantItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
`;

const ParticipantAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ddd;
  margin-bottom: 0.5rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ParticipantName = styled.span`
  font-size: 0.875rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const BackButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #f0f0f0;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  color: #e74c3c;
`;

const ViewStory = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      
      // Add token to the request
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/stories/${id}`, config);
      setStory(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError('Error loading story. It may not exist or you may not have permission to view it.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <ViewStoryContainer>
        <LoadingState>Loading story...</LoadingState>
      </ViewStoryContainer>
    );
  }

  if (error) {
    return (
      <ViewStoryContainer>
        <ErrorState>{error}</ErrorState>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <BackButton to="/stories/completed">Back to Stories</BackButton>
        </div>
      </ViewStoryContainer>
    );
  }

  if (!story) {
    return (
      <ViewStoryContainer>
        <ErrorState>Story not found</ErrorState>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <BackButton to="/stories/completed">Back to Stories</BackButton>
        </div>
      </ViewStoryContainer>
    );
  }

  return (
    <ViewStoryContainer>
      <StoryContent>
        <StoryHeader category={story.prompt?.category || 'random'}>
          <StoryTitle>{story.title}</StoryTitle>
          
          {story.prompt?.category && (
            <StoryCategory>{story.prompt.category}</StoryCategory>
          )}
          
          {story.prompt && (
            <StoryPrompt>"{story.prompt.text}"</StoryPrompt>
          )}
          
          <StoryMeta>
            <MetaItem>
              <MetaLabel>Created by:</MetaLabel>
              {story.creator.username}
            </MetaItem>
            <MetaItem>
              <MetaLabel>Started:</MetaLabel>
              {formatDate(story.createdAt)}
            </MetaItem>
            <MetaItem>
              <MetaLabel>Completed:</MetaLabel>
              {formatDate(story.updatedAt)}
            </MetaItem>
          </StoryMeta>
        </StoryHeader>
        
        <StoryTextContainer>
          {story.contributions.map((contribution, index) => (
            <StoryTextSection key={index}>
              <ContributionHeader>
                <ContributorAvatar>
                  <img 
                    src={contribution.author.avatar || '/default-avatar.png'} 
                    alt={contribution.author.username} 
                  />
                </ContributorAvatar>
                <ContributorName>{contribution.author.username}</ContributorName>
              </ContributionHeader>
              <ContributionText>
                {contribution.content}
              </ContributionText>
            </StoryTextSection>
          ))}
        </StoryTextContainer>
      </StoryContent>
      
      <ParticipantsContainer>
        <ContainerHeader>
          <ContainerTitle>Contributors</ContainerTitle>
        </ContainerHeader>
        <ParticipantsList>
          {story.participants.map(participant => (
            <ParticipantItem key={participant._id}>
              <ParticipantAvatar>
                <img 
                  src={participant.avatar || '/default-avatar.png'} 
                  alt={participant.username} 
                />
              </ParticipantAvatar>
              <ParticipantName>{participant.username}</ParticipantName>
            </ParticipantItem>
          ))}
        </ParticipantsList>
      </ParticipantsContainer>
      
      <div style={{ textAlign: 'center' }}>
        <BackButton to="/stories/completed">Back to Stories</BackButton>
      </div>
    </ViewStoryContainer>
  );
};

export default ViewStory;