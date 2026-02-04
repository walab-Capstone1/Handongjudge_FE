import type React from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import { onboardingState } from "../../recoil/atoms";
import {
	FaEnvelope,
	FaLock,
	FaEye,
	FaEyeSlash,
	FaGoogle,
	FaGithub,
} from "react-icons/fa";
import { SiKakaotalk } from "react-icons/si";
import type { LoginFormData, SocialProvider } from "./types";
import * as S from "./styles";

interface LocationState {
	redirectTo?: string;
	message?: string;
}

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [onboarding, setOnboarding] = useRecoilState(onboardingState);
	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const state = location.state as LocationState;
	const redirectTo = state?.redirectTo;
	const loginMessage = state?.message;

	const pendingEnrollmentCode = sessionStorage.getItem("pendingEnrollmentCode");

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		navigate("/auth/callback", {
			state: {
				type: "login",
				email: formData.email,
				password: formData.password,
				redirectTo: redirectTo,
			},
		});
	};

	const handleSocialLogin = (provider: SocialProvider) => {
		alert("이메일로 회원가입 후 이메일로 로그인해주세요.");
	};

	const handleSignup = () => {
		navigate("/signup");
	};

	return (
		<S.OnboardingContainer>
			<S.Header>
				<S.Logo>
					<S.LogoImage
						src={`${process.env.PUBLIC_URL || ""}/logo.svg`}
						alt="CodeSturdy"
					/>
					<span>CodeSturdy</span>
				</S.Logo>
				<S.EnterpriseLink>기업서비스</S.EnterpriseLink>
			</S.Header>

			<S.MainContent>
				<S.LeftSection>
					<S.WelcomeText>
						반가워요, 개발자의 성장을 돕는 CodeSturdy입니다.
					</S.WelcomeText>
					<S.Illustrations>
						<S.IllustrationItem>
							<S.CodeIcon>&lt;/&gt;</S.CodeIcon>
						</S.IllustrationItem>
						<S.IllustrationItem>
							<S.DatabaseIcon>DB</S.DatabaseIcon>
						</S.IllustrationItem>
						<S.IllustrationItem>
							<S.CloudIcon>☁</S.CloudIcon>
						</S.IllustrationItem>
						<S.IllustrationItem>
							<S.BrowserIcon>🌐</S.BrowserIcon>
						</S.IllustrationItem>
						<S.IllustrationItem>
							<S.ChartIcon>📊</S.ChartIcon>
						</S.IllustrationItem>
					</S.Illustrations>
				</S.LeftSection>

				<S.RightSection>
					<S.LoginCard>
						<S.LoginTitle>CodeSturdy 로그인</S.LoginTitle>
						{(loginMessage || pendingEnrollmentCode) && (
							<S.LoginMessage>
								{loginMessage || "수업 참가를 위해 로그인이 필요합니다."}
							</S.LoginMessage>
						)}
						<S.LoginForm onSubmit={handleSubmit}>
							<S.InputGroup>
								<S.InputIcon>
									<FaEnvelope />
								</S.InputIcon>
								<S.Input
									type="email"
									name="email"
									placeholder="이메일을 입력해 주세요"
									value={formData.email}
									onChange={handleInputChange}
									required
								/>
							</S.InputGroup>

							<S.InputGroup>
								<S.InputIcon>
									<FaLock />
								</S.InputIcon>
								<S.Input
									type={showPassword ? "text" : "password"}
									name="password"
									placeholder="비밀번호를 입력해 주세요"
									value={formData.password}
									onChange={handleInputChange}
									required
								/>
								<S.PasswordToggle
									type="button"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</S.PasswordToggle>
							</S.InputGroup>

							<S.LoginButton type="submit">로그인하기</S.LoginButton>

							<S.SignupButton type="button" onClick={handleSignup}>
								회원가입
							</S.SignupButton>

							<S.PasswordResetLink href="#">
								비밀번호 재설정
							</S.PasswordResetLink>
						</S.LoginForm>

						<S.SocialLoginSection>
							<S.SocialLoginTitle>
								SNS 계정으로 간편하게 시작하기
							</S.SocialLoginTitle>
							<S.SocialLoginButtons>
								<S.SocialButton
									onClick={() => handleSocialLogin("google")}
									color="#4285F4"
								>
									<FaGoogle />
									<span>Google</span>
								</S.SocialButton>

								<S.SocialButton
									onClick={() => handleSocialLogin("kakao")}
									color="#FEE500"
								>
									<SiKakaotalk />
									<span>Kakao</span>
								</S.SocialButton>

								<S.SocialButton
									onClick={() => handleSocialLogin("github")}
									color="#24292E"
								>
									<FaGithub />
									<span>GitHub</span>
								</S.SocialButton>

								<S.SocialButton
									onClick={() => handleSocialLogin("hisnet")}
									color="#1E3A8A"
								>
									<S.HisNetIcon>H</S.HisNetIcon>
									<span>HisNet</span>
								</S.SocialButton>
							</S.SocialLoginButtons>
						</S.SocialLoginSection>

						<S.FooterLinks>
							<S.FooterLink href="#">이용약관</S.FooterLink>
							<S.FooterDivider>|</S.FooterDivider>
							<S.FooterLink href="#">개인정보 처리방침</S.FooterLink>
							<S.FooterDivider>|</S.FooterDivider>
							<S.FooterLink href="#">FAQ/문의</S.FooterLink>
						</S.FooterLinks>
					</S.LoginCard>
				</S.RightSection>
			</S.MainContent>
		</S.OnboardingContainer>
	);
};

export default LoginPage;
