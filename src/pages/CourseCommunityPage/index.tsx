import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import APIService from "../../services/APIService";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../recoil/atoms";
import * as S from "./styles";
import type {
	Question,
	SectionInfo,
	Stats,
	Assignment,
	Problem,
} from "./types";
import CommunityHeader from "./CommunityHeader";
import CommunityStatsBar, { type FilterStatus } from "./CommunityStatsBar";
import CommunityFilterBar from "./CommunityFilterBar";
import CommunitySearchBar from "./CommunitySearchBar";
import QuestionList from "./QuestionList";
import CommunityPagination from "./CommunityPagination";

const CourseCommunityPage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);
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
			// 백엔드가 status 파라미터를 지원하면 서버에서 필터링, 아니면 클라이언트에서 한 번 더 필터
			if (filter !== "ALL") {
				params.append("status", filter);
			}

			const data = await APIService.request(
				`/community/questions?${params.toString()}`,
			);
			let content: Question[] = data?.data?.content ?? [];
			// question.status 기준으로 클라이언트에서 한 번 더 필터 (백엔드가 status 무시해도 동작)
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

			// 전체/미해결/해결됨 개수 조회 (백엔드가 status별 count를 주지 않으면 전체만 사용)
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
				// status별 count 미지원 시 전체만 표시
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

	const handleSearch = async () => {
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
	};

	const handleQuestionClick = (questionId: number) => {
		navigate(`/sections/${sectionId}/community/${questionId}`);
	};

	const handleCreateQuestion = () => {
		navigate(`/sections/${sectionId}/community/new`);
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	const handleFilterChange = (newFilter: FilterStatus) => {
		setFilter(newFilter);
		setCurrentPage(0);
	};

	const clearFilters = () => {
		setFilter("ALL");
		setAssignmentFilter("ALL");
		setProblemFilter("ALL");
		setCurrentPage(0);
	};

	const handleAssignmentFilterChange = (value: string) => {
		setAssignmentFilter(value);
		setCurrentPage(0);
	};

	const handleProblemFilterChange = (value: string) => {
		setProblemFilter(value);
		setCurrentPage(0);
	};

	if (loading && questions.length === 0) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu="커뮤니티"
					isCollapsed={isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<CourseHeader
						courseName={sectionInfo?.courseTitle ?? "로딩 중..."}
						onToggleSidebar={handleToggleSidebar}
						isSidebarCollapsed={isSidebarCollapsed}
					/>
					<S.CommunityBody>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.CommunityBody>
				</S.Content>
			</S.Container>
		);
	}

	if (error) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu="커뮤니티"
					isCollapsed={isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<CourseHeader
						courseName={sectionInfo?.courseTitle ?? "오류"}
						onToggleSidebar={handleToggleSidebar}
						isSidebarCollapsed={isSidebarCollapsed}
					/>
					<S.CommunityBody>
						<S.ErrorMessage>오류: {error}</S.ErrorMessage>
					</S.CommunityBody>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu="커뮤니티"
				isCollapsed={isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle ?? sectionInfo?.courseName ?? "커뮤니티"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>
				<S.CommunityBody>
					<CommunityHeader onCreateQuestion={handleCreateQuestion} />

					<CommunityStatsBar
						filter={filter}
						stats={stats}
						onFilterChange={handleFilterChange}
					/>

					<CommunityFilterBar
						assignmentFilter={assignmentFilter}
						problemFilter={problemFilter}
						assignments={assignments}
						problems={problems}
						onAssignmentChange={handleAssignmentFilterChange}
						onProblemChange={handleProblemFilterChange}
						onClearFilters={clearFilters}
					/>

					<CommunitySearchBar
						searchKeyword={searchKeyword}
						onKeywordChange={setSearchKeyword}
						onSearch={handleSearch}
					/>

					<QuestionList
						questions={questions}
						onQuestionClick={handleQuestionClick}
					/>

					{totalPages > 1 && (
						<CommunityPagination
							currentPage={currentPage}
							totalPages={totalPages}
							onPrev={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
							onNext={() =>
								setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
							}
						/>
					)}
				</S.CommunityBody>
			</S.Content>
		</S.Container>
	);
};

export default CourseCommunityPage;
