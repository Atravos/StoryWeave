// client/src/pages/CompletedStories.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const CompletedStoriesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

const FilterLabel = styled.label`
  margin-right: 0.5rem;
  font-weight: 500;
  color: #555;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #6b8afd;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #6b8afd;
  }
`;

const StoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const StoryCard = styled.div`
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

const StoryTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StoryCategory = styled.span`
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const StoryBody = styled.div`
  padding: 1.5rem;
`;

const StoryExcerpt = styled.p`
  margin: 0 0 1rem;
  color: #555;
  line-height: 1.5;
  height: 4.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const StoryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #777;
  font-size: 0.875rem;
`;

const StoryCreator = styled.div`
  display: flex;
  align-items: center;
`;

const CreatorAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 0.5rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const StoryDate = styled.span`
  color: #777;
`;

const ReadButton = styled(Link)`
  display: block;
  padding: 0.75rem;
  background-color: #6b8afd;
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #5a75e6;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border: 1px solid #ddd;
  background-color: ${props => props.active ? '#6b8afd' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#5a75e6' : '#f5f5f5'};
  }
  
  &:disabled {
    background-color: #f5f5f5;
    color: #aaa;
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

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  grid-column: 1 / -1;
`;

const CompletedStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStories();
  }, [category, sortBy, currentPage]);

  const fetchStories = async () => {
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
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/stories/completed`, config);
      
      // Backend filtering would be better, this is just for demonstration
      let filteredStories = [...res.data];
      
      // Filter by category
      if (category !== 'all') {
        filteredStories = filteredStories.filter(
          story => story.prompt?.category === category
        );
      }
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredStories = filteredStories.filter(
          story => 
            story.title.toLowerCase().includes(term) || 
            story.prompt?.text.toLowerCase().includes(term) ||
            story.creator.username.toLowerCase().includes(term)
        );
      }
      
      // Sort stories
      filteredStories.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          case 'oldest':
            return new Date(a.updatedAt) - new Date(b.updatedAt);
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
      
      // Pagination
      const storiesPerPage = 6;
      const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
      setTotalPages(totalPages);
      
      const startIndex = (currentPage - 1) * storiesPerPage;
      const paginatedStories = filteredStories.slice(
        startIndex, 
        startIndex + storiesPerPage
      );
      
      setStories(paginatedStories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStories();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStoryExcerpt = (story) => {
    if (!story.contributions || story.contributions.length === 0) {
      return 'No content available.';
    }
    
    // Get the first contribution
    const firstContribution = story.contributions[0];
    return firstContribution.content;
  };

  if (loading) {
    return (
      <CompletedStoriesContainer>
        <Header>
          <Title>Completed Stories</Title>
        </Header>
        <LoadingState>Loading stories...</LoadingState>
      </CompletedStoriesContainer>
    );
  }

  return (
    <CompletedStoriesContainer>
      <Header>
        <Title>Completed Stories</Title>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Category:</FilterLabel>
            <Select value={category} onChange={handleCategoryChange}>
              <option value="all">All Categories</option>
              <option value="fantasy">Fantasy</option>
              <option value="sci-fi">Science Fiction</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="horror">Horror</option>
              <option value="comedy">Comedy</option>
              <option value="random">Random</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Sort by:</FilterLabel>
            <Select value={sortBy} onChange={handleSortChange}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title</option>
            </Select>
          </FilterGroup>
          
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </FilterContainer>
      </Header>
      
      <StoriesGrid>
        {stories.length === 0 ? (
          <EmptyState>
            <EmptyStateMessage>
              No completed stories found. Check back later!
            </EmptyStateMessage>
          </EmptyState>
        ) : (
          stories.map(story => (
            <StoryCard key={story._id}>
              <StoryHeader category={story.prompt?.category || 'random'}>
                <StoryTitle>{story.title}</StoryTitle>
                {story.prompt?.category && (
                  <StoryCategory>{story.prompt.category}</StoryCategory>
                )}
              </StoryHeader>
              
              <StoryBody>
                <StoryExcerpt>{getStoryExcerpt(story)}</StoryExcerpt>
                
                <StoryMeta>
                  <StoryCreator>
                    <CreatorAvatar>
                      <img 
                        src={story.creator.avatar || '/default-avatar.png'} 
                        alt={story.creator.username} 
                      />
                    </CreatorAvatar>
                    {story.creator.username}
                  </StoryCreator>
                  <StoryDate>Completed {formatDate(story.updatedAt)}</StoryDate>
                </StoryMeta>
                
                <ReadButton to={`/stories/${story._id}`}>
                  Read Story
                </ReadButton>
              </StoryBody>
            </StoryCard>
          ))
        )}
      </StoriesGrid>
      
      {totalPages > 1 && (
        <Pagination>
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PageButton 
              key={page} 
              active={currentPage === page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      )}
    </CompletedStoriesContainer>
  );
};

export default CompletedStories;