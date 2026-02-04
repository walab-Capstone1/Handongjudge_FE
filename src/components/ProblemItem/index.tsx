import type React from "react";
import { Link, useLocation } from "react-router-dom";
import { removeCopyLabel } from "../../utils/problemUtils";
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

interface ProblemItemProps {
	problem: Problem;
	assignmentId: string;
	submissionStats?: SubmissionStats;
	userSubmissionStatus?: UserSubmissionStatus;
}

const ProblemItem: React.FC<ProblemItemProps> = ({
	problem,
	assignmentId,
	submissionStats,
	userSubmissionStatus,
}) => {
	const location = useLocation();

	// URL에서 sectionId 추출
	const urlParts = location.pathname.split("/");
	const sectionIndex = urlParts.indexOf("sections");
	const sectionId = sectionIndex !== -1 ? urlParts[sectionIndex + 1] : null;

	// 이 문제의 제출 현황 계산 (정답을 맞춘 학생 수 기준)
	const getSubmissionStatus = (): string => {
		if (!submissionStats || !submissionStats.problemStats) {
			return "0명 완료";
		}

		const problemStat = submissionStats.problemStats.find(
			(stat) => stat.problemId === problem.id,
		);

		if (problemStat) {
			// 정답을 맞춘 학생 수를 표시 (AssignmentStudentProgress와 동일한 기준)
			return `${problemStat.correctSubmissions || 0}/${problemStat.totalStudents}명 완료`;
		}

		return `0/${submissionStats.totalStudents || 0}명 완료`;
	};

	// 사용자의 이 문제 제출 상태 확인
	const getUserSubmissionStatus = () => {
		if (!userSubmissionStatus || !userSubmissionStatus.problemStatuses) {
			return null;
		}

		const problemStatus = userSubmissionStatus.problemStatuses.find(
			(status) => status.problemId === problem.id,
		);

		return problemStatus;
	};

	const userStatus = getUserSubmissionStatus();

	return (
		<Link
			to={`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problem.id}`}
			style={{ textDecoration: "none", color: "inherit", display: "block" }}
		>
			<S.Item>
				<S.Info>
					<S.Title>{removeCopyLabel(problem.title)}</S.Title>
					<S.Meta>
						<S.Level>{problem.level || "Level 1"}</S.Level>
						<S.Completed>{getSubmissionStatus()}</S.Completed>
					</S.Meta>

					{/* Problem Limits */}
					{(problem.timeLimit || problem.memoryLimit) && (
						<S.Limits>
							{problem.timeLimit && (
								<S.LimitBadge $type="time">
									시간 제한: {problem.timeLimit}초
								</S.LimitBadge>
							)}
							{problem.memoryLimit && (
								<S.LimitBadge $type="memory">
									메모리 제한: {problem.memoryLimit}MB
								</S.LimitBadge>
							)}
						</S.Limits>
					)}
				</S.Info>

				<S.Icons>
					{userStatus && (
						<S.SubmissionStatus
							$status={
								userStatus.hasCorrectSubmission
									? "correct"
									: userStatus.hasSubmitted
										? "submitted"
										: "not-submitted"
							}
						>
							{userStatus.hasCorrectSubmission
								? "정답"
								: userStatus.hasSubmitted
									? "제출함"
									: "미제출"}
						</S.SubmissionStatus>
					)}

					{problem.tags &&
						problem.tags.map((tag, index) => (
							<S.TagIcon key={index}>{/* Tag icon placeholder */}</S.TagIcon>
						))}
				</S.Icons>
			</S.Item>
		</Link>
	);
};

export default ProblemItem;
