import styled from "styled-components";

export const SignUpContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const SignUpCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const SignUpTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: black;
  text-align: center;
  margin: 30px 0;
  padding: 0 40px;
`;

export const SignUpForm = styled.form`
  padding: 0 40px 40px;
`;

export const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: calc(22px + 8px + 16px + 10px);
  transform: translateY(-50%);
  color: #667eea;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: calc(22px + 8px + 16px + 10px);
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #5a67d8;
  }
`;

export const HelpText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  margin-bottom: 0;
`;

export const ErrorText = styled.p`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  margin-bottom: 0;
`;

export const SignUpButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BackToLogin = styled.div`
  text-align: center;
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  background: rgba(248, 250, 252, 0.8);
`;

export const BackToLoginLink = styled.button`
  color: black;
  text-decoration: none;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
