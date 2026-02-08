import type React from "react";
import APIService from "../../../services/APIService";
import { removeCopyLabel } from "../../../utils/problemUtils";
import { getSemesterLabel } from "../../../utils/assignmentUtils";
import * as S from "./styles";
import "./AssignmentModals/AssignmentModals.css";

interface SectionOption {
	sectionId: number;
	courseTitle: string;
	sectionNumber?: string;
	year?: number;
	semester?: string;
}

interface CopyProblemModalProps {
	isOpen: boolean;
	selectedAssignmentTitle: string | undefined;
	sections: SectionOption[];
	selectedSectionForProblem: string;
	onSelectedSectionChange: (sectionId: string) => void;
	assignmentsForProblem: any[];
	assignmentProblems: Record<number, any[]>;
	expandedAssignmentsForProblem: Record<number, boolean>;
	loadingAssignmentsForProblem: boolean;
	copyProblemSearchTerm: string;
	onCopyProblemSearchTermChange: (value: string) => void;
	problemViewMode: "list" | "hierarchy";
	onProblemViewModeChange: (mode: "list" | "hierarchy") => void;
	selectedProblemIds: number[];
	onProblemToggle: (problemId: number) => void;
	onProblemToggleForAdd: (assignmentId: number, problemId: number) => void;
	onSelectAllProblemsForAssignment: (assignmentId: number) => void;
	toggleAssignmentForProblem: (assignmentId: number) => void;
	onClose: () => void;
	onBack: () => void;
	/** "선택한 문제 추가" 버튼 클릭 시 호출 (선택된 ID 배열 전달) */
	onSelectProblems: (problemIds: number[]) => void;
	/** 목록 뷰에서 "전체 선택" 체크 시 선택할 ID 배열로 부모 state 갱신 */
	onSelectAllInList: (ids: number[]) => void;
	onOpenProblemDetail: (problem: any) => void;
}

