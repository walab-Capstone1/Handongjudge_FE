import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "../types";
import { calculateDDay } from "../utils/dateUtils";
import { extractEnrollmentCode } from "../utils/enrollmentUtils";
import {
	transformSectionData,
	getRandomColor,
} from "../utils/sectionUtils";
import { transformNotification } from "../utils/notificationUtils";

export function useCourseDashboard() {
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
						assignments as Array<Assignment & { sectionId?: number; sectionName?: string }>
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
							(notif: Notification & { sectionId?: number; sectionName?: string }) => ({
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
				(a, b) =>
					new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
			);
			expiredAssignments.sort(
				(a, b) =>
					new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
			);
			const sortedAssignments = [
				...activeAssignments,
				...expiredAssignments,
			].slice(0, 5);

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
			setError(
				(err as Error).message || "데이터를 불러오는데 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

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
				(q: { id: number; title?: string; startTime?: string; endTime?: string; status?: string }) => ({
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
	}, [auth.user, sectionId, fetchDashboardData, fetchManagingSections, fetchSectionQuizzes]);

	const handleMenuClick = useCallback((_menuId: string) => {}, []);

	const handleNotificationClick = useCallback(
		async (notification: TransformedNotification) => {
			if (notification.link) {
				navigate(notification.link);
				if (notification.isNew && notification.id) {
					try {
						await APIService.markCommunityNotificationAsRead(
							notification.id,
						);
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
	}, [
		enrollmentCode,
		auth.user,
		navigate,
		fetchDashboardData,
	]);

	const transformedSections: CourseCardData[] = enrolledSections.map(
		(section) => transformSectionData(section, sectionNewItems),
	);

	// 현재 수업(sectionId) 기준으로만 필터링
	const sectionNotices = useMemo(
		() =>
			sectionId != null
				? allNotices.filter(
						(n) => String(n.sectionId) === String(sectionId),
					)
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
		handleToggleSidebar,
		handleEnrollByCode,
		calculateDDay,
		navigate,
	};
}

export type CourseDashboardHookReturn = ReturnType<typeof useCourseDashboard>;
