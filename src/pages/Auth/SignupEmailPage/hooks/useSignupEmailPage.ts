import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../../../services/APIService";
import tokenManager from "../../../../utils/tokenManager";
import type { SignupFormData, FormErrors } from "../types";
import { validateForm } from "../utils/validation";

export function useSignupEmailPage() {
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

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value } = e.target;
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
			setErrors((prev) => {
				const next = { ...prev };
				if (name in next) delete next[name as keyof FormErrors];
				return next;
			});
		},
		[],
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
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
			} catch (error: unknown) {
				console.error("회원가입 오류:", error);
				const message = error instanceof Error ? error.message : "";
				if (message.includes("이미 존재하는 이메일")) {
					setErrors((prev) => ({
						...prev,
						email: "이미 사용 중인 이메일입니다.",
					}));
				} else {
					alert(message || "회원가입에 실패했습니다. 다시 시도해주세요.");
				}
			} finally {
				setLoading(false);
			}
		},
		[formData, navigate],
	);

	const handleBackToLogin = useCallback(() => {
		navigate("/");
	}, [navigate]);

	const setShowPasswordToggle = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	const setShowPasswordConfirmToggle = useCallback(() => {
		setShowPasswordConfirm((prev) => !prev);
	}, []);

	return {
		formData,
		loading,
		showPassword,
		showPasswordConfirm,
		errors,
		handleInputChange,
		handleSubmit,
		handleBackToLogin,
		setShowPasswordToggle,
		setShowPasswordConfirmToggle,
	};
}

export type SignupEmailPageHookReturn = ReturnType<typeof useSignupEmailPage>;
