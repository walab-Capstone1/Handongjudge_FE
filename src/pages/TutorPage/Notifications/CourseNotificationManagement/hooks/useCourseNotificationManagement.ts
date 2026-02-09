import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import { getNotificationTypeLabel } from "../utils";
import type {
	Notification,
	NotificationFilterType,
	NotificationReadFilter,
} from "../types";

const pageSize = 20;

export function useCourseNotificationManagement() {
	const { sectionId } = useParams<{ sectionId?: string }>();
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<NotificationFilterType>("ALL");
	const [filterRead, setFilterRead] = useState<NotificationReadFilter>("ALL");
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalElements, setTotalElements] = useState(0);

	const fetchNotifications = useCallback(async () => {
		try {
			setLoading(true);
			const targetSectionId = sectionId ? Number.parseInt(sectionId, 10) : null;
			const response = await APIService.getCommunityNotifications(
				targetSectionId,
				currentPage,
				pageSize,
			);
			const data = response?.data ?? {};
			let notificationsData: Notification[] = [];
			if (data.content) {
				notificationsData = data.content;
			} else if (Array.isArray(data)) {
				notificationsData = data;
			}
			if (filterType !== "ALL") {
				notificationsData = notificationsData.filter((notif) => {
					if (filterType === "ASSIGNMENT") {
						return (
							notif.type === "ASSIGNMENT_CREATED" ||
							notif.type === "ASSIGNMENT_DEADLINE"
						);
					}
					if (filterType === "STUDENT")
						return notif.type === "STUDENT_ENROLLED";
					if (filterType === "NOTICE") return notif.type === "NOTICE_CREATED";
					return notif.type === filterType;
				});
			}
			if (filterRead !== "ALL") {
				notificationsData = notificationsData.filter((notif) => {
					if (filterRead === "UNREAD") return !notif.isRead;
					if (filterRead === "READ") return notif.isRead;
					return true;
				});
			}
			setNotifications(notificationsData);
			setTotalPages(data.totalPages ?? 0);
			setTotalElements(data.totalElements ?? notificationsData.length);
		} catch (error) {
			console.error("알림 조회 실패:", error);
			setNotifications([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId, currentPage, filterType, filterRead]);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	const handleMarkAsRead = useCallback(
		async (notificationId: number) => {
			try {
				await APIService.markCommunityNotificationAsRead(notificationId);
				fetchNotifications();
			} catch (error) {
				console.error("알림 읽음 처리 실패:", error);
				alert("알림 읽음 처리에 실패했습니다.");
			}
		},
		[fetchNotifications],
	);

	const handleMarkAllAsRead = useCallback(async () => {
		if (!window.confirm("모든 알림을 읽음 처리하시겠습니까?")) return;
		try {
			await APIService.markAllNotificationsAsRead();
			fetchNotifications();
			alert("모든 알림을 읽음 처리했습니다.");
		} catch (error) {
			console.error("전체 읽음 처리 실패:", error);
			alert("전체 읽음 처리에 실패했습니다.");
		}
	}, [fetchNotifications]);

	const handleNotificationClick = useCallback(
		(notification: Notification) => {
			if (notification.assignmentId) {
				navigate(
					`/tutor/assignments/section/${notification.sectionId ?? sectionId}`,
				);
			} else if (notification.noticeId) {
				navigate(
					`/tutor/notices/section/${notification.sectionId ?? sectionId}`,
				);
			} else if (notification.type === "STUDENT_ENROLLED") {
				navigate(`/tutor/users/section/${notification.sectionId ?? sectionId}`);
			}
			if (!notification.isRead) {
				handleMarkAsRead(notification.id);
			}
		},
		[navigate, sectionId, handleMarkAsRead],
	);

	const filteredNotifications = notifications.filter((notif) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			notif.message?.toLowerCase().includes(searchLower) ||
			getNotificationTypeLabel(notif.type)?.toLowerCase().includes(searchLower)
		);
	});

	const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

	return {
		loading,
		notifications,
		searchTerm,
		setSearchTerm,
		filterType,
		setFilterType,
		filterRead,
		setFilterRead,
		currentPage,
		setCurrentPage,
		totalPages,
		totalElements,
		filteredNotifications,
		unreadCount,
		handleMarkAsRead,
		handleMarkAllAsRead,
		handleNotificationClick,
	};
}
