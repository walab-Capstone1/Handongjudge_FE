import styled from "styled-components";
import { Link } from "react-router-dom";

export const Container = styled.nav`
  margin-bottom: 1rem;
`;

export const List = styled.ol`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const ItemLink = styled(Link)`
  color: #6b7280;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }
`;

export const CurrentItem = styled.span`
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const Separator = styled.span`
  color: #9ca3af;
  font-size: 0.875rem;
  user-select: none;
`;
