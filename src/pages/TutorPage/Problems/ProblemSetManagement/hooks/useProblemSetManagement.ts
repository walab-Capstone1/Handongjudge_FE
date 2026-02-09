import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { ProblemSet, Problem, CreateProblemSetData } from "../types";

const PROBLEMS_PER_PAGE = 10;

export function useProblemSetManagement() {
	const navigate = useNavigate();
	const [problemSets, setProblemSets] = useState<ProblemSet[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [newSetTitle, setNewSetTitle] = useState("");
	const [newSetDescription, setNewSetDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [showProblemSelectModal, setShowProblemSelectModal] = useState(false);
	const [allProblems, setAllProblems] = useState<Problem[]>([]);
	const [problemSearchTerm, setProblemSearchTerm] = useState("");
	const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
	const [currentStep, setCurrentStep] = useState(1);
	const [currentPage, setCurrentPage] = useState(1);

	const fetchProblemSets = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getProblemSets();
			setProblemSets(Array.isArray(response) ? response : response?.data || []);
		} catch (error) {
			console.error("문제집 목록 조회 실패:", error);
			setProblemSets([]);
		} finally {
			setLoading(false);
		}
	}, []);

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
			setAllProblems([]);
		}
	}, []);

	useEffect(() => {
		fetchProblemSets();
	}, [fetchProblemSets]);

	useEffect(() => {
		if (showProblemSelectModal) fetchAllProblems();
	}, [showProblemSelectModal, fetchAllProblems]);

	const handleNextToProblemSelect = useCallback(() => {
		if (!newSetTitle.trim()) {
			alert("문제집 제목을 입력해주세요.");
			return;
		}
		setShowCreateModal(false);
		setCurrentStep(2);
		setShowProblemSelectModal(true);
		fetchAllProblems();
	}, [newSetTitle, fetchAllProblems]);

	const handleCreateSetWithProblems = useCallback(
		async (problemIds: number[] | null = null) => {
			const finalProblemIds =
				problemIds !== null ? problemIds : selectedProblemIds;
			try {
				setIsCreating(true);
				const createData: CreateProblemSetData = {
					title: newSetTitle.trim(),
					description: newSetDescription.trim() || null,
					tags: "[]",
				};
				const response = await APIService.createProblemSet(createData);
				const problemSetId = response?.data?.id || response?.id || response;
				if (finalProblemIds?.length > 0) {
					for (let i = 0; i < finalProblemIds.length; i++) {
						try {
							await APIService.addProblemToSet(
								problemSetId,
								finalProblemIds[i],
								i,
							);
						} catch (error) {
							console.error(`문제 ${finalProblemIds[i]} 추가 실패:`, error);
						}
					}
				}
				setShowCreateModal(false);
				setShowProblemSelectModal(false);
				setCurrentStep(1);
				setNewSetTitle("");
				setNewSetDescription("");
				setSelectedProblemIds([]);
				setProblemSearchTerm("");
				setCurrentPage(1);
				fetchProblemSets();
			} catch (error) {
				console.error("문제집 생성 실패:", error);
				const msg = error instanceof Error ? error.message : "알 수 없는 오류";
				alert(`문제집 생성에 실패했습니다: ${msg}`);
			} finally {
				setIsCreating(false);
			}
		},
		[newSetTitle, newSetDescription, selectedProblemIds, fetchProblemSets],
	);

	const handleSkipProblemSelect = useCallback(() => {
		handleCreateSetWithProblems([]);
	}, [handleCreateSetWithProblems]);

	const handleProblemToggle = useCallback((problemId: number) => {
		setSelectedProblemIds((prev) => {
			if (prev.includes(problemId))
				return prev.filter((id) => id !== problemId);
			return [...prev, problemId];
		});
	}, []);

	const getFilteredProblems = useCallback((): Problem[] => {
		let filtered = allProblems;
		if (problemSearchTerm) {
			filtered = filtered.filter(
				(p) =>
					p.title?.toLowerCase().includes(problemSearchTerm.toLowerCase()) ||
					p.id?.toString().includes(problemSearchTerm),
			);
		}
		return filtered;
	}, [allProblems, problemSearchTerm]);

	const getPaginatedProblems = useCallback((): Problem[] => {
		const filtered = getFilteredProblems();
		const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
		return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
	}, [getFilteredProblems, currentPage]);

	const getTotalPages = useCallback((): number => {
		return Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE);
	}, [getFilteredProblems]);

	const handleSelectAllProblems = useCallback(() => {
		const filtered = getFilteredProblems();
		const allSelected =
			filtered.length > 0 &&
			filtered.every((p) => selectedProblemIds.includes(p.id));
		if (allSelected) {
			const filteredIds = filtered.map((p) => p.id);
			setSelectedProblemIds((prev) =>
				prev.filter((id) => !filteredIds.includes(id)),
			);
		} else {
			setSelectedProblemIds((prev) => {
				const newIds = filtered.map((p) => p.id);
				return [...new Set([...prev, ...newIds])];
			});
		}
	}, [getFilteredProblems, selectedProblemIds]);

	const handleDeleteSet = useCallback(
		async (problemSet: ProblemSet) => {
			if (
				!window.confirm(
					`정말로 "${problemSet.title}" 문제집을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
				)
			)
				return;
			try {
				await APIService.deleteProblemSet(problemSet.id);
				fetchProblemSets();
			} catch (error) {
				console.error("문제집 삭제 실패:", error);
				const msg = error instanceof Error ? error.message : "알 수 없는 오류";
				alert(`문제집 삭제에 실패했습니다: ${msg}`);
			}
		},
		[fetchProblemSets],
	);

	const filteredSets = problemSets.filter(
		(set) =>
			set.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			set.description?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const formatDate = (dateString?: string): string => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

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

	const openCreateModal = useCallback(() => {
		setCurrentStep(1);
		setShowCreateModal(true);
		setShowProblemSelectModal(false);
	}, []);

	const closeCreateModal = useCallback(() => {
		if (!isCreating) {
			setShowCreateModal(false);
			setNewSetTitle("");
			setNewSetDescription("");
		}
	}, [isCreating]);

	const closeProblemSelectModal = useCallback(() => {
		if (!isCreating) {
			setShowProblemSelectModal(false);
			setCurrentStep(1);
			setSelectedProblemIds([]);
			setProblemSearchTerm("");
			setCurrentPage(1);
		}
	}, [isCreating]);

	return {
		navigate,
		loading,
		problemSets,
		searchTerm,
		setSearchTerm,
		showCreateModal,
		newSetTitle,
		setNewSetTitle,
		newSetDescription,
		setNewSetDescription,
		isCreating,
		showProblemSelectModal,
		allProblems,
		problemSearchTerm,
		setProblemSearchTerm,
		selectedProblemIds,
		currentStep,
		setCurrentStep,
		currentPage,
		setCurrentPage,
		filteredSets,
		formatDate,
		getFilteredProblems,
		getPaginatedProblems,
		getTotalPages,
		getDifficultyLabel,
		getDifficultyColor,
		openCreateModal,
		closeCreateModal,
		closeProblemSelectModal,
		handleNextToProblemSelect,
		handleSkipProblemSelect,
		handleCreateSetWithProblems,
		handleProblemToggle,
		handleSelectAllProblems,
		handleDeleteSet,
	};
}

export type ProblemSetManagementHookReturn = ReturnType<
	typeof useProblemSetManagement
>;
