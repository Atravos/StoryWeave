// client/src/components/layout/Header.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';

const HeaderContainer = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #ddd;
  }
`;

const LogoIcon = styled.span`
  margin-right: 0.5rem;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin-left: 1.5rem;
`;

const NavLink = styled(Link)`
  color: #ddd;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  
  &:hover {
    color: white;
  }
`;

const NavAnchor = styled.a`
  color: #ddd;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
  
  &:hover {
    color: white;
  }
`;

const Button = styled.button`
  background-color: transparent;
  color: #ddd;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  margin-left: 1.5rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6b8afd;
  margin-right: 0.75rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Username = styled.span`
  font-weight: 500;
  margin-right: 1rem;
`;

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';  // Changed to force page reload
  };
  
  const guestLinks = (
    <NavList>
      <NavItem>
        <NavAnchor 
          href="/login" 
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/login';
          }}
        >
          Login
        </NavAnchor>
      </NavItem>
      <NavItem>
        <NavAnchor 
          href="/register" 
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/register';
          }}
        >
          Register
        </NavAnchor>
      </NavItem>
    </NavList>
  );
  
  const authLinks = (
    <>
      <NavList>
        <NavItem>
          <NavLink to="/lobby">Lobby</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/stories/completed">Completed Stories</NavLink>
        </NavItem>
      </NavList>
      
      {user && (
        <UserInfo>
          <Avatar>
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.username} 
            />
          </Avatar>
          <Username>{user.username}</Username>
          <Button onClick={handleLogout}>Logout</Button>
        </UserInfo>
      )}
    </>
  );
  
  // Modified Logo component usage
  const LogoComponent = () => (
    <Logo 
      to={isAuthenticated ? "/lobby" : "/"} 
      onClick={(e) => {
        if (!isAuthenticated) {
          e.preventDefault();
          window.location.href = '/';
        }
      }}
    >
      <LogoIcon>📝</LogoIcon>
      StoryWeave
    </Logo>
  );
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoComponent />
        <Navigation>
          {isAuthenticated ? authLinks : guestLinks}
        </Navigation>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;