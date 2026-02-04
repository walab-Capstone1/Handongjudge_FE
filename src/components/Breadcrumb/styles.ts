import styled from "styled-components";
import { Link } from "react-router-dom";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

export const ItemLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #5568d3;
    text-decoration: underline;
  }
`;

export const CurrentItem = styled.span`
  color: #374151;
  font-weight: 600;
`;

export const Separator = styled.span`
  color: #9ca3af;
  margin: 0 0.25rem;
`;
