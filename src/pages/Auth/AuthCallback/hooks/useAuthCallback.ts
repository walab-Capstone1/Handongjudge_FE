import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import APIService from "../../../../services/APIService";

export function useAuthCallback() {
	const location = useLocation();
	const navigate = useNavigate();
	const { login, error } = useAuth();
	const [status, setStatus] = useState("처리 중...");
	const hasProcessed = useRef(false);

	useEffect(() => {
		if (hasProcessed.current) return;

		const handleAuth = async () => {
			try {
				hasProcessed.current = true;

				const urlParams = new URLSearchParams(window.location.search);
				const accessToken = urlParams.get("accessToken");
				const refreshToken = urlParams.get("refreshToken");

				if (accessToken) {
					setStatus("소셜 로그인 처리 중...");

					try {
						const tokenManager = await import("../../../../utils/tokenManager");
						tokenManager.default.setAccessToken(accessToken);

						const response = await fetch(
							`${process.env.REACT_APP_API_URL || "http://10.10.200.10:8080/api"}/user/me`,
							{
								headers: {
									Authorization: `Bearer ${accessToken}`,
									"Content-Type": "application/json",
								},
							},
						);

						if (response.ok) {
							const userInfo = await response.json();

							const pendingEnrollmentCode = sessionStorage.getItem(
								"pendingEnrollmentCode",
							);

							if (pendingEnrollmentCode) {
								sessionStorage.removeItem("pendingEnrollmentCode");
								setStatus("소셜 로그인 성공! 수업 참가 처리 중...");
								try {
									const enrollResponse = await APIService.enrollByCode(
										pendingEnrollmentCode,
									);
									const data = enrollResponse as {
										success?: boolean;
										courseTitle?: string;
									};
									if (data?.success) {
										setStatus(
											`${data.courseTitle ?? ""} 수강 신청이 완료되었습니다!`,
										);
										setTimeout(() => {
											window.location.href = "/courses";
										}, 1500);
									} else {
										setStatus("수업 참가 처리 중...");
										setTimeout(() => {
											window.location.href = `/enroll/${pendingEnrollmentCode}`;
										}, 1500);
									}
								} catch (enrollError) {
									console.error("수업 참가 실패:", enrollError);
									setStatus("수업 참가 페이지로 이동합니다.");
									setTimeout(() => {
										window.location.href = `/enroll/${pendingEnrollmentCode}`;
									}, 1500);
								}
							} else {
								const redirectTo =
									urlParams.get("redirectTo") ||
									(location.state as { redirectTo?: string } | null)
										?.redirectTo;

								if (redirectTo) {
									setStatus("소셜 로그인 성공! 이동합니다.");
									setTimeout(() => {
										window.location.href = redirectTo;
									}, 1500);
								} else {
									setStatus("소셜 로그인 성공! 강의실 목록으로 이동합니다.");
									setTimeout(() => {
										window.location.href = "/courses";
									}, 1500);
								}
							}
						} else {
							const errorData = await response.json();
							throw new Error(errorData.message || "사용자 정보 조회 실패");
						}
					} catch (socialError: unknown) {
						console.error("Social login error:", socialError);
						setStatus(
							`소셜 로그인 실패: ${socialError instanceof Error ? socialError.message : String(socialError)}`,
						);
						setTimeout(() => navigate("/login"), 3000);
					}
					return;
				}

				const { type, email, password } =
					(location.state as {
						type?: string;
						email?: string;
						password?: string;
					}) || {};

				if (!type) {
					setStatus("잘못된 접근입니다.");
					setTimeout(() => navigate("/login"), 2000);
					return;
				}

				if (type === "login") {
					setStatus("로그인 중...");
					const result = await login(email ?? "", password ?? "");

					if (!result?.success) {
						const err = (result as { error?: { message?: string } })?.error;
						const errMsg =
							(typeof err === "object" && err?.message) ||
							error ||
							"이메일 또는 비밀번호를 확인해주세요.";
						setStatus(`로그인 실패: ${errMsg}`);
						setTimeout(() => navigate("/login", { replace: true }), 2000);
						return;
					}

					const pendingEnrollmentCode = sessionStorage.getItem(
						"pendingEnrollmentCode",
					);

					if (pendingEnrollmentCode) {
						sessionStorage.removeItem("pendingEnrollmentCode");
						setStatus("로그인 성공! 수업 참가 처리 중...");
						try {
							const enrollResponse = await APIService.enrollByCode(
								pendingEnrollmentCode,
							);
							const data = enrollResponse as {
								success?: boolean;
								courseTitle?: string;
							};
							if (data?.success) {
								setStatus(
									`${data.courseTitle ?? ""} 수강 신청이 완료되었습니다!`,
								);
								setTimeout(() => navigate("/courses"), 1500);
							} else {
								setStatus("수업 참가 처리 중...");
								setTimeout(
									() => navigate(`/enroll/${pendingEnrollmentCode}`),
									1500,
								);
							}
						} catch (enrollError) {
							console.error("수업 참가 실패:", enrollError);
							setStatus("수업 참가 페이지로 이동합니다.");
							setTimeout(
								() => navigate(`/enroll/${pendingEnrollmentCode}`),
								1500,
							);
						}
					} else {
						const redirectTo = (
							location.state as { redirectTo?: string } | null
						)?.redirectTo;
						if (redirectTo) {
							setStatus("로그인 성공! 이동합니다.");
							setTimeout(() => navigate(redirectTo), 1500);
						} else {
							setStatus("로그인 성공! 강의실 목록으로 이동합니다.");
							setTimeout(() => navigate("/courses"), 1500);
						}
					}
				}
			} catch (err: unknown) {
				console.error("Auth callback error:", err);
				setStatus(
					`로그인 실패: ${err instanceof Error ? err.message : String(err)}`,
				);
				setTimeout(() => navigate("/login"), 3000);
			}
		};

		handleAuth();
	}, [location.state, login, navigate]);

	return { status, error };
}

export type AuthCallbackHookReturn = ReturnType<typeof useAuthCallback>;
