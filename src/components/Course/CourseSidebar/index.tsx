import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
	MdDashboard,
	MdAssignment,
	MdAnnouncement,
	MdNotifications,
	MdLogout,
	MdClose,
	MdForum,
	MdQuiz,
	MdSettings,
	MdClass,
} from "react-icons/md";
import APIService from "../../../services/APIService";
import * as S from "./styles";

interface MenuItem {
	id: string;
	label: string;
	path: string;
	icon: React.ComponentType<any>;
	type?: string;
}

interface Course {
	sectionId: number;
	courseTitle: string;
	sectionNumber: string;
}

interface CourseSidebarProps {
	sectionId?: number | string | null;
	activeMenu?: string;
	onMenuClick?: (menuId: string) => void;
	isCollapsed?: boolean;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
	sectionId,
	activeMenu = "대시보드",
	onMenuClick,
	isCollapsed = false,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout, user } = useAuth();
	const [showCourseList, setShowCourseList] = useState(false);
	const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
	const [loadingCourses, setLoadingCourses] = useState(false);
	/** 관리 중인 수업 sectionId 목록 (현재 수업에서 관리자인지 판단용) */
	const [managingSectionIds, setManagingSectionIds] = useState<number[]>([]);
	const [checkingManagingSections, setCheckingManagingSections] =
		useState(true);
	const courseListRef = useRef<HTMLDivElement>(null);

	const hasSectionId =
		sectionId !== null && sectionId !== undefined && Number(sectionId) > 0;
	const currentSectionIdNum = hasSectionId ? Number(sectionId) : 0;
	const isSuperAdmin = user?.role === "SUPER_ADMIN";
	/** 현재 수업에서 ADMIN/TUTOR일 때만 관리 페이지 표시 (SUPER_ADMIN은 항상 표시) */
	const showAdminLink =
		!checkingManagingSections &&
		(isSuperAdmin ||
			(managingSectionIds.length > 0 &&
				(!hasSectionId || managingSectionIds.includes(currentSectionIdNum))));

	useEffect(() => {
		const checkManagingSections = async () => {
			if (!user) {
				setManagingSectionIds([]);
				setCheckingManagingSections(false);
				return;
			}

			if (user.role === "SUPER_ADMIN") {
				setManagingSectionIds([]);
				setCheckingManagingSections(false);
				return;
			}

			try {
				const response = await APIService.getManagingSections();
				const data = response?.data ?? response;
				const list = Array.isArray(data) ? data : [];
				const ids = list
					.map((s: { sectionId?: number | string }) => {
						const id = s.sectionId;
						const num = typeof id === "string" ? Number.parseInt(id, 10) : id;
						return Number.isNaN(num) ? null : num;
					})
					.filter((id): id is number => id != null);
				setManagingSectionIds(ids);
			} catch {
				setManagingSectionIds([]);
			} finally {
				setCheckingManagingSections(false);
			}
		};

		checkManagingSections();
	}, [user]);

	const menuItems: MenuItem[] = [
		{
			id: "courses",
			label: "수업 선택",
			path: "#",
			icon: MdClass,
			type: "action",
		},
		{
			id: "dashboard",
			label: "대시보드",
			path: hasSectionId ? `/sections/${sectionId}/dashboard` : "/dashboard",
			icon: MdDashboard,
		},
		...(hasSectionId
			? [
					{
						id: "assignment",
						label: "과제",
						path: `/sections/${sectionId}/course-assignments`,
						icon: MdAssignment,
					},
					{
						id: "coding-quiz",
						label: "코딩 테스트",
						path: `/sections/${sectionId}/coding-quiz`,
						icon: MdQuiz,
					},
					{
						id: "notice",
						label: "공지사항",
						path: `/sections/${sectionId}/course-notices`,
						icon: MdAnnouncement,
					},
					{
						id: "community",
						label: "커뮤니티",
						path: `/sections/${sectionId}/community`,
						icon: MdForum,
					},
					{
						id: "notification",
						label: "알림",
						path: `/sections/${sectionId}/alarm`,
						icon: MdNotifications,
					},
				]
			: []),
		...(showAdminLink
			? [
					{
						id: "admin",
						label: "관리 페이지",
						path: "/tutor",
						icon: MdSettings,
					},
				]
			: []),
	];

	useEffect(() => {
		const fetchEnrolledCourses = async () => {
			if (showCourseList && enrolledCourses.length === 0) {
				try {
					setLoadingCourses(true);
					const response = await APIService.getUserEnrolledSections();
					setEnrolledCourses(response.data || response);
				} catch (error) {
					console.error("강의 목록 조회 실패:", error);
				} finally {
					setLoadingCourses(false);
				}
			}
		};
		fetchEnrolledCourses();
	}, [showCourseList, enrolledCourses.length]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				courseListRef.current &&
				!courseListRef.current.contains(event.target as Node)
			) {
				setShowCourseList(false);
			}
		};

		if (showCourseList) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showCourseList]);

	useEffect(() => {
		const handleEscKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setShowCourseList(false);
			}
		};

		if (showCourseList) {
			document.addEventListener("keydown", handleEscKey);
		}
		return () => {
			document.removeEventListener("keydown", handleEscKey);
		};
	}, [showCourseList]);

	const handleCourseSelect = (selectedSectionId: number) => {
		const currentPath = location.pathname;
		const newPath = currentPath.replace(
			/\/sections\/\d+/,
			`/sections/${selectedSectionId}`,
		);
		navigate(newPath);
		setShowCourseList(false);
	};

	return (
		<>
			<S.Sidebar
				$collapsed={isCollapsed}
				className={isCollapsed ? "collapsed" : ""}
			>
				<S.SidebarHeader onClick={() => !isCollapsed && navigate("/courses")}>
					<S.SidebarLogo src="/logo.svg" alt="H-CodeLab Logo" />
					{!isCollapsed && <S.SidebarTitle>H-CodeLab</S.SidebarTitle>}
				</S.SidebarHeader>

				<S.SidebarMenu>
					{menuItems.map((item, index) => {
						const IconComponent = item.icon;
						const isActive =
							item.id === "courses"
								? false
								: location.pathname.includes(
										item.id === "assignment"
											? "course-assignments"
											: item.id === "coding-quiz"
												? "coding-quiz"
												: item.id === "notice"
													? "course-notices"
													: item.id === "notification"
														? "alarm"
														: item.id,
									);
						const isSubMenu = item.id !== "dashboard" && item.id !== "courses";
						return (
							<S.MenuItem
								key={item.id}
								className={item.id === "admin" ? "admin-menu-item" : ""}
								$active={isActive}
								$isSubMenu={isSubMenu}
								$isAdmin={item.id === "admin"}
								$collapsed={isCollapsed}
								style={
									isSubMenu
										? {
												animationDelay: `${(index - 1) * 0.1}s`,
											}
										: {}
								}
								onClick={() => {
									if (item.type === "action" && item.id === "courses") {
										setShowCourseList(!showCourseList);
										return;
									}

									if (item.path && item.path !== "#") {
										navigate(item.path);
									}
									if (onMenuClick) {
										onMenuClick(item.id);
									}
								}}
								title={isCollapsed ? item.label : ""}
							>
								<IconComponent className="menu-icon" />
								{!isCollapsed && <S.MenuText>{item.label}</S.MenuText>}
							</S.MenuItem>
						);
					})}
				</S.SidebarMenu>

				<S.SidebarLogout
					onClick={async () => {
						try {
							await logout();
							navigate("/index");
						} catch (error) {
							console.error("로그아웃 실패:", error);
						}
					}}
					title={isCollapsed ? "로그아웃" : ""}
					$collapsed={isCollapsed}
				>
					<MdLogout className="menu-icon" />
					{!isCollapsed && <S.MenuText>로그아웃</S.MenuText>}
				</S.SidebarLogout>
			</S.Sidebar>

			{showCourseList && (
				<S.CourseListSidebar
					ref={courseListRef}
					$show={showCourseList}
					$collapsed={isCollapsed}
				>
					<S.CourseListHeader>
						<S.CourseListTitle>수업 선택</S.CourseListTitle>
						<S.CourseListClose onClick={() => setShowCourseList(false)}>
							<MdClose />
						</S.CourseListClose>
					</S.CourseListHeader>

					<S.CourseListContent>
						{loadingCourses ? (
							<S.CourseListLoading>로딩 중...</S.CourseListLoading>
						) : (
							enrolledCourses.map((course) => (
								<S.CourseListItem
									key={course.sectionId}
									$active={
										course.sectionId === Number.parseInt(String(sectionId))
									}
									onClick={() => handleCourseSelect(course.sectionId)}
								>
									<S.CourseListItemTitle>
										{course.courseTitle}
									</S.CourseListItemTitle>
								</S.CourseListItem>
							))
						)}
					</S.CourseListContent>
					<S.CourseListFooter>
						<S.CourseListLink
							type="button"
							onClick={() => {
								navigate("/courses");
								setShowCourseList(false);
							}}
						>
							전체 강의실 보기
						</S.CourseListLink>
					</S.CourseListFooter>
				</S.CourseListSidebar>
			)}
		</>
	);
};

export default CourseSidebar;
