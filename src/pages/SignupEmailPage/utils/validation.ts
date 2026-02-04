import type { SignupFormData, FormErrors } from "../types";

export const validateForm = (formData: SignupFormData): FormErrors => {
	const newErrors: FormErrors = {};

	// 이메일 검증
	if (!formData.email) {
		newErrors.email = "이메일을 입력해주세요.";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		newErrors.email = "올바른 이메일 형식이 아닙니다.";
	}

	// 비밀번호 검증
	if (!formData.password) {
		newErrors.password = "비밀번호를 입력해주세요.";
	} else if (formData.password.length < 6) {
		newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
	}

	// 비밀번호 확인
	if (!formData.passwordConfirm) {
		newErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
	} else if (formData.password !== formData.passwordConfirm) {
		newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
	}

	// 이름 검증
	if (!formData.name) {
		newErrors.name = "이름을 입력해주세요.";
	}

	// 학번 검증
	if (!formData.studentId) {
		newErrors.studentId = "학번을 입력해주세요.";
	} else if (!/^\d{8}$/.test(formData.studentId)) {
		newErrors.studentId = "학번은 8자리 숫자여야 합니다. (예: 22100042)";
	}

	return newErrors;
};
