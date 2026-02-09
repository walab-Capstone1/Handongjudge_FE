import type { EnrollPageHookReturn } from "../hooks/useEnrollPage";
import * as S from "../styles";

export default function EnrollPageView(d: EnrollPageHookReturn) {
	if (d.authLoading) {
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

	if (!d.isAuthenticated) {
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
							<S.CodeBox>{d.enrollmentCode}</S.CodeBox>
						</S.CodeDisplay>
						{d.error && <S.ErrorMessage>{d.error}</S.ErrorMessage>}
						<S.Info>
							<p>이 참가 코드로 수업에 등록하시겠습니까?</p>
						</S.Info>
						<S.Actions>
							<S.CancelButton
								onClick={() => d.navigate("/main")}
								disabled={d.enrollLoading}
							>
								취소
							</S.CancelButton>
							<S.EnrollButton
								onClick={d.handleEnroll}
								disabled={d.enrollLoading}
							>
								{d.enrollLoading ? "처리 중..." : "수강 신청"}
							</S.EnrollButton>
						</S.Actions>
					</S.Body>
				</S.Card>
			</S.Container>
		</S.Page>
	);
}
