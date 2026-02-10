import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import type { CourseNoticeDetailPageHookReturn } from "../hooks/useCourseNoticeDetailPage";
import * as S from "../styles";

export default function CourseNoticeDetailPageView(
	d: CourseNoticeDetailPageHookReturn,
) {
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
						<button onClick={d.goToList}>목록으로</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	if (!d.notice) {
		return null;
	}

	const notice = d.notice;

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
							? `[${d.sectionInfo.courseTitle}] ${d.sectionInfo.sectionNumber ?? ""}분반`
							: d.sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
				/>

				<S.NoticeDetailBody>
					<S.NoticeDetailCard>
						<S.NoticeDetailHeader>
							<S.NoticeDetailTitle>{notice.title}</S.NoticeDetailTitle>
							<S.NoticeDetailMeta>
								<S.NoticeDetailAuthor>
									작성자: {notice.instructorName || "작성자"}
								</S.NoticeDetailAuthor>
								<S.NoticeDetailDate>
									날짜: {d.formatDate(notice.createdAt)}
								</S.NoticeDetailDate>
							</S.NoticeDetailMeta>
						</S.NoticeDetailHeader>

						<S.NoticeDetailContent>
							<S.NoticeContentText>
								{notice.content || "공지사항 내용이 없습니다."}
							</S.NoticeContentText>
						</S.NoticeDetailContent>

						<S.NoticeDetailFooter>
							<S.NavButton
								onClick={d.goToPrevNotice}
								disabled={!d.hasPrevNotice()}
							>
								← 이전 글
							</S.NavButton>

							<S.NavButton $variant="list" onClick={d.goToList}>
								목록으로
							</S.NavButton>

							<S.NavButton
								onClick={d.goToNextNotice}
								disabled={!d.hasNextNotice()}
							>
								다음 글 →
							</S.NavButton>
						</S.NoticeDetailFooter>
					</S.NoticeDetailCard>
				</S.NoticeDetailBody>
			</S.Content>
		</S.Container>
	);
}
