import { createPortal } from "react-dom";
import EmptyState from "../../../../../components/UI/EmptyState";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import TutorLayout from "../../../../../layouts/TutorLayout";
import type { ProblemSetManagementHookReturn } from "../hooks/useProblemSetManagement";
import * as S from "../styles";

export default function ProblemSetManagementView(
	d: ProblemSetManagementHookReturn,
) {
	if (d.loading) {
		return (
			<TutorLayout>
				<LoadingSpinner message="문제집 목록을 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			{d.isCreating &&
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
							<LoadingSpinner message="문제집 생성 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.Container>
				<S.TitleHeader>
					<S.TitleLeft>
						<S.Title>문제집 관리</S.Title>
						<S.TitleStats>
							<S.StatBadge>총 {d.filteredSets.length}개 문제집</S.StatBadge>
						</S.TitleStats>
					</S.TitleLeft>
					<S.CreateButton
						onClick={() => {
							d.setCurrentStep(1);
							d.openCreateModal();
						}}
					>
						+ 새 문제집 만들기
					</S.CreateButton>
				</S.TitleHeader>

				<S.FiltersSection>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="문제집명으로 검색..."
							value={d.searchTerm}
							onChange={(e) => d.setSearchTerm(e.target.value)}
						/>
					</S.SearchBox>
				</S.FiltersSection>

				<S.TableContainer>
					{d.filteredSets.length > 0 ? (
						<S.Table>
							<thead>
								<tr>
									<S.Th>문제집 제목</S.Th>
									<S.Th $alignRight>문제 수</S.Th>
									<S.Th $alignRight>생성일</S.Th>
									<S.Th $alignRight>관리</S.Th>
								</tr>
							</thead>
							<tbody>
								{d.filteredSets.map((set) => (
									<tr key={set.id}>
										<S.Td>
											<S.TitleWrapper
												onClick={() =>
													d.navigate(`/tutor/problems/sets/${set.id}/edit`)
												}
											>
												<S.TitleContent>
													<S.TitleText>{set.title}</S.TitleText>
													{set.description && (
														<S.Description>{set.description}</S.Description>
													)}
												</S.TitleContent>
											</S.TitleWrapper>
										</S.Td>
										<S.Td $alignRight>{set.problemCount || 0}개</S.Td>
										<S.Td $alignRight>{d.formatDate(set.createdAt)}</S.Td>
										<S.Td $alignRight>
											<S.ActionsCell>
												<S.ActionButton
													type="button"
													className="delete"
													onClick={(e) => {
														e.stopPropagation();
														d.handleDeleteSet(set);
													}}
												>
													삭제
												</S.ActionButton>
											</S.ActionsCell>
										</S.Td>
									</tr>
								))}
							</tbody>
						</S.Table>
					) : (
						<EmptyState
							title="등록된 문제집이 없습니다"
							message="새로운 문제집을 만들어보세요"
							actionLabel="새 문제집 만들기"
							onAction={() => d.openCreateModal()}
						/>
					)}
				</S.TableContainer>

				{d.showCreateModal && d.currentStep === 1 && (
					<S.ModalOverlay onClick={() => !d.isCreating && d.closeCreateModal()}>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2 style={{ color: "white" }}>새 문제집 만들기</h2>
								<S.ModalClose
									type="button"
									onClick={() => !d.isCreating && d.closeCreateModal()}
									disabled={d.isCreating}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.FormGroup>
									<S.Label htmlFor="set-title">문제집 제목 *</S.Label>
									<S.Input
										id="set-title"
										type="text"
										value={d.newSetTitle}
										onChange={(e) => d.setNewSetTitle(e.target.value)}
										placeholder="문제집 제목을 입력하세요"
										disabled={d.isCreating}
									/>
								</S.FormGroup>
								<S.FormGroup>
									<S.Label htmlFor="set-description">설명 (선택)</S.Label>
									<S.Textarea
										id="set-description"
										value={d.newSetDescription}
										onChange={(e) => d.setNewSetDescription(e.target.value)}
										placeholder="문제집에 대한 설명을 입력하세요"
										rows={4}
										disabled={d.isCreating}
									/>
								</S.FormGroup>
							</S.ModalBody>
							<S.ModalFooter>
								<S.CancelButton
									type="button"
									onClick={d.closeCreateModal}
									disabled={d.isCreating}
								>
									취소
								</S.CancelButton>
								<S.SubmitButton
									type="button"
									onClick={d.handleNextToProblemSelect}
									disabled={d.isCreating || !d.newSetTitle.trim()}
								>
									다음
								</S.SubmitButton>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{d.showProblemSelectModal && d.currentStep === 2 && (
					<S.ModalOverlay
						onClick={() => !d.isCreating && d.closeProblemSelectModal()}
					>
						<S.ModalContent $wide onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 선택 - {d.newSetTitle}</h2>
								<S.ModalClose
									type="button"
									onClick={() => !d.isCreating && d.closeProblemSelectModal()}
									disabled={d.isCreating}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.ProblemFilterSection>
									<S.ProblemSearchInput
										type="text"
										placeholder="문제명 또는 ID로 검색..."
										value={d.problemSearchTerm}
										onChange={(e) => {
											d.setProblemSearchTerm(e.target.value);
											d.setCurrentPage(1);
										}}
									/>
								</S.ProblemFilterSection>
								{d.getFilteredProblems().length > 0 ? (
									<>
										<S.ProblemModalActions>
											<S.SelectAllButton
												type="button"
												onClick={d.handleSelectAllProblems}
											>
												{d
													.getFilteredProblems()
													.every((pr) => d.selectedProblemIds.includes(pr.id))
													? "전체 해제"
													: "전체 선택"}
											</S.SelectAllButton>
											<S.SelectedCount>
												{d.selectedProblemIds.length}개 선택됨
											</S.SelectedCount>
											<S.FilterCount>
												총 {d.getFilteredProblems().length}개 문제
											</S.FilterCount>
										</S.ProblemModalActions>
										<S.ProblemList>
											{d.getPaginatedProblems().map((problem) => {
												const isSelected = d.selectedProblemIds.includes(
													problem.id,
												);
												const diffColor = d.getDifficultyColor(
													problem.difficulty,
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
														<S.ProblemItemInfo>
															<S.ProblemItemTitleRow>
																<S.ProblemIdBadge>
																	#{problem.id}
																</S.ProblemIdBadge>
																<S.ProblemItemTitle>
																	{problem.title}
																</S.ProblemItemTitle>
															</S.ProblemItemTitleRow>
															<S.ProblemItemMeta>
																<S.DifficultyBadge
																	$bg={`${diffColor}20`}
																	$color={diffColor}
																>
																	{d.getDifficultyLabel(problem.difficulty)}
																</S.DifficultyBadge>
															</S.ProblemItemMeta>
														</S.ProblemItemInfo>
													</S.ProblemItem>
												);
											})}
										</S.ProblemList>
										{d.getTotalPages() > 1 && (
											<S.PaginationRow>
												<S.PaginationBtn
													type="button"
													onClick={() =>
														d.setCurrentPage(Math.max(1, d.currentPage - 1))
													}
													disabled={d.currentPage === 1}
												>
													이전
												</S.PaginationBtn>
												<S.PaginationInfo>
													{d.currentPage} / {d.getTotalPages()}
												</S.PaginationInfo>
												<S.PaginationBtn
													type="button"
													onClick={() =>
														d.setCurrentPage(
															Math.min(d.getTotalPages(), d.currentPage + 1),
														)
													}
													disabled={d.currentPage === d.getTotalPages()}
												>
													다음
												</S.PaginationBtn>
											</S.PaginationRow>
										)}
									</>
								) : (
									<S.ProblemListEmpty>
										{d.problemSearchTerm
											? "검색 결과가 없습니다."
											: "사용 가능한 문제가 없습니다."}
									</S.ProblemListEmpty>
								)}
							</S.ModalBody>
							<S.ModalFooter>
								<S.CancelButton
									type="button"
									onClick={() => {
										d.closeProblemSelectModal();
										d.openCreateModal();
									}}
									disabled={d.isCreating}
								>
									이전
								</S.CancelButton>
								<S.CancelButton
									type="button"
									onClick={d.handleSkipProblemSelect}
									disabled={d.isCreating}
								>
									건너뛰기
								</S.CancelButton>
								<S.CancelButton
									type="button"
									onClick={d.closeProblemSelectModal}
									disabled={d.isCreating}
								>
									취소
								</S.CancelButton>
								<S.SubmitButton
									type="button"
									onClick={() => d.handleCreateSetWithProblems()}
									disabled={d.isCreating}
								>
									{d.isCreating
										? "생성 중..."
										: `생성${d.selectedProblemIds.length > 0 ? ` (${d.selectedProblemIds.length}개 문제)` : ""}`}
								</S.SubmitButton>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
}
