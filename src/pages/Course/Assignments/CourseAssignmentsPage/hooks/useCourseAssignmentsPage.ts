import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { Assignment, ProblemStatus, SectionInfo } from "../types";

function calculateDDay(endDate: string): number | null {
	if (!endDate) return null;
	const now = new Date();
	const end = new Date(endDate);
	const diffTime = end.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
}

export function useCourseAssignmentsPage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const auth = useRecoilValue(authState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [activeMenu] = useState("과제");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [expandedAssignmentIds, setExpandedAssignmentIds] = useState<number[]>(
		[],
	);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [isManager, setIsManager] = useState(false);

	const fetchUserRole = useCallback(async () => {
		if (!sectionId || !auth.user) return;

		try {
			const response = await APIService.getMyRoleInSection(Number(sectionId));
			let raw: unknown = response;
			if (typeof response === "object" && response !== null) {
				raw =
					(response as { data?: unknown })?.data ??
					(response as { role?: unknown })?.role ??
					response;
				if (typeof raw === "object" && raw !== null && "role" in raw) {
					raw = (raw as { role: unknown }).role;
				}
			}
			const role =
				typeof raw === "string"
					? raw.toUpperCase()
					: String(raw ?? "").toUpperCase();

			setUserRole(role);
			setIsManager(role === "ADMIN" || role === "TUTOR");
		} catch (error) {
			console.error("역할 조회 실패:", error);
			setUserRole(null);
			setIsManager(false);
		}
	}, [sectionId, auth.user]);

	const fetchAssignmentsData = useCallback(async () => {
		if (!sectionId || !auth.user) return;

		try {
			setLoading(true);
			setError(null);

			// 사용자 역할 조회
			await fetchUserRole();

			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);

			const assignmentsResponse =
				await APIService.getAssignmentsBySection(sectionId);
			const assignmentsList = assignmentsResponse.data || assignmentsResponse;

			const assignmentsWithProgress = await Promise.all(
				assignmentsList.map(async (assignment: Assignment & { endDate: string }) => {
					try {
						const problemsResponse = await APIService.getAssignmentProblems(
							sectionId,
							assignment.id,
						);
						const problemsList = problemsResponse.data || problemsResponse;

						let problemsStatus: { problemId: number; status: string }[] = [];
						try {
							const statusResponse =
								await APIService.getStudentAssignmentProblemsStatus(
									auth.user!.id,
									sectionId,
									assignment.id,
								);
							problemsStatus = statusResponse.data || statusResponse;
						} catch {
							// ignore
						}

						const problems = problemsList.map((problem: { id: number; title: string; description?: string }) => {
							const statusEntry = problemsStatus.find(
								(s: { problemId: number }) => s.problemId === problem.id,
							);
							const raw = statusEntry ? statusEntry.status : "NOT_SUBMITTED";
							const problemStatus: ProblemStatus =
								raw === "ACCEPTED" || raw === "SUBMITTED" ? raw : "NOT_SUBMITTED";
							const submitted =
								problemStatus === "SUBMITTED" || problemStatus === "ACCEPTED";
							return {
								id: problem.id,
								title: problem.title,
								description: problem.description,
								submitted,
								status: problemStatus,
							};
						});

						const totalProblems = problems.length;
						const submittedProblems = problems.filter(
							(p: { submitted: boolean }) => p.submitted,
						).length;
						const progress =
							totalProblems > 0
								? Math.round((submittedProblems / totalProblems) * 100)
								: 0;
						const dDay = calculateDDay(assignment.endDate);

						return {
							...assignment,
							progress,
							dDay,
							totalProblems,
							submittedProblems,
							problems,
						};
					} catch {
						return {
							...assignment,
							progress: 0,
							dDay: calculateDDay(assignment.endDate),
							totalProblems: 0,
							submittedProblems: 0,
							problems: [],
						};
					}
				}),
			);

			setAssignments(assignmentsWithProgress);
		} catch (err: unknown) {
			console.error("과제 데이터 조회 실패:", err);
			setError(
				err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	}, [sectionId, auth.user, fetchUserRole]);

	useEffect(() => {
		if (sectionId && auth.user) {
			fetchAssignmentsData();
		}
	}, [sectionId, auth.user, fetchAssignmentsData]);

	useEffect(() => {
		const assignmentId = searchParams.get("assignmentId");
		if (assignmentId && assignments.length > 0) {
			const assignmentIdNum = Number.parseInt(assignmentId, 10);
			if (!Number.isNaN(assignmentIdNum) && !expandedAssignmentIds.includes(assignmentIdNum)) {
				setExpandedAssignmentIds((prev) => [...prev, assignmentIdNum]);
			}
		}
	}, [searchParams, assignments, expandedAssignmentIds]);

	const toggleAssignment = useCallback((assignmentId: number) => {
		setExpandedAssignmentIds((prev) =>
			prev.includes(assignmentId)
				? prev.filter((id) => id !== assignmentId)
				: [...prev, assignmentId],
		);
	}, []);

	const formatDate = useCallback((dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
	}, []);

	const handleMenuClick = useCallback(
		(menuId: string) => {
			switch (menuId) {
				case "dashboard":
					navigate(`/sections/${sectionId}/dashboard`);
					break;
				case "notice":
					navigate(`/sections/${sectionId}/course-notices`);
					break;
				default:
					break;
			}
		},
		[navigate, sectionId],
	);

	const handleProblemClick = useCallback(
		(assignmentId: number, problemId: number) => {
			navigate(
				`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problemId}`,
			);
		},
		[navigate, sectionId],
	);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	return {
		sectionId,
		activeMenu,
		loading,
		error,
		isSidebarCollapsed,
		sectionInfo,
		assignments,
		expandedAssignmentIds,
		userRole,
		isManager,
		fetchAssignmentsData,
		toggleAssignment,
		formatDate,
		handleMenuClick,
		handleProblemClick,
		handleToggleSidebar,
	};
}

export type CourseAssignmentsPageHookReturn = ReturnType<
	typeof useCourseAssignmentsPage
>;
