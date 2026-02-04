import type React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { removeCopyLabel } from "../../utils/problemUtils";
import APIService from "../../services/APIService";
import "../AssignmentModals/AssignmentModals.css";
import type { ProblemSelectModalProps } from "./types";

interface ProblemSet {
	id: number;
	title?: string;
	description?: string;
	problemCount?: number;
}

interface Section {
	sectionId: number;
	id?: number;
	courseTitle?: string;
	title?: string;
	sectionNumber?: string;
}

interface Assignment {
	id: number;
	title?: string;
	description?: string;
}

interface Problem {
	id: number;
	title?: string;
	createdAt?: string;
}

const ProblemSelectModal: React.FC<ProblemSelectModalProps> = ({
	isOpen,
	selectedAssignment,
	filteredProblems,
	selectedProblemIds,
	problemSearchTerm,
	onClose,
	onProblemToggle,
	onSelectAll,
	onSearchChange,
	onSelectProblems,
	onCopyProblem,
	onCreateNew,
	onProblemDetail,
}) => {
	const navigate = useNavigate();
	const [activeMode, setActiveMode] = useState<
		"problems" | "problemSets" | "sections"
	>("problems");
	const [problemSets, setProblemSets] = useState<ProblemSet[]>([]);
	const [selectedProblemSet, setSelectedProblemSet] =
		useState<ProblemSet | null>(null);
	const [problemSetProblems, setProblemSetProblems] = useState<Problem[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [selectedSection, setSelectedSection] = useState<Section | null>(null);
	const [sectionAssignments, setSectionAssignments] = useState<Assignment[]>(
		[],
	);
	const [selectedAssignmentForSection, setSelectedAssignmentForSection] =
		useState<Assignment | null>(null);
	const [sectionProblems, setSectionProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setActiveMode("problems");
			setSelectedProblemSet(null);
			setProblemSetProblems([]);
			setSelectedSection(null);
			setSectionAssignments([]);
			setSelectedAssignmentForSection(null);
			setSectionProblems([]);
		}
	}, [isOpen]);

	useEffect(() => {
		if (isOpen && activeMode === "problemSets") {
			const fetchProblemSets = async () => {
				try {
					setLoading(true);
					const response = await APIService.getProblemSets();
					const sets = response?.data ?? response ?? [];
					setProblemSets(Array.isArray(sets) ? sets : []);
				} catch (error) {
					console.error("문제집 목록 조회 실패:", error);
					setProblemSets([]);
				} finally {
					setLoading(false);
				}
			};
			fetchProblemSets();
		}
	}, [isOpen, activeMode]);

	useEffect(() => {
		if (selectedProblemSet) {
			const fetchProblemSetProblems = async () => {
				try {
					setLoading(true);
					const response = await APIService.getProblemSet(
						selectedProblemSet.id,
					);
					const problems = response?.problems ?? response?.data?.problems ?? [];
					setProblemSetProblems(Array.isArray(problems) ? problems : []);
				} catch (error) {
					console.error("문제집 문제 조회 실패:", error);
					setProblemSetProblems([]);
				} finally {
					setLoading(false);
				}
			};
			fetchProblemSetProblems();
		}
	}, [selectedProblemSet]);

	useEffect(() => {
		if (isOpen && activeMode === "sections") {
			const fetchSections = async () => {
				try {
					setLoading(true);
					const response = await APIService.getInstructorDashboard();
					const sectionsData = response?.data ?? response ?? [];
					const filtered =
						Array.isArray(sectionsData) &&
						sectionsData.filter(
							(s: Section) => s.sectionId !== selectedAssignment?.sectionId,
						);
					setSections(Array.isArray(filtered) ? filtered : []);
				} catch (error) {
					console.error("수업 목록 조회 실패:", error);
					setSections([]);
				} finally {
					setLoading(false);
				}
			};
			fetchSections();
		}
	}, [isOpen, activeMode, selectedAssignment?.sectionId]);

	useEffect(() => {
		if (selectedSection) {
			const fetchSectionAssignments = async () => {
				try {
					setLoading(true);
					const sectionId = selectedSection.sectionId ?? selectedSection.id;
					if (sectionId == null) return;
					const response = await APIService.getAssignmentsBySection(sectionId);
					const assignments = response?.data ?? response ?? [];
					setSectionAssignments(Array.isArray(assignments) ? assignments : []);
				} catch (error) {
					console.error("과제 목록 조회 실패:", error);
					setSectionAssignments([]);
				} finally {
					setLoading(false);
				}
			};
			fetchSectionAssignments();
		}
	}, [selectedSection]);

	useEffect(() => {
		if (selectedAssignmentForSection && selectedSection) {
			const fetchAssignmentProblems = async () => {
				try {
					setLoading(true);
					const sectionId = selectedSection.sectionId ?? selectedSection.id;
					if (sectionId == null) return;
					const response = await APIService.getAssignmentProblems(
						sectionId,
						selectedAssignmentForSection.id,
					);
					const problems =
						response?.problems ??
						response?.data?.problems ??
						response?.data ??
						response ??
						[];
					setSectionProblems(Array.isArray(problems) ? problems : []);
				} catch (error) {
					console.error("과제 문제 조회 실패:", error);
					setSectionProblems([]);
				} finally {
					setLoading(false);
				}
			};
			fetchAssignmentProblems();
		}
	}, [selectedAssignmentForSection, selectedSection]);

	if (!isOpen) return null;

	const getCurrentProblems = (): Problem[] => {
		let problems: Problem[] = [];
		if (activeMode === "problems") {
			problems = filteredProblems as Problem[];
		} else if (activeMode === "problemSets") {
			problems = problemSetProblems;
		} else if (activeMode === "sections") {
			problems = sectionProblems;
		}
		if (activeMode !== "problems" && problemSearchTerm) {
			const searchLower = problemSearchTerm.toLowerCase();
			return problems.filter(
				(p) =>
					p.title?.toLowerCase().includes(searchLower) ||
					String(p.id).includes(searchLower),
			);
		}
		return problems;
	};

	const currentProblems = getCurrentProblems();
	const allSelected =
		selectedProblemIds.length === currentProblems.length &&
		currentProblems.length > 0;

	const handleSelectAllCurrent = () => {
		const currentIds = currentProblems.map((p) => p.id);
		const allCurrentlySelected =
			currentIds.length > 0 &&
			currentIds.every((id) => selectedProblemIds.includes(id));
		if (allCurrentlySelected) {
			currentIds.forEach((id) => {
				if (selectedProblemIds.includes(id)) onProblemToggle(id);
			});
		} else {
			currentIds.forEach((id) => {
				if (!selectedProblemIds.includes(id)) onProblemToggle(id);
			});
		}
	};

	return createPortal(
		<div className="tutor-modal-overlay tutor-modal-overlay-problem-select">
			<div className="tutor-modal-content tutor-problem-modal tutor-problem-modal-large">
				<div className="tutor-modal-header">
					<h2>문제 추가 - {selectedAssignment?.title}</h2>
					<button type="button" className="tutor-modal-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="tutor-problem-modal-body">
					<div className="tutor-problem-mode-tabs">
						<button
							type="button"
							className={`tutor-mode-tab ${activeMode === "problems" ? "active" : ""}`}
							onClick={() => setActiveMode("problems")}
						>
							내 문제
						</button>
						<button
							type="button"
							className={`tutor-mode-tab ${activeMode === "problemSets" ? "active" : ""}`}
							onClick={() => setActiveMode("problemSets")}
						>
							문제집에서 가져오기
						</button>
						<button
							type="button"
							className={`tutor-mode-tab ${activeMode === "sections" ? "active" : ""}`}
							onClick={() => setActiveMode("sections")}
						>
							수업에서 가져오기
						</button>
					</div>

					{activeMode === "problemSets" && !selectedProblemSet && (
						<div className="tutor-problem-set-selection">
							<h3>문제집 선택</h3>
							{loading ? (
								<div className="tutor-loading">로딩 중...</div>
							) : problemSets.length > 0 ? (
								<div className="tutor-problem-sets-list">
									{problemSets.map((set) => (
										<div
											key={set.id}
											className="tutor-problem-set-item"
											onClick={() => setSelectedProblemSet(set)}
											onKeyDown={(e) =>
												e.key === "Enter" && setSelectedProblemSet(set)
											}
											role="button"
											tabIndex={0}
										>
											<h4>{set.title}</h4>
											{set.description && <p>{set.description}</p>}
											{set.problemCount !== undefined && (
												<span className="tutor-problem-count">
													{set.problemCount}개 문제
												</span>
											)}
										</div>
									))}
								</div>
							) : (
								<div className="tutor-no-available-problems">
									<p>사용 가능한 문제집이 없습니다.</p>
								</div>
							)}
						</div>
					)}

					{activeMode === "sections" && (
						<div className="tutor-section-selection">
							{!selectedSection ? (
								<div>
									<h3>수업 선택</h3>
									{loading ? (
										<div className="tutor-loading">로딩 중...</div>
									) : sections.length > 0 ? (
										<div className="tutor-sections-list">
											{sections.map((section) => (
												<div
													key={section.sectionId ?? section.id}
													className="tutor-section-item"
													onClick={() => setSelectedSection(section)}
													onKeyDown={(e) =>
														e.key === "Enter" && setSelectedSection(section)
													}
													role="button"
													tabIndex={0}
												>
													<h4>
														{section.courseTitle ?? section.title} -{" "}
														{section.sectionNumber}
													</h4>
												</div>
											))}
										</div>
									) : (
										<div className="tutor-no-available-problems">
											<p>사용 가능한 수업이 없습니다.</p>
										</div>
									)}
								</div>
							) : !selectedAssignmentForSection ? (
								<div>
									<div className="tutor-section-header">
										<button
											type="button"
											className="tutor-btn-back"
											onClick={() => {
												setSelectedSection(null);
												setSectionAssignments([]);
											}}
										>
											← 뒤로
										</button>
										<h3>
											{selectedSection.courseTitle ?? selectedSection.title} -{" "}
											{selectedSection.sectionNumber}
										</h3>
									</div>
									{loading ? (
										<div className="tutor-loading">로딩 중...</div>
									) : sectionAssignments.length > 0 ? (
										<div className="tutor-assignments-list">
											{sectionAssignments.map((assignment) => (
												<div
													key={assignment.id}
													className="tutor-assignment-item"
													onClick={() =>
														setSelectedAssignmentForSection(assignment)
													}
													onKeyDown={(e) =>
														e.key === "Enter" &&
														setSelectedAssignmentForSection(assignment)
													}
													role="button"
													tabIndex={0}
												>
													<h4>{assignment.title}</h4>
													{assignment.description && (
														<p>{assignment.description}</p>
													)}
												</div>
											))}
										</div>
									) : (
										<div className="tutor-no-available-problems">
											<p>과제가 없습니다.</p>
										</div>
									)}
								</div>
							) : (
								<div>
									<div className="tutor-section-header">
										<button
											type="button"
											className="tutor-btn-back"
											onClick={() => {
												setSelectedAssignmentForSection(null);
												setSectionProblems([]);
											}}
										>
											← 뒤로
										</button>
										<h3>{selectedAssignmentForSection.title}</h3>
									</div>
								</div>
							)}
						</div>
					)}

					{activeMode === "problemSets" && selectedProblemSet && (
						<div>
							<div className="tutor-section-header">
								<button
									type="button"
									className="tutor-btn-back"
									onClick={() => {
										setSelectedProblemSet(null);
										setProblemSetProblems([]);
									}}
								>
									← 뒤로
								</button>
								<h3>{selectedProblemSet.title}</h3>
							</div>
						</div>
					)}

					{(activeMode === "problems" ||
						(activeMode === "problemSets" && selectedProblemSet) ||
						(activeMode === "sections" && selectedAssignmentForSection)) && (
						<>
							<div className="tutor-problem-search-section">
								<input
									type="text"
									placeholder="문제명으로 검색..."
									value={problemSearchTerm}
									onChange={(e) => onSearchChange(e.target.value)}
									className="tutor-search-input"
								/>
							</div>

							{currentProblems.length > 0 && (
								<div className="tutor-problem-selection-header">
									<label className="tutor-checkbox-label">
										<input
											type="checkbox"
											checked={allSelected}
											onChange={handleSelectAllCurrent}
										/>
										<span>전체 선택</span>
									</label>
									<span className="tutor-item-count">
										{selectedProblemIds.length} / {currentProblems.length}개
										선택됨
									</span>
								</div>
							)}

							<div className="tutor-available-problems-grid">
								{loading ? (
									<div className="tutor-loading">로딩 중...</div>
								) : currentProblems.length > 0 ? (
									currentProblems.map((problem) => (
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
													{removeCopyLabel(problem.title ?? "")}
												</h4>
												<div className="tutor-problem-card-meta-row">
													<span className="tutor-problem-card-date">
														생성일:{" "}
														{problem.createdAt
															? new Date(problem.createdAt).toLocaleDateString(
																	"ko-KR",
																)
															: "-"}
													</span>
													<button
														type="button"
														className="tutor-btn-view-detail-card"
														onClick={() => onProblemDetail(problem.id)}
													>
														설명보기
													</button>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="tutor-no-available-problems">
										<p>사용 가능한 문제가 없습니다.</p>
									</div>
								)}
							</div>
						</>
					)}
				</div>

				<div className="tutor-modal-footer">
					<div className="tutor-footer-actions">
						<button
							type="button"
							className="tutor-btn-secondary"
							onClick={onClose}
						>
							취소
						</button>
						{selectedProblemIds.length > 0 && (
							<button
								type="button"
								className="tutor-btn-primary"
								onClick={() => onSelectProblems(selectedProblemIds)}
							>
								선택한 문제 추가 ({selectedProblemIds.length}개)
							</button>
						)}
						<button
							type="button"
							className="tutor-btn-create-new"
							onClick={() => {
								onClose();
								navigate("/tutor/problems/create");
							}}
						>
							새 문제 만들기
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default ProblemSelectModal;
