import type { FC } from "react";
import {
	useState,
	useMemo,
	useCallback,
	useEffect,
	useRef,
} from "react";
import { createPortal } from "react-dom";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import APIService from "../../../../../services/APIService";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";
import type { ProblemOption } from "../types";
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
import * as CreateS from "../../../Problems/ProblemCreate/styles";
import * as AmS from "../../../Assignments/AssignmentManagement/AssignmentModals/styles";

const PROBLEMS_PER_PAGE = 10;

function formatProblemCreatedAt(createdAt?: string): string {
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
	const labels: Record<string, string> = {
		"1": "쉬움",
		"2": "보통",
		"3": "어려움",
	};
	return labels[difficulty ?? ""] || difficulty || "";
}

function getDifficultyColor(difficulty?: string): string {
	const colors: Record<string, string> = {
		"1": "#10b981",
		"2": "#f59e0b",
		"3": "#ef4444",
	};
	return colors[difficulty ?? ""] || "#6b7280";
}

type SectionTab = "all" | "available" | "added";

interface ProblemWithMeta extends ProblemOption {
	createdAt?: string;
}

interface ProblemSetRow {
	id: number;
	title?: string;
	description?: string;
	problemCount?: number;
}

interface SectionRow {
	sectionId: number;
	id?: number;
	courseTitle?: string;
	title?: string;
	sectionNumber?: string;
}

interface AssignmentRow {
	id: number;
	title?: string;
	description?: string;
}

interface RemoteProblem {
	id: number;
	title?: string;
	createdAt?: string;
	difficulty?: string;
}

interface QuizProblemPickerPanelProps {
	d: CodingTestManagementHookReturn;
	sourceProblems: ProblemWithMeta[];
	sourceLoading: boolean;
	sourceContextKey: string;
	allSubtitle: string;
	idToSource: Map<number, ProblemWithMeta>;
}

