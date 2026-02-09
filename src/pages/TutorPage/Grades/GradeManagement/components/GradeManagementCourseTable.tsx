import React from "react";
import {
	FaCheckCircle,
	FaTimesCircle,
	FaClock,
	FaCalendarAlt,
	FaEdit,
	FaCode,
} from "react-icons/fa";
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
}: GradeManagementCourseTableProps) {
	const hasAssignmentActions = Boolean(
		onSaveGrade && onViewCode && setEditingGrade && setGradeInputs,
	);
	const hasQuizActions = Boolean(
		onSaveGradeForQuiz &&
			onViewCodeForQuiz &&
			setEditingGrade &&
			setGradeInputs,
	);
	return (
		<S.CourseTableContainer>
			{courseLoading ? (
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>수업 전체 성적 데이터를 불러오는 중...</p>
				</S.LoadingContainer>
			) : courseGrades?.items?.length && filteredCourseStudents.length > 0 ? (
				<S.CourseTable>
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
											{item.dueAt && (
												<S.ItemDue>
													마감: {new Date(item.dueAt).toLocaleString("ko-KR")}
												</S.ItemDue>
											)}
										</div>
									</S.CourseQuizHeader>
								) : (
									<S.CourseAssignmentHeader
										key={`${item.type}-${item.id}`}
										colSpan={colSpan}
									>
										<div>
											<S.ItemTitle>{item.title}</S.ItemTitle>
											{item.dueAt && (
												<S.ItemDue>
													마감: {new Date(item.dueAt).toLocaleString("ko-KR")}
												</S.ItemDue>
											)}
										</div>
									</S.CourseAssignmentHeader>
								);
							})}
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
											<S.ProblemTitle>
												{problem.problemTitle ?? ""}
											</S.ProblemTitle>
											<S.ProblemPoints>
												({problem.points ?? 0}
												점)
											</S.ProblemPoints>
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
						{filteredCourseStudents.map((student) => (
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
														<span style={{ color: "#94a3b8" }}>과제 없음</span>
													</S.TdCourseProblemCell>
												) : (
													item.problems.map((problem) => {
														const problemGrade =
															assignmentData?.problems?.[problem.problemId];
														const score =
															problemGrade?.score !== null &&
															problemGrade?.score !== undefined
																? problemGrade.score
																: null;
														const key = `${item.id}-${student.userId}-${problem.problemId}`;
														const isEditing =
															hasAssignmentActions &&
															editingGrade?.userId === student.userId &&
															editingGrade?.problemId === problem.problemId &&
															editingGrade?.assignmentId === item.id;
														const currentScore =
															gradeInputs[key] !== undefined
																? gradeInputs[key]
																: score !== null
																	? score
																	: "";
														const currentComment = comments[key] ?? "";
														return (
															<S.TdCourseProblemCell
																key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
															>
																{hasAssignmentActions && isEditing ? (
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
																				setGradeInputs?.((prev) => ({
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
																					onSaveGrade?.(
																						item.id,
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
																					setEditingGrade?.(null);
																					setGradeInputs?.((prev) => {
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
																		<S.ScoreValue>
																			{`${score ?? 0} / ${problem.points ?? 0}`}
																		</S.ScoreValue>
																		{hasAssignmentActions && (
																			<S.ScoreActions>
																				<button
																					type="button"
																					onClick={() => {
																						setEditingGrade?.({
																							userId: student.userId,
																							problemId: problem.problemId,
																							assignmentId: item.id,
																						});
																						setGradeInputs?.((prev) => ({
																							...prev,
																							[key]:
																								score !== null ? score : "",
																						}));
																					}}
																					title="점수 입력/수정"
																				>
																					<FaEdit />
																				</button>
																				{problemGrade?.submitted && (
																					<button
																						type="button"
																						onClick={() =>
																							onViewCode?.(
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
																			</S.ScoreActions>
																		)}
																		{(problemGrade?.submitted ||
																			item.dueAt) && (
																			<S.SubmissionInfo>
																				{problemGrade?.submitted && (
																					<S.SubmissionStatus
																						$onTime={problemGrade.isOnTime}
																					>
																						{problemGrade.isOnTime ? (
																							<>
																								<FaCheckCircle /> 정시 제출
																							</>
																						) : (
																							<>
																								<FaTimesCircle /> 기한 초과
																							</>
																						)}
																					</S.SubmissionStatus>
																				)}
																				{item.dueAt && (
																					<S.SubmissionDue>
																						<FaCalendarAlt /> 제출 기한:{" "}
																						{new Date(
																							item.dueAt,
																						).toLocaleString("ko-KR")}
																					</S.SubmissionDue>
																				)}
																				{problemGrade?.submittedAt && (
																					<S.SubmissionTime>
																						<FaClock /> 제출 시간:{" "}
																						{new Date(
																							problemGrade.submittedAt,
																						).toLocaleString("ko-KR")}
																					</S.SubmissionTime>
																				)}
																			</S.SubmissionInfo>
																		)}
																	</S.ScoreDisplay>
																)}
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
											<React.Fragment key={`${student.userId}-quiz-${item.id}`}>
												{item.problems.map((problem) => {
													const problemGrade =
														quizData?.problems?.[problem.problemId];
													const score =
														problemGrade?.score !== null &&
														problemGrade?.score !== undefined
															? problemGrade.score
															: null;
													const quizCellKey = `quiz-${item.id}-${student.userId}-${problem.problemId}`;
													const isEditingQuiz =
														hasQuizActions &&
														editingGrade?.userId === student.userId &&
														editingGrade?.problemId === problem.problemId &&
														editingGrade?.quizId === item.id;
													const currentScore =
														gradeInputs[quizCellKey] !== undefined
															? gradeInputs[quizCellKey]
															: score !== null
																? score
																: "";
													const currentComment = comments[quizCellKey] ?? "";
													return (
														<S.TdCourseProblemCell
															key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
														>
															{hasQuizActions && isEditingQuiz ? (
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
																			setGradeInputs?.((prev) => ({
																				...prev,
																				[quizCellKey]: v,
																			}));
																		}}
																		placeholder="점수"
																	/>
																	<S.EditActions>
																		<button
																			type="button"
																			onClick={() =>
																				onSaveGradeForQuiz?.(
																					item.id,
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
																				setEditingGrade?.(null);
																				setGradeInputs?.((prev) => {
																					const next = { ...prev };
																					delete next[quizCellKey];
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
																	<S.ScoreValue>
																		{`${score ?? 0} / ${problem.points ?? 0}`}
																	</S.ScoreValue>
																	{hasQuizActions && (
																		<S.ScoreActions>
																			<button
																				type="button"
																				onClick={() => {
																					setEditingGrade?.({
																						userId: student.userId,
																						problemId: problem.problemId,
																						quizId: item.id,
																					});
																					setGradeInputs?.((prev) => ({
																						...prev,
																						[quizCellKey]:
																							score !== null ? score : "",
																					}));
																				}}
																				title="점수 입력/수정"
																			>
																				<FaEdit />
																			</button>
																			{problemGrade?.submitted && (
																				<button
																					type="button"
																					onClick={() =>
																						onViewCodeForQuiz?.(
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
																		</S.ScoreActions>
																	)}
																	{(problemGrade?.submitted || item.dueAt) && (
																		<S.SubmissionInfo>
																			{problemGrade?.submitted && (
																				<S.SubmissionStatus
																					$onTime={problemGrade.isOnTime}
																				>
																					{problemGrade.isOnTime ? (
																						<>
																							<FaCheckCircle /> 정시 제출
																						</>
																					) : (
																						<>
																							<FaTimesCircle /> 기한 초과
																						</>
																					)}
																				</S.SubmissionStatus>
																			)}
																			{item.dueAt && (
																				<S.SubmissionDue>
																					<FaCalendarAlt /> 제출 기한:{" "}
																					{new Date(item.dueAt).toLocaleString(
																						"ko-KR",
																					)}
																				</S.SubmissionDue>
																			)}
																			{problemGrade?.submittedAt && (
																				<S.SubmissionTime>
																					<FaClock /> 제출 시간:{" "}
																					{new Date(
																						problemGrade.submittedAt,
																					).toLocaleString("ko-KR")}
																				</S.SubmissionTime>
																			)}
																		</S.SubmissionInfo>
																	)}
																</S.ScoreDisplay>
															)}
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
							</tr>
						))}
					</tbody>
				</S.CourseTable>
			) : (
				<S.NoData>
					<p>수업 전체 성적 데이터가 없습니다.</p>
				</S.NoData>
			)}
		</S.CourseTableContainer>
	);
}
