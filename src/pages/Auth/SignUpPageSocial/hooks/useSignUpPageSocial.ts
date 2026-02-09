import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useSignUpPageSocial() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);

	const handleSocialSignUp = useCallback(
		async (_provider: string) => {
			setLoading(true);
			try {
				navigate("/main");
			} catch (error) {
				console.error("로그인 오류:", error);
				alert("로그인에 실패했습니다.");
			} finally {
				setLoading(false);
			}
		},
		[navigate],
	);

	const handleEmailSignUp = useCallback(() => {
		navigate("/signup/email");
	}, [navigate]);

	const handleBackToLogin = useCallback(() => {
		navigate("/");
	}, [navigate]);

	return {
		loading,
		handleSocialSignUp,
		handleEmailSignUp,
		handleBackToLogin,
	};
}

export type SignUpPageSocialHookReturn = ReturnType<typeof useSignUpPageSocial>;
