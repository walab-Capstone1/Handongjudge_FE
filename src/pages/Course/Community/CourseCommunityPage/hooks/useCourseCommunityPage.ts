import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type {
	Question,
	SectionInfo,
	Stats,
	Assignment,
	Problem,
	FilterStatus,
} from "../types";

export function useCourseCommunityPage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [filter, setFilter] = useState<FilterStatus>("ALL");
	const [assignmentFilter, setAssignmentFilter] = useState<string>("ALL");
	const [problemFilter, setProblemFilter] = useState<string>("ALL");
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [problems, setProblems] = useState<Problem[]>([]);
	const [searchKeyword, setSearchKeyword] = useState("");
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [stats, setStats] = useState<Stats>({
		total: 0,
		pending: 0,
		resolved: 0,
	});

	const fetchAssignments = useCallback(async () => {
		if (!sectionId) return;
		try {
			const assignmentsData =
				await APIService.getAssignmentsBySection(sectionId);
			const list = Array.isArray(assignmentsData)
				? assignmentsData
				: (assignmentsData?.data ?? []);
			setAssignments(list);
		} catch (err) {
			console.error("Error fetching assignments:", err);
		}
	}, [sectionId]);

	useEffect(() => {
		fetchAssignments();
	}, [fetchAssignments]);

	useEffect(() => {
		if (assignmentFilter === "ALL" || !sectionId) {
			setProblems([]);
			setProblemFilter("ALL");
			return;
		}
		const load = async () => {
			try {
				const response = await APIService.getAssignmentProblems(
					sectionId,
					assignmentFilter,
				);
				const list =
					response?.problems ??
					response?.data ??
					(Array.isArray(response) ? response : []);
				setProblems(list);
			} catch (err) {
				console.error("Error fetching problems:", err);
				setProblems([]);
			}
		};
		void load();
	}, [sectionId, assignmentFilter]);

	const fetchData = useCallback(async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
			setError(null);

			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(sectionData);

			const params = new URLSearchParams({
				sectionId,
				page: String(currentPage),
				size: "20",
			});
			if (filter !== "ALL") {
				params.append("status", filter);
			}

			const data = await APIService.request(
				`/community/questions?${params.toString()}`,
			);
			let content: Question[] = data?.data?.content ?? [];
			const statusNorm = (s: string | undefined) =>
				(s ?? "PENDING").toUpperCase();
			if (filter === "PENDING") {
				content = content.filter((q) => statusNorm(q.status) === "PENDING");
			} else if (filter === "RESOLVED") {
				content = content.filter((q) => statusNorm(q.status) === "RESOLVED");
			}
			const pages = data?.data?.totalPages ?? 0;
			setQuestions(content);
			setTotalPages(pages);

			const statsRes = await APIService.request(
				`/community/questions?sectionId=${sectionId}&page=0&size=1`,
			);
			const total = statsRes?.data?.totalElements ?? 0;
			let pending = 0;
			let resolved = 0;
			try {
				const pendingRes = await APIService.request(
					`/community/questions?sectionId=${sectionId}&status=PENDING&page=0&size=1`,
				);
				const resolvedRes = await APIService.request(
					`/community/questions?sectionId=${sectionId}&status=RESOLVED&page=0&size=1`,
				);
				pending = pendingRes?.data?.totalElements ?? 0;
				resolved = resolvedRes?.data?.totalElements ?? 0;
			} catch {
				//
			}
			setStats({ total, pending, resolved });
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "질문 목록 조회 실패";
			setError(message);
			console.error("Error fetching community data:", err);
		} finally {
			setLoading(false);
		}
	}, [sectionId, filter, currentPage]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSearch = useCallback(async () => {
		if (!sectionId) return;
		if (!searchKeyword.trim()) {
			fetchData();
			return;
		}
		try {
			setLoading(true);
			const params = new URLSearchParams({
				sectionId,
				keyword: searchKeyword,
				page: String(currentPage),
				size: "20",
			});
			const data = await APIService.request(
				`/community/questions/search?${params.toString()}`,
			);
			let list: Question[] = data?.data?.content ?? [];
			if (assignmentFilter !== "ALL") {
				list = list.filter(
					(q) => q.assignmentId?.toString() === assignmentFilter,
				);
			}
			if (problemFilter !== "ALL") {
				list = list.filter((q) => q.problemId?.toString() === problemFilter);
			}
			setQuestions(list);
			setTotalPages(data?.data?.totalPages ?? 0);
		} catch (err) {
			const message = err instanceof Error ? err.message : "검색 실패";
			setError(message);
			console.error("Search error:", err);
		} finally {
			setLoading(false);
		}
	}, [
		sectionId,
		searchKeyword,
		currentPage,
		assignmentFilter,
		problemFilter,
		fetchData,
	]);

	const handleQuestionClick = useCallback(
		(questionId: number) => {
			navigate(`/sections/${sectionId}/community/${questionId}`);
		},
		[navigate, sectionId],
	);

	const handleCreateQuestion = useCallback(() => {
		navigate(`/sections/${sectionId}/community/new`);
	}, [navigate, sectionId]);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	const handleFilterChange = useCallback((newFilter: FilterStatus) => {
		setFilter(newFilter);
		setCurrentPage(0);
	}, []);

	const clearFilters = useCallback(() => {
		setFilter("ALL");
		setAssignmentFilter("ALL");
		setProblemFilter("ALL");
		setCurrentPage(0);
	}, []);

	const handleAssignmentFilterChange = useCallback((value: string) => {
		setAssignmentFilter(value);
		setCurrentPage(0);
	}, []);

	const handleProblemFilterChange = useCallback((value: string) => {
		setProblemFilter(value);
		setCurrentPage(0);
	}, []);

	return {
		sectionId,
		navigate,
		loading,
		error,
		isSidebarCollapsed,
		sectionInfo,
		questions,
		filter,
		assignmentFilter,
		problemFilter,
		assignments,
		problems,
		searchKeyword,
		setSearchKeyword,
		currentPage,
		setCurrentPage,
		totalPages,
		stats,
		handleSearch,
		handleQuestionClick,
		handleCreateQuestion,
		handleToggleSidebar,
		handleFilterChange,
		clearFilters,
		handleAssignmentFilterChange,
		handleProblemFilterChange,
	};
}

export type CourseCommunityPageHookReturn = ReturnType<
	typeof useCourseCommunityPage
>;
