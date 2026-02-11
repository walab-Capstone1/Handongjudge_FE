import styled, { keyframes, css } from "styled-components";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

export const Container = styled.div<{
	$warning?: boolean;
	$expired?: boolean;
	$compact?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${(p) => (p.$compact ? "6px 12px" : "0.75rem 1.5rem")};
  background: ${(props) => {
		if (props.$expired) return "#fee2e2";
		if (props.$warning) return "#fef3c7";
		return "#dbeafe";
	}};
  border: ${(p) => (p.$compact ? "1px" : "2px")} solid
    ${(props) => {
			if (props.$expired) return "#ef4444";
			if (props.$warning) return "#f59e0b";
			return "#3b82f6";
		}};
  border-radius: ${(p) => (p.$compact ? "4px" : "12px")};
  font-weight: 700;
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
  ${(p) =>
		p.$compact &&
		`
		gap: 0.5rem;
		box-shadow: none;
	`}
`;

export const Label = styled.span<{ $compact?: boolean }>`
  font-size: ${(p) => (p.$compact ? "0.8rem" : "0.875rem")};
  color: #64748b;
  line-height: 1.3;
  font-weight: 700;
`;

export const Value = styled.span<{ $compact?: boolean }>`
  font-size: ${(p) => (p.$compact ? "0.9rem" : "1.25rem")};
  font-weight: 800;
  color: #1e293b;
  font-family: "Courier New", monospace;
  line-height: 1.3;
`;
