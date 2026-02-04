import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
`;

export const Spinner = styled.div<{ $size: "sm" | "md" | "lg" }>`
  border: ${(props) => {
    switch (props.$size) {
      case "sm":
        return "3px";
      case "lg":
        return "5px";
      default:
        return "4px";
    }
  }} solid #e5e7eb;
  border-top: ${(props) => {
    switch (props.$size) {
      case "sm":
        return "3px";
      case "lg":
        return "5px";
      default:
        return "4px";
    }
  }} solid #667eea;
  border-radius: 50%;
  width: ${(props) => {
    switch (props.$size) {
      case "sm":
        return "24px";
      case "lg":
        return "56px";
      default:
        return "40px";
    }
  }};
  height: ${(props) => {
    switch (props.$size) {
      case "sm":
        return "24px";
      case "lg":
        return "56px";
      default:
        return "40px";
    }
  }};
  animation: ${spin} 1s linear infinite;
`;

export const Message = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
`;
