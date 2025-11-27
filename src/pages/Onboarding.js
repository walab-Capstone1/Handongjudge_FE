import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { onboardingState } from "../recoil/atoms";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaGithub,
} from "react-icons/fa";
import { SiKakaotalk } from "react-icons/si";

const Onboarding = () => {
  const navigate = useNavigate();
  const [onboarding, setOnboarding] = useRecoilState(onboardingState);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 로그인 로직은 AuthCallback에서 처리
    navigate("/auth/callback", { 
      state: { 
        type: "login", 
        email: formData.email, 
        password: formData.password 
      } 
    });
  };

  // Onboarding.jsx
  const handleSocialLogin = (provider) => {
    // 소셜 로그인 비활성화 - 이메일 회원가입 후 이메일로 로그인 안내
    alert('이메일로 회원가입 후 이메일로 로그인해주세요.');
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <OnboardingContainer>
      <Header>
        <Logo>
          <LogoImage src={`${process.env.PUBLIC_URL || ''}/logo.svg`} alt="HandongJudge" />
          <span>HandongJudge</span>
        </Logo>
        <EnterpriseLink>기업서비스</EnterpriseLink>
      </Header>

      <MainContent>
        <LeftSection>
          <WelcomeText>
            반가워요, 개발자의 성장을 돕는 한동대학교 온라인 저지입니다.
          </WelcomeText>
          <Illustrations>
            <IllustrationItem>
              <CodeIcon>&lt;/&gt;</CodeIcon>
            </IllustrationItem>
            <IllustrationItem>
              <DatabaseIcon>DB</DatabaseIcon>
            </IllustrationItem>
            <IllustrationItem>
              <CloudIcon>☁</CloudIcon>
            </IllustrationItem>
            <IllustrationItem>
              <BrowserIcon>🌐</BrowserIcon>
            </IllustrationItem>
            <IllustrationItem>
              <ChartIcon>📊</ChartIcon>
            </IllustrationItem>
          </Illustrations>
        </LeftSection>

        <RightSection>
          <LoginCard>
            <LoginTitle>한동대학교 온라인 저지 로그인</LoginTitle>
            
            <LoginForm onSubmit={handleSubmit}>
              <InputGroup>
                <InputIcon>
                  <FaEnvelope />
                </InputIcon>
                <Input
                  type="email"
                  name="email"
                  placeholder="이메일을 입력해 주세요"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>

              <InputGroup>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="비밀번호를 입력해 주세요"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggle>
              </InputGroup>

              <LoginButton type="submit">
                로그인하기
              </LoginButton>

              <SignupButton type="button" onClick={handleSignup}>
                회원가입
              </SignupButton>

              <PasswordResetLink href="#">
                비밀번호 재설정
              </PasswordResetLink>
            </LoginForm>

            <SocialLoginSection>
              <SocialLoginTitle>
                SNS 계정으로 간편하게 시작하기
              </SocialLoginTitle>
              <SocialLoginButtons>
                <SocialButton
                  onClick={() => handleSocialLogin("google")}
                  color="#4285F4"
                >
                  <FaGoogle />
                  <span>Google</span>
                </SocialButton>
                
                <SocialButton
                  onClick={() => handleSocialLogin("kakao")}
                  color="#FEE500"
                >
                  <SiKakaotalk />
                  <span>Kakao</span>
                </SocialButton>
                
                <SocialButton
                  onClick={() => handleSocialLogin("github")}
                  color="#24292E"
                >
                  <FaGithub />
                  <span>GitHub</span>
                </SocialButton>
                
                <SocialButton
                  onClick={() => handleSocialLogin("hisnet")}
                  color="#1E3A8A"
                >
                  <HisNetIcon>H</HisNetIcon>
                  <span>HisNet</span>
                </SocialButton>
              </SocialLoginButtons>
            </SocialLoginSection>

            <FooterLinks>
              <FooterLink href="#">이용약관</FooterLink>
              <FooterDivider>|</FooterDivider>
              <FooterLink href="#">개인정보 처리방침</FooterLink>
              <FooterDivider>|</FooterDivider>
              <FooterLink href="#">FAQ/문의</FooterLink>
            </FooterLinks>
          </LoginCard>
        </RightSection>
      </MainContent>
    </OnboardingContainer>
  );
};

// Styled Components
const OnboardingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Logo = styled.h1`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
`;

const LogoImage = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
`;

const EnterpriseLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    color: white;
  }
`;

const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 80px);
`;

const LeftSection = styled.div`
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

const WelcomeText = styled.h2`
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.4;
  z-index: 2;
  color: white;
`;

const Illustrations = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  z-index: 2;
`;

const IllustrationItem = styled.div`
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

const CodeIcon = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: white;
`;

const DatabaseIcon = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: white;
`;

const CloudIcon = styled.div`
  font-size: 32px;
  color: white;
`;

const BrowserIcon = styled.div`
  font-size: 32px;
  color: white;
`;

const ChartIcon = styled.div`
  font-size: 32px;
  color: white;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const LoginTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: black;
  text-align: center;
  margin: 30px 0;
  padding: 0 40px;
`;

const LoginForm = styled.form`
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

const LoginButton = styled.button`
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

const SignupButton = styled.button`
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

const PasswordResetLink = styled.a`
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
  grid-template-columns: repeat(4, 1fr);
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

const HisNetIcon = styled.div`
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

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 40px;
  border-top: 1px solid #e5e7eb;
  background: rgba(248, 250, 252, 0.8);
`;

const FooterLink = styled.a`
  color: black;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    color: #5a67d8;
    text-decoration: underline;
  }
`;

const FooterDivider = styled.span`
  color: #d1d5db;
  margin: 0 12px;
  font-size: 14px;
`;

export default Onboarding;