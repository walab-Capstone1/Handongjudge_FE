import styled from "styled-components";

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: block;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const Content = styled.div<{ $isCollapsed: boolean }>`
  margin-left: ${(props) => (props.$isCollapsed ? "70px" : "250px")};
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  transition: margin-left 0.3s ease;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const CommunityBody = styled.div`
  padding: 78px 100px 40px 100px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    padding: 78px 40px 40px 40px;
  }
  @media (max-width: 768px) {
    padding: 78px 20px 40px 20px;
  }
`;

/* 헤더 섹션 */
export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const TitleBlock = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
`;

export const CreateQuestionBtn = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

/* 통계 바 */
export const StatsBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const StatFilterBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) => (props.$active ? "#e8edff" : "#f8f9fa")};
  border: 2px solid ${(props) => (props.$active ? "#667eea" : "transparent")};
  font: inherit;

  &:hover {
    background: #e9ecef;
  }
  .stat-label {
    font-size: 14px;
    color: ${(props) => (props.$active ? "#667eea" : "#666")};
    font-weight: ${(props) => (props.$active ? 600 : 500)};
  }
  .stat-count {
    font-size: 24px;
    font-weight: 700;
    color: ${(props) => (props.$active ? "#667eea" : "#1a1a1a")};
  }
`;

/* 필터 바 */
export const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
`;

export const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FilterClearBtn = styled.button`
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;

  &:hover {
    background: #e9ecef;
    border-color: #ccc;
    color: #1a1a1a;
  }
`;

/* 검색 바 */
export const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;

  input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s;
  }
  input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  button {
    padding: 12px 24px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  button:hover {
    background: #f8f9fa;
    border-color: #667eea;
    color: #667eea;
  }
`;

/* 질문 목록 */
export const QuestionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

/* 질문 카드 */
export const QuestionCardBtn = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: auto;
  width: 100%;
  text-align: left;
  font: inherit;
  font-family: inherit;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const QuestionMain = styled.div`
  flex: 1;
  min-width: 0;
`;

export const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

export const BadgesGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`;

export const PinBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #fff3e0;
  color: #f57c00;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) =>
    props.$status === "resolved" ? "#e8f5e9" : "#fff3e0"};
  color: ${(props) => (props.$status === "resolved" ? "#2e7d32" : "#f57c00")};
`;

export const AnonymousBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #f3e5f5;
  color: #7b1fa2;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export const TagsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e8edff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
`;

export const Separator = styled.span`
  color: #ccc;
  font-size: 12px;
`;

export const AuthorDate = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;

  .author {
    font-weight: 500;
    color: #1a1a1a;
  }
`;

export const QuestionTitleText = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
`;

export const QuestionStats = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding-left: 20px;
  border-left: 1px solid #e0e0e0;
  flex-shrink: 0;

  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-direction: column;
  }
  .label {
    font-size: 11px;
    color: #666;
  }
  .value {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
  }

  @media (max-width: 1024px) {
    padding-left: 0;
    padding-top: 16px;
    border-left: none;
    border-top: 1px solid #e0e0e0;
    width: 100%;
    justify-content: flex-start;
  }
`;

/* 빈 상태 */
export const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #666;

  p:first-child {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  p:last-child {
    font-size: 14px;
    color: #999;
  }
`;

/* 페이지네이션 */
export const PaginationWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding: 20px 0;

  button {
    padding: 10px 20px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  button:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #667eea;
    color: #667eea;
  }
  button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .page-info {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
`;

/* 로딩 & 에러 */
export const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #666;
`;

export const ErrorMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #e53e3e;
`;
