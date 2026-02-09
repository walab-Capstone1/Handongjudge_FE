import type React from "react";
import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "../styles";
import { formatDeadline, formatDate } from "../utils/dateUtils";
import type { Notice, Assignment, TransformedNotification } from "../types";
import type { CourseDashboardHookReturn } from "../hooks/useCourseDashboard";

interface CourseDashboardViewProps extends CourseDashboardHookReturn {}

const CourseDashboardView: React.FC<CourseDashboardViewProps> = (d) => {
	// /dashboard(섹션 미선택) 시 훅에서 /courses로 리다이렉트하므로 로딩만 표시
	if (d.sectionId == null) {
		return (
			<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
				<LoadingSpinner />
			</div>
		);
	}
	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId ? Number.parseInt(d.sectionId) : null}
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
					sectionId={d.sectionId ? Number.parseInt(d.sectionId) : null}
					activeMenu={d.activeMenu}
					onMenuClick={d.handleMenuClick}
					isCollapsed={d.isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<S.ErrorMessage>
						<p>{d.error}</p>
						<button type="button" onClick={d.fetchDashboardData}>
							다시 시도
						</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId ? Number.parseInt(d.sectionId) : null}
				activeMenu={d.activeMenu}
				onMenuClick={d.handleMenuClick}
				isCollapsed={d.isSidebarCollapsed}
			/>

			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={
						d.sectionId
							? d.sectionInfo?.courseTitle
								? d.sectionInfo.sectionNumber
									? `${d.sectionInfo.courseTitle} ${d.sectionInfo.sectionNumber}분반`
									: `${d.sectionInfo.courseTitle}`
								: "수업 대시보드"
							: "전체 수업 대시보드"
					}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
					sectionId={d.sectionId}
				/>

				<S.DashboardBody>
					<S.LeftColumn>
						<S.CourseSummaryCard>
							<S.SummaryBackButton
								type="button"
								onClick={() => d.navigate("/courses")}
							>
								내 강의실로 돌아가기
							</S.SummaryBackButton>
							<S.SummaryTitle>
								{d.sectionInfo?.courseTitle ?? "수업"}
								{d.sectionInfo?.sectionNumber != null &&
									d.sectionInfo?.sectionNumber !== "" && (
										<S.SummaryBadge>
											{d.sectionInfo.sectionNumber}분반
										</S.SummaryBadge>
									)}
							</S.SummaryTitle>
							{d.sectionInfo?.instructorName && (
								<S.SummaryRow>담당: {d.sectionInfo.instructorName}</S.SummaryRow>
							)}
							{d.sectionInfo?.description && (
								<S.SummaryDescription>
									{d.sectionInfo.description}
								</S.SummaryDescription>
							)}
							<S.SummaryStats>
								<S.SummaryStat>
									과제 {(d.sectionAssignments ?? []).length}개
								</S.SummaryStat>
								<S.SummaryStat>
									공지 {(d.sectionNotices ?? []).length}개
								</S.SummaryStat>
							</S.SummaryStats>
						</S.CourseSummaryCard>

						<S.Subsection>
							<S.SubsectionTitle>다가오는 마감</S.SubsectionTitle>
							<S.ContentBox>
								{(() => {
									const now = new Date();
									const upcoming = (d.sectionAssignments ?? [])
										.filter((a) => new Date(a.endDate) >= now)
										.sort(
											(a, b) =>
												new Date(a.endDate).getTime() -
												new Date(b.endDate).getTime(),
										)
										.slice(0, 2);
									return upcoming.length > 0 ? (
										upcoming.map((assignment: Assignment) => {
											const dDay = d.calculateDDay(assignment.endDate);
											const isExpired = dDay !== null && dDay < 0;
											return (
												<S.UpcomingDeadlineItem
													key={assignment.id}
													$isExpired={isExpired}
													onClick={() => d.handleAssignmentClick(assignment)}
												>
													<S.UpcomingDeadlineTitle>
														{assignment.title}
													</S.UpcomingDeadlineTitle>
													<S.UpcomingDeadlineDday $isExpired={isExpired}>
														{dDay !== null
															? dDay === 0
																? "오늘 마감"
																: dDay > 0
																	? `D-${dDay}`
																	: `D+${-dDay}`
															: ""}
													</S.UpcomingDeadlineDday>
												</S.UpcomingDeadlineItem>
											);
										})
									) : (
										<S.NoContent>
											<span>다가오는 마감이 없습니다.</span>
										</S.NoContent>
									);
								})()}
							</S.ContentBox>
						</S.Subsection>

						<S.Subsection>
							<S.SubsectionTitle>코딩 테스트</S.SubsectionTitle>
							<S.ContentBox>
								{(d.sectionQuizzes ?? []).length > 0 ? (
									(d.sectionQuizzes ?? [])
										.slice(0, 3)
										.map((quiz) => (
											<S.QuizSummaryItem
												key={quiz.id}
												onClick={() =>
													d.navigate(
														`/sections/${d.sectionId}/coding-quiz/${quiz.id}`,
													)
												}
											>
												<S.QuizSummaryTitle>{quiz.title}</S.QuizSummaryTitle>
												<S.QuizSummaryMeta>
													{quiz.status === "ACTIVE"
														? "진행 중"
														: quiz.status === "ENDED"
															? "종료"
															: quiz.status === "WAITING"
																? "예정"
																: ""}
												</S.QuizSummaryMeta>
											</S.QuizSummaryItem>
										))
								) : (
									<S.NoContent>
										<span>등록된 코딩 테스트가 없습니다.</span>
									</S.NoContent>
								)}
							</S.ContentBox>
						</S.Subsection>
					</S.LeftColumn>

					<S.RightColumn>
						<S.Subsection>
							<S.SubsectionTitle>알림</S.SubsectionTitle>
							<S.ContentBox>
								{(d.sectionNotifications ?? []).length > 0 ? (
									(d.sectionNotifications ?? []).map(
										(notification: TransformedNotification) => (
											<S.NotificationItem
												key={notification.id}
												$isNew={notification.isNew}
												onClick={() => d.handleNotificationClick(notification)}
											>
												<S.NotificationText>
													{notification.isNew && <S.NewBadge>NEW</S.NewBadge>}
													{notification.title}
													<S.NotificationDate>
														{" "}
														[{notification.date}]
													</S.NotificationDate>
													{notification.sectionName && (
														<S.NotificationSection>
															{" "}
															({notification.sectionName})
														</S.NotificationSection>
													)}
												</S.NotificationText>
											</S.NotificationItem>
										),
									)
								) : (
									<S.NoContent>
										<span>새로운 알림이 없습니다.</span>
									</S.NoContent>
								)}
							</S.ContentBox>
						</S.Subsection>

						<S.Subsection>
							<S.SubsectionTitle>과제</S.SubsectionTitle>
							<S.ContentBox>
								{(d.sectionAssignments ?? []).length > 0 ? (
									(d.sectionAssignments ?? []).map((assignment: Assignment) => {
										const dDay = d.calculateDDay(assignment.endDate);
										const isExpired = dDay !== null && dDay < 0;
										return (
											<S.AssignmentItem
												key={assignment.id}
												$isExpired={isExpired}
												onClick={() => d.handleAssignmentClick(assignment)}
											>
												<S.AssignmentHeader>
													<S.AssignmentTitle>
														{assignment.title}
													</S.AssignmentTitle>
												</S.AssignmentHeader>
												<S.AssignmentInfo>
													<S.AssignmentSection>
														{assignment.sectionName}
													</S.AssignmentSection>
													<S.AssignmentDeadline $isExpired={isExpired}>
														{formatDeadline(assignment.endDate)}
													</S.AssignmentDeadline>
												</S.AssignmentInfo>
											</S.AssignmentItem>
										);
									})
								) : (
									<S.NoContent>
										<span>과제가 없습니다.</span>
									</S.NoContent>
								)}
							</S.ContentBox>
						</S.Subsection>

						<S.Subsection>
							<S.SubsectionTitle>공지사항</S.SubsectionTitle>
							<S.ContentBox>
								{(d.sectionNotices ?? []).length > 0 ? (
									(d.sectionNotices ?? []).map((notice: Notice) => (
										<S.NoticeItem
											key={notice.id}
											$isNew={notice.isNew}
											onClick={() => d.handleNoticeClick(notice)}
										>
											<S.NoticeHeader>
												{notice.isNew && <S.NewBadge>NEW</S.NewBadge>}
												<S.NoticeTitle>{notice.title}</S.NoticeTitle>
												{notice.sectionName && (
													<S.NoticeSection>
														{notice.sectionName}
													</S.NoticeSection>
												)}
												{notice.createdAt && (
													<S.NoticeDate>
														{formatDate(notice.createdAt)}
													</S.NoticeDate>
												)}
											</S.NoticeHeader>
										</S.NoticeItem>
									))
								) : (
									<S.NoContent>
										<span>공지사항이 없습니다.</span>
									</S.NoContent>
								)}
							</S.ContentBox>
						</S.Subsection>
					</S.RightColumn>
				</S.DashboardBody>
			</S.Content>

			{d.showEnrollModal && (
				<S.EnrollModalOverlay onClick={() => d.setShowEnrollModal(false)}>
					<S.EnrollModal onClick={(e: React.MouseEvent) => e.stopPropagation()}>
						<S.EnrollModalHeader>
							<h2>수업 참가</h2>
							<S.EnrollModalClose
								type="button"
								onClick={() => d.setShowEnrollModal(false)}
								aria-label="닫기"
							>
								X
							</S.EnrollModalClose>
						</S.EnrollModalHeader>
						<S.EnrollModalBody>
							<label htmlFor="enroll-code">참가 코드 또는 링크</label>
							<S.EnrollInput
								id="enroll-code"
								type="text"
								placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
								value={d.enrollmentCode}
								onChange={(e) => d.setEnrollmentCode(e.target.value)}
							/>
							<S.EnrollHelpText>
								참가 코드만 입력하거나 전체 링크를 붙여넣으세요.
							</S.EnrollHelpText>
						</S.EnrollModalBody>
						<S.EnrollModalActions>
							<S.EnrollCancelBtn
								type="button"
								onClick={() => d.setShowEnrollModal(false)}
							>
								취소
							</S.EnrollCancelBtn>
							<S.EnrollSubmitBtn
								type="button"
								onClick={d.handleEnrollByCode}
								disabled={d.enrollLoading}
							>
								{d.enrollLoading ? "처리 중..." : "참가하기"}
							</S.EnrollSubmitBtn>
						</S.EnrollModalActions>
					</S.EnrollModal>
				</S.EnrollModalOverlay>
			)}
		</S.Container>
	);
};

export default CourseDashboardView;
