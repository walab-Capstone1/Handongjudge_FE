import type React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Layout/Navbar";
import Breadcrumb from "../../components/Layout/Breadcrumb";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type {
	Section,
	MenuItem,
	ExpandedMenus,
	ExpandedSections,
	BreadcrumbItem,
} from "./types";

interface AdminLayoutProps {
	children: React.ReactNode;
	selectedSection?: Section | null;
}

const generateBreadcrumbs = (
	location: any,
	sections: Section[],
	currentSection: Section | null,
): BreadcrumbItem[] => {
	const pathnames = location.pathname.split("/").filter((x: string) => x);
	const breadcrumbItems: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

	let currentPath = "";
	pathnames.forEach((name: string, index: number) => {
		currentPath += `/${name}`;
		let label = name;
		let path = currentPath;

		if (name === "tutor") {
			label = "관리 페이지";
			path = "/tutor";
		} else if (name === "problems") {
			label = "문제 관리";
		} else if (name === "sets") {
			label = "문제집 관리";
		} else if (name === "settings") {
			label = "시스템 설정";
		} else if (name === "assignments" && pathnames[index - 1] === "tutor") {
			label = "과제 관리";
		} else if (name === "notices" && pathnames[index - 1] === "tutor") {
			label = "공지사항 관리";
		} else if (name === "users" && pathnames[index - 1] === "tutor") {
			label = "수강생 관리";
		} else if (name === "section" && pathnames[index + 1]) {
			const id = pathnames[index + 1];
			const section = sections.find((s) => s.sectionId === Number.parseInt(id));
			if (section) {
				label = `${section.courseTitle} ${section.sectionNumber}분반`;
				path = `/tutor/assignments/section/${id}`;
			} else {
				label = `Section ${id}`;
			}
		} else if (name === "progress" && pathnames[index - 1] === "assignments") {
			label = "풀이 현황";
		} else if (name === "create") {
			label = "생성";
		} else if (name === "edit" && pathnames[index - 1]) {
			label = "수정";
		}

		if (
			name !== "section" ||
			!pathnames[index + 1] ||
			isNaN(pathnames[index + 1])
		) {
			breadcrumbItems.push({ label, path });
		}
	});

	return breadcrumbItems;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
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
	const [showSectionMenu, setShowSectionMenu] = useState(false);
	const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({});
	const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
		{},
	);
	const [filterYear, setFilterYear] = useState<string>("ALL");
	const [filterSemester, setFilterSemester] = useState<string>("ALL");
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

	useEffect(() => {
		const fetchSections = async () => {
			try {
				const response = await APIService.getInstructorDashboard();
				const sectionsData: Section[] = response?.data || [];
				setSections(sectionsData);

				if (sectionIdFromUrl) {
					const found = sectionsData.find(
						(s) => s.sectionId === Number.parseInt(sectionIdFromUrl),
					);
					if (found) {
						setCurrentSection(found);
						setShowSectionMenu(true);
					}
				} else if (selectedSection) {
					setCurrentSection(selectedSection);
					setShowSectionMenu(true);
				}
			} catch (error) {
				console.error("수업 목록 조회 실패:", error);
			}
		};
		fetchSections();
	}, [sectionIdFromUrl, selectedSection]);

	const handleSectionSelect = (section: Section, e: React.MouseEvent) => {
		e.stopPropagation();
		const isCurrentlyExpanded = expandedSections[section.sectionId];
		setCurrentSection(section);
		setShowSectionMenu(true);
		setExpandedSections({
			[section.sectionId]: !isCurrentlyExpanded,
		});
		navigate(`/tutor/assignments/section/${section.sectionId}`);
	};

	const handleSectionToggle = (sectionId: number, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedSections((prev) => ({
			...prev,
			[sectionId]: !prev[sectionId],
		}));
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

	const globalMenuItems: MenuItem[] = [
		{ path: "/tutor", label: "대시보드", subItems: [] },
		{
			path: "/tutor/problems",
			label: "문제 관리",
			subItems: [
				{ path: "/tutor/problems", label: "문제 등록 및 관리", subItems: [] },
				{ path: "/tutor/problems/sets", label: "문제집 관리", subItems: [] },
			],
		},
		{ path: "/tutor/settings", label: "시스템 설정", subItems: [] },
	];

	const sectionMenuItems: MenuItem[] = currentSection
		? [
				{
					path: `/tutor/assignments/section/${currentSection.sectionId}`,
					label: "과제 관리",
					subItems: [
						{
							path: `/tutor/assignments/section/${currentSection.sectionId}`,
							label: "과제 목록",
							subItems: [],
						},
						{
							path: `/tutor/assignments/section/${currentSection.sectionId}/progress`,
							label: "과제별 풀이 현황",
							subItems: [],
						},
					],
				},
				{
					path: `/tutor/notices/section/${currentSection.sectionId}`,
					label: "공지사항 관리",
					subItems: [],
				},
				{
					path: `/tutor/users/section/${currentSection.sectionId}`,
					label: "수강생 관리",
					subItems: [],
				},
			]
		: [];

	return (
		<S.AdminLayoutContainer>
			<Navbar />
			<S.AdminContainer>
				<S.Sidebar $collapsed={sidebarCollapsed}>
					<S.SidebarHeader>
						<S.SidebarTitle $collapsed={sidebarCollapsed}>
							{sidebarCollapsed ? "" : "관리 페이지"}
						</S.SidebarTitle>
						<S.SidebarToggleBtn
							$collapsed={sidebarCollapsed}
							onClick={() => {
								setSidebarCollapsed(!sidebarCollapsed);
								if (!sidebarCollapsed) {
									setShowSectionMenu(false);
									setExpandedMenus({});
									setExpandedSections({});
								}
							}}
							title={sidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
						>
							{sidebarCollapsed ? "▶" : "◀"}
						</S.SidebarToggleBtn>
					</S.SidebarHeader>

					<S.SidebarNav $collapsed={sidebarCollapsed}>
						{globalMenuItems.map((item) => {
							const isActive =
								location.pathname === item.path ||
								location.pathname.startsWith(item.path + "/");
							const isExpanded =
								expandedMenus[item.path] ??
								(isActive && item.subItems.length > 0);

							return (
								<S.SidebarMenuGroup key={item.path}>
									<Link to={item.path} style={{ textDecoration: "none" }}>
										<S.SidebarItem
											$active={isActive}
											$collapsed={sidebarCollapsed}
											onClick={(e: React.MouseEvent) => {
												if (item.subItems.length > 0) {
													e.preventDefault();
													setExpandedMenus((prev) => ({
														...prev,
														[item.path]: !isExpanded,
													}));
												}
											}}
										>
											<S.SidebarLabel $collapsed={sidebarCollapsed}>
												{item.label}
											</S.SidebarLabel>
											{item.subItems.length > 0 && (
												<S.SidebarArrow
													$expanded={isExpanded}
													$collapsed={sidebarCollapsed}
												>
													▼
												</S.SidebarArrow>
											)}
										</S.SidebarItem>
									</Link>
									{item.subItems.length > 0 && (
										<S.SidebarSubmenu
											$expanded={isExpanded}
											$collapsed={sidebarCollapsed}
										>
											<div>
												{item.subItems.map((subItem) => (
													<Link
														key={subItem.path}
														to={subItem.path}
														style={{ textDecoration: "none" }}
													>
														<S.SidebarSubItem
															$active={location.pathname === subItem.path}
														>
															<S.SidebarLabel $collapsed={false}>
																{subItem.label}
															</S.SidebarLabel>
														</S.SidebarSubItem>
													</Link>
												))}
											</div>
										</S.SidebarSubmenu>
									)}
								</S.SidebarMenuGroup>
							);
						})}

						<S.SidebarDivider />

						<S.SidebarSectionSelector>
							<S.SidebarSectionHeader
								$collapsed={sidebarCollapsed}
								onClick={() => setShowSectionMenu(!showSectionMenu)}
							>
								<S.SidebarLabel $collapsed={sidebarCollapsed}>
									수업 선택
								</S.SidebarLabel>
								<S.SidebarArrow
									$expanded={showSectionMenu}
									$collapsed={sidebarCollapsed}
								>
									▼
								</S.SidebarArrow>
							</S.SidebarSectionHeader>

							{showSectionMenu && sections.length > 0 && (
								<S.SidebarSectionFilters $collapsed={sidebarCollapsed}>
									<S.SidebarFilterSelect
										value={filterYear}
										onChange={(e) => setFilterYear(e.target.value)}
										onClick={(e) => e.stopPropagation()}
									>
										<option value="ALL">모든 년도</option>
										{availableYears.map((year) => (
											<option key={year} value={year}>
												{year}년
											</option>
										))}
									</S.SidebarFilterSelect>
									<S.SidebarFilterSelect
										value={filterSemester}
										onChange={(e) => setFilterSemester(e.target.value)}
										onClick={(e) => e.stopPropagation()}
									>
										<option value="ALL">모든 구분</option>
										<option value="SPRING">1학기</option>
										<option value="SUMMER">여름학기</option>
										<option value="FALL">2학기</option>
										<option value="WINTER">겨울학기</option>
										<option value="CAMP">캠프</option>
										<option value="SPECIAL">특강</option>
										<option value="IRREGULAR">비정규 세션</option>
									</S.SidebarFilterSelect>
								</S.SidebarSectionFilters>
							)}

							{sections.length > 0 && (
								<S.SidebarSectionList
									$expanded={showSectionMenu}
									$collapsed={sidebarCollapsed}
								>
									<div>
										{filteredSections.map((section) => {
											const isSelected =
												currentSection?.sectionId === section.sectionId;
											const isExpanded =
												expandedSections[section.sectionId] ?? false;
											return (
												<div key={section.sectionId}>
													<S.SidebarSectionItem
														$active={isSelected}
														$collapsed={sidebarCollapsed}
														onClick={(e) => handleSectionSelect(section, e)}
													>
														<S.SectionItemContent>
															<S.SectionItemTitle $collapsed={sidebarCollapsed}>
																{section.courseTitle}
															</S.SectionItemTitle>
															<S.SectionItemSubtitle
																$collapsed={sidebarCollapsed}
															>
																{section.sectionNumber}분반 · {section.year}년{" "}
																{getSemesterLabel(section.semester)}
															</S.SectionItemSubtitle>
														</S.SectionItemContent>
														{isSelected && (
															<S.SidebarArrow
																$expanded={isExpanded}
																$collapsed={sidebarCollapsed}
																onClick={(e: React.MouseEvent) =>
																	handleSectionToggle(section.sectionId, e)
																}
															>
																▼
															</S.SidebarArrow>
														)}
													</S.SidebarSectionItem>

													{isSelected && (
														<S.SidebarSectionSubmenu
															$expanded={isExpanded}
															$collapsed={sidebarCollapsed}
														>
															<div>
																{sectionMenuItems.map((item) => {
																	const isActive =
																		location.pathname === item.path ||
																		location.pathname.startsWith(
																			item.path + "/",
																		);
																	const isExpanded =
																		expandedMenus[item.path] ??
																		(isActive && item.subItems.length > 0);

																	return (
																		<S.SidebarMenuGroup key={item.path}>
																			<Link
																				to={item.path}
																				style={{ textDecoration: "none" }}
																			>
																				<S.SidebarSubItem
																					$active={isActive}
																					onClick={(e: React.MouseEvent) => {
																						if (item.subItems.length > 0) {
																							e.preventDefault();
																							setExpandedMenus((prev) => ({
																								...prev,
																								[item.path]: !isExpanded,
																							}));
																						}
																					}}
																				>
																					<S.SidebarLabel $collapsed={false}>
																						{item.label}
																					</S.SidebarLabel>
																					{item.subItems.length > 0 && (
																						<S.SidebarArrow
																							$expanded={isExpanded}
																							$collapsed={false}
																						>
																							▼
																						</S.SidebarArrow>
																					)}
																				</S.SidebarSubItem>
																			</Link>
																			{item.subItems.length > 0 && (
																				<S.SidebarSubmenuNested
																					$expanded={isExpanded}
																				>
																					<div>
																						{item.subItems.map((subItem) => (
																							<Link
																								key={subItem.path}
																								to={subItem.path}
																								style={{
																									textDecoration: "none",
																								}}
																							>
																								<S.SidebarSubItemNested
																									$active={
																										location.pathname ===
																										subItem.path
																									}
																								>
																									<S.SidebarLabel
																										$collapsed={false}
																									>
																										{subItem.label}
																									</S.SidebarLabel>
																								</S.SidebarSubItemNested>
																							</Link>
																						))}
																					</div>
																				</S.SidebarSubmenuNested>
																			)}
																		</S.SidebarMenuGroup>
																	);
																})}
															</div>
														</S.SidebarSectionSubmenu>
													)}
												</div>
											);
										})}
									</div>
								</S.SidebarSectionList>
							)}
						</S.SidebarSectionSelector>
					</S.SidebarNav>
				</S.Sidebar>

				<S.Main>
					<Breadcrumb
						items={generateBreadcrumbs(location, sections, currentSection)}
					/>
					<S.Content>{children}</S.Content>
				</S.Main>
			</S.AdminContainer>
		</S.AdminLayoutContainer>
	);
};

export default AdminLayout;
