import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
	MdDashboard,
	MdAssignment,
	MdAnnouncement,
	MdNotifications,
	MdLogout,
	MdForum,
	MdQuiz,
	MdSettings,
} from "react-icons/md";
import { FaGripLinesVertical, FaChevronRight, FaBars } from "react-icons/fa";
import APIService from "../../../services/APIService";
import * as S from "./styles";

interface MenuItem {
	id: string;
	label: string;
	path: string;
	icon: React.ComponentType<any>;
	type?: string;
}

interface CourseSidebarProps {
	sectionId?: number | string | null;
	activeMenu?: string;
	onMenuClick?: (menuId: string) => void;
	isCollapsed?: boolean;
	onToggleSidebar?: () => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
	sectionId,
	activeMenu = "대시보드",
	onMenuClick,
	isCollapsed = false,
	onToggleSidebar,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { logout, user } = useAuth();
	/** 관리 중인 수업 sectionId 목록 (현재 수업에서 관리자인지 판단용) */
	const [managingSectionIds, setManagingSectionIds] = useState<number[]>([]);
	const [checkingManagingSections, setCheckingManagingSections] =
		useState(true);

	const hasSectionId =
		sectionId !== null && sectionId !== undefined && Number(sectionId) > 0;
	const currentSectionIdNum = hasSectionId ? Number(sectionId) : 0;
	const isSuperAdmin = user?.role === "SUPER_ADMIN";
	/** 현재 수업에서만: 이 수업의 교수·튜터일 때만 관리 페이지 표시 (다른 수업에서 교수여도 이 수업에서 학생이면 숨김) */
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

	return (
		<>
			<S.Sidebar
				$collapsed={isCollapsed}
				className={isCollapsed ? "collapsed" : ""}
			>
				<S.SidebarHeader>
					<S.SidebarHeaderLeft onClick={() => !isCollapsed && navigate("/courses")}>
						{!isCollapsed && (
							<S.SidebarLogo src="/logo.svg" alt="H-CodeLab Logo" />
						)}
						{!isCollapsed && <S.SidebarTitle>H-CodeLab</S.SidebarTitle>}
					</S.SidebarHeaderLeft>
					{onToggleSidebar && (
						<S.SidebarToggleButton
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onToggleSidebar();
							}}
							aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
						>
							{isCollapsed ? (
								<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
									<FaGripLinesVertical style={{ fontSize: "0.9rem" }} />
									<FaChevronRight style={{ fontSize: "0.65rem" }} />
								</span>
							) : (
								<FaBars />
							)}
						</S.SidebarToggleButton>
					)}
				</S.SidebarHeader>

				<S.SidebarMenu>
					{menuItems.map((item, index) => {
						const IconComponent = item.icon;
						const isActive = location.pathname.includes(
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
						const isSubMenu = item.id !== "dashboard";
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
												animationDelay: `${index * 0.1}s`,
											}
										: {}
								}
								onClick={() => {
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
		</>
	);
};

export default CourseSidebar;
