// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import PrivateRoute from './components/routing/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import CreateStory from './pages/CreateStory';
import StorySession from './pages/StorySession';
import CompletedStories from './pages/CompletedStories';
import ViewStory from './pages/ViewStory';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/lobby" 
                element={
                  <PrivateRoute>
                    <Lobby />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/create-story" 
                element={
                  <PrivateRoute>
                    <CreateStory />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/story/:id" 
                element={
                  <PrivateRoute>
                    <StorySession />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/stories/completed" 
                element={
                  <PrivateRoute>
                    <CompletedStories />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/stories/:id" 
                element={
                  <PrivateRoute>
                    <ViewStory />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;