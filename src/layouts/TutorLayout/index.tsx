import type React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import TutorHeader from "../../components/Tutor/TutorHeader";
import TutorNotificationPanel from "../../components/Tutor/TutorNotificationPanel";
import APIService from "../../services/APIService";
import {
	FaHome,
	FaBook,
	FaTasks,
	FaBullhorn,
	FaUsers,
	FaCog,
	FaChevronDown,
	FaChevronRight,
	FaBars,
	FaGripLinesVertical,
	FaEdit,
	FaFolder,
	FaList,
	FaChartLine,
	FaPlus,
	FaComments,
	FaBell,
	FaChartBar,
	FaArrowLeft,
	FaCode,
	FaChevronLeft,
} from "react-icons/fa";
import * as S from "./styles";
import type { Section, MenuItem, ExpandedMenus } from "./types";

interface TutorLayoutProps {
	children: React.ReactNode;
	selectedSection?: any;
}

const TutorLayout: React.FC<TutorLayoutProps> = ({
	children,
	selectedSection = null,
}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams<{ sectionId?: string }>();

	const [sections, setSections] = useState<Section[]>([]);
	const [currentSection, setCurrentSection] = useState<Section | null>(
		selectedSection,
	);
	const [showSectionModal, setShowSectionModal] = useState(false);
	const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>(() => {
		const saved = localStorage.getItem("tutor_expandedMenus");
		return saved ? JSON.parse(saved) : {};
	});
	const [filterYear, setFilterYear] = useState<string>("ALL");
	const [filterSemester, setFilterSemester] = useState<string>("ALL");
	const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
		const saved = localStorage.getItem("tutor_sidebarCollapsed");
		return saved === "true";
	});

	useEffect(() => {
		localStorage.setItem("tutor_expandedMenus", JSON.stringify(expandedMenus));
	}, [expandedMenus]);

	const sectionIdFromUrl =
		params.sectionId || location.pathname.match(/\/section\/(\d+)/)?.[1];

	const getSemesterLabel = (semester: string): string => {
		switch (semester) {
			case "SPRING":
				return "1학기";
			case "SUMMER":
				return "여름학기";
			case "FALL":
				return "2학기";
			case "WINTER":
				return "겨울학기";
			default:
				return "1학기";
		}
	};

	const getCompactSemesterInfo = (year: number, semester: string): string => {
		const semesterNum =
			semester === "SPRING"
				? "1"
				: semester === "FALL"
					? "2"
					: semester === "SUMMER"
						? "S"
						: semester === "WINTER"
							? "W"
							: "1";
		return `${year}-${semesterNum}`;
	};

	useEffect(() => {
		const fetchSections = async () => {
			try {
				const response = await APIService.getManagingSections();
				const sectionsData = response?.data || [];

				const transformedSections: Section[] = sectionsData.map(
					(section: any) => ({
						sectionId: section.sectionId,
						courseTitle: section.sectionInfo?.courseTitle || "",
						sectionNumber: section.sectionInfo?.sectionNumber || "",
						year: section.sectionInfo?.year || new Date().getFullYear(),
						semester: section.sectionInfo?.semester || "SPRING",
						instructor: section.sectionInfo?.instructorName || "",
						_role: section.role,
						_isAdmin: section.role === "ADMIN",
					}),
				);

				setSections(transformedSections);

				const requiresSectionId =
					location.pathname.includes("/section/") ||
					location.pathname.match(/\/tutor\/(assignments|notices|users)(\/|$)/);

				const lastSelectedSectionId = localStorage.getItem(
					"tutor_lastSelectedSectionId",
				);

				if (sectionIdFromUrl) {
					const found = transformedSections.find(
						(s) => s.sectionId === Number.parseInt(sectionIdFromUrl),
					);
					if (found) {
						setCurrentSection(found);
						localStorage.setItem(
							"tutor_lastSelectedSectionId",
							found.sectionId.toString(),
						);
					}
				} else if (selectedSection) {
					setCurrentSection(selectedSection);
					localStorage.setItem(
						"tutor_lastSelectedSectionId",
						selectedSection.sectionId.toString(),
					);
				} else if (lastSelectedSectionId) {
					const found = transformedSections.find(
						(s) => s.sectionId === Number.parseInt(lastSelectedSectionId),
					);
					if (found) {
						setCurrentSection(found);
						if (requiresSectionId && !sectionIdFromUrl) {
							if (
								location.pathname === "/tutor" ||
								location.pathname === "/tutor/"
							) {
								navigate(`/tutor/assignments/section/${found.sectionId}`, {
									replace: true,
								});
							} else if (
								location.pathname.match(
									/\/tutor\/(assignments|notices|users)(\/|$)/,
								)
							) {
								const basePath = location.pathname.replace(
									/\/section\/\d+/,
									"",
								);
								navigate(`${basePath}/section/${found.sectionId}`, {
									replace: true,
								});
							}
						}
					}
				}
			} catch (error) {
				console.error("수업 목록 조회 실패:", error);
			}
		};
		fetchSections();
	}, [sectionIdFromUrl, selectedSection, location.pathname, navigate]);

	useEffect(() => {
		if (showSectionModal) {
			document.body.classList.add("section-modal-open");

			setTimeout(() => {
				const activeElement = document.activeElement as HTMLElement;
				if (
					activeElement &&
					(activeElement.tagName === "INPUT" ||
						activeElement.tagName === "TEXTAREA")
				) {
					activeElement.blur();
				}
				const searchInputs = document.querySelectorAll(".tutor-search-input");
				searchInputs.forEach((input) => {
					(input as HTMLElement).blur();
				});
			}, 0);
		} else {
			document.body.classList.remove("section-modal-open");
		}
	}, [showSectionModal]);

	const handleSectionSelect = (section: Section) => {
		if (currentSection?.sectionId === section.sectionId) {
			handleSectionClear();
			setShowSectionModal(false);
			return;
		}

		setCurrentSection(section);
		setShowSectionModal(false);
		localStorage.setItem(
			"tutor_lastSelectedSectionId",
			section.sectionId.toString(),
		);

		const currentPath = location.pathname;
		if (currentPath.includes("/section/")) {
			const newPath = currentPath.replace(
				/\/section\/\d+/,
				`/section/${section.sectionId}`,
			);
			navigate(newPath);
		} else {
			navigate(`/tutor/assignments/section/${section.sectionId}`);
		}
	};

	const handleSectionClear = () => {
		setCurrentSection(null);
		localStorage.removeItem("tutor_lastSelectedSectionId");

		const currentPath = location.pathname;
		if (currentPath.includes("/section/")) {
			if (
				currentPath.includes("/assignments") ||
				currentPath.includes("/notices") ||
				currentPath.includes("/users")
			) {
				navigate("/tutor/problems");
			}
		}
	};

	const filteredSections = sections.filter((section) => {
		const yearMatch =
			filterYear === "ALL" || section.year === Number.parseInt(filterYear);
		const semesterMatch =
			filterSemester === "ALL" || section.semester === filterSemester;
		return yearMatch && semesterMatch;
	});

	const availableYears = [...new Set(sections.map((s) => s.year))].sort(
		(a, b) => b - a,
	);

	const mainMenuItems = useMemo<MenuItem[]>(
		() => [
			{
				path: "/dashboard",
				label: "강의로 돌아가기",
				icon: FaArrowLeft,
				subItems: [],
				isBackLink: true,
			},
			{
				path: "/tutor",
				label: "대시보드",
				icon: FaHome,
				subItems: [],
			},

			{
				path: "/tutor/problems",
				label: "문제 관리",
				icon: FaBook,
				subItems: [
					{
						path: "/tutor/problems",
						label: "문제 등록 및 관리",
						icon: FaEdit,
						subItems: [],
					},
					{
						path: "/tutor/problems/sets",
						label: "문제집 관리",
						icon: FaFolder,
						subItems: [],
					},
				],
			},
		],
		[],
	);

	const handleMenuClick = useCallback(
		(item: MenuItem, isExpanded: boolean, e: React.MouseEvent) => {
			if (sidebarCollapsed && item.subItems.length > 0) {
				e.preventDefault();
				setExpandedMenus((prev) => ({
					...prev,
					[item.path]: !isExpanded,
				}));
				return;
			}

			if (item.subItems.length > 0) {
				e.preventDefault();
				setExpandedMenus((prev) => ({
					...prev,
					[item.path]: !isExpanded,
				}));
			}
		},
		[sidebarCollapsed],
	);

	const settingsMenuItems = useMemo<MenuItem[]>(
		() => [
			{
				path: "/tutor/settings",
				label: "시스템 설정",
				icon: FaCog,
				subItems: [],
			},
		],
		[],
	);

	const sectionMenuItems = useMemo<MenuItem[]>(() => {
		if (!currentSection) return [];

		const sectionData = sections.find(
			(s) => s.sectionId === currentSection.sectionId,
		);
		const isAdmin = sectionData?._isAdmin || false;

		const baseMenus: MenuItem[] = [
			{
				path: `/tutor/assignments/section/${currentSection.sectionId}`,
				label: "과제 관리",
				icon: FaTasks,
				subItems: [
					{
						path: `/tutor/assignments/section/${currentSection.sectionId}`,
						label: "과제 목록",
						icon: FaList,
						subItems: [],
					},
					{
						path: `/tutor/assignments/section/${currentSection.sectionId}/progress`,
						label: "과제별 풀이 현황",
						icon: FaChartLine,
						subItems: [],
					},
				],
			},
			{
				path: `/tutor/coding-tests/section/${currentSection.sectionId}`,
				label: "코딩 테스트 관리",
				icon: FaCode,
				subItems: [],
			},
			{
				path: `/tutor/notices/section/${currentSection.sectionId}`,
				label: "공지사항 관리",
				icon: FaBullhorn,
				subItems: [],
			},
			{
				path: `/sections/${currentSection.sectionId}/community`,
				label: "커뮤니티 관리",
				icon: FaComments,
				subItems: [],
			},
			{
				path: `/tutor/users/section/${currentSection.sectionId}`,
				label: "수강생 관리",
				icon: FaUsers,
				subItems: [],
			},
			{
				path: `/tutor/grades/section/${currentSection.sectionId}`,
				label: "성적 관리",
				icon: FaChartBar,
				subItems: [],
			},
			{
				path: `/tutor/notifications/section/${currentSection.sectionId}`,
				label: "수업 알림",
				icon: FaBell,
				subItems: [],
			},
			{
				path: `/tutor/stats/section/${currentSection.sectionId}`,
				label: "수업 통계",
				icon: FaChartBar,
				subItems: [],
			},
		];

		return baseMenus;
	}, [currentSection, sections]);

	const renderMenuItem = (item: MenuItem, isSection = false) => {
		const Icon = item.icon;
		let isActive: boolean;

		if (item.path === "/tutor") {
			isActive =
				location.pathname === "/tutor" || location.pathname === "/tutor/";
		} else {
			isActive =
				location.pathname === item.path ||
				(location.pathname.startsWith(item.path + "/") &&
					!location.pathname.startsWith("/tutor/courses") &&
					!location.pathname.startsWith("/tutor/settings"));
		}

		const isExpanded =
			expandedMenus[item.path] !== undefined
				? expandedMenus[item.path]
				: isActive && item.subItems.length > 0;

		return (
			<S.SidebarMenuGroup key={item.path} $collapsed={sidebarCollapsed}>
				<Link
					to={item.path}
					style={{ textDecoration: "none" }}
					onClick={(e) => handleMenuClick(item, isExpanded, e)}
				>
					<S.SidebarItem
						$active={isActive}
						$collapsed={sidebarCollapsed}
						$isBackLink={item.isBackLink}
						data-tooltip={sidebarCollapsed ? item.label : undefined}
					>
						<S.SidebarIcon $collapsed={sidebarCollapsed} $active={isActive}>
							<Icon />
						</S.SidebarIcon>
						<S.SidebarLabel $collapsed={sidebarCollapsed}>
							{item.label}
						</S.SidebarLabel>
						{item.subItems.length > 0 && (
							<S.SidebarArrow
								$expanded={isExpanded}
								$collapsed={sidebarCollapsed}
							>
								<FaChevronDown />
							</S.SidebarArrow>
						)}
					</S.SidebarItem>
				</Link>

				{item.subItems.length > 0 && (
					<>
						{!sidebarCollapsed && (
							<S.SidebarSubmenu
								$expanded={isExpanded}
								$collapsed={sidebarCollapsed}
							>
								<div>
									{item.subItems.map((subItem) => {
										const SubIcon = subItem.icon || item.icon;
										return (
											<Link
												key={subItem.path}
												to={subItem.path}
												style={{ textDecoration: "none" }}
											>
												<S.SidebarSubItem
													$active={location.pathname === subItem.path}
												>
													<SubIcon className="sidebar-sub-icon" />
													<S.SidebarLabel $collapsed={false}>
														{subItem.label}
													</S.SidebarLabel>
												</S.SidebarSubItem>
											</Link>
										);
									})}
								</div>
							</S.SidebarSubmenu>
						)}
						{sidebarCollapsed && isExpanded && (
							<S.SidebarSubmenuCollapsed>
								{item.subItems.map((subItem) => {
									const SubIcon = subItem.icon || item.icon;
									return (
										<Link
											key={subItem.path}
											to={subItem.path}
											style={{ textDecoration: "none" }}
										>
											<S.SidebarSubItemCollapsed
												$active={location.pathname === subItem.path}
												data-tooltip={subItem.label}
											>
												<S.SidebarIcon $collapsed={true}>
													<SubIcon className="sidebar-icon" />
												</S.SidebarIcon>
											</S.SidebarSubItemCollapsed>
										</Link>
									);
								})}
							</S.SidebarSubmenuCollapsed>
						)}
					</>
				)}
			</S.SidebarMenuGroup>
		);
	};

	return (
		<S.TutorLayoutContainer $sidebarCollapsed={sidebarCollapsed}>
			<S.NavigationWrapper>
				<TutorHeader />
				<S.Sidebar $collapsed={sidebarCollapsed}>
					<S.SidebarNav $collapsed={sidebarCollapsed}>
						<S.SidebarScrollable $collapsed={sidebarCollapsed}>
							<S.SidebarHeader $collapsed={sidebarCollapsed}>
								<S.SidebarHeaderLeft $collapsed={sidebarCollapsed}>
									<S.SidebarTitle $collapsed={sidebarCollapsed}>
										관리 페이지
									</S.SidebarTitle>
								</S.SidebarHeaderLeft>
								<S.SidebarToggleBtn
									$collapsed={sidebarCollapsed}
									onClick={() => {
										const newState = !sidebarCollapsed;
										setSidebarCollapsed(newState);
										localStorage.setItem(
											"tutor_sidebarCollapsed",
											newState.toString(),
										);
									}}
									title={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
									aria-label={
										sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"
									}
								>
									{sidebarCollapsed ? (
										<span
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<FaBars />
										</span>
									) : (
										<span
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
											}}
										>
											<FaGripLinesVertical style={{ fontSize: "0.9rem" }} />
											<FaChevronLeft style={{ fontSize: "0.65rem" }} />
										</span>
									)}
								</S.SidebarToggleBtn>
							</S.SidebarHeader>

							<S.SidebarDivider $collapsed={sidebarCollapsed} />

							<S.SidebarSection $collapsed={sidebarCollapsed}>
								<S.SidebarSectionTitle $collapsed={sidebarCollapsed}>
									주요 기능
								</S.SidebarSectionTitle>
								{mainMenuItems.map((item) => renderMenuItem(item))}
							</S.SidebarSection>

							<S.SidebarDivider $collapsed={sidebarCollapsed} />

							<S.SidebarSection $collapsed={sidebarCollapsed}>
								<S.SidebarSectionTitle $collapsed={sidebarCollapsed}>
									수업 선택
								</S.SidebarSectionTitle>
								<S.SectionCard $collapsed={sidebarCollapsed}>
									{currentSection ? (
										<S.SectionCardContent>
											<S.SectionCardHeader>
												<S.SectionCardTitle $collapsed={sidebarCollapsed}>
													{currentSection.courseTitle}
												</S.SectionCardTitle>
												<S.SectionCardBadge $collapsed={sidebarCollapsed}>
													{getCompactSemesterInfo(
														currentSection.year,
														currentSection.semester,
													)}
												</S.SectionCardBadge>
											</S.SectionCardHeader>
											<S.SectionCardActions $collapsed={sidebarCollapsed}>
												<S.SectionChangeBtn
													$collapsed={sidebarCollapsed}
													onClick={() => {
														if (
															document.activeElement &&
															(document.activeElement as HTMLElement).blur
														) {
															(document.activeElement as HTMLElement).blur();
														}
														setShowSectionModal(true);
													}}
													title={sidebarCollapsed ? "수업 변경" : ""}
												>
													{sidebarCollapsed ? <FaCog /> : "수업 변경"}
												</S.SectionChangeBtn>
											</S.SectionCardActions>
										</S.SectionCardContent>
									) : (
										<S.SectionCardContent $empty>
											<S.SectionCardEmptyText $collapsed={sidebarCollapsed}>
												수업을 선택해주세요
											</S.SectionCardEmptyText>
											<S.SectionCardActions $collapsed={sidebarCollapsed}>
												<S.SectionChangeBtn
													$collapsed={sidebarCollapsed}
													onClick={() => {
														if (
															document.activeElement &&
															(document.activeElement as HTMLElement).blur
														) {
															(document.activeElement as HTMLElement).blur();
														}
														setShowSectionModal(true);
													}}
													title={sidebarCollapsed ? "수업 선택" : ""}
												>
													{sidebarCollapsed ? <FaCog /> : "수업 선택"}
												</S.SectionChangeBtn>
											</S.SectionCardActions>
										</S.SectionCardContent>
									)}
								</S.SectionCard>
							</S.SidebarSection>

							{currentSection && sectionMenuItems.length > 0 && (
								<S.SidebarSectionMenuWrapper $visible={true}>
									<div>
										<S.SidebarDivider $collapsed={sidebarCollapsed} />
										<S.SidebarSection $collapsed={sidebarCollapsed}>
											<S.SidebarSectionTitle $collapsed={sidebarCollapsed}>
												수업 관리
											</S.SidebarSectionTitle>
											{sectionMenuItems.map((item) =>
												renderMenuItem(item, true),
											)}
										</S.SidebarSection>
									</div>
								</S.SidebarSectionMenuWrapper>
							)}
						</S.SidebarScrollable>

						<S.SidebarSettingsMenu $collapsed={sidebarCollapsed}>
							<S.SidebarSectionTitle $collapsed={sidebarCollapsed}>
								설정
							</S.SidebarSectionTitle>
							{settingsMenuItems.map((item) => renderMenuItem(item))}
						</S.SidebarSettingsMenu>
					</S.SidebarNav>
				</S.Sidebar>
			</S.NavigationWrapper>

			<S.Main $sidebarCollapsed={sidebarCollapsed}>
				<S.Content>{children}</S.Content>
			</S.Main>

			<TutorNotificationPanel />

			{showSectionModal && (
				<S.SectionModalOverlay
					onClick={() => {
						if (
							document.activeElement &&
							(document.activeElement as HTMLElement).blur
						) {
							(document.activeElement as HTMLElement).blur();
						}
						setShowSectionModal(false);
					}}
				>
					<S.SectionModalContent onClick={(e) => e.stopPropagation()}>
						<S.SectionModalHeader>
							<h3>수업 선택</h3>
							<S.SectionModalClose
								onClick={() => {
									if (
										document.activeElement &&
										(document.activeElement as HTMLElement).blur
									) {
										(document.activeElement as HTMLElement).blur();
									}
									setShowSectionModal(false);
								}}
							>
								×
							</S.SectionModalClose>
						</S.SectionModalHeader>
						<S.SectionModalBody>
							<S.SectionModalFilters>
								<S.SectionModalFilterSelect
									value={filterYear}
									onChange={(e) => setFilterYear(e.target.value)}
								>
									<option value="ALL">모든 년도</option>
									{availableYears.map((year) => (
										<option key={year} value={year}>
											{year}년
										</option>
									))}
								</S.SectionModalFilterSelect>
								<S.SectionModalFilterSelect
									value={filterSemester}
									onChange={(e) => setFilterSemester(e.target.value)}
								>
									<option value="ALL">모든 구분</option>
									<option value="SPRING">1학기</option>
									<option value="SUMMER">여름학기</option>
									<option value="FALL">2학기</option>
									<option value="WINTER">겨울학기</option>
									<option value="CAMP">캠프</option>
									<option value="SPECIAL">특강</option>
									<option value="IRREGULAR">비정규 세션</option>
								</S.SectionModalFilterSelect>
							</S.SectionModalFilters>
							<S.SectionModalList>
								{filteredSections.length > 0 ? (
									filteredSections.map((section) => {
										const isSelected =
											currentSection?.sectionId === section.sectionId;
										return (
											<S.SectionModalItem
												key={section.sectionId}
												$selected={isSelected}
												onClick={() => handleSectionSelect(section)}
											>
												<S.SectionModalItemContent>
													<S.SectionModalItemTitle>
														{section.courseTitle}
													</S.SectionModalItemTitle>
													<S.SectionModalItemSubtitle>
														{section.year}년{" "}
														{getSemesterLabel(section.semester)}
													</S.SectionModalItemSubtitle>
												</S.SectionModalItemContent>
												{isSelected && (
													<S.SectionModalCheck>✓</S.SectionModalCheck>
												)}
											</S.SectionModalItem>
										);
									})
								) : (
									<S.SectionModalEmpty>
										조건에 맞는 수업이 없습니다.
									</S.SectionModalEmpty>
								)}
							</S.SectionModalList>
						</S.SectionModalBody>
					</S.SectionModalContent>
				</S.SectionModalOverlay>
			)}
		</S.TutorLayoutContainer>
	);
};

export default TutorLayout;
