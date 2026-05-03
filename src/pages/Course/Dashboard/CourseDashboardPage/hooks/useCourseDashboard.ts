import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type {
	SectionInfo,
	SectionQuiz,
	CourseCardData,
	Notice,
	Assignment,
	Notification,
	TransformedNotification,
	SectionNewItems,
	StudyProgressSummary,
} from "../types";
import { calculateDDay } from "../utils/dateUtils";
import { extractEnrollmentCode } from "../utils/enrollmentUtils";
import { transformSectionData, getRandomColor } from "../utils/sectionUtils";
import { transformNotification } from "../utils/notificationUtils";

/** 튜터 제외 알림을 한 번만 표시하기 위한 플래그 (리마운트 시 ref 초기화 방지) */
let tutorRemovedAlertShownThisSession = false;

export function useCourseDashboard() {
	const location = useLocation();
	const navigate = useNavigate();
	const { sectionId: sectionIdParam } = useParams<{ sectionId?: string }>();
	const sectionId = sectionIdParam || null;
	const auth = useRecoilValue(authState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [activeMenu, setActiveMenu] = useState("대시보드");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [enrolledSections, setEnrolledSections] = useState<SectionInfo[]>([]);
	const [allNotices, setAllNotices] = useState<Notice[]>([]);
	const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
	const [allNotifications, setAllNotifications] = useState<
		TransformedNotification[]
	>([]);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [sectionNewItems, setSectionNewItems] = useState<SectionNewItems>({});
	const [enrollmentCode, setEnrollmentCode] = useState("");
	const [enrollLoading, setEnrollLoading] = useState(false);
	const [showEnrollModal, setShowEnrollModal] = useState(false);
	const [managingSections, setManagingSections] = useState<CourseCardData[]>(
		[],
	);
	const [sectionQuizzes, setSectionQuizzes] = useState<SectionQuiz[]>([]);
	const [studyProgress, setStudyProgress] = useState<StudyProgressSummary>({
		loading: true,
		error: false,
		assignmentUpcomingCount: 0,
		assignmentSolvedProblems: 0,
		assignmentTotalProblems: 0,
		quizCount: 0,
		quizSolvedProblems: 0,
		quizTotalProblems: 0,
	});

	const publicSections: CourseCardData[] = [];

	const fetchManagingSections = useCallback(async () => {
		if (!auth?.user) return;
		try {
			const response = await APIService.getManagingSections();
			const sectionsData = response?.data || [];
			const transformed: CourseCardData[] = sectionsData.map(
				(section: {
					sectionId: number;
					sectionInfo?: {
						courseTitle?: string;
						sectionNumber?: string;
						instructorName?: string;
						active?: boolean;
						courseId?: string;
					};
					role?: string;
				}) => ({
					id: section.sectionId,
					sectionId: section.sectionId,
					title: section.sectionInfo?.courseTitle || "",
					subtitle: `${section.sectionInfo?.sectionNumber || ""}분반`,
					courseName: `[${section.sectionInfo?.courseTitle || ""}]`,
					instructor: section.sectionInfo?.instructorName || "",
					color: getRandomColor(section.sectionId),
					active: section.sectionInfo?.active !== false,
					status: [],
					courseId: section.sectionInfo?.courseId || "",
					_role: section.role,
					_isAdmin: section.role === "ADMIN",
				}),
			);
			setManagingSections(transformed);
		} catch (err) {
			console.error("관리 중인 수업 조회 실패:", err);
			setManagingSections([]);
		}
	}, [auth?.user]);

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			if (sectionId) {
				try {
					const sectionResponse = await APIService.getSectionInfo(sectionId);
					const sectionData = sectionResponse.data || sectionResponse;
					setSectionInfo(sectionData);
				} catch (err) {
					console.error("수업 정보 조회 실패:", err);
				}
			} else {
				setSectionInfo(null);
			}

			const sectionsResponse = await APIService.getUserEnrolledSections();
			const sectionsData = sectionsResponse.data || sectionsResponse;
			setEnrolledSections(sectionsData);

			let noticesList: Notice[] = [];
			let assignmentsList: Assignment[] = [];
			let notificationsList: Notification[] = [];
			const newSectionItems: SectionNewItems = {};

			for (const section of sectionsData as SectionInfo[]) {
				try {
					const noticesResponse = await APIService.getSectionNotices(
						section.sectionId,
					);
					const notices = noticesResponse.data || noticesResponse;
					const noticesWithSection = (notices as Notice[]).map((notice) => ({
						...notice,
						sectionId: section.sectionId,
						sectionName: section.courseTitle,
					}));
					noticesList = [...noticesList, ...noticesWithSection];

					const assignmentsResponse = await APIService.getAssignmentsBySection(
						section.sectionId,
					);
					const assignments = assignmentsResponse.data || assignmentsResponse;
					const assignmentsWithSection = (
						assignments as Array<
							Assignment & { sectionId?: number; sectionName?: string }
						>
					).map((a) => ({
						...a,
						sectionId: section.sectionId,
						sectionName: section.courseTitle,
					}));
					assignmentsList = [...assignmentsList, ...assignmentsWithSection];

					try {
						const notificationsResponse =
							await APIService.getCommunityNotifications(
								section.sectionId,
								0,
								50,
							);
						const notifications = notificationsResponse.data?.content || [];
						const notificationsWithSection = notifications.map(
							(
								notif: Notification & {
									sectionId?: number;
									sectionName?: string;
								},
							) => ({
								...notif,
								sectionId: section.sectionId,
								sectionName: section.courseTitle,
							}),
						);
						notificationsList = [
							...notificationsList,
							...notificationsWithSection,
						];

						const unreadNotifications = notifications.filter(
							(notif: Notification) => !notif.isRead,
						);
						const newAssignment = unreadNotifications.find(
							(n: Notification) => n.type === "ASSIGNMENT_CREATED",
						);
						const newNotice = unreadNotifications.find(
							(n: Notification) => n.type === "NOTICE_CREATED",
						);
						const otherNotifications = unreadNotifications.filter(
							(n: Notification) =>
								n.type !== "ASSIGNMENT_CREATED" &&
								n.type !== "NOTICE_CREATED" &&
								(n.type === "QUESTION_COMMENT" ||
									n.type === "COMMENT_ACCEPTED" ||
									n.type === "QUESTION_LIKED" ||
									n.type === "COMMENT_LIKED"),
						);
						const newNotification =
							otherNotifications.length > 0 ? otherNotifications[0] : null;

						newSectionItems[section.sectionId] = {
							newAssignment: newAssignment
								? {
										id: newAssignment.id,
										assignmentId: newAssignment.assignmentId,
										title: newAssignment.assignmentTitle || "과제",
									}
								: null,
							newNotice: newNotice
								? {
										id: newNotice.id,
										noticeId: newNotice.noticeId,
										title: newNotice.noticeTitle || "공지사항",
									}
								: null,
							newNotification: newNotification
								? {
										id: newNotification.id,
										questionId: newNotification.questionId,
										type: newNotification.type,
										title: newNotification.message || "새 알림",
									}
								: null,
						};
					} catch {
						newSectionItems[section.sectionId] = {
							newAssignment: null,
							newNotice: null,
							newNotification: null,
						};
					}
				} catch {
					newSectionItems[section.sectionId] = {
						newAssignment: null,
						newNotice: null,
						newNotification: null,
					};
				}
			}

			const sortedNotices = [...noticesList]
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, 5);

			const now = new Date();
			const activeAssignments = assignmentsList.filter(
				(a: Assignment) => new Date(a.endDate) >= now,
			);
			const expiredAssignments = assignmentsList.filter(
				(a: Assignment) => new Date(a.endDate) < now,
			);
			activeAssignments.sort(
				(a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
			);
			expiredAssignments.sort(
				(a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
			);
			const sortedAssignments = [
				...activeAssignments,
				...expiredAssignments,
			].slice(0, 5);

			// 다가오는 마감 2건에 대해 제출 진행률 채우기 (과제 페이지와 동일)
			const upcomingTwo = activeAssignments.slice(0, 2);
			const userId = auth?.user?.id;
			if (userId != null) {
				await Promise.all(
					upcomingTwo.map(
						async (a: Assignment & { submittedProblems?: number; totalProblems?: number }) => {
							try {
								const [problemsRes, statusRes] = await Promise.all([
									APIService.getAssignmentProblems(a.sectionId, a.id),
									APIService.getStudentAssignmentProblemsStatus(
										userId,
										a.sectionId,
										a.id,
									),
								]);
								const problemsList = problemsRes?.data ?? problemsRes ?? [];
								const problemsStatus = statusRes?.data ?? statusRes ?? [];
								const totalProblems = Array.isArray(problemsList) ? problemsList.length : 0;
								const submittedProblems = Array.isArray(problemsStatus)
									? problemsStatus.filter(
											(s: { status?: string }) =>
												s.status === "ACCEPTED" || s.status === "SUBMITTED",
										).length
									: 0;
								a.submittedProblems = submittedProblems;
								a.totalProblems = totalProblems;
							} catch {
								// 진행률 조회 실패 시 필드 없음 유지
							}
						},
					),
				);
			}

			const sortedNotifications = [...notificationsList]
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, 5)
				.map(transformNotification);

			setAllNotices(sortedNotices);
			setAllAssignments(sortedAssignments);
			setAllNotifications(sortedNotifications);
			setSectionNewItems(newSectionItems);
		} catch (err: unknown) {
			console.error("대시보드 데이터 조회 실패:", err);
			setError((err as Error).message || "데이터를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	}, [sectionId, auth?.user?.id]);

	// 튜터에서 제외된 뒤 /dashboard로 리다이렉트된 경우: 한 번만 메시지 표시 후 강의실로
	useEffect(() => {
		const state = location.state as { tutorRemoved?: boolean } | null;
		if (!state?.tutorRemoved || tutorRemovedAlertShownThisSession) return;
		tutorRemovedAlertShownThisSession = true;
		alert("튜터에서 제외되었습니다.");
		navigate("/courses", { replace: true, state: {} });
	}, [location.state, navigate]);

	// /dashboard(섹션 미선택) 접근 시 강의실 목록으로 이동
	useEffect(() => {
		if (sectionId == null) {
			navigate("/courses", { replace: true });
		}
	}, [sectionId, navigate]);

	const fetchSectionQuizzes = useCallback(async () => {
		if (sectionId == null) return;
		try {
			const res = await APIService.getQuizzesBySection(sectionId);
			const raw = res?.data ?? res ?? [];
			const list = (Array.isArray(raw) ? raw : []).map(
				(q: {
					id: number;
					title?: string;
					startTime?: string;
					endTime?: string;
					status?: string;
				}) => ({
					id: q.id,
					title: q.title ?? "",
					startTime: q.startTime ?? "",
					endTime: q.endTime ?? "",
					status: (q.status as SectionQuiz["status"]) ?? undefined,
				}),
			);
			setSectionQuizzes(list);
		} catch (err) {
			console.error("코딩 테스트 목록 조회 실패:", err);
			setSectionQuizzes([]);
		}
	}, [sectionId]);

	useEffect(() => {
		if (auth.user && sectionId != null) {
			fetchDashboardData();
			fetchManagingSections();
			fetchSectionQuizzes();
		}
	}, [
		auth.user,
		sectionId,
		fetchDashboardData,
		fetchManagingSections,
		fetchSectionQuizzes,
	]);

	useEffect(() => {
		const user = auth.user;
		if (sectionId == null || user?.id == null) {
			setStudyProgress((prev) => ({ ...prev, loading: false }));
			return;
		}
		const userId = user.id;
		let cancelled = false;
		setStudyProgress((prev) => ({ ...prev, loading: true, error: false }));

		const run = async () => {
			try {
				const now = Date.now();
				const [assignRes, quizRes] = await Promise.all([
					APIService.getAssignmentsBySection(sectionId),
					APIService.getQuizzesBySection(sectionId),
				]);
				const assignmentsRaw =
					(assignRes as { data?: unknown })?.data ?? assignRes ?? [];
				const quizzesRaw = (quizRes as { data?: unknown })?.data ?? quizRes ?? [];
				const assignmentsList = Array.isArray(assignmentsRaw)
					? assignmentsRaw
					: [];
				const quizzesList = Array.isArray(quizzesRaw) ? quizzesRaw : [];

				const upcoming = assignmentsList.filter((a: { endDate?: string }) => {
					if (!a?.endDate) return false;
					const t = new Date(a.endDate).getTime();
					return !Number.isNaN(t) && t >= now;
				});

				const assignmentChunks = await Promise.all(
					upcoming.map(async (a: { id: number }) => {
						try {
							const [problemsRes, statusRes] = await Promise.all([
								APIService.getAssignmentProblems(sectionId, a.id),
								APIService.getStudentAssignmentProblemsStatus(
									userId,
									sectionId,
									a.id,
								),
							]);
							const problemsList =
								(problemsRes as { data?: unknown })?.data ?? problemsRes ?? [];
							const problemsStatus =
								(statusRes as { data?: unknown })?.data ?? statusRes ?? [];
							const total = Array.isArray(problemsList) ? problemsList.length : 0;
							const solved = Array.isArray(problemsStatus)
								? problemsStatus.filter(
										(s: { status?: string }) =>
											s.status === "ACCEPTED" || s.status === "SUBMITTED",
									).length
								: 0;
							return { total, solved };
						} catch {
							return { total: 0, solved: 0 };
						}
					}),
				);
				const assignmentTotalProblems = assignmentChunks.reduce(
					(s, x) => s + x.total,
					0,
				);
				const assignmentSolvedProblems = assignmentChunks.reduce(
					(s, x) => s + x.solved,
					0,
				);

				const quizChunks = await Promise.all(
					quizzesList.map(async (q: { id: number }) => {
						try {
							const statusRes = await APIService.getQuizProblemStatuses(
								sectionId,
								q.id,
							);
							const statuses =
								(statusRes as { data?: unknown })?.data ?? statusRes ?? [];
							if (!Array.isArray(statuses)) return { total: 0, solved: 0 };
							const total = statuses.length;
							const solved = statuses.filter(
								(s: { submitted?: boolean; result?: string | null }) =>
									Boolean(s.submitted) && s.result === "AC",
							).length;
							return { total, solved };
						} catch {
							return { total: 0, solved: 0 };
						}
					}),
				);
				const quizTotalProblems = quizChunks.reduce((s, x) => s + x.total, 0);
				const quizSolvedProblems = quizChunks.reduce((s, x) => s + x.solved, 0);

				if (!cancelled) {
					setStudyProgress({
						loading: false,
						error: false,
						assignmentUpcomingCount: upcoming.length,
						assignmentSolvedProblems,
						assignmentTotalProblems,
						quizCount: quizzesList.length,
						quizSolvedProblems,
						quizTotalProblems,
					});
				}
			} catch {
				if (!cancelled) {
					setStudyProgress((prev) => ({
						...prev,
						loading: false,
						error: true,
					}));
				}
			}
		};

		void run();
		return () => {
			cancelled = true;
		};
	}, [sectionId, auth.user]);

	const handleMenuClick = useCallback((_menuId: string) => {}, []);

	const handleQuizSummaryClick = useCallback(
		async (quizId: number) => {
			if (sectionId == null) return;
			navigate(`/sections/${sectionId}/coding-quiz?quizId=${quizId}`);
		},
		[sectionId, navigate],
	);

	const handleNotificationClick = useCallback(
		async (notification: TransformedNotification) => {
			if (notification.link) {
				navigate(notification.link);
				if (notification.isNew && notification.id) {
					try {
						await APIService.markCommunityNotificationAsRead(notification.id);
						fetchDashboardData();
					} catch (err) {
						console.error("알림 읽음 처리 실패:", err);
					}
				}
			}
		},
		[navigate, fetchDashboardData],
	);

	const handleNoticeClick = useCallback(
		(notice: Notice) => {
			navigate(`/sections/${notice.sectionId}/course-notices/${notice.id}`);
		},
		[navigate],
	);

	const handleAssignmentClick = useCallback(
		(assignment: Assignment) => {
			navigate(
				`/sections/${assignment.sectionId}/course-assignments?assignmentId=${assignment.id}`,
			);
		},
		[navigate],
	);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	const handleEnrollByCode = useCallback(async () => {
		if (!enrollmentCode.trim()) {
			alert("참가 코드를 입력하세요.");
			return;
		}
		const code = extractEnrollmentCode(enrollmentCode);
		if (!code) {
			alert("유효한 참가 코드나 링크를 입력하세요.");
			return;
		}
		if (!auth.user) {
			sessionStorage.setItem("pendingEnrollmentCode", code);
			setShowEnrollModal(false);
			setEnrollmentCode("");
			navigate("/login", {
				state: {
					redirectTo: `/enroll/${code}`,
					message: "수업 참가를 위해 로그인이 필요합니다.",
				},
			});
			return;
		}
		try {
			setEnrollLoading(true);
			const resp = await APIService.enrollByCode(code);
			if (resp?.success) {
				alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
				setEnrollmentCode("");
				setShowEnrollModal(false);
				fetchDashboardData();
			} else {
				alert(resp?.message || "수강 신청에 실패했습니다.");
			}
		} catch (e: unknown) {
			alert((e as Error).message || "수강 신청 중 오류가 발생했습니다.");
		} finally {
			setEnrollLoading(false);
		}
	}, [enrollmentCode, auth.user, navigate, fetchDashboardData]);

	const transformedSections: CourseCardData[] = enrolledSections.map(
		(section) => transformSectionData(section, sectionNewItems),
	);

	// 현재 수업(sectionId) 기준으로만 필터링
	const sectionNotices = useMemo(
		() =>
			sectionId != null
				? allNotices.filter((n) => String(n.sectionId) === String(sectionId))
				: [],
		[allNotices, sectionId],
	);
	const sectionAssignments = useMemo(
		() =>
			sectionId != null
				? allAssignments.filter(
						(a) => String(a.sectionId) === String(sectionId),
					)
				: [],
		[allAssignments, sectionId],
	);
	const sectionNotifications = useMemo(
		() =>
			sectionId != null
				? allNotifications.filter(
						(n) => String(n.sectionId) === String(sectionId),
					)
				: [],
		[allNotifications, sectionId],
	);

	return {
		sectionId,
		auth,
		loading,
		error,
		isSidebarCollapsed,
		activeMenu,
		sectionInfo,
		transformedSections,
		managingSections,
		publicSections,
		sectionQuizzes,
		sectionNotices,
		sectionAssignments,
		sectionNotifications,
		allNotifications,
		allAssignments,
		allNotices,
		enrollmentCode,
		enrollLoading,
		showEnrollModal,
		setEnrollmentCode,
		setShowEnrollModal,
		fetchDashboardData,
		handleMenuClick,
		handleNotificationClick,
		handleNoticeClick,
		handleAssignmentClick,
		handleQuizSummaryClick,
		handleToggleSidebar,
		handleEnrollByCode,
		calculateDDay,
		navigate,
		studyProgress,
	};
}

export type CourseDashboardHookReturn = ReturnType<typeof useCourseDashboard>;
