import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { Problem, Section, Assignment, ProblemUsage } from "../types";

export function useProblemManagement() {
	const navigate = useNavigate();

	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
	const [showProblemModal, setShowProblemModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);
	const [showCopyModal, setShowCopyModal] = useState(false);
	const [problemToCopy, setProblemToCopy] = useState<Problem | null>(null);
	const [copyTitle, setCopyTitle] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [alertType, setAlertType] = useState<"success" | "error">("success");
	const [showUsageModal, setShowUsageModal] = useState(false);
	const [problemUsage, setProblemUsage] = useState<ProblemUsage>({
		assignments: [],
		problemSets: [],
		quizzes: [],
	});
	const [loadingUsage, setLoadingUsage] = useState(false);
	const [problemForUsage, setProblemForUsage] = useState<Problem | null>(null);
	const [filterUsageStatus, setFilterUsageStatus] = useState("ALL");
	const [filterDifficulty, setFilterDifficulty] = useState("ALL");
	const [filterCourse, setFilterCourse] = useState("ALL");
	const [filterAssignment, setFilterAssignment] = useState("ALL");
	const [filterTag, setFilterTag] = useState("ALL");
	const [sections, setSections] = useState<Section[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [problemUsageMap, setProblemUsageMap] = useState<
		Record<number, unknown[]>
	>({});
	const [loadingUsageData, setLoadingUsageData] = useState(false);
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [openMoreMenu, setOpenMoreMenu] = useState<number | null>(null);

	const fetchProblems = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllProblems();
			let problemsData: Problem[] = [];
			if (Array.isArray(response)) {
				problemsData = response;
			} else if (response?.data && Array.isArray(response.data)) {
				problemsData = response.data;
			} else if (response?.data && !Array.isArray(response.data)) {
				problemsData = [response.data];
			} else if (response && typeof response === "object") {
				problemsData = Object.values(response);
			}
			setProblems(problemsData);
			const allTags = new Set<string>();
			problemsData.forEach((problem) => {
				if (problem.tags) {
					if (Array.isArray(problem.tags)) {
						problem.tags.forEach((tag) => {
							if (tag && String(tag).trim()) {
								allTags.add(String(tag).trim());
							}
						});
					} else if (typeof problem.tags === "string") {
						try {
							const parsedTags = JSON.parse(problem.tags);
							if (Array.isArray(parsedTags)) {
								parsedTags.forEach((tag: string) => {
									if (tag && tag.trim()) allTags.add(tag.trim());
								});
							} else if (parsedTags && String(parsedTags).trim()) {
								allTags.add(String(parsedTags).trim());
							}
						} catch {
							if (problem.tags.trim()) allTags.add(problem.tags.trim());
						}
					}
				}
			});
			setAvailableTags(Array.from(allTags).sort());
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setProblems([]);
			setAvailableTags([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchSections = useCallback(async () => {
		try {
			const response = await APIService.getInstructorDashboard();
			const sectionsData = response?.data ?? response ?? [];
			setSections(Array.isArray(sectionsData) ? sectionsData : []);
		} catch (error) {
			console.error("수업 목록 조회 실패:", error);
			setSections([]);
		}
	}, []);

	const fetchAssignmentsForSection = useCallback(
		async (sectionId: string) => {
			try {
				const response = await APIService.getAssignmentsBySection(
					Number.parseInt(sectionId, 10),
				);
				const assignmentsData = response?.data ?? response ?? [];
				setAssignments(
					Array.isArray(assignmentsData) ? assignmentsData : [],
				);
			} catch (error) {
				console.error("과제 목록 조회 실패:", error);
				setAssignments([]);
			}
		},
		[],
	);

	const fetchProblemUsageData = useCallback(async () => {
		if (problems.length === 0) return;
		try {
			setLoadingUsageData(true);
			const usageMap: Record<number, unknown[]> = {};
			const usedProblems = problems.filter((p) => p.isUsed === true);
			await Promise.all(
				usedProblems.map(async (problem) => {
					try {
						const response = await APIService.getProblemAssignments(
							problem.id,
						);
						const list = Array.isArray(response)
							? response
							: response?.data ?? [];
						usageMap[problem.id] = list;
					} catch (error) {
						console.error(
							`문제 ${problem.id} 사용 현황 조회 실패:`,
							error,
						);
						usageMap[problem.id] = [];
					}
				}),
			);
			setProblemUsageMap(usageMap);
		} catch (error) {
			console.error("문제 사용 현황 조회 실패:", error);
			setProblemUsageMap({});
		} finally {
			setLoadingUsageData(false);
		}
	}, [problems]);

	useEffect(() => {
		fetchProblems();
		fetchSections();
	}, [fetchProblems, fetchSections]);

	useEffect(() => {
		if (filterUsageStatus === "USED" && problems.length > 0) {
			fetchProblemUsageData();
		} else {
			setProblemUsageMap({});
		}
	}, [filterUsageStatus, problems.length, fetchProblemUsageData]);

	useEffect(() => {
		if (filterCourse !== "ALL") {
			fetchAssignmentsForSection(filterCourse);
		} else {
			setAssignments([]);
			setFilterAssignment("ALL");
		}
	}, [filterCourse, fetchAssignmentsForSection]);

	const getProblemTags = useCallback((problem: Problem): string[] => {
		if (!problem.tags) return [];
		if (Array.isArray(problem.tags)) {
			return problem.tags
				.map((tag) => tag && String(tag).trim())
				.filter((tag): tag is string => Boolean(tag));
		}
		if (typeof problem.tags === "string") {
			try {
				const parsedTags = JSON.parse(problem.tags);
				if (Array.isArray(parsedTags)) {
					return parsedTags
						.map((tag: string) => tag && tag.trim())
						.filter((tag): tag is string => Boolean(tag));
				}
				if (parsedTags && String(parsedTags).trim()) {
					return [String(parsedTags).trim()];
				}
			} catch {
				if (problem.tags.trim()) return [problem.tags.trim()];
			}
		}
		return [];
	}, []);

	const filteredProblems = problems.filter((problem) => {
		const matchesSearch = problem.title
			?.toLowerCase()
			.includes(searchTerm.toLowerCase());
		let matchesUsage = true;
		if (filterUsageStatus === "USED") {
			matchesUsage = problem.isUsed === true;
		} else if (filterUsageStatus === "UNUSED") {
			matchesUsage = !problem.isUsed;
		}
		let matchesDifficulty = true;
		if (filterDifficulty !== "ALL") {
			matchesDifficulty = problem.difficulty === filterDifficulty;
		}
		let matchesTag = true;
		if (filterTag !== "ALL") {
			matchesTag = getProblemTags(problem).includes(filterTag);
		}
		let matchesCourseAndAssignment = true;
		if (filterUsageStatus === "USED" && problem.isUsed === true) {
			const usageList = problemUsageMap[problem.id] ?? [];
			if (filterCourse !== "ALL" || filterAssignment !== "ALL") {
				matchesCourseAndAssignment = (usageList as { sectionId?: number; assignmentId?: number }[]).some(
					(usage) => {
						const matchesCourse =
							filterCourse === "ALL" ||
							usage.sectionId === Number.parseInt(filterCourse, 10);
						const matchesAssignment =
							filterAssignment === "ALL" ||
							usage.assignmentId ===
								Number.parseInt(filterAssignment, 10);
						return matchesCourse && matchesAssignment;
					},
				);
			}
		}
		return (
			matchesSearch &&
			matchesUsage &&
			matchesDifficulty &&
			matchesTag &&
			matchesCourseAndAssignment
		);
	});

	const formatDate = useCallback((dateString?: string) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	}, []);

	const formatDateTime = useCallback((dateString?: string) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}, []);

	const handleDeleteClick = useCallback((problem: Problem) => {
		setProblemToDelete(problem);
		setShowDeleteModal(true);
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		if (!problemToDelete) return;
		try {
			setIsDeleting(true);
			await APIService.deleteProblem(problemToDelete.id);
			setAlertMessage("문제가 성공적으로 삭제되었습니다.");
			setAlertType("success");
			setShowDeleteModal(false);
			setProblemToDelete(null);
			fetchProblems();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error: unknown) {
			console.error("문제 삭제 실패:", error);
			setAlertMessage(
				`문제 삭제에 실패했습니다. ${error instanceof Error ? error.message : ""}`,
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsDeleting(false);
		}
	}, [problemToDelete, fetchProblems]);

	const handleCopyClick = useCallback((problem: Problem) => {
		setProblemToCopy(problem);
		setCopyTitle(`${problem.title} (복사본)`);
		setShowCopyModal(true);
	}, []);

	const handleCopyConfirm = useCallback(async () => {
		if (!problemToCopy) return;
		try {
			setIsCopying(true);
			await APIService.copyProblem(problemToCopy.id, copyTitle);
			setAlertMessage("문제가 성공적으로 복사되었습니다.");
			setAlertType("success");
			setShowCopyModal(false);
			setProblemToCopy(null);
			setCopyTitle("");
			fetchProblems();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error: unknown) {
			console.error("문제 복사 실패:", error);
			setAlertMessage(
				`문제 복사에 실패했습니다. ${error instanceof Error ? error.message : ""}`,
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsCopying(false);
		}
	}, [problemToCopy, copyTitle, fetchProblems]);

	const handleUsageClick = useCallback(async (problem: Problem) => {
		setProblemForUsage(problem);
		setShowUsageModal(true);
		setLoadingUsage(true);
		setProblemUsage({ assignments: [], problemSets: [], quizzes: [] });
		try {
			const response = await APIService.getProblemUsage(problem.id);
			const usage = response?.data ?? response ?? {};
			setProblemUsage(usage as ProblemUsage);
		} catch (error: unknown) {
			console.error("문제 사용 현황 조회 실패:", error);
			setAlertMessage(
				`문제 사용 현황 조회에 실패했습니다. ${error instanceof Error ? error.message : ""}`,
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
			setProblemUsage({ assignments: [], problemSets: [], quizzes: [] });
		} finally {
			setLoadingUsage(false);
		}
	}, []);

	const closeProblemModal = useCallback(() => {
		setShowProblemModal(false);
		setSelectedProblem(null);
	}, []);

	const closeDeleteModal = useCallback(() => {
		if (!isDeleting) {
			setShowDeleteModal(false);
			setProblemToDelete(null);
		}
	}, [isDeleting]);

	const closeCopyModal = useCallback(() => {
		if (!isCopying) {
			setShowCopyModal(false);
			setProblemToCopy(null);
			setCopyTitle("");
		}
	}, [isCopying]);

	const closeUsageModal = useCallback(() => {
		if (!loadingUsage) {
			setShowUsageModal(false);
			setProblemForUsage(null);
			setProblemUsage({
				assignments: [],
				problemSets: [],
				quizzes: [],
			});
		}
	}, [loadingUsage]);

	return {
		problems,
		loading,
		searchTerm,
		setSearchTerm,
		selectedProblem,
		setSelectedProblem,
		showProblemModal,
		setShowProblemModal,
		showDeleteModal,
		problemToDelete,
		showCopyModal,
		problemToCopy,
		copyTitle,
		setCopyTitle,
		isDeleting,
		isCopying,
		alertMessage,
		setAlertMessage,
		alertType,
		showUsageModal,
		problemUsage,
		loadingUsage,
		problemForUsage,
		filterUsageStatus,
		setFilterUsageStatus,
		filterDifficulty,
		setFilterDifficulty,
		filterCourse,
		setFilterCourse,
		filterAssignment,
		setFilterAssignment,
		filterTag,
		setFilterTag,
		sections,
		assignments,
		problemUsageMap,
		loadingUsageData,
		availableTags,
		openMoreMenu,
		setOpenMoreMenu,
		filteredProblems,
		getProblemTags,
		formatDate,
		formatDateTime,
		navigate,
		handleDeleteClick,
		handleDeleteConfirm,
		handleCopyClick,
		handleCopyConfirm,
		handleUsageClick,
		closeProblemModal,
		closeDeleteModal,
		closeCopyModal,
		closeUsageModal,
	};
}

export type ProblemManagementHookReturn = ReturnType<
	typeof useProblemManagement
>;
