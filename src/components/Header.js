import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import APIService from '../services/APIService';

const Header = ({ userName = "사용자 이름", logoutText = "로그아웃", onUserNameClick }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await APIService.logout();
      navigate("/");
    } catch (error) {
      console.error('로그아웃 실패:', error);
      navigate("/");
    }
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
          <HeaderLink onClick={onUserNameClick}>{userName}</HeaderLink>
          <HeaderLink onClick={handleLogout}>{logoutText}</HeaderLink>
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
  padding: 20px 40px;
  max-width: 1152px;
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
`;

const HeaderLinks = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
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

