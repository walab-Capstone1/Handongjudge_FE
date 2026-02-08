import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../recoil/atoms";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import CourseCard from "../../components/CourseCard";
import APIService from "../../services/APIService";
import { FaGripLinesVertical, FaChevronLeft } from "react-icons/fa";
import * as S from "./styles";
import type {
	SectionInfo,
	CourseCardData,
	Notice,
	Assignment,
	Notification,
	TransformedNotification,
	SectionNewItems,
} from "./types";
import { formatDate, formatDeadline, calculateDDay } from "./utils/dateUtils";
import { extractEnrollmentCode } from "./utils/enrollmentUtils";
import { transformSectionData, getRandomColor } from "./utils/sectionUtils";
import { transformNotification } from "./utils/notificationUtils";

const CourseDashboardPage: React.FC = () => {
	const navigate = useNavigate();
	const { sectionId: sectionIdParam } = useParams<{ sectionId?: string }>();
	const sectionId = sectionIdParam || null;
	const auth = useRecoilValue(authState);

	const [activeMenu, setActiveMenu] = useState("대시보드");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	// 데이터 상태
	const [enrolledSections, setEnrolledSections] = useState<SectionInfo[]>([]);
	const [allNotices, setAllNotices] = useState<Notice[]>([]);
	const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
	const [allNotifications, setAllNotifications] = useState<
		TransformedNotification[]
	>([]);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [sectionNewItems, setSectionNewItems] = useState<SectionNewItems>({});
	const [enrollmentCode, setEnrollmentCode] = useState("");
	const [enrollLoading, setEnrollLoading] = useState(false);
	const [showEnrollModal, setShowEnrollModal] = useState(false);

	// 관리 중인 수업 목록 (실제 API 호출)
	const [managingSections, setManagingSections] = useState<CourseCardData[]>(
		[],
	);

	// 더미 데이터: 공개된 클래스
	const [publicSections] = useState<CourseCardData[]>([
		{
			id: 997,
			title: "웹 프로그래밍 기초",
			subtitle: "강의 ID: WEB001",
			batch: "",
			courseName: "[웹 프로그래밍 기초]",
			status: [],
			instructor: "박교수",
			color: "purple",
			sectionId: 997,
			courseId: "WEB001",
			active: true,
			enrollmentCode: "WEB001-2024",
		},
		{
			id: 996,
			title: "머신러닝 입문",
			subtitle: "강의 ID: ML001",
			batch: "",
			courseName: "[머신러닝 입문]",
			status: [],
			instructor: "최교수",
			color: "orange",
			sectionId: 996,
			courseId: "ML001",
			active: true,
			enrollmentCode: "ML001-2024",
		},
		{
			id: 995,
			title: "컴퓨터 네트워크",
			subtitle: "강의 ID: NET001",
			batch: "",
			courseName: "[컴퓨터 네트워크]",
			status: [],
			instructor: "정교수",
			color: "red",
			sectionId: 995,
			courseId: "NET001",
			active: true,
			enrollmentCode: "NET001-2024",
		},
	]);

	useEffect(() => {
		if (auth.user) {
			fetchDashboardData();
			fetchManagingSections();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth.user, sectionId]);

	// 관리 중인 수업 목록 가져오기
	const fetchManagingSections = async () => {
		if (!auth?.user) return;

		try {
			const response = await APIService.getManagingSections();
			const sectionsData = response?.data || [];

			// SectionInfoDto를 CourseCard 형식으로 변환
			const transformed: CourseCardData[] = sectionsData.map(
				(section: any) => ({
					id: section.sectionId,
					sectionId: section.sectionId,
					title: section.sectionInfo?.courseTitle || "",
					subtitle: `${section.sectionInfo?.sectionNumber || ""}분반`,
					courseName: `[${section.sectionInfo?.courseTitle || ""}]`,
					instructor: section.sectionInfo?.instructorName || "",
					color: getRandomColor(section.sectionId),
					active: section.sectionInfo?.active !== false,
					status: [],
					courseId: section.sectionInfo?.courseId || "",
					_role: section.role,
					_isAdmin: section.role === "ADMIN",
				}),
			);

			setManagingSections(transformed);
		} catch (error) {
			console.error("관리 중인 수업 조회 실패:", error);
			setManagingSections([]);
		}
	};

	const fetchDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			// sectionId가 있으면 해당 수업 정보 조회
			if (sectionId) {
				try {
					const sectionResponse = await APIService.getSectionInfo(sectionId);
					const sectionData = sectionResponse.data || sectionResponse;
					setSectionInfo(sectionData);
				} catch (err) {
					console.error("수업 정보 조회 실패:", err);
				}
			} else {
				setSectionInfo(null);
			}

			// 모든 수업 조회
			const sectionsResponse = await APIService.getUserEnrolledSections();
			const sectionsData = sectionsResponse.data || sectionsResponse;
			setEnrolledSections(sectionsData);

			// 모든 수업의 공지사항, 과제, 알림 수집
			let noticesList: any[] = [];
			let assignmentsList: any[] = [];
			let notificationsList: Notification[] = [];
			const newSectionItems: SectionNewItems = {};

			// 각 수업별로 데이터 수집
			for (const section of sectionsData) {
				try {
					// 공지사항 조회
					const noticesResponse = await APIService.getSectionNotices(
						section.sectionId,
					);
					const notices = noticesResponse.data || noticesResponse;
					const noticesWithSection = notices.map((notice: any) => ({
						...notice,
						sectionId: section.sectionId,
						sectionName: section.courseTitle,
					}));
					noticesList = [...noticesList, ...noticesWithSection];

					// 과제 조회
					const assignmentsResponse = await APIService.getAssignmentsBySection(
						section.sectionId,
					);
					const assignments = assignmentsResponse.data || assignmentsResponse;
					const assignmentsWithSection = assignments.map((assignment: any) => ({
						...assignment,
						sectionId: section.sectionId,
						sectionName: section.courseTitle,
					}));
					assignmentsList = [...assignmentsList, ...assignmentsWithSection];

					// 알림 조회 (각 수업별)
					try {
						const notificationsResponse =
							await APIService.getCommunityNotifications(
								section.sectionId,
								0,
								50,
							);
						const notifications = notificationsResponse.data?.content || [];
						const notificationsWithSection = notifications.map(
							(notif: any) => ({
								...notif,
								sectionId: section.sectionId,
								sectionName: section.courseTitle,
							}),
						);
						notificationsList = [
							...notificationsList,
							...notificationsWithSection,
						];

						// 읽지 않은 새로운 과제/공지사항/알림 찾기
						const unreadNotifications = notifications.filter(
							(notif: any) => !notif.isRead,
						);
						const newAssignment = unreadNotifications.find(
							(notif: any) => notif.type === "ASSIGNMENT_CREATED",
						);
						const newNotice = unreadNotifications.find(
							(notif: any) => notif.type === "NOTICE_CREATED",
						);
						const otherNotifications = unreadNotifications.filter(
							(notif: any) =>
								notif.type !== "ASSIGNMENT_CREATED" &&
								notif.type !== "NOTICE_CREATED" &&
								(notif.type === "QUESTION_COMMENT" ||
									notif.type === "COMMENT_ACCEPTED" ||
									notif.type === "QUESTION_LIKED" ||
									notif.type === "COMMENT_LIKED"),
						);
						const newNotification =
							otherNotifications.length > 0 ? otherNotifications[0] : null;

						newSectionItems[section.sectionId] = {
							newAssignment: newAssignment
								? {
										id: newAssignment.id,
										assignmentId: newAssignment.assignmentId,
										title: newAssignment.assignmentTitle || "과제",
									}
								: null,
							newNotice: newNotice
								? {
										id: newNotice.id,
										noticeId: newNotice.noticeId,
										title: newNotice.noticeTitle || "공지사항",
									}
								: null,
							newNotification: newNotification
								? {
										id: newNotification.id,
										questionId: newNotification.questionId,
										type: newNotification.type,
										title: newNotification.message || "새 알림",
									}
								: null,
						};
					} catch (notifErr) {
						console.error(
							`수업 ${section.sectionId} 알림 조회 실패:`,
							notifErr,
						);
						newSectionItems[section.sectionId] = {
							newAssignment: null,
							newNotice: null,
							newNotification: null,
						};
					}
				} catch (err) {
					console.error(`수업 ${section.sectionId} 데이터 조회 실패:`, err);
					newSectionItems[section.sectionId] = {
						newAssignment: null,
						newNotice: null,
						newNotification: null,
					};
				}
			}

			// 공지사항 정렬: 최신 작성일 기준 내림차순
			const sortedNotices = noticesList
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, 5);

			// 과제 정렬: 마감일이 가까운 순, 마감된 과제는 하단으로
			const now = new Date();
			const activeAssignments = assignmentsList.filter(
				(a: any) => new Date(a.endDate) >= now,
			);
			const expiredAssignments = assignmentsList.filter(
				(a: any) => new Date(a.endDate) < now,
			);

			activeAssignments.sort(
				(a: any, b: any) =>
					new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
			);
			expiredAssignments.sort(
				(a: any, b: any) =>
					new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
			);

			const sortedAssignments = [
				...activeAssignments,
				...expiredAssignments,
			].slice(0, 5);

			// 알림 정렬: 최근 발생한 알림이 최상단
			const sortedNotifications = notificationsList
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, 5)
				.map(transformNotification);

			setAllNotices(sortedNotices);
			setAllAssignments(sortedAssignments);
			setAllNotifications(sortedNotifications);
			setSectionNewItems(newSectionItems);
		} catch (err: any) {
			console.error("대시보드 데이터 조회 실패:", err);
			setError(err.message || "데이터를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const handleMenuClick = (menuId: string) => {
		// 사이드바 메뉴 클릭 시 아무 동작도 하지 않음 (통합 대시보드이므로)
	};

	const handleNotificationClick = async (
		notification: TransformedNotification,
	) => {
		if (notification.link) {
			navigate(notification.link);

			if (notification.isNew && notification.id) {
				try {
					await APIService.markCommunityNotificationAsRead(notification.id);
					fetchDashboardData();
				} catch (err) {
					console.error("알림 읽음 처리 실패:", err);
				}
			}
		}
	};

	const handleNoticeClick = (notice: Notice) => {
		navigate(`/sections/${notice.sectionId}/course-notices/${notice.id}`);
	};

	const handleAssignmentClick = (assignment: Assignment) => {
		navigate(
			`/sections/${assignment.sectionId}/course-assignments?assignmentId=${assignment.id}`,
		);
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	const handleEnrollByCode = async () => {
		if (!enrollmentCode.trim()) {
			alert("참가 코드를 입력하세요.");
			return;
		}

		const code = extractEnrollmentCode(enrollmentCode);

		if (!code) {
			alert("유효한 참가 코드나 링크를 입력하세요.");
			return;
		}

		if (!auth.user) {
			sessionStorage.setItem("pendingEnrollmentCode", code);
			setShowEnrollModal(false);
			setEnrollmentCode("");
			navigate("/login", {
				state: {
					redirectTo: `/enroll/${code}`,
					message: "수업 참가를 위해 로그인이 필요합니다.",
				},
			});
			return;
		}

		try {
			setEnrollLoading(true);
			const resp = await APIService.enrollByCode(code);
			if (resp && resp.success) {
				alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
				setEnrollmentCode("");
				setShowEnrollModal(false);
				fetchDashboardData();
			} else {
				alert(resp?.message || "수강 신청에 실패했습니다.");
			}
		} catch (e: any) {
			alert(e.message || "수강 신청 중 오류가 발생했습니다.");
		} finally {
			setEnrollLoading(false);
		}
	};

	const transformedSections: CourseCardData[] = enrolledSections.map(
		(section) => transformSectionData(section, sectionNewItems),
	);

	if (loading) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId ? Number.parseInt(sectionId) : null}
					activeMenu={activeMenu}
					onMenuClick={handleMenuClick}
					isCollapsed={isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (error) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId ? Number.parseInt(sectionId) : null}
					activeMenu={activeMenu}
					onMenuClick={handleMenuClick}
					isCollapsed={isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<S.ErrorMessage>
						<p>{error}</p>
						<button onClick={fetchDashboardData}>다시 시도</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId ? Number.parseInt(sectionId) : null}
				activeMenu={activeMenu}
				onMenuClick={handleMenuClick}
				isCollapsed={isSidebarCollapsed}
			/>

			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionId
							? sectionInfo?.courseTitle
								? sectionInfo.sectionNumber
									? `${sectionInfo.courseTitle} ${sectionInfo.sectionNumber}분반`
									: `${sectionInfo.courseTitle}`
								: "수업 대시보드"
							: "전체 수업 대시보드"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
					sectionId={sectionId}
				/>

				<S.DashboardBody>
					<S.LeftColumn>
						<S.ProfileSection>
							<S.ProfileAvatar
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/blBC3g5kkQ/pe2v4bz8_expires_30_days.png"
								alt="User Avatar"
							/>
							<S.ProfileGreeting>
								{auth.user?.name || "사용자"}님, 반가워요!
							</S.ProfileGreeting>
						</S.ProfileSection>

						{/* 참여한 수업 목록 */}
						<S.CoursesSection>
							<S.SectionHeader>
								<S.SectionTitle>참여한 수업 목록</S.SectionTitle>
								<S.JoinClassBtn onClick={() => setShowEnrollModal(true)}>
									+ 수업 참가
								</S.JoinClassBtn>
							</S.SectionHeader>
							<S.CoursesScrollContainer>
								<S.CoursesGrid>
									{transformedSections.length > 0 ? (
										transformedSections.map((course) => (
											<CourseCard
												key={course.id}
												course={course}
												onStatusUpdate={fetchDashboardData}
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

						{/* 관리 중인 수업 목록 */}
						<S.CoursesSection>
							<S.SectionHeader>
								<S.SectionTitle>관리 중인 수업 목록</S.SectionTitle>
								<S.CreateCourseBtn onClick={() => navigate("/tutor/courses")}>
									+ 수업 만들기
								</S.CreateCourseBtn>
							</S.SectionHeader>
							<S.CoursesScrollContainer>
								<S.CoursesGrid>
									{managingSections.length > 0 ? (
										managingSections.map((course) => (
											<CourseCard
												key={course.id}
												course={course}
												onStatusUpdate={fetchDashboardData}
												onEnroll={() =>
													navigate(
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

						{/* 공개된 클래스 */}
						<S.CoursesSection>
							<S.SectionHeader>
								<S.SectionTitle>공개된 클래스</S.SectionTitle>
							</S.SectionHeader>
							<S.CoursesScrollContainer>
								<S.CoursesGrid>
									{publicSections.length > 0 ? (
										publicSections.map((course) => (
											<CourseCard
												key={course.id}
												course={course}
												onStatusUpdate={fetchDashboardData}
												showEnrollButton={true}
												onEnroll={() => {
													if (course.enrollmentCode) {
														setEnrollmentCode(course.enrollmentCode);
														setShowEnrollModal(true);
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

					{/* 우측 컬럼: 알림 / 과제 / 공지사항 */}
					<S.RightColumn>
						{/* 알림 섹션 */}
						<S.Subsection>
							<S.SubsectionTitle>알림</S.SubsectionTitle>
							<S.ContentBox>
								{allNotifications.length > 0 ? (
									allNotifications.map((notification) => (
										<S.NotificationItem
											key={notification.id}
											$isNew={notification.isNew}
											onClick={() => handleNotificationClick(notification)}
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
									))
								) : (
									<S.NoContent>
										<span>새로운 알림이 없습니다.</span>
									</S.NoContent>
								)}
							</S.ContentBox>
						</S.Subsection>

						{/* 과제 섹션 */}
						<S.Subsection>
							<S.SubsectionTitle>과제</S.SubsectionTitle>
							<S.ContentBox>
								{allAssignments.length > 0 ? (
									allAssignments.map((assignment) => {
										const dDay = calculateDDay(assignment.endDate);
										const isExpired = dDay !== null && dDay < 0;

										return (
											<S.AssignmentItem
												key={`${assignment.sectionId}-${assignment.id}`}
												$isExpired={isExpired}
												onClick={() => handleAssignmentClick(assignment)}
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

						{/* 공지사항 섹션 */}
						<S.Subsection>
							<S.SubsectionTitle>공지사항</S.SubsectionTitle>
							<S.ContentBox>
								{allNotices.length > 0 ? (
									allNotices.map((notice) => (
										<S.NoticeItem
											key={`${notice.sectionId}-${notice.id}`}
											$isNew={notice.isNew}
											onClick={() => handleNoticeClick(notice)}
										>
											<S.NoticeHeader>
												{notice.isNew && <S.NewBadge>NEW</S.NewBadge>}
												<S.NoticeTitle>{notice.title}</S.NoticeTitle>
												{notice.sectionName && (
													<S.NoticeSection>
														{notice.sectionName}
													</S.NoticeSection>
												)}
												{notice.date && (
													<S.NoticeDate>{notice.date}</S.NoticeDate>
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

			{/* 수업 참가 모달 */}
			{showEnrollModal && (
				<S.EnrollModalOverlay onClick={() => setShowEnrollModal(false)}>
					<S.EnrollModal onClick={(e) => e.stopPropagation()}>
						<S.EnrollModalHeader>
							<h2>수업 참가</h2>
							<S.EnrollModalClose
								type="button"
								onClick={() => setShowEnrollModal(false)}
								aria-label="닫기"
							>
								<FaGripLinesVertical style={{ fontSize: "0.9rem" }} />
								<FaChevronLeft style={{ fontSize: "0.65rem" }} />
							</S.EnrollModalClose>
						</S.EnrollModalHeader>
						<S.EnrollModalBody>
							<label>참가 코드 또는 링크</label>
							<S.EnrollInput
								type="text"
								placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
								value={enrollmentCode}
								onChange={(e) => setEnrollmentCode(e.target.value)}
							/>
							<S.EnrollHelpText>
								참가 코드만 입력하거나 전체 링크를 붙여넣으세요.
							</S.EnrollHelpText>
						</S.EnrollModalBody>
						<S.EnrollModalActions>
							<S.EnrollCancelBtn onClick={() => setShowEnrollModal(false)}>
								취소
							</S.EnrollCancelBtn>
							<S.EnrollSubmitBtn
								onClick={handleEnrollByCode}
								disabled={enrollLoading}
							>
								{enrollLoading ? "처리 중..." : "참가하기"}
							</S.EnrollSubmitBtn>
						</S.EnrollModalActions>
					</S.EnrollModal>
				</S.EnrollModalOverlay>
			)}
		</S.Container>
	);
};

export default CourseDashboardPage;
