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

export const Body = styled.div`
  padding: 78px 100px 40px 100px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    padding: 78px 40px 40px 40px;
  }
  @media (max-width: 768px) {
    padding: 78px 20px 40px 20px;
  }
`;

/* 질문 카드 */
export const QuestionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

export const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const QuestionBadges = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Badge = styled.span<{ $variant?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: ${(props) =>
		props.$variant === "resolved"
			? "#e8f5e9"
			: props.$variant === "anonymous"
				? "#f3e5f5"
				: props.$variant === "private"
					? "#ffebee"
					: "#fff3e0"};
  color: ${(props) =>
		props.$variant === "resolved"
			? "#2e7d32"
			: props.$variant === "anonymous"
				? "#7b1fa2"
				: props.$variant === "private"
					? "#c62828"
					: "#f57c00"};
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

export const BtnBack = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;

  &:hover {
    background: #f8f9fa;
    border-color: #667eea;
    color: #667eea;
  }
`;

export const BtnEdit = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #667eea;
  border-radius: 6px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

export const BtnDelete = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #e53e3e;
  border-radius: 6px;
  color: #e53e3e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e53e3e;
    color: white;
  }
`;

export const BtnResolve = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #667eea;
  border-radius: 6px;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

export const QuestionTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

export const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #666;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;

  .author {
    font-weight: 600;
    color: #1a1a1a;
  }
  .separator {
    color: #ccc;
  }
  .tag {
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    color: #667eea;
    font-size: 13px;
  }
`;

export const QuestionContent = styled.div`
  padding: 24px 0;
  line-height: 1.8;
  font-size: 15px;
  color: #333;
  word-wrap: break-word;

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: "Courier New", monospace;
    background: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    margin: 8px 0;
    font-size: 14px;
    color: #333;
    overflow-x: auto;
  }

  code {
    font-family: "Courier New", monospace;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 14px;
  }

  p {
    margin: 12px 0;
  }

  ul, ol {
    margin: 12px 0;
    padding-left: 24px;
  }
`;

export const QuestionActions = styled.div`
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

export const ActionBtn = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${(props) => (props.$active ? "#e8edff" : "white")};
  border: 1px solid ${(props) => (props.$active ? "#667eea" : "#e0e0e0")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => (props.$active ? "#667eea" : "#666")};

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
  .text {
    font-size: 14px;
  }
  .count {
    font-weight: 600;
  }
`;

/* 댓글 섹션 */
export const CommentsSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

export const CommentsTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
`;

export const CommentForm = styled.form`
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
`;

export const EditorWrapper = styled.div`
  margin-bottom: 12px;
`;

export const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const CommentFormFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

export const CommentOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;

export const BtnSubmitComment = styled.button`
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
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

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const EmptyComments = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  p:first-child {
    font-size: 16px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
  }
`;

/* 댓글 카드 */
export const CommentCard = styled.div<{ $accepted?: boolean }>`
  padding: 20px;
  background: ${(props) => (props.$accepted ? "#e8f5e9" : "#f8f9fa")};
  border-radius: 8px;
  border: 2px solid ${(props) => (props.$accepted ? "#4caf50" : "transparent")};
  transition: all 0.2s;
`;

export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const CommentAuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CommentAuthor = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
`;

export const BadgeInstructor = styled.span`
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export const BadgeAccepted = styled.span`
  padding: 4px 8px;
  background: #4caf50;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export const CommentDate = styled.span`
  font-size: 13px;
  color: #999;
`;

export const CommentContent = styled.div`
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  word-wrap: break-word;

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: "Courier New", monospace;
    background: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    margin: 8px 0;
    font-size: 13px;
    color: #333;
    overflow-x: auto;
  }

  code {
    font-family: "Courier New", monospace;
    background: #f8f9fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 13px;
  }

  p {
    margin: 8px 0;
  }
`;

export const CommentActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export const ActionBtnSmall = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${(props) => (props.$active ? "#e8edff" : "white")};
  border: 1px solid ${(props) => (props.$active ? "#667eea" : "#e0e0e0")};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: ${(props) => (props.$active ? "#667eea" : "#666")};

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
  .text {
    font-size: 13px;
  }
`;

export const BtnAccept = styled.button`
  padding: 6px 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #45a049;
  }
`;

export const BtnUnaccept = styled.button`
  padding: 6px 16px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f57c00;
  }
`;

export const BtnDeleteComment = styled.button`
  padding: 6px 16px;
  background: white;
  border: 1px solid #e53e3e;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #e53e3e;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e53e3e;
    color: white;
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
