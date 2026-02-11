import type React from "react";
import * as S from "./styles";

interface Problem {
	id: number;
	title: string;
	order: number;
}

interface ProblemSelectModalProps {
	isOpen: boolean;
	problems: Problem[];
	currentProblemId: number | null;
	onClose: () => void;
	onSelectProblem: (problemId: number) => void;
}

const ProblemSelectModal: React.FC<ProblemSelectModalProps> = ({
	isOpen,
	problems,
	currentProblemId,
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

	return (
		<S.Backdrop onClick={handleBackdropClick}>
			<S.Modal onClick={(e) => e.stopPropagation()}>
				<S.Header>
					<S.Title>문제 선택</S.Title>
					<S.CloseButton onClick={onClose}>✕</S.CloseButton>
				</S.Header>
				<S.Notice>
					⚠️ 다른 문제로 이동하기 전에 저장하기(Ctrl+S)를 눌러주세요!
				</S.Notice>
				<S.ProblemList>
					{problems.map((problem, index) => (
						<S.ProblemItem
							key={problem.id}
							$active={problem.id === currentProblemId}
							onClick={() => handleProblemClick(problem.id)}
						>
							<S.ProblemNumber>문제 {index + 1}</S.ProblemNumber>
							<S.ProblemTitle>{problem.title}</S.ProblemTitle>
						</S.ProblemItem>
					))}
				</S.ProblemList>
			</S.Modal>
		</S.Backdrop>
	);
};

export default ProblemSelectModal;
