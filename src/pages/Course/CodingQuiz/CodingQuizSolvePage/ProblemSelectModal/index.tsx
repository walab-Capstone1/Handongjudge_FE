import type React from "react";
import * as S from "./styles";
import type { ProblemWorkStatus } from "../types";

interface Problem {
	id: number;
	title: string;
	order: number;
}

interface ProblemSelectModalProps {
	isOpen: boolean;
	problems: Problem[];
	currentProblemId: number | null;
	problemStatusById?: Record<number, ProblemWorkStatus>;
	/** 과제 전용: 강사 반려 태그가 있는 문제 */
	gradeRejectedByProblemId?: Record<number, boolean>;
	isChanging?: boolean;
	onClose: () => void;
	onSelectProblem: (problemId: number) => void;
}

const ProblemSelectModal: React.FC<ProblemSelectModalProps> = ({
	isOpen,
	problems,
	currentProblemId,
	problemStatusById = {},
	gradeRejectedByProblemId = {},
	isChanging = false,
	onClose,
	onSelectProblem,
}) => {
	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleProblemClick = (problemId: number) => {
		onSelectProblem(problemId);
		onClose();
	};

	const getStatusLabel = (problemId: number) => {
		const status = problemStatusById[problemId];
		if (status?.submitted) {
			if (status.result === "AC") {
				return { text: "정답", tone: "ok" as const };
			}
			return { text: "오답", tone: "bad" as const };
		}
		if (status?.saved) {
			return { text: "저장됨 (제출 필요)", tone: "warn" as const };
		}
		return { text: "미제출", tone: "idle" as const };
	};

	return (
		<S.Backdrop onClick={handleBackdropClick}>
			<S.Modal onClick={(e) => e.stopPropagation()}>
				<S.Header>
					<S.Title>문제 선택</S.Title>
					<S.CloseButton onClick={onClose}>✕</S.CloseButton>
				</S.Header>
				<S.Notice>
					⚠️ 저장은 임시 보관이며 제출을 해야 최종 반영됩니다.
				</S.Notice>
				<S.ProblemList>
					{problems.map((problem, index) => (
						<S.ProblemItem
							key={problem.id}
							$active={problem.id === currentProblemId}
							onClick={() => {
								if (!isChanging) handleProblemClick(problem.id);
							}}
						>
							<S.ProblemNumber>문제 {index + 1}</S.ProblemNumber>
							<S.ProblemTitle>{problem.title}</S.ProblemTitle>
							<S.ProblemStatus $tone={getStatusLabel(problem.id).tone}>
								{getStatusLabel(problem.id).text}
								{gradeRejectedByProblemId[problem.id] ? (
									<span
										style={{
											marginLeft: "0.45rem",
											fontSize: "0.7rem",
											fontWeight: 700,
											color: "#b91c1c",
										}}
									>
										· 반려
									</span>
								) : null}
							</S.ProblemStatus>
						</S.ProblemItem>
					))}
				</S.ProblemList>
			</S.Modal>
		</S.Backdrop>
	);
};

export default ProblemSelectModal;
