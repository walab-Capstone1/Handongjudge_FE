import type React from "react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import APIService from "../../../../../services/APIService";
import * as S from "../AssignmentModals/styles";
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
					// 백엔드는 List<ProblemDto>를 그대로 반환(배열)하거나, 일부는 { problems } 형태일 수 있음
					const raw =
						response?.problems ??
						response?.data?.problems ??
						response?.data ??
						response;
					const problems = Array.isArray(raw) ? raw : [];
					setSectionProblems(problems);
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
		<S.Overlay $alignCenter>
			<S.Content $large onClick={(e: React.MouseEvent) => e.stopPropagation()}>
				<S.Header>
					<h2>문제 추가 - {selectedAssignment?.title}</h2>
					<S.CloseButton type="button" onClick={onClose}>
						✕
					</S.CloseButton>
				</S.Header>

				<S.Body>
					<S.ModeTabs>
						<S.ModeTab
							type="button"
							$active={activeMode === "problems"}
							onClick={() => setActiveMode("problems")}
						>
							내 문제
						</S.ModeTab>
						<S.ModeTab
							type="button"
							$active={activeMode === "problemSets"}
							onClick={() => setActiveMode("problemSets")}
						>
							문제집에서 가져오기
						</S.ModeTab>
						<S.ModeTab
							type="button"
							$active={activeMode === "sections"}
							onClick={() => setActiveMode("sections")}
						>
							수업에서 가져오기
						</S.ModeTab>
					</S.ModeTabs>

					{activeMode === "problemSets" && !selectedProblemSet && (
						<div>
							<S.SectionTitle>문제집 선택</S.SectionTitle>
							{loading ? (
								<S.LoadingText>로딩 중...</S.LoadingText>
							) : problemSets.length > 0 ? (
								<S.ListContainer>
									{problemSets.map((set) => (
										<S.ListItem
											key={set.id}
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
												<S.ItemCount>{set.problemCount}개 문제</S.ItemCount>
											)}
										</S.ListItem>
									))}
								</S.ListContainer>
							) : (
								<S.NoAvailableText>
									<p>사용 가능한 문제집이 없습니다.</p>
								</S.NoAvailableText>
							)}
						</div>
					)}

					{activeMode === "sections" && (
						<div>
							{!selectedSection ? (
								<div>
									<S.SectionTitle>수업 선택</S.SectionTitle>
									{loading ? (
										<S.LoadingText>로딩 중...</S.LoadingText>
									) : sections.length > 0 ? (
										<S.ListContainer>
											{sections.map((section) => (
												<S.ListItem
													key={section.sectionId ?? section.id}
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
												</S.ListItem>
											))}
										</S.ListContainer>
									) : (
										<S.NoAvailableText>
											<p>사용 가능한 수업이 없습니다.</p>
										</S.NoAvailableText>
									)}
								</div>
							) : !selectedAssignmentForSection ? (
								<div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "1rem",
											marginBottom: "1rem",
										}}
									>
										<S.BtnSecondary
											type="button"
											onClick={() => {
												setSelectedSection(null);
												setSectionAssignments([]);
											}}
										>
											← 뒤로
										</S.BtnSecondary>
										<h3 style={{ margin: 0 }}>
											{selectedSection.courseTitle ?? selectedSection.title} -{" "}
											{selectedSection.sectionNumber}
										</h3>
									</div>
									{loading ? (
										<S.LoadingText>로딩 중...</S.LoadingText>
									) : sectionAssignments.length > 0 ? (
										<S.ListContainer>
											{sectionAssignments.map((assignment) => (
												<S.ListItem
													key={assignment.id}
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
												</S.ListItem>
											))}
										</S.ListContainer>
									) : (
										<S.NoAvailableText>
											<p>과제가 없습니다.</p>
										</S.NoAvailableText>
									)}
								</div>
							) : (
								<div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "1rem",
											marginBottom: "1rem",
										}}
									>
										<S.BtnSecondary
											type="button"
											onClick={() => {
												setSelectedAssignmentForSection(null);
												setSectionProblems([]);
											}}
										>
											← 뒤로
										</S.BtnSecondary>
										<h3 style={{ margin: 0 }}>
											{selectedAssignmentForSection.title}
										</h3>
									</div>
								</div>
							)}
						</div>
					)}

					{activeMode === "problemSets" && selectedProblemSet && (
						<div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "1rem",
									marginBottom: "1rem",
								}}
							>
								<S.BtnSecondary
									type="button"
									onClick={() => {
										setSelectedProblemSet(null);
										setProblemSetProblems([]);
									}}
								>
									← 뒤로
								</S.BtnSecondary>
								<h3 style={{ margin: 0 }}>{selectedProblemSet.title}</h3>
							</div>
						</div>
					)}

					{(activeMode === "problems" ||
						(activeMode === "problemSets" && selectedProblemSet) ||
						(activeMode === "sections" && selectedAssignmentForSection)) && (
						<>
							<div style={{ marginBottom: "1rem" }}>
								<S.SearchInput
									type="text"
									placeholder="문제명으로 검색..."
									value={problemSearchTerm}
									onChange={(e) => onSearchChange(e.target.value)}
								/>
							</div>

							{currentProblems.length > 0 && (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "1rem",
										marginBottom: "0.75rem",
									}}
								>
									<label
										style={{
											display: "flex",
											alignItems: "center",
											gap: "0.5rem",
										}}
									>
										<input
											type="checkbox"
											checked={allSelected}
											onChange={handleSelectAllCurrent}
										/>
										<span>전체 선택</span>
									</label>
									<S.ItemCount>
										{selectedProblemIds.length} / {currentProblems.length}개
										선택됨
									</S.ItemCount>
								</div>
							)}

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
									gap: "1rem",
								}}
							>
								{loading ? (
									<S.LoadingText>로딩 중...</S.LoadingText>
								) : currentProblems.length > 0 ? (
									currentProblems.map((problem) => (
										<div
											key={problem.id}
											style={{
												border: "1px solid #e5e7eb",
												borderRadius: "8px",
												padding: "1rem",
												display: "flex",
												gap: "0.75rem",
											}}
										>
											<div style={{ flexShrink: 0 }}>
												<input
													type="checkbox"
													checked={selectedProblemIds.includes(problem.id)}
													onChange={() => onProblemToggle(problem.id)}
												/>
											</div>
											<div style={{ flex: 1, minWidth: 0 }}>
												<h4
													style={{
														margin: "0 0 0.5rem",
														fontSize: "1rem",
														fontWeight: 600,
													}}
												>
													{removeCopyLabel(problem.title ?? "")}
												</h4>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														flexWrap: "wrap",
														gap: "0.5rem",
														fontSize: "0.85rem",
														color: "#6b7280",
													}}
												>
													<span>
														생성일:{" "}
														{problem.createdAt
															? new Date(problem.createdAt).toLocaleDateString(
																	"ko-KR",
																)
															: "-"}
													</span>
													<S.BtnTableAction
														type="button"
														onClick={() => onProblemDetail(problem.id)}
													>
														설명보기
													</S.BtnTableAction>
												</div>
											</div>
										</div>
									))
								) : (
									<S.NoAvailableText>
										<p>사용 가능한 문제가 없습니다.</p>
									</S.NoAvailableText>
								)}
							</div>
						</>
					)}
				</S.Body>

				<S.Actions>
					<S.BtnSecondary type="button" onClick={onClose}>
						취소
					</S.BtnSecondary>
					{selectedProblemIds.length > 0 && (
						<S.BtnPrimary
							type="button"
							onClick={() => onSelectProblems(selectedProblemIds)}
						>
							선택한 문제 추가 ({selectedProblemIds.length}개)
						</S.BtnPrimary>
					)}
					<S.BtnCreateNew
						type="button"
						onClick={() => {
							onClose();
							onCreateNew();
						}}
					>
						새 문제 만들기
					</S.BtnCreateNew>
				</S.Actions>
			</S.Content>
		</S.Overlay>,
		document.body,
	);
};

export default ProblemSelectModal;
