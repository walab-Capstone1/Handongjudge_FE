import styled from "styled-components";

export const Card = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: #0984e3;
    box-shadow: 0 4px 12px rgba(9, 132, 227, 0.15);
    transform: translateY(-2px);
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  color: #2d3436;
  margin: 0;
  text-transform: capitalize;
`;

export const ExpandIcon = styled.div`
  color: #636e72;
  font-size: 0.8rem;
  transition: transform 0.2s ease;

  ${Card}:hover & {
    transform: rotate(90deg);
  }
`;

export const Description = styled.p`
  color: #636e72;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

export const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

export const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const MetricLabel = styled.span`
  font-size: 0.75rem;
  color: #95a5a6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MetricValue = styled.span<{ $type?: string }>`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3436;

  ${(props) =>
		props.$type === "deadline" &&
		`
    color: #e74c3c;
    background: #fee;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
  `}
`;
