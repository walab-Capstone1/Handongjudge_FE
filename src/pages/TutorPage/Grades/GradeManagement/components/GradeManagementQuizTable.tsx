import type React from "react";
import { FaCode, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import * as S from "../styles";
import type { StudentGradeRow, QuizItem, EditingGrade } from "../types";

export interface GradeManagementQuizTableProps {
	grades: StudentGradeRow[];
	filteredGrades: StudentGradeRow[];
	selectedQuiz: QuizItem | null;
	editingGrade?: EditingGrade | null;
	setEditingGrade?: (v: EditingGrade | null) => void;
	gradeInputs?: Record<string, number | "">;
	setGradeInputs?: React.Dispatch<
		React.SetStateAction<Record<string, number | "">>
	>;
	comments?: Record<string, string>;
	handleSaveGrade?: (
		userId: number,
		problemId: number,
		score: number | "",
		comment: string,
	) => void;
	handleViewCode?: (userId: number, problemId: number) => void;
	onProblemDetail?: (problemId: number) => void;
}

export default function GradeManagementQuizTable({
	grades,
	filteredGrades,
	selectedQuiz,
	editingGrade = null,
	setEditingGrade = () => {},
	gradeInputs = {},
	setGradeInputs = () => {},
	comments = {},
	handleSaveGrade,
	handleViewCode,
	onProblemDetail,
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
			<S.CourseTableWithStickyRight>
				<colgroup>
					<col style={{ width: S.STICKY_COL_1_WIDTH }} />
					<col style={{ width: S.STICKY_COL_2_WIDTH }} />
					{problemGrades.map((p) => (
						<col key={p.problemId} style={{ width: S.COL_PROBLEM_WIDTH }} />
					))}
					<col style={{ width: S.COL_SCORE_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_TOTAL_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_RATIO_WIDTH }} />
				</colgroup>
				<thead>
					<tr>
						<th rowSpan={2}>학생</th>
						<th rowSpan={2}>학번</th>
						<S.CourseQuizHeader as="th" colSpan={problemGrades.length + 1}>
							<div>
								<S.ItemTitle>
									<S.ItemTypeBadge>퀴즈</S.ItemTypeBadge>
									{quizTitle}
								</S.ItemTitle>
							</div>
						</S.CourseQuizHeader>
						<th rowSpan={2}>전체 총점</th>
						<th rowSpan={2}>비율</th>
					</tr>
					<tr>
						{problemGrades.map((p) => (
							<S.ProblemHeader key={p.problemId} as="th">
								{onProblemDetail ? (
									<button
										type="button"
										onClick={() => onProblemDetail(p.problemId)}
										style={{
											background: "none",
											border: "none",
											cursor: "pointer",
											textAlign: "center",
											padding: 0,
											font: "inherit",
											width: "100%",
										}}
									>
										<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
									</button>
								) : (
									<>
										<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
									</>
								)}
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
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{student.problemGrades?.map((problem) => (
									<S.TdCourseProblemCell key={problem.problemId}>
										<S.ScoreDisplay>
											<S.ScoreRow>
												<S.ScoreValue>
													{problem.score ?? 0} / {problem.points ?? 1}
												</S.ScoreValue>
												{problem.submitted && handleViewCode && (
													<button
														type="button"
														onClick={() =>
															handleViewCode(student.userId, problem.problemId)
														}
														title="코드 조회"
													>
														<FaCode />
													</button>
												)}
												{(problem.submitted ||
													(selectedQuiz?.endTime &&
														new Date() > new Date(selectedQuiz.endTime))) &&
													(problem.submitted ? (
														<S.SubmissionStatus $onTime={problem.isOnTime}>
															{problem.isOnTime ? (
																<>
																	<FaCheckCircle />
																</>
															) : (
																<>
																	<FaTimesCircle /> 기한 초과
																</>
															)}
														</S.SubmissionStatus>
													) : (
														<S.SubmissionStatus $onTime={false}>
															<FaTimesCircle />
														</S.SubmissionStatus>
													))}
											</S.ScoreRow>
										</S.ScoreDisplay>
									</S.TdCourseProblemCell>
								))}
								<S.TdCourseAssignmentTotalCell>
									<strong>
										{totalScore} / {totalPoints}
									</strong>
								</S.TdCourseAssignmentTotalCell>
								<td>
									<strong>
										{totalScore} / {totalPoints}
									</strong>
								</td>
								<td>
									{totalPoints > 0
										? `${((totalScore / totalPoints) * 100).toFixed(1)}%`
										: "-"}
								</td>
							</tr>
						);
					})}
				</tbody>
			</S.CourseTableWithStickyRight>
		</S.CourseTableContainer>
	);
}
