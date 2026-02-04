import styled from "styled-components";

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: block;
  min-height: 100vh;
  background: #ffffff;
`;

export const Content = styled.div<{ $isCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${(props) => (props.$isCollapsed ? "70px" : "250px")};
  height: 100vh;
  overflow: hidden;
  transition: margin-left 0.3s ease;
`;

export const NoticeDetailBody = styled.div`
  flex: 1;
  padding: 32px 48px;
  padding-top: 93px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  height: calc(100vh - 61px);

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export const NoticeDetailCard = styled.div`
  background: transparent;
  border: none;
  border-radius: 0;
  overflow: visible;
`;

export const NoticeDetailHeader = styled.div`
  padding: 20px 32px;
  background: #f8f9ff;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

export const NoticeDetailTitle = styled.h1`
  font-size: 22px;
  font-weight: bold;
  color: #000000;
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const NoticeDetailMeta = styled.div`
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #666666;
`;

export const NoticeDetailAuthor = styled.span`
  font-weight: 500;
`;

export const NoticeDetailDate = styled.span`
  color: #888888;
`;

export const NoticeDetailContent = styled.div`
  padding: 40px 32px;
  min-height: 300px;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }
`;

export const NoticeContentText = styled.div`
  font-size: 15px;
  line-height: 1.8;
  color: #333333;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const NoticeDetailFooter = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 24px 32px;
  border-top: 1px solid #e0e0e0;
  background: transparent;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const NavButton = styled.button<{ $variant?: "list" }>`
  padding: 12px 24px;
  border: 1px solid ${(props) => (props.$variant === "list" ? "#667EEA" : "#D0D0D0")};
  border-radius: 6px;
  background: ${(props) => (props.$variant === "list" ? "#667EEA" : "#FFFFFF")};
  color: ${(props) => (props.$variant === "list" ? "#FFFFFF" : "#333333")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$variant === "list" ? "#5568d3" : "#667EEA")};
    color: #ffffff;
    border-color: ${(props) => (props.$variant === "list" ? "#5568d3" : "#667EEA")};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    color: #ff6b6b;
    font-size: 16px;
    margin-bottom: 20px;
  }

  button {
    background: #667eea;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #5568d3;
    }
  }
`;
