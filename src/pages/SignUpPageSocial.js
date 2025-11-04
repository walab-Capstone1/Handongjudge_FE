import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const SignUpContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const SignUpCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SignUpTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: black;
  text-align: center;
  margin: 30px 0;
  padding: 0 40px;
`;

const SignUpForm = styled.form`
  padding: 0 40px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #667eea;
  z-index: 1;
`;

const Input = styled.input`
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

const PasswordToggle = styled.button`
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

const SignUpButton = styled.button`
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

const EmailSignUpButton = styled.button`
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

const SocialLoginSection = styled.div`
  padding: 0 40px 30px;
`;

const SocialLoginTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: black;
  text-align: center;
  margin-bottom: 20px;
`;

const SocialLoginButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const SocialButton = styled.button`
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
    border-color: ${props => props.color};
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

const BackToLogin = styled.div`
  text-align: center;
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  background: rgba(248, 250, 252, 0.8);
`;

const BackToLoginLink = styled.a`
  color: black;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

const SignUpPageSocial = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSocialSignUp = async (provider) => {
    setLoading(true);
    try {
      // 실제 구현에서는 각 소셜 로그인 SDK를 사용해야 합니다
      // 현재는 모의 구현입니다
      const mockToken = `mock_${provider}_token_${Date.now()}`;
      await socialLogin(provider, mockToken);
      navigate('/main');
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      alert(`${provider} 로그인에 실패했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = () => {
    navigate('/signup/email');
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <SignUpContainer>
      <SignUpCard>
        <SignUpTitle>회원가입</SignUpTitle>
        
        <SignUpForm>
          <EmailSignUpButton 
            type="button" 
            onClick={handleEmailSignUp}
            disabled={loading}
          >
            이메일로 회원가입
          </EmailSignUpButton>
        </SignUpForm>

        {/* 소셜 회원가입 비활성화 */}
        {/* <SocialLoginSection>
          <SocialLoginTitle>소셜 계정으로 회원가입</SocialLoginTitle>
          <SocialLoginButtons>
            <SocialButton
              onClick={() => handleSocialSignUp('google')}
              disabled={loading}
              color="#DB4437"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </SocialButton>

            <SocialButton
              onClick={() => handleSocialSignUp('kakao')}
              disabled={loading}
              color="#FEE500"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.48 2 12c0 4.41 2.87 8.14 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.82.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>Kakao</span>
            </SocialButton>

            <SocialButton
              onClick={() => handleSocialSignUp('github')}
              disabled={loading}
              color="#333"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.82.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </SocialButton>
          </SocialLoginButtons>
        </SocialLoginSection> */}

        <BackToLogin>
          <BackToLoginLink onClick={handleBackToLogin}>
            이미 계정이 있으신가요? 로그인하기
          </BackToLoginLink>
        </BackToLogin>
      </SignUpCard>
    </SignUpContainer>
  );
};

export default SignUpPageSocial;