const QuizProblemPickerPanel: FC<QuizProblemPickerPanelProps> = ({
	d,
	sourceProblems,
	sourceLoading,
	sourceContextKey,
	allSubtitle,
	idToSource,
}) => {
	const [sectionTab, setSectionTab] = useState<SectionTab>("available");
	const [originalOnly, setOriginalOnly] = useState<"ALL" | "ORIGINAL">("ALL");
	const { setProblemSearchTerm, setCurrentProblemPage, openProblemDetail } = d;

	useEffect(() => {
		setSectionTab("available");
		setOriginalOnly("ALL");
		setProblemSearchTerm("");
		setCurrentProblemPage(1);
	}, [sourceContextKey, setProblemSearchTerm, setCurrentProblemPage]);

	const quizProblemIds = useMemo(
		() => new Set(d.problemsForPicker.map((p) => p.id)),
		[d.problemsForPicker],
	);

	const filteredList = useMemo(() => {
		if (sectionTab === "added") {
			const list = d.problemsForPicker
				.map((p) => ({
					id: p.id,
					title: p.title,
					difficulty: undefined as string | undefined,
					createdAt: undefined as string | undefined,
				}))
				.filter((p) => {
					if (!d.problemSearchTerm.trim()) return true;
					const q = d.problemSearchTerm.toLowerCase();
					return (
						p.title?.toLowerCase().includes(q) ||
						String(p.id).includes(d.problemSearchTerm)
					);
				});
			return list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
		}

		let base: ProblemWithMeta[] =
			sectionTab === "available"
				? sourceProblems.filter((p) => !quizProblemIds.has(p.id))
				: [...sourceProblems];

		if (originalOnly === "ORIGINAL") {
			base = base.filter((p) => (p.title ?? "").endsWith("_오리지널"));
		}
		if (d.problemSearchTerm.trim()) {
			const q = d.problemSearchTerm.toLowerCase();
			base = base.filter(
				(p) =>
					p.title?.toLowerCase().includes(q) ||
					String(p.id).includes(d.problemSearchTerm),
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
		quizProblemIds,
		originalOnly,
		d.problemSearchTerm,
		d.problemsForPicker,
	]);

	const totalPages = Math.max(
		1,
		Math.ceil(filteredList.length / PROBLEMS_PER_PAGE),
	);
	const pageSlice = useMemo(() => {
		const start = (d.currentProblemPage - 1) * PROBLEMS_PER_PAGE;
		return filteredList.slice(start, start + PROBLEMS_PER_PAGE);
	}, [filteredList, d.currentProblemPage]);

	const selectedNewestFirst = useMemo(
		() =>
			[...d.selectedProblemIds]
				.reverse()
				.map((id) => idToSource.get(id))
				.filter(Boolean) as ProblemWithMeta[],
		[d.selectedProblemIds, idToSource],
	);

	const addableIds = useMemo(() => {
		if (sectionTab === "added") return [];
		return filteredList.map((p) => p.id);
	}, [sectionTab, filteredList]);

	const allAddableSelected =
		addableIds.length > 0 &&
		addableIds.every((id) => d.selectedProblemIds.includes(id));

	const { handleProblemToggle, selectedProblemIds } = d;

	const handleSelectAllFiltered = useCallback(() => {
		if (sectionTab === "added" || addableIds.length === 0) return;
		if (allAddableSelected) {
			addableIds.forEach((id) => {
				if (selectedProblemIds.includes(id)) handleProblemToggle(id);
			});
		} else {
			addableIds.forEach((id) => {
				if (!selectedProblemIds.includes(id)) handleProblemToggle(id);
			});
		}
	}, [
		sectionTab,
		addableIds,
		allAddableSelected,
		selectedProblemIds,
		handleProblemToggle,
	]);

	const handleProblemDetail = useCallback(
		(problemId: number) => {
			void openProblemDetail(problemId);
		},
		[openProblemDetail],
	);

	return (
		<PS.AddModalBodyTwoCol style={{ background: "#f1f5f9", paddingTop: "1rem" }}>
			<ProblemSelectColumn $accent>
				<ProblemPanelTitle>
					퀴즈에 넣을 문제 ({selectedNewestFirst.length})
				</ProblemPanelTitle>
				<ProblemPanelHint>
					선택한 원본 문제는 복사본으로 퀴즈에 추가됩니다. 맨 위가 가장 최근에 고른
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
									onClick={() => d.handleProblemToggle(problem.id)}
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
							d.setCurrentProblemPage(1);
						}}
					>
						전체
					</PS.SectionTab>
					<PS.SectionTab
						type="button"
						$active={sectionTab === "available"}
						onClick={() => {
							setSectionTab("available");
							d.setCurrentProblemPage(1);
						}}
					>
						추가 가능
					</PS.SectionTab>
					<PS.SectionTab
						type="button"
						$active={sectionTab === "added"}
						onClick={() => {
							setSectionTab("added");
							d.setCurrentProblemPage(1);
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
					{sectionTab === "available" && "이 퀴즈에 아직 없는 문제 (ID 기준)"}
					{sectionTab === "added" && "이 퀴즈에 이미 포함된 문제"}
					{" · 최근 등록 순"}
				</PS.MetaText>

				{sectionTab !== "added" && (
					<PS.AddModalSearchRow>
						<PS.AddModalSearchInput
							type="text"
							placeholder="문제명 또는 ID 검색..."
							value={d.problemSearchTerm}
							onChange={(e) => {
								d.setProblemSearchTerm(e.target.value);
								d.setCurrentProblemPage(1);
							}}
						/>
						<PS.AddModalOriginalSelect
							value={originalOnly}
							onChange={(e) => {
								setOriginalOnly(e.target.value as "ALL" | "ORIGINAL");
								d.setCurrentProblemPage(1);
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
							value={d.problemSearchTerm}
							onChange={(e) => {
								d.setProblemSearchTerm(e.target.value);
								d.setCurrentProblemPage(1);
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
				) : sectionTab === "added" && d.problemsForPicker.length === 0 ? (
					<PS.EmptyProblemsHint>이 퀴즈에 아직 문제가 없습니다.</PS.EmptyProblemsHint>
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
								이미 퀴즈에 들어 있는 문제입니다. 추가 선택은 왼쪽에서 원본을
								고르세요.
							</PS.MetaText>
						)}

						<PS.AddModalListWhite>
							{pageSlice.map((problem) => {
								const isAddedTab = sectionTab === "added";
								const isSelected = d.selectedProblemIds.includes(problem.id);
								const diffColor = getDifficultyColor(
									(problem as ProblemWithMeta).difficulty,
								);
								return (
									<PS.AddProblemCard
										key={`${isAddedTab ? "a" : "s"}-${problem.id}`}
										$selected={isSelected && !isAddedTab}
										$disabled={isAddedTab}
										style={{ marginBottom: "0.5rem" }}
										onClick={() => {
											if (!isAddedTab) d.handleProblemToggle(problem.id);
										}}
									>
										{!isAddedTab ? (
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => d.handleProblemToggle(problem.id)}
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
													<PS.AddedPill>퀴즈에 포함됨</PS.AddedPill>
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
												<PS.DiffPill
													$bg={`${diffColor}22`}
													$color={diffColor}
												>
													{getDifficultyLabel(
														(problem as ProblemWithMeta).difficulty,
													)}
												</PS.DiffPill>
												<span
													style={{
														fontSize: "0.75rem",
														color: "#64748b",
													}}
												>
													생성일:{" "}
													{formatProblemCreatedAt(
														(problem as ProblemWithMeta).createdAt,
													)}
												</span>
												{!isAddedTab && (
													<CreateS.CancelHeaderButton
														type="button"
														style={{
															padding: "0.25rem 0.6rem",
															fontSize: "0.75rem",
														}}
														onClick={(e) => {
															e.stopPropagation();
															handleProblemDetail(problem.id);
														}}
													>
														설명보기
													</CreateS.CancelHeaderButton>
												)}
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
									onClick={() =>
										d.setCurrentProblemPage((p) => Math.max(1, p - 1))
									}
									disabled={d.currentProblemPage === 1}
								>
									이전
								</CreateS.CancelHeaderButton>
								<PS.MetaText>
									{d.currentProblemPage} / {totalPages}
								</PS.MetaText>
								<CreateS.CancelHeaderButton
									type="button"
									style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
									onClick={() =>
										d.setCurrentProblemPage((p) =>
											Math.min(totalPages, p + 1),
										)
									}
									disabled={d.currentProblemPage === totalPages}
								>
									다음
								</CreateS.CancelHeaderButton>
							</PS.PaginationBar>
						)}
					</>
				) : (
					<PS.EmptyProblemsHint>
						{d.problemSearchTerm ||
						(sectionTab !== "added" && originalOnly === "ORIGINAL")
							? "조건에 맞는 문제가 없습니다."
							: sectionTab === "available"
								? "추가 가능한 문제가 없습니다."
								: sectionTab === "added"
									? "이 퀴즈에 아직 문제가 없습니다."
									: "문제가 없습니다."}
					</PS.EmptyProblemsHint>
				)}
			</PS.AddModalRightPanel>
		</PS.AddModalBodyTwoCol>
	);
};

interface AddProblemsToQuizModalProps {
	d: CodingTestManagementHookReturn;
}

const AddProblemsToQuizModal: FC<AddProblemsToQuizModalProps> = ({ d }) => {
	const [activeMode, setActiveMode] = useState<
		"problems" | "problemSets" | "sections"
	>("problems");
	const [problemSets, setProblemSets] = useState<ProblemSetRow[]>([]);
	const [selectedProblemSet, setSelectedProblemSet] =
		useState<ProblemSetRow | null>(null);
	const [problemSetProblems, setProblemSetProblems] = useState<RemoteProblem[]>(
		[],
	);
	const [sections, setSections] = useState<SectionRow[]>([]);
	const [selectedSection, setSelectedSection] = useState<SectionRow | null>(
		null,
	);
	const [sectionAssignments, setSectionAssignments] = useState<
		AssignmentRow[]
	>([]);
	const [selectedAssignmentForSection, setSelectedAssignmentForSection] =
		useState<AssignmentRow | null>(null);
	const [sectionProblems, setSectionProblems] = useState<RemoteProblem[]>([]);
	const [loadingProblemSetsList, setLoadingProblemSetsList] = useState(false);
	const [loadingProblemSetProblems, setLoadingProblemSetProblems] =
		useState(false);
	const [loadingSectionsList, setLoadingSectionsList] = useState(false);
	const [loadingSectionAssignments, setLoadingSectionAssignments] =
		useState(false);
	const [loadingSectionProblems, setLoadingSectionProblems] = useState(false);

	const prevModeRef = useRef<typeof activeMode | null>(null);
	const { clearQuizProblemSelection } = d;
	const clearSelectionIfDetail = useCallback(() => {
		if (d.quizId) clearQuizProblemSelection();
	}, [d.quizId, clearQuizProblemSelection]);
	useEffect(() => {
		if (!d.showAddProblemModal) {
			prevModeRef.current = null;
			return;
		}
		if (!d.quizId) {
			prevModeRef.current = activeMode;
			return;
		}
		if (
			prevModeRef.current !== null &&
			prevModeRef.current !== activeMode
		) {
			clearQuizProblemSelection();
		}
		prevModeRef.current = activeMode;
	}, [activeMode, d.showAddProblemModal, d.quizId, clearQuizProblemSelection]);

	useEffect(() => {
		if (!d.showAddProblemModal) return;
		setActiveMode("problems");
		setSelectedProblemSet(null);
		setProblemSetProblems([]);
		setSelectedSection(null);
		setSectionAssignments([]);
		setSelectedAssignmentForSection(null);
		setSectionProblems([]);
	}, [d.showAddProblemModal]);

	useEffect(() => {
		if (!d.showAddProblemModal || activeMode !== "problemSets" || selectedProblemSet)
			return;
		let cancelled = false;
		setLoadingProblemSetsList(true);
		(async () => {
			try {
				const response = await APIService.getProblemSets();
				const sets = response?.data ?? response ?? [];
				if (!cancelled) setProblemSets(Array.isArray(sets) ? sets : []);
			} catch {
				if (!cancelled) setProblemSets([]);
			} finally {
				if (!cancelled) setLoadingProblemSetsList(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [d.showAddProblemModal, activeMode, selectedProblemSet]);

	useEffect(() => {
		if (!selectedProblemSet) return;
		setProblemSetProblems([]);
		let cancelled = false;
		setLoadingProblemSetProblems(true);
		(async () => {
			try {
				const response = await APIService.getProblemSet(selectedProblemSet.id);
				const problems =
					response?.problems ?? response?.data?.problems ?? [];
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

	const currentSectionIdNum = d.sectionId
		? Number.parseInt(d.sectionId, 10)
		: NaN;

	useEffect(() => {
		if (!d.showAddProblemModal || activeMode !== "sections" || selectedSection)
			return;
		let cancelled = false;
		setLoadingSectionsList(true);
		(async () => {
			try {
				const response = await APIService.getInstructorDashboard();
				const sectionsData = response?.data ?? response ?? [];
				const filtered =
					Array.isArray(sectionsData) &&
					sectionsData.filter(
						(s: SectionRow) => s.sectionId !== currentSectionIdNum,
					);
				if (!cancelled) setSections(Array.isArray(filtered) ? filtered : []);
			} catch {
				if (!cancelled) setSections([]);
			} finally {
				if (!cancelled) setLoadingSectionsList(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [d.showAddProblemModal, activeMode, selectedSection, currentSectionIdNum]);

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

	const mergedIdToSource = useMemo(() => {
		const m = new Map<number, ProblemWithMeta>();
		const add = (arr: ProblemWithMeta[]) => {
			for (const p of arr) {
				if (!m.has(p.id)) m.set(p.id, p);
			}
		};
		add(d.allProblems as ProblemWithMeta[]);
		add(problemSetProblems as ProblemWithMeta[]);
		add(sectionProblems as ProblemWithMeta[]);
		return m;
	}, [d.allProblems, problemSetProblems, sectionProblems]);

	const selectedNewProblemCount = d.selectedProblemIds.filter(
		(id) => !d.problemsForPicker.some((p) => p.id === id),
	).length;

	const showWidePicker =
		activeMode === "problems" ||
		(activeMode === "problemSets" && Boolean(selectedProblemSet)) ||
		(activeMode === "sections" && Boolean(selectedAssignmentForSection));

	if (!d.showAddProblemModal) return null;

	return createPortal(
		<AmS.Overlay $alignCenter onClick={() => d.closeAddProblemModal()}>
			<AmS.Content
				$extraLarge={showWidePicker}
				$large={!showWidePicker}
				onClick={(e) => e.stopPropagation()}
			>
				<AmS.Header>
					<h2>
						{d.quizId
							? `문제 추가 - ${d.selectedQuizDetail?.title ?? ""}`
							: `문제 선택 - ${d.formData.title.trim() || "코딩 테스트"}`}
					</h2>
					<AmS.CloseButton
						type="button"
						onClick={() => d.closeAddProblemModal()}
					>
						✕
					</AmS.CloseButton>
				</AmS.Header>

				<AmS.Body>
					<AmS.ModeTabs>
						<AmS.ModeTab
							type="button"
							$active={activeMode === "problems"}
							onClick={() => setActiveMode("problems")}
						>
							내 문제
						</AmS.ModeTab>
						<AmS.ModeTab
							type="button"
							$active={activeMode === "problemSets"}
							onClick={() => setActiveMode("problemSets")}
						>
							문제집에서 가져오기
						</AmS.ModeTab>
						<AmS.ModeTab
							type="button"
							$active={activeMode === "sections"}
							onClick={() => setActiveMode("sections")}
						>
							수업에서 가져오기
						</AmS.ModeTab>
					</AmS.ModeTabs>

					{activeMode === "problems" && (
						<QuizProblemPickerPanel
							d={d}
							sourceProblems={d.allProblems as ProblemWithMeta[]}
							sourceLoading={d.loadingAllProblems}
							sourceContextKey="quiz-my-problems"
							allSubtitle="전체 문제 (내 문제 라이브러리)"
							idToSource={mergedIdToSource}
						/>
					)}

					{activeMode === "problemSets" && !selectedProblemSet && (
						<div>
							<AmS.SectionTitle>문제집 선택</AmS.SectionTitle>
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
								<AmS.ListContainer>
									{problemSets.map((set) => (
										<AmS.ListItem
											key={set.id}
											onClick={() => {
												clearSelectionIfDetail();
												setSelectedProblemSet(set);
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													clearSelectionIfDetail();
													setSelectedProblemSet(set);
												}
											}}
											role="button"
											tabIndex={0}
										>
											<h4>{set.title}</h4>
											{set.description && <p>{set.description}</p>}
											{set.problemCount !== undefined && (
												<AmS.ItemCount>{set.problemCount}개 문제</AmS.ItemCount>
											)}
										</AmS.ListItem>
									))}
								</AmS.ListContainer>
							) : (
								<AmS.NoAvailableText>
									<p>사용 가능한 문제집이 없습니다.</p>
								</AmS.NoAvailableText>
							)}
						</div>
					)}

					{activeMode === "sections" && (
						<div>
							{!selectedSection ? (
								<div>
									<AmS.SectionTitle>수업 선택</AmS.SectionTitle>
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
										<AmS.ListContainer>
											{sections.map((section) => (
												<AmS.ListItem
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
												</AmS.ListItem>
											))}
										</AmS.ListContainer>
									) : (
										<AmS.NoAvailableText>
											<p>사용 가능한 수업이 없습니다.</p>
										</AmS.NoAvailableText>
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
										<AmS.BtnSecondary
											type="button"
											onClick={() => {
												setSelectedSection(null);
												setSectionAssignments([]);
												clearSelectionIfDetail();
											}}
										>
											← 뒤로
										</AmS.BtnSecondary>
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
										<AmS.ListContainer>
											{sectionAssignments.map((assignment) => (
												<AmS.ListItem
													key={assignment.id}
													onClick={() => {
														clearSelectionIfDetail();
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
												</AmS.ListItem>
											))}
										</AmS.ListContainer>
									) : (
										<AmS.NoAvailableText>
											<p>과제가 없습니다.</p>
										</AmS.NoAvailableText>
									)}
								</div>
							) : (
								<div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "1rem",
											marginBottom: "0.5rem",
										}}
									>
										<AmS.BtnSecondary
											type="button"
											onClick={() => {
												setSelectedAssignmentForSection(null);
												setSectionProblems([]);
												clearSelectionIfDetail();
											}}
										>
											← 뒤로
										</AmS.BtnSecondary>
										<h3 style={{ margin: 0 }}>
											{selectedAssignmentForSection.title}
										</h3>
									</div>
									<QuizProblemPickerPanel
										d={d}
										sourceProblems={sectionProblems as ProblemWithMeta[]}
										sourceLoading={loadingSectionProblems}
										sourceContextKey={`quiz-sec-${selectedAssignmentForSection.id}-${selectedSection?.sectionId}`}
										allSubtitle={`전체 (과제: ${selectedAssignmentForSection.title})`}
										idToSource={mergedIdToSource}
									/>
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
									marginBottom: "0.5rem",
								}}
							>
								<AmS.BtnSecondary
									type="button"
									onClick={() => {
										setSelectedProblemSet(null);
										setProblemSetProblems([]);
										clearSelectionIfDetail();
									}}
								>
									← 뒤로
								</AmS.BtnSecondary>
								<h3 style={{ margin: 0 }}>{selectedProblemSet.title}</h3>
							</div>
							<QuizProblemPickerPanel
								d={d}
								sourceProblems={problemSetProblems as ProblemWithMeta[]}
								sourceLoading={loadingProblemSetProblems}
								sourceContextKey={`quiz-ps-${selectedProblemSet.id}`}
								allSubtitle={`전체 (문제집: ${selectedProblemSet.title})`}
								idToSource={mergedIdToSource}
							/>
						</div>
					)}
				</AmS.Body>

				<AmS.Actions>
					<AmS.BtnSecondary
						type="button"
						onClick={() => d.closeAddProblemModal()}
					>
						취소
					</AmS.BtnSecondary>
					{d.quizId && selectedNewProblemCount > 0 && (
						<AmS.BtnPrimary type="button" onClick={d.handleAddProblemsToQuiz}>
							추가 ({selectedNewProblemCount}개)
						</AmS.BtnPrimary>
					)}
					{!d.quizId && (
						<AmS.BtnPrimary
							type="button"
							onClick={() => d.closeAddProblemModal({ confirmList: true })}
						>
							확인 ({d.selectedProblemIds.length}개 선택됨)
						</AmS.BtnPrimary>
					)}
					<AmS.BtnCreateNew
						type="button"
						onClick={() => {
							d.closeAddProblemModal();
							d.navigate("/tutor/problems/create");
						}}
					>
						새 문제 만들기
					</AmS.BtnCreateNew>
				</AmS.Actions>
			</AmS.Content>
		</AmS.Overlay>,
		document.body,
	);
};

export default AddProblemsToQuizModal;
