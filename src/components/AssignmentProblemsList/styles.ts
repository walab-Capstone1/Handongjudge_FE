import styled from "styled-components";

export const List = styled.div`
  display: flex;
  align-items: flex-start;
  background: #d9dff9;
  border-radius: 10px;
  padding: 14px 24px 14px 20px;
  gap: 24px;
`;

export const Indicator = styled.div`
  width: 0;
  min-height: 85px;
  flex-shrink: 0;
  border-left: 2px dashed #667eea;
  margin-right: 0;
`;

export const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

export const ProblemRow = styled.div<{ $completed?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(102, 126, 234, 0.1);
  }
`;

export const Bullet = styled.span`
  font-size: 16px;
  font-weight: bold;
  line-height: 1.4;
  flex-shrink: 0;
  color: inherit;
`;

export const ProblemTitle = styled.span`
  font-size: 14px;
  line-height: 1.4;
  flex: 1;
  color: inherit;
`;

export const NoProblemsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;

  span {
    color: #868fb7;
    font-size: 14px;
    font-style: italic;
  }
`;
