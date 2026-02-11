import React from "react";
import { FaCheckCircle, FaTimesCircle, FaCode } from "react-icons/fa";
import * as S from "../styles";
import type {
	CourseGradesData,
	CourseStudentEntry,
	EditingGrade,
} from "../types";

export interface GradeManagementCourseTableProps {
	courseLoading: boolean;
	courseGrades: CourseGradesData | null;
	filteredCourseStudents: CourseStudentEntry[];
	/** 전체 과제 보기에서 편집/코드 보기용 (과제만 있을 때만 전달) */
	editingGrade?: EditingGrade | null;
	setEditingGrade?: (v: EditingGrade | null) => void;
	gradeInputs?: Record<string, number | "">;
	setGradeInputs?: React.Dispatch<
		React.SetStateAction<Record<string, number | "">>
	>;
	comments?: Record<string, string>;
	onSaveGrade?: (
		assignmentId: number,
		userId: number,
		problemId: number,
		score: number | "",
		comment: string,
	) => void;
	onViewCode?: (
		assignmentId: number,
		userId: number,
		problemId: number,
	) => void;
	/** 수업 전체 보기 / 전체 퀴즈 보기에서 퀴즈 셀 편집·코드 보기 */
	onSaveGradeForQuiz?: (
		quizId: number,
		userId: number,
		problemId: number,
		score: number | "",
		comment: string,
	) => void;
	onViewCodeForQuiz?: (
		quizId: number,
		userId: number,
		problemId: number,
	) => void;
	onProblemDetail?: (problemId: number) => void;
}

