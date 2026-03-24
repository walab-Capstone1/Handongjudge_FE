import type { FC } from "react";
import * as S from "../../styles";
import type { CodingTestManagementHookReturn } from "../../hooks/useCodingTestManagement";

interface MainTabViewProps {
	d: CodingTestManagementHookReturn;
}

function getStatusBadge(status: string) {
	switch (status) {
		case "ACTIVE":
			return <S.StatusBadge $status="active">진행중</S.StatusBadge>;
		case "WAITING":
			return <S.StatusBadge $status="waiting">대기중</S.StatusBadge>;
		case "PAUSED":
			return <S.StatusBadge $status="paused">일시정지</S.StatusBadge>;
		case "ENDED":
			return <S.StatusBadge $status="ended">종료</S.StatusBadge>;
		default:
			return <S.StatusBadge $status={undefined}>{status ?? "-"}</S.StatusBadge>;
	}
}

const MainTabView: FC<MainTabViewProps> = ({ d }) => {
	if (!d.selectedQuizDetail) return null;

	return (
		<S.QuizInfoSection>
			<S.QuizInfoHeader>
				<S.QuizInfoTitle>코딩테스트 정보</S.QuizInfoTitle>
				<S.QuizControlButtons>
					<S.QuizControlBtn
						type="button"
						$variant="start"
						onClick={d.handleStart}
						disabled={d.selectedQuizDetail.status === "ACTIVE"}
					>
						시작
					</S.QuizControlBtn>
					<S.QuizControlBtn
						type="button"
						$variant="stop"
						onClick={d.handleStop}
						disabled={d.selectedQuizDetail.status !== "ACTIVE"}
					>
						정지
					</S.QuizControlBtn>
					<S.QuizControlBtn
						type="button"
						$variant="end"
						onClick={d.handleEnd}
						disabled={d.selectedQuizDetail.status === "ENDED"}
					>
						종료
					</S.QuizControlBtn>
				</S.QuizControlButtons>
			</S.QuizInfoHeader>
			<S.QuizInfoGrid>
				<S.InfoItem>
					<S.InfoLabel>제목</S.InfoLabel>
					<S.InfoValue>{d.selectedQuizDetail.title}</S.InfoValue>
				</S.InfoItem>
				<S.InfoItem>
					<S.InfoLabel>설명</S.InfoLabel>
					<S.InfoValue>{d.selectedQuizDetail.description ?? "-"}</S.InfoValue>
				</S.InfoItem>
				<S.InfoItem>
					<S.InfoLabel>시작 시간</S.InfoLabel>
					<S.InfoValue>{d.formatDateTime(d.selectedQuizDetail.startTime)}</S.InfoValue>
				</S.InfoItem>
				<S.InfoItem>
					<S.InfoLabel>종료 시간</S.InfoLabel>
					<S.InfoValue>{d.formatDateTime(d.selectedQuizDetail.endTime)}</S.InfoValue>
				</S.InfoItem>
				<S.InfoItem>
					<S.InfoLabel>상태</S.InfoLabel>
					<S.InfoValue>{getStatusBadge(d.selectedQuizDetail.status ?? "")}</S.InfoValue>
				</S.InfoItem>
				<S.InfoItem>
					<S.InfoLabel>문제 수</S.InfoLabel>
					<S.InfoValue>{d.problems.length}개</S.InfoValue>
				</S.InfoItem>
				<S.InfoItem>
					<S.InfoLabel>공개 상태</S.InfoLabel>
					<S.InfoValue>
						<S.ActiveToggle
							type="button"
							$active={d.selectedQuizDetail.active !== false}
							aria-pressed={d.selectedQuizDetail.active !== false}
							onClick={() => {
								if (d.sectionId && d.selectedQuizDetail) {
									const quizId = Number(d.quizId);
									d.handleToggleActive(
										Number(d.sectionId),
										quizId,
										d.selectedQuizDetail.active,
									);
								}
							}}
						>
							<S.ActiveToggleTrack $active={d.selectedQuizDetail.active !== false}>
								<S.ActiveToggleThumb $active={d.selectedQuizDetail.active !== false} />
							</S.ActiveToggleTrack>
							<S.ActiveToggleLabel>
								{d.selectedQuizDetail.active !== false
									? "공개"
									: "비공개"}
							</S.ActiveToggleLabel>
						</S.ActiveToggle>
					</S.InfoValue>
				</S.InfoItem>
			</S.QuizInfoGrid>
		</S.QuizInfoSection>
	);
};

export default MainTabView;
