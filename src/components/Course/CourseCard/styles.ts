import styled from "styled-components";

export const CardLink = styled.div`
  text-decoration: none;
  color: inherit;
  display: block;
  min-width: 280px;
`;

export const Card = styled.div<{ $disabled?: boolean }>`
  min-width: 280px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, z-index 0.2s ease;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  position: relative;
  z-index: 1;
  opacity: ${(props) => (props.$disabled ? 0.85 : 1)};

  &:hover {
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
			props.$disabled
				? "0 1px 3px rgba(0, 0, 0, 0.1)"
				: "0 4px 12px rgba(102, 126, 234, 0.15)"};
    border-color: ${(props) => (props.$disabled ? "#e5e7eb" : "#667eea")};
    z-index: ${(props) => (props.$disabled ? 1 : 10)};
  }
`;

export const CardHeader = styled.div<{
	$color?: string;
	$opacity?: boolean;
}>`
  padding: 1rem 1.25rem;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fafbfc;
  border-bottom: 3px solid #667eea;
  opacity: ${(props) => (props.$opacity ? 0.6 : 1)};
`;

export const CardTitle = styled.div`
  h3 {
    color: #374151;
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0;
    line-height: 1.3;
  }
`;

export const BatchBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
`;

export const CardContent = styled.div`
  padding: 1rem 1.25rem;
  background: white;
`;

export const StatusTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
`;

export const StatusTag = styled.span<{ $color: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;

  ${(props) => {
		switch (props.$color) {
			case "blue":
				return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
			case "yellow":
				return `
          background-color: #fff3e0;
          color: #f57c00;
        `;
			case "green":
				return `
          background-color: #e8f5e8;
          color: #388e3c;
        `;
			default:
				return `
          background-color: #e3f2fd;
          color: #1976d2;
        `;
		}
	}}
`;

export const InstructorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const Instructor = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
  flex: 1;
`;

export const EnrollButton = styled.button`
  background: #667eea;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #5568d3;
  }

  &:active {
    background: #4a5bc0;
  }
`;

export const DisabledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 12px;
`;

export const DisabledMessage = styled.div`
  text-align: center;
  padding: 1rem;

  p {
    margin: 0;
    color: #6b7280;
    font-weight: 600;
    font-size: 0.9rem;
  }
`;
