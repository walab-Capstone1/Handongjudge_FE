import styled from "styled-components";

export const Header = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e1e8ed;
  margin-bottom: 1.5rem;
`;

export const Info = styled.div`
  margin-bottom: 1rem;
`;

export const TitleSection = styled.div`
  margin-bottom: 0.75rem;
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3436;
  margin: 0;
`;

export const Description = styled.p`
  color: #636e72;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
`;

export const Dates = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e1e8ed;
`;

export const DeadlineStatus = styled.div<{ $status?: string }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  background: ${(props) => {
		switch (props.$status) {
			case "ongoing":
				return "#e8f5e9";
			case "imminent":
				return "#fff3e0";
			case "overdue":
				return "#ffebee";
			default:
				return "#f5f5f5";
		}
	}};
  color: ${(props) => {
		switch (props.$status) {
			case "ongoing":
				return "#2e7d32";
			case "imminent":
				return "#ef6c00";
			case "overdue":
				return "#c62828";
			default:
				return "#616161";
		}
	}};
`;

export const DateItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const DateLabel = styled.span`
  font-size: 0.85rem;
  color: #95a5a6;
  font-weight: 500;
`;

export const DateValue = styled.span<{ $status?: string }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => {
		switch (props.$status) {
			case "ongoing":
				return "#2e7d32";
			case "imminent":
				return "#ef6c00";
			case "overdue":
				return "#c62828";
			default:
				return "#2d3436";
		}
	}};
`;
