import styled, { css } from "styled-components";

export const AlertContainer = styled.div<{ $type: "success" | "error" | "warning" | "info" }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  position: relative;

  ${(props) => {
    switch (props.$type) {
      case "success":
        return css`
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        `;
      case "error":
        return css`
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        `;
      case "warning":
        return css`
          background-color: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        `;
      default:
        return css`
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #3b82f6;
        `;
    }
  }}
`;

export const AlertContent = styled.div`
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
`;

export const AlertClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`;
