import styled from "styled-components";

export const HeaderContainer = styled.header`
  width: 100%;
  background: white;
  border-bottom: 1px solid #e5e7eb;
`;

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 80px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

export const Logo = styled.div`
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

export const LogoIcon = styled.div`
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

export const LogoText = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
  padding-left: 0;
  text-indent: 0;
`;

export const HeaderLinks = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  margin-right: -50px;
`;

export const HeaderLink = styled.span`
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    color: #1f2937;
  }
`;
