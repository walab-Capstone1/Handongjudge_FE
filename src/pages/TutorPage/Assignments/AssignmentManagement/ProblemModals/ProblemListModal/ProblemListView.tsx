import * as S from "../../AssignmentModals/styles";
import { removeCopyLabel } from "../../../../../../utils/problemUtils";
import type { ProblemListViewProps } from "../types";

/**
 * 문제 목록 모달 - 목록 모드 UI (검색, 테이블, 빈 상태)
 */
export default function ProblemListView({
	selectedAssignment,
	submissionStats,
	searchTerm,
	filteredProblems,
	onClose,
	onAddProblem,
	onRemoveProblem,
	onProblemDetail,
	onProblemViewDetail,
	onSearchChange,
	onEditProblem,
}: ProblemListViewProps) {
	return (
		<S.Overlay onClick={onClose} onKeyDown={() => {}} role="presentation">
			<S.Content
				$extraLarge
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<S.Header>
					<h2>문제 목록 관리 - {selectedAssignment.title}</h2>
					<S.CloseButton type="button" onClick={onClose}>
						✕
					</S.CloseButton>
				</S.Header>

				<S.Body>
					<S.FiltersSection>
						<S.SearchBox>
							<S.SearchInput
								type="text"
								placeholder="문제 ID, 제목으로 검색..."
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
							/>
						</S.SearchBox>
					</S.FiltersSection>

					{selectedAssignment.problems &&
					selectedAssignment.problems.length > 0 ? (
						filteredProblems.length > 0 ? (
							<S.TableContainer>
								<S.StyledTable>
									<thead>
										<tr>
											<th>ID</th>
											<th>제목</th>
											<th>난이도</th>
											<th>상태</th>
											<th>관리</th>
										</tr>
									</thead>
									<tbody>
										{filteredProblems.map((problem, index) => {
											const problemStat = submissionStats[
												selectedAssignment.id
											]?.problemStats?.find(
												(stat) => stat.problemId === problem.id,
											);

											const getStatusText = () => {
												if (problemStat) {
													const correctCount =
														problemStat.correctSubmissions ?? 0;
													const totalCount = problemStat.totalStudents ?? 0;
													return `${correctCount}/${totalCount}명 완료`;
												}
												const totalStudents =
													submissionStats[selectedAssignment.id]
														?.totalStudents ?? 0;
												return `0/${totalStudents}명 완료`;
											};

											return (
												<tr key={problem.id ?? index}>
													<td>{problem.id}</td>
													<S.ProblemTitleCell as="td">
														<S.BtnLink
															type="button"
															onClick={() => onProblemDetail?.(problem.id)}
														>
															{removeCopyLabel(problem.title ?? "")}
														</S.BtnLink>
													</S.ProblemTitleCell>
													<td>{problem.difficulty ?? "N/A"}</td>
													<td>{getStatusText()}</td>
													<td>
														<S.BtnTableAction
															type="button"
															onClick={() => onProblemViewDetail?.(problem.id)}
														>
															설명보기
														</S.BtnTableAction>
														<S.BtnTableAction
															type="button"
															onClick={() => onEditProblem(problem.id)}
														>
															수정
														</S.BtnTableAction>
														<S.BtnTableActionDelete
															type="button"
															onClick={() =>
																onRemoveProblem(
																	selectedAssignment.id,
																	problem.id,
																)
															}
														>
															제거
														</S.BtnTableActionDelete>
													</td>
												</tr>
											);
										})}
									</tbody>
								</S.StyledTable>
							</S.TableContainer>
						) : (
							<S.NoProblems>
								<p>검색 조건에 맞는 문제가 없습니다.</p>
							</S.NoProblems>
						)
					) : (
						<S.NoProblems>
							<p>등록된 문제가 없습니다.</p>
							<S.BtnPrimary
								type="button"
								onClick={() => {
									onClose();
									onAddProblem(selectedAssignment);
								}}
							>
								첫 번째 문제 추가하기
							</S.BtnPrimary>
						</S.NoProblems>
					)}
				</S.Body>
			</S.Content>
		</S.Overlay>
	);
}