const CopyProblemModal: React.FC<CopyProblemModalProps> = ({
	isOpen,
	selectedAssignmentTitle,
	sections,
	selectedSectionForProblem,
	onSelectedSectionChange,
	assignmentsForProblem,
	assignmentProblems,
	expandedAssignmentsForProblem,
	loadingAssignmentsForProblem,
	copyProblemSearchTerm,
	onCopyProblemSearchTermChange,
	problemViewMode,
	onProblemViewModeChange,
	selectedProblemIds,
	onProblemToggle,
	onProblemToggleForAdd,
	onSelectAllProblemsForAssignment,
	toggleAssignmentForProblem,
	onClose,
	onBack,
	onSelectProblems,
	onSelectAllInList,
	onOpenProblemDetail,
}) => {
	if (!isOpen) return null;

	const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const sid = e.target.value;
		onSelectedSectionChange(sid);
		if (!sid) return;
	};

	// 목록 뷰: 전체 문제 목록
	const allProblems: any[] = [];
	assignmentsForProblem.forEach((a: any) => {
		const probs = assignmentProblems[a.id] || [];
		probs.forEach((p: any) => {
			if (!allProblems.find((x: any) => x.id === p.id)) allProblems.push(p);
		});
	});
	const filteredList = copyProblemSearchTerm
		? allProblems.filter((p: any) =>
				p.title?.toLowerCase().includes(copyProblemSearchTerm.toLowerCase()),
			)
		: allProblems;
	const allSelectedList =
		filteredList.length > 0 &&
		filteredList.every((p: any) => selectedProblemIds.includes(p.id));

	return (
		<S.CopyModalOverlay onClick={onClose}>
			<S.CopyModalContent
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
			>
				<S.CopyModalHeader>
					<S.CopyModalHeaderLeft>
						<S.CopyModalBtnBack type="button" onClick={onBack} title="뒤로가기">
							←
						</S.CopyModalBtnBack>
						<S.CopyModalTitle>
							기존 문제 가져오기 - {selectedAssignmentTitle ?? ""}
						</S.CopyModalTitle>
					</S.CopyModalHeaderLeft>
					<S.CopyModalBtnClose
						type="button"
						onClick={onClose}
						aria-label="닫기"
					>
						×
					</S.CopyModalBtnClose>
				</S.CopyModalHeader>

				<S.CopyModalBody>
					<S.CopyControls>
						<S.SectionSelectBox>
							<label htmlFor="section-select-copy">수업 선택 *</label>
							<S.SectionSelect
								id="section-select-copy"
								value={selectedSectionForProblem}
								onChange={handleSectionChange}
							>
								<option value="">수업을 선택하세요</option>
								{sections.map((sec: SectionOption) => (
									<option key={sec.sectionId} value={String(sec.sectionId)}>
										{sec.courseTitle}{" "}
										{sec.year != null || sec.semester
											? `(${sec.year ?? "2024"}년 ${getSemesterLabel(sec.semester ?? "")})`
											: `(${sec.sectionNumber ?? ""}분반)`}
									</option>
								))}
							</S.SectionSelect>
						</S.SectionSelectBox>

						{selectedSectionForProblem && (
							<S.CopyToolbar>
								<S.ProblemSearchBox>
									<input
										type="text"
										placeholder="문제명으로 검색..."
										value={copyProblemSearchTerm}
										onChange={(e) =>
											onCopyProblemSearchTermChange(e.target.value)
										}
										className="tutor-search-input"
									/>
								</S.ProblemSearchBox>
								<S.ViewModeTabs>
									<S.TabButton
										type="button"
										$active={problemViewMode === "list"}
										onClick={() => onProblemViewModeChange("list")}
									>
										목록 보기
									</S.TabButton>
									<S.TabButton
										type="button"
										$active={problemViewMode === "hierarchy"}
										onClick={() => onProblemViewModeChange("hierarchy")}
									>
										과제별 보기
									</S.TabButton>
								</S.ViewModeTabs>
							</S.CopyToolbar>
						)}
					</S.CopyControls>

					{loadingAssignmentsForProblem ? (
						<S.LoadingItems>과제를 불러오는 중...</S.LoadingItems>
					) : selectedSectionForProblem &&
						assignmentsForProblem.length === 0 ? (
						<S.NoItems>선택한 수업에 과제가 없습니다.</S.NoItems>
					) : selectedSectionForProblem ? (
						<>
							{problemViewMode === "list" ? (
								<div className="tutor-problem-list-view">
									<div className="tutor-problem-selection-header">
										<label className="tutor-checkbox-label">
											<input
												type="checkbox"
												checked={allSelectedList}
												onChange={() => {
													if (allSelectedList) {
														onSelectAllInList([]);
													} else {
														onSelectAllInList(
															filteredList.map((p: any) => p.id),
														);
													}
												}}
											/>
											<span>전체 선택</span>
										</label>
										<span className="tutor-item-count">
											{selectedProblemIds.length} / {filteredList.length}개
											선택됨
										</span>
									</div>
									<div className="tutor-available-problems-grid">
										{filteredList.length > 0 ? (
											filteredList.map((problem: any) => (
												<div key={problem.id} className="tutor-problem-card">
													<div className="tutor-problem-card-header">
														<input
															type="checkbox"
															checked={selectedProblemIds.includes(problem.id)}
															onChange={() => onProblemToggle(problem.id)}
															className="tutor-problem-checkbox"
														/>
													</div>
													<div className="tutor-problem-card-body">
														<h4 className="tutor-problem-card-title">
															{removeCopyLabel(problem.title)}
														</h4>
														<div className="tutor-problem-card-meta-row">
															<span className="tutor-problem-card-date">
																생성일:{" "}
																{problem.createdAt
																	? new Date(
																			problem.createdAt,
																		).toLocaleDateString("ko-KR")
																	: "-"}
															</span>
															<button
																type="button"
																className="tutor-btn-view-detail-card"
																onClick={async (e) => {
																	e.stopPropagation();
																	try {
																		const info =
																			await APIService.getProblemInfo(
																				problem.id,
																			);
																		onOpenProblemDetail(info?.data || info);
																	} catch {
																		alert(
																			"문제 정보를 불러오는데 실패했습니다.",
																		);
																	}
																}}
															>
																설명보기
															</button>
														</div>
													</div>
												</div>
											))
										) : (
											<div className="tutor-no-available-problems">
												<p>검색 조건에 맞는 문제가 없습니다.</p>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="tutor-problem-hierarchy-view">
									{selectedProblemIds.length > 0 && (
										<div className="tutor-problem-selection-header">
											<span className="tutor-item-count">
												{selectedProblemIds.length}개 문제 선택됨
											</span>
										</div>
									)}
									<div className="assignment-list-large">
										{assignmentsForProblem.map((assignment: any) => {
											const isExpanded =
												expandedAssignmentsForProblem[assignment.id];
											let list = assignmentProblems[assignment.id] || [];
											if (copyProblemSearchTerm) {
												list = list.filter((p: any) =>
													p.title
														?.toLowerCase()
														.includes(copyProblemSearchTerm.toLowerCase()),
												);
											}
											const allSelected =
												list.length > 0 &&
												list.every((p: any) =>
													selectedProblemIds.includes(p.id),
												);
											if (copyProblemSearchTerm && list.length === 0)
												return null;
											return (
												<div
													key={assignment.id}
													className={`assignment-item-large ${isExpanded ? "tutor-expanded" : ""}`}
												>
													<div className="assignment-item-header-large">
														<label className="tutor-checkbox-label">
															<input
																type="checkbox"
																checked={allSelected}
																onChange={() =>
																	onSelectAllProblemsForAssignment(
																		assignment.id,
																	)
																}
																disabled={list.length === 0}
															/>
															<div className="assignment-info-large">
																<span className="assignment-title-large">
																	{assignment.title}
																</span>
																<span className="assignment-meta">
																	{list.length}개 문제
																</span>
															</div>
														</label>
														{list.length > 0 && (
															<button
																type="button"
																className="tutor-btn-expand-assignment-large"
																onClick={() =>
																	toggleAssignmentForProblem(assignment.id)
																}
															>
																{isExpanded ? "접기 ▲" : "문제 보기 ▼"}
															</button>
														)}
													</div>
													{isExpanded && list.length > 0 && (
														<div className="tutor-problem-selection-box-large">
															<div className="tutor-problem-selection-header-large">
																<label className="tutor-checkbox-label">
																	<input
																		type="checkbox"
																		checked={allSelected}
																		onChange={() =>
																			onSelectAllProblemsForAssignment(
																				assignment.id,
																			)
																		}
																	/>
																	<span>문제 전체 선택</span>
																</label>
																<span className="tutor-item-count">
																	{
																		list.filter((p: any) =>
																			selectedProblemIds.includes(p.id),
																		).length
																	}{" "}
																	/ {list.length}개
																</span>
															</div>
															<div className="tutor-problem-list-large">
																{list.map((problem: any, idx: number) => (
																	<div
																		key={problem.id}
																		className="tutor-problem-item-large"
																	>
																		<div className="tutor-problem-item-large-header">
																			<input
																				type="checkbox"
																				checked={selectedProblemIds.includes(
																					problem.id,
																				)}
																				onChange={() =>
																					onProblemToggleForAdd(
																						assignment.id,
																						problem.id,
																					)
																				}
																				className="tutor-problem-checkbox"
																			/>
																		</div>
																		<div className="tutor-problem-item-large-body">
																			<div className="tutor-problem-title-row">
																				<h4 className="tutor-problem-title-large">
																					<span className="tutor-problem-number-large">
																						{idx + 1}.
																					</span>{" "}
																					{removeCopyLabel(problem.title)}
																				</h4>
																				<button
																					type="button"
																					className="tutor-btn-view-detail-card"
																					onClick={async (e) => {
																						e.stopPropagation();
																						try {
																							const info =
																								await APIService.getProblemInfo(
																									problem.id,
																								);
																							onOpenProblemDetail(
																								info?.data || info,
																							);
																						} catch {
																							alert(
																								"문제 정보를 불러오는데 실패했습니다.",
																							);
																						}
																					}}
																				>
																					설명보기
																				</button>
																			</div>
																		</div>
																	</div>
																))}
															</div>
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</>
					) : (
						<S.NoItems>수업을 선택해주세요.</S.NoItems>
					)}
				</S.CopyModalBody>

				<S.CopyModalFooter>
					<S.CopyFooterBtnSecondary type="button" onClick={onClose}>
						취소
					</S.CopyFooterBtnSecondary>
					{selectedProblemIds.length > 0 && (
						<S.CopyFooterBtnPrimary
							type="button"
							onClick={() => onSelectProblems(selectedProblemIds)}
						>
							선택한 문제 추가 ({selectedProblemIds.length}개)
						</S.CopyFooterBtnPrimary>
					)}
				</S.CopyModalFooter>
			</S.CopyModalContent>
		</S.CopyModalOverlay>
	);
};

export default CopyProblemModal;
