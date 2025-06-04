// client/src/pages/CreateStory.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import config from '../config/environment';

const CreateStoryContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #6b8afd;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #6b8afd;
  }
`;

const PromptContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
`;

const PromptText = styled.p`
  font-style: italic;
  color: #555;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const PrimaryButton = styled(Button)`
  background-color: #6b8afd;
  color: white;
  
  &:hover {
    background-color: #5a75e6;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 1rem;
`;

const PromptCategory = styled.div`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.5rem;
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
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
`;

const CreateStory = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('random');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [turnLimit, setTurnLimit] = useState(10);
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch a random prompt on component mount
    fetchRandomPrompt(category);
  }, []);

  const fetchRandomPrompt = async (selectedCategory) => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.API_URL}/api/prompts/random?category=${selectedCategory}`);
      setPrompt(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Error fetching prompt. Please try again.');
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    fetchRandomPrompt(selectedCategory);
  };

  const handleRefreshPrompt = () => {
    fetchRandomPrompt(category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title for your story');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const configHeaders = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      };

      const res = await axios.post(`${config.API_URL}/api/stories`, {
        title: title.trim(),
        promptId: prompt?._id,
        maxParticipants: parseInt(maxParticipants),
        turnLimit: parseInt(turnLimit)
      }, configHeaders);
      
      setLoading(false);
      
      // Navigate to the story session
      navigate(`/story/${res.data.story._id}`);
    } catch (err) {
      console.error('Error creating story:', err);
      setError('Error creating story. Please try again.');
      setLoading(false);
    }
  };

  return (
    <CreateStoryContainer>
      <Title>Create a New Story</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Story Title</Label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your story"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="category">Prompt Category</Label>
          <Select
            id="category"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="random">Random</option>
            <option value="fantasy">Fantasy</option>
            <option value="sci-fi">Science Fiction</option>
            <option value="mystery">Mystery</option>
            <option value="romance">Romance</option>
            <option value="horror">Horror</option>
            <option value="comedy">Comedy</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Story Prompt</Label>
          {loading ? (
            <div>Loading prompt...</div>
          ) : prompt ? (
            <PromptContainer>
              <PromptCategory category={prompt.category}>
                {prompt.category}
              </PromptCategory>
              <PromptText>"{prompt.text}"</PromptText>
            </PromptContainer>
          ) : (
            <div>No prompt available</div>
          )}
          <ButtonGroup>
            <SecondaryButton
              type="button"
              onClick={handleRefreshPrompt}
              disabled={loading}
            >
              Get Another Prompt
            </SecondaryButton>
          </ButtonGroup>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="maxParticipants">Maximum Participants</Label>
          <Select
            id="maxParticipants"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
          >
            <option value="2">2 Participants</option>
            <option value="3">3 Participants</option>
            <option value="4">4 Participants</option>
            <option value="5">5 Participants</option>
            <option value="6">6 Participants</option>
            <option value="7">7 Participants</option>
            <option value="8">8 Participants</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="turnLimit">Total Turns</Label>
          <Select
            id="turnLimit"
            value={turnLimit}
            onChange={(e) => setTurnLimit(e.target.value)}
          >
            <option value="5">5 Turns</option>
            <option value="10">10 Turns</option>
            <option value="15">15 Turns</option>
            <option value="20">20 Turns</option>
            <option value="25">25 Turns</option>
            <option value="30">30 Turns</option>
          </Select>
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonGroup>
          <SecondaryButton
            type="button"
            onClick={() => navigate('/lobby')}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={loading || !title.trim() || !prompt}
          >
            {loading ? 'Creating...' : 'Create Story'}
          </PrimaryButton>
        </ButtonGroup>
      </Form>
    </CreateStoryContainer>
  );
};

export default CreateStory;