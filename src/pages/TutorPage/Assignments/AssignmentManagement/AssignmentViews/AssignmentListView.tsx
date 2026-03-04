import type React from "react";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import { getDifficultyColor } from "../../../../../utils/assignmentUtils";

interface Problem {
	id: number;
	title: string;
	difficulty?: string;
}

interface Assignment {
	id: number;
	sectionId: number;
	title: string;
	description?: string;
	dueDate?: string;
	problemCount?: number;
	totalStudents?: number;
	active?: boolean;
	problems?: Problem[];
}

interface ProblemStat {
	problemId: number;
	correctSubmissions?: number;
	submittedStudents?: number;
	totalStudents: number;
}

interface SubmissionStats {
	[key: number]: {
		submittedStudents: number;
		totalStudents: number;
		problemStats?: ProblemStat[];
	};
}

interface AssignmentListViewProps {
	filteredAssignments: Assignment[];
	submissionStats: SubmissionStats;
	expandedAssignments: { [key: number]: boolean };
	searchTerm: string;
	filterSection: string;
	openMoreMenu: number | null;
	onToggleAssignment: (id: number) => void;
	onToggleMoreMenu: (id: number | null) => void;
	onAddProblem: (assignment: Assignment) => void;
	onEdit: (assignment: Assignment) => void;
	onToggleActive: (
		sectionId: number,
		assignmentId: number,
		active?: boolean,
	) => void;
	onDelete: (assignmentId: number) => void;
	onRemoveProblem: (assignmentId: number, problemId: number) => void;
	/** 조교(TUTOR) 전용 수업이면 수정/비활성화/삭제/문제추가 비표시 */
	isTutorOnly?: boolean;
}

/**
 * 과제 리스트 뷰 컴포넌트 (전체 페이지용)
 * 스타일: 상위 AssignmentManagement/styles.ts 의 ListViewWrapper (tutor-assignments-*, tutor-more-* 등)
 */
