import React from "react";
import TutorLayout from "../../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../../components/Navigation/SectionNavigation";
import {
	FaFileExport,
	FaChartBar,
	FaEdit,
	FaCode,
	FaClock,
	FaCheckCircle,
	FaTimesCircle,
	FaWeight,
} from "react-icons/fa";
import * as S from "../styles";
import type { GradeManagementHookReturn } from "../hooks/useGradeManagement";

export default function GradeManagementView(d: GradeManagementHookReturn) {
	const {
		sectionId,
		currentSection,
		assignments,
		quizzes,
		selectedAssignment,
		setSelectedAssignment,
		selectedQuiz,
		setSelectedQuiz,
		grades,
		loading,
		searchTerm,
		setSearchTerm,
		editingGrade,
		setEditingGrade,
		gradeInputs,
		setGradeInputs,
		comments,
		setComments,
		viewMode,
		setViewMode,
		courseGrades,
		courseLoading,
		showCodeModal,
		setShowCodeModal,
		selectedCode,
		setSelectedCode,
		showBulkModal,
		setShowBulkModal,
		showStatsModal,
		setShowStatsModal,
		showPointsModal,
		setShowPointsModal,
		pointsInputs,
		setPointsInputs,
		pointsSaving,
		assignmentProblems,
		setAssignmentProblems,
		loadingProblems,
		allAssignmentProblems,
		setAllAssignmentProblems,
		bulkInputs,
		setBulkInputs,
		bulkSaving,
		getSectionDisplayName,
		handleSaveGrade,
		handleViewCode,
		handleExportCSV,
		handleBulkSave,
		handleSavePoints,
		stats,
		filteredGrades,
		filteredCourseStudents,
	} = d;

	if (loading && !grades.length) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<S.Container>
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<p>성적 데이터를 불러오는 중...</p>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			{sectionId && currentSection && (
				<SectionNavigation
					sectionId={sectionId}
					sectionName={getSectionDisplayName()}
					enrollmentCode={
						(currentSection as { enrollmentCode?: string }).enrollmentCode
					}
					title="성적 관리"
					showSearch={false}
				/>
			)}

			<S.Container>
				<S.PageHeader>
					<S.HeaderLeft>
						<S.SearchBox>
							<S.SearchInput
								type="text"
								placeholder="이름, 학번으로 검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</S.SearchBox>
						{sectionId &&
							(assignments.length > 0 || quizzes.length > 0) &&
							(viewMode === "assignment" || viewMode === "quiz") && (
								<S.FilterGroup>
									<S.FilterLabel htmlFor="grade-item-select">
										{viewMode === "assignment" ? "과제 선택" : "퀴즈 선택"}
									</S.FilterLabel>
									<S.AssignmentSelect
										id="grade-item-select"
										value={
											viewMode === "assignment"
												? (selectedAssignment?.id ?? "")
												: (selectedQuiz?.id ?? "")
										}
										onChange={(e) => {
											const val = e.target.value;
											if (viewMode === "assignment") {
												const a = assignments.find(
													(a) => a.id === Number.parseInt(val, 10),
												);
												setSelectedAssignment(a ?? null);
												setSelectedQuiz(null);
											} else {
												const q = quizzes.find(
													(q) => q.id === Number.parseInt(val, 10),
												);
												setSelectedQuiz(q ?? null);
												setSelectedAssignment(null);
											}
										}}
									>
										<option value="">
											전체 {viewMode === "assignment" ? "과제" : "퀴즈"}
										</option>
										{viewMode === "assignment"
											? assignments.map((a) => (
													<option key={a.id} value={a.id}>
														{a.title}
													</option>
												))
											: quizzes.map((q) => (
													<option key={q.id} value={q.id}>
														{q.title}
													</option>
												))}
									</S.AssignmentSelect>
								</S.FilterGroup>
							)}
					</S.HeaderLeft>
					<S.HeaderRight>
						<S.ViewModeTabs>
							<S.TabButton
								type="button"
								$active={viewMode === "assignment"}
								onClick={() => {
									setViewMode("assignment");
									setSelectedQuiz(null);
								}}
							>
								과제별 보기
							</S.TabButton>
							<S.TabButton
								type="button"
								$active={viewMode === "quiz"}
								onClick={() => {
									setViewMode("quiz");
									setSelectedAssignment(null);
									if (quizzes.length > 0 && !selectedQuiz) {
										setSelectedQuiz(quizzes[0]);
									}
								}}
							>
								퀴즈별 보기
							</S.TabButton>
							<S.TabButton
								type="button"
								$active={viewMode === "course"}
								onClick={() => {
									setViewMode("course");
									setSelectedAssignment(null);
									setSelectedQuiz(null);
								}}
							>
								수업 전체 보기
							</S.TabButton>
						</S.ViewModeTabs>
						{(selectedAssignment ||
							selectedQuiz ||
							(viewMode === "course" &&
								(assignments.length > 0 || quizzes.length > 0))) && (
							<>
								<S.SecondaryButton
									type="button"
									onClick={() => setShowPointsModal(true)}
								>
									<FaWeight /> 배점 설정
								</S.SecondaryButton>
								<S.SecondaryButton
									type="button"
									onClick={() => setShowBulkModal(true)}
								>
									<FaEdit /> 일괄 입력
								</S.SecondaryButton>
								<S.SecondaryButton
									type="button"
									onClick={() => setShowStatsModal(true)}
								>
									<FaChartBar /> 통계
								</S.SecondaryButton>
								<S.PrimaryButton type="button" onClick={handleExportCSV}>
									<FaFileExport /> 내보내기
								</S.PrimaryButton>
							</>
						)}
					</S.HeaderRight>
				</S.PageHeader>

				{/* 성적 테이블 */}
				{viewMode === "course" ? (
					<S.CourseTableContainer>
						{courseLoading ? (
							<S.LoadingContainer>
								<S.LoadingSpinner />
								<p>수업 전체 성적 데이터를 불러오는 중...</p>
							</S.LoadingContainer>
						) : courseGrades?.items?.length &&
							filteredCourseStudents.length > 0 ? (
							<S.CourseTable>
								<thead>
									<tr>
										<th rowSpan={2}>학생</th>
										<th rowSpan={2}>학번</th>
										{courseGrades.items.map((item) =>
											item.type === "quiz" ? (
												<S.CourseQuizHeader
													key={`${item.type}-${item.id}`}
													colSpan={item.problems.length + 1}
												>
													<S.ItemTitle>
														<S.ItemTypeBadge>퀴즈</S.ItemTypeBadge>
														{item.title}
													</S.ItemTitle>
												</S.CourseQuizHeader>
											) : (
												<S.CourseAssignmentHeader
													key={`${item.type}-${item.id}`}
													colSpan={item.problems.length + 1}
												>
													<S.ItemTitle>{item.title}</S.ItemTitle>
												</S.CourseAssignmentHeader>
											),
										)}
									</tr>
									<tr>
										{courseGrades.items.map((item) => (
											<React.Fragment key={`${item.type}-${item.id}-problems`}>
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
															{item.problems.map((problem) => {
																const problemGrade =
																	assignmentData?.problems?.[problem.problemId];
																const score =
																	problemGrade?.score !== null &&
																	problemGrade?.score !== undefined
																		? problemGrade.score
																		: null;
																return (
																	<td
																		key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
																	>
																		{score !== null
																			? `${score} / ${problem.points ?? 0}`
																			: "-"}
																	</td>
																);
															})}
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
																const score =
																	problemGrade?.score !== null &&
																	problemGrade?.score !== undefined
																		? problemGrade.score
																		: null;
																return (
																	<td
																		key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
																	>
																		{score !== null
																			? `${score} / ${problem.points ?? 0}`
																			: "-"}
																	</td>
																);
															})}
															<S.TdCourseAssignmentTotalCell>
																{quizData ? (
																	<strong>
																		{quizData.totalScore} /{" "}
																		{quizData.totalPoints}
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
				) : selectedQuiz && viewMode === "quiz" && grades.length > 0 ? (
					<S.TableContainer>
						<S.Table>
							<thead>
								<tr>
									<th>학생</th>
									<th>학번</th>
									{grades[0]?.problemGrades?.map((p) => (
										<S.ProblemHeader key={p.problemId} as="th">
											<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
											<S.ProblemPoints>({p.points ?? 0}점)</S.ProblemPoints>
										</S.ProblemHeader>
									))}
									<th>총점</th>
									<th>비율</th>
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
												<td key={problem.problemId}>
													<S.ScoreDisplay>
														<S.ScoreValue>
															{problem.score !== null &&
															problem.score !== undefined
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
																		{new Date(
																			problem.submittedAt,
																		).toLocaleString("ko-KR")}
																	</S.SubmissionTime>
																)}
															</S.SubmissionInfo>
														)}
													</S.ScoreDisplay>
												</td>
											))}
											<S.TdTotalCell>
												<strong>
													{totalScore} / {totalPoints}
												</strong>
											</S.TdTotalCell>
											<S.TdRatioCell>
												<strong>{ratio}%</strong>
											</S.TdRatioCell>
										</tr>
									);
								})}
							</tbody>
						</S.Table>
					</S.TableContainer>
				) : selectedQuiz && viewMode === "quiz" ? (
					<S.TableContainer>
						<S.NoData>
							<p>등록된 성적이 없습니다.</p>
						</S.NoData>
					</S.TableContainer>
				) : selectedAssignment && grades.length > 0 ? (
					<S.TableContainer>
						<S.Table>
							<thead>
								<tr>
									<th>학생</th>
									<th>학번</th>
									{grades[0]?.problemGrades?.map((p) => (
										<S.ProblemHeader key={p.problemId} as="th">
											<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
											<S.ProblemPoints>({p.points ?? 0}점)</S.ProblemPoints>
										</S.ProblemHeader>
									))}
									<th>총점</th>
									<th>비율</th>
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
											{student.problemGrades?.map((problem) => {
												const key = `${student.userId}-${problem.problemId}`;
												const isEditing =
													editingGrade?.userId === student.userId &&
													editingGrade?.problemId === problem.problemId;
												const currentScore =
													gradeInputs[key] !== undefined
														? gradeInputs[key]
														: problem.score !== null &&
																problem.score !== undefined
															? problem.score
															: "";
												const currentComment = comments[key] ?? "";
												return (
													<td key={problem.problemId}>
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
																				const next = {
																					...prev,
																				};
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
																	{problem.score !== null &&
																	problem.score !== undefined
																		? `${problem.score} / ${problem.points ?? 0}`
																		: "-"}
																</S.ScoreValue>
																<S.ScoreActions>
																	<button
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
																		<FaEdit />
																	</button>
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
																</S.ScoreActions>
																{problem.submitted && (
																	<S.SubmissionInfo>
																		<span>
																			{problem.isOnTime ? (
																				<>
																					<FaCheckCircle /> 제시간
																				</>
																			) : (
																				<>
																					<FaTimesCircle /> 지연
																				</>
																			)}
																		</span>
																		{problem.submittedAt && (
																			<S.SubmissionTime>
																				<FaClock />{" "}
																				{new Date(
																					problem.submittedAt,
																				).toLocaleString("ko-KR")}
																			</S.SubmissionTime>
																		)}
																	</S.SubmissionInfo>
																)}
															</S.ScoreDisplay>
														)}
													</td>
												);
											})}
											<S.TdTotalCell>
												<strong>
													{totalScore} / {totalPoints}
												</strong>
											</S.TdTotalCell>
											<S.TdRatioCell>
												<strong>{ratio}%</strong>
											</S.TdRatioCell>
										</tr>
									);
								})}
							</tbody>
						</S.Table>
					</S.TableContainer>
				) : selectedAssignment ? (
					<S.NoData>
						<p>등록된 성적이 없습니다.</p>
					</S.NoData>
				) : (
					<S.NoData>
						<p>과제를 선택하여 성적을 확인하세요.</p>
					</S.NoData>
				)}

				{/* 코드 조회 모달 */}
				{showCodeModal && selectedCode && (
					<S.ModalOverlay
						onClick={() => setShowCodeModal(false)}
						onKeyDown={(e) => e.key === "Escape" && setShowCodeModal(false)}
						role="button"
						tabIndex={0}
					>
						<S.ModalContent
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2 id="code-modal-title">제출 코드</h2>
								<S.ModalClose
									type="button"
									onClick={() => setShowCodeModal(false)}
									aria-label="닫기"
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.CodeDisplay>
									<code>
										{selectedCode.code ??
											selectedCode.codeString ??
											"코드를 불러올 수 없습니다."}
									</code>
								</S.CodeDisplay>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 일괄 입력 모달 */}
				{showBulkModal && selectedAssignment && grades.length > 0 && (
					<S.ModalOverlay
						onClick={() => {
							setShowBulkModal(false);
							setBulkInputs({});
						}}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setShowBulkModal(false);
								setBulkInputs({});
							}
						}}
						role="button"
						tabIndex={0}
					>
						<S.ModalContent
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2>일괄 점수 입력</h2>
								<S.ModalClose
									type="button"
									onClick={() => {
										setShowBulkModal(false);
										setBulkInputs({});
									}}
									aria-label="닫기"
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.BulkInfo>
									<p>
										문제별로 모든 학생에게 동일한 점수를 일괄 입력할 수
										있습니다.
									</p>
								</S.BulkInfo>
								<S.BulkInputs>
									{grades[0]?.problemGrades?.map((problem) => (
										<S.BulkInputRow key={problem.problemId}>
											<S.BulkLabel
												as="label"
												htmlFor={`bulk-problem-${problem.problemId}`}
											>
												{problem.problemTitle ?? ""} (배점:{" "}
												{problem.points ?? 0}
												점)
											</S.BulkLabel>
											<S.BulkInput
												id={`bulk-problem-${problem.problemId}`}
												type="number"
												min={0}
												max={problem.points ?? 100}
												value={bulkInputs[problem.problemId] ?? ""}
												onChange={(e) => {
													const v =
														e.target.value === "" ? "" : Number(e.target.value);
													setBulkInputs((prev) => ({
														...prev,
														[problem.problemId]: v,
													}));
												}}
												placeholder="점수 입력"
											/>
										</S.BulkInputRow>
									))}
								</S.BulkInputs>
								<S.ModalActions>
									<S.BtnCancel
										type="button"
										onClick={() => {
											setShowBulkModal(false);
											setBulkInputs({});
										}}
									>
										취소
									</S.BtnCancel>
									<S.BtnSubmit
										type="button"
										onClick={handleBulkSave}
										disabled={
											bulkSaving || Object.keys(bulkInputs).length === 0
										}
									>
										{bulkSaving ? "저장 중..." : "일괄 저장"}
									</S.BtnSubmit>
								</S.ModalActions>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 통계 모달 */}
				{showStatsModal && stats && (
					<S.ModalOverlay
						onClick={() => setShowStatsModal(false)}
						onKeyDown={(e) => e.key === "Escape" && setShowStatsModal(false)}
						role="button"
						tabIndex={0}
					>
						<S.ModalContent $large>
							<div
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<S.ModalHeader>
									<h2>성적 통계</h2>
									<S.ModalClose
										type="button"
										onClick={() => setShowStatsModal(false)}
										aria-label="닫기"
									>
										×
									</S.ModalClose>
								</S.ModalHeader>
								<S.ModalBody>
									<S.StatsSection>
										<S.StatsTitle>전체 통계</S.StatsTitle>
										<S.StatsGrid>
											<S.StatCard>
												<S.StatLabel>평균 점수</S.StatLabel>
												<S.StatValue>
													{stats.overall.avg} / {stats.overall.totalPoints}
												</S.StatValue>
											</S.StatCard>
											<S.StatCard>
												<S.StatLabel>최고 점수</S.StatLabel>
												<S.StatValue>
													{stats.overall.max} / {stats.overall.totalPoints}
												</S.StatValue>
											</S.StatCard>
											<S.StatCard>
												<S.StatLabel>최저 점수</S.StatLabel>
												<S.StatValue>
													{stats.overall.min} / {stats.overall.totalPoints}
												</S.StatValue>
											</S.StatCard>
											<S.StatCard>
												<S.StatLabel>학생 수</S.StatLabel>
												<S.StatValue>
													{stats.overall.totalStudents}명
												</S.StatValue>
											</S.StatCard>
										</S.StatsGrid>
									</S.StatsSection>
									<S.StatsSection>
										<S.StatsTitle>문제별 통계</S.StatsTitle>
										<S.ProblemStatsTable>
											<S.StatsTable>
												<thead>
													<tr>
														<th>문제</th>
														<th>배점</th>
														<th>평균</th>
														<th>최고</th>
														<th>최저</th>
														<th>제출률</th>
													</tr>
												</thead>
												<tbody>
													{stats.problemStats.map((stat) => {
														const submissionRate =
															stat.totalCount > 0
																? (
																		(stat.submittedCount / stat.totalCount) *
																		100
																	).toFixed(1)
																: "0";
														return (
															<tr key={stat.problemId}>
																<td>
																	<S.StatProblemTitle>
																		{stat.problemTitle}
																	</S.StatProblemTitle>
																</td>
																<td>{stat.points}점</td>
																<td>{stat.avg.toFixed(1)}</td>
																<td>{stat.max}</td>
																<td>{stat.min}</td>
																<td>
																	<S.SubmissionRate>
																		<span>{submissionRate}%</span>
																		<S.ProgressBar>
																			<S.ProgressFill
																				$width={Number(submissionRate)}
																			/>
																		</S.ProgressBar>
																	</S.SubmissionRate>
																</td>
															</tr>
														);
													})}
												</tbody>
											</S.StatsTable>
										</S.ProblemStatsTable>
									</S.StatsSection>
								</S.ModalBody>
							</div>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 배점 설정 모달 */}
				{showPointsModal &&
					(selectedAssignment ||
						(viewMode === "course" && assignments.length > 0)) && (
						<S.ModalOverlay
							onClick={() => {
								setShowPointsModal(false);
								setPointsInputs({});
								setAssignmentProblems([]);
								setAllAssignmentProblems([]);
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									setShowPointsModal(false);
									setPointsInputs({});
									setAssignmentProblems([]);
									setAllAssignmentProblems([]);
								}
							}}
							role="button"
							tabIndex={0}
						>
							<S.ModalContent $large>
								<div
									onClick={(e) => e.stopPropagation()}
									onKeyDown={(e) => e.stopPropagation()}
								>
									<S.ModalHeader>
										<h2>
											{viewMode === "course"
												? "수업 전체 배점 설정"
												: "배점 설정"}
										</h2>
										<S.ModalClose
											type="button"
											onClick={() => {
												setShowPointsModal(false);
												setPointsInputs({});
												setAssignmentProblems([]);
												setAllAssignmentProblems([]);
											}}
											aria-label="닫기"
										>
											×
										</S.ModalClose>
									</S.ModalHeader>
									<S.ModalBody>
										<S.BulkInfo>
											<p>
												{viewMode === "course"
													? "수업의 모든 과제 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다."
													: "과제의 각 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다."}
											</p>
										</S.BulkInfo>
										{loadingProblems ? (
											<S.LoadingContainer>
												<S.LoadingSpinner />
												<p>문제 목록을 불러오는 중...</p>
											</S.LoadingContainer>
										) : viewMode === "course" &&
											allAssignmentProblems.length > 0 ? (
											<>
												{allAssignmentProblems.map(
													({ assignmentId, assignmentTitle, problems }) => {
														if (problems.length === 0) return null;
														const assignmentTotal = problems.reduce(
															(sum, problem) => {
																const problemId =
																	problem.id ?? problem.problemId;
																const key = `${assignmentId}-${problemId}`;
																const defaultPoints =
																	problem.points && problem.points > 0
																		? problem.points
																		: 1;
																const current =
																	pointsInputs[key] !== undefined
																		? (pointsInputs[key] ?? 0)
																		: defaultPoints;
																return sum + (Number(current) || 0);
															},
															0,
														);
														return (
															<S.AssignmentGroup key={assignmentId}>
																<S.AssignmentGroupHeader>
																	<S.AssignmentGroupTitle>
																		{assignmentTitle}
																	</S.AssignmentGroupTitle>
																	<S.AssignmentGroupTotal>
																		총점: {assignmentTotal}점
																	</S.AssignmentGroupTotal>
																</S.AssignmentGroupHeader>
																<S.BulkInputs>
																	{problems.map((problem) => {
																		const problemId =
																			problem.id ?? problem.problemId;
																		const problemTitle =
																			problem.title ??
																			problem.problemTitle ??
																			"제목 없음";
																		const defaultPoints =
																			problem.points && problem.points > 0
																				? problem.points
																				: 1;
																		const key = `${assignmentId}-${problemId}`;
																		const currentPoints =
																			pointsInputs[key] !== undefined
																				? (pointsInputs[key] ?? 0)
																				: defaultPoints;
																		return (
																			<S.BulkInputRow key={key}>
																				<S.BulkLabel
																					as="label"
																					htmlFor={`points-${key}`}
																				>
																					{problemTitle}
																				</S.BulkLabel>
																				<S.BulkInput
																					id={`points-${key}`}
																					type="number"
																					min={0}
																					step={1}
																					value={currentPoints}
																					onChange={(e) => {
																						const v =
																							e.target.value === ""
																								? ""
																								: Number(e.target.value);
																						setPointsInputs((prev) => ({
																							...prev,
																							[key]: v,
																						}));
																					}}
																					placeholder="배점 입력"
																				/>
																				<S.PointsUnit>점</S.PointsUnit>
																			</S.BulkInputRow>
																		);
																	})}
																</S.BulkInputs>
															</S.AssignmentGroup>
														);
													},
												)}
											</>
										) : assignmentProblems.length > 0 ? (
											<>
												<S.BulkInputs>
													{assignmentProblems.map((problem) => {
														const problemId = problem.id ?? problem.problemId;
														const problemTitle =
															problem.title ??
															problem.problemTitle ??
															"제목 없음";
														const defaultPoints =
															problem.points && problem.points > 0
																? problem.points
																: 1;
														const currentPoints =
															pointsInputs[problemId] !== undefined
																? (pointsInputs[problemId] ?? 0)
																: defaultPoints;
														return (
															<S.BulkInputRow key={problemId}>
																<S.BulkLabel
																	as="label"
																	htmlFor={`points-assignment-${problemId}`}
																>
																	{problemTitle}
																</S.BulkLabel>
																<S.BulkInput
																	id={`points-assignment-${problemId}`}
																	type="number"
																	min={0}
																	step={1}
																	value={currentPoints}
																	onChange={(e) => {
																		const v =
																			e.target.value === ""
																				? ""
																				: Number(e.target.value);
																		setPointsInputs((prev) => ({
																			...prev,
																			[problemId]: v,
																		}));
																	}}
																	placeholder="배점 입력"
																/>
																<S.PointsUnit>점</S.PointsUnit>
															</S.BulkInputRow>
														);
													})}
												</S.BulkInputs>
												<S.TotalPointsSummary>
													<S.TotalPointsLabel>과제 총점:</S.TotalPointsLabel>
													<S.TotalPointsValue>
														{assignmentProblems.reduce((sum, problem) => {
															const problemId = problem.id ?? problem.problemId;
															const defaultPoints =
																problem.points && problem.points > 0
																	? problem.points
																	: 1;
															const current =
																pointsInputs[problemId] !== undefined
																	? (pointsInputs[problemId] ?? 0)
																	: defaultPoints;
															return sum + (Number(current) || 0);
														}, 0)}
														점
													</S.TotalPointsValue>
												</S.TotalPointsSummary>
											</>
										) : (
											<S.NoData>
												<p>과제에 등록된 문제가 없습니다.</p>
											</S.NoData>
										)}
										<S.ModalActions>
											<S.BtnCancel
												type="button"
												onClick={() => {
													setShowPointsModal(false);
													setPointsInputs({});
													setAssignmentProblems([]);
													setAllAssignmentProblems([]);
												}}
											>
												취소
											</S.BtnCancel>
											<S.BtnSubmit
												type="button"
												onClick={handleSavePoints}
												disabled={
													pointsSaving ||
													(viewMode === "course"
														? allAssignmentProblems.length === 0
														: assignmentProblems.length === 0)
												}
											>
												{pointsSaving ? "저장 중..." : "배점 저장"}
											</S.BtnSubmit>
										</S.ModalActions>
									</S.ModalBody>
								</div>
							</S.ModalContent>
						</S.ModalOverlay>
					)}
			</S.Container>
		</TutorLayout>
	);
}
