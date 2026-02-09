import {
	FaEnvelope,
	FaLock,
	FaUser,
	FaIdCard,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa";
import type { SignupEmailPageHookReturn } from "../hooks/useSignupEmailPage";
import * as S from "../styles";

export default function SignupEmailPageView(d: SignupEmailPageHookReturn) {
	return (
		<S.SignUpContainer>
			<S.SignUpCard>
				<S.SignUpTitle>이메일 회원가입</S.SignUpTitle>

				<S.SignUpForm onSubmit={d.handleSubmit}>
					<S.InputGroup>
						<S.Label>이메일</S.Label>
						<S.InputIcon>
							<FaEnvelope />
						</S.InputIcon>
						<S.Input
							type="email"
							name="email"
							placeholder="example@handong.ac.kr"
							value={d.formData.email}
							onChange={d.handleInputChange}
							disabled={d.loading}
						/>
						{d.errors.email && <S.ErrorText>{d.errors.email}</S.ErrorText>}
					</S.InputGroup>

					<S.InputGroup>
						<S.Label>비밀번호</S.Label>
						<S.InputIcon>
							<FaLock />
						</S.InputIcon>
						<S.Input
							type={d.showPassword ? "text" : "password"}
							name="password"
							placeholder="최소 6자 이상"
							value={d.formData.password}
							onChange={d.handleInputChange}
							disabled={d.loading}
						/>
						<S.PasswordToggle
							type="button"
							onClick={d.setShowPasswordToggle}
						>
							{d.showPassword ? <FaEyeSlash /> : <FaEye />}
						</S.PasswordToggle>
						{d.errors.password && (
							<S.ErrorText>{d.errors.password}</S.ErrorText>
						)}
					</S.InputGroup>

					<S.InputGroup>
						<S.Label>비밀번호 확인</S.Label>
						<S.InputIcon>
							<FaLock />
						</S.InputIcon>
						<S.Input
							type={d.showPasswordConfirm ? "text" : "password"}
							name="passwordConfirm"
							placeholder="비밀번호를 다시 입력하세요"
							value={d.formData.passwordConfirm}
							onChange={d.handleInputChange}
							disabled={d.loading}
						/>
						<S.PasswordToggle
							type="button"
							onClick={d.setShowPasswordConfirmToggle}
						>
							{d.showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
						</S.PasswordToggle>
						{d.errors.passwordConfirm && (
							<S.ErrorText>{d.errors.passwordConfirm}</S.ErrorText>
						)}
					</S.InputGroup>

					<S.InputGroup>
						<S.Label>이름</S.Label>
						<S.InputIcon>
							<FaUser />
						</S.InputIcon>
						<S.Input
							type="text"
							name="name"
							placeholder="홍길동"
							value={d.formData.name}
							onChange={d.handleInputChange}
							disabled={d.loading}
						/>
						{d.errors.name && <S.ErrorText>{d.errors.name}</S.ErrorText>}
					</S.InputGroup>

					<S.InputGroup>
						<S.Label>학번</S.Label>
						<S.InputIcon>
							<FaIdCard />
						</S.InputIcon>
						<S.Input
							type="text"
							name="studentId"
							placeholder="22100042"
							value={d.formData.studentId}
							onChange={d.handleInputChange}
							maxLength={8}
							disabled={d.loading}
						/>
						{!d.errors.studentId && (
							<S.HelpText>8자리 학번을 입력하세요 (예: 22100042)</S.HelpText>
						)}
						{d.errors.studentId && (
							<S.ErrorText>{d.errors.studentId}</S.ErrorText>
						)}
					</S.InputGroup>

					<S.SignUpButton type="submit" disabled={d.loading}>
						{d.loading ? "회원가입 중..." : "회원가입"}
					</S.SignUpButton>
				</S.SignUpForm>

				<S.BackToLogin>
					<S.BackToLoginLink
						onClick={d.handleBackToLogin}
						disabled={d.loading}
					>
						이미 계정이 있으신가요? 로그인하기
					</S.BackToLoginLink>
				</S.BackToLogin>
			</S.SignUpCard>
		</S.SignUpContainer>
	);
}
