import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import * as S from "../styles";
import type { StudentGradeRow, QuizItem } from "../types";

export interface GradeManagementQuizTableProps {
	grades: StudentGradeRow[];
	filteredGrades: StudentGradeRow[];
	selectedQuiz: QuizItem | null;
}

export default function GradeManagementQuizTable({
	grades,
	filteredGrades,
	selectedQuiz,
}: GradeManagementQuizTableProps) {
	if (grades.length === 0) {
		return (
			<S.CourseTableContainer>
				<S.NoData>
					<p>등록된 성적이 없습니다.</p>
				</S.NoData>
			</S.CourseTableContainer>
		);
	}

	const problemGrades = grades[0]?.problemGrades ?? [];
	const quizTitle = selectedQuiz?.title ?? "퀴즈";

	return (
		<S.CourseTableContainer>
			<S.CourseTable>
				<thead>
					<tr>
						<th rowSpan={2}>학생</th>
						<th rowSpan={2}>학번</th>
						<S.CourseQuizHeader as="th" colSpan={problemGrades.length + 1}>
							<S.ItemTitle>
								<S.ItemTypeBadge>퀴즈</S.ItemTypeBadge>
								{quizTitle}
							</S.ItemTitle>
						</S.CourseQuizHeader>
						<th rowSpan={2}>비율</th>
					</tr>
					<tr>
						{problemGrades.map((p) => (
							<S.ProblemHeader key={p.problemId} as="th">
								<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
								<S.ProblemPoints>({p.points ?? 0}점)</S.ProblemPoints>
							</S.ProblemHeader>
						))}
						<S.CourseAssignmentTotalHeader as="th">
							총점
						</S.CourseAssignmentTotalHeader>
					</tr>
				</thead>
				<tbody>
					{filteredGrades.map((student) => {
						const totalScore = student.totalScore ?? 0;
						const totalPoints = student.totalPoints ?? 0;
						const ratio =
							totalPoints > 0
								? ((totalScore / totalPoints) * 100).toFixed(1)
								: 0;
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{student.problemGrades?.map((problem) => (
									<S.TdCourseProblemCell key={problem.problemId}>
										<S.ScoreDisplay>
											<S.ScoreValue>
												{problem.score !== null && problem.score !== undefined
													? `${problem.score} / ${problem.points ?? 0}`
													: "-"}
											</S.ScoreValue>
											{problem.submitted && (
												<S.SubmissionInfo>
													<S.SubmissionStatus $onTime={problem.isOnTime}>
														{problem.isOnTime ? (
															<>
																<FaCheckCircle /> 제시간
															</>
														) : (
															<>
																<FaTimesCircle /> 지연
															</>
														)}
													</S.SubmissionStatus>
													{problem.submittedAt && (
														<S.SubmissionTime>
															<FaClock />{" "}
															{new Date(problem.submittedAt).toLocaleString(
																"ko-KR",
															)}
														</S.SubmissionTime>
													)}
												</S.SubmissionInfo>
											)}
										</S.ScoreDisplay>
									</S.TdCourseProblemCell>
								))}
								<S.TdCourseAssignmentTotalCell>
									<strong>
										{totalScore} / {totalPoints}
									</strong>
								</S.TdCourseAssignmentTotalCell>
								<S.TdRatioCell>
									<strong>{ratio}%</strong>
								</S.TdRatioCell>
							</tr>
						);
					})}
				</tbody>
			</S.CourseTable>
		</S.CourseTableContainer>
	);
}
