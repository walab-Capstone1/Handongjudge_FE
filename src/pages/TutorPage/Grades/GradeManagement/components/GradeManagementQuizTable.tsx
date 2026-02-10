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
	const canEdit = typeof handleSaveGrade === "function";

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
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{student.problemGrades?.map((problem) => {
									const key = `${student.userId}-${problem.problemId}`;
									const isEditing =
										canEdit &&
										editingGrade?.userId === student.userId &&
										editingGrade?.problemId === problem.problemId;
									const currentScore =
										gradeInputs[key] !== undefined
											? gradeInputs[key]
											: problem.score !== null && problem.score !== undefined
												? problem.score
												: "";
									const currentComment = comments[key] ?? "";

									return (
										<S.TdCourseProblemCell key={problem.problemId}>
											{canEdit && isEditing ? (
												<S.EditForm>
													<input
														type="number"
														min={0}
														max={problem.points ?? 100}
														value={currentScore}
														onChange={(e) => {
															const v =
																e.target.value === ""
																	? ""
																	: Number(e.target.value);
															setGradeInputs((prev) => ({
																...prev,
																[key]: v,
															}));
														}}
														placeholder="점수"
													/>
													<S.EditActions>
														<button
															type="button"
															onClick={() =>
																handleSaveGrade?.(
																	student.userId,
																	problem.problemId,
																	currentScore,
																	currentComment,
																)
															}
														>
															저장
														</button>
														<button
															type="button"
															onClick={() => {
																setEditingGrade(null);
																setGradeInputs((prev) => {
																	const next = { ...prev };
																	delete next[key];
																	return next;
																});
															}}
														>
															취소
														</button>
													</S.EditActions>
												</S.EditForm>
											) : (
												<S.ScoreDisplay>
													<S.ScoreRow>
														{canEdit ? (
															<S.ScoreValueButton
																type="button"
																onClick={() => {
																	setEditingGrade({
																		userId: student.userId,
																		problemId: problem.problemId,
																	});
																	setGradeInputs((prev) => ({
																		...prev,
																		[key]:
																			problem.score !== null &&
																			problem.score !== undefined
																				? problem.score
																				: "",
																	}));
																}}
																title="점수 입력/수정"
															>
																{`${problem.score ?? 0} / ${problem.points ?? 0}`}
															</S.ScoreValueButton>
														) : (
															<S.ScoreValue>
																{`${problem.score ?? 0} / ${problem.points ?? 0}`}
															</S.ScoreValue>
														)}
														{canEdit && problem.submitted && handleViewCode && (
															<button
																type="button"
																onClick={() =>
																	handleViewCode(
																		student.userId,
																		problem.problemId,
																	)
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
											)}
										</S.TdCourseProblemCell>
									);
								})}
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
