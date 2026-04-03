import type React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import APIService from "../../../../../services/APIService";
import * as S from "../AssignmentModals/styles";
import * as CreateS from "../../../Problems/ProblemCreate/styles";
import {
	ProblemSelectColumn,
	ProblemPanelTitle,
	ProblemPanelHint,
	SelectedProblemScroll,
	SelectedProblemRow,
	SelectedProblemTitle,
	RemoveFromSetButton,
} from "../../../Problems/ProblemSetManagement/styles";
import * as PS from "../../../Problems/ProblemSetEdit/styles";
import type { ProblemSelectModalProps } from "./types";

const PROBLEMS_PER_PAGE = 10;

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
	difficulty?: string;
}

function normTitle(t: string) {
	return removeCopyLabel(t ?? "").trim().toLowerCase();
}

function formatProblemCreatedAt(createdAt?: string) {
	if (!createdAt) return "—";
	try {
		const d = new Date(createdAt);
		if (Number.isNaN(d.getTime())) return "—";
		return d.toLocaleDateString("ko-KR");
	} catch {
		return "—";
	}
}

function getDifficultyLabel(difficulty?: string): string {
	const labels: Record<string, string> = { "1": "쉬움", "2": "보통", "3": "어려움" };
	return labels[difficulty ?? ""] || difficulty || "";
}

function getDifficultyColor(difficulty?: string): string {
	const colors: Record<string, string> = { "1": "#10b981", "2": "#f59e0b", "3": "#ef4444" };
	return colors[difficulty ?? ""] || "#6b7280";
}

type SectionTab = "all" | "available" | "added";