export default function GradeManagementCourseTable({
	courseLoading,
	courseGrades,
	filteredCourseStudents,
	editingGrade = null,
	setEditingGrade,
	gradeInputs = {},
	setGradeInputs,
	comments = {},
	onSaveGrade,
	onViewCode,
	onSaveGradeForQuiz,
	onViewCodeForQuiz,
	onProblemDetail,
}: GradeManagementCourseTableProps) {
	return (
		<S.CourseTableContainer>
			{courseLoading ? (
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>수업 전체 성적 데이터를 불러오는 중...</p>
				</S.LoadingContainer>
			) : courseGrades?.items?.length && filteredCourseStudents.length > 0 ? (
				<S.CourseTableWithStickyRight>
					<colgroup>
						<col style={{ width: S.STICKY_COL_1_WIDTH }} />
						<col style={{ width: S.STICKY_COL_2_WIDTH }} />
						{courseGrades.items.flatMap((item) =>
							item.problems.length === 0
								? [
										<col
											key={`${item.type}-${item.id}-empty`}
											style={{ width: S.COL_PROBLEM_WIDTH }}
										/>,
										<col
											key={`${item.type}-${item.id}-total`}
											style={{ width: S.COL_SCORE_WIDTH }}
										/>,
									]
								: [
										...item.problems.map((p) => (
											<col
												key={`${item.type}-${item.id}-${p.problemId}`}
												style={{ width: S.COL_PROBLEM_WIDTH }}
											/>
										)),
										<col
											key={`${item.type}-${item.id}-total`}
											style={{ width: S.COL_SCORE_WIDTH }}
										/>,
									],
						)}
						<col style={{ width: S.STICKY_RIGHT_TOTAL_WIDTH }} />
						<col style={{ width: S.STICKY_RIGHT_RATIO_WIDTH }} />
					</colgroup>
					<thead>
						<tr>
							<th rowSpan={2}>학생</th>
							<th rowSpan={2}>학번</th>
							{courseGrades.items.map((item) => {
								const colSpan =
									item.problems.length > 0 ? item.problems.length + 1 : 2;
								return item.type === "quiz" ? (
									<S.CourseQuizHeader
										key={`${item.type}-${item.id}`}
										colSpan={colSpan}
									>
										<div>
											<S.ItemTitle>
												<S.ItemTypeBadge>퀴즈</S.ItemTypeBadge>
												{item.title}
											</S.ItemTitle>
										</div>
									</S.CourseQuizHeader>
								) : (
									<S.CourseAssignmentHeader
										key={`${item.type}-${item.id}`}
										colSpan={colSpan}
									>
										<div>
											<S.ItemTitle>{item.title}</S.ItemTitle>
										</div>
									</S.CourseAssignmentHeader>
								);
							})}
							<th rowSpan={2}>전체 총점</th>
							<th rowSpan={2}>비율</th>
						</tr>
						<tr>
							{courseGrades.items.map((item) => (
								<React.Fragment key={`${item.type}-${item.id}-problems`}>
									{item.problems.length === 0 ? (
										<S.ProblemHeader as="th">과제</S.ProblemHeader>
									) : null}
									{item.problems.map((problem) => (
										<S.ProblemHeader
											key={`${item.type}-${item.id}-${problem.problemId}`}
											as="th"
										>
											{onProblemDetail ? (
												<button
													type="button"
													onClick={() => onProblemDetail(problem.problemId)}
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
													<S.ProblemTitle>
														{problem.problemTitle ?? ""}
													</S.ProblemTitle>
												</button>
											) : (
												<>
													<S.ProblemTitle>
														{problem.problemTitle ?? ""}
													</S.ProblemTitle>
												</>
											)}
										</S.ProblemHeader>
									))}
									<S.CourseAssignmentTotalHeader
										key={`${item.type}-${item.id}-total`}
										as="th"
									>
										총점
									</S.CourseAssignmentTotalHeader>
								</React.Fragment>
							))}
						</tr>
					</thead>
					<tbody>
						{filteredCourseStudents.map((student) => {
							let totalScore = 0;
							let totalPoints = 0;
							for (const item of courseGrades.items) {
								if (item.type === "assignment") {
									const data = student.assignments?.[item.id];
									if (data) {
										totalScore += data.totalScore;
										totalPoints += data.totalPoints;
									}
								} else if (item.type === "quiz") {
									const data = student.quizzes?.[item.id];
									if (data) {
										totalScore += data.totalScore;
										totalPoints += data.totalPoints;
									}
								}
							}
							const ratio =
								totalPoints > 0
									? `${((totalScore / totalPoints) * 100).toFixed(1)}%`
									: "-";
							return (
								<tr key={student.userId}>
									<S.TdStudentName>{student.studentName}</S.TdStudentName>
									<S.TdStudentId>{student.studentId}</S.TdStudentId>
									{courseGrades.items.map((item) => {
										if (item.type === "assignment") {
											const assignmentData = student.assignments?.[item.id];
											return (
												<React.Fragment
													key={`${student.userId}-assignment-${item.id}`}
												>
													{item.problems.length === 0 ? (
														<S.TdCourseProblemCell>
															<span style={{ color: "#94a3b8" }}>
																과제 없음
															</span>
														</S.TdCourseProblemCell>
													) : (
														item.problems.map((problem) => {
															const problemGrade =
																assignmentData?.problems?.[problem.problemId];
															return (
																<S.TdCourseProblemCell
																	key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
																>
																	<S.ScoreDisplay>
																		<S.ScoreRow>
																			<S.ScoreValue>
																				{problemGrade?.score ?? 0} /{" "}
																				{problem.points ?? 1}
																			</S.ScoreValue>
																			{problemGrade?.submitted &&
																				onViewCode && (
																					<button
																						type="button"
																						onClick={() =>
																							onViewCode(
																								item.id,
																								student.userId,
																								problem.problemId,
																							)
																						}
																						title="코드 조회"
																					>
																						<FaCode />
																					</button>
																				)}
																			{(problemGrade?.submitted ||
																				(item.dueAt &&
																					new Date() > new Date(item.dueAt))) &&
																				(problemGrade?.submitted ? (
																					<S.SubmissionStatus
																						$onTime={problemGrade.isOnTime}
																					>
																						{problemGrade.isOnTime ? (
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
																</S.TdCourseProblemCell>
															);
														})
													)}
													<S.TdCourseAssignmentTotalCell>
														{assignmentData ? (
															<strong>
																{assignmentData.totalScore} /{" "}
																{assignmentData.totalPoints}
															</strong>
														) : (
															"-"
														)}
													</S.TdCourseAssignmentTotalCell>
												</React.Fragment>
											);
										}
										if (item.type === "quiz") {
											const quizData = student.quizzes?.[item.id];
											return (
												<React.Fragment
													key={`${student.userId}-quiz-${item.id}`}
												>
													{item.problems.map((problem) => {
														const problemGrade =
															quizData?.problems?.[problem.problemId];
														return (
															<S.TdCourseProblemCell
																key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
															>
																<S.ScoreDisplay>
																	<S.ScoreRow>
																		<S.ScoreValue>
																			{problemGrade?.score ?? 0} /{" "}
																			{problem.points ?? 1}
																		</S.ScoreValue>
																		{problemGrade?.submitted &&
																			onViewCodeForQuiz && (
																				<button
																					type="button"
																					onClick={() =>
																						onViewCodeForQuiz(
																							item.id,
																							student.userId,
																							problem.problemId,
																						)
																					}
																					title="코드 조회"
																				>
																					<FaCode />
																				</button>
																			)}
																		{(problemGrade?.submitted ||
																			(item.dueAt &&
																				new Date() > new Date(item.dueAt))) &&
																			(problemGrade?.submitted ? (
																				<S.SubmissionStatus
																					$onTime={problemGrade.isOnTime}
																				>
																					{problemGrade.isOnTime ? (
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
															</S.TdCourseProblemCell>
														);
													})}
													<S.TdCourseAssignmentTotalCell>
														{quizData ? (
															<strong>
																{quizData.totalScore} / {quizData.totalPoints}
															</strong>
														) : (
															"-"
														)}
													</S.TdCourseAssignmentTotalCell>
												</React.Fragment>
											);
										}
										return null;
									})}
									<td>
										<strong>
											{totalScore} / {totalPoints}
										</strong>
									</td>
									<td>{ratio}</td>
								</tr>
							);
						})}
					</tbody>
				</S.CourseTableWithStickyRight>
			) : (
				<S.NoData>
					<p>수업 전체 성적 데이터가 없습니다.</p>
				</S.NoData>
			)}
		</S.CourseTableContainer>
	);
}
