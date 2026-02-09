import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

export const ItemsPerPage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ItemsPerPageLabel = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
`;

export const ItemsPerPageSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const PageInfo = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
`;

export const Pages = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props) => (props.$active ? "#667eea" : "#e5e7eb")};
  background: ${(props) => (props.$active ? "#667eea" : "white")};
  color: ${(props) => (props.$active ? "white" : "#6b7280")};
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? "#5568d3" : "#f3f4f6")};
    border-color: ${(props) => (props.$active ? "#5568d3" : "#d1d5db")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageEllipsis = styled.span`
  color: #9ca3af;
  padding: 0 0.5rem;
  user-select: none;
`;
