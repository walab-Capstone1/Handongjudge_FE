import styled from "styled-components";
import { Link } from "react-router-dom";

export const Header = styled.header`
  background-color: white;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
`;

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-sizing: border-box;
  min-height: 65px;
  height: 65px;

  @media (max-width: 1200px) {
    padding: 1rem 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

export const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #667eea;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  letter-spacing: 0.5px;
  transition: color 0.2s ease;

  &:hover {
    color: #5a67d8;
  }
`;

export const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 0.5rem;
  }
`;

export const UserInfo = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  padding: 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const UserRole = styled.span`
  color: #667eea;
  font-weight: 600;
`;

export const LogoutButton = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;
