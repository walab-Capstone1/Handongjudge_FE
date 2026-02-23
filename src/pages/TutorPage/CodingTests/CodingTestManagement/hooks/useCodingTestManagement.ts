import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type {
	CodingTest,
	QuizDetail,
	QuizProblem,
	ProblemOption,
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
	const [showProblemModal, setShowProblemModal] = useState(false);
	const [showAddProblemModal, setShowAddProblemModal] = useState(false);
	const [selectedQuiz, setSelectedQuiz] = useState<CodingTest | null>(null);
	const [selectedQuizDetail, setSelectedQuizDetail] =
		useState<QuizDetail | null>(null);
	const [problems, setProblems] = useState<QuizProblem[]>([]);
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
			}[];
			setProblems(
				problemsData.map((p) => ({
					id: p.problemId ?? p.id,
					title: p.title ?? "",
					description: p.description ?? "",
					order: p.problemOrder,
				})),
			);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setProblems([]);
		}
	}, [sectionId, quizId]);

	const fetchSubmissions = useCallback(async () => {
		if (!sectionId) return;
		try {
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
		} catch (error) {
			console.error("제출 현황 조회 실패:", error);
			setSubmissions([]);
		}
	}, [sectionId]);

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
		} else {
			setSelectedQuizDetail(null);
			setProblems([]);
			setSubmissions([]);
			setActiveTab("main");
		}
	}, [quizId, sectionId, fetchQuizDetail, fetchQuizProblems, fetchSubmissions]);

	useEffect(() => {
		if (showProblemModal || showAddProblemModal) {
			fetchAllProblems();
		}
	}, [showProblemModal, showAddProblemModal, fetchAllProblems]);

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

	const handleEditQuiz = useCallback(
		async (quiz: CodingTest) => {
			if (!sectionId) return;
			try {
				const problemsResponse = await APIService.getQuizProblems(
					sectionId,
					String(quiz.id),
				);
				const problemsData = (problemsResponse?.data ??
					problemsResponse ??
					[]) as {
					problemId?: number;
					id: number;
				}[];
				const problemIds = problemsData.map((p) => p.problemId ?? p.id);
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
					problemIds,
				});
				setSelectedProblemIds(problemIds);
				setSelectedQuiz(quiz);
				setShowEditModal(true);
			} catch (error) {
				console.error("코딩 테스트 정보 조회 실패:", error);
				alert("코딩 테스트 정보를 불러오는데 실패했습니다.");
			}
		},
		[sectionId],
	);

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
		selectedProblemIds,
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
			const allSelected =
				filtered.length > 0 && filtered.every((p) => prev.includes(p.id));
			if (allSelected) {
				const filteredIds = filtered.map((p) => p.id);
				return prev.filter((id) => !filteredIds.includes(id));
			}
			const newIds = filtered.map((p) => p.id);
			return [...new Set([...prev, ...newIds])];
		});
	}, [getFilteredProblems]);

	const handleRemoveProblemFromQuiz = useCallback(
		async (_problemId: number) => {
			if (
				!window.confirm("정말로 이 문제를 코딩테스트에서 제거하시겠습니까?")
			) {
				return;
			}
			alert("문제 제거 기능은 백엔드 API 구현이 필요합니다.");
		},
		[],
	);

	const closeProblemModal = useCallback(() => {
		setShowProblemModal(false);
		setProblemSearchTerm("");
		setCurrentProblemPage(1);
	}, []);

	const closeAddProblemModal = useCallback(() => {
		setShowAddProblemModal(false);
		setProblemSearchTerm("");
		setCurrentProblemPage(1);
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
			const copiedIds: number[] = [];
			for (const pid of newProblemIds) {
				const res = await APIService.copyProblem(pid);
				copiedIds.push(
					typeof res === "number" ? res : (res as { id: number }).id,
				);
			}
			const currentIds = problems.map((p) => p.id);
			const quizData = {
				title: selectedQuizDetail.title,
				description: selectedQuizDetail.description ?? "",
				startTime:
					selectedQuizDetail.startTime instanceof Date
						? selectedQuizDetail.startTime.toISOString()
						: new Date(selectedQuizDetail.startTime).toISOString(),
				endTime:
					selectedQuizDetail.endTime instanceof Date
						? selectedQuizDetail.endTime.toISOString()
						: new Date(selectedQuizDetail.endTime).toISOString(),
				problemIds: [...currentIds, ...copiedIds],
			};
			await APIService.updateQuiz(sectionId, quizId, quizData);
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

	const handleStart = useCallback(() => {
		alert("시작 기능은 백엔드 API 구현이 필요합니다.");
	}, []);

	const handleStop = useCallback(() => {
		alert("정지 기능은 백엔드 API 구현이 필요합니다.");
	}, []);

	const handleEnd = useCallback(() => {
		if (window.confirm("정말로 코딩테스트를 종료하시겠습니까?")) {
			alert("종료 기능은 백엔드 API 구현이 필요합니다.");
		}
	}, []);

	const handleToggleActive = useCallback(
		async (secId: number, quizId: number, currentActive?: boolean) => {
			try {
				const newActive = !currentActive;
				await APIService.toggleQuizActive(secId, quizId, newActive);
				fetchQuizzes();
				if (quizId === Number(quizId)) {
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
		showProblemModal,
		setShowProblemModal,
		showAddProblemModal,
		setShowAddProblemModal,
		selectedQuiz,
		setSelectedQuiz,
		selectedQuizDetail,
		problems,
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
		closeProblemModal,
		closeAddProblemModal,
		handleAddProblemsToQuiz,
		handleStart,
		handleStop,
		handleEnd,
		handleToggleActive,
	};
}

export type CodingTestManagementHookReturn = ReturnType<
	typeof useCodingTestManagement
>;
