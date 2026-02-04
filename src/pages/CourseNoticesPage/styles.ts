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

export const NoticesBody = styled.div`
  flex: 1;
  padding: 32px 48px;
  padding-top: 93px;
  max-width: 1400px;
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

export const NoticesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

export const NoticesTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #000000;
  margin: 0;
  flex: 1;
`;

export const NoticesSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const NewCount = styled.span`
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
`;

export const TotalCount = styled.span`
  font-size: 14px;
  color: #666666;
`;

export const SortButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

export const SortText = styled.span`
  font-size: 13px;
  color: #000000;
  font-weight: 500;
`;

export const SortArrow = styled.span`
  font-size: 12px;
  color: #667eea;
`;

export const NoticesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NoticeItem = styled.div<{ $unread: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: ${(props) => (props.$unread ? "#B3BFF5" : "#FFFFFF")};
  border: 1px solid ${(props) => (props.$unread ? "#8E9DD9" : "#E0E0E0")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    background: ${(props) => (props.$unread ? "#A0AEF0" : "#FFFFFF")};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const NoticeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

export const NoticeTitle = styled.span`
  font-size: 15px;
  color: #000000;
  font-weight: 500;
`;

export const NoticeNewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
`;

export const NoticeRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const NoticeAuthor = styled.span`
  font-size: 13px;
  color: #666666;
`;

export const NoticeDate = styled.span`
  font-size: 13px;
  color: #888888;
  min-width: 80px;
  text-align: right;
`;

export const NoNotices = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  background: #ffffff;
  border-radius: 8px;

  p {
    font-size: 16px;
    color: #999999;
    margin: 0;
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
