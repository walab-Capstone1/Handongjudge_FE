import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../recoil/atoms";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { Notification, SectionInfo, Stats } from "./types";

const CourseNotificationsPage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);

	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [stats, setStats] = useState<Stats>({
		total: 0,
		unread: 0,
		notices: 0,
		assignments: 0,
	});

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionId]);

	const formatDate = (dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
	};

	const fetchData = async () => {
		if (!sectionId) return;

		try {
			setLoading(true);

			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(sectionData);

			const notificationsResponse = await APIService.getCommunityNotifications(
				sectionId,
				0,
				200,
			);
			const notificationsList = notificationsResponse.data?.content || [];

			const notificationList: Notification[] = notificationsList.map(
				(notif: any) => {
					let title = "";
					let link = null;
					let displayType: "notice" | "assignment" | "community" | "other" =
						"other";

					switch (notif.type) {
						case "NOTICE_CREATED":
							title = notif.noticeTitle || "공지사항";
							link = notif.noticeId
								? `/sections/${sectionId}/course-notices/${notif.noticeId}`
								: null;
							displayType = "notice";
							break;
						case "ASSIGNMENT_CREATED":
							title = notif.assignmentTitle || "과제";
							link = notif.assignmentId
								? `/sections/${sectionId}/course-assignments?assignmentId=${notif.assignmentId}`
								: null;
							displayType = "assignment";
							break;
						case "QUESTION_COMMENT":
							title = notif.message || "내 질문에 댓글이 달렸습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "COMMENT_ACCEPTED":
							title = notif.message || "내 댓글이 채택되었습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "QUESTION_LIKED":
						case "COMMENT_LIKED":
							title = notif.message || "추천을 받았습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "QUESTION_PINNED":
							title = notif.message || "내 질문이 고정되었습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						case "QUESTION_RESOLVED":
							title = notif.message || "내 질문이 해결되었습니다";
							link = notif.questionId
								? `/sections/${sectionId}/community/${notif.questionId}`
								: null;
							displayType = "community";
							break;
						default:
							title = notif.message || "새 알림";
							displayType = "other";
							break;
					}

					return {
						id: notif.id,
						type: displayType,
						originalId:
							notif.noticeId ||
							notif.assignmentId ||
							notif.questionId ||
							notif.id,
						title: title,
						date: formatDate(notif.createdAt),
						isNew: !notif.isRead,
						createdAt: notif.createdAt,
						link: link,
						notificationType: notif.type,
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

			setStats({
				total: notificationList.length,
				unread: unreadCount,
				notices: noticeCount,
				assignments: assignmentCount,
			});
		} catch (error) {
			console.error("데이터 로딩 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSortToggle = () => {
		setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
		setNotifications((prev) => [...prev].reverse());
	};

	const handleNotificationClick = async (notification: Notification) => {
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
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	const getNotificationTypeLabel = (type: string): string => {
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
	};

	if (loading) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu="알림"
					isCollapsed={isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<CourseHeader
						courseName={
							sectionInfo?.courseTitle ? sectionInfo.courseTitle : "강의"
						}
						onToggleSidebar={handleToggleSidebar}
						isSidebarCollapsed={isSidebarCollapsed}
					/>
					<S.NotificationsBody>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.NotificationsBody>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu="알림"
				isCollapsed={isSidebarCollapsed}
				onMenuClick={() => {}}
			/>

			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle
							? sectionInfo.courseTitle
							: sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>

				<S.NotificationsBody>
					<S.NotificationsTitle>알림</S.NotificationsTitle>

					<S.NotificationsStatsBar>
						<S.NotificationsStats>
							<S.StatItem>전체 {stats.total}</S.StatItem>
							<S.StatItem>안 읽음 {stats.unread}</S.StatItem>
							<S.StatItem>공지 {stats.notices}</S.StatItem>
							<S.StatItem>과제 {stats.assignments}</S.StatItem>
						</S.NotificationsStats>
						<S.SortButton onClick={handleSortToggle}>
							<span>최신순</span>
							<S.SortArrow $direction={sortOrder === "latest" ? "desc" : "asc"}>
								▲
							</S.SortArrow>
						</S.SortButton>
					</S.NotificationsStatsBar>

					<S.NotificationsList>
						{notifications.length > 0 ? (
							notifications.map((notification) => (
								<S.NotificationCard
									key={notification.id}
									$isNew={notification.isNew}
									$type={notification.type}
									onClick={() => handleNotificationClick(notification)}
								>
									<S.NotificationContent>
										<S.NotificationTag
											$isNew={notification.isNew}
											$type={notification.type}
										>
											{getNotificationTypeLabel(notification.type)}
										</S.NotificationTag>
										<S.NotificationTitle
											$isNew={notification.isNew}
											$type={notification.type}
										>
											{notification.title}
										</S.NotificationTitle>
										<S.NotificationDate
											$isNew={notification.isNew}
											$type={notification.type}
										>
											[{notification.date}]
										</S.NotificationDate>
									</S.NotificationContent>
								</S.NotificationCard>
							))
						) : (
							<S.NoNotificationsMessage>
								<span>알림이 없습니다.</span>
							</S.NoNotificationsMessage>
						)}
					</S.NotificationsList>
				</S.NotificationsBody>
			</S.Content>
		</S.Container>
	);
};

export default CourseNotificationsPage;
