import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import NotificationHeader from "./NotificationHeader";
import NotificationFilters from "./NotificationFilters";
import NotificationList from "./NotificationList";
import NotificationPagination from "./NotificationPagination";
import { getNotificationTypeLabel } from "./utils";
import * as S from "./styles";
import type {
	Notification,
	NotificationFilterType,
	NotificationReadFilter,
} from "./types";

const pageSize = 20;

const CourseNotificationManagement: React.FC = () => {
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

	useEffect(() => {
		void sectionId;
		void currentPage;
		void filterType;
		void filterRead;
		fetchNotifications();
	}, [sectionId, currentPage, filterType, filterRead]);

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			const targetSectionId = sectionId ? Number.parseInt(sectionId) : null;

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
					if (filterType === "STUDENT") {
						return notif.type === "STUDENT_ENROLLED";
					}
					if (filterType === "NOTICE") {
						return notif.type === "NOTICE_CREATED";
					}
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
	};

	const handleMarkAsRead = async (notificationId: number) => {
		try {
			await APIService.markCommunityNotificationAsRead(notificationId);
			fetchNotifications();
		} catch (error) {
			console.error("알림 읽음 처리 실패:", error);
			alert("알림 읽음 처리에 실패했습니다.");
		}
	};

	const handleMarkAllAsRead = async () => {
		if (window.confirm("모든 알림을 읽음 처리하시겠습니까?")) {
			try {
				await APIService.markAllNotificationsAsRead();
				fetchNotifications();
				alert("모든 알림을 읽음 처리했습니다.");
			} catch (error) {
				console.error("전체 읽음 처리 실패:", error);
				alert("전체 읽음 처리에 실패했습니다.");
			}
		}
	};

	const handleNotificationClick = (notification: Notification) => {
		if (notification.assignmentId) {
			navigate(
				`/tutor/assignments/section/${notification.sectionId ?? sectionId}`,
			);
		} else if (notification.noticeId) {
			navigate(`/tutor/notices/section/${notification.sectionId ?? sectionId}`);
		} else if (notification.type === "STUDENT_ENROLLED") {
			navigate(`/tutor/users/section/${notification.sectionId ?? sectionId}`);
		}

		if (!notification.isRead) {
			handleMarkAsRead(notification.id);
		}
	};

	const filteredNotifications = notifications.filter((notif) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			notif.message?.toLowerCase().includes(searchLower) ||
			getNotificationTypeLabel(notif.type)?.toLowerCase().includes(searchLower)
		);
	});

	const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

	if (loading && notifications.length === 0) {
		return (
			<TutorLayout>
				<S.Container>
					<S.LoadingContainer>
						<S.Spinner />
						<p>알림을 불러오는 중...</p>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.Container>
				<NotificationHeader
					totalElements={totalElements}
					unreadCount={unreadCount}
					onMarkAllAsRead={handleMarkAllAsRead}
				/>

				<NotificationFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterType={filterType}
					onFilterTypeChange={setFilterType}
					filterRead={filterRead}
					onFilterReadChange={setFilterRead}
					onPageReset={() => setCurrentPage(0)}
				/>

				<NotificationList
					notifications={filteredNotifications}
					onNotificationClick={handleNotificationClick}
				/>

				<NotificationPagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={setCurrentPage}
				/>
			</S.Container>
		</TutorLayout>
	);
};

export default CourseNotificationManagement;
