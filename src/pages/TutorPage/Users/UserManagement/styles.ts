import styled from "styled-components";

export const Container = styled.div`
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
`;

/* 전체 페이지용 헤더 (보라색 배경) */
export const Header = styled.div<{ $purple?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  ${(p) =>
		p.$purple &&
		`
    background: #667eea;
    color: white;
  `}
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Title = styled.h1<{ $white?: boolean }>`
  font-size: ${(p) => (p.$white ? "1.875rem" : "2rem")};
  font-weight: 700;
  color: ${(p) => (p.$white ? "white" : "#1f2937")};
  margin: 0;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  ${(p) => p.$white && "text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);"}
`;

export const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
  color: #1e293b;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }
`;

/* 모달 열림 시 search input focus 스타일 무시 */
export const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const Select = styled.select<{ $inHeader?: boolean }>`
  padding: 0.75rem 1rem;
  border: 1px solid ${(p) => (p.$inHeader ? "rgba(255, 255, 255, 0.3)" : "#e1e8ed")};
  border-radius: 8px;
  font-size: 0.9rem;
  background: ${(p) => (p.$inHeader ? "rgba(255, 255, 255, 0.95)" : "white")};
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${(p) => (p.$inHeader ? "white" : "#667eea")};
    box-shadow: 0 0 0 3px ${(p) => (p.$inHeader ? "rgba(255, 255, 255, 0.3)" : "rgba(102, 126, 234, 0.1)")};
    background: white;
  }

  ${(p) => p.$inHeader && "&:hover { border-color: rgba(255, 255, 255, 0.5); }"}
`;

export const SelectWrap = styled.div`
  display: flex;
  align-items: center;
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  tbody tr {
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.2s ease;
  }

  tbody tr:hover {
    background: #f8fafc;
  }
`;

export const Th = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.875rem;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #cbd5e1;
  background: #f1f5f9;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:last-child {
    text-align: center;
  }

  &.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;

    &:hover {
      background: #e2e8f0;
    }
  }
`;

export const ThContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SortIcon = styled.span`
  color: #9ca3af;
  font-size: 0.9rem;
  
  &.asc, &.desc {
    color: #667eea;
  }
`;

export const Td = styled.td`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  font-size: 0.9rem;
  color: #374151;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NameCell = styled(Td)`
  font-weight: 600;
`;

export const EmailCell = styled(Td)`
  color: #64748b;
  font-size: 0.9rem;
`;

export const CourseCell = styled(Td)`
  color: #2d3436;
  font-weight: 500;
`;

export const SectionCell = styled(Td)`
  text-align: center;
`;

export const Badge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  background: transparent;
  color: #2d3436;
  box-shadow: none;
`;

export const ProgressCell = styled(Td)`
  padding: 1.25rem !important;
`;

export const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
`;

export const ProgressBarContainer = styled.div`
  flex: 1;
  height: 10px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

export const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00b894 0%, #00d4aa 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 184, 148, 0.2);
`;

export const ProgressText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3436;
  min-width: 50px;
  text-align: right;
`;

export const ActionsCellTd = styled(Td)`
  white-space: nowrap;
  text-align: right;
`;

export const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  white-space: nowrap;
`;

export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #e2e8f0;
    color: #334155;
  }

  &.delete {
    color: #ef4444;

    &:hover {
      background: #fee2e2;
      color: #dc2626;
    }
  }
`;

export const NoData = styled.div`
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #636e72;

  strong {
    display: block;
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

export const NoDataIcon = styled.span`
  display: block;
  width: 48px;
  height: 48px;
  background: #e9ecef;
  border-radius: 50%;
  opacity: 0.5;
  position: relative;
  margin: 0 auto;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 28px;
    height: 12px;
    background: white;
    border-radius: 6px;
  }
`;

export const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #636e72;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  background-color: white;

  p {
    margin: 0;
    color: #64748b;
  }
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: min(560px, 90vw);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
  margin: 0 auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e1e8ed;
  box-sizing: border-box;

  h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #2d3436;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #636e72;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: color 0.2s ease;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #2d3436;
    background: #f1f3f4;
  }
`;

export const ModalBody = styled.div`
  padding: 2rem;
  box-sizing: border-box;
`;

export const AssignmentsProgressSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const AssignmentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const AssignmentCard = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const AssignmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

export const AssignmentTitleSection = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #2d3436;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const AssignmentDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #636e72;
  line-height: 1.4;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ProgressBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.9rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
`;

export const AssignmentBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const ProgressStats = styled.div`
  font-size: 0.9rem;
  color: #636e72;
  font-weight: 500;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ToggleDetailButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

export const ProblemsDetailSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e1e8ed;
`;

export const ProblemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

export const ProblemCard = styled.div`
  padding: 1.25rem;
  border-radius: 8px;
  border: 2px solid;
  transition: all 0.2s ease;

  &.problem-ACCEPTED {
    background: #e8f5e9;
    border-color: #00b894;
  }

  &.problem-SUBMITTED {
    background: #fff3e0;
    border-color: #f39c12;
  }

  &.problem-NOT_SUBMITTED {
    background: #f5f5f5;
    border-color: #ddd;
  }
`;

export const ProblemInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const ProblemTitle = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: #2d3436;
  flex: 1;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &.status-ACCEPTED {
    background: #00b894;
    color: white;
  }

  &.status-SUBMITTED {
    background: #f39c12;
    color: white;
  }

  &.status-NOT_SUBMITTED {
    background: #636e72;
    color: white;
  }
`;

export const SubmissionCount = styled.div`
  font-size: 0.85rem;
  color: #636e72;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NoAssignments = styled.p`
  text-align: center;
  padding: 2rem;
  color: #636e72;
  font-size: 1rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  margin: 0;
`;

export const NoProblems = styled.p`
  text-align: center;
  padding: 1rem;
  color: #636e72;
  font-size: 0.9rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  margin: 0;
`;
