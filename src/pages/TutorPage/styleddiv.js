import styled from 'styled-components';

// TutorDashboard Styles
export const TutorDashboard = styled.div`
  padding: 0;
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const DashboardLandscapeLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export const DashboardSectionsPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export const TutorNotificationContainer = styled.div`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1000;
`;

export const TutorNotificationIconBtn = styled.button`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  color: white;
  font-size: 1.5rem;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

// 공통 스타일은 각 페이지별로 추가할 수 있습니다
// 이 파일은 기본 구조만 제공하고, 각 페이지의 CSS를 점진적으로 변환합니다

