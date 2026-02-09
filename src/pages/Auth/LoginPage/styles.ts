import styled from "styled-components";

export const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

export const Logo = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
`;

export const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
`;

export const EnterpriseLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    color: white;
  }
`;

export const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
`;

export const LeftSection = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  color: white;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

export const WelcomeText = styled.h2`
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.4;
  z-index: 2;
  color: white;
`;

export const Illustrations = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  z-index: 2;
`;

export const IllustrationItem = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
`;

export const CodeIcon = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: white;
`;

export const DatabaseIcon = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

export const CloudIcon = styled.div`
  font-size: 32px;
  color: white;
`;

export const BrowserIcon = styled.div`
  font-size: 32px;
  color: white;
`;

export const ChartIcon = styled.div`
  font-size: 32px;
  color: white;
`;

export const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

export const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const LoginTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: black;
  text-align: center;
  margin: 30px 0 10px 0;
  padding: 0 40px;
`;

export const LoginMessage = styled.p`
  font-size: 14px;
  color: #667EEA;
  text-align: center;
  margin: 0 0 20px 0;
  padding: 0 40px;
  font-weight: 500;
`;

export const LoginForm = styled.form`
  padding: 0 40px;
`;

export const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

export const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  z-index: 1;
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
`;

export const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #5a67d8;
  }
`;

export const LoginButton = styled.button`
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
  margin-bottom: 12px;
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

export const SignupButton = styled.button`
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  color: black;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
    color: #5a67d8;
  }
`;

export const PasswordResetLink = styled.a`
  display: block;
  text-align: center;
  color: black;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 30px;

  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

export const SocialLoginSection = styled.div`
  padding: 0 40px 30px;
`;

export const SocialLoginTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: black;
  text-align: center;
  margin-bottom: 20px;
`;

export const SocialLoginButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

export const SocialButton = styled.button<{ color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: black;

  &:hover {
    border-color: ${(props) => props.color};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    background: rgba(255, 255, 255, 1);
  }

  svg, span {
    margin: 2px 0;
  }

  span {
    font-size: 12px;
    font-weight: 500;
  }
`;

export const HisNetIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #1E3A8A;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
`;

export const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  background: rgba(248, 250, 252, 0.8);
`;

export const FooterLink = styled.a`
  color: black;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

export const FooterDivider = styled.span`
  color: #d1d5db;
  margin: 0 12px;
  font-size: 14px;
`;
