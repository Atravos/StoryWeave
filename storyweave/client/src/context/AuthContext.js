// client/src/context/AuthContext.js
import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

console.log("API URL from env:", process.env.REACT_APP_API_URL);

// Create axios instance with the correct base URL
const api = axios.create({
  baseURL: 'http://localhost:5002',  // Hard-code it for now
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create context
export const AuthContext = createContext();

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'REGISTER':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        token: action.payload.token
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user - wrapped in useCallback to prevent recreation on every render
  const loadUser = useCallback(async () => {
    console.log("Loading user...");
    if (localStorage.token) {
      api.defaults.headers.common['x-auth-token'] = localStorage.token;
      console.log("Token found:", localStorage.token);
    } else {
      console.log("No token found in localStorage");
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }
    
    try {
      const res = await api.get('/api/auth/me');
      console.log("User data loaded:", res.data);
      
      dispatch({
        type: 'USER_LOADED',
        payload: res.data
      });
    } catch (err) {
      console.error("Error loading user:", err);
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      const res = await api.post('/api/auth/register', formData);
          
      dispatch({
        type: 'REGISTER',
        payload: {
          token: res.data.token,
          user: await getUserData(res.data.token)
        }
      });
      
      loadUser();
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.message || 'Registration failed'
      });
    }
  };

  // Login user
  const login = async (formData, navigate) => {
    try {
      const res = await api.post('/api/auth/login', formData);
      console.log("Login successful:", res.data);
      
      // Set token in localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token in axios headers
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Get user data
      const userData = await getUserData(res.data.token);
      
      // Dispatch login action
      dispatch({
        type: 'LOGIN',
        payload: {
          token: res.data.token,
          user: userData
        }
      });
      
      // Navigate to lobby immediately after successful login
      if (navigate) {
        navigate('/lobby');
      }
      
    } catch (err) {
      console.error("Login error:", err);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.message || 'Login failed'
      });
    }
  };

  // Get user data using token
  const getUserData = async (token) => {
    const config = {
      headers: {
        'x-auth-token': token
      }
    };
    
    try {
      const res = await api.get('/api/auth/me', config);
      return res.data;
    } catch (err) {
      console.error('Error getting user data:', err);
      return null;
    }
  };

  // Logout
  const logout = () => dispatch({ type: 'LOGOUT' });

  // Clear errors
  const clearErrors = () => dispatch({ type: 'CLEAR_ERROR' });

  // Set token in global headers and load user
  useEffect(() => {
    console.log("Auth state on initial load:", state);
    if (localStorage.token) {
      api.defaults.headers.common['x-auth-token'] = localStorage.token;
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
