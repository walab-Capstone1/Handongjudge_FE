import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import styled from "styled-components";

const AuthCallback: React.FC = () => {
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
					console.log("Received access token:", accessToken);

					try {
						const tokenManager = await import("../../../utils/tokenManager");
						tokenManager.default.setAccessToken(accessToken);
						console.log("Access token saved to memory");

						const response = await fetch(
							`${process.env.REACT_APP_API_URL || "http://localhost:8080/api"}/user/me`,
							{
								headers: {
									Authorization: `Bearer ${accessToken}`,
									"Content-Type": "application/json",
								},
							},
						);

						if (response.ok) {
							const userInfo = await response.json();
							console.log("소셜 로그인 성공:", userInfo);

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
									if (enrollResponse && (enrollResponse as any).success) {
										setStatus(
											`${(enrollResponse as any).courseTitle} 수강 신청이 완료되었습니다!`,
										);
										setTimeout(() => {
											window.location.href = "/main";
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
									(location.state as any)?.redirectTo;

								if (redirectTo) {
									setStatus("소셜 로그인 성공! 이동합니다.");
									setTimeout(() => {
										window.location.href = redirectTo;
									}, 1500);
								} else {
									setStatus("소셜 로그인 성공! 인덱스 페이지로 이동합니다.");
									setTimeout(() => {
										window.location.href = "/index";
									}, 1500);
								}
							}
						} else {
							const errorData = await response.json();
							throw new Error(errorData.message || "사용자 정보 조회 실패");
						}
					} catch (socialError: any) {
						console.error("Social login error:", socialError);
						setStatus(`소셜 로그인 실패: ${socialError.message}`);
						setTimeout(() => navigate("/login"), 3000);
					}
					return;
				}

				const { type, email, password } = (location.state as any) || {};

				if (!type) {
					setStatus("잘못된 접근입니다.");
					setTimeout(() => navigate("/login"), 2000);
					return;
				}

				if (type === "login") {
					setStatus("로그인 중...");
					await login(email, password);

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
							if (enrollResponse && (enrollResponse as any).success) {
								setStatus(
									`${(enrollResponse as any).courseTitle} 수강 신청이 완료되었습니다!`,
								);
								setTimeout(() => navigate("/main"), 1500);
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
						const redirectTo = (location.state as any)?.redirectTo;
						if (redirectTo) {
							setStatus("로그인 성공! 이동합니다.");
							setTimeout(() => navigate(redirectTo), 1500);
						} else {
							setStatus("로그인 성공! 인덱스 페이지로 이동합니다.");
							setTimeout(() => navigate("/index"), 1500);
						}
					}
				}
			} catch (error: any) {
				console.error("Auth callback error:", error);
				setStatus(`로그인 실패: ${error.message}`);
				setTimeout(() => navigate("/login"), 3000);
			}
		};

		handleAuth();
	}, [location.state, login, navigate]);

	return (
		<CallbackContainer>
			<CallbackCard>
				<LoadingSpinner />
				<StatusText>{status}</StatusText>
				{error && <ErrorMessage>{error}</ErrorMessage>}
			</CallbackCard>
		</CallbackContainer>
	);
};

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CallbackCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 60px 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusText = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-top: 10px;
`;

export default AuthCallback;
