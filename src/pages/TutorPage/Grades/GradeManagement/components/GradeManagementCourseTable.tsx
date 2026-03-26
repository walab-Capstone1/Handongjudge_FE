import React from "react";
import * as S from "../styles";
import type {
	CourseGradesData,
	CourseStudentEntry,
	EditingGrade,
} from "../types";
import type { StudentSortDir, StudentSortKey } from "../../../../../utils/studentSort";
import { SortableStudentColumnHeader } from "../../../../../components/SortableStudentColumnHeader";
import {
	GradeProblemCellDisplay,
	GradeStatusLegendBar,
} from "./GradeProblemCellDisplay";

export interface GradeManagementCourseTableProps {
	courseLoading: boolean;
	courseGrades: CourseGradesData | null;
	filteredCourseStudents: CourseStudentEntry[];
	gradeSortKey: StudentSortKey;
	gradeSortDir: StudentSortDir;
	onSortStudentHeader: (key: StudentSortKey) => void;
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
	totalOnly?: boolean;
	onToggleTotalOnly?: (v: boolean) => void;
	showLateOnly?: boolean;
	onToggleShowLateOnly?: (v: boolean) => void;
}

export default function GradeManagementCourseTable({
	courseLoading,
	courseGrades,
	filteredCourseStudents,
	gradeSortKey,
	gradeSortDir,
	onSortStudentHeader,
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
	totalOnly = false,
	onToggleTotalOnly,
	showLateOnly = false,
	onToggleShowLateOnly,
}: GradeManagementCourseTableProps) {
	return (
		<S.GradeTablePageWrapper>
			{!courseLoading && courseGrades?.items?.length && filteredCourseStudents.length > 0 && (
				<GradeStatusLegendBar
					totalOnly={totalOnly}
					onToggleTotalOnly={onToggleTotalOnly}
					showLateOnly={showLateOnly}
					onToggleShowLateOnly={onToggleShowLateOnly}
				/>
			)}
			{courseLoading ? (
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>수업 전체 성적 데이터를 불러오는 중...</p>
				</S.LoadingContainer>
			) : courseGrades?.items?.length && filteredCourseStudents.length > 0 ? (
				<S.GradeTableHorizontalScroll>
				<S.CourseTableWithStickyRight>
					<colgroup>
						<col style={{ width: S.STICKY_COL_1_WIDTH }} />
						<col style={{ width: S.STICKY_COL_2_WIDTH }} />
						{courseGrades.items.flatMap((item) => {
							if (totalOnly) {
								return [
									<col
										key={`${item.type}-${item.id}-total-only`}
										style={{ width: S.COL_SCORE_WIDTH }}
									/>,
								];
							}
							return item.problems.length === 0
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
									];
						})}
						<col style={{ width: S.STICKY_RIGHT_TOTAL_WIDTH }} />
						<col style={{ width: S.STICKY_RIGHT_RATIO_WIDTH }} />
					</colgroup>
					<thead>
						<tr>
							<S.SortableStudentHeaderTh
								rowSpan={2}
								scope="col"
								onClick={() => onSortStudentHeader("studentName")}
								title="이름순 정렬 (클릭 시 오름·내림)"
							>
								<SortableStudentColumnHeader
									label="학생"
									sortKey="studentName"
									activeKey={gradeSortKey}
									dir={gradeSortDir}
								/>
							</S.SortableStudentHeaderTh>
							<S.SortableStudentHeaderTh
								rowSpan={2}
								scope="col"
								onClick={() => onSortStudentHeader("studentId")}
								title="학번순 정렬 (클릭 시 오름·내림)"
							>
								<SortableStudentColumnHeader
									label="학번"
									sortKey="studentId"
									activeKey={gradeSortKey}
									dir={gradeSortDir}
								/>
							</S.SortableStudentHeaderTh>
							{courseGrades.items.map((item) => {
								const colSpan = totalOnly
									? 1
									: item.problems.length > 0
										? item.problems.length + 1
										: 2;
								return item.type === "quiz" ? (
									<S.CourseQuizHeader
										key={`${item.type}-${item.id}`}
										colSpan={colSpan}
									>
										<div>
											<S.ItemTitle>
												<S.ItemTypeBadge>코딩테스트</S.ItemTypeBadge>
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
						{!totalOnly && (
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
						)}
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
													{!totalOnly && item.problems.length === 0 ? (
														<S.TdCourseProblemCell>
															<span style={{ color: "#94a3b8" }}>
																과제 없음
															</span>
														</S.TdCourseProblemCell>
													) : !totalOnly ? (
														item.problems.map((problem) => {
															const problemGrade =
																assignmentData?.problems?.[problem.problemId];
															return (
																<S.TdCourseProblemCell
																	key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
																>
																	<GradeProblemCellDisplay
																		problem={problemGrade}
																		fallbackPoints={problem.points ?? 1}
																		dueAt={item.dueAt}
																		showLateOnly={showLateOnly}
																	/>
																</S.TdCourseProblemCell>
															);
														})
													) : null}
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
													{!totalOnly &&
														item.problems.map((problem) => {
														const problemGrade =
															quizData?.problems?.[problem.problemId];
														return (
															<S.TdCourseProblemCell
																key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
															>
																<GradeProblemCellDisplay
																	problem={problemGrade}
																	fallbackPoints={problem.points ?? 1}
																	dueAt={item.dueAt}
																	showLateOnly={showLateOnly}
																/>
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
				</S.GradeTableHorizontalScroll>
			) : (
				<S.NoData>
					<p>수업 전체 성적 데이터가 없습니다.</p>
				</S.NoData>
			)}
		</S.GradeTablePageWrapper>
	);
}
