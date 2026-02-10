import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const Container = styled.div`
  width: 100%;
  max-width: 500px;
`;

export const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const Subtitle = styled.p`
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
`;

export const Body = styled.div`
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

export const CodeDisplay = styled.div`
  margin-bottom: 2rem;

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 0.5rem;
  }
`;

export const CodeBox = styled.div`
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  color: #667eea;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

export const Info = styled.div`
  background: #f0f4ff;
  border-left: 4px solid #667eea;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;

  p {
    margin: 0;
    color: #4b5563;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

export const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #c33;
  font-size: 0.9rem;
`;

export const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled(Button)`
  background: #f3f4f6;
  color: #6b7280;

  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
`;

export const EnrollButton = styled(Button)`
  background: #667eea;
  color: white;

  &:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

export const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;

  p {
    margin: 0;
    color: #4b5563;
  }
`;
