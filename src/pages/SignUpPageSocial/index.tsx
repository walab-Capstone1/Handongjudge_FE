import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth";

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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  cursor: pointer;
  
  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

const SignUpPageSocial: React.FC = () => {
	const navigate = useNavigate();
	const { login } = useAuth();
	const [loading, setLoading] = useState(false);

	const handleSocialSignUp = async (provider: string) => {
		setLoading(true);
		try {
			const mockToken = `mock_${provider}_token_${Date.now()}`;
			// await login with social
			navigate("/main");
		} catch (error) {
			console.error(`${provider} 로그인 오류:`, error);
			alert(`${provider} 로그인에 실패했습니다.`);
		} finally {
			setLoading(false);
		}
	};

	const handleEmailSignUp = () => {
		navigate("/signup/email");
	};

	const handleBackToLogin = () => {
		navigate("/");
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
