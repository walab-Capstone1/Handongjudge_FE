import type { FC } from "react";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";

interface ProblemSelectModalProps {
	d: CodingTestManagementHookReturn;
}

const ProblemSelectModal: FC<ProblemSelectModalProps> = ({ d }) => {
	if (!d.showProblemModal) return null;

	return (
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
									const isSelected = d.selectedProblemIds.includes(problem.id);
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
													<S.ProblemIdBadge>#{problem.id}</S.ProblemIdBadge>
													<S.ProblemTitle>{problem.title}</S.ProblemTitle>
												</div>
												{problem.difficulty && (
													<S.ProblemDifficulty
														$color={d.getDifficultyColor(problem.difficulty)}
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
										onClick={() => d.setCurrentProblemPage((p) => Math.max(1, p - 1))}
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
					<S.SubmitButton type="button" onClick={() => d.setShowProblemModal(false)}>
						확인 ({d.selectedProblemIds.length}개 선택됨)
					</S.SubmitButton>
				</S.ModalFooter>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default ProblemSelectModal;
