import styled from "styled-components";

export const Container = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
`;

export const Icon = styled.div`
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

export const Message = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
`;

export const Action = styled.div`
  margin-top: 1rem;
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5568d3;
  }
`;
