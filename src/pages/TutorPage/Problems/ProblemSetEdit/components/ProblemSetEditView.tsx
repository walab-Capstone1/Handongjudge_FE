import { createPortal } from "react-dom";
import EmptyState from "../../../../../components/UI/EmptyState";
import Alert from "../../../../../components/UI/Alert";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import TutorLayout from "../../../../../layouts/TutorLayout";
import type { ProblemSetEditHookReturn } from "../hooks/useProblemSetEdit";
import * as CreateS from "../../ProblemCreate/styles";
import {
	ProblemSelectColumn,
	ProblemPanelTitle,
	ProblemPanelHint,
	SelectedProblemScroll,
	SelectedProblemRow,
	SelectedProblemTitle,
	RemoveFromSetButton,
} from "../../ProblemSetManagement/styles";
import * as S from "../styles";

export default function ProblemSetEditView(d: ProblemSetEditHookReturn) {
	if (d.loading) {
		return (
			<TutorLayout>
				<LoadingSpinner message="문제집 정보를 불러오는 중..." />
			</TutorLayout>
		);
	}

	if (!d.problemSet) {
		return (
			<TutorLayout>
				<S.Container>
					<EmptyState
						title="문제집을 찾을 수 없습니다"
						message="존재하지 않거나 접근 권한이 없는 문제집입니다"
						actionLabel="돌아가기"
						onAction={() => d.navigate("/tutor/problems/sets")}
					/>
				</S.Container>
			</TutorLayout>
		);
	}

	const filteredList = d.getFilteredProblems();
	const availableInFilter = filteredList.filter((p) => !d.isProblemAdded(p.id));
	const allSelected =
		availableInFilter.length > 0 &&
		availableInFilter.every((p) => d.selectedProblemIds.includes(p.id));

	return (
		<TutorLayout>
			{d.isAdding &&
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
							<LoadingSpinner message="문제 추가 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.Container>
				{d.alertMessage && (
					<Alert
						type={d.alertType}
						message={d.alertMessage}
						onClose={() => d.setAlertMessage(null)}
					/>
				)}

				<S.Header>
					<S.BackButton onClick={() => d.navigate("/tutor/problems/sets")}>
						← 문제집 목록으로
					</S.BackButton>
					<S.TitleRow>
						<S.Title>{d.problemSet.title}</S.Title>
						<S.EditMetaButton
							type="button"
							onClick={d.openEditSetModal}
						>
							수정
						</S.EditMetaButton>
					</S.TitleRow>
					{d.problemSet.description ? (
						<S.Description>{d.problemSet.description}</S.Description>
					) : (
						<S.Description style={{ fontStyle: "italic" }}>
							설명 없음
						</S.Description>
					)}
				</S.Header>

				{d.showEditSetModal && (
					<S.ModalOverlay onClick={d.closeEditSetModal}>
						<S.ModalContentCompact
							onClick={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2>문제집 정보 수정</h2>
								<S.ModalCloseButton
									type="button"
									onClick={d.closeEditSetModal}
									disabled={d.isSavingSet}
								>
									×
								</S.ModalCloseButton>
							</S.ModalHeader>
							<S.FormGroup>
								<S.Label htmlFor="edit-set-title">문제집 이름 *</S.Label>
								<S.FormInput
									id="edit-set-title"
									value={d.editSetTitle}
									onChange={(e) => d.setEditSetTitle(e.target.value)}
									placeholder="문제집 제목"
									disabled={d.isSavingSet}
								/>
							</S.FormGroup>
							<S.FormGroup>
								<S.Label htmlFor="edit-set-desc">설명</S.Label>
								<S.FormTextarea
									id="edit-set-desc"
									value={d.editSetDescription}
									onChange={(e) => d.setEditSetDescription(e.target.value)}
									placeholder="문제집 설명 (선택)"
									disabled={d.isSavingSet}
								/>
							</S.FormGroup>
							<S.ModalActions>
								<S.CancelButton
									type="button"
									onClick={d.closeEditSetModal}
									disabled={d.isSavingSet}
								>
									취소
								</S.CancelButton>
								<S.SubmitButton
									type="button"
									onClick={d.handleSaveProblemSetInfo}
									disabled={
										d.isSavingSet || !d.editSetTitle.trim()
									}
								>
									{d.isSavingSet ? "저장 중..." : "저장"}
								</S.SubmitButton>
							</S.ModalActions>
						</S.ModalContentCompact>
					</S.ModalOverlay>
				)}

				<S.Actions>
					<S.AddButton onClick={() => d.setShowAddModal(true)}>
						+ 문제 추가
					</S.AddButton>
				</S.Actions>

				{d.problems.length > 0 ? (
					<S.ProblemsGrid>
						{d.problems.map((problem, index) => (
							<S.ProblemCard key={problem.id}>
								<S.ProblemHeader>
									<S.ProblemInfo>
										<S.ProblemTitle>
											{index + 1}. {problem.title}
										</S.ProblemTitle>
										<S.ProblemMeta>
											<S.Badge
												style={{
													background: "#f3f4f6",
													color: "#6b7280",
												}}
											>
												#{problem.id}
											</S.Badge>
											<S.Badge
												style={{
													backgroundColor:
														d.getDifficultyColor(problem.difficulty) + "20",
													color: d.getDifficultyColor(problem.difficulty),
												}}
											>
												{d.getDifficultyLabel(problem.difficulty)}
											</S.Badge>
										</S.ProblemMeta>
									</S.ProblemInfo>
									<S.RemoveButton
										onClick={() => d.handleRemoveProblem(problem.id)}
										disabled={d.isRemoving}
									>
										제거
									</S.RemoveButton>
								</S.ProblemHeader>
							</S.ProblemCard>
						))}
					</S.ProblemsGrid>
				) : (
					<EmptyState
						title="등록된 문제가 없습니다"
						message="문제를 추가하여 문제집을 구성해보세요"
						actionLabel="문제 추가"
						onAction={() => d.setShowAddModal(true)}
					/>
				)}

				{d.showAddModal && (
					<S.ModalOverlay onClick={d.closeAddModal}>
						<S.AddProblemModalOuter
							onClick={(e) => e.stopPropagation()}
							aria-labelledby="add-problem-modal-title"
						>
							<S.AddProblemModalHeaderBar>
								<CreateS.PageHeader
									style={{ marginBottom: 0, alignItems: "center" }}
								>
									<CreateS.PageTitle
										id="add-problem-modal-title"
										style={{ fontSize: "1.5rem" }}
									>
										문제 추가
									</CreateS.PageTitle>
									<CreateS.CancelHeaderButton
										type="button"
										onClick={d.closeAddModal}
										disabled={d.isAdding}
									>
										닫기
									</CreateS.CancelHeaderButton>
								</CreateS.PageHeader>
							</S.AddProblemModalHeaderBar>

							{d.addModalProblemsLoading ? (
								<S.ModalLoadingBox>
									<LoadingSpinner message="문제 목록을 불러오는 중..." />
								</S.ModalLoadingBox>
							) : (
								<>
									<S.AddModalBodyTwoCol>
										<ProblemSelectColumn $accent>
											<ProblemPanelTitle>
												문제집에 넣을 문제 ({d.selectedProblemIds.length})
											</ProblemPanelTitle>
											<ProblemPanelHint>
												오른쪽에서 고른 문제가 여기 쌓입니다. 맨 위가 가장
												최근에 고른 문제입니다. 문제집에 반영하려면 하단
												「선택한 문제 추가」를 누르세요.
											</ProblemPanelHint>
											<SelectedProblemScroll>
												{d.selectedProblemsNewestFirst.length === 0 ? (
													<S.EmptyProblemsHint
														style={{
															padding: "2rem 1rem",
															fontSize: "0.875rem",
														}}
													>
														아직 고른 문제가 없습니다. 오른쪽 목록에서
														추가하세요.
													</S.EmptyProblemsHint>
												) : (
													d.selectedProblemsNewestFirst.map((problem) => (
														<SelectedProblemRow key={problem.id}>
															<S.AddIdBadge>#{problem.id}</S.AddIdBadge>
															<SelectedProblemTitle title={problem.title}>
																{problem.title}
															</SelectedProblemTitle>
															<RemoveFromSetButton
																type="button"
																onClick={() =>
																	d.handleProblemToggle(problem.id)
																}
															>
																빼기
															</RemoveFromSetButton>
														</SelectedProblemRow>
													))
												)}
											</SelectedProblemScroll>
										</ProblemSelectColumn>

										<S.AddModalRightPanel>
											<S.SectionSegment>
												<S.SectionTab
													type="button"
													$active={d.filterType === "all"}
													onClick={() => d.setFilterAndPage("all")}
												>
													전체
												</S.SectionTab>
												<S.SectionTab
													type="button"
													$active={d.filterType === "available"}
													onClick={() =>
														d.setFilterAndPage("available")
													}
												>
													추가 가능
												</S.SectionTab>
												<S.SectionTab
													type="button"
													$active={d.filterType === "added"}
													onClick={() => d.setFilterAndPage("added")}
												>
													이미 추가됨
												</S.SectionTab>
											</S.SectionSegment>

											<S.MetaText
												as="div"
												style={{
													fontWeight: 700,
													color: "#4338ca",
													fontSize: "0.75rem",
													textTransform: "uppercase",
													letterSpacing: "0.04em",
													marginBottom: "0.75rem",
												}}
											>
												{d.filterType === "all" && "전체 문제"}
												{d.filterType === "available" &&
													"추가 가능한 문제 (아직 문제집에 없음)"}
												{d.filterType === "added" &&
													"이미 이 문제집에 포함된 문제"}
												{" · 최근 등록 순"}
											</S.MetaText>

											<S.AddModalSearchRow>
												<S.AddModalSearchInput
													type="text"
													placeholder="문제명 또는 ID 검색..."
													value={d.searchTerm}
													onChange={(e) =>
														d.setSearchAndPage(e.target.value)
													}
												/>
												<S.AddModalOriginalSelect
													value={d.originalOnly}
													onChange={(e) =>
														d.setOriginalOnlyAndPage(
															e.target.value as "ALL" | "ORIGINAL",
														)
													}
													aria-label="원본 문제만 보기"
												>
													<option value="ALL">전체 문제</option>
													<option value="ORIGINAL">
														원본(_오리지널)만
													</option>
												</S.AddModalOriginalSelect>
											</S.AddModalSearchRow>

											{d.getFilteredProblems().length > 0 ? (
												<>
													<S.AddProblemToolbar>
														{d.filterType !== "added" ? (
															<CreateS.CancelHeaderButton
																type="button"
																style={{
																	padding: "0.5rem 1rem",
																	fontSize: "0.875rem",
																}}
																onClick={d.handleSelectAll}
															>
																{allSelected
																	? "필터 결과 전체 해제"
																	: "필터 결과 전체 선택"}
															</CreateS.CancelHeaderButton>
														) : (
															<span />
														)}
														<S.MetaText>
															표시 {d.getFilteredProblems().length}개
														</S.MetaText>
													</S.AddProblemToolbar>

													<S.AddModalListWhite>
														{d.paginatedProblems().map((problem) => {
															const isAdded = d.isProblemAdded(
																problem.id,
															);
															const isSelected =
																d.selectedProblemIds.includes(
																	problem.id,
																);
															const diffColor = `${d.getDifficultyColor(problem.difficulty)}`;
															return (
																<S.AddProblemCard
																	key={problem.id}
																	$selected={isSelected}
																	$disabled={isAdded}
																	style={{ marginBottom: "0.5rem" }}
																	onClick={() =>
																		d.handleProblemToggle(
																			problem.id,
																		)
																	}
																>
																	<input
																		type="checkbox"
																		checked={isSelected}
																		onChange={() =>
																			d.handleProblemToggle(
																				problem.id,
																			)
																		}
																		onClick={(e) =>
																			e.stopPropagation()
																		}
																		disabled={isAdded}
																		aria-label={`${problem.title} 선택`}
																	/>
																	<S.AddProblemCardBody>
																		<S.AddProblemCardTitleRow>
																			<S.AddIdBadge>
																				#{problem.id}
																			</S.AddIdBadge>
																			<S.AddProblemTitleText>
																				{problem.title}
																			</S.AddProblemTitleText>
																			{isAdded && (
																				<S.AddedPill>
																					이미 추가됨
																				</S.AddedPill>
																			)}
																		</S.AddProblemCardTitleRow>
																		<S.DiffPill
																			$bg={`${diffColor}22`}
																			$color={diffColor}
																		>
																			{d.getDifficultyLabel(
																				problem.difficulty,
																			)}
																		</S.DiffPill>
																	</S.AddProblemCardBody>
																</S.AddProblemCard>
															);
														})}
													</S.AddModalListWhite>

													{d.getFilteredProblems().length > 10 && (
														<S.PaginationBar>
															<CreateS.CancelHeaderButton
																type="button"
																style={{
																	padding: "0.45rem 1rem",
																	fontSize: "0.85rem",
																}}
																onClick={() =>
																	d.setCurrentPage((prev) =>
																		Math.max(1, prev - 1),
																	)
																}
																disabled={d.currentPage === 1}
															>
																이전
															</CreateS.CancelHeaderButton>
															<S.MetaText>
																{d.currentPage} / {d.totalPages}
															</S.MetaText>
															<CreateS.CancelHeaderButton
																type="button"
																style={{
																	padding: "0.45rem 1rem",
																	fontSize: "0.85rem",
																}}
																onClick={() =>
																	d.setCurrentPage((prev) =>
																		Math.min(
																			d.totalPages,
																			prev + 1,
																		),
																	)
																}
																disabled={
																	d.currentPage === d.totalPages
																}
															>
																다음
															</CreateS.CancelHeaderButton>
														</S.PaginationBar>
													)}
												</>
											) : (
												<S.EmptyProblemsHint>
													{d.searchTerm || d.originalOnly === "ORIGINAL"
														? "조건에 맞는 문제가 없습니다."
														: d.filterType === "available"
															? "추가 가능한 문제가 없습니다."
															: d.filterType === "added"
																? "아직 문제집에 문제가 없습니다."
																: "문제가 없습니다."}
												</S.EmptyProblemsHint>
											)}
										</S.AddModalRightPanel>
									</S.AddModalBodyTwoCol>

									<S.AddModalFooterBar>
										<CreateS.CancelHeaderButton
											type="button"
											onClick={d.closeAddModal}
											disabled={d.isAdding}
										>
											취소
										</CreateS.CancelHeaderButton>
										<CreateS.TagAddButton
											type="button"
											onClick={d.handleAddProblems}
											disabled={
												d.isAdding || d.selectedProblemIds.length === 0
											}
										>
											{d.isAdding
												? "추가 중..."
												: `선택한 문제 추가 (${d.selectedProblemIds.length})`}
										</CreateS.TagAddButton>
									</S.AddModalFooterBar>
								</>
							)}
						</S.AddProblemModalOuter>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
}