function AssignmentSourceProblemPicker({
	sourceProblems,
	sourceLoading,
	sourceContextKey,
	allSubtitle,
	selectedAssignment,
	selectedProblemIds,
	onProblemToggle,
	onProblemDetail,
}: {
	sourceProblems: Problem[];
	sourceLoading: boolean;
	sourceContextKey: string;
	allSubtitle: string;
	selectedAssignment: NonNullable<ProblemSelectModalProps["selectedAssignment"]>;
	selectedProblemIds: number[];
	onProblemToggle: (id: number) => void;
	onProblemDetail: (id: number) => void | Promise<void>;
}) {
	const [sectionTab, setSectionTab] = useState<SectionTab>("available");
	const [addSearch, setAddSearch] = useState("");
	const [originalOnly, setOriginalOnly] = useState<"ALL" | "ORIGINAL">("ALL");
	const [page, setPage] = useState(1);
	const [assignmentProblems, setAssignmentProblems] = useState<Problem[]>([]);
	const [loadingAssign, setLoadingAssign] = useState(false);

	useEffect(() => {
		setSectionTab("available");
		setAddSearch("");
		setOriginalOnly("ALL");
		setPage(1);
	}, [selectedAssignment.id, sourceContextKey]);

	useEffect(() => {
		const sid = selectedAssignment.sectionId;
		const aid = selectedAssignment.id;
		if (sid == null || aid == null) {
			setAssignmentProblems([]);
			return;
		}
		let cancelled = false;
		setLoadingAssign(true);
		(async () => {
			try {
				const res = await APIService.getAssignmentProblems(sid, aid);
				const raw =
					(res as { problems?: Problem[] })?.problems ??
					(res as { data?: { problems?: Problem[] } })?.data?.problems ??
					(res as { data?: Problem[] })?.data ??
					res;
				const list = Array.isArray(raw) ? raw : [];
				if (!cancelled) setAssignmentProblems(list);
			} catch {
				if (!cancelled) setAssignmentProblems([]);
			} finally {
				if (!cancelled) setLoadingAssign(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedAssignment.sectionId, selectedAssignment.id]);

	const assignmentTitleSet = useMemo(
		() => new Set(assignmentProblems.map((p) => normTitle(p.title ?? ""))),
		[assignmentProblems],
	);

	const filteredList = useMemo(() => {
		if (sectionTab === "added") {
			let list = [...assignmentProblems];
			if (addSearch.trim()) {
				const q = addSearch.toLowerCase();
				list = list.filter(
					(p) =>
						p.title?.toLowerCase().includes(q) || String(p.id).includes(addSearch),
				);
			}
			return list.sort((a, b) => {
				const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				if (tb !== ta) return tb - ta;
				return (b.id ?? 0) - (a.id ?? 0);
			});
		}

		let base =
			sectionTab === "available"
				? sourceProblems.filter(
						(p) => !assignmentTitleSet.has(normTitle(p.title ?? "")),
					)
				: [...sourceProblems];

		if (originalOnly === "ORIGINAL") {
			base = base.filter((p) => (p.title ?? "").endsWith("_오리지널"));
		}
		if (addSearch.trim()) {
			const q = addSearch.toLowerCase();
			base = base.filter(
				(p) =>
					p.title?.toLowerCase().includes(q) || String(p.id).includes(addSearch),
			);
		}
		return [...base].sort((a, b) => {
			const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			if (tb !== ta) return tb - ta;
			return (b.id ?? 0) - (a.id ?? 0);
		});
	}, [
		sectionTab,
		sourceProblems,
		assignmentProblems,
		originalOnly,
		addSearch,
		assignmentTitleSet,
	]);

	const totalPages = Math.max(1, Math.ceil(filteredList.length / PROBLEMS_PER_PAGE));
	const pageSlice = useMemo(() => {
		const start = (page - 1) * PROBLEMS_PER_PAGE;
		return filteredList.slice(start, start + PROBLEMS_PER_PAGE);
	}, [filteredList, page]);

	const idToSource = useMemo(
		() => new Map(sourceProblems.map((p) => [p.id, p])),
		[sourceProblems],
	);

	const selectedNewestFirst = useMemo(
		() =>
			[...selectedProblemIds]
				.reverse()
				.map((id) => idToSource.get(id))
				.filter(Boolean) as Problem[],
		[selectedProblemIds, idToSource],
	);

	const addableIds = useMemo(() => {
		if (sectionTab === "added") return [];
		return filteredList.map((p) => p.id);
	}, [sectionTab, filteredList]);

	const allAddableSelected =
		addableIds.length > 0 && addableIds.every((id) => selectedProblemIds.includes(id));

	const handleSelectAllFiltered = useCallback(() => {
		if (sectionTab === "added" || addableIds.length === 0) return;
		if (allAddableSelected) {
			for (const id of addableIds) {
				if (selectedProblemIds.includes(id)) onProblemToggle(id);
			}
		} else {
			for (const id of addableIds) {
				if (!selectedProblemIds.includes(id)) onProblemToggle(id);
			}
		}
	}, [
		sectionTab,
		addableIds,
		allAddableSelected,
		selectedProblemIds,
		onProblemToggle,
	]);

	return (
		<PS.AddModalBodyTwoCol style={{ background: "#f1f5f9", paddingTop: "1rem" }}>
			<ProblemSelectColumn $accent>
				<ProblemPanelTitle>
					과제에 넣을 문제 ({selectedProblemIds.length})
				</ProblemPanelTitle>
				<ProblemPanelHint>
					선택한 원본 문제는 복사본으로 과제에 추가됩니다. 맨 위가 가장 최근에 고른
					문제입니다.
				</ProblemPanelHint>
				<SelectedProblemScroll>
					{selectedNewestFirst.length === 0 ? (
						<PS.EmptyProblemsHint
							style={{ padding: "2rem 1rem", fontSize: "0.875rem" }}
						>
							아직 고른 문제가 없습니다. 오른쪽에서 추가하세요.
						</PS.EmptyProblemsHint>
					) : (
						selectedNewestFirst.map((problem) => (
							<SelectedProblemRow key={problem.id}>
								<span
									style={{
										fontSize: "0.75rem",
										padding: "0.25rem 0.5rem",
										background: "#f1f5f9",
										border: "1px solid #e2e8f0",
										borderRadius: 6,
										color: "#64748b",
										fontWeight: 600,
									}}
								>
									#{problem.id}
								</span>
								<SelectedProblemTitle title={problem.title}>
									{removeCopyLabel(problem.title ?? "")}
								</SelectedProblemTitle>
								<RemoveFromSetButton
									type="button"
									onClick={() => onProblemToggle(problem.id)}
								>
									빼기
								</RemoveFromSetButton>
							</SelectedProblemRow>
						))
					)}
				</SelectedProblemScroll>
			</ProblemSelectColumn>

			<PS.AddModalRightPanel>
				<PS.SectionSegment>
					<PS.SectionTab
						type="button"
						$active={sectionTab === "all"}
						onClick={() => {
							setSectionTab("all");
							setPage(1);
						}}
					>
						전체
					</PS.SectionTab>
					<PS.SectionTab
						type="button"
						$active={sectionTab === "available"}
						onClick={() => {
							setSectionTab("available");
							setPage(1);
						}}
					>
						추가 가능
					</PS.SectionTab>
					<PS.SectionTab
						type="button"
						$active={sectionTab === "added"}
						onClick={() => {
							setSectionTab("added");
							setPage(1);
						}}
					>
						이미 추가됨
					</PS.SectionTab>
				</PS.SectionSegment>

				<PS.MetaText
					as="div"
					style={{
						fontWeight: 700,
						color: "#4338ca",
						fontSize: "0.75rem",
						textTransform: "uppercase",
						letterSpacing: "0.04em",
						marginBottom: "0.75rem",
					}}
				>
					{sectionTab === "all" && allSubtitle}
					{sectionTab === "available" &&
						"이 과제에 아직 없는 문제 (제목 기준으로 판별)"}
					{sectionTab === "added" && "이 과제에 이미 포함된 문제(복사본)"}
					{" · 최근 등록 순"}
				</PS.MetaText>

				{sectionTab !== "added" && (
					<PS.AddModalSearchRow>
						<PS.AddModalSearchInput
							type="text"
							placeholder="문제명 또는 ID 검색..."
							value={addSearch}
							onChange={(e) => {
								setAddSearch(e.target.value);
								setPage(1);
							}}
						/>
						<PS.AddModalOriginalSelect
							value={originalOnly}
							onChange={(e) => {
								setOriginalOnly(e.target.value as "ALL" | "ORIGINAL");
								setPage(1);
							}}
							aria-label="원본 문제만"
						>
							<option value="ALL">전체 문제</option>
							<option value="ORIGINAL">원본(_오리지널)만</option>
						</PS.AddModalOriginalSelect>
					</PS.AddModalSearchRow>
				)}
				{sectionTab === "added" && (
					<PS.AddModalSearchRow>
						<PS.AddModalSearchInput
							type="text"
							placeholder="포함된 문제 검색..."
							value={addSearch}
							onChange={(e) => {
								setAddSearch(e.target.value);
								setPage(1);
							}}
						/>
					</PS.AddModalSearchRow>
				)}

				{sectionTab !== "added" && sourceLoading ? (
					<div
						style={{
							minHeight: 280,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							padding: "2rem",
						}}
					>
						<LoadingSpinner message="문제 목록을 불러오는 중..." />
					</div>
				) : loadingAssign && sectionTab === "added" && assignmentProblems.length === 0 ? (
					<div
						style={{
							minHeight: 200,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<LoadingSpinner message="과제에 포함된 문제를 불러오는 중..." />
					</div>
				) : filteredList.length > 0 ? (
					<>
						{sectionTab !== "added" && (
							<PS.AddProblemToolbar>
								<CreateS.CancelHeaderButton
									type="button"
									style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
									onClick={handleSelectAllFiltered}
								>
									{allAddableSelected
										? "필터 결과 전체 해제"
										: "필터 결과 전체 선택"}
								</CreateS.CancelHeaderButton>
								<PS.MetaText>표시 {filteredList.length}개</PS.MetaText>
							</PS.AddProblemToolbar>
						)}
						{sectionTab === "added" && (
							<PS.MetaText as="p" style={{ marginBottom: "0.75rem" }}>
								이미 과제에 들어 있는 문제입니다. 추가 선택은 왼쪽에서 원본을
								고르세요.
							</PS.MetaText>
						)}

						<PS.AddModalListWhite>
							{pageSlice.map((problem) => {
								const isAddedTab = sectionTab === "added";
								const isSelected = selectedProblemIds.includes(problem.id);
								const diffColor = getDifficultyColor(problem.difficulty);
								return (
									<PS.AddProblemCard
										key={`${isAddedTab ? "a" : "s"}-${problem.id}`}
										$selected={isSelected && !isAddedTab}
										$disabled={isAddedTab}
										style={{ marginBottom: "0.5rem" }}
										onClick={() => {
											if (!isAddedTab) onProblemToggle(problem.id);
										}}
									>
										{!isAddedTab ? (
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => onProblemToggle(problem.id)}
												onClick={(e) => e.stopPropagation()}
												aria-label={`${problem.title} 선택`}
											/>
										) : (
											<span style={{ width: "1.125rem" }} />
										)}
										<PS.AddProblemCardBody>
											<PS.AddProblemCardTitleRow>
												<PS.AddIdBadge>#{problem.id}</PS.AddIdBadge>
												<PS.AddProblemTitleText>
													{removeCopyLabel(problem.title ?? "")}
												</PS.AddProblemTitleText>
												{isAddedTab && (
													<PS.AddedPill>과제에 포함됨</PS.AddedPill>
												)}
											</PS.AddProblemCardTitleRow>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "0.5rem",
													flexWrap: "wrap",
												}}
											>
												<PS.DiffPill $bg={`${diffColor}22`} $color={diffColor}>
													{getDifficultyLabel(problem.difficulty)}
												</PS.DiffPill>
												<span
													style={{
														fontSize: "0.75rem",
														color: "#64748b",
													}}
												>
													생성일: {formatProblemCreatedAt(problem.createdAt)}
												</span>
												<CreateS.CancelHeaderButton
													type="button"
													style={{
														padding: "0.25rem 0.6rem",
														fontSize: "0.75rem",
													}}
													onClick={(e) => {
														e.stopPropagation();
														onProblemDetail(problem.id);
													}}
												>
													설명보기
												</CreateS.CancelHeaderButton>
											</div>
										</PS.AddProblemCardBody>
									</PS.AddProblemCard>
								);
							})}
						</PS.AddModalListWhite>

						{filteredList.length > PROBLEMS_PER_PAGE && (
							<PS.PaginationBar>
								<CreateS.CancelHeaderButton
									type="button"
									style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									이전
								</CreateS.CancelHeaderButton>
								<PS.MetaText>
									{page} / {totalPages}
								</PS.MetaText>
								<CreateS.CancelHeaderButton
									type="button"
									style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									다음
								</CreateS.CancelHeaderButton>
							</PS.PaginationBar>
						)}
					</>
				) : (
					<PS.EmptyProblemsHint>
						{addSearch || (sectionTab !== "added" && originalOnly === "ORIGINAL")
							? "조건에 맞는 문제가 없습니다."
							: sectionTab === "available"
								? "추가 가능한 문제가 없습니다. (이미 과제에 같은 제목의 복사본이 있을 수 있습니다.)"
								: sectionTab === "added"
									? "이 과제에 아직 문제가 없습니다."
									: "문제가 없습니다."}
					</PS.EmptyProblemsHint>
				)}
			</PS.AddModalRightPanel>
		</PS.AddModalBodyTwoCol>
	);
}

const ProblemSelectModal: React.FC<ProblemSelectModalProps> = ({
	isOpen,
	selectedAssignment,
	instructorProblemsLoading = false,
	instructorProblems,
	filteredProblems: _filteredProblems,
	selectedProblemIds,
	problemSearchTerm: _problemSearchTerm,
	onClose,
	onProblemToggle,
	onSelectAll: _onSelectAll,
	onSearchChange: _onSearchChange,
	onSelectProblems,
	onCopyProblem: _onCopyProblem,
	onCreateNew,
	onProblemDetail,
	onClearProblemSelection,
}) => {
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
	const [loadingProblemSetsList, setLoadingProblemSetsList] = useState(false);
	const [loadingProblemSetProblems, setLoadingProblemSetProblems] =
		useState(false);
	const [loadingSectionsList, setLoadingSectionsList] = useState(false);
	const [loadingSectionAssignments, setLoadingSectionAssignments] =
		useState(false);
	const [loadingSectionProblems, setLoadingSectionProblems] = useState(false);

	const prevModeRef = useRef<"problems" | "problemSets" | "sections" | null>(
		null,
	);
	useEffect(() => {
		if (!isOpen) {
			prevModeRef.current = null;
			return;
		}
		if (
			prevModeRef.current !== null &&
			prevModeRef.current !== activeMode
		) {
			onClearProblemSelection?.();
		}
		prevModeRef.current = activeMode;
	}, [activeMode, isOpen, onClearProblemSelection]);

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
		if (!isOpen || activeMode !== "problemSets" || selectedProblemSet) return;
		let cancelled = false;
		setLoadingProblemSetsList(true);
		(async () => {
			try {
				const response = await APIService.getProblemSets();
				const sets = response?.data ?? response ?? [];
				if (!cancelled)
					setProblemSets(Array.isArray(sets) ? sets : []);
			} catch {
				if (!cancelled) setProblemSets([]);
			} finally {
				if (!cancelled) setLoadingProblemSetsList(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isOpen, activeMode, selectedProblemSet]);

	useEffect(() => {
		if (!selectedProblemSet) return;
		setProblemSetProblems([]);
		let cancelled = false;
		setLoadingProblemSetProblems(true);
		(async () => {
			try {
				const response = await APIService.getProblemSet(
					selectedProblemSet.id,
				);
				const problems = response?.problems ?? response?.data?.problems ?? [];
				if (!cancelled)
					setProblemSetProblems(Array.isArray(problems) ? problems : []);
			} catch {
				if (!cancelled) setProblemSetProblems([]);
			} finally {
				if (!cancelled) setLoadingProblemSetProblems(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedProblemSet]);

	useEffect(() => {
		if (!isOpen || activeMode !== "sections" || selectedSection) return;
		let cancelled = false;
		setLoadingSectionsList(true);
		(async () => {
			try {
				const response = await APIService.getInstructorDashboard();
				const sectionsData = response?.data ?? response ?? [];
				const filtered =
					Array.isArray(sectionsData) &&
					sectionsData.filter(
						(s: Section) => s.sectionId !== selectedAssignment?.sectionId,
					);
				if (!cancelled)
					setSections(Array.isArray(filtered) ? filtered : []);
			} catch {
				if (!cancelled) setSections([]);
			} finally {
				if (!cancelled) setLoadingSectionsList(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isOpen, activeMode, selectedSection, selectedAssignment?.sectionId]);

	useEffect(() => {
		if (!selectedSection || selectedAssignmentForSection) return;
		let cancelled = false;
		setLoadingSectionAssignments(true);
		(async () => {
			try {
				const sectionId = selectedSection.sectionId ?? selectedSection.id;
				if (sectionId == null) return;
				const response = await APIService.getAssignmentsBySection(sectionId);
				const assignments = response?.data ?? response ?? [];
				if (!cancelled)
					setSectionAssignments(Array.isArray(assignments) ? assignments : []);
			} catch {
				if (!cancelled) setSectionAssignments([]);
			} finally {
				if (!cancelled) setLoadingSectionAssignments(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedSection, selectedAssignmentForSection]);

	useEffect(() => {
		if (!selectedAssignmentForSection || !selectedSection) return;
		setSectionProblems([]);
		let cancelled = false;
		setLoadingSectionProblems(true);
		(async () => {
			try {
				const sectionId = selectedSection.sectionId ?? selectedSection.id;
				if (sectionId == null) return;
				const response = await APIService.getAssignmentProblems(
					sectionId,
					selectedAssignmentForSection.id,
				);
				const raw =
					response?.problems ??
					response?.data?.problems ??
					response?.data ??
					response;
				const problems = Array.isArray(raw) ? raw : [];
				if (!cancelled) setSectionProblems(problems);
			} catch {
				if (!cancelled) setSectionProblems([]);
			} finally {
				if (!cancelled) setLoadingSectionProblems(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [selectedAssignmentForSection, selectedSection]);

	if (!isOpen) return null;

	const showWidePicker =
		activeMode === "problems" ||
		(activeMode === "problemSets" && Boolean(selectedProblemSet)) ||
		(activeMode === "sections" && Boolean(selectedAssignmentForSection));

	return createPortal(
		<S.Overlay $alignCenter>
			<S.Content
				$extraLarge={showWidePicker}
				$large={!showWidePicker}
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
			>
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

					{activeMode === "problems" && selectedAssignment && (
						<AssignmentSourceProblemPicker
							sourceProblems={instructorProblems as Problem[]}
							sourceLoading={instructorProblemsLoading}
							sourceContextKey={`inst-${selectedAssignment.id}`}
							allSubtitle="전체 문제 (내 문제 라이브러리)"
							selectedAssignment={selectedAssignment}
							selectedProblemIds={selectedProblemIds}
							onProblemToggle={onProblemToggle}
							onProblemDetail={onProblemDetail}
						/>
					)}

					{activeMode === "problemSets" && !selectedProblemSet && (
						<div>
							<S.SectionTitle>문제집 선택</S.SectionTitle>
							{loadingProblemSetsList ? (
								<div
									style={{
										padding: "3rem",
										display: "flex",
										justifyContent: "center",
									}}
								>
									<LoadingSpinner message="문제집 목록을 불러오는 중..." />
								</div>
							) : problemSets.length > 0 ? (
								<S.ListContainer>
									{problemSets.map((set) => (
										<S.ListItem
											key={set.id}
											onClick={() => {
												onClearProblemSelection?.();
												setSelectedProblemSet(set);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													onClearProblemSelection?.();
													setSelectedProblemSet(set);
												}
											}}
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
									{loadingSectionsList ? (
										<div
											style={{
												padding: "3rem",
												display: "flex",
												justifyContent: "center",
											}}
										>
											<LoadingSpinner message="수업 목록을 불러오는 중..." />
										</div>
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
												onClearProblemSelection?.();
											}}
										>
											← 뒤로
										</S.BtnSecondary>
										<h3 style={{ margin: 0 }}>
											{selectedSection.courseTitle ?? selectedSection.title} -{" "}
											{selectedSection.sectionNumber}
										</h3>
									</div>
									{loadingSectionAssignments ? (
										<div
											style={{
												padding: "3rem",
												display: "flex",
												justifyContent: "center",
											}}
										>
											<LoadingSpinner message="과제 목록을 불러오는 중..." />
										</div>
									) : sectionAssignments.length > 0 ? (
										<S.ListContainer>
											{sectionAssignments.map((assignment) => (
												<S.ListItem
													key={assignment.id}
													onClick={() => {
														onClearProblemSelection?.();
														setSelectedAssignmentForSection(assignment);
													}}
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
												onClearProblemSelection?.();
											}}
										>
											← 뒤로
										</S.BtnSecondary>
										<h3 style={{ margin: 0 }}>
											{selectedAssignmentForSection.title}
										</h3>
									</div>
									{selectedAssignment && (
										<AssignmentSourceProblemPicker
											sourceProblems={sectionProblems as Problem[]}
											sourceLoading={loadingSectionProblems}
											sourceContextKey={`sec-${selectedAssignmentForSection.id}-${selectedSection?.sectionId}`}
											allSubtitle={`전체 (과제: ${selectedAssignmentForSection.title})`}
											selectedAssignment={selectedAssignment}
											selectedProblemIds={selectedProblemIds}
											onProblemToggle={onProblemToggle}
											onProblemDetail={onProblemDetail}
										/>
									)}
								</div>
							)}
						</div>
					)}

					{activeMode === "problemSets" && selectedProblemSet && selectedAssignment && (
						<div>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "1rem",
									marginBottom: "0.5rem",
								}}
							>
								<S.BtnSecondary
									type="button"
									onClick={() => {
										setSelectedProblemSet(null);
										setProblemSetProblems([]);
										onClearProblemSelection?.();
									}}
								>
									← 뒤로
								</S.BtnSecondary>
								<h3 style={{ margin: 0 }}>{selectedProblemSet.title}</h3>
							</div>
							<AssignmentSourceProblemPicker
								sourceProblems={problemSetProblems}
								sourceLoading={loadingProblemSetProblems}
								sourceContextKey={`ps-${selectedProblemSet.id}`}
								allSubtitle={`전체 (문제집: ${selectedProblemSet.title})`}
								selectedAssignment={selectedAssignment}
								selectedProblemIds={selectedProblemIds}
								onProblemToggle={onProblemToggle}
								onProblemDetail={onProblemDetail}
							/>
						</div>
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
