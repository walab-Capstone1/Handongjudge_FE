import type React from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../../components/Navigation/SectionNavigation";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";
import MainTabView from "./tabs/MainTabView";
import ProblemsTabView from "./tabs/ProblemsTabView";
import SubmissionsTabView from "./tabs/SubmissionsTabView";

function getStatusBadge(status: string) {
	switch (status) {
		case "ACTIVE":
			return <S.StatusBadge $status="active">진행중</S.StatusBadge>;
		case "WAITING":
			return <S.StatusBadge $status="waiting">대기중</S.StatusBadge>;
		case "PAUSED":
			return <S.StatusBadge $status="paused">일시정지</S.StatusBadge>;
		case "ENDED":
			return <S.StatusBadge $status="ended">종료</S.StatusBadge>;
		default:
			return <S.StatusBadge $status={undefined}>{status ?? "-"}</S.StatusBadge>;
	}
}

function getResultLabel(result: string) {
	const labels: Record<string, string> = {
		AC: "정답",
		WA: "오답",
		TLE: "시간초과",
		RE: "런타임에러",
		CE: "컴파일에러",
		MLE: "메모리초과",
		OLE: "출력초과",
	};
	return labels[result] ?? result ?? "-";
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
								{d.activeTab === "main" && <MainTabView d={d} />}
								{d.activeTab === "problems" && <ProblemsTabView d={d} />}
								{d.activeTab === "submissions" && <SubmissionsTabView d={d} />}
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

					{/* 제출 코드 상세보기 모달 */}
					{d.showCodeModal && (
						<S.ModalOverlay onClick={d.closeCodeModal}>
							<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
								<S.ModalHeader>
									<h2>제출 코드 상세</h2>
									<S.ModalClose type="button" onClick={d.closeCodeModal}>
										×
									</S.ModalClose>
								</S.ModalHeader>
								<S.ModalBody>
									{d.submissionCodeLoading ? (
										<S.NoData>
											<p>코드를 불러오는 중...</p>
										</S.NoData>
									) : d.submissionCodeData ? (
										<>
											<div
												style={{
													display: "flex",
													gap: "1rem",
													marginBottom: "1rem",
													flexWrap: "wrap",
												}}
											>
												<span>
													<strong>문제:</strong>{" "}
													{removeCopyLabel(d.submissionCodeData.problemTitle)}
												</span>
												<span>
													<strong>결과:</strong>{" "}
													{getResultLabel(d.submissionCodeData.result)}
												</span>
												<span>
													<strong>제출시간:</strong>{" "}
													{d.formatDateTime(d.submissionCodeData.submittedAt)}
												</span>
												<span>
													<strong>언어:</strong>{" "}
													{d.submissionCodeData.language ?? "-"}
												</span>
											</div>
											<pre
												style={{
													background: "#1e293b",
													color: "#e2e8f0",
													padding: "1rem",
													borderRadius: "8px",
													overflow: "auto",
													maxHeight: "400px",
													fontSize: "0.875rem",
													whiteSpace: "pre-wrap",
													wordBreak: "break-word",
												}}
											>
												{d.submissionCodeData.code}
											</pre>
										</>
									) : (
										<S.NoData>
											<p>코드를 불러올 수 없습니다.</p>
										</S.NoData>
									)}
								</S.ModalBody>
								<S.ModalFooter>
									<S.CancelButton type="button" onClick={d.closeCodeModal}>
										닫기
									</S.CancelButton>
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
								<option value="PAUSED">일시정지</option>
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
