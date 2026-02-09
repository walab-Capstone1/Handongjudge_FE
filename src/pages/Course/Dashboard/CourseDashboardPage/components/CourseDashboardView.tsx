import type React from "react";
import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import CourseCard from "../../../../../components/Course/CourseCard";
import { FaGripLinesVertical, FaChevronLeft } from "react-icons/fa";
import * as S from "../styles";
import { formatDeadline, formatDate } from "../utils/dateUtils";
import type { Notice, Assignment, TransformedNotification } from "../types";
import type { CourseDashboardHookReturn } from "../hooks/useCourseDashboard";

interface CourseDashboardViewProps extends CourseDashboardHookReturn {}

const CourseDashboardView: React.FC<CourseDashboardViewProps> = (d) => {
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
						<S.ProfileSection>
							<S.ProfileAvatar
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/blBC3g5kkQ/pe2v4bz8_expires_30_days.png"
								alt="User Avatar"
							/>
							<S.ProfileGreeting>
								{d.auth.user?.name || "사용자"}님, 반가워요!
							</S.ProfileGreeting>
						</S.ProfileSection>

						<S.CoursesSection>
							<S.SectionHeader>
								<S.SectionTitle>참여한 수업 목록</S.SectionTitle>
								<S.JoinClassBtn onClick={() => d.setShowEnrollModal(true)}>
									+ 수업 참가
								</S.JoinClassBtn>
							</S.SectionHeader>
							<S.CoursesScrollContainer>
								<S.CoursesGrid>
									{d.transformedSections.length > 0 ? (
										d.transformedSections.map((course) => (
											<CourseCard
												key={course.id}
												course={course}
												onStatusUpdate={d.fetchDashboardData}
												onEnroll={() => {}}
											/>
										))
									) : (
										<S.NoCourses>
											<span>수강 중인 수업이 없습니다.</span>
										</S.NoCourses>
									)}
								</S.CoursesGrid>
							</S.CoursesScrollContainer>
						</S.CoursesSection>

						<S.CoursesSection>
							<S.SectionHeader>
								<S.SectionTitle>관리 중인 수업 목록</S.SectionTitle>
								<S.CreateCourseBtn onClick={() => d.navigate("/tutor/courses")}>
									+ 수업 만들기
								</S.CreateCourseBtn>
							</S.SectionHeader>
							<S.CoursesScrollContainer>
								<S.CoursesGrid>
									{d.managingSections.length > 0 ? (
										d.managingSections.map((course) => (
											<CourseCard
												key={course.id}
												course={course}
												onStatusUpdate={d.fetchDashboardData}
												onEnroll={() =>
													d.navigate(
														`/tutor/assignments/section/${course.sectionId}`,
													)
												}
											/>
										))
									) : (
										<S.NoCourses>
											<span>관리 중인 수업이 없습니다.</span>
										</S.NoCourses>
									)}
								</S.CoursesGrid>
							</S.CoursesScrollContainer>
						</S.CoursesSection>

						<S.CoursesSection>
							<S.SectionHeader>
								<S.SectionTitle>공개된 클래스</S.SectionTitle>
							</S.SectionHeader>
							<S.CoursesScrollContainer>
								<S.CoursesGrid>
									{d.publicSections.length > 0 ? (
										d.publicSections.map((course) => (
											<CourseCard
												key={course.id}
												course={course}
												onStatusUpdate={d.fetchDashboardData}
												showEnrollButton={true}
												onEnroll={() => {
													if (course.enrollmentCode) {
														d.setEnrollmentCode(course.enrollmentCode);
														d.setShowEnrollModal(true);
													}
												}}
											/>
										))
									) : (
										<S.NoCourses>
											<span>공개된 클래스가 없습니다.</span>
										</S.NoCourses>
									)}
								</S.CoursesGrid>
							</S.CoursesScrollContainer>
						</S.CoursesSection>
					</S.LeftColumn>

					<S.RightColumn>
						<S.Subsection>
							<S.SubsectionTitle>알림</S.SubsectionTitle>
							<S.ContentBox>
								{d.allNotifications.length > 0 ? (
									d.allNotifications.map(
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
								{d.allAssignments.length > 0 ? (
									d.allAssignments.map((assignment: Assignment) => {
										const dDay = d.calculateDDay(assignment.endDate);
										const isExpired = dDay !== null && dDay < 0;
										return (
											<S.AssignmentItem
												key={`${assignment.sectionId}-${assignment.id}`}
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
								{d.allNotices.length > 0 ? (
									d.allNotices.map((notice: Notice) => (
										<S.NoticeItem
											key={`${notice.sectionId}-${notice.id}`}
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
