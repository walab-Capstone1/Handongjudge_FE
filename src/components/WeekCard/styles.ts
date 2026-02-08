import styled from "styled-components";
import { Link } from "react-router-dom";

export const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

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
  margin: 0 0 1.5rem 0;
`;

export const Metrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const Metric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
  }
`;

export const MetricLabel = styled.span`
  font-size: 0.85rem;
  color: #636e72;
  font-weight: 500;
`;

export const MetricValue = styled.span<{ $type?: string }>`
  font-size: 0.85rem;
  color: #2d3436;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${(props) =>
		props.$type === "deadline" &&
		`
    color: #e74c3c;
    font-weight: bold;
    &::before {
      content: "⏰ ";
      margin-right: 0.25rem;
    }
  `}
`;
