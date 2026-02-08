import type React from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

interface Problem {
	id: number;
	title: string;
	completed?: boolean;
}

interface AssignmentProblemsListProps {
	problems?: Problem[];
	showIndicator?: boolean;
	sectionId?: string | number;
	assignmentId?: string | number;
}

/**
 * 대시보드용 과제 문제 목록 컴포넌트
 * @param {Array} problems - 문제 목록
 * @param {boolean} showIndicator - 인디케이터 표시 여부
 * @param {string} sectionId - 섹션 ID
 * @param {string} assignmentId - 과제 ID
 */
const AssignmentProblemsList: React.FC<AssignmentProblemsListProps> = ({
	problems = [],
	showIndicator = true,
	sectionId,
	assignmentId,
}) => {
	const navigate = useNavigate();

	const handleProblemClick = (problemId: number) => {
		if (sectionId && assignmentId && problemId) {
			navigate(
				`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problemId}`,
			);
		}
	};

	if (problems.length === 0) {
		return (
			<S.List>
				<S.NoProblemsMessage>
					<span>문제 정보를 불러올 수 없습니다.</span>
				</S.NoProblemsMessage>
			</S.List>
		);
	}

	return (
		<S.List>
			{showIndicator && <S.Indicator />}
			<S.Items>
				{problems.map((problem, index) => (
					<S.ProblemRow
						key={problem.id || index}
						$completed={problem.completed}
						onClick={() => handleProblemClick(problem.id)}
					>
						<S.Bullet>•</S.Bullet>
						<S.ProblemTitle>{problem.title}</S.ProblemTitle>
					</S.ProblemRow>
				))}
			</S.Items>
		</S.List>
	);
};

export default AssignmentProblemsList;
