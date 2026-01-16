import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onUserNameClick }) => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();

  const userName = user?.name || user?.username || user?.email || "";

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/index";
    } catch (error) {
      console.error('로그아웃 실패:', error);
      window.location.href = "/index";
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/index");
  };

  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Logo onClick={handleLogoClick}>
          <LogoIcon>
            <img src="/logo.svg" alt="CodeSturdy Logo" />
          </LogoIcon>
          <LogoText>CodeSturdy</LogoText>
        </Logo>
        <HeaderLinks>
          {isAuthenticated ? (
            <>
              {userName && (
                <HeaderLink onClick={onUserNameClick || (() => {})}>{userName}</HeaderLink>
              )}
              <HeaderLink onClick={handleLogout}>로그아웃</HeaderLink>
            </>
          ) : (
            <HeaderLink onClick={handleLogin}>로그인</HeaderLink>
          )}
        </HeaderLinks>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

// Styled Components
const HeaderContainer = styled.header`
  width: 100%;
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-left: -20px;

  &:hover {
    opacity: 0.8;
  }
`;


const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const LogoText = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
  padding-left: 0;
  text-indent: 0;
`;

const HeaderLinks = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  margin-right: -50px;
`;

const HeaderLink = styled.a`
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    color: #1f2937;
  }
`;

export default Header;

