import type React from "react";
import { FaCode, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import * as S from "../styles";
import type { StudentGradeRow, EditingGrade, AssignmentItem } from "../types";

export interface GradeManagementAssignmentTableProps {
	grades: StudentGradeRow[];
	filteredGrades: StudentGradeRow[];
	selectedAssignment: AssignmentItem | null;
	editingGrade: EditingGrade | null;
	setEditingGrade: (v: EditingGrade | null) => void;
	gradeInputs: Record<string, number | "">;
	setGradeInputs: React.Dispatch<
		React.SetStateAction<Record<string, number | "">>
	>;
	comments: Record<string, string>;
	handleSaveGrade: (
		userId: number,
		problemId: number,
		score: number | "",
		comment: string,
	) => void;
	handleViewCode: (userId: number, problemId: number) => void;
}

export default function GradeManagementAssignmentTable({
	grades,
	filteredGrades,
	selectedAssignment,
	editingGrade,
	setEditingGrade,
	gradeInputs,
	setGradeInputs,
	comments,
	handleSaveGrade,
	handleViewCode,
}: GradeManagementAssignmentTableProps) {
	const hasProblems =
		grades[0]?.problemGrades && grades[0].problemGrades.length > 0;

	const problemGradesForCol = grades[0]?.problemGrades ?? [];
	const assignmentDue =
		selectedAssignment?.dueDate ??
		selectedAssignment?.endDate ??
		selectedAssignment?.deadline;

	return (
		<S.CourseTableContainer>
			<S.CourseTableWithStickyRight>
				<colgroup>
					<col style={{ width: S.STICKY_COL_1_WIDTH }} />
					<col style={{ width: S.STICKY_COL_2_WIDTH }} />
					{hasProblems
						? problemGradesForCol.map((p) => (
								<col key={p.problemId} style={{ width: S.COL_PROBLEM_WIDTH }} />
							))
						: [<col key="no-problem" style={{ width: S.COL_PROBLEM_WIDTH }} />]}
					<col style={{ width: S.COL_SCORE_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_TOTAL_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_RATIO_WIDTH }} />
				</colgroup>
				<thead>
					{hasProblems ? (
						<>
							<tr>
								<th rowSpan={2}>학생</th>
								<th rowSpan={2}>학번</th>
								<S.CourseAssignmentHeader
									as="th"
									colSpan={problemGradesForCol.length}
								>
									<S.ItemTitle>
										{selectedAssignment?.title ?? "과제"}
									</S.ItemTitle>
								</S.CourseAssignmentHeader>
								<th rowSpan={2}>총점</th>
								<th rowSpan={2}>전체 총점</th>
								<th rowSpan={2}>비율</th>
							</tr>
							<tr>
								{grades[0]?.problemGrades?.map((p) => (
									<S.ProblemHeader key={p.problemId} as="th">
										<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
										<S.ProblemPoints>({p.points ?? 0}점)</S.ProblemPoints>
									</S.ProblemHeader>
								))}
							</tr>
						</>
					) : (
						<tr>
							<th>학생</th>
							<th>학번</th>
							<S.CourseAssignmentHeader as="th">
								<S.ItemTitle>과제</S.ItemTitle>
							</S.CourseAssignmentHeader>
							<th>총점</th>
							<th>전체 총점</th>
							<th>비율</th>
						</tr>
					)}
				</thead>
				<tbody>
					{filteredGrades.map((student) => {
						const totalScore = student.totalScore ?? 0;
						const totalPoints = student.totalPoints ?? 0;
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{hasProblems ? (
									student.problemGrades?.map((problem) => {
										const key = `${student.userId}-${problem.problemId}`;
										const isEditing =
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
												{isEditing ? (
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
																	handleSaveGrade(
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
															{problem.submitted && (
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
																(assignmentDue &&
																	new Date() > new Date(assignmentDue))) &&
																(problem.submitted ? (
																	<S.SubmissionStatus
																		$onTime={problem.isOnTime}
																	>
																		{problem.isOnTime ? (
																			<>
																				<FaCheckCircle />
																			</>
																		) : (
																			<>
																				<FaTimesCircle />
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
									})
								) : (
									<S.TdCourseProblemCell>
										<span style={{ color: "#94a3b8" }}>과제 없음</span>
									</S.TdCourseProblemCell>
								)}
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
