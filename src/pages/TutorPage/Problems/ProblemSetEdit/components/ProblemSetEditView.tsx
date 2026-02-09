import EmptyState from "../../../../../components/UI/EmptyState";
import Alert from "../../../../../components/UI/Alert";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import TutorLayout from "../../../../../layouts/TutorLayout";
import type { ProblemSetEditHookReturn } from "../hooks/useProblemSetEdit";
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
					<S.Title>{d.problemSet.title}</S.Title>
					{d.problemSet.description && (
						<S.Description>{d.problemSet.description}</S.Description>
					)}
				</S.Header>

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
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 추가</h2>
								<S.ModalCloseButton
									onClick={d.closeAddModal}
									disabled={d.isAdding}
								>
									×
								</S.ModalCloseButton>
							</S.ModalHeader>

							<S.SearchInput
								type="text"
								placeholder="문제명 또는 ID로 검색..."
								value={d.searchTerm}
								onChange={(e) => d.setSearchAndPage(e.target.value)}
							/>

							<div
								style={{
									display: "flex",
									gap: "0.5rem",
									marginBottom: "1rem",
								}}
							>
								<S.SelectAllButton
									className={d.filterType === "all" ? "active" : ""}
									onClick={() => d.setFilterAndPage("all")}
								>
									모든 문제
								</S.SelectAllButton>
								<S.SelectAllButton
									className={d.filterType === "available" ? "active" : ""}
									onClick={() => d.setFilterAndPage("available")}
								>
									추가 가능
								</S.SelectAllButton>
								<S.SelectAllButton
									className={d.filterType === "added" ? "active" : ""}
									onClick={() => d.setFilterAndPage("added")}
								>
									이미 추가됨
								</S.SelectAllButton>
							</div>

							{d.getFilteredProblems().length > 0 ? (
								<>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "1rem",
										}}
									>
										{d.filterType !== "added" && (
											<S.SelectAllButton onClick={d.handleSelectAll}>
												{allSelected ? "전체 해제" : "전체 선택"}
											</S.SelectAllButton>
										)}
										<span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
											{d.selectedProblemIds.length}개 선택됨 / 총{" "}
											{d.getFilteredProblems().length}개
										</span>
									</div>

									<div
										style={{
											maxHeight: "400px",
											overflowY: "auto",
											marginBottom: "1rem",
										}}
									>
										{d.paginatedProblems().map((problem) => {
											const isAdded = d.isProblemAdded(problem.id);
											const isSelected = d.selectedProblemIds.includes(
												problem.id,
											);
											return (
												<div
													key={problem.id}
													style={{
														padding: "1rem",
														border: `1px solid ${isSelected ? "#667eea" : isAdded ? "#d1d5db" : "#e5e7eb"}`,
														borderRadius: "6px",
														marginBottom: "0.5rem",
														cursor: isAdded ? "not-allowed" : "pointer",
														background: isSelected
															? "#f0f4ff"
															: isAdded
																? "#f9fafb"
																: "white",
														opacity: isAdded ? 0.6 : 1,
														display: "flex",
														alignItems: "center",
														gap: "1rem",
													}}
													onClick={() => d.handleProblemToggle(problem.id)}
												>
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => d.handleProblemToggle(problem.id)}
														onClick={(e) => e.stopPropagation()}
														disabled={isAdded}
													/>
													<div style={{ flex: 1 }}>
														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: "0.5rem",
																marginBottom: "0.25rem",
															}}
														>
															<span
																style={{
																	fontSize: "0.75rem",
																	padding: "0.2rem 0.5rem",
																	background: "#f3f4f6",
																	borderRadius: "4px",
																	color: "#6b7280",
																}}
															>
																#{problem.id}
															</span>
															<span
																style={{ fontWeight: 600, color: "#1f2937" }}
															>
																{problem.title}
															</span>
															{isAdded && (
																<span
																	style={{
																		fontSize: "0.75rem",
																		padding: "0.2rem 0.6rem",
																		background: "#e5e7eb",
																		borderRadius: "12px",
																		color: "#6b7280",
																	}}
																>
																	이미 추가됨
																</span>
															)}
														</div>
														<span
															style={{
																fontSize: "0.75rem",
																padding: "0.2rem 0.6rem",
																borderRadius: "12px",
																backgroundColor:
																	d.getDifficultyColor(problem.difficulty) +
																	"20",
																color: d.getDifficultyColor(problem.difficulty),
															}}
														>
															{d.getDifficultyLabel(problem.difficulty)}
														</span>
													</div>
												</div>
											);
										})}
									</div>

									{d.totalPages > 1 && (
										<div
											style={{
												display: "flex",
												justifyContent: "center",
												gap: "1rem",
												marginBottom: "1rem",
											}}
										>
											<S.SelectAllButton
												onClick={() =>
													d.setCurrentPage((prev) => Math.max(1, prev - 1))
												}
												disabled={d.currentPage === 1}
											>
												이전
											</S.SelectAllButton>
											<span
												style={{
													display: "flex",
													alignItems: "center",
													color: "#6b7280",
												}}
											>
												{d.currentPage} / {d.totalPages}
											</span>
											<S.SelectAllButton
												onClick={() =>
													d.setCurrentPage((prev) =>
														Math.min(d.totalPages, prev + 1),
													)
												}
												disabled={d.currentPage === d.totalPages}
											>
												다음
											</S.SelectAllButton>
										</div>
									)}
								</>
							) : (
								<div
									style={{
										padding: "3rem",
										textAlign: "center",
										color: "#9ca3af",
									}}
								>
									{d.searchTerm
										? "검색 결과가 없습니다."
										: "추가할 수 있는 문제가 없습니다."}
								</div>
							)}

							<S.ModalActions>
								<S.CancelButton onClick={d.closeAddModal} disabled={d.isAdding}>
									취소
								</S.CancelButton>
								<S.SubmitButton
									onClick={d.handleAddProblems}
									disabled={d.isAdding || d.selectedProblemIds.length === 0}
								>
									{d.isAdding
										? "추가 중..."
										: `추가 (${d.selectedProblemIds.length})`}
								</S.SubmitButton>
							</S.ModalActions>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
}
