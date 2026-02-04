import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { EnrollResponse } from "./types";

const EnrollPage: React.FC = () => {
	const { enrollmentCode } = useParams<{ enrollmentCode: string }>();
	const navigate = useNavigate();
	const { user, isAuthenticated, loading: authLoading } = useAuth();
	const [enrollLoading, setEnrollLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// 로그인하지 않은 경우 - 자동으로 로그인 페이지로 리다이렉트
	useEffect(() => {
		if (!authLoading && !isAuthenticated && enrollmentCode) {
			sessionStorage.setItem("pendingEnrollmentCode", enrollmentCode);
			navigate("/login", {
				state: {
					redirectTo: `/enroll/${enrollmentCode}`,
					message: "수업 참가를 위해 로그인이 필요합니다.",
				},
			});
		}
	}, [authLoading, isAuthenticated, enrollmentCode, navigate]);

	const handleEnroll = async () => {
		if (!enrollmentCode) return;

		try {
			setEnrollLoading(true);
			setError(null);

			const response: EnrollResponse =
				await APIService.enrollByCode(enrollmentCode);

			if (response.success) {
				alert(`${response.courseTitle} 수강 신청이 완료되었습니다!`);
				navigate("/main");
			} else {
				setError(response.message || "수강 신청에 실패했습니다.");
			}
		} catch (error: any) {
			console.error("수강 신청 실패:", error);
			setError(error.message || "수강 신청에 실패했습니다.");
		} finally {
			setEnrollLoading(false);
		}
	};

	// 인증 상태 확인 중
	if (authLoading) {
		return (
			<S.Page>
				<S.Container>
					<S.Card>
						<S.LoadingContainer>
							<p>인증 확인 중...</p>
						</S.LoadingContainer>
					</S.Card>
				</S.Container>
			</S.Page>
		);
	}

	// 로그인하지 않은 경우 로딩 화면 표시 (리다이렉트 중)
	if (!isAuthenticated) {
		return (
			<S.Page>
				<S.Container>
					<S.Card>
						<S.LoadingContainer>
							<p>로그인 페이지로 이동 중...</p>
						</S.LoadingContainer>
					</S.Card>
				</S.Container>
			</S.Page>
		);
	}

	return (
		<S.Page>
			<S.Container>
				<S.Card>
					<S.Header>
						<S.Title>수업 참가</S.Title>
						<S.Subtitle>참가 코드를 통해 수업에 등록합니다</S.Subtitle>
					</S.Header>

					<S.Body>
						<S.CodeDisplay>
							<label>참가 코드</label>
							<S.CodeBox>{enrollmentCode}</S.CodeBox>
						</S.CodeDisplay>

						{error && <S.ErrorMessage>{error}</S.ErrorMessage>}

						<S.Info>
							<p>이 참가 코드로 수업에 등록하시겠습니까?</p>
						</S.Info>

						<S.Actions>
							<S.CancelButton
								onClick={() => navigate("/main")}
								disabled={enrollLoading}
							>
								취소
							</S.CancelButton>
							<S.EnrollButton onClick={handleEnroll} disabled={enrollLoading}>
								{enrollLoading ? "처리 중..." : "수강 신청"}
							</S.EnrollButton>
						</S.Actions>
					</S.Body>
				</S.Card>
			</S.Container>
		</S.Page>
	);
};

export default EnrollPage;
