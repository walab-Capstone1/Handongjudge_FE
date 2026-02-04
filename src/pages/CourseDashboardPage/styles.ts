import styled from "styled-components";

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: block;
  min-height: 100vh;
  background: #FFFFFF;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
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

export const DashboardBody = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 100px;
  padding-right: 390px; /* right-column width(350px) + gap(20px) + padding(20px) */
  padding-top: 70px;
  margin-top: 0;
  gap: 53px;
  overflow-y: auto;
  height: calc(100vh - 61px);
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 1200px) {
    flex-direction: column;
  }

  @media (max-width: 768px) {
    padding: 0 20px;
    padding-top: 60px;
  }
`;

export const LeftColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 15px;
  }
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
`;

export const ProfileAvatar = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
  margin-top: 20px;
`;

export const ProfileGreeting = styled.span`
  color: #000000;
  font-size: 18px;
  margin: 0;
  line-height: 1.2;
`;

export const CoursesSection = styled.div`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-bottom: 16px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.span`
  color: #000000 !important;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: #667eea;
    border-radius: 2px;
    flex-shrink: 0;
  }
`;

export const JoinClassBtn = styled.button`
  background: #667EEA;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #5568d3;
  }
`;

export const CreateCourseBtn = styled(JoinClassBtn)``;

export const CoursesScrollContainer = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;
  padding-top: 8px;
  margin-top: 8px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #868FB7;
    border-radius: 4px;

    &:hover {
      background: #667EEA;
    }
  }
`;

export const CoursesGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 20px;
  min-width: min-content;

  & .course-card-link {
    flex: 0 0 280px;
    width: 280px;
  }
`;

export const NoCourses = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;

  span {
    color: #868FB7;
    font-size: 14px;
  }
`;

export const RightColumn = styled.div`
  position: fixed;
  right: 20px;
  top: 81px; /* 헤더 높이(61px) + 패딩(20px) */
  display: flex;
  flex-direction: column;
  width: 350px;
  gap: 12px;
  max-height: calc(100vh - 101px); /* 화면 높이 - 헤더 높이 - 패딩 */
  overflow-y: auto;

  @media (max-width: 1200px) {
    width: 100%;
    position: static;
  }
`;

export const Subsection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SubsectionTitle = styled(SectionTitle)`
  font-size: 16px !important;
  color: #000000 !important;
  margin-bottom: 0;
`;

export const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  border: 2px solid #B3BFF5;
  border-radius: 10px;
  padding: 8px;
  gap: 6px;
`;

export const NotificationItem = styled.div<{ $isNew?: boolean }>`
  display: flex;
  align-items: flex-start;
  background: ${(props) => (props.$isNew ? "#E8EEFF" : "#D9DFF9")};
  border: ${(props) => (props.$isNew ? "1px solid #667EEA" : "none")};
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  line-height: 1.4;
  min-height: auto;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: #c5cdf7;
  }
`;

export const NotificationText = styled.span`
  color: #667EEA;
  font-size: 11px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  flex-wrap: wrap;
  line-height: 1.4;
  margin: 0;
  width: 100%;
  word-break: break-word;
`;

export const NotificationDate = styled.span`
  color: #667EEA;
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
`;

export const NotificationSection = styled.span`
  color: #333333;
  font-size: 10px;
  white-space: nowrap;
  font-weight: 500;
`;

export const NewBadge = styled.span`
  background: #667EEA;
  color: #FFFFFF;
  font-size: 8px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 3px;
  line-height: 1.2;
  flex-shrink: 0;
`;

export const NoContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 10px;

  span {
    color: #868FB7;
    font-size: 12px;
  }
`;

export const AssignmentItem = styled(NotificationItem)<{
	$isExpired?: boolean;
}>`
  background: ${(props) => (props.$isExpired ? "#F5D9D9" : "#D9DFF9")};
  opacity: ${(props) => (props.$isExpired ? 0.8 : 1)};

  &:hover {
    background: ${(props) => (props.$isExpired ? "#F0C5C5" : "#c5cdf7")};
  }
`;

export const AssignmentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`;

export const AssignmentTitle = styled.span`
  color: #000000;
  font-size: 11px;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
`;

export const AssignmentInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
  margin-top: 2px;
`;

export const AssignmentSection = styled.span`
  color: #333333;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  text-align: right;
`;

export const AssignmentDeadline = styled.span<{ $isExpired?: boolean }>`
  color: ${(props) => (props.$isExpired ? "#FF6B6B" : "#667EEA")};
  font-size: 10px;
  font-weight: 500;
  white-space: nowrap;
`;

export const NoticeItem = styled(NotificationItem)`
  flex-direction: column;
  gap: 0;
`;

export const NoticeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin-bottom: 0;
  line-height: 1.1;
`;

export const NoticeTitle = styled.span`
  color: #000000;
  font-size: 11px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.1;
  margin: 0;
  word-break: break-word;
  text-align: left;
`;

export const NoticeSection = styled.span`
  color: #333333;
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
`;

export const NoticeDate = styled(NotificationDate)``;

export const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    color: #FF6B6B;
    font-size: 16px;
    margin-bottom: 20px;
  }

  button {
    background: #667EEA;
    color: #FFFFFF;
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

// Enroll Modal Styles
export const EnrollModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const EnrollModal = styled.div`
  width: 90%;
  max-width: 480px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
`;

export const EnrollModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #1f2937;
  }
`;

export const EnrollModalClose = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #374151;
  }
`;

export const EnrollModalBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
  }
`;

export const EnrollInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const EnrollHelpText = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

export const EnrollModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
`;

export const EnrollCancelBtn = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

export const EnrollSubmitBtn = styled.button`
  background: #667EEA;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
