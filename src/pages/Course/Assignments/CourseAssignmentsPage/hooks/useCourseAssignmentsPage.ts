import {
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
} from "react";
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
	const [assignmentSort, setAssignmentSort] = useState<
		"recentFirst" | "oldestFirst" | "unsolvedFirst"
	>("recentFirst");
	const [expandedAssignmentIds, setExpandedAssignmentIds] = useState<number[]>(
		[],
	);
	const highlightProblemId = useMemo(() => {
		const raw = searchParams.get("highlightProblem");
		if (!raw) return null;
		const n = Number.parseInt(raw, 10);
		return Number.isFinite(n) ? n : null;
	}, [searchParams]);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [isManager, setIsManager] = useState(false);
	/** 알림 등에서 assignmentId 쿼리로 진입 시 한 번만 펼치기 위해 적용한 URL 값 (접은 뒤 다시 펼쳐지지 않도록) */
	const expandedFromQueryRef = useRef<string | null>(null);

	const fetchUserRole = useCallback(async (): Promise<string | null> => {
		if (!sectionId || !auth.user) return null;

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
			return role;
		} catch (error) {
			console.error("역할 조회 실패:", error);
			setUserRole(null);
			setIsManager(false);
			return null;
		}
	}, [sectionId, auth.user]);

	const fetchAssignmentsData = useCallback(async () => {
		const user = auth.user;
		if (!sectionId || !user) return;

		try {
			setLoading(true);
			setError(null);

			const role = await fetchUserRole();

			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);

			const assignmentsResponse =
				await APIService.getAssignmentsBySection(sectionId);
			const assignmentsList = assignmentsResponse.data || assignmentsResponse;

			// 수강생이 과제 목록을 열면 내 강의실(/courses) '새 과제' 뱃지용 읽음 처리
			if (
				role === "STUDENT" &&
				Array.isArray(assignmentsList) &&
				assignmentsList.length > 0
			) {
				await Promise.allSettled(
					assignmentsList.map((a: { id: number }) =>
						APIService.markAssignmentAsRead(a.id),
					),
				);
			}

			const assignmentsWithProgress = await Promise.all(
				assignmentsList.map(
					async (assignment: Assignment & { endDate: string }) => {
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
										user.id,
										sectionId,
										assignment.id,
									);
								problemsStatus = statusResponse.data || statusResponse;
							} catch {
								// ignore
							}

							const problems = problemsList.map(
								(problem: {
									id: number;
									title: string;
									description?: string;
								}) => {
									const statusEntry = problemsStatus.find(
										(s: { problemId: number }) => s.problemId === problem.id,
									) as {
										problemId: number;
										status: string;
										isOnTime?: boolean;
										submittedAt?: string;
										minutesLate?: number;
										gradeComment?: string | null;
										gradeRejected?: boolean;
										gradeRejectedAt?: string;
									} | undefined;
									const raw = statusEntry
										? statusEntry.status
										: "NOT_SUBMITTED";
									const problemStatus: ProblemStatus =
										raw === "ACCEPTED" || raw === "SUBMITTED"
											? raw
											: "NOT_SUBMITTED";
									const submitted =
										problemStatus === "SUBMITTED" ||
										problemStatus === "ACCEPTED";
									const submittedAt =
										statusEntry?.submittedAt != null
											? typeof statusEntry.submittedAt === "string"
												? statusEntry.submittedAt
												: new Date(statusEntry.submittedAt).toISOString()
											: undefined;
									let gradeRejectedAtStr: string | undefined;
									const rawRejectedAt = statusEntry?.gradeRejectedAt;
									if (rawRejectedAt != null) {
										if (typeof rawRejectedAt === "string") {
											gradeRejectedAtStr = rawRejectedAt;
										} else if (
											typeof rawRejectedAt === "object" &&
											Array.isArray(rawRejectedAt)
										) {
											// Jackson 일부 설정에서 배열로 올 수 있음
											const [y, mo, d, h, mi, s] = rawRejectedAt as number[];
											if (y != null && mo != null && d != null) {
												const dt = new Date(
													y,
													(mo ?? 1) - 1,
													d ?? 1,
													h ?? 0,
													mi ?? 0,
													s ?? 0,
												);
												if (!Number.isNaN(dt.getTime())) {
													gradeRejectedAtStr = dt.toISOString();
												}
											}
										}
									}

									return {
										id: problem.id,
										title: problem.title,
										description: problem.description,
										submitted,
										status: problemStatus,
										isOnTime: statusEntry?.isOnTime,
										submittedAt,
										minutesLate: statusEntry?.minutesLate,
										gradeRejected: statusEntry?.gradeRejected === true,
										gradeRejectedAt: gradeRejectedAtStr,
										gradeComment:
											statusEntry?.gradeComment != null
												? String(statusEntry.gradeComment)
												: null,
									};
								},
							);

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
					},
				),
			);

			setAssignments(assignmentsWithProgress);
		} catch (err: unknown) {
			console.error("과제 데이터 조회 실패:", err);
			setError(
				err instanceof Error
					? err.message
					: "데이터를 불러오는데 실패했습니다.",
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

	// 알림 등에서 assignmentId 쿼리로 진입 시 해당 과제만 한 번만 펼침. (같은 URL에 대해 한 번 적용 후 ref로 막아서 접기 시 다시 펼쳐지지 않음)
	/** 알림 등에서 highlightProblem 로 진입 시 해당 문제 행으로 스크롤 */
	useEffect(() => {
		if (highlightProblemId == null || assignments.length === 0) return;
		const t = window.setTimeout(() => {
			document
				.getElementById(`course-assignment-problem-${highlightProblemId}`)
				?.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}, 200);
		return () => window.clearTimeout(t);
	}, [highlightProblemId, assignments]);

	useEffect(() => {
		const assignmentId = searchParams.get("assignmentId");
		if (!assignmentId || assignments.length === 0) {
			expandedFromQueryRef.current = null;
			return;
		}
		const assignmentIdNum = Number.parseInt(assignmentId, 10);
		if (Number.isNaN(assignmentIdNum)) return;
		if (expandedFromQueryRef.current === assignmentId) return;
		expandedFromQueryRef.current = assignmentId;
		setExpandedAssignmentIds((prev) =>
			prev.includes(assignmentIdNum) ? prev : [...prev, assignmentIdNum],
		);
	}, [searchParams, assignments]);

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

	/** 마감일·시간을 로컬 기준 "YYYY.MM.DD HH:mm"으로 표시 (API UTC → 로컬 변환) */
	const formatDeadline = useCallback((dateString: string): string => {
		if (!dateString?.trim()) return "";
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return "";
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}.${month}.${day} ${hours}:${minutes}`;
	}, []);

	/** 제출 시각을 "YYYY.MM.DD HH:mm"으로 표시 */
	const formatSubmissionTime = useCallback((dateString: string | undefined): string => {
		if (!dateString?.trim()) return "";
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return "";
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}.${month}.${day} ${hours}:${minutes}`;
	}, []);

	/** 지각 분 수를 "N일 N시간 N분 늦음" 형식으로 표시 (0인 단위는 생략) */
	const formatMinutesLate = useCallback((totalMinutes: number): string => {
		if (totalMinutes < 0) return "";
		const days = Math.floor(totalMinutes / (60 * 24));
		const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
		const mins = totalMinutes % 60;
		const parts: string[] = [];
		if (days > 0) parts.push(`${days}일`);
		if (hours > 0) parts.push(`${hours}시간`);
		if (mins > 0 || parts.length === 0) parts.push(`${mins}분`);
		return `${parts.join(" ")} 늦음`;
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

	const sortedAssignments = useMemo(() => {
		const list = [...assignments];
		const createdKey = (a: Assignment) => {
			const createdAt = (a as { createdAt?: string }).createdAt;
			const t = createdAt ? new Date(createdAt).getTime() : Number.NaN;
			return Number.isNaN(t) ? a.id : t;
		};

		if (assignmentSort === "oldestFirst") {
			list.sort((a, b) => createdKey(a) - createdKey(b));
			return list;
		}
		if (assignmentSort === "unsolvedFirst") {
			list.sort((a, b) => {
				const unsolvedA = Math.max(0, a.totalProblems - a.submittedProblems);
				const unsolvedB = Math.max(0, b.totalProblems - b.submittedProblems);
				if (unsolvedB !== unsolvedA) return unsolvedB - unsolvedA;
				return createdKey(b) - createdKey(a);
			});
			return list;
		}
		list.sort((a, b) => createdKey(b) - createdKey(a));
		return list;
	}, [assignments, assignmentSort]);

	return {
		sectionId,
		activeMenu,
		loading,
		error,
		isSidebarCollapsed,
		sectionInfo,
		assignments,
		highlightProblemId,
		sortedAssignments,
		assignmentSort,
		setAssignmentSort,
		expandedAssignmentIds,
		userRole,
		isManager,
		fetchAssignmentsData,
		toggleAssignment,
		formatDate,
		formatDeadline,
		formatSubmissionTime,
		formatMinutesLate,
		handleMenuClick,
		handleProblemClick,
		handleToggleSidebar,
	};
}

export type CourseAssignmentsPageHookReturn = ReturnType<
	typeof useCourseAssignmentsPage
>;
