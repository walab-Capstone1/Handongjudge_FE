import { removeCopyLabel } from "../../../../../utils/problemUtils";
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
		<div
			className="assignment-management-problem-list-modal-overlay"
			onClick={onClose}
			onKeyDown={() => {}}
			role="presentation"
		>
			<div
				className="assignment-management-problem-list-modal-content assignment-management-problem-list-modal-content-extra-large"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div className="assignment-management-problem-list-modal-header">
					<h2>문제 목록 관리 - {selectedAssignment.title}</h2>
					<button
						type="button"
						className="assignment-management-problem-list-modal-close"
						onClick={onClose}
					>
						✕
					</button>
				</div>

				<div className="assignment-management-problem-list-modal-body">
					<div className="tutor-filters-section">
						<div className="tutor-search-box">
							<input
								type="text"
								placeholder="문제 ID, 제목으로 검색..."
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
								className="tutor-search-input"
							/>
						</div>
					</div>

					{selectedAssignment.problems &&
					selectedAssignment.problems.length > 0 ? (
						filteredProblems.length > 0 ? (
							<div className="tutor-problems-table-container">
								<table className="tutor-problems-table">
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
													<td className="tutor-problem-title-cell">
														<button
															type="button"
															className="tutor-btn-link"
															onClick={() => onProblemDetail?.(problem.id)}
														>
															{removeCopyLabel(problem.title ?? "")}
														</button>
													</td>
													<td>{problem.difficulty ?? "N/A"}</td>
													<td>{getStatusText()}</td>
													<td>
														<button
															type="button"
															className="tutor-btn-table-action"
															onClick={() => onProblemViewDetail?.(problem.id)}
														>
															설명보기
														</button>
														<button
															type="button"
															className="tutor-btn-table-action"
															onClick={() => onEditProblem(problem.id)}
														>
															수정
														</button>
														<button
															type="button"
															className="tutor-btn-table-action tutor-btn-delete"
															onClick={() =>
																onRemoveProblem(
																	selectedAssignment.id,
																	problem.id,
																)
															}
														>
															제거
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						) : (
							<div className="tutor-no-problems">
								<p>검색 조건에 맞는 문제가 없습니다.</p>
							</div>
						)
					) : (
						<div className="tutor-no-problems">
							<p>등록된 문제가 없습니다.</p>
							<button
								type="button"
								className="tutor-btn-primary"
								onClick={() => {
									onClose();
									onAddProblem(selectedAssignment);
								}}
							>
								첫 번째 문제 추가하기
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
