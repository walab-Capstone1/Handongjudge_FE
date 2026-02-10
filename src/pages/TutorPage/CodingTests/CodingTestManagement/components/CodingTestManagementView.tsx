import type React from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../../components/Navigation/SectionNavigation";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import * as S from "../styles";
import type { SubmissionStudent } from "../types";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";

function getStatusBadge(status: string) {
	switch (status) {
		case "ACTIVE":
			return <S.StatusBadge $status="active">진행중</S.StatusBadge>;
		case "WAITING":
			return <S.StatusBadge $status="waiting">대기중</S.StatusBadge>;
		case "ENDED":
			return <S.StatusBadge $status="ended">종료</S.StatusBadge>;
		default:
			return <S.StatusBadge $status={undefined}>{status ?? "-"}</S.StatusBadge>;
	}
}

const TABS = [
	{ id: "main", label: "메인" },
	{ id: "problems", label: "대회 문제" },
	{ id: "submissions", label: "제출 상세정보" },
];

export default function CodingTestManagementView(
	d: CodingTestManagementHookReturn,
) {
	if (!d.sectionId) {
		return (
			<TutorLayout>
				<S.Container>
					<S.PageHeader>
						<S.PageTitle>코딩 테스트 관리</S.PageTitle>
					</S.PageHeader>
					<S.NoData>
						<p>수업을 선택해주세요.</p>
					</S.NoData>
				</S.Container>
			</TutorLayout>
		);
	}

	// Detail view (d.quizId present)
	if (d.quizId && d.selectedQuizDetail) {
		const tabs = TABS;

		return (
			<TutorLayout selectedSection={d.currentSection}>
				<S.Container>
					{d.currentSection && d.sectionId && (
						<SectionNavigation
							title="코딩 테스트 관리"
							sectionId={d.sectionId}
							sectionName={`${d.currentSection.courseTitle ?? ""}${d.currentSection.sectionNumber ? ` - ${d.currentSection.sectionNumber}분반` : ""}`}
							enrollmentCode={d.currentSection.enrollmentCode ?? null}
							showSearch={false}
						/>
					)}
					<S.DetailWrapper>
						<S.DetailHeader>
							<S.BackButton
								type="button"
								onClick={() =>
									d.navigate(`/tutor/coding-tests/section/${d.sectionId}`)
								}
							>
								← 목록으로
							</S.BackButton>
							<S.DetailTitle>{d.selectedQuizDetail.title}</S.DetailTitle>
						</S.DetailHeader>

						<S.DetailContent>
							<S.Sidebar>
								<S.TabList>
									{tabs.map((tab) => (
										<S.Tab
											key={tab.id}
											type="button"
											$active={d.activeTab === tab.id}
											onClick={() => d.setActiveTab(tab.id)}
										>
											{tab.label}
										</S.Tab>
									))}
								</S.TabList>
							</S.Sidebar>

							<S.MainContent>
								{d.activeTab === "main" && (
									<S.QuizInfoSection>
										<S.QuizInfoHeader>
											<S.QuizInfoTitle>코딩테스트 정보</S.QuizInfoTitle>
											<S.QuizControlButtons>
												<S.QuizControlBtn
													type="button"
													$variant="start"
													onClick={d.handleStart}
													disabled={d.selectedQuizDetail.status === "ACTIVE"}
												>
													시작
												</S.QuizControlBtn>
												<S.QuizControlBtn
													type="button"
													$variant="stop"
													onClick={d.handleStop}
													disabled={d.selectedQuizDetail.status !== "ACTIVE"}
												>
													정지
												</S.QuizControlBtn>
												<S.QuizControlBtn
													type="button"
													$variant="end"
													onClick={d.handleEnd}
													disabled={d.selectedQuizDetail.status === "ENDED"}
												>
													종료
												</S.QuizControlBtn>
											</S.QuizControlButtons>
										</S.QuizInfoHeader>
										<S.QuizInfoGrid>
											<S.InfoItem>
												<S.InfoLabel>제목</S.InfoLabel>
												<S.InfoValue>{d.selectedQuizDetail.title}</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>설명</S.InfoLabel>
												<S.InfoValue>
													{d.selectedQuizDetail.description ?? "-"}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>시작 시간</S.InfoLabel>
												<S.InfoValue>
													{d.formatDateTime(d.selectedQuizDetail.startTime)}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>종료 시간</S.InfoLabel>
												<S.InfoValue>
													{d.formatDateTime(d.selectedQuizDetail.endTime)}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>상태</S.InfoLabel>
												<S.InfoValue>
													{getStatusBadge(d.selectedQuizDetail.status ?? "")}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>문제 수</S.InfoLabel>
												<S.InfoValue>{d.problems.length}개</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>활성화 상태</S.InfoLabel>
												<S.InfoValue>
													<S.ActiveToggleButton
														type="button"
														onClick={() => {
															if (d.sectionId && d.selectedQuizDetail) {
																const quizId = Number(d.quizId);
																d.handleToggleActive(
																	Number(d.sectionId),
																	quizId,
																	d.selectedQuizDetail.active,
																);
															}
														}}
													>
														{d.selectedQuizDetail.active !== false
															? "비활성화"
															: "활성화"}
													</S.ActiveToggleButton>
												</S.InfoValue>
											</S.InfoItem>
										</S.QuizInfoGrid>
									</S.QuizInfoSection>
								)}

								{d.activeTab === "d.problems" && (
									<>
										<S.ProblemsTabHeader>
											<S.SectionTitle>대회 문제</S.SectionTitle>
											<S.ProblemsTabHeaderRight>
												<S.ProblemsCount>
													총 {d.problems.length}개
												</S.ProblemsCount>
												<S.ProblemsAddBtn
													type="button"
													onClick={() => {
														d.setShowAddProblemModal(true);
														d.setSelectedProblemIds(
															d.problems.map((p) => p.id),
														);
													}}
												>
													+ 문제 추가
												</S.ProblemsAddBtn>
											</S.ProblemsTabHeaderRight>
										</S.ProblemsTabHeader>
										{d.problems.length === 0 ? (
											<S.NoData>
												<p>등록된 문제가 없습니다.</p>
											</S.NoData>
										) : (
											<S.ProblemsTableContainer>
												<S.ProblemsTable>
													<thead>
														<tr>
															<th>문제 번호</th>
															<th>제목</th>
															<th>상태</th>
															<th>제출수</th>
															<th>정답률</th>
															<th>관리</th>
														</tr>
													</thead>
													<tbody>
														{d.problems.map((problem, index) => (
															<tr key={problem.id}>
																<S.ProblemNumberCell>
																	{index + 1}
																</S.ProblemNumberCell>
																<S.ProblemTitleCell>
																	<S.ProblemTitleMain>
																		{removeCopyLabel(problem.title)}
																	</S.ProblemTitleMain>
																	{problem.description && (
																		<S.ProblemDescriptionPreview>
																			{problem.description.length > 100
																				? `${problem.description.substring(0, 100)}...`
																				: problem.description}
																		</S.ProblemDescriptionPreview>
																	)}
																</S.ProblemTitleCell>
																<td>
																	<span>-</span>
																</td>
																<td>0회</td>
																<td>0%</td>
																<td>
																	<S.ProblemRemoveBtn
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			d.handleRemoveProblemFromQuiz(problem.id);
																		}}
																	>
																		제거
																	</S.ProblemRemoveBtn>
																</td>
															</tr>
														))}
													</tbody>
												</S.ProblemsTable>
											</S.ProblemsTableContainer>
										)}
									</>
								)}

								{d.activeTab === "d.submissions" && (
									<>
										<S.FiltersSection>
											<S.SearchBox>
												<S.SearchInput
													type="text"
													placeholder="학생 이름 또는 학번 검색..."
													value={d.searchTerm}
													onChange={(e) => d.setSearchTerm(e.target.value)}
												/>
											</S.SearchBox>
											<S.StatusFilters>
												<S.FilterBtn
													type="button"
													$active={d.filterStatus === "ALL"}
													onClick={() => d.setFilterStatus("ALL")}
												>
													전체
												</S.FilterBtn>
												<S.FilterBtn
													type="button"
													$active={d.filterStatus === "COMPLETED"}
													onClick={() => d.setFilterStatus("COMPLETED")}
												>
													완료
												</S.FilterBtn>
												<S.FilterBtn
													type="button"
													$active={d.filterStatus === "IN_PROGRESS"}
													onClick={() => d.setFilterStatus("IN_PROGRESS")}
												>
													진행중
												</S.FilterBtn>
												<S.FilterBtn
													type="button"
													$active={d.filterStatus === "NOT_STARTED"}
													onClick={() => d.setFilterStatus("NOT_STARTED")}
												>
													미시작
												</S.FilterBtn>
											</S.StatusFilters>
										</S.FiltersSection>
										<S.StudentsList>
											{(() => {
												const getCompletionStatus = (
													student: SubmissionStudent,
												) => {
													const total = d.problems.length;
													const solved = student.solvedProblems?.length ?? 0;
													if (solved === 0) return "NOT_STARTED";
													if (solved === total) return "COMPLETED";
													return "IN_PROGRESS";
												};
												const getProgressPercentage = (
													student: SubmissionStudent,
												) => {
													const total = d.problems.length;
													const solved = student.solvedProblems?.length ?? 0;
													return total > 0
														? Math.round((solved / total) * 100)
														: 0;
												};
												const filteredStudents = d.submissions.filter(
													(student) => {
														const term = d.searchTerm.toLowerCase();
														const matchSearch =
															student.studentName
																?.toLowerCase()
																.includes(term) ||
															student.studentId?.toLowerCase().includes(term);
														const status = getCompletionStatus(student);
														const matchStatus =
															d.filterStatus === "ALL" ||
															status === d.filterStatus;
														return matchSearch && matchStatus;
													},
												);
												if (filteredStudents.length === 0) {
													return (
														<S.NoData>
															<p>조건에 맞는 학생이 없습니다.</p>
														</S.NoData>
													);
												}
												return (
													<S.TableContainer>
														<S.StudentsTable>
															<thead>
																<tr>
																	<th>학번</th>
																	<th>이름</th>
																	<th>진행 상태</th>
																	<th>완료율</th>
																	<th>문제별 풀이 현황</th>
																</tr>
															</thead>
															<tbody>
																{filteredStudents.map((student) => {
																	const status = getCompletionStatus(student);
																	const percentage =
																		getProgressPercentage(student);
																	return (
																		<tr key={student.userId}>
																			<td>
																				<S.StudentId>
																					{student.studentId}
																				</S.StudentId>
																			</td>
																			<td>
																				<S.StudentName>
																					{student.studentName}
																				</S.StudentName>
																			</td>
																			<td>
																				<S.SubmissionsStatusBadge
																					$status={
																						status as
																							| "COMPLETED"
																							| "IN_PROGRESS"
																							| "NOT_STARTED"
																					}
																				>
																					{status === "COMPLETED"
																						? "완료"
																						: status === "IN_PROGRESS"
																							? "진행중"
																							: "미시작"}
																				</S.SubmissionsStatusBadge>
																			</td>
																			<td>
																				<S.ProgressCell>
																					<S.MiniProgressBar>
																						<S.MiniProgressFill
																							$width={percentage}
																						/>
																					</S.MiniProgressBar>
																					<S.ProgressText>
																						{student.solvedProblems?.length ??
																							0}
																						/{d.problems.length}
																					</S.ProgressText>
																				</S.ProgressCell>
																			</td>
																			<td>
																				<S.ProblemsStatus>
																					{d.problems.map((problem, index) => {
																						const isSolved =
																							student.solvedProblems?.includes(
																								problem.id,
																							);
																						return (
																							<S.ProblemBadge
																								key={problem.id}
																								$solved={isSolved}
																								$clickable={isSolved}
																								title={`${removeCopyLabel(problem.title)} - ${isSolved ? "완료 (클릭하여 문제 보기)" : "미완료"}`}
																								onClick={() => {
																									if (isSolved) {
																										d.navigate(
																											`/tutor/coding-tests/section/${d.sectionId}/${d.quizId}?problemId=${problem.id}`,
																										);
																									}
																								}}
																							>
																								{index + 1}
																							</S.ProblemBadge>
																						);
																					})}
																				</S.ProblemsStatus>
																			</td>
																		</tr>
																	);
																})}
															</tbody>
														</S.StudentsTable>
													</S.TableContainer>
												);
											})()}
										</S.StudentsList>
									</>
								)}
							</S.MainContent>
						</S.DetailContent>
					</S.DetailWrapper>

					{/* 문제 추가 모달 (대회 문제 탭용) */}
					{d.showAddProblemModal && (
						<S.ModalOverlay onClick={d.closeAddProblemModal}>
							<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
								<S.ModalHeader>
									<h2>문제 추가 - {d.selectedQuizDetail?.title}</h2>
									<S.ModalClose type="button" onClick={d.closeAddProblemModal}>
										×
									</S.ModalClose>
								</S.ModalHeader>
								<S.ModalBody>
									<S.SearchBox style={{ marginBottom: "1rem" }}>
										<S.SearchInput
											type="text"
											placeholder="문제명 또는 ID로 검색..."
											value={d.problemSearchTerm}
											onChange={(e) => {
												d.setProblemSearchTerm(e.target.value);
												d.setCurrentProblemPage(1);
											}}
										/>
									</S.SearchBox>
									{d.getFilteredProblems().length > 0 ? (
										<>
											<S.ProblemSelectModalActions>
												<S.ProblemSelectSelectAll
													type="button"
													onClick={d.handleSelectAllProblems}
												>
													{d.getFilteredProblems().length > 0 &&
													d
														.getFilteredProblems()
														.every((p) => d.selectedProblemIds.includes(p.id))
														? "전체 해제"
														: "전체 선택"}
												</S.ProblemSelectSelectAll>
												<S.ProblemSelectSelectedCount>
													{d.selectedProblemIds.length}개 선택됨
												</S.ProblemSelectSelectedCount>
												<S.ProblemSelectFilterCount>
													총 {d.getFilteredProblems().length}개 문제
												</S.ProblemSelectFilterCount>
											</S.ProblemSelectModalActions>
											<S.ProblemsList>
												{d.getPaginatedProblems().map((problem) => {
													const isSelected = d.selectedProblemIds.includes(
														problem.id,
													);
													const isAlreadyAdded = d.problems.some(
														(p) => p.id === problem.id,
													);
													return (
														<S.ProblemItem
															key={problem.id}
															$selected={isSelected && !isAlreadyAdded}
															$disabled={isAlreadyAdded}
															onClick={() =>
																!isAlreadyAdded &&
																d.handleProblemToggle(problem.id)
															}
														>
															<input
																type="checkbox"
																checked={isSelected && !isAlreadyAdded}
																onChange={() =>
																	!isAlreadyAdded &&
																	d.handleProblemToggle(problem.id)
																}
																onClick={(e) => e.stopPropagation()}
																disabled={isAlreadyAdded}
															/>
															<S.ProblemInfo>
																<div
																	style={{
																		display: "flex",
																		alignItems: "center",
																		gap: "0.75rem",
																		flexWrap: "wrap",
																	}}
																>
																	<S.ProblemIdBadge>
																		#{problem.id}
																	</S.ProblemIdBadge>
																	<S.ProblemTitle>
																		{problem.title}
																	</S.ProblemTitle>
																	{isAlreadyAdded && (
																		<S.AlreadyAddedBadge>
																			이미 추가됨
																		</S.AlreadyAddedBadge>
																	)}
																</div>
																{problem.difficulty && (
																	<S.ProblemDifficulty
																		$color={d.getDifficultyColor(
																			problem.difficulty,
																		)}
																	>
																		{d.getDifficultyLabel(problem.difficulty)}
																	</S.ProblemDifficulty>
																)}
															</S.ProblemInfo>
														</S.ProblemItem>
													);
												})}
											</S.ProblemsList>
											{d.getTotalPages() > 1 && (
												<S.ProblemSelectPagination>
													<S.ProblemSelectPaginationBtn
														type="button"
														onClick={() =>
															d.setCurrentProblemPage((p) => Math.max(1, p - 1))
														}
														disabled={d.currentProblemPage === 1}
													>
														이전
													</S.ProblemSelectPaginationBtn>
													<span>
														{d.currentProblemPage} / {d.getTotalPages()}
													</span>
													<S.ProblemSelectPaginationBtn
														type="button"
														onClick={() =>
															d.setCurrentProblemPage((p) =>
																Math.min(d.getTotalPages(), p + 1),
															)
														}
														disabled={
															d.currentProblemPage === d.getTotalPages()
														}
													>
														다음
													</S.ProblemSelectPaginationBtn>
												</S.ProblemSelectPagination>
											)}
										</>
									) : (
										<S.NoData>
											<p>
												{d.problemSearchTerm
													? "검색 결과가 없습니다."
													: "사용 가능한 문제가 없습니다."}
											</p>
										</S.NoData>
									)}
								</S.ModalBody>
								<S.ModalFooter>
									<S.CancelButton
										type="button"
										onClick={d.closeAddProblemModal}
									>
										취소
									</S.CancelButton>
									<S.SubmitButton
										type="button"
										onClick={d.handleAddProblemsToQuiz}
									>
										추가 (
										{
											d.selectedProblemIds.filter(
												(id) => !d.problems.some((p) => p.id === id),
											).length
										}
										개)
									</S.SubmitButton>
								</S.ModalFooter>
							</S.ModalContent>
						</S.ModalOverlay>
					)}
				</S.Container>
			</TutorLayout>
		);
	}

	// List view
	if (d.loading) {
		return (
			<TutorLayout selectedSection={d.currentSection}>
				<LoadingSpinner message="코딩 테스트 목록을 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={d.currentSection}>
			{(d.isSubmittingCreate || d.isSubmittingEdit) &&
				createPortal(
					<div
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "rgba(0,0,0,0.35)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 10000,
						}}
					>
						<div
							style={{
								background: "white",
								padding: "1.5rem 2rem",
								borderRadius: "12px",
								boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
							}}
						>
							<LoadingSpinner
								message={
									d.isSubmittingCreate
										? "코딩 테스트 생성 중..."
										: "코딩 테스트 수정 중..."
								}
							/>
						</div>
					</div>,
					document.body,
				)}
			<S.Container>
				{d.currentSection && d.sectionId && (
					<SectionNavigation
						title="코딩 테스트 관리"
						sectionId={d.sectionId}
						sectionName={`${d.currentSection.courseTitle ?? ""}${d.currentSection.sectionNumber ? ` - ${d.currentSection.sectionNumber}분반` : ""}`}
						enrollmentCode={d.currentSection.enrollmentCode ?? null}
						showSearch={true}
						searchTerm={d.searchTerm}
						onSearchChange={d.setSearchTerm}
						searchPlaceholder="과제명으로 검색..."
					/>
				)}
				<S.Content>
					<S.PageHeader>
						<S.HeaderLeft>
							<S.PageTitle>코딩 테스트 목록</S.PageTitle>
							<S.QuizCount>
								전체 {d.quizzes.length}개 / 표시 {d.filteredQuizzes.length}개
							</S.QuizCount>
						</S.HeaderLeft>
						<S.HeaderRight>
							<S.StatusFilter
								value={d.filterStatus}
								onChange={(e) => d.setFilterStatus(e.target.value)}
							>
								<option value="ALL">전체</option>
								<option value="WAITING">대기중</option>
								<option value="ACTIVE">진행중</option>
								<option value="ENDED">종료</option>
							</S.StatusFilter>
							<S.CreateButton type="button" onClick={d.handleCreateQuiz}>
								+ 새 코딩 테스트 만들기
							</S.CreateButton>
						</S.HeaderRight>
					</S.PageHeader>

					{d.filteredQuizzes.length === 0 ? (
						<S.EmptyState>
							<p>등록된 코딩 테스트가 없습니다.</p>
						</S.EmptyState>
					) : (
						<S.TableContainer>
							<S.Table>
								<thead>
									<tr>
										<th>제목</th>
										<th>설명</th>
										<th>시작 시간</th>
										<th>종료 시간</th>
										<th>문제 수</th>
										<th>상태</th>
										<th>작업</th>
									</tr>
								</thead>
								<tbody>
									{d.filteredQuizzes.map((quiz) => (
										<S.ClickableRow
											key={quiz.id}
											onClick={() =>
												d.navigate(
													`/tutor/coding-tests/section/${d.sectionId}/${quiz.id}`,
												)
											}
											onKeyDown={(e: React.KeyboardEvent) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													d.navigate(
														`/tutor/coding-tests/section/${d.sectionId}/${quiz.id}`,
													);
												}
											}}
											tabIndex={0}
										>
											<td>
												<S.QuizTitle>{quiz.title}</S.QuizTitle>
											</td>
											<td>
												<S.QuizDescription>
													{quiz.description ?? "-"}
												</S.QuizDescription>
											</td>
											<td>{d.formatDateTime(quiz.startTime)}</td>
											<td>{d.formatDateTime(quiz.endTime)}</td>
											<td>{quiz.problemCount ?? 0}개</td>
											<td>{getStatusBadge(quiz.status ?? "")}</td>
											<td
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<S.QuizActions>
													<S.EditButton
														type="button"
														onClick={() => d.handleEditQuiz(quiz)}
													>
														수정
													</S.EditButton>
													<S.DeleteButton
														type="button"
														onClick={() => d.handleDeleteQuiz(quiz.id)}
													>
														삭제
													</S.DeleteButton>
												</S.QuizActions>
											</td>
										</S.ClickableRow>
									))}
								</tbody>
							</S.Table>
						</S.TableContainer>
					)}
				</S.Content>

				{/* 생성 모달 */}
				{d.showCreateModal && (
					<S.ModalOverlay
						onClick={() => d.setShowCreateModal(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") d.setShowCreateModal(false);
						}}
						role="presentation"
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>새 코딩 테스트 만들기</h2>
								<S.ModalClose
									type="button"
									onClick={() => d.setShowCreateModal(false)}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.FormGroup>
									<label htmlFor="create-quiz-title">제목 *</label>
									<input
										id="create-quiz-title"
										type="text"
										value={d.formData.title}
										onChange={(e) =>
											d.setFormData((prev) => ({
												...prev,
												title: e.target.value,
											}))
										}
										placeholder="코딩 테스트 제목을 입력하세요"
									/>
								</S.FormGroup>
								<S.FormGroup>
									<label htmlFor="create-quiz-desc">설명</label>
									<textarea
										id="create-quiz-desc"
										value={d.formData.description}
										onChange={(e) =>
											d.setFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="코딩 테스트 설명을 입력하세요"
										rows={4}
									/>
								</S.FormGroup>
								<S.FormRow>
									<S.FormGroup>
										<label htmlFor="create-quiz-start">시작 시간 *</label>
										<input
											id="create-quiz-start"
											type="datetime-local"
											value={d.formData.startTime}
											onChange={(e) =>
												d.setFormData((prev) => ({
													...prev,
													startTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
									<S.FormGroup>
										<label htmlFor="create-quiz-end">종료 시간 *</label>
										<input
											id="create-quiz-end"
											type="datetime-local"
											value={d.formData.endTime}
											onChange={(e) =>
												d.setFormData((prev) => ({
													...prev,
													endTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
								</S.FormRow>
								<S.FormGroup>
									<span
										id="create-quiz-d.problems-label"
										style={{
											fontWeight: 500,
											fontSize: "0.875rem",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										문제 선택 *
									</span>
									<S.ProblemSelectSection aria-labelledby="create-quiz-d.problems-label">
										<S.BtnSelectProblems
											type="button"
											onClick={() => d.setShowProblemModal(true)}
										>
											문제 선택 ({d.selectedProblemIds.length}개 선택됨)
										</S.BtnSelectProblems>
										{d.selectedProblemIds.length > 0 && (
											<S.SelectedCount>
												{d.selectedProblemIds.length}개의 문제가 선택되었습니다.
											</S.SelectedCount>
										)}
									</S.ProblemSelectSection>
								</S.FormGroup>
								<S.ModalFooter>
									<S.CancelButton
										type="button"
										onClick={() => d.setShowCreateModal(false)}
									>
										취소
									</S.CancelButton>
									<S.SubmitButton
										type="button"
										onClick={d.handleSubmitCreate}
										disabled={d.isSubmittingCreate}
									>
										{d.isSubmittingCreate ? "생성 중..." : "생성"}
									</S.SubmitButton>
								</S.ModalFooter>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 수정 모달 */}
				{d.showEditModal && d.selectedQuiz && (
					<S.ModalOverlay
						onClick={() => {
							d.setShowEditModal(false);
							d.setSelectedQuiz(null);
						}}
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>코딩 테스트 수정</h2>
								<S.ModalClose
									type="button"
									onClick={() => {
										d.setShowEditModal(false);
										d.setSelectedQuiz(null);
									}}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.FormGroup>
									<label htmlFor="edit-quiz-title">제목 *</label>
									<input
										id="edit-quiz-title"
										type="text"
										value={d.formData.title}
										onChange={(e) =>
											d.setFormData((prev) => ({
												...prev,
												title: e.target.value,
											}))
										}
										placeholder="코딩 테스트 제목을 입력하세요"
									/>
								</S.FormGroup>
								<S.FormGroup>
									<label htmlFor="edit-quiz-desc">설명</label>
									<textarea
										id="edit-quiz-desc"
										value={d.formData.description}
										onChange={(e) =>
											d.setFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="코딩 테스트 설명을 입력하세요"
										rows={4}
									/>
								</S.FormGroup>
								<S.FormRow>
									<S.FormGroup>
										<label htmlFor="edit-quiz-start">시작 시간 *</label>
										<input
											id="edit-quiz-start"
											type="datetime-local"
											value={d.formData.startTime}
											onChange={(e) =>
												d.setFormData((prev) => ({
													...prev,
													startTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
									<S.FormGroup>
										<label htmlFor="edit-quiz-end">종료 시간 *</label>
										<input
											id="edit-quiz-end"
											type="datetime-local"
											value={d.formData.endTime}
											onChange={(e) =>
												d.setFormData((prev) => ({
													...prev,
													endTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
								</S.FormRow>
								<S.FormGroup>
									<span
										id="edit-quiz-d.problems-label"
										style={{
											fontWeight: 500,
											fontSize: "0.875rem",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										문제 선택 *
									</span>
									<S.ProblemSelectSection aria-labelledby="edit-quiz-d.problems-label">
										<S.BtnSelectProblems
											type="button"
											onClick={() => d.setShowProblemModal(true)}
										>
											문제 선택 ({d.selectedProblemIds.length}개 선택됨)
										</S.BtnSelectProblems>
										{d.selectedProblemIds.length > 0 && (
											<S.SelectedCount>
												{d.selectedProblemIds.length}개의 문제가 선택되었습니다.
											</S.SelectedCount>
										)}
									</S.ProblemSelectSection>
								</S.FormGroup>
								<S.ModalFooter>
									<S.CancelButton
										type="button"
										onClick={() => {
											d.setShowEditModal(false);
											d.setSelectedQuiz(null);
										}}
									>
										취소
									</S.CancelButton>
									<S.SubmitButton
										type="button"
										onClick={d.handleSubmitEdit}
										disabled={d.isSubmittingEdit}
									>
										{d.isSubmittingEdit ? "수정 중..." : "수정"}
									</S.SubmitButton>
								</S.ModalFooter>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 문제 선택 모달 (생성/수정용) */}
				{d.showProblemModal && (
					<S.ModalOverlay onClick={d.closeProblemModal}>
						<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 선택</h2>
								<S.ModalClose type="button" onClick={d.closeProblemModal}>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.SearchBox style={{ marginBottom: "1rem" }}>
									<S.SearchInput
										type="text"
										placeholder="문제명 또는 ID로 검색..."
										value={d.problemSearchTerm}
										onChange={(e) => {
											d.setProblemSearchTerm(e.target.value);
											d.setCurrentProblemPage(1);
										}}
									/>
								</S.SearchBox>
								{d.getFilteredProblems().length > 0 ? (
									<>
										<S.ProblemSelectModalActions>
											<S.ProblemSelectSelectAll
												type="button"
												onClick={d.handleSelectAllProblems}
											>
												{d.getFilteredProblems().length > 0 &&
												d
													.getFilteredProblems()
													.every((p) => d.selectedProblemIds.includes(p.id))
													? "전체 해제"
													: "전체 선택"}
											</S.ProblemSelectSelectAll>
											<S.ProblemSelectSelectedCount>
												{d.selectedProblemIds.length}개 선택됨
											</S.ProblemSelectSelectedCount>
											<S.ProblemSelectFilterCount>
												총 {d.getFilteredProblems().length}개 문제
											</S.ProblemSelectFilterCount>
										</S.ProblemSelectModalActions>
										<S.ProblemsList>
											{d.getPaginatedProblems().map((problem) => {
												const isSelected = d.selectedProblemIds.includes(
													problem.id,
												);
												return (
													<S.ProblemItem
														key={problem.id}
														$selected={isSelected}
														onClick={() => d.handleProblemToggle(problem.id)}
													>
														<input
															type="checkbox"
															checked={isSelected}
															onChange={() => d.handleProblemToggle(problem.id)}
															onClick={(e) => e.stopPropagation()}
														/>
														<S.ProblemInfo>
															<div
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: "0.75rem",
																}}
															>
																<S.ProblemIdBadge>
																	#{problem.id}
																</S.ProblemIdBadge>
																<S.ProblemTitle>{problem.title}</S.ProblemTitle>
															</div>
															{problem.difficulty && (
																<S.ProblemDifficulty
																	$color={d.getDifficultyColor(
																		problem.difficulty,
																	)}
																>
																	{d.getDifficultyLabel(problem.difficulty)}
																</S.ProblemDifficulty>
															)}
														</S.ProblemInfo>
													</S.ProblemItem>
												);
											})}
										</S.ProblemsList>
										{d.getTotalPages() > 1 && (
											<S.ProblemSelectPagination>
												<S.ProblemSelectPaginationBtn
													type="button"
													onClick={() =>
														d.setCurrentProblemPage((p) => Math.max(1, p - 1))
													}
													disabled={d.currentProblemPage === 1}
												>
													이전
												</S.ProblemSelectPaginationBtn>
												<span>
													{d.currentProblemPage} / {d.getTotalPages()}
												</span>
												<S.ProblemSelectPaginationBtn
													type="button"
													onClick={() =>
														d.setCurrentProblemPage((p) =>
															Math.min(d.getTotalPages(), p + 1),
														)
													}
													disabled={d.currentProblemPage === d.getTotalPages()}
												>
													다음
												</S.ProblemSelectPaginationBtn>
											</S.ProblemSelectPagination>
										)}
									</>
								) : (
									<S.NoData>
										<p>
											{d.problemSearchTerm
												? "검색 결과가 없습니다."
												: "사용 가능한 문제가 없습니다."}
										</p>
									</S.NoData>
								)}
							</S.ModalBody>
							<S.ModalFooter>
								<S.CancelButton type="button" onClick={d.closeProblemModal}>
									닫기
								</S.CancelButton>
								<S.SubmitButton
									type="button"
									onClick={() => d.setShowProblemModal(false)}
								>
									확인 ({d.selectedProblemIds.length}개 선택됨)
								</S.SubmitButton>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
}
