import type { SignUpPageSocialHookReturn } from "../hooks/useSignUpPageSocial";
import * as S from "../styles";

export default function SignUpPageSocialView(d: SignUpPageSocialHookReturn) {
	return (
		<S.SignUpContainer>
			<S.SignUpCard>
				<S.SignUpTitle>회원가입</S.SignUpTitle>

				<S.SignUpForm>
					<S.EmailSignUpButton
						type="button"
						onClick={d.handleEmailSignUp}
						disabled={d.loading}
					>
						이메일로 회원가입
					</S.EmailSignUpButton>
				</S.SignUpForm>

				<S.BackToLogin>
					<S.BackToLoginLink onClick={d.handleBackToLogin}>
						이미 계정이 있으신가요? 로그인하기
					</S.BackToLoginLink>
				</S.BackToLogin>
			</S.SignUpCard>
		</S.SignUpContainer>
	);
}
