import type React from "react";
import * as M from "../../../../Course/CodingQuiz/CodingQuizSolvePage/ProblemSelectModal/styles";

interface AssignmentItem {
	id: number;
	title: string;
}

interface AssignmentSelectModalProps {
	isOpen: boolean;
	assignments: AssignmentItem[];
	currentAssignmentId: number | null;
	isChanging?: boolean;
	onClose: () => void;
	onSelectAssignment: (assignmentId: number) => void;
}

const AssignmentSelectModal: React.FC<AssignmentSelectModalProps> = ({
	isOpen,
	assignments,
	currentAssignmentId,
	isChanging = false,
	onClose,
	onSelectAssignment,
}) => {
	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<M.Backdrop onClick={handleBackdropClick}>
			<M.Modal onClick={(e) => e.stopPropagation()}>
				<M.Header>
					<M.Title>과제 이동</M.Title>
					<M.CloseButton onClick={onClose}>✕</M.CloseButton>
				</M.Header>
				<M.Notice>
					선택한 과제의 첫 번째 문제로 이동합니다. 저장되지 않은 코드가 있으면
					확인합니다.
				</M.Notice>
				<M.ProblemList>
					{assignments.map((a, index) => (
						<M.ProblemItem
							key={a.id}
							$active={a.id === currentAssignmentId}
							onClick={() => {
								if (!isChanging) onSelectAssignment(a.id);
							}}
						>
							<M.ProblemNumber>과제 {index + 1}</M.ProblemNumber>
							<M.ProblemTitle>{a.title}</M.ProblemTitle>
						</M.ProblemItem>
					))}
				</M.ProblemList>
			</M.Modal>
		</M.Backdrop>
	);
};

export default AssignmentSelectModal;
