import styled from "styled-components";

export const HeaderContainer = styled.header`
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

export const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
  }
`;

export const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
`;

export const HeaderLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const HeaderLink = styled.button`
  background: none;
  border: none;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0.5rem 1rem;

  &:hover {
    color: #667eea;
  }
`;
