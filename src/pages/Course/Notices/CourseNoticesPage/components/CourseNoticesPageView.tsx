import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import type { CourseNoticesPageHookReturn } from "../hooks/useCourseNoticesPage";
import * as S from "../styles";

export default function CourseNoticesPageView(d: CourseNoticesPageHookReturn) {
	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu={d.activeMenu}
					onMenuClick={d.handleMenuClick}
					isCollapsed={d.isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (d.error) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu={d.activeMenu}
					onMenuClick={d.handleMenuClick}
					isCollapsed={d.isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<S.ErrorMessage>
						<p>{d.error}</p>
						<button onClick={d.fetchNoticesData}>다시 시도</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu={d.activeMenu}
				onMenuClick={d.handleMenuClick}
				isCollapsed={d.isSidebarCollapsed}
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

				<S.NoticesBody>
					<S.NoticesHeader>
						<S.NoticesTitle>공지사항</S.NoticesTitle>
						<S.NoticesSummary>
							<S.NewCount>새 공지 {d.newNoticesCount}</S.NewCount>
							<S.TotalCount>공지사항 {d.totalNoticesCount}</S.TotalCount>
						</S.NoticesSummary>
						<S.SortButton onClick={d.handleSortToggle}>
							<S.SortText>최신순</S.SortText>
							<S.SortArrow>
								{d.sortOrder === "desc" ? "▼" : "▲"}
							</S.SortArrow>
						</S.SortButton>
					</S.NoticesHeader>

					<S.NoticesList>
						{d.notices.length > 0 ? (
							d.notices.map((notice) => (
								<S.NoticeItem
									key={notice.id}
									$unread={notice.isNew}
									onClick={() => d.handleNoticeClick(notice)}
								>
									<S.NoticeLeft>
										<S.NoticeTitle>{notice.title}</S.NoticeTitle>
										{notice.isNew && (
											<S.NoticeNewBadge>NEW</S.NoticeNewBadge>
										)}
									</S.NoticeLeft>
									<S.NoticeRight>
										<S.NoticeAuthor>
											{notice.instructorName || "작성자"}
										</S.NoticeAuthor>
										<S.NoticeDate>
											{d.formatDate(notice.createdAt)}
										</S.NoticeDate>
									</S.NoticeRight>
								</S.NoticeItem>
							))
						) : (
							<S.NoNotices>
								<p>등록된 공지사항이 없습니다.</p>
							</S.NoNotices>
						)}
					</S.NoticesList>
				</S.NoticesBody>
			</S.Content>
		</S.Container>
	);
}
