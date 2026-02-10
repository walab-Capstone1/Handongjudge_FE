import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
import { useCourseNotificationManagement } from "./hooks/useCourseNotificationManagement";
import NotificationHeader from "./NotificationHeader";
import NotificationFilters from "./NotificationFilters";
import NotificationList from "./NotificationList";
import NotificationPagination from "./NotificationPagination";
import * as S from "./styles";

const CourseNotificationManagement: FC = () => {
	const {
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
		handleMarkAllAsRead,
		handleNotificationClick,
	} = useCourseNotificationManagement();

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
