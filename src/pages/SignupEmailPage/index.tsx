import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	FaEnvelope,
	FaLock,
	FaUser,
	FaIdCard,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa";
import APIService from "../../services/APIService";
import tokenManager from "../../utils/tokenManager";
import type { SignupFormData, FormErrors } from "./types";
import { validateForm } from "./utils/validation";
import * as S from "./styles";

const SignupEmailPage: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const [formData, setFormData] = useState<SignupFormData>({
		email: "",
		password: "",
		passwordConfirm: "",
		name: "",
		studentId: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const validationErrors = validateForm(formData);
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		setLoading(true);
		try {
			const response = await APIService.register({
				email: formData.email,
				password: formData.password,
				name: formData.name,
				studentId: formData.studentId,
			});

			if (response.success) {
				if (response.accessToken) {
					tokenManager.setAccessToken(response.accessToken);
				}

				alert("회원가입이 완료되었습니다!");
				navigate("/main");
			} else {
				alert(response.message || "회원가입에 실패했습니다.");
			}
		} catch (error: any) {
			console.error("회원가입 오류:", error);
			if (error.message.includes("이미 존재하는 이메일")) {
				setErrors((prev) => ({
					...prev,
					email: "이미 사용 중인 이메일입니다.",
				}));
			} else {
				alert(error.message || "회원가입에 실패했습니다. 다시 시도해주세요.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleBackToLogin = () => {
		navigate("/");
	};

	return (
		<S.SignUpContainer>
			<S.SignUpCard>
				<S.SignUpTitle>이메일 회원가입</S.SignUpTitle>

				<S.SignUpForm onSubmit={handleSubmit}>
					<S.InputGroup>
						<S.Label>이메일</S.Label>
						<S.InputIcon>
							<FaEnvelope />
						</S.InputIcon>
						<S.Input
							type="email"
							name="email"
							placeholder="example@handong.ac.kr"
							value={formData.email}
							onChange={handleInputChange}
							disabled={loading}
						/>
						{errors.email && <S.ErrorText>{errors.email}</S.ErrorText>}
					</S.InputGroup>

					<S.InputGroup>
						<S.Label>비밀번호</S.Label>
						<S.InputIcon>
							<FaLock />
						</S.InputIcon>
						<S.Input
							type={showPassword ? "text" : "password"}
							name="password"
							placeholder="최소 6자 이상"
							value={formData.password}
							onChange={handleInputChange}
							disabled={loading}
						/>
						<S.PasswordToggle
							type="button"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <FaEyeSlash /> : <FaEye />}
						</S.PasswordToggle>
						{errors.password && <S.ErrorText>{errors.password}</S.ErrorText>}
					</S.InputGroup>

					<S.InputGroup>
						<S.Label>비밀번호 확인</S.Label>
						<S.InputIcon>
							<FaLock />
						</S.InputIcon>
						<S.Input
							type={showPasswordConfirm ? "text" : "password"}
							name="passwordConfirm"
							placeholder="비밀번호를 다시 입력하세요"
							value={formData.passwordConfirm}
							onChange={handleInputChange}
							disabled={loading}
						/>
						<S.PasswordToggle
							type="button"
							onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
						>
							{showPasswordConfirm ? <FaEyeSlash /> : <FaEye />}
						</S.PasswordToggle>
						{errors.passwordConfirm && (
							<S.ErrorText>{errors.passwordConfirm}</S.ErrorText>
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
							value={formData.name}
							onChange={handleInputChange}
							disabled={loading}
						/>
						{errors.name && <S.ErrorText>{errors.name}</S.ErrorText>}
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
							value={formData.studentId}
							onChange={handleInputChange}
							maxLength={8}
							disabled={loading}
						/>
						{!errors.studentId && (
							<S.HelpText>8자리 학번을 입력하세요 (예: 22100042)</S.HelpText>
						)}
						{errors.studentId && <S.ErrorText>{errors.studentId}</S.ErrorText>}
					</S.InputGroup>

					<S.SignUpButton type="submit" disabled={loading}>
						{loading ? "회원가입 중..." : "회원가입"}
					</S.SignUpButton>
				</S.SignUpForm>

				<S.BackToLogin>
					<S.BackToLoginLink onClick={handleBackToLogin} disabled={loading}>
						이미 계정이 있으신가요? 로그인하기
					</S.BackToLoginLink>
				</S.BackToLogin>
			</S.SignUpCard>
		</S.SignUpContainer>
	);
};

export default SignupEmailPage;
