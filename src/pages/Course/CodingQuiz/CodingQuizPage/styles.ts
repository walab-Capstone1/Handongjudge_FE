import styled from "styled-components";

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const Content = styled.div<{ $isCollapsed: boolean }>`
  margin-left: ${(props) => (props.$isCollapsed ? "70px" : "250px")};
  width: ${(props) => (props.$isCollapsed ? "calc(100% - 70px)" : "calc(100% - 250px)")};
  transition: margin-left 0.3s ease, width 0.3s ease;
`;

export const CodingQuizBody = styled.div`
  padding: 78px 100px 40px 100px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const QuizHeader = styled.div`
  margin-bottom: 0;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0 0 24px 0;
  }
`;

export const QuizSection = styled.div`
  margin-bottom: 40px;
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 16px 0;
`;

export const QuizList = styled.div`
  display: grid;
  gap: 16px;
`;

export const QuizCard = styled.div<{ $status: string; $inactive?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  cursor: ${(props) => (props.$status === "WAITING" ? "not-allowed" : "pointer")};
  display: flex;
  flex-direction: column;
  opacity: ${(props) => {
    if (props.$inactive) return 0.6;
    return props.$status === "WAITING" ? 0.7 : props.$status === "ENDED" ? 0.8 : 1;
  }};
  border: ${(props) => (props.$status === "ACTIVE" ? "2px solid #667EEA" : "none")};
  background: ${(props) => (props.$inactive ? "#F5F5F5" : "white")};

  &:hover {
    ${(props) =>
      props.$status !== "WAITING" &&
      !props.$inactive &&
      `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `}
  }
`;

export const QuizCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
`;

export const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.$status === "ACTIVE" ? "#667EEA" : props.$status === "WAITING" ? "#f0f0f0" : "#e0e0e0"};
  color: ${(props) => (props.$status === "ACTIVE" ? "white" : "#666")};
`;

export const QuizCardContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
`;

export const QuizDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
  flex: 1;
`;

export const QuizInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
  align-items: center;

  span {
    white-space: nowrap;
  }

  .start-time,
  .end-time {
    color: #666;
  }

  .problem-count {
    color: #888;
    font-weight: 500;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  p {
    font-size: 16px;
    margin: 0;
  }
`;

export const ProblemsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
  }
`;

export const ProblemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ProblemItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
`;

export const ProblemItemTitle = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
`;

export const ProblemBadge = styled.span<{
  $status: "ACCEPTED" | "SUBMITTED" | "NOT_SUBMITTED";
}>`
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 14px;
  background: ${(props) =>
    props.$status === "ACCEPTED"
      ? "#22C55E"
      : props.$status === "SUBMITTED"
        ? "#667EEA"
        : "#EEEEEE"};
  color: ${(props) =>
    props.$status === "ACCEPTED" || props.$status === "SUBMITTED"
      ? "#FFFFFF"
      : "#888888"};
`;

export const ProblemItemArrow = styled.div`
  font-size: 20px;
  color: #667eea;
  flex-shrink: 0;
`;

export const InactiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #d1d5db;
  color: #6b7280;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  min-width: 60px;
  flex-shrink: 0;
`;
