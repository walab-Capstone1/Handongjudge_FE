import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type {
	CodingTest,
	QuizDetail,
	QuizProblem,
	ProblemOption,
	ProblemSubmissionStat,
	QuizSubmissionRecord,
	SectionInfo,
	SubmissionStudent,
} from "../types";

const PROBLEMS_PER_PAGE = 10;

/** API는 UTC로 저장하므로, 수정 폼의 datetime-local에 넣을 땐 로컬 시간으로 변환 */
function toLocalDateTimeInputValue(isoOrDate: string | Date): string {
	const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
	if (Number.isNaN(d.getTime())) return "";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	const h = String(d.getHours()).padStart(2, "0");
	const min = String(d.getMinutes()).padStart(2, "0");
	return `${y}-${m}-${day}T${h}:${min}`;
}

export function useCodingTestManagement() {
	const { sectionId, quizId } = useParams<{
		sectionId: string;
		quizId?: string;
	}>();
	const navigate = useNavigate();

	const [quizzes, setQuizzes] = useState<CodingTest[]>([]);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showAddProblemModal, setShowAddProblemModal] = useState(false);
	const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
	const [selectedProblemForDetail, setSelectedProblemForDetail] = useState<{
		title?: string;
		description?: string;
		timeLimit?: number;
		memoryLimit?: number;
	} | null>(null);
	const [selectedQuiz, setSelectedQuiz] = useState<CodingTest | null>(null);
	const [selectedQuizDetail, setSelectedQuizDetail] =
		useState<QuizDetail | null>(null);
	const [problems, setProblems] = useState<QuizProblem[]>([]);
	const [problemStats, setProblemStats] = useState<ProblemSubmissionStat[]>([]);
	const [submissions, setSubmissions] = useState<SubmissionStudent[]>([]);
	const [activeTab, setActiveTab] = useState("main");
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		startTime: "",
		endTime: "",
		problemIds: [] as number[],
	});
	const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
	const [allProblems, setAllProblems] = useState<ProblemOption[]>([]);
	const [problemSearchTerm, setProblemSearchTerm] = useState("");
	const [currentProblemPage, setCurrentProblemPage] = useState(1);
	const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
	const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

	// 제출 기록 (제출 상세정보 탭)
	const [submissionRecords, setSubmissionRecords] = useState<
		QuizSubmissionRecord[]
	>([]);
	const [submissionRecordsPage, setSubmissionRecordsPage] = useState(1);
	const [submissionRecordsTotalPages, setSubmissionRecordsTotalPages] =
		useState(0);
	const [submissionRecordsTotal, setSubmissionRecordsTotal] = useState(0);
	const [submissionResultFilter, setSubmissionResultFilter] =
		useState<string>("");
	const [submissionRecordsLoading, setSubmissionRecordsLoading] =
		useState(false);
	const [showCodeModal, setShowCodeModal] = useState(false);
	const [submissionCodeData, setSubmissionCodeData] = useState<{
		code: string;
		problemTitle: string;
		result: string;
		submittedAt: string;
		language: string;
	} | null>(null);
	const [submissionCodeLoading, setSubmissionCodeLoading] = useState(false);

	const selectedProblemIdsRef = useRef<number[]>([]);
	selectedProblemIdsRef.current = selectedProblemIds;

	const listModalProblemIdsSnapshotRef = useRef<number[] | null>(null);
	const prevShowAddProblemModalRef = useRef(false);

	const fetchQuizzes = useCallback(async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
			const response = await APIService.getQuizzesBySection(sectionId);
			const quizzesData = response?.data ?? response ?? [];
			interface QuizRaw {
				id: number;
				title: string;
				description?: string;
				startTime: string;
				endTime: string;
				status?: "ACTIVE" | "WAITING" | "ENDED";
				problemCount?: number;
			}
			const formattedQuizzes = (
				Array.isArray(quizzesData) ? quizzesData : []
			)
				.map((quiz: QuizRaw) => ({
					...quiz,
					startTime: new Date(quiz.startTime),
					endTime: new Date(quiz.endTime),
				}))
				.sort((a: CodingTest, b: CodingTest) => {
					const tA = new Date(a.startTime).getTime();
					const tB = new Date(b.startTime).getTime();
					return tA - tB;
				}) as CodingTest[];
			setQuizzes(formattedQuizzes);
		} catch (error) {
			console.error("코딩 테스트 조회 실패:", error);
			setQuizzes([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	const fetchSections = useCallback(async () => {
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = (dashboardResponse?.data ?? []) as SectionInfo[];
			if (sectionId) {
				const currentSectionData = sectionsData.find(
					(section) => section.sectionId === Number.parseInt(sectionId),
				);
				setCurrentSection(currentSectionData ?? null);
			}
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	}, [sectionId]);

	const fetchQuizDetail = useCallback(async () => {
		if (!sectionId || !quizId) return;
		try {
			const response = await APIService.getQuizInfo(sectionId, quizId);
			const quizData = response?.data ?? response;
			setSelectedQuizDetail({
				...quizData,
				startTime: new Date(quizData.startTime),
				endTime: new Date(quizData.endTime),
			});
		} catch (error) {
			console.error("코딩테스트 정보 조회 실패:", error);
			alert("코딩테스트 정보를 불러오는데 실패했습니다.");
		}
	}, [sectionId, quizId]);

	const fetchQuizProblems = useCallback(async () => {
		if (!sectionId || !quizId) return;
		try {
			const response = await APIService.getQuizProblems(sectionId, quizId);
			const problemsData = (response?.data ?? response ?? []) as {
				problemId?: number;
				id: number;
				title?: string;
				description?: string;
				problemOrder?: number;
				points?: number;
			}[];
			setProblems(
				problemsData.map((p) => ({
					id: p.problemId ?? p.id,
					title: p.title ?? "",
					description: p.description ?? "",
					order: p.problemOrder,
					points: p.points ?? 1,
				})),
			);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setProblems([]);
		}
	}, [sectionId, quizId]);

	const fetchProblemStats = useCallback(async () => {
		if (!sectionId || !quizId) return;
		try {
			const response = await APIService.getQuizSubmissionStats(
				sectionId,
				quizId,
			);
			const data = response?.data ?? response;
			const stats = (data?.problemStats ?? []) as ProblemSubmissionStat[];
			setProblemStats(stats);
		} catch (error) {
			console.error("제출 통계 조회 실패:", error);
			setProblemStats([]);
		}
	}, [sectionId, quizId]);

	const fetchSubmissionRecords = useCallback(async () => {
		if (!sectionId || !quizId) return;
		setSubmissionRecordsLoading(true);
		try {
			const response = await APIService.getQuizSubmissions(
				sectionId,
				quizId,
				{
					page: submissionRecordsPage - 1,
					size: 20,
					result:
						submissionResultFilter && submissionResultFilter !== "ALL"
							? submissionResultFilter
							: undefined,
				},
			);
			const data = response?.data ?? response;
			const content = (data?.content ?? []) as QuizSubmissionRecord[];
			setSubmissionRecords(content);
			setSubmissionRecordsTotalPages(data?.totalPages ?? 0);
			setSubmissionRecordsTotal(data?.totalElements ?? 0);
		} catch (error) {
			console.error("제출 기록 조회 실패:", error);
			setSubmissionRecords([]);
		} finally {
			setSubmissionRecordsLoading(false);
		}
	}, [sectionId, quizId, submissionRecordsPage, submissionResultFilter]);

	const fetchSubmissionCode = useCallback(
		async (submissionId: number) => {
			if (!sectionId || !quizId) return;
			setSubmissionCodeLoading(true);
			setShowCodeModal(true);
			try {
				const response = await APIService.getQuizSubmissionCode(
					sectionId,
					quizId,
					submissionId,
				);
				const data = response?.data ?? response;
				setSubmissionCodeData({
					code: data?.code ?? "",
					problemTitle: data?.problemTitle ?? "",
					result: data?.result ?? "",
					submittedAt: data?.submittedAt ?? "",
					language: data?.language ?? "",
				});
			} catch (error) {
				console.error("제출 코드 조회 실패:", error);
				setSubmissionCodeData(null);
			} finally {
				setSubmissionCodeLoading(false);
			}
		},
		[sectionId, quizId],
	);

	const closeCodeModal = useCallback(() => {
		setShowCodeModal(false);
		setSubmissionCodeData(null);
	}, []);

	const fetchSubmissions = useCallback(async () => {
		if (!sectionId) return;
		try {
			if (quizId) {
				const progressResponse = await APIService.getQuizStudentProgress(
					sectionId,
					quizId,
				);
				const progressData = (progressResponse?.data ?? progressResponse ?? []) as {
					userId?: number;
					studentId?: string;
					studentName?: string;
					solvedProblems?: number[];
					problemSubmissionTimes?: Record<string, string>;
				}[];
				const submissionsData = progressData.map((p) => ({
					userId: p.userId ?? 0,
					studentId: p.studentId ?? "",
					studentName: p.studentName ?? "",
					solvedProblems: p.solvedProblems ?? [],
					problemSubmissionTimes: (p.problemSubmissionTimes ?? {}) as Record<
						number,
						string
					>,
				}));
				setSubmissions(submissionsData);
			} else {
				const studentsResponse = await APIService.getSectionStudents(sectionId);
				const students = (studentsResponse?.data ?? studentsResponse ?? []) as {
					id?: number;
					userId?: number;
					email?: string;
					studentId?: string;
					name?: string;
					studentName?: string;
				}[];
				const submissionsData = students.map((student) => ({
					userId: student.id ?? student.userId ?? 0,
					studentId: student.email ?? student.studentId ?? "",
					studentName: student.name ?? student.studentName ?? "",
					solvedProblems: [] as number[],
					problemSubmissionTimes: {},
				}));
				setSubmissions(submissionsData);
			}
		} catch (error) {
			console.error("제출 현황 조회 실패:", error);
			setSubmissions([]);
		}
	}, [sectionId, quizId]);

	const fetchAllProblems = useCallback(async () => {
		try {
			const response = await APIService.getAllProblems();
			let problemsData: ProblemOption[] = [];
			if (Array.isArray(response)) {
				problemsData = response as ProblemOption[];
			} else if (response?.data && Array.isArray(response.data)) {
				problemsData = response.data as ProblemOption[];
			} else if (response?.data && !Array.isArray(response.data)) {
				problemsData = [response.data as ProblemOption];
			} else if (response && typeof response === "object") {
				problemsData = Object.values(response) as ProblemOption[];
			}
			setAllProblems(problemsData);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setAllProblems([]);
		}
	}, []);

	useEffect(() => {
		if (sectionId) {
			fetchQuizzes();
			fetchSections();
		}
	}, [sectionId, fetchQuizzes, fetchSections]);

	useEffect(() => {
		if (quizId && sectionId) {
			fetchQuizDetail();
			fetchQuizProblems();
			fetchSubmissions();
			fetchProblemStats();
		} else {
			setSelectedQuizDetail(null);
			setProblems([]);
			setProblemStats([]);
			setSubmissions([]);
			setActiveTab("main");
		}
	}, [quizId, sectionId, fetchQuizDetail, fetchQuizProblems, fetchSubmissions, fetchProblemStats]);

	useEffect(() => {
		if (showAddProblemModal) {
			fetchAllProblems();
		}
	}, [showAddProblemModal, fetchAllProblems]);

	/**
	 * 과제 문제 추가(handleAddProblem)와 동일한 패턴:
	 * - 퀴즈 상세: 모달 열 때 선택은 비움(이번에 추가할 문제만). 이미 퀴즈에 있는 문제는 problems / problemsForPicker로만 표시.
	 * - 목록 생성/수정: 열 때 스냅샷(취소 시 복원).
	 */
	useEffect(() => {
		const wasOpen = prevShowAddProblemModalRef.current;
		if (showAddProblemModal && !wasOpen) {
			if (quizId) {
				setSelectedProblemIds([]);
			} else {
				listModalProblemIdsSnapshotRef.current = [
					...selectedProblemIdsRef.current,
				];
			}
		}
		prevShowAddProblemModalRef.current = showAddProblemModal;
	}, [showAddProblemModal, quizId]);

	// 제출 기록: submissions 탭 활성 시 로드 및 폴링(8초)
	useEffect(() => {
		if (activeTab === "submissions" && sectionId && quizId) {
			fetchSubmissionRecords();
			const interval = setInterval(fetchSubmissionRecords, 8000);
			return () => clearInterval(interval);
		}
	}, [
		activeTab,
		sectionId,
		quizId,
		fetchSubmissionRecords,
	]);

	// 학생 진행 현황: student-progress 탭 활성 시 로드 및 폴링(8초)
	useEffect(() => {
		if (activeTab === "student-progress" && sectionId && quizId) {
			fetchSubmissions();
			const interval = setInterval(fetchSubmissions, 8000);
			return () => clearInterval(interval);
		}
	}, [activeTab, sectionId, quizId, fetchSubmissions]);

	const getFilteredProblems = useCallback((): ProblemOption[] => {
		let filtered = allProblems;
		if (problemSearchTerm) {
			const term = problemSearchTerm.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.title?.toLowerCase().includes(term) ||
					p.id?.toString().includes(term),
			);
		}
		return filtered;
	}, [allProblems, problemSearchTerm]);

	const getPaginatedProblems = useCallback((): ProblemOption[] => {
		const filtered = getFilteredProblems();
		const startIndex = (currentProblemPage - 1) * PROBLEMS_PER_PAGE;
		return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
	}, [getFilteredProblems, currentProblemPage]);

	const getTotalPages = useCallback(
		(): number =>
			Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE) || 1,
		[getFilteredProblems],
	);

	const getDifficultyLabel = useCallback((difficulty: string): string => {
		const labels: Record<string, string> = {
			"1": "쉬움",
			"2": "보통",
			"3": "어려움",
		};
		return labels[difficulty] ?? difficulty;
	}, []);

	const getDifficultyColor = useCallback((difficulty: string): string => {
		const colors: Record<string, string> = {
			"1": "#10b981",
			"2": "#f59e0b",
			"3": "#ef4444",
		};
		return colors[difficulty] ?? "#6b7280";
	}, []);

	const problemsForPicker = useMemo((): QuizProblem[] => {
		if (quizId) return problems;
		return selectedProblemIds.map((id) => {
			const p = allProblems.find((x) => x.id === id);
			return {
				id,
				title: p?.title ?? "",
				description: "",
				order: undefined,
				points: 1,
			};
		});
	}, [quizId, problems, selectedProblemIds, allProblems]);

	const openProblemDetail = useCallback(async (problemId: number) => {
		try {
			const detail = await APIService.getProblemInfo(problemId);
			setSelectedProblemForDetail({
				...(detail?.data || detail),
			});
			setShowProblemDetailModal(true);
		} catch (err) {
			console.error("문제 정보 조회 실패:", err);
			alert("문제 정보를 불러오는데 실패했습니다.");
		}
	}, []);

	const closeProblemDetailModal = useCallback(() => {
		setShowProblemDetailModal(false);
		setSelectedProblemForDetail(null);
	}, []);

	const formatDateTime = useCallback((dateTime: Date | string): string => {
		const date = new Date(dateTime);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}, []);

	const handleCreateQuiz = useCallback(() => {
		setFormData({
			title: "",
			description: "",
			startTime: "",
			endTime: "",
			problemIds: [],
		});
		setSelectedProblemIds([]);
		setShowCreateModal(true);
	}, []);

	const handleEditQuiz = useCallback((quiz: CodingTest) => {
		const start =
			quiz.startTime instanceof Date
				? quiz.startTime
				: new Date(quiz.startTime);
		const end =
			quiz.endTime instanceof Date ? quiz.endTime : new Date(quiz.endTime);
		setFormData({
			title: quiz.title,
			description: quiz.description ?? "",
			startTime: toLocalDateTimeInputValue(start),
			endTime: toLocalDateTimeInputValue(end),
			problemIds: [],
		});
		setSelectedQuiz(quiz);
		setShowEditModal(true);
	}, []);

	const handleDeleteQuiz = useCallback(
		async (quizIdToDelete: number) => {
			if (!window.confirm("정말로 이 코딩 테스트를 삭제하시겠습니까?")) {
				return;
			}
			if (!sectionId) return;
			try {
				await APIService.deleteQuiz(sectionId, quizIdToDelete);
				fetchQuizzes();
				if (quizIdToDelete === Number(quizId)) {
					navigate(`/tutor/coding-tests/section/${sectionId}`);
				}
				alert("코딩 테스트가 삭제되었습니다.");
			} catch (error) {
				console.error("코딩 테스트 삭제 실패:", error);
				alert("코딩 테스트 삭제에 실패했습니다.");
			}
		},
		[sectionId, quizId, navigate, fetchQuizzes],
	);

	const handleSubmitCreate = useCallback(async () => {
		if (!formData.title.trim()) {
			alert("제목을 입력해주세요.");
			return;
		}
		if (!formData.startTime || !formData.endTime) {
			alert("시작 시간과 종료 시간을 입력해주세요.");
			return;
		}
		if (new Date(formData.startTime) >= new Date(formData.endTime)) {
			alert("종료 시간은 시작 시간보다 늦어야 합니다.");
			return;
		}
		if (selectedProblemIds.length === 0) {
			alert("최소 1개 이상의 문제를 선택해주세요.");
			return;
		}
		if (!sectionId) return;
		setIsSubmittingCreate(true);
		try {
			const copiedProblemIds: number[] = [];
			for (const problemId of selectedProblemIds) {
				const newProblemId = await APIService.copyProblem(problemId);
				copiedProblemIds.push(
					typeof newProblemId === "number"
						? newProblemId
						: (newProblemId as { id: number }).id,
				);
			}
			const quizData = {
				title: formData.title,
				description: formData.description,
				startTime: new Date(formData.startTime).toISOString(),
				endTime: new Date(formData.endTime).toISOString(),
				problemIds: copiedProblemIds,
			};
			await APIService.createQuiz(sectionId, quizData);
			setShowCreateModal(false);
			fetchQuizzes();
			alert("코딩 테스트가 생성되었습니다.");
		} catch (error) {
			console.error("코딩 테스트 생성 실패:", error);
			alert("코딩 테스트 생성에 실패했습니다.");
		} finally {
			setIsSubmittingCreate(false);
		}
	}, [
		formData.title,
		formData.description,
		formData.startTime,
		formData.endTime,
		selectedProblemIds,
		sectionId,
		fetchQuizzes,
	]);

	const handleSubmitEdit = useCallback(async () => {
		if (!formData.title.trim()) {
			alert("제목을 입력해주세요.");
			return;
		}
		if (!formData.startTime || !formData.endTime) {
			alert("시작 시간과 종료 시간을 입력해주세요.");
			return;
		}
		if (new Date(formData.startTime) >= new Date(formData.endTime)) {
			alert("종료 시간은 시작 시간보다 늦어야 합니다.");
			return;
		}
		if (!selectedQuiz || !sectionId) return;
		setIsSubmittingEdit(true);
		try {
			const quizData = {
				title: formData.title,
				description: formData.description,
				startTime: new Date(formData.startTime).toISOString(),
				endTime: new Date(formData.endTime).toISOString(),
			};
			await APIService.updateQuiz(sectionId, selectedQuiz.id, quizData);
			setShowEditModal(false);
			setSelectedQuiz(null);
			fetchQuizzes();
			alert("코딩 테스트가 수정되었습니다.");
		} catch (error) {
			console.error("코딩 테스트 수정 실패:", error);
			alert("코딩 테스트 수정에 실패했습니다.");
		} finally {
			setIsSubmittingEdit(false);
		}
	}, [
		formData.title,
		formData.description,
		formData.startTime,
		formData.endTime,
		selectedQuiz,
		sectionId,
		fetchQuizzes,
	]);

	const handleProblemToggle = useCallback((problemId: number) => {
		setSelectedProblemIds((prev) =>
			prev.includes(problemId)
				? prev.filter((id) => id !== problemId)
				: [...prev, problemId],
		);
	}, []);

	const handleSelectAllProblems = useCallback(() => {
		setSelectedProblemIds((prev) => {
			const filtered = getFilteredProblems();
			const selectableFiltered = showAddProblemModal
				? filtered.filter(
						(problem) => !problemsForPicker.some((p) => p.id === problem.id),
					)
				: filtered;
			const allSelected =
				selectableFiltered.length > 0 &&
				selectableFiltered.every((p) => prev.includes(p.id));
			if (allSelected) {
				const filteredIds = selectableFiltered.map((p) => p.id);
				return prev.filter((id) => !filteredIds.includes(id));
			}
			const newIds = selectableFiltered.map((p) => p.id);
			return [...new Set([...prev, ...newIds])];
		});
	}, [getFilteredProblems, showAddProblemModal, problemsForPicker]);

	const handleRemoveProblemFromQuiz = useCallback(
		async (problemId: number) => {
			if (
				!window.confirm("정말로 이 문제를 코딩테스트에서 제거하시겠습니까?")
			) {
				return;
			}
			if (!sectionId || !quizId) return;
			try {
				await APIService.removeQuizProblem(sectionId, quizId, problemId);
				fetchQuizProblems();
				fetchProblemStats();
				alert("문제가 제거되었습니다.");
			} catch (error) {
				console.error("문제 제거 실패:", error);
				alert(
					error instanceof Error ? error.message : "문제 제거에 실패했습니다.",
				);
			}
		},
		[sectionId, quizId, fetchQuizProblems, fetchProblemStats],
	);

	const closeAddProblemModal = useCallback(
		(options?: { confirmList?: boolean }) => {
			const confirmList = options?.confirmList === true;

			if (!quizId) {
				if (!confirmList && listModalProblemIdsSnapshotRef.current) {
					setSelectedProblemIds(listModalProblemIdsSnapshotRef.current);
				}
				listModalProblemIdsSnapshotRef.current = null;
			} else {
				setSelectedProblemIds([]);
			}

			setShowAddProblemModal(false);
			setProblemSearchTerm("");
			setCurrentProblemPage(1);
		},
		[quizId],
	);

	const clearQuizProblemSelection = useCallback(() => {
		setSelectedProblemIds([]);
	}, []);

	const handleAddProblemsToQuiz = useCallback(async () => {
		if (!sectionId || !quizId || !selectedQuizDetail) return;
		const newProblemIds = selectedProblemIds.filter(
			(id) => !problems.some((p) => p.id === id),
		);
		if (newProblemIds.length === 0) {
			alert("추가할 문제를 선택해주세요.");
			return;
		}
		try {
			for (const pid of newProblemIds) {
				const res = await APIService.copyProblem(pid);
				const newId =
					typeof res === "number" ? res : (res as { id: number }).id;
				await APIService.addProblemToQuiz(sectionId, quizId, newId);
			}
			closeAddProblemModal();
			fetchQuizProblems();
			alert(`${newProblemIds.length}개의 문제가 추가되었습니다.`);
		} catch (err) {
			console.error(err);
			alert("문제 추가에 실패했습니다.");
		}
	}, [
		sectionId,
		quizId,
		selectedQuizDetail,
		selectedProblemIds,
		problems,
		closeAddProblemModal,
		fetchQuizProblems,
	]);

	const handleStart = useCallback(async () => {
		if (!sectionId || !quizId) return;
		try {
			if (selectedQuizDetail?.active === false) {
				alert("현재 비공개 상태입니다.");
				const shouldOpen = window.confirm(
					"코딩 테스트가 비공개 상태입니다. 공개로 변경하고 시작하시겠습니까?",
				);
				if (!shouldOpen) return;
				await APIService.toggleQuizActive(sectionId, quizId, true);
			}
			await APIService.updateQuizStatus(sectionId, quizId, "ACTIVE");
			fetchQuizzes();
			fetchQuizDetail();
			alert("코딩테스트를 시작했습니다.");
		} catch (error) {
			console.error("시작 실패:", error);
			alert(
				error instanceof Error ? error.message : "시작에 실패했습니다.",
			);
		}
	}, [sectionId, quizId, selectedQuizDetail, fetchQuizzes, fetchQuizDetail]);

	const handleStop = useCallback(async () => {
		if (!sectionId || !quizId) return;
		try {
			await APIService.updateQuizStatus(sectionId, quizId, "PAUSED");
			fetchQuizzes();
			fetchQuizDetail();
			alert("코딩테스트를 일시정지했습니다.");
		} catch (error) {
			console.error("정지 실패:", error);
			alert(
				error instanceof Error ? error.message : "정지에 실패했습니다.",
			);
		}
	}, [sectionId, quizId, fetchQuizzes, fetchQuizDetail]);

	const handleEnd = useCallback(async () => {
		if (!window.confirm("정말로 코딩테스트를 종료하시겠습니까?")) return;
		if (!sectionId || !quizId) return;
		try {
			await APIService.updateQuizStatus(sectionId, quizId, "ENDED");
			fetchQuizzes();
			fetchQuizDetail();
			alert("코딩테스트를 종료했습니다.");
		} catch (error) {
			console.error("종료 실패:", error);
			alert(
				error instanceof Error ? error.message : "종료에 실패했습니다.",
			);
		}
	}, [sectionId, quizId, fetchQuizzes, fetchQuizDetail]);

	const handleToggleActive = useCallback(
		async (secId: number, targetQuizId: number, currentActive?: boolean) => {
			try {
				const newActive = !currentActive;
				await APIService.toggleQuizActive(secId, targetQuizId, newActive);
				fetchQuizzes();
				if (quizId && targetQuizId === Number(quizId)) {
					fetchQuizDetail();
				}
			} catch (error) {
				console.error("퀴즈 활성화 상태 변경 실패:", error);
				alert("퀴즈 활성화 상태 변경에 실패했습니다.");
			}
		},
		[fetchQuizzes, fetchQuizDetail, quizId],
	);

	const filteredQuizzes = quizzes.filter((quiz) => {
		const matchesSearch =
			quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			filterStatus === "ALL" || quiz.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const isAllProblemsSelected =
		getFilteredProblems().length > 0 &&
		getFilteredProblems().every((p) => selectedProblemIds.includes(p.id));

	return {
		sectionId,
		quizId,
		navigate,
		quizzes,
		currentSection,
		loading,
		searchTerm,
		setSearchTerm,
		filterStatus,
		setFilterStatus,
		showCreateModal,
		setShowCreateModal,
		showEditModal,
		setShowEditModal,
		showAddProblemModal,
		setShowAddProblemModal,
		showProblemDetailModal,
		selectedProblemForDetail,
		openProblemDetail,
		closeProblemDetailModal,
		selectedQuiz,
		setSelectedQuiz,
		selectedQuizDetail,
		problems,
		problemsForPicker,
		submissions,
		activeTab,
		setActiveTab,
		formData,
		setFormData,
		selectedProblemIds,
		setSelectedProblemIds,
		allProblems,
		problemSearchTerm,
		setProblemSearchTerm,
		currentProblemPage,
		setCurrentProblemPage,
		fetchQuizzes,
		getFilteredProblems,
		getPaginatedProblems,
		getTotalPages,
		getDifficultyLabel,
		getDifficultyColor,
		formatDateTime,
		filteredQuizzes,
		isAllProblemsSelected,
		handleCreateQuiz,
		handleEditQuiz,
		handleDeleteQuiz,
		handleSubmitCreate,
		isSubmittingCreate,
		isSubmittingEdit,
		handleSubmitEdit,
		handleProblemToggle,
		handleSelectAllProblems,
		handleRemoveProblemFromQuiz,
		closeAddProblemModal,
		clearQuizProblemSelection,
		handleAddProblemsToQuiz,
		handleStart,
		handleStop,
		handleEnd,
		handleToggleActive,
		problemStats,
		submissionRecords,
		submissionRecordsPage,
		setSubmissionRecordsPage,
		submissionRecordsTotalPages,
		submissionRecordsTotal,
		submissionResultFilter,
		setSubmissionResultFilter,
		submissionRecordsLoading,
		fetchSubmissionRecords,
		fetchSubmissionCode,
		showCodeModal,
		closeCodeModal,
		submissionCodeData,
		submissionCodeLoading,
	};
}

export type CodingTestManagementHookReturn = ReturnType<
	typeof useCodingTestManagement
>;