const AssignmentListView: React.FC<AssignmentListViewProps> = ({
	filteredAssignments,
	submissionStats,
	expandedAssignments,
	searchTerm,
	filterSection,
	openMoreMenu,
	onToggleAssignment,
	onToggleMoreMenu,
	onAddProblem,
	onEdit,
	onToggleActive,
	onDelete,
	onRemoveProblem,
	isTutorOnly,
}) => {
	return (
		<div className="tutor-assignments-list">
			{filteredAssignments.map((assignment) => (
				<div
					key={assignment.id}
					className={`tutor-assignment-list-item ${expandedAssignments[assignment.id] ? "tutor-expanded" : ""} ${assignment.active === false ? "tutor-disabled" : ""}`}
				>
					<div className="tutor-assignment-list-main">
						<div className="tutor-assignment-list-info">
							<div className="tutor-assignment-list-title-section">
								<h3 className="tutor-assignment-list-title">
									{assignment.title}
								</h3>
								{assignment.description && (
									<p className="tutor-assignment-list-description">
										{assignment.description}
									</p>
								)}
							</div>
							<div className="tutor-assignment-list-meta">
								<span className="tutor-assignment-meta-item">
									<span className="tutor-meta-label">마감일</span>
									<span className="tutor-meta-value">
										{(() => {
											const raw =
												assignment.dueDate ??
												(assignment as { endDate?: string }).endDate;
											if (!raw?.trim()) return "미설정";
											const d = new Date(raw);
											return Number.isNaN(d.getTime())
												? "미설정"
												: d.toLocaleDateString("ko-KR", {
														year: "numeric",
														month: "long",
														day: "numeric",
													});
										})()}
									</span>
								</span>
								<span className="tutor-assignment-meta-item">
									<span className="tutor-meta-label">문제 수</span>
									<span className="tutor-meta-value">
										{assignment.problemCount || 0}개
									</span>
								</span>
								<span className="tutor-assignment-meta-item" title="해당 과제의 모든 문제를 1번 이상 제출한 학생 수 / 분반 전체 학생 수">
									<span className="tutor-meta-label">모든 문제 완료 (명/전체)</span>
									<span className="tutor-meta-value">
										{submissionStats[assignment.id]
											? `${submissionStats[assignment.id].submittedStudents}/${submissionStats[assignment.id].totalStudents}`
											: `0/${assignment.totalStudents || 0}`}
									</span>
								</span>
							</div>
						</div>
						<div className="tutor-assignment-list-actions">
							<button
								className="tutor-btn-list-action"
								onClick={() => onToggleAssignment(assignment.id)}
							>
								{expandedAssignments[assignment.id]
									? "문제 목록 숨기기"
									: "문제 목록 보기"}
							</button>
							{!isTutorOnly && (
								<>
									<button
										className="tutor-btn-list-action"
										onClick={() => onAddProblem(assignment)}
									>
										문제 추가
									</button>
									<button
										className="tutor-btn-list-action"
										onClick={() => onEdit(assignment)}
									>
										수정
									</button>
								</>
							)}
							<div className="tutor-more-menu">
								<button
									className="tutor-btn-list-action tutor-btn-more"
									title="더보기"
									onClick={(e) => {
										e.stopPropagation();
										onToggleMoreMenu(assignment.id);
									}}
								>
									⋯
								</button>
								{openMoreMenu === assignment.id && (
									<div className="tutor-more-dropdown">
										<button
											className="tutor-btn-text-small"
											onClick={(e) => {
												e.stopPropagation();
												onToggleActive(
													assignment.sectionId,
													assignment.id,
													assignment.active,
												);
												onToggleMoreMenu(null);
											}}
										>
											{assignment.active ? "비활성화" : "활성화"}
										</button>
										<button
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

					{expandedAssignments[assignment.id] && (
						<div className="assignment-expanded-content">
							<div className="tutor-problems-section">
								<div className="tutor-problems-header">
									<h4 className="tutor-problems-title">
										문제 목록 ({assignment.problemCount || 0}개)
									</h4>
								</div>
								<div className="tutor-problems-list">
									{assignment.problems && assignment.problems.length > 0 ? (
										assignment.problems.map((problem, index) => (
											<div
												key={problem.id || index}
												className="tutor-problem-item"
											>
												<div className="tutor-problem-item-left">
													<span className="tutor-problem-number">
														{index + 1}.
													</span>
													<span className="tutor-problem-title">
														{removeCopyLabel(problem.title)}
													</span>
													{problem.difficulty && (
														<span
															className="tutor-problem-difficulty"
															style={{
																color: getDifficultyColor(problem.difficulty),
															}}
														>
															[{problem.difficulty}]
														</span>
													)}
												</div>

												<span className="tutor-problem-submission-rate">
													{submissionStats[assignment.id]?.problemStats
														? (() => {
																const problemStat = submissionStats[
																	assignment.id
																].problemStats!.find(
																	(stat) => stat.problemId === problem.id,
																);
																return problemStat ? (
																	<>
																		제출 현황:{" "}
																		{problemStat.correctSubmissions || 0}/
																		{problemStat.totalStudents}
																	</>
																) : (
																	`제출 현황: 0/${submissionStats[assignment.id]?.totalStudents || assignment.totalStudents || 0}`
																);
															})()
														: `제출 현황: 0/${submissionStats[assignment.id]?.totalStudents || assignment.totalStudents || 0}`}
												</span>

												{!isTutorOnly && (
													<button
														className="tutor-btn-remove-problem"
														onClick={() =>
															onRemoveProblem(assignment.id, problem.id)
														}
														title="문제 제거"
													>
														✕
													</button>
												)}
											</div>
										))
									) : (
										<div className="tutor-no-problems">
											<p>등록된 문제가 없습니다.</p>
											{!isTutorOnly && (
												<button
													className="tutor-btn-add-first-problem"
													onClick={() => onAddProblem(assignment)}
												>
													첫 번째 문제 추가하기
												</button>
											)}
										</div>
									)}
								</div>
							</div>

							<div className="tutor-progress-container">
								<div className="tutor-progress-info">
									<span className="tutor-progress-label">완료율</span>
									<span className="tutor-progress-count">
										{(() => {
											const stats = submissionStats[assignment.id];
											if (
												!stats ||
												!stats.problemStats ||
												stats.problemStats.length === 0
											) {
												return `0 / ${stats?.totalStudents || assignment.totalStudents || 0}명`;
											}

											const totalStudents =
												stats.totalStudents || assignment.totalStudents || 0;
											const totalProblems = assignment.problems?.length || 0;

											if (totalStudents === 0 || totalProblems === 0) {
												return `0 / ${totalStudents}명`;
											}

											const completedStudents = stats.problemStats.reduce(
												(min, problemStat) => {
													return Math.min(
														min,
														problemStat.submittedStudents || 0,
													);
												},
												totalStudents,
											);

											return `${completedStudents} / ${totalStudents}명`;
										})()}
									</span>
								</div>
								<div className="tutor-progress-bar">
									<div
										className="tutor-progress-fill"
										style={{
											width: `${(() => {
												const stats = submissionStats[assignment.id];
												if (
													!stats ||
													!stats.problemStats ||
													stats.problemStats.length === 0
												) {
													return 0;
												}

												const totalStudents =
													stats.totalStudents || assignment.totalStudents || 0;
												const totalProblems = assignment.problems?.length || 0;

												if (totalStudents === 0 || totalProblems === 0) {
													return 0;
												}

												const completedStudents = stats.problemStats.reduce(
													(min, problemStat) => {
														return Math.min(
															min,
															problemStat.submittedStudents || 0,
														);
													},
													totalStudents,
												);

												return Math.round(
													(completedStudents / totalStudents) * 100,
												);
											})()}%`,
										}}
									></div>
								</div>
							</div>
						</div>
					)}
				</div>
			))}
			{filteredAssignments.length === 0 && (
				<div className="tutor-no-assignments">
					<div className="tutor-no-assignments-message">
						<span className="tutor-no-assignments-icon">📝</span>
						<p>
							{searchTerm || filterSection !== "ALL"
								? "검색 조건에 맞는 과제가 없습니다."
								: "아직 생성된 과제가 없습니다."}
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default AssignmentListView;
