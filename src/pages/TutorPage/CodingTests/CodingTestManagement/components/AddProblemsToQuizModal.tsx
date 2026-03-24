import type { FC } from "react";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";

interface AddProblemsToQuizModalProps {
	d: CodingTestManagementHookReturn;
}

const AddProblemsToQuizModal: FC<AddProblemsToQuizModalProps> = ({ d }) => {
	if (!d.showAddProblemModal) return null;

	return (
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
									const isSelected = d.selectedProblemIds.includes(problem.id);
									const isAlreadyAdded = d.problems.some((p) => p.id === problem.id);
									return (
										<S.ProblemItem
											key={problem.id}
											$selected={isSelected && !isAlreadyAdded}
											$disabled={isAlreadyAdded}
											onClick={() =>
												!isAlreadyAdded && d.handleProblemToggle(problem.id)
											}
										>
											<input
												type="checkbox"
												checked={isSelected && !isAlreadyAdded}
												onChange={() =>
													!isAlreadyAdded && d.handleProblemToggle(problem.id)
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
													<S.ProblemIdBadge>#{problem.id}</S.ProblemIdBadge>
													<S.ProblemTitle>{problem.title}</S.ProblemTitle>
													{isAlreadyAdded && (
														<S.AlreadyAddedBadge>이미 추가됨</S.AlreadyAddedBadge>
													)}
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
					<S.CancelButton type="button" onClick={d.closeAddProblemModal}>
						취소
					</S.CancelButton>
					<S.SubmitButton type="button" onClick={d.handleAddProblemsToQuiz}>
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
	);
};

export default AddProblemsToQuizModal;
