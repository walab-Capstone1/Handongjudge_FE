import type React from "react";
import ProblemItem from "../ProblemItem";
import * as S from "./styles";

interface Problem {
	id: number;
	title: string;
	level?: string;
	timeLimit?: number;
	memoryLimit?: number;
	tags?: string[];
}

interface SubmissionStats {
	totalStudents: number;
	problemStats?: {
		problemId: number;
		correctSubmissions: number;
		totalStudents: number;
	}[];
}

interface UserSubmissionStatus {
	problemStatuses?: {
		problemId: number;
		hasCorrectSubmission: boolean;
		hasSubmitted: boolean;
	}[];
}

interface ProblemsListProps {
	problems: Problem[];
	assignmentId: string;
	submissionStats?: SubmissionStats;
	userSubmissionStatus?: UserSubmissionStatus;
}

/**
 * 문제 목록 컴포넌트
 * @param {Array} problems - 문제 목록
 * @param {string} assignmentId - 과제 ID
 * @param {Object} submissionStats - 제출 통계
 * @param {Object} userSubmissionStatus - 사용자별 제출 상태
 * @returns {JSX.Element} 문제 목록 JSX
 */
const ProblemsList: React.FC<ProblemsListProps> = ({
	problems,
	assignmentId,
	submissionStats,
	userSubmissionStatus,
}) => {
	if (problems.length === 0) {
		return (
			<S.NoProblems>
				<h3>등록된 문제가 없습니다</h3>
				<p>새로운 문제가 등록되면 여기에 표시됩니다.</p>
			</S.NoProblems>
		);
	}

	return (
		<S.List>
			{problems.map((problem) => (
				<ProblemItem
					key={problem.id}
					problem={problem}
					assignmentId={assignmentId}
					submissionStats={submissionStats}
					userSubmissionStatus={userSubmissionStatus}
				/>
			))}
		</S.List>
	);
};

export default ProblemsList;
