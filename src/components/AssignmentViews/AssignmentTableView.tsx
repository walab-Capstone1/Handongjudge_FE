import type React from "react";
import AssignmentPagination from "../Pagination/AssignmentPagination";

interface Assignment {
	id: number;
	sectionId: number;
	title: string;
	description?: string;
	dueDate?: string;
	problemCount?: number;
	totalStudents?: number;
	active?: boolean;
	problems?: { id: number; title?: string }[];
}

interface SubmissionStats {
	[key: number]: {
		submittedStudents: number;
		totalStudents: number;
	};
}

interface PaginationProps {
	totalItems: number;
	currentPage: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	onItemsPerPageChange: (itemsPerPage: number) => void;
	showItemsPerPage?: boolean;
}

interface AssignmentTableViewProps {
	paginatedAssignments: Assignment[];
	submissionStats: SubmissionStats;
	openMoreMenu: number | null;
	onToggleMoreMenu: (id: number | null) => void;
	onProblemListManage: (assignment: Assignment) => void;
	onAddProblem: (assignment: Assignment) => void;
	onEdit: (assignment: Assignment) => void;
	onToggleActive: (
		sectionId: number,
		assignmentId: number,
		active?: boolean,
	) => void;
	onDelete: (assignmentId: number) => void;
	paginationProps: PaginationProps;
}

/**
 * 과제 테이블 뷰 컴포넌트 (분반별 페이지용)
 */
const AssignmentTableView: React.FC<AssignmentTableViewProps> = ({
	paginatedAssignments,
	submissionStats,
	openMoreMenu,
	onToggleMoreMenu,
	onProblemListManage,
	onAddProblem,
	onEdit,
	onToggleActive,
	onDelete,
	paginationProps,
}) => {
	return (
		<div className="tutor-assignments-table-container">
			<table className="tutor-assignments-table">
				<thead>
					<tr>
						<th className="tutor-assignment-title-cell">과제 제목</th>
						<th className="tutor-assignment-due-date-cell">마감일</th>
						<th className="tutor-assignment-problem-count-cell">문제 수</th>
						<th className="tutor-assignment-submission-cell">제출 현황</th>
						<th className="tutor-assignment-actions-cell">관리</th>
					</tr>
				</thead>
				<tbody>
					{paginationProps.totalItems === 0 ? (
						<tr>
							<td colSpan={5} className="tutor-table-empty">
								과제가 없습니다.
							</td>
						</tr>
					) : (
						paginatedAssignments.map((assignment) => (
							<tr
								key={assignment.id}
								className={assignment.active === false ? "tutor-disabled" : ""}
							>
								<td className="tutor-assignment-title-cell">
									<div>
										<div className="tutor-assignment-title">
											{assignment.title}
										</div>
										{assignment.description && (
											<div className="tutor-assignment-description">
												{assignment.description}
											</div>
										)}
									</div>
								</td>
								<td className="tutor-assignment-due-date-cell">
									{assignment.dueDate
										? new Date(assignment.dueDate).toLocaleDateString("ko-KR", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})
										: "미설정"}
								</td>
								<td className="tutor-assignment-problem-count-cell">
									{assignment.problemCount || 0}개
								</td>
								<td className="tutor-assignment-submission-cell">
									{submissionStats[assignment.id]
										? `${submissionStats[assignment.id].submittedStudents}/${submissionStats[assignment.id].totalStudents}`
										: `0/${assignment.totalStudents || 0}`}
								</td>
								<td className="tutor-assignment-actions-cell">
									<div className="tutor-assignment-actions-inline">
										<div className="tutor-assignment-primary-actions">
											<button
												type="button"
												className="tutor-btn-table-action"
												onClick={() => onProblemListManage(assignment)}
												title="문제 목록 관리"
											>
												목록
											</button>
											<button
												type="button"
												className="tutor-btn-table-action"
												onClick={() => onAddProblem(assignment)}
												title="문제 추가"
											>
												추가
											</button>
											<button
												type="button"
												className="tutor-btn-table-action tutor-btn-edit"
												onClick={() => onEdit(assignment)}
												title="수정"
											>
												수정
											</button>
										</div>
										<div className="tutor-assignment-secondary-actions">
											<div className="tutor-secondary-actions-layer">
												<button
													type="button"
													className="tutor-btn-table-action tutor-btn-secondary-action"
													onClick={(e) => {
														e.stopPropagation();
														onToggleActive(
															assignment.sectionId,
															assignment.id,
															assignment.active,
														);
													}}
													title={assignment.active ? "비활성화" : "활성화"}
												>
													{assignment.active ? "비활성화" : "활성화"}
												</button>
												<div className="tutor-more-menu">
													<button
														type="button"
														className="tutor-btn-table-action tutor-btn-secondary-action tutor-btn-more"
														onClick={(e) => {
															e.stopPropagation();
															onToggleMoreMenu(
																openMoreMenu === assignment.id
																	? null
																	: assignment.id,
															);
														}}
														title="더보기"
													>
														⋯
													</button>
													{openMoreMenu === assignment.id && (
														<div className="tutor-more-dropdown">
															<button
																type="button"
																className="tutor-btn-text-small tutor-delete"
																onClick={(e) => {
																	e.stopPropagation();
																	onDelete(assignment.id);
																	onToggleMoreMenu(null);
																}}
															>
																삭제
															</button>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>

			<AssignmentPagination
				totalItems={paginationProps.totalItems}
				currentPage={paginationProps.currentPage}
				itemsPerPage={paginationProps.itemsPerPage}
				onPageChange={paginationProps.onPageChange}
				onItemsPerPageChange={paginationProps.onItemsPerPageChange}
				showItemsPerPage={paginationProps.showItemsPerPage ?? false}
			/>
		</div>
	);
};

export default AssignmentTableView;
