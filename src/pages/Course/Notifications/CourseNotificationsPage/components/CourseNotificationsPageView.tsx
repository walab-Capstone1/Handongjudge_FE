import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import type { CourseNotificationsPageHookReturn } from "../hooks/useCourseNotificationsPage";
import * as S from "../styles";

export default function CourseNotificationsPageView(
	d: CourseNotificationsPageHookReturn,
) {
	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="알림"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={d.handleMenuClick}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={
							d.sectionInfo?.courseTitle ? d.sectionInfo.courseTitle : "강의"
						}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.NotificationsBody>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.NotificationsBody>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu="알림"
				isCollapsed={d.isSidebarCollapsed}
				onMenuClick={d.handleMenuClick}
			/>

			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={
						d.sectionInfo?.courseTitle
							? d.sectionInfo.courseTitle
							: d.sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
				/>

				<S.NotificationsBody>
					<S.NotificationsTitle>알림</S.NotificationsTitle>

					<S.NotificationsStatsBar>
						<S.NotificationsStats>
							<S.StatItem>전체 {d.stats.total}</S.StatItem>
							<S.StatItem>안 읽음 {d.stats.unread}</S.StatItem>
							<S.StatItem>공지 {d.stats.notices}</S.StatItem>
							<S.StatItem>과제 {d.stats.assignments}</S.StatItem>
							<S.StatItem>커뮤니티 {d.stats.community}</S.StatItem>
						</S.NotificationsStats>
						<S.SortButton onClick={d.handleSortToggle}>
							<span>최신순</span>
							<S.SortArrow
								$direction={d.sortOrder === "latest" ? "desc" : "asc"}
							>
								▲
							</S.SortArrow>
						</S.SortButton>
					</S.NotificationsStatsBar>

					<S.NotificationsList>
						{d.notifications.length > 0 ? (
							d.notifications.map((notification) => (
								<S.NotificationCard
									key={notification.id}
									$isNew={notification.isNew}
									$type={notification.type}
									onClick={() => d.handleNotificationClick(notification)}
								>
									<S.NotificationContent>
										<S.NotificationTag
											$isNew={notification.isNew}
											$type={notification.type}
										>
											{d.getNotificationTypeLabel(notification.type)}
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
}
