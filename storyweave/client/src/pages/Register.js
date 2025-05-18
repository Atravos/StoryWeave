// client/src/pages/Register.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #555;
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

const Button = styled.button`
  padding: 0.75rem;
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

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
`;

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState(null);
  const { username, email, password, confirmPassword } = formData;
  const { register, error, clearErrors, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Only clear errors on unmount
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Clear password error when user types in password fields
    if (e.target.name === 'password' || e.target.name === 'confirmPassword') {
      setPasswordError(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
      
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
      
    // Validate password length
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
      
    try {
      // Wait for register to complete
      await register({
        username,
        email,
        password
      });
      
      // Force navigation to lobby
      window.location.href = '/lobby';
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <RegisterContainer>
      <Title>Join StoryWeave</Title>
      <Form onSubmit={onSubmit}>
        <FormGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={onChange}
            required
            minLength="3"
            maxLength="20"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            required
            minLength="6"
          />
        </FormGroup>
        <Button type="submit">Register</Button>
      </Form>
      {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <LoginLink>
        Already have an account? <a href="/login" onClick={(e) => {
          e.preventDefault();
          window.location.href = '/login';
        }}>Login</a>
      </LoginLink>
    </RegisterContainer>
  );
};

export default Register;