import styled, { keyframes, css } from "styled-components";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

export const Container = styled.div<{ $warning?: boolean; $expired?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: ${(props) => {
		if (props.$expired) return "#fee2e2";
		if (props.$warning) return "#fef3c7";
		return "#dbeafe";
	}};
  border: 2px solid
    ${(props) => {
			if (props.$expired) return "#ef4444";
			if (props.$warning) return "#f59e0b";
			return "#3b82f6";
		}};
  border-radius: 12px;
  font-weight: 600;
  box-shadow: ${(props) => {
		if (props.$expired) return "0 4px 12px rgba(239, 68, 68, 0.2)";
		if (props.$warning) return "0 4px 12px rgba(245, 158, 11, 0.2)";
		return "0 4px 12px rgba(59, 130, 246, 0.2)";
	}};

  ${(props) =>
		props.$warning &&
		css`
			animation: ${pulse} 1.5s ease-in-out infinite;
		`}
`;

export const Label = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

export const Value = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  font-family: "Courier New", monospace;
`;
