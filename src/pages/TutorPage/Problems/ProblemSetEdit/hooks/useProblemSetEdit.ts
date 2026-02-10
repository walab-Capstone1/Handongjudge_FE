import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { ProblemSet, Problem, FilterType, AlertType } from "../types";

const PROBLEMS_PER_PAGE = 10;

export function useProblemSetEdit() {
	const navigate = useNavigate();
	const { problemSetId } = useParams<{ problemSetId: string }>();
	const [problemSet, setProblemSet] = useState<ProblemSet | null>(null);
	const [problems, setProblems] = useState<Problem[]>([]);
	const [allProblems, setAllProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [alertType, setAlertType] = useState<AlertType>("success");
	const [currentPage, setCurrentPage] = useState(1);
	const [filterType, setFilterType] = useState<FilterType>("available");

	const fetchProblemSet = useCallback(async () => {
		if (!problemSetId) return;
		try {
			setLoading(true);
			const response = await APIService.getProblemSet(problemSetId);
			const data = response?.data || response;
			setProblemSet(data);
			setProblems(data.problems || []);
		} catch (error: unknown) {
			console.error("문제집 조회 실패:", error);
			setAlertMessage(
				"문제집 조회에 실패했습니다: " +
					(error instanceof Error ? error.message : "알 수 없는 오류"),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setLoading(false);
		}
	}, [problemSetId]);

	const fetchAllProblems = useCallback(async () => {
		try {
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
			setAllProblems(problemsData);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
		}
	}, []);

	useEffect(() => {
		if (problemSetId) {
			fetchProblemSet();
			fetchAllProblems();
		}
	}, [problemSetId, fetchProblemSet, fetchAllProblems]);

	useEffect(() => {
		if (showAddModal) {
			document.body.classList.add("section-modal-open");
		} else {
			document.body.classList.remove("section-modal-open");
		}
		return () => document.body.classList.remove("section-modal-open");
	}, [showAddModal]);

	const getAvailableProblems = useCallback((): Problem[] => {
		const existingProblemIds = problems.map((p) => p.id);
		return allProblems.filter((p) => !existingProblemIds.includes(p.id));
	}, [problems, allProblems]);

	const getAddedProblems = useCallback((): Problem[] => {
		const existingProblemIds = problems.map((p) => p.id);
		return allProblems.filter((p) => existingProblemIds.includes(p.id));
	}, [problems, allProblems]);

	const isProblemAdded = useCallback(
		(problemId: number): boolean => problems.some((p) => p.id === problemId),
		[problems],
	);

	const getFilteredProblems = useCallback((): Problem[] => {
		let filtered: Problem[];
		if (filterType === "available") filtered = getAvailableProblems();
		else if (filterType === "added") filtered = getAddedProblems();
		else filtered = allProblems;

		if (searchTerm) {
			filtered = filtered.filter(
				(p) =>
					p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.id?.toString().includes(searchTerm),
			);
		}
		return filtered;
	}, [
		filterType,
		searchTerm,
		getAvailableProblems,
		getAddedProblems,
		allProblems,
	]);

	const paginatedProblems = useMemo(
		() => () => {
			const filtered = getFilteredProblems();
			const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
			return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
		},
		[currentPage, getFilteredProblems],
	);

	const totalPages = useMemo(
		() => Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE),
		[getFilteredProblems],
	);

	const handleAddProblems = useCallback(async () => {
		if (selectedProblemIds.length === 0) {
			setAlertMessage("추가할 문제를 선택해주세요.");
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 3000);
			return;
		}
		if (!problemSetId) return;

		try {
			setIsAdding(true);
			const existingProblemIds = problems.map((p) => p.id);
			const newProblemIds = selectedProblemIds.filter(
				(id) => !existingProblemIds.includes(id),
			);

			if (newProblemIds.length === 0) {
				setAlertMessage("선택한 문제가 이미 문제집에 포함되어 있습니다.");
				setAlertType("error");
				setTimeout(() => setAlertMessage(null), 3000);
				setIsAdding(false);
				return;
			}

			for (const problemId of newProblemIds) {
				try {
					await APIService.addProblemToSet(problemSetId, problemId);
				} catch (error) {
					console.error(`문제 ${problemId} 추가 실패:`, error);
				}
			}

			setAlertMessage(
				`${newProblemIds.length}개의 문제가 성공적으로 추가되었습니다.`,
			);
			setAlertType("success");
			setShowAddModal(false);
			setSelectedProblemIds([]);
			fetchProblemSet();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error: unknown) {
			console.error("문제 추가 실패:", error);
			setAlertMessage(
				"문제 추가에 실패했습니다: " +
					(error instanceof Error ? error.message : "알 수 없는 오류"),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsAdding(false);
		}
	}, [problemSetId, selectedProblemIds, problems, fetchProblemSet]);

	const handleRemoveProblem = useCallback(
		async (problemId: number) => {
			if (!window.confirm("정말로 이 문제를 문제집에서 제거하시겠습니까?"))
				return;
			if (!problemSetId) return;

			try {
				setIsRemoving(true);
				await APIService.removeProblemFromSet(problemSetId, problemId);
				setAlertMessage("문제가 성공적으로 제거되었습니다.");
				setAlertType("success");
				fetchProblemSet();
				setTimeout(() => setAlertMessage(null), 3000);
			} catch (error: unknown) {
				console.error("문제 제거 실패:", error);
				setAlertMessage(
					"문제 제거에 실패했습니다: " +
						(error instanceof Error ? error.message : "알 수 없는 오류"),
				);
				setAlertType("error");
				setTimeout(() => setAlertMessage(null), 5000);
			} finally {
				setIsRemoving(false);
			}
		},
		[problemSetId, fetchProblemSet],
	);

	const handleProblemToggle = useCallback(
		(problemId: number) => {
			if (problems.some((p) => p.id === problemId)) return;
			setSelectedProblemIds((prev) => {
				if (prev.includes(problemId))
					return prev.filter((id) => id !== problemId);
				return [...prev, problemId];
			});
		},
		[problems],
	);

	const handleSelectAll = useCallback(() => {
		const filtered = getFilteredProblems();
		const availableProblems = filtered.filter((p) => !isProblemAdded(p.id));
		const allSelected =
			availableProblems.length > 0 &&
			availableProblems.every((p) => selectedProblemIds.includes(p.id));

		if (allSelected) {
			const availableIds = availableProblems.map((p) => p.id);
			setSelectedProblemIds((prev) =>
				prev.filter((id) => !availableIds.includes(id)),
			);
		} else {
			setSelectedProblemIds((prev) => {
				const newIds = availableProblems.map((p) => p.id);
				return [...new Set([...prev, ...newIds])];
			});
		}
	}, [getFilteredProblems, isProblemAdded, selectedProblemIds]);

	const closeAddModal = useCallback(() => {
		if (!isAdding) {
			setShowAddModal(false);
			setSelectedProblemIds([]);
			setSearchTerm("");
			setCurrentPage(1);
			setFilterType("available");
		}
	}, [isAdding]);

	const setFilterAndPage = useCallback((filter: FilterType) => {
		setFilterType(filter);
		setCurrentPage(1);
	}, []);

	const setSearchAndPage = useCallback((value: string) => {
		setSearchTerm(value);
		setCurrentPage(1);
	}, []);

	const getDifficultyLabel = (difficulty?: string): string => {
		const labels: Record<string, string> = {
			"1": "쉬움",
			"2": "보통",
			"3": "어려움",
		};
		return labels[difficulty || ""] || difficulty || "";
	};

	const getDifficultyColor = (difficulty?: string): string => {
		const colors: Record<string, string> = {
			"1": "#10b981",
			"2": "#f59e0b",
			"3": "#ef4444",
		};
		return colors[difficulty || ""] || "#6b7280";
	};

	return {
		navigate,
		problemSet,
		problems,
		loading,
		searchTerm,
		showAddModal,
		selectedProblemIds,
		isAdding,
		isRemoving,
		alertMessage,
		alertType,
		setAlertMessage,
		currentPage,
		setCurrentPage,
		filterType,
		setFilterAndPage,
		setSearchAndPage,
		getFilteredProblems,
		paginatedProblems,
		totalPages,
		isProblemAdded,
		getDifficultyLabel,
		getDifficultyColor,
		handleAddProblems,
		handleRemoveProblem,
		handleProblemToggle,
		handleSelectAll,
		setShowAddModal,
		closeAddModal,
	};
}

export type ProblemSetEditHookReturn = ReturnType<typeof useProblemSetEdit>;
