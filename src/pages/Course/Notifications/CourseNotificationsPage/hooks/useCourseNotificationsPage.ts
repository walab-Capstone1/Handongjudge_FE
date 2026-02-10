import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { Notification, SectionInfo, Stats } from "../types";

function formatDate(dateString: string): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}.${month}.${day}`;
}

export function useCourseNotificationsPage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
	const [stats, setStats] = useState<Stats>({
		total: 0,
		unread: 0,
		notices: 0,
		assignments: 0,
		community: 0,
	});

	const fetchData = useCallback(async () => {
		if (!sectionId) return;

		try {
			setLoading(true);

			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(
				(sectionData as { data?: SectionInfo })?.data ?? sectionData,
			);

			const notificationsResponse = await APIService.getCommunityNotifications(
				sectionId,
				0,
				200,
			);
			const notificationsList = notificationsResponse.data?.content ?? [];

			const notificationList: Notification[] = notificationsList.map(
				(notif: Record<string, unknown>) => {
					let title = "";
					let link: string | null = null;
					let displayType: "notice" | "assignment" | "community" | "other" =
						"other";

					switch (notif.type) {
						case "NOTICE_CREATED": {
							const noticeTitle = (notif.noticeTitle as string) || "공지사항";
							title = `교수님이 "${noticeTitle}" 공지를 올리셨습니다`;
							link = notif.noticeId
								? `/sections/${sectionId}/course-notices/${notif.noticeId}`
								: null;
							displayType = "notice";
							break;
						}
						case "ASSIGNMENT_CREATED": {
							const assignmentTitle =
								(notif.assignmentTitle as string) || "과제";
							title = `교수님이 ${assignmentTitle} 새 과제를 올리셨습니다!`;
							link = notif.assignmentId
								? `/sections/${sectionId}/course-assignments?assignmentId=${notif.assignmentId}`
								: null;
							displayType = "assignment";
							break;
						}
						case "QUESTION_COMMENT":
							title =
								(notif.message as string) || "내 질문에 댓글이 달렸습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "COMMENT_ACCEPTED":
							title = (notif.message as string) || "내 댓글이 채택되었습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "QUESTION_LIKED":
						case "COMMENT_LIKED":
							title = (notif.message as string) || "추천을 받았습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "QUESTION_PINNED":
							title = (notif.message as string) || "내 질문이 고정되었습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "QUESTION_RESOLVED":
							title = (notif.message as string) || "내 질문이 해결되었습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						default:
							title = (notif.message as string) || "새 알림";
							displayType = "other";
							break;
					}

					return {
						id: notif.id as number,
						type: displayType,
						originalId:
							(notif.noticeId as number) ??
							(notif.assignmentId as number) ??
							(notif.questionId as number) ??
							(notif.id as number),
						title,
						date: formatDate((notif.createdAt as string) ?? ""),
						isNew: !notif.isRead,
						createdAt: (notif.createdAt as string) ?? "",
						link,
						notificationType: (notif.type as string) ?? "",
					};
				},
			);

			notificationList.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);

			setNotifications(notificationList);

			const unreadCount = notificationList.filter((n) => n.isNew).length;
			const noticeCount = notificationList.filter(
				(n) => n.type === "notice",
			).length;
			const assignmentCount = notificationList.filter(
				(n) => n.type === "assignment",
			).length;
			const communityCount = notificationList.filter(
				(n) => n.type === "community",
			).length;

			setStats({
				total: notificationList.length,
				unread: unreadCount,
				notices: noticeCount,
				assignments: assignmentCount,
				community: communityCount,
			});
		} catch (error) {
			console.error("데이터 로딩 실패:", error);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleSortToggle = useCallback(() => {
		setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
		setNotifications((prev) => [...prev].reverse());
	}, []);

	const handleNotificationClick = useCallback(
		async (notification: Notification) => {
			try {
				if (notification.isNew && notification.id) {
					await APIService.markCommunityNotificationAsRead(notification.id);
					setNotifications((prev) =>
						prev.map((n) =>
							n.id === notification.id ? { ...n, isNew: false } : n,
						),
					);
					setStats((prev) => ({
						...prev,
						unread: Math.max(0, prev.unread - 1),
					}));
				}
				if (notification.link) {
					navigate(notification.link);
				} else {
					if (notification.type === "notice") {
						navigate(
							`/sections/${sectionId}/course-notices/${notification.originalId}`,
						);
					} else if (notification.type === "assignment") {
						navigate(`/sections/${sectionId}/course-assignments`);
					} else if (notification.type === "community") {
						navigate(
							`/sections/${sectionId}/community/${notification.originalId}`,
						);
					}
				}
			} catch (error) {
				console.error("알림 처리 실패:", error);
			}
		},
		[navigate, sectionId],
	);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	const handleMenuClick = useCallback(
		(menuId: string) => {
			switch (menuId) {
				case "dashboard":
					navigate(`/sections/${sectionId}/dashboard`);
					break;
				case "assignment":
					navigate(`/sections/${sectionId}/course-assignments`);
					break;
				case "notice":
					navigate(`/sections/${sectionId}/course-notices`);
					break;
				case "notification":
					break;
				default:
					break;
			}
		},
		[navigate, sectionId],
	);

	const getNotificationTypeLabel = useCallback((type: string): string => {
		switch (type) {
			case "notice":
				return "공지";
			case "assignment":
				return "과제";
			case "community":
				return "커뮤니티";
			default:
				return "알림";
		}
	}, []);

	return {
		sectionId,
		sectionInfo,
		notifications,
		loading,
		sortOrder,
		stats,
		isSidebarCollapsed,
		handleSortToggle,
		handleNotificationClick,
		handleToggleSidebar,
		handleMenuClick,
		getNotificationTypeLabel,
	};
}

export type CourseNotificationsPageHookReturn = ReturnType<
	typeof useCourseNotificationsPage
>;
