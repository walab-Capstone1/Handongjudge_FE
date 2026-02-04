import styled from "styled-components";

export const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1.5rem;
  background: white;
  border-bottom: 2px solid #d1d5db !important;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none !important;
  }
`;

export const Info = styled.div`
  flex: 1;
`;

export const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3436;
  margin: 0 0 0.5rem 0;
`;

export const Meta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  align-self: center;
`;

export const Level = styled.span`
  font-size: 0.85rem;
  color: #636e72;
  font-weight: 500;
`;

export const Completed = styled.span`
  font-size: 0.85rem;
  color: #636e72;
  font-weight: 500;
`;

export const Limits = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const LimitBadge = styled.span<{ $type: "time" | "memory" }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => (props.$type === "time" ? "#e3f2fd" : "#f3e5f5")};
  color: ${(props) => (props.$type === "time" ? "#1976d2" : "#7b1fa2")};
`;

export const Icons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const SubmissionStatus = styled.div<{
	$status: "correct" | "submitted" | "not-submitted";
}>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  min-width: 50px;
  background: ${(props) => {
		switch (props.$status) {
			case "correct":
				return "#d4edda";
			case "submitted":
				return "#fff3cd";
			case "not-submitted":
				return "#f8d7da";
			default:
				return "#f5f5f5";
		}
	}};
  color: ${(props) => {
		switch (props.$status) {
			case "correct":
				return "#155724";
			case "submitted":
				return "#856404";
			case "not-submitted":
				return "#721c24";
			default:
				return "#333";
		}
	}};
  border: 1px solid
    ${(props) => {
			switch (props.$status) {
				case "correct":
					return "#c3e6cb";
				case "submitted":
					return "#ffeaa7";
				case "not-submitted":
					return "#f5c6cb";
				default:
					return "#ddd";
			}
		}};
`;

export const TagIcon = styled.div`
  width: 20px;
  height: 20px;
`;
