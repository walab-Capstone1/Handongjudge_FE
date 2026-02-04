import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import * as S from "./styles";

interface Section {
	sectionId: number;
	courseTitle: string;
	year: number;
	semester: string;
	studentCount: number;
	noticeCount: number;
	active: boolean;
	createdAt: string;
	instructorName?: string;
}

interface FormData {
	courseId: string;
	courseTitle: string;
	description: string;
	year: number | string;
	semester: string;
}

interface CopyFormData {
	sourceSectionId: string;
	courseTitle: string;
	description: string;
	year: number | string;
	semester: string;
	copyNotices: boolean;
	copyAssignments: boolean;
	selectedNoticeIds: number[];
	selectedAssignmentIds: number[];
	assignmentProblems: Record<number, number[]>;
	noticeEdits: Record<number, { title?: string; content?: string }>;
	assignmentEdits: Record<number, { title?: string; description?: string }>;
	problemEdits: Record<number, { title?: string }>;
}

interface Notice {
	id: number;
	title: string;
	content: string;
	createdAt: string;
}

interface Problem {
	id: number;
	title: string;
}

interface Assignment {
	id: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	problems: Problem[];
}

interface Course {
	id: number;
	title: string;
}

const CourseManagement: React.FC = () => {
	const navigate = useNavigate();
	const [sections, setSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterYear, setFilterYear] = useState("ALL");
	const [filterSemester, setFilterSemester] = useState("ALL");
	const [filterStatus, setFilterStatus] = useState("ALL");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		courseId: "",
		courseTitle: "",
		description: "",
		year: new Date().getFullYear(),
		semester: "SPRING",
	});
	const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
	const [showCopyModal, setShowCopyModal] = useState(false);
	const [copyFormData, setCopyFormData] = useState<CopyFormData>({
		sourceSectionId: "",
		courseTitle: "",
		description: "",
		year: new Date().getFullYear(),
		semester: "SPRING",
		copyNotices: true,
		copyAssignments: true,
		selectedNoticeIds: [],
		selectedAssignmentIds: [],
		assignmentProblems: {},
		noticeEdits: {},
		assignmentEdits: {},
		problemEdits: {},
	});
	const [sourceNotices, setSourceNotices] = useState<Notice[]>([]);
	const [sourceAssignments, setSourceAssignments] = useState<Assignment[]>([]);
	const [loadingNotices, setLoadingNotices] = useState(false);
	const [loadingAssignments, setLoadingAssignments] = useState(false);
	const [expandedAssignments, setExpandedAssignments] = useState<
		Record<number, boolean>
	>({});
	const [copyStep, setCopyStep] = useState(1);
	const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);
	const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(
		null,
	);
	const [editingProblemId, setEditingProblemId] = useState<number | null>(null);
	const [viewingNoticeId, setViewingNoticeId] = useState<number | null>(null);
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

	useEffect(() => {
		fetchSections();
		fetchAvailableCourses();
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				openDropdownId &&
				!(event.target as Element).closest(".dropdown-container")
			) {
				setOpenDropdownId(null);
			}
		};

		if (openDropdownId) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [openDropdownId]);

	const fetchAvailableCourses = async () => {
		try {
			const courses = await APIService.getCourses();
			setAvailableCourses(courses || []);
		} catch (error) {
			console.error("강의 목록 조회 실패:", error);
			setAvailableCourses([]);
		}
	};

	const handleCreateSection = async () => {
		try {
			let courseId: number;
			if (formData.courseId) {
				courseId = Number.parseInt(formData.courseId);
			} else if (formData.courseTitle) {
				const courseResponse = await APIService.createCourse({
					title: formData.courseTitle,
					description: formData.description || "",
				});
				courseId = courseResponse.id;
			} else {
				alert("강의를 선택하거나 새 강의 제목을 입력해주세요.");
				return;
			}

			await APIService.createSection({
				courseId: courseId,
				instructorId: await APIService.getCurrentUserId(),
				sectionNumber: null,
				year: Number.parseInt(String(formData.year)),
				semester: formData.semester,
			});

			alert("수업이 성공적으로 생성되었습니다!");
			setShowCreateModal(false);
			setFormData({
				courseId: "",
				courseTitle: "",
				description: "",
				year: new Date().getFullYear(),
				semester: "SPRING",
			});
			fetchSections();
		} catch (error: any) {
			console.error("수업 생성 실패:", error);
			alert(error.message || "수업 생성에 실패했습니다.");
		}
	};

	const fetchSections = async () => {
		try {
			setLoading(true);
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			setSections(sectionsData);
			setLoading(false);
		} catch (error) {
			setSections([]);
			setLoading(false);
		}
	};

	const handleToggleActive = async (
		sectionId: number,
		currentActive: boolean,
	) => {
		try {
			const newActiveStatus = !currentActive;
			await APIService.toggleSectionActive(sectionId, newActiveStatus);
			alert(
				newActiveStatus
					? "수업이 활성화되었습니다."
					: "수업이 비활성화되었습니다.",
			);
			fetchSections();
		} catch (error: any) {
			console.error("수업 상태 변경 실패:", error);
			alert(error.message || "수업 상태 변경에 실패했습니다.");
		}
	};

	const handleDeleteSection = async (
		sectionId: number,
		sectionTitle: string,
	) => {
		if (
			!window.confirm(`정말로 분반 "${sectionTitle}"을(를) 삭제하시겠습니까?`)
		) {
			return;
		}

		try {
			await APIService.deleteSection(sectionId);
			alert("분반이 삭제되었습니다.");
			fetchSections();
		} catch (error: any) {
			console.error("분반 삭제 실패:", error);
			alert(error.message || "분반 삭제에 실패했습니다.");
		}
	};

	const getSemesterLabel = (semester: string) => {
		switch (semester) {
			case "SPRING":
				return "1학기";
			case "SUMMER":
				return "여름학기";
			case "FALL":
				return "2학기";
			case "WINTER":
				return "겨울학기";
			case "CAMP":
				return "캠프";
			case "SPECIAL":
				return "특강";
			case "IRREGULAR":
				return "비정규 세션";
			default:
				return semester || "";
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
	};

	const handleSourceSectionChange = async (sectionId: string) => {
		setCopyFormData({
			...copyFormData,
			sourceSectionId: sectionId,
			selectedNoticeIds: [],
			selectedAssignmentIds: [],
			assignmentProblems: {},
			noticeEdits: {},
			assignmentEdits: {},
			problemEdits: {},
		});
		setExpandedAssignments({});

		if (sectionId) {
			try {
				setLoadingNotices(true);
				const notices = await APIService.getSectionNotices(
					Number.parseInt(sectionId),
				);
				const noticesData = notices?.data || notices || [];
				setSourceNotices(noticesData);

				setLoadingAssignments(true);
				const assignments = await APIService.getAssignmentsBySection(
					Number.parseInt(sectionId),
				);
				const assignmentsData = assignments?.data || assignments || [];

				const assignmentsWithProblems = await Promise.all(
					assignmentsData.map(async (assignment: any) => {
						try {
							const problems = await APIService.getAssignmentProblems(
								Number.parseInt(sectionId),
								assignment.id,
							);
							return {
								...assignment,
								problems: problems || [],
							};
		} catch (error) {
							console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
							return { ...assignment, problems: [] };
						}
					}),
				);

				setSourceAssignments(assignmentsWithProblems);

				setCopyFormData((prev) => ({
					...prev,
					sourceSectionId: sectionId,
					selectedNoticeIds: [],
					selectedAssignmentIds: [],
					assignmentProblems: {},
				}));
			} catch (error) {
				console.error("데이터 조회 실패:", error);
				setSourceNotices([]);
				setSourceAssignments([]);
		} finally {
				setLoadingNotices(false);
				setLoadingAssignments(false);
			}
		} else {
			setSourceNotices([]);
			setSourceAssignments([]);
		}
	};

	const handleNoticeToggle = (noticeId: number) => {
		setCopyFormData((prev) => {
			const isSelected = prev.selectedNoticeIds.includes(noticeId);
			return {
				...prev,
				selectedNoticeIds: isSelected
					? prev.selectedNoticeIds.filter((id) => id !== noticeId)
					: [...prev.selectedNoticeIds, noticeId],
			};
		});
	};

	const handleSelectAllNotices = () => {
		if (copyFormData.selectedNoticeIds.length === sourceNotices.length) {
			setCopyFormData((prev) => ({ ...prev, selectedNoticeIds: [] }));
		} else {
			setCopyFormData((prev) => ({
				...prev,
				selectedNoticeIds: sourceNotices.map((n) => n.id),
			}));
		}
	};

	const handleNoticeEdit = (noticeId: number, field: string, value: string) => {
		setCopyFormData((prev) => {
			const edits = prev.noticeEdits[noticeId] || {};
			return {
				...prev,
				noticeEdits: {
					...prev.noticeEdits,
					[noticeId]: { ...edits, [field]: value },
				},
			};
		});
	};

	const handleAssignmentToggle = (assignmentId: number) => {
		setCopyFormData((prev) => {
			const isSelected = prev.selectedAssignmentIds.includes(assignmentId);
			if (isSelected) {
				const newAssignmentProblems = { ...prev.assignmentProblems };
				delete newAssignmentProblems[assignmentId];
				return {
					...prev,
					selectedAssignmentIds: prev.selectedAssignmentIds.filter(
						(id) => id !== assignmentId,
					),
					assignmentProblems: newAssignmentProblems,
				};
			}
			const assignment = sourceAssignments.find((a) => a.id === assignmentId);
			return {
				...prev,
				selectedAssignmentIds: [...prev.selectedAssignmentIds, assignmentId],
				assignmentProblems: {
					...prev.assignmentProblems,
					[assignmentId]: assignment?.problems.map((p) => p.id) || [],
				},
			};
		});
	};

	const handleSelectAllAssignments = () => {
		if (
			copyFormData.selectedAssignmentIds.length === sourceAssignments.length
		) {
			setCopyFormData((prev) => ({
				...prev,
				selectedAssignmentIds: [],
				assignmentProblems: {},
			}));
		} else {
			const allAssignmentProblems: Record<number, number[]> = {};
			sourceAssignments.forEach((assignment) => {
				allAssignmentProblems[assignment.id] = assignment.problems.map(
					(p) => p.id,
				);
			});
			setCopyFormData((prev) => ({
				...prev,
				selectedAssignmentIds: sourceAssignments.map((a) => a.id),
				assignmentProblems: allAssignmentProblems,
			}));
		}
	};

	const handleAssignmentEdit = (
		assignmentId: number,
		field: string,
		value: string,
	) => {
		setCopyFormData((prev) => {
			const edits = prev.assignmentEdits[assignmentId] || {};
			return {
				...prev,
				assignmentEdits: {
					...prev.assignmentEdits,
					[assignmentId]: { ...edits, [field]: value },
				},
			};
		});
	};

	const toggleAssignmentExpand = (assignmentId: number) => {
		setExpandedAssignments((prev) => ({
			...prev,
			[assignmentId]: !prev[assignmentId],
		}));
	};

	const handleProblemToggle = (assignmentId: number, problemId: number) => {
		setCopyFormData((prev) => {
			const currentProblems = prev.assignmentProblems[assignmentId] || [];
			const isSelected = currentProblems.includes(problemId);

			return {
				...prev,
				assignmentProblems: {
					...prev.assignmentProblems,
					[assignmentId]: isSelected
						? currentProblems.filter((id) => id !== problemId)
						: [...currentProblems, problemId],
				},
			};
		});
	};

	const handleSelectAllProblems = (assignmentId: number) => {
		const assignment = sourceAssignments.find((a) => a.id === assignmentId);
		if (!assignment) return;

		const currentProblems = copyFormData.assignmentProblems[assignmentId] || [];
		const allProblems = assignment.problems.map((p) => p.id);

		setCopyFormData((prev) => ({
			...prev,
			assignmentProblems: {
				...prev.assignmentProblems,
				[assignmentId]:
					currentProblems.length === allProblems.length ? [] : allProblems,
			},
		}));
	};

	const handleProblemEdit = (problemId: number, title: string) => {
		setCopyFormData((prev) => ({
			...prev,
			problemEdits: {
				...prev.problemEdits,
				[problemId]: { title },
			},
		}));
	};

	const handleCopySection = async () => {
		try {
			if (!copyFormData.sourceSectionId) {
				alert("복사할 수업을 선택해주세요.");
				return;
			}

			if (!copyFormData.courseTitle) {
				alert("새 수업 제목을 입력해주세요.");
				return;
			}

			const response = await APIService.copySection(
				Number.parseInt(copyFormData.sourceSectionId),
				null,
				Number.parseInt(String(copyFormData.year)),
				copyFormData.semester,
				copyFormData.courseTitle,
				copyFormData.description || "",
				copyFormData.copyNotices,
				copyFormData.copyAssignments,
				copyFormData.copyNotices ? copyFormData.selectedNoticeIds : [],
				copyFormData.copyAssignments ? copyFormData.selectedAssignmentIds : [],
				copyFormData.copyAssignments ? copyFormData.assignmentProblems : {},
				copyFormData.noticeEdits,
				copyFormData.assignmentEdits,
				copyFormData.problemEdits,
			);

			if (response.success) {
				alert("수업이 성공적으로 복사되었습니다!");
				setShowCopyModal(false);
				setCopyStep(1);
				setCopyFormData({
					sourceSectionId: "",
					courseTitle: "",
					description: "",
					year: new Date().getFullYear(),
					semester: "SPRING",
					copyNotices: true,
					copyAssignments: true,
					selectedNoticeIds: [],
					selectedAssignmentIds: [],
					assignmentProblems: {},
					noticeEdits: {},
					assignmentEdits: {},
					problemEdits: {},
				});
				setSourceNotices([]);
				setSourceAssignments([]);
				setExpandedAssignments({});
				setEditingNoticeId(null);
				setEditingAssignmentId(null);
				setEditingProblemId(null);
				fetchSections();
			} else {
				alert(response.message || "수업 복사에 실패했습니다.");
			}
		} catch (error: any) {
			console.error("수업 복사 실패:", error);
			alert(error.message || "수업 복사에 실패했습니다.");
		}
	};

	const availableYears = [
		...new Set(sections.map((s) => s.year).filter(Boolean)),
	].sort((a, b) => b - a);

	const filteredSections = sections.filter((section) => {
		const matchesSearch =
			!searchTerm ||
			section.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(section.instructorName &&
				section.instructorName
					.toLowerCase()
					.includes(searchTerm.toLowerCase()));

		const matchesYear =
			filterYear === "ALL" || section.year === Number.parseInt(filterYear);

		const matchesSemester =
			filterSemester === "ALL" || section.semester === filterSemester;

		const matchesStatus =
			filterStatus === "ALL" ||
			(filterStatus === "ACTIVE" && section.active !== false) ||
			(filterStatus === "INACTIVE" && section.active === false);

		return matchesSearch && matchesYear && matchesSemester && matchesStatus;
	});

	if (loading) {
		return (
			<TutorLayout>
				<S.Container>
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<S.LoadingText>수업 정보를 불러오는 중...</S.LoadingText>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.Container>
				<S.TitleHeader>
					<S.TitleLeft>
						<S.Title>수업 관리</S.Title>
						<S.TitleStats>
							<S.StatBadge>총 {sections.length}개 분반</S.StatBadge>
							<S.StatBadge>표시 {filteredSections.length}개</S.StatBadge>
						</S.TitleStats>
					</S.TitleLeft>
					<S.TitleRight>
						<S.CopyButton onClick={() => setShowCopyModal(true)}>
							기존 수업 복사
						</S.CopyButton>
						<S.CreateButton onClick={() => setShowCreateModal(true)}>
							+ 새 수업 만들기
						</S.CreateButton>
					</S.TitleRight>
				</S.TitleHeader>

				<S.FiltersSection>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="수업명, 교수명으로 검색..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</S.SearchBox>

					<S.FilterGroup>
						<S.FilterSelect
							value={filterYear}
							onChange={(e) => setFilterYear(e.target.value)}
						>
							<option value="ALL">전체 년도</option>
							{availableYears.map((year) => (
								<option key={year} value={year}>
									{year}년
								</option>
							))}
						</S.FilterSelect>
					</S.FilterGroup>

					<S.FilterGroup>
						<S.FilterSelect
							value={filterSemester}
							onChange={(e) => setFilterSemester(e.target.value)}
						>
							<option value="ALL">전체 학기</option>
							<option value="SPRING">1학기</option>
							<option value="SUMMER">여름학기</option>
							<option value="FALL">2학기</option>
							<option value="WINTER">겨울학기</option>
							<option value="CAMP">캠프</option>
							<option value="SPECIAL">특강</option>
							<option value="IRREGULAR">비정규 세션</option>
						</S.FilterSelect>
					</S.FilterGroup>

					<S.FilterGroup>
						<S.FilterSelect
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
						>
							<option value="ALL">전체 상태</option>
							<option value="ACTIVE">활성</option>
							<option value="INACTIVE">비활성</option>
						</S.FilterSelect>
					</S.FilterGroup>
				</S.FiltersSection>

				<S.SectionsGrid>
					{filteredSections.map((section) => (
						<S.CourseCard key={section.sectionId}>
							<S.CardHeader>
								<S.CardTitle>{section.courseTitle}</S.CardTitle>
								<S.StatusBadge $active={section.active !== false}>
									{section.active !== false ? "활성" : "비활성"}
								</S.StatusBadge>
							</S.CardHeader>

							<S.StatsCompact>
								<S.StatItem>
									<S.StatLabel>학생</S.StatLabel>
									<S.StatValue>{section.studentCount || 0}명</S.StatValue>
								</S.StatItem>
								<S.StatItem>
									<S.StatLabel>공지</S.StatLabel>
									<S.StatValue>{section.noticeCount || 0}개</S.StatValue>
								</S.StatItem>
								<S.StatItem>
									<S.StatLabel>학기</S.StatLabel>
									<S.StatValue>
										{section.year || new Date().getFullYear()}년{" "}
										{getSemesterLabel(section.semester)}
									</S.StatValue>
								</S.StatItem>
								{section.createdAt && (
									<S.StatItem>
										<S.StatLabel>생성일</S.StatLabel>
										<S.StatValue>{formatDate(section.createdAt)}</S.StatValue>
									</S.StatItem>
								)}
							</S.StatsCompact>

							<S.ActionsCompact>
								<S.ToggleButton
									$active={section.active !== false}
									onClick={() =>
										handleToggleActive(
											section.sectionId,
											section.active !== false,
										)
									}
									title={
										section.active !== false ? "비활성화하기" : "활성화하기"
									}
								>
									{section.active !== false ? "활성" : "비활성"}
								</S.ToggleButton>
								<S.ActionButtonsCompact>
												<S.ActionButton
													onClick={() =>
											navigate(`/tutor/notices/section/${section.sectionId}`)
													}
										title="공지사항"
												>
										공지
												</S.ActionButton>
									<S.ActionButton
										onClick={() =>
											navigate(`/tutor/users/section/${section.sectionId}`)
										}
										title="학생 관리"
									>
										학생
									</S.ActionButton>
									<S.ActionButton
										onClick={() =>
											navigate(`/tutor/grades/section/${section.sectionId}`)
										}
										title="성적 관리"
									>
										성적
									</S.ActionButton>
									<S.ActionButton
										$primary
										onClick={() =>
											navigate(
												`/tutor/assignments/section/${section.sectionId}`,
											)
										}
										title="과제 관리"
									>
										과제
									</S.ActionButton>
									<S.DropdownContainer className="dropdown-container">
										<S.DropdownToggle
											onClick={(e) => {
												e.stopPropagation();
												setOpenDropdownId(
													openDropdownId === section.sectionId
														? null
														: section.sectionId,
												);
											}}
											title="더보기"
										>
											⋯
										</S.DropdownToggle>
										{openDropdownId === section.sectionId && (
											<S.DropdownMenu>
												<S.DropdownItem
													$delete
													onClick={(e) => {
														e.stopPropagation();
														setOpenDropdownId(null);
														handleDeleteSection(
															section.sectionId,
															section.courseTitle,
														);
													}}
												>
													삭제
												</S.DropdownItem>
											</S.DropdownMenu>
										)}
									</S.DropdownContainer>
								</S.ActionButtonsCompact>
							</S.ActionsCompact>
							</S.CourseCard>
						))}
				</S.SectionsGrid>

				{filteredSections.length === 0 && (
					<S.NoSections>
						<p>
							{searchTerm ||
							filterYear !== "ALL" ||
							filterSemester !== "ALL" ||
							filterStatus !== "ALL"
								? "검색 조건에 맞는 수업이 없습니다."
								: "담당하고 있는 수업이 없습니다."}
						</p>
					</S.NoSections>
				)}

				{/* 수업 생성 모달 */}
				{showCreateModal && (
					<S.ModalOverlay onClick={() => setShowCreateModal(false)}>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>새 수업 만들기</h2>
								<S.ModalClose onClick={() => setShowCreateModal(false)}>
									×
								</S.ModalClose>
							</S.ModalHeader>

							<S.ModalBody>
								<S.FormGroup>
									<label>강의 선택 또는 새 강의 제목 입력</label>
									<S.FormSelect
										value={formData.courseId}
										onChange={(e) =>
											setFormData({
												...formData,
												courseId: e.target.value,
												courseTitle: "",
											})
										}
									>
										<option value="">새 강의 만들기</option>
										{availableCourses.map((course) => (
											<option key={course.id} value={course.id}>
												{course.title}
											</option>
										))}
									</S.FormSelect>
								</S.FormGroup>

								{!formData.courseId && (
									<>
										<S.FormGroup>
											<label>새 강의 제목</label>
											<S.FormInput
												type="text"
												value={formData.courseTitle}
												onChange={(e) =>
													setFormData({
														...formData,
														courseTitle: e.target.value,
													})
												}
												placeholder="예: 자바프로그래밍"
											/>
										</S.FormGroup>
										<S.FormGroup>
											<label>수업 설명</label>
											<S.FormTextarea
												value={formData.description}
												onChange={(e) =>
													setFormData({
														...formData,
														description: e.target.value,
													})
												}
												placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
												rows={3}
											/>
										</S.FormGroup>
									</>
								)}

								<S.FormRow>
									<S.FormGroup>
										<label>년도</label>
										<S.FormInput
											type="number"
											value={formData.year}
											onChange={(e) =>
												setFormData({ ...formData, year: e.target.value })
											}
											placeholder="2025"
											min="2020"
											max="2099"
										/>
									</S.FormGroup>

									<S.FormGroup>
										<label>구분</label>
										<S.FormSelect
											value={formData.semester}
											onChange={(e) =>
												setFormData({ ...formData, semester: e.target.value })
											}
										>
											<option value="SPRING">1학기</option>
											<option value="SUMMER">여름학기</option>
											<option value="FALL">2학기</option>
											<option value="WINTER">겨울학기</option>
											<option value="CAMP">캠프</option>
											<option value="SPECIAL">특강</option>
											<option value="IRREGULAR">비정규 세션</option>
										</S.FormSelect>
									</S.FormGroup>
								</S.FormRow>
							</S.ModalBody>

							<S.ModalFooter>
								<S.BtnCancel onClick={() => setShowCreateModal(false)}>
									취소
								</S.BtnCancel>
								<S.BtnSubmit
									onClick={handleCreateSection}
									disabled={!formData.courseId && !formData.courseTitle}
								>
									생성하기
								</S.BtnSubmit>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 수업 복사 모달 */}
				{showCopyModal && (
					<S.ModalOverlay
						onClick={() => {
							setShowCopyModal(false);
							setCopyStep(1);
							setEditingNoticeId(null);
							setEditingAssignmentId(null);
							setEditingProblemId(null);
						}}
					>
						<S.ModalContent
							$large={copyStep > 1}
							onClick={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2>기존 수업 복사</h2>
								<S.ModalClose
									onClick={() => {
										setShowCopyModal(false);
										setCopyStep(1);
										setEditingNoticeId(null);
										setEditingAssignmentId(null);
										setEditingProblemId(null);
									}}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>

							<S.ModalBody $large={copyStep > 1}>
								{/* 1단계: 기본 정보 */}
								{copyStep === 1 && (
									<S.StepContent>
										<S.StepTitle>1단계: 기본 정보 입력</S.StepTitle>

										<S.FormGroup>
											<label>복사할 수업 선택 *</label>
											<S.FormSelect
												value={copyFormData.sourceSectionId}
												onChange={(e) =>
													handleSourceSectionChange(e.target.value)
												}
											>
												<option value="">수업을 선택하세요</option>
												{sections.map((section) => (
													<option
														key={section.sectionId}
														value={section.sectionId}
													>
														{section.courseTitle} ({section.year || "2024"}년{" "}
														{getSemesterLabel(section.semester)})
													</option>
												))}
											</S.FormSelect>
										</S.FormGroup>

										<S.FormGroup>
											<label>새 수업 제목 *</label>
											<S.FormInput
												type="text"
												value={copyFormData.courseTitle}
												onChange={(e) =>
													setCopyFormData({
														...copyFormData,
														courseTitle: e.target.value,
													})
												}
												placeholder="예: 자바프로그래밍"
											/>
										</S.FormGroup>

										<S.FormGroup>
											<label>수업 설명</label>
											<S.FormTextarea
												value={copyFormData.description}
												onChange={(e) =>
													setCopyFormData({
														...copyFormData,
														description: e.target.value,
													})
												}
												placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
												rows={4}
											/>
										</S.FormGroup>

										<S.FormRow>
											<S.FormGroup>
												<label>년도 *</label>
												<S.FormInput
													type="number"
													value={copyFormData.year}
													onChange={(e) =>
														setCopyFormData({
															...copyFormData,
															year: e.target.value,
														})
													}
													placeholder="2025"
													min="2020"
													max="2099"
												/>
											</S.FormGroup>

											<S.FormGroup>
												<label>구분 *</label>
												<S.FormSelect
													value={copyFormData.semester}
													onChange={(e) =>
														setCopyFormData({
															...copyFormData,
															semester: e.target.value,
														})
													}
												>
													<option value="SPRING">1학기</option>
													<option value="SUMMER">여름학기</option>
													<option value="FALL">2학기</option>
													<option value="WINTER">겨울학기</option>
													<option value="CAMP">캠프</option>
													<option value="SPECIAL">특강</option>
													<option value="IRREGULAR">비정규 세션</option>
												</S.FormSelect>
											</S.FormGroup>
										</S.FormRow>

										<S.FormGroup>
											<S.CheckboxLabel $large>
												<input
													type="checkbox"
													checked={copyFormData.copyNotices}
													onChange={(e) =>
														setCopyFormData({
															...copyFormData,
															copyNotices: e.target.checked,
														})
													}
												/>
												<S.CheckboxContent>
													<S.CheckboxTitle>공지사항 복사</S.CheckboxTitle>
													<S.CheckboxDescription>
														복사할 공지사항을 선택할 수 있습니다
													</S.CheckboxDescription>
												</S.CheckboxContent>
											</S.CheckboxLabel>
										</S.FormGroup>

										<S.FormGroup>
											<S.CheckboxLabel $large>
												<input
													type="checkbox"
													checked={copyFormData.copyAssignments}
													onChange={(e) =>
														setCopyFormData({
															...copyFormData,
															copyAssignments: e.target.checked,
														})
													}
												/>
												<S.CheckboxContent>
													<S.CheckboxTitle>과제 및 문제 복사</S.CheckboxTitle>
													<S.CheckboxDescription>
														복사할 과제와 문제를 선택할 수 있습니다
													</S.CheckboxDescription>
												</S.CheckboxContent>
											</S.CheckboxLabel>
										</S.FormGroup>
									</S.StepContent>
								)}

								{/* 2단계: 공지사항 선택 및 수정 */}
								{copyStep === 2 && (
									<S.StepContent>
										<S.StepTitle>2단계: 공지사항 선택 및 수정</S.StepTitle>
										<S.StepDescription>
											가져올 공지사항을 선택하고 제목/내용을 수정할 수 있습니다.
											<S.StepHighlight>
												선택하지 않은 공지사항은 복사되지 않습니다.
											</S.StepHighlight>
										</S.StepDescription>

										{loadingNotices ? (
											<S.LoadingItems>공지사항을 불러오는 중...</S.LoadingItems>
										) : sourceNotices.length === 0 ? (
											<S.NoItems>가져올 공지사항이 없습니다.</S.NoItems>
										) : (
											<S.SelectionBoxLarge>
												<S.SelectionHeader>
													<S.CheckboxLabel>
														<input
															type="checkbox"
															checked={
																copyFormData.selectedNoticeIds.length ===
																	sourceNotices.length &&
																sourceNotices.length > 0
															}
															onChange={handleSelectAllNotices}
														/>
														<span>전체 선택</span>
													</S.CheckboxLabel>
													<S.ItemCount>
														{copyFormData.selectedNoticeIds.length} /{" "}
														{sourceNotices.length}개 선택됨
													</S.ItemCount>
												</S.SelectionHeader>

												<S.ItemListLarge $compact>
													{sourceNotices.map((notice) => {
														const isSelected =
															copyFormData.selectedNoticeIds.includes(
																notice.id,
															);
														const isEditing = editingNoticeId === notice.id;
														const editData =
															copyFormData.noticeEdits[notice.id] || {};
														const displayTitle = editData.title || notice.title;

														return (
															<S.ListItemLarge
																key={notice.id}
																$selected={isSelected}
															>
																{isEditing ? (
																	<S.EditForm $inline>
																		<S.EditInput
																			type="text"
																			value={editData.title || notice.title}
																			onChange={(e) =>
																				handleNoticeEdit(
																					notice.id,
																					"title",
																					e.target.value,
																				)
																			}
																			placeholder="제목"
																		/>
																		<S.EditTextarea
																			value={editData.content || notice.content}
																			onChange={(e) =>
																				handleNoticeEdit(
																					notice.id,
																					"content",
																					e.target.value,
																				)
																			}
																			placeholder="내용"
																			rows={4}
																		/>
																		<S.EditFormActions>
																			<S.BtnSaveEdit
																				onClick={(e) => {
																					e.stopPropagation();
																					setEditingNoticeId(null);
																				}}
																			>
																				저장
																			</S.BtnSaveEdit>
																			<S.BtnCancel
																				onClick={(e) => {
																					e.stopPropagation();
																					setEditingNoticeId(null);
																				}}
																			>
																				취소
																			</S.BtnCancel>
																		</S.EditFormActions>
																	</S.EditForm>
																) : (
																	<>
																		<S.CheckboxLabel $item>
																			<input
																				type="checkbox"
																				checked={isSelected}
																				onChange={() =>
																					handleNoticeToggle(notice.id)
																				}
																			/>
																			<S.ItemInfo>
																				<S.ItemTitleLarge>
																					{displayTitle}
																				</S.ItemTitleLarge>
																				<S.ItemMeta>
																					{new Date(
																						notice.createdAt,
																					).toLocaleDateString("ko-KR")}
																				</S.ItemMeta>
																			</S.ItemInfo>
																		</S.CheckboxLabel>
																		<S.BtnView
																			onClick={(e) => {
																				e.stopPropagation();
																				setViewingNoticeId(notice.id);
																			}}
																			title="공지사항 내용 보기"
																		>
																			조회
																		</S.BtnView>
																	</>
																)}
															</S.ListItemLarge>
														);
													})}
												</S.ItemListLarge>
											</S.SelectionBoxLarge>
										)}
									</S.StepContent>
								)}

								{/* 3단계: 과제 및 문제 선택 및 수정 */}
								{copyStep === 3 && (
									<S.StepContent>
										<S.StepTitle>3단계: 과제 및 문제 선택 및 수정</S.StepTitle>
										<S.StepDescription>
											가져올 과제와 문제를 선택하고 제목/내용을 수정할 수
											있습니다.
											<S.StepHighlight>
												선택하지 않은 과제나 문제는 복사되지 않습니다.
											</S.StepHighlight>
										</S.StepDescription>

										{loadingAssignments ? (
											<S.LoadingItems>과제를 불러오는 중...</S.LoadingItems>
										) : sourceAssignments.length === 0 ? (
											<S.NoItems>가져올 과제가 없습니다.</S.NoItems>
										) : (
											<S.SelectionBoxLarge>
												<S.SelectionHeader>
													<S.CheckboxLabel>
														<input
															type="checkbox"
															checked={
																copyFormData.selectedAssignmentIds.length ===
																	sourceAssignments.length &&
																sourceAssignments.length > 0
															}
															onChange={handleSelectAllAssignments}
														/>
														<span>전체 선택</span>
													</S.CheckboxLabel>
													<S.ItemCount>
														{copyFormData.selectedAssignmentIds.length} /{" "}
														{sourceAssignments.length}개 과제 선택됨
													</S.ItemCount>
												</S.SelectionHeader>

												<S.AssignmentListLarge>
													{sourceAssignments.map((assignment) => {
														const isAssignmentSelected =
															copyFormData.selectedAssignmentIds.includes(
																assignment.id,
															);
														const selectedProblems =
															copyFormData.assignmentProblems[assignment.id] ||
															[];
														const isExpanded =
															expandedAssignments[assignment.id];
														const isEditingAssignment =
															editingAssignmentId === assignment.id;
														const assignmentEditData =
															copyFormData.assignmentEdits[assignment.id] || {};
														const displayAssignmentTitle =
															assignmentEditData.title || assignment.title;

														return (
															<S.AssignmentItemLarge
																key={assignment.id}
																$selected={isAssignmentSelected}
															>
																<S.AssignmentHeader>
																	<S.CheckboxLabel>
																		<input
																			type="checkbox"
																			checked={isAssignmentSelected}
																			onChange={() =>
																				handleAssignmentToggle(assignment.id)
																			}
																		/>
																		<S.AssignmentInfo>
																			{isEditingAssignment ? (
																				<S.EditForm>
																					<S.EditInput
																						type="text"
																						value={
																							assignmentEditData.title ||
																							assignment.title
																						}
																						onChange={(e) =>
																							handleAssignmentEdit(
																								assignment.id,
																								"title",
																								e.target.value,
																							)
																						}
																						placeholder="과제 제목"
																					/>
																					<S.EditTextarea
																						value={
																							assignmentEditData.description ||
																							assignment.description
																						}
																						onChange={(e) =>
																							handleAssignmentEdit(
																								assignment.id,
																								"description",
																								e.target.value,
																							)
																						}
																						placeholder="과제 설명"
																						rows={3}
																					/>
																					<S.BtnSaveEdit
																						onClick={(e) => {
																							e.stopPropagation();
																							setEditingAssignmentId(null);
																						}}
																					>
																						저장
																					</S.BtnSaveEdit>
																				</S.EditForm>
																			) : (
																				<>
																					<S.AssignmentTitle>
																						{displayAssignmentTitle}
																					</S.AssignmentTitle>
																					<S.AssignmentMeta>
																						{new Date(
																							assignment.startDate,
																						).toLocaleDateString("ko-KR")}{" "}
																						~{" "}
																						{new Date(
																							assignment.endDate,
																						).toLocaleDateString("ko-KR")}
																					</S.AssignmentMeta>
																				</>
																			)}
																		</S.AssignmentInfo>
																	</S.CheckboxLabel>
																	{!isEditingAssignment && (
																		<S.AssignmentActions>
																			<S.BtnExpand
																				onClick={(e) => {
																					e.stopPropagation();
																					toggleAssignmentExpand(assignment.id);
																				}}
																			>
																				{isExpanded ? "접기" : "펼치기"}
																			</S.BtnExpand>
																		</S.AssignmentActions>
																	)}
																</S.AssignmentHeader>

																{isExpanded &&
																	isAssignmentSelected &&
																	assignment.problems &&
																	assignment.problems.length > 0 && (
																		<S.ProblemsList>
																			<S.ProblemsHeader>
																				<S.CheckboxLabel>
																					<input
																						type="checkbox"
																						checked={
																							selectedProblems.length ===
																							assignment.problems.length
																						}
																						onChange={() =>
																							handleSelectAllProblems(
																								assignment.id,
																							)
																						}
																					/>
																					<span>전체 문제 선택</span>
																				</S.CheckboxLabel>
																				<S.ItemCount>
																					{selectedProblems.length} /{" "}
																					{assignment.problems.length}개 선택됨
																				</S.ItemCount>
																			</S.ProblemsHeader>
																			{assignment.problems.map((problem) => {
																				const isProblemSelected =
																					selectedProblems.includes(problem.id);
																				const isEditingProblem =
																					editingProblemId === problem.id;
																				const problemEditData =
																					copyFormData.problemEdits[
																						problem.id
																					] || {};
																				const displayProblemTitle =
																					problemEditData.title ||
																					problem.title;

																				return (
																					<S.ProblemItem
																						key={problem.id}
																						$selected={isProblemSelected}
																					>
																						<S.CheckboxLabel>
																							<input
																								type="checkbox"
																								checked={isProblemSelected}
																								onChange={() =>
																									handleProblemToggle(
																										assignment.id,
																										problem.id,
																									)
																								}
																							/>
																							<S.ProblemInfo>
																								{isEditingProblem ? (
																									<S.EditForm>
																										<S.EditInput
																											type="text"
																											value={
																												problemEditData.title ||
																												problem.title
																											}
																											onChange={(e) =>
																												handleProblemEdit(
																													problem.id,
																													e.target.value,
																												)
																											}
																											placeholder="문제 제목"
																										/>
																										<S.BtnSaveEdit
																											onClick={(e) => {
																												e.stopPropagation();
																												setEditingProblemId(
																													null,
																												);
																											}}
																										>
																											저장
																										</S.BtnSaveEdit>
																									</S.EditForm>
																								) : (
																									<S.ProblemTitle>
																										{displayProblemTitle}
																									</S.ProblemTitle>
																								)}
																							</S.ProblemInfo>
																						</S.CheckboxLabel>
																					</S.ProblemItem>
																				);
																			})}
																		</S.ProblemsList>
																	)}
															</S.AssignmentItemLarge>
														);
													})}
												</S.AssignmentListLarge>
											</S.SelectionBoxLarge>
										)}
									</S.StepContent>
								)}

								{/* 4단계: 최종 확인 */}
								{copyStep === 4 && (
									<S.StepContent>
										<S.StepTitle>4단계: 최종 확인</S.StepTitle>
										<S.SummaryBox>
											<S.SummaryItem>
												<strong>새 수업 제목:</strong>{" "}
												{copyFormData.courseTitle}
											</S.SummaryItem>
											<S.SummaryItem>
												<strong>년도/학기:</strong> {copyFormData.year}년{" "}
												{getSemesterLabel(copyFormData.semester)}
											</S.SummaryItem>
											{copyFormData.copyNotices && (
												<S.SummaryItem>
													<strong>공지사항:</strong>{" "}
													{copyFormData.selectedNoticeIds.length}개 선택
												</S.SummaryItem>
											)}
											{copyFormData.copyAssignments && (
												<S.SummaryItem>
													<strong>과제:</strong>{" "}
													{copyFormData.selectedAssignmentIds.length}개 선택
												</S.SummaryItem>
											)}
										</S.SummaryBox>
									</S.StepContent>
								)}
							</S.ModalBody>

							<S.ModalFooter>
								{copyStep > 1 && (
									<S.BtnCancel onClick={() => setCopyStep(copyStep - 1)}>
										이전
									</S.BtnCancel>
								)}
								<S.BtnCancel
									onClick={() => {
										setShowCopyModal(false);
										setCopyStep(1);
										setEditingNoticeId(null);
										setEditingAssignmentId(null);
										setEditingProblemId(null);
									}}
								>
									취소
								</S.BtnCancel>
								{copyStep < 4 ? (
									<S.BtnSubmit
										onClick={() => {
											if (copyStep === 1 && !copyFormData.sourceSectionId) {
												alert("복사할 수업을 선택해주세요.");
												return;
											}
											if (copyStep === 1 && !copyFormData.courseTitle) {
												alert("새 수업 제목을 입력해주세요.");
												return;
											}
											if (
												copyStep === 2 &&
												copyFormData.copyNotices &&
												copyFormData.selectedNoticeIds.length === 0
											) {
												if (
													!window.confirm(
														"공지사항을 선택하지 않았습니다. 계속하시겠습니까?",
													)
												) {
													return;
												}
											}
											if (
												copyStep === 3 &&
												copyFormData.copyAssignments &&
												copyFormData.selectedAssignmentIds.length === 0
											) {
												if (
													!window.confirm(
														"과제를 선택하지 않았습니다. 계속하시겠습니까?",
													)
												) {
													return;
												}
											}
											setCopyStep(copyStep + 1);
										}}
									>
										다음
									</S.BtnSubmit>
								) : (
									<S.BtnSubmit onClick={handleCopySection}>
										복사하기
									</S.BtnSubmit>
								)}
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 공지사항 조회 모달 */}
				{viewingNoticeId && (
					<S.ModalOverlay onClick={() => setViewingNoticeId(null)}>
						<S.ModalContent $view onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>공지사항 내용</h2>
								<S.ModalClose onClick={() => setViewingNoticeId(null)}>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								{(() => {
									const notice = sourceNotices.find(
										(n) => n.id === viewingNoticeId,
									);
									if (!notice) return <div>공지사항을 찾을 수 없습니다.</div>;
									const editData = copyFormData.noticeEdits[notice.id] || {};
									const displayTitle = editData.title || notice.title;
									const displayContent = editData.content || notice.content;

									return (
										<S.NoticeView>
											<S.NoticeViewTitle>{displayTitle}</S.NoticeViewTitle>
											<S.NoticeViewMeta>
												작성일:{" "}
												{new Date(notice.createdAt).toLocaleDateString("ko-KR")}
											</S.NoticeViewMeta>
											<S.NoticeViewContent>
												{displayContent}
											</S.NoticeViewContent>
											<S.NoticeViewActions>
												<S.BtnEdit
													onClick={() => {
														setViewingNoticeId(null);
														setEditingNoticeId(notice.id);
													}}
												>
													수정하기
												</S.BtnEdit>
												<S.BtnCancel onClick={() => setViewingNoticeId(null)}>
													닫기
												</S.BtnCancel>
											</S.NoticeViewActions>
										</S.NoticeView>
									);
								})()}
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
};

export default CourseManagement;
