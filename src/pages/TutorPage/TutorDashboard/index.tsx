import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import { removeCopyLabel } from "../../../utils/problemUtils";
import ReactMarkdown from "react-markdown";
import {
	FaExclamationTriangle,
	FaCheckCircle,
	FaClock,
	FaUsers,
	FaChartLine,
	FaArrowUp,
	FaArrowDown,
	FaMinus,
} from "react-icons/fa";
import * as S from "./styles";
import type {
	Section,
	SectionStat,
	FormData,
	CopyFormData,
	Notice,
	Assignment,
	Problem,
} from "./types";

const TutorDashboard: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [sections, setSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterYear, setFilterYear] = useState("ALL");
	const [filterSemester, setFilterSemester] = useState("ALL");
	const [filterStatus, setFilterStatus] = useState("ALL");
	const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showCopyModal, setShowCopyModal] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		courseTitle: "",
		description: "",
		sectionNumber: "",
		year: new Date().getFullYear(),
		semester: "SPRING",
	});
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
	});
	const [sourceNotices, setSourceNotices] = useState<Notice[]>([]);
	const [sourceAssignments, setSourceAssignments] = useState<Assignment[]>([]);
	const [loadingNotices, setLoadingNotices] = useState(false);
	const [loadingAssignments, setLoadingAssignments] = useState(false);
	const [expandedAssignments, setExpandedAssignments] = useState<
		Record<number, boolean>
	>({});
	const [copyStep, setCopyStep] = useState(1);
	const [selectedNoticeDetail, setSelectedNoticeDetail] =
		useState<Notice | null>(null);
	const [selectedProblemDetail, setSelectedProblemDetail] =
		useState<Problem | null>(null);
	const [stats, setStats] = useState<any>(null);
	const [loadingStats, setLoadingStats] = useState(false);
	const [sectionStats, setSectionStats] = useState<Record<number, SectionStat>>(
		{},
	);
	const [loadingSectionStats, setLoadingSectionStats] = useState(false);

	const calculateSectionStats = async (
		sectionId: number,
	): Promise<SectionStat> => {
		try {
			const assignmentsResponse =
				await APIService.getAssignmentsBySection(sectionId);
			const assignments =
				assignmentsResponse?.data || assignmentsResponse || [];

			if (assignments.length === 0) {
				return {
					averageSubmissionRate: 0,
					atRiskStudents: 0,
					issues: 0,
					upcomingDeadlines: [],
					pendingGrading: 0,
					totalAssignments: 0,
					activeAssignments: 0,
				};
			}

			const upcomingAssignments = await APIService.getUpcomingAssignments(
				sectionId,
				3,
			);
			const upcomingDeadlines = upcomingAssignments.map((assignment: any) => ({
				assignmentId: assignment.assignmentId,
				title: assignment.title,
				endDate: assignment.endDate,
				submissionRate: assignment.submissionRate || 0,
			}));

			if (upcomingDeadlines.length === 0) {
				const now = new Date();
				const activeAssignments = assignments.filter(
					(a: any) => a.active && a.endDate,
				);

				const futureAssignments = activeAssignments
					.filter((a: any) => {
						const endDate = new Date(a.endDate);
						return endDate > now;
					})
					.sort(
						(a: any, b: any) =>
							new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
					);

				for (const assignment of futureAssignments.slice(0, 3)) {
					try {
						const statsResponse = await APIService.getAssignmentSubmissionStats(
							assignment.id,
							sectionId,
						);
						if (statsResponse) {
							upcomingDeadlines.push({
								assignmentId: assignment.id,
								title: assignment.title,
								endDate: assignment.endDate,
								submissionRate: statsResponse.submissionRate || 0,
							});
						}
					} catch (error) {
						console.error(`과제 ${assignment.id} 통계 조회 실패:`, error);
						upcomingDeadlines.push({
							assignmentId: assignment.id,
							title: assignment.title,
							endDate: assignment.endDate,
							submissionRate: 0,
						});
					}
				}
			}

			let totalSubmissionRate = 0;
			let validAssignments = 0;
			let pendingGrading = 0;
			const now = new Date();

			for (const assignment of assignments) {
				if (!assignment.active) continue;

				try {
					const statsResponse = await APIService.getAssignmentSubmissionStats(
						assignment.id,
						sectionId,
					);
					if (statsResponse) {
						const submissionRate = statsResponse.submissionRate || 0;
						totalSubmissionRate += submissionRate;
						validAssignments++;

						if (submissionRate < 50 && assignment.endDate) {
							const endDate = new Date(assignment.endDate);
							if (endDate < now) {
								pendingGrading++;
							}
						}
					}
				} catch (error) {
					console.error(`과제 ${assignment.id} 통계 조회 실패:`, error);
				}
			}

			const averageSubmissionRate =
				validAssignments > 0 ? totalSubmissionRate / validAssignments : 0;
			const atRiskStudents = Math.ceil(
				((100 - averageSubmissionRate) / 100) *
					(sections.find((s) => s.sectionId === sectionId)?.studentCount || 0),
			);
			const issues = upcomingDeadlines.length + pendingGrading;

			return {
				averageSubmissionRate: Math.round(averageSubmissionRate * 10) / 10,
				atRiskStudents,
				issues,
				upcomingDeadlines,
				pendingGrading,
				totalAssignments: assignments.length,
				activeAssignments: assignments.filter((a: any) => a.active).length,
			};
		} catch (error) {
			console.error(`수업 ${sectionId} 통계 계산 실패:`, error);
			return {
				averageSubmissionRate: 0,
				atRiskStudents: 0,
				issues: 0,
				upcomingDeadlines: [],
				pendingGrading: 0,
				totalAssignments: 0,
				activeAssignments: 0,
			};
		}
	};

	const getHealthStatus = (sectionStat: SectionStat | undefined) => {
		if (!sectionStat)
			return { status: "unknown", label: "알 수 없음", color: "#9ca3af" };

		const { averageSubmissionRate, atRiskStudents } = sectionStat;

		if (averageSubmissionRate >= 80 && atRiskStudents <= 3) {
			return { status: "healthy", label: "건강함", color: "#10b981" };
		}
		if (averageSubmissionRate < 60 || atRiskStudents > 10) {
			return { status: "danger", label: "위험", color: "#ef4444" };
		}
		return { status: "warning", label: "주의", color: "#f59e0b" };
	};

	useEffect(() => {
		const fetchSections = async () => {
			try {
				setLoading(true);
				const dashboardResponse = await APIService.getInstructorDashboard();
				const dashboardData = dashboardResponse?.data || [];
				setSections(dashboardData);
				setLoading(false);

				setLoadingSectionStats(true);
				const statsMap: Record<number, SectionStat> = {};
				for (const section of dashboardData) {
					if (section.active !== false) {
						statsMap[section.sectionId] = await calculateSectionStats(
							section.sectionId,
						);
					}
				}
				setSectionStats(statsMap);
				setLoadingSectionStats(false);
			} catch (error) {
				setSections([]);
				setLoading(false);
				setLoadingSectionStats(false);
			}
		};

		const fetchStats = async () => {
			try {
				setLoadingStats(true);
				const response = await APIService.getAdminStats();
				setStats(response?.data || null);
			} catch (error) {
				console.error("통계 조회 실패:", error);
				setStats(null);
			} finally {
				setLoadingStats(false);
			}
		};

		fetchSections();
		fetchStats();
	}, []);

	const handleSectionClick = (section: Section) => {
		navigate(`/tutor/section/${section.sectionId}/assignments`, {
			state: { section },
		});
	};

	const handleCopyEnrollmentLink = (
		enrollmentCode: string | undefined,
		e: React.MouseEvent,
	) => {
		e.stopPropagation();
		if (enrollmentCode) {
			const enrollmentLink = `${window.location.origin}/enroll/${enrollmentCode}`;
			navigator.clipboard
				.writeText(enrollmentLink)
				.then(() => {
					alert("수업 참가 링크가 복사되었습니다!");
				})
				.catch((err) => {
					console.error("복사 실패:", err);
					alert("링크 복사에 실패했습니다.");
				});
		}
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				openDropdownId &&
				!(event.target as HTMLElement).closest(
					".tutor-course-card-dropdown-container",
				)
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

	const handleToggleActive = async (
		sectionId: number,
		currentActive: boolean,
		e?: React.MouseEvent,
	) => {
		if (e) e.stopPropagation();
		try {
			const newActiveStatus = !currentActive;
			await APIService.toggleSectionActive(sectionId, newActiveStatus);
			alert(
				newActiveStatus
					? "수업이 활성화되었습니다."
					: "수업이 비활성화되었습니다.",
			);

			const dashboardResponse = await APIService.getInstructorDashboard();
			const dashboardData = dashboardResponse?.data || [];
			setSections(dashboardData);
		} catch (error: any) {
			console.error("수업 상태 변경 실패:", error);
			alert(
				`수업 상태 변경에 실패했습니다.\n${error.message || "네트워크 오류가 발생했습니다."}`,
			);
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
			const dashboardResponse = await APIService.getInstructorDashboard();
			const dashboardData = dashboardResponse?.data || [];
			setSections(dashboardData);
		} catch (error: any) {
			console.error("분반 삭제 실패:", error);
			alert(error.message || "분반 삭제에 실패했습니다.");
		}
	};

	const handleCreateSection = async () => {
		try {
			const instructorId = await APIService.getCurrentUserId();

			const courseResponse = await APIService.createCourse({
				title: formData.courseTitle,
				description: formData.description || "",
			});

			const sectionResponse = await APIService.createSection({
				courseId: courseResponse.id,
				instructorId: instructorId,
				sectionNumber: null,
				year: Number.parseInt(String(formData.year)),
				semester: formData.semester,
			});

			alert("수업이 성공적으로 생성되었습니다!");
			setShowCreateModal(false);
			setFormData({
				courseTitle: "",
				description: "",
				sectionNumber: "",
				year: new Date().getFullYear(),
				semester: "SPRING",
			});

			const dashboardResponse = await APIService.getInstructorDashboard();
			const dashboardData = dashboardResponse?.data || [];
			setSections(dashboardData);
		} catch (error: any) {
			console.error("수업 생성 실패:", error);
			alert(error.message || "수업 생성에 실패했습니다.");
		}
	};

	const handleSourceSectionChange = async (sectionId: string) => {
		setCopyFormData({
			...copyFormData,
			sourceSectionId: sectionId,
			selectedNoticeIds: [],
			selectedAssignmentIds: [],
			assignmentProblems: {},
		});
		setExpandedAssignments({});

		if (sectionId) {
			try {
				setLoadingNotices(true);
				const notices = await APIService.getSectionNotices(Number(sectionId));
				const noticesData = notices?.data || notices || [];
				setSourceNotices(noticesData);

				setLoadingAssignments(true);
				const assignments = await APIService.getAssignmentsBySection(
					Number(sectionId),
				);
				const assignmentsData = assignments?.data || assignments || [];

				const assignmentsWithProblems = await Promise.all(
					assignmentsData.map(async (assignment: any) => {
						try {
							const problems = await APIService.getAssignmentProblems(
								Number(sectionId),
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

				const initialAssignmentProblems: Record<number, number[]> = {};
				assignmentsWithProblems.forEach((assignment: any) => {
					initialAssignmentProblems[assignment.id] = assignment.problems.map(
						(p: any) => p.id,
					);
				});

				setCopyFormData((prev) => ({
					...prev,
					sourceSectionId: sectionId,
					selectedNoticeIds: noticesData.map((n: any) => n.id),
					selectedAssignmentIds: assignmentsWithProblems.map((a: any) => a.id),
					assignmentProblems: initialAssignmentProblems,
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
			} else {
				const assignment = sourceAssignments.find((a) => a.id === assignmentId);
				return {
					...prev,
					selectedAssignmentIds: [...prev.selectedAssignmentIds, assignmentId],
					assignmentProblems: {
						...prev.assignmentProblems,
						[assignmentId]: assignment?.problems.map((p) => p.id) || [],
					},
				};
			}
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
				{}, // noticeEdits
				{}, // assignmentEdits
				{}, // problemEdits
			);

			if ((response as any).success) {
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
				});
				setSourceNotices([]);
				setSourceAssignments([]);
				setExpandedAssignments({});

				const dashboardResponse = await APIService.getInstructorDashboard();
				const dashboardData = dashboardResponse?.data || [];
				setSections(dashboardData);
			} else {
				alert((response as any).message || "수업 복사에 실패했습니다.");
			}
		} catch (error: any) {
			console.error("수업 복사 실패:", error);
			alert(error.message || "수업 복사에 실패했습니다.");
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
				return semester || "1학기";
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

	const calculateDDay = (endDate: string) => {
		if (!endDate) return null;
		const end = new Date(endDate);
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		end.setHours(0, 0, 0, 0);
		const diffTime = end.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return "마감";
		if (diffDays === 0) return "D-day";
		return `D-${diffDays}`;
	};

	const filteredSections = sections.filter((section) => {
		const matchesSearch =
			!searchTerm ||
			section.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

	const availableYears = [
		...new Set(sections.map((s) => s.year).filter(Boolean)),
	].sort((a, b) => b - a);

	if (loading) {
		return (
			<TutorLayout>
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<S.LoadingText>분반 정보를 불러오는 중...</S.LoadingText>
				</S.LoadingContainer>
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
						</S.TitleStats>
					</S.TitleLeft>
					<S.TitleRight>
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
								<S.StatItem className="tutor-course-card-stat-item">
									<S.StatLabel className="tutor-course-card-stat-label">
										학생
									</S.StatLabel>
									<S.StatValue className="tutor-course-card-stat-value">
										{section.studentCount || 0}명
									</S.StatValue>
								</S.StatItem>
								<S.StatItem className="tutor-course-card-stat-item">
									<S.StatLabel className="tutor-course-card-stat-label">
										공지
									</S.StatLabel>
									<S.StatValue className="tutor-course-card-stat-value">
										{section.noticeCount || 0}개
									</S.StatValue>
								</S.StatItem>
								<S.StatItem className="tutor-course-card-stat-item">
									<S.StatLabel className="tutor-course-card-stat-label">
										학기
									</S.StatLabel>
									<S.StatValue className="tutor-course-card-stat-value">
										{section.year || new Date().getFullYear()}년{" "}
										{getSemesterLabel(section.semester)}
									</S.StatValue>
								</S.StatItem>
								{section.createdAt && (
									<S.StatItem className="tutor-course-card-stat-item">
										<S.StatLabel className="tutor-course-card-stat-label">
											생성일
										</S.StatLabel>
										<S.StatValue className="tutor-course-card-stat-value">
											{formatDate(section.createdAt)}
										</S.StatValue>
									</S.StatItem>
								)}
							</S.StatsCompact>

							<S.ActionsCompact>
								<S.ToggleButton
									$active={section.active !== false}
									onClick={(e) =>
										handleToggleActive(
											section.sectionId,
											section.active !== false,
											e,
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
											navigate(`/tutor/section/${section.sectionId}/notices`)
										}
										title="공지사항"
									>
										공지
									</S.ActionButton>
									<S.ActionButton
										onClick={() =>
											navigate(`/tutor/section/${section.sectionId}/users`)
										}
										title="학생 관리"
									>
										학생
									</S.ActionButton>
									<S.ActionButton
										onClick={() =>
											navigate(`/tutor/section/${section.sectionId}/grades`)
										}
										title="성적 관리"
									>
										성적
									</S.ActionButton>
									<S.ActionButton
										$primary
										onClick={() =>
											navigate(
												`/tutor/section/${section.sectionId}/assignments`,
											)
										}
										title="과제 관리"
									>
										과제
									</S.ActionButton>
									<S.DropdownContainer>
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
									<label>강의 제목</label>
									<S.FormInput
										type="text"
										value={formData.courseTitle}
										onChange={(e) =>
											setFormData({ ...formData, courseTitle: e.target.value })
										}
										placeholder="예: 자바프로그래밍"
									/>
								</S.FormGroup>

								<S.FormGroup>
									<label>수업 설명</label>
									<S.FormTextarea
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
										rows={3}
									/>
								</S.FormGroup>

								<S.FormRow>
									<S.FormGroup>
										<label>년도</label>
										<S.FormInput
											type="number"
											value={formData.year}
											onChange={(e) =>
												setFormData({
													...formData,
													year: e.target.value as any,
												})
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
												setFormData({
													...formData,
													semester: e.target.value as any,
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
							</S.ModalBody>

							<S.ModalFooter>
								<S.BtnCancel onClick={() => setShowCreateModal(false)}>
									취소
								</S.BtnCancel>
								<S.BtnSubmit
									onClick={handleCreateSection}
									disabled={!formData.courseTitle}
								>
									생성하기
								</S.BtnSubmit>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 수업 가져오기 모달 */}
				{showCopyModal && (
					<S.ModalOverlay
						onClick={() => {
							setShowCopyModal(false);
							setCopyStep(1);
							setSelectedNoticeDetail(null);
							setSelectedProblemDetail(null);
						}}
					>
						<S.ModalContent
							$large={copyStep !== 1}
							onClick={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2>수업 가져오기</h2>
								<S.ModalClose
									onClick={() => {
										setShowCopyModal(false);
										setCopyStep(1);
										setSelectedNoticeDetail(null);
										setSelectedProblemDetail(null);
									}}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>

							<S.ModalBody $large={copyStep !== 1}>
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
															year: e.target.value as any,
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
															semester: e.target.value as any,
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
									</S.StepContent>
								)}

								{/* 2단계: 공지사항 선택 */}
								{copyStep === 2 && (
									<S.StepContent>
										<S.StepTitle>2단계: 공지사항 선택</S.StepTitle>
										<S.StepDescription>
											가져올 공지사항을 선택하세요. 건너뛰면 공지사항을 가져오지
											않습니다.
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

												<S.ItemListLarge>
													{sourceNotices.map((notice) => (
														<S.ListItemLarge key={notice.id}>
															<S.CheckboxLabel>
																<input
																	type="checkbox"
																	checked={copyFormData.selectedNoticeIds.includes(
																		notice.id,
																	)}
																	onChange={() => handleNoticeToggle(notice.id)}
																/>
																<S.ItemInfo>
																	<S.ItemTitleLarge>
																		{notice.title}
																	</S.ItemTitleLarge>
																	<S.ItemMeta>
																		{new Date(
																			notice.createdAt,
																		).toLocaleDateString("ko-KR")}
																	</S.ItemMeta>
																</S.ItemInfo>
															</S.CheckboxLabel>
															<S.BtnViewDetail
																onClick={(e) => {
																	e.stopPropagation();
																	setSelectedNoticeDetail(notice);
																}}
															>
																상세보기
															</S.BtnViewDetail>
														</S.ListItemLarge>
													))}
												</S.ItemListLarge>
											</S.SelectionBoxLarge>
										)}
									</S.StepContent>
								)}

								{/* 3단계: 과제 및 문제 선택 */}
								{copyStep === 3 && (
									<S.StepContent>
										<S.StepTitle>3단계: 과제 및 문제 선택</S.StepTitle>
										<S.StepDescription>
											가져올 과제와 문제를 선택하세요. 과제를 클릭하면 해당
											과제의 문제 목록을 볼 수 있습니다.
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

														return (
															<S.AssignmentItemLarge
																key={assignment.id}
																$expanded={isExpanded}
															>
																<S.AssignmentHeaderLarge>
																	<S.CheckboxLabel>
																		<input
																			type="checkbox"
																			checked={isAssignmentSelected}
																			onChange={() =>
																				handleAssignmentToggle(assignment.id)
																			}
																		/>
																		<S.AssignmentInfoLarge>
																			<S.AssignmentTitleLarge>
																				{assignment.title}
																			</S.AssignmentTitleLarge>
																			<S.AssignmentMeta>
																				{assignment.problems?.length || 0}개
																				문제
																				{assignment.endDate &&
																					` · 마감: ${new Date(assignment.endDate).toLocaleDateString("ko-KR")}`}
																			</S.AssignmentMeta>
																		</S.AssignmentInfoLarge>
																	</S.CheckboxLabel>
																	{assignment.problems &&
																		assignment.problems.length > 0 && (
																			<S.BtnExpandAssignment
																				onClick={() =>
																					toggleAssignmentExpand(assignment.id)
																				}
																				disabled={!isAssignmentSelected}
																			>
																				{isExpanded ? "접기 ▲" : "문제 보기 ▼"}
																			</S.BtnExpandAssignment>
																		)}
																</S.AssignmentHeaderLarge>

																{isExpanded &&
																	isAssignmentSelected &&
																	assignment.problems &&
																	assignment.problems.length > 0 && (
																		<S.ProblemSelectionBox>
																			<S.ProblemSelectionHeader>
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
																					<span>문제 전체 선택</span>
																				</S.CheckboxLabel>
																				<S.ItemCount>
																					{selectedProblems.length} /{" "}
																					{assignment.problems.length}개
																				</S.ItemCount>
																			</S.ProblemSelectionHeader>
																			<S.ProblemListLarge>
																				{assignment.problems.map(
																					(problem, index) => (
																						<S.ProblemItemLarge
																							key={problem.id}
																						>
																							<S.ProblemItemHeader>
																								<S.ProblemCheckbox
																									checked={selectedProblems.includes(
																										problem.id,
																									)}
																									onChange={() =>
																										handleProblemToggle(
																											assignment.id,
																											problem.id,
																										)
																									}
																								/>
																							</S.ProblemItemHeader>
																							<S.ProblemItemBody>
																								<S.ProblemTitleRow>
																									<S.ProblemTitleLarge>
																										<S.ProblemNumber>
																											{index + 1}.
																										</S.ProblemNumber>
																										{removeCopyLabel(
																											problem.title,
																										)}
																									</S.ProblemTitleLarge>
																									<S.BtnViewDetailCard
																										onClick={async (e) => {
																											e.stopPropagation();
																											try {
																												const problemInfo =
																													await APIService.getProblemInfo(
																														problem.id,
																													);
																												setSelectedProblemDetail(
																													problemInfo.data ||
																														problemInfo,
																												);
																											} catch (error) {
																												console.error(
																													"문제 정보 조회 실패:",
																													error,
																												);
																												alert(
																													"문제 정보를 불러오는데 실패했습니다.",
																												);
																											}
																										}}
																									>
																										설명보기
																									</S.BtnViewDetailCard>
																								</S.ProblemTitleRow>
																							</S.ProblemItemBody>
																						</S.ProblemItemLarge>
																					),
																				)}
																			</S.ProblemListLarge>
																		</S.ProblemSelectionBox>
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
										<S.StepDescription>
											선택하신 내용을 확인하고 수업을 생성하세요.
										</S.StepDescription>

										<S.SummarySection>
											<S.SummaryItem>
												<S.SummaryLabel>수업 정보</S.SummaryLabel>
												<S.SummaryContent>
													<S.SummaryRow>
														<S.SummaryKey>제목:</S.SummaryKey>
														<S.SummaryValue>
															{copyFormData.courseTitle}
														</S.SummaryValue>
													</S.SummaryRow>
													{copyFormData.description && (
														<S.SummaryRow>
															<S.SummaryKey>설명:</S.SummaryKey>
															<S.SummaryValue>
																{copyFormData.description}
															</S.SummaryValue>
														</S.SummaryRow>
													)}
													<S.SummaryRow>
														<S.SummaryKey>년도:</S.SummaryKey>
														<S.SummaryValue>
															{copyFormData.year}년
														</S.SummaryValue>
													</S.SummaryRow>
													<S.SummaryRow>
														<S.SummaryKey>구분:</S.SummaryKey>
														<S.SummaryValue>
															{getSemesterLabel(copyFormData.semester)}
														</S.SummaryValue>
													</S.SummaryRow>
												</S.SummaryContent>
											</S.SummaryItem>

											{copyFormData.copyNotices ? (
												<S.SummaryItem>
													<S.SummaryLabel>공지사항</S.SummaryLabel>
													<S.SummaryContent>
														<S.SummaryRow>
															<S.SummaryKey>가져올 공지사항:</S.SummaryKey>
															<S.SummaryValue>
																{copyFormData.selectedNoticeIds.length}개 선택됨
															</S.SummaryValue>
														</S.SummaryRow>
														{copyFormData.selectedNoticeIds.length > 0 && (
															<S.SummaryList>
																{sourceNotices
																	.filter((n) =>
																		copyFormData.selectedNoticeIds.includes(
																			n.id,
																		),
																	)
																	.map((notice) => (
																		<S.SummaryListItem key={notice.id}>
																			• {notice.title}
																		</S.SummaryListItem>
																	))}
															</S.SummaryList>
														)}
													</S.SummaryContent>
												</S.SummaryItem>
											) : (
												<S.SummaryItem>
													<S.SummaryLabel>공지사항</S.SummaryLabel>
													<S.SummaryContent>
														<S.SummarySkipped>건너뛰기</S.SummarySkipped>
													</S.SummaryContent>
												</S.SummaryItem>
											)}

											{copyFormData.copyAssignments ? (
												<S.SummaryItem>
													<S.SummaryLabel>과제 및 문제</S.SummaryLabel>
													<S.SummaryContent>
														<S.SummaryRow>
															<S.SummaryKey>가져올 과제:</S.SummaryKey>
															<S.SummaryValue>
																{copyFormData.selectedAssignmentIds.length}개
																선택됨
															</S.SummaryValue>
														</S.SummaryRow>
														{copyFormData.selectedAssignmentIds.length > 0 && (
															<S.SummaryList>
																{sourceAssignments
																	.filter((a) =>
																		copyFormData.selectedAssignmentIds.includes(
																			a.id,
																		),
																	)
																	.map((assignment) => {
																		const selectedProblems =
																			copyFormData.assignmentProblems[
																				assignment.id
																			] || [];
																		return (
																			<S.SummaryListItem key={assignment.id}>
																				• {assignment.title} (
																				{selectedProblems.length}개 문제)
																			</S.SummaryListItem>
																		);
																	})}
															</S.SummaryList>
														)}
													</S.SummaryContent>
												</S.SummaryItem>
											) : (
												<S.SummaryItem>
													<S.SummaryLabel>과제 및 문제</S.SummaryLabel>
													<S.SummaryContent>
														<S.SummarySkipped>건너뛰기</S.SummarySkipped>
													</S.SummaryContent>
												</S.SummaryItem>
											)}
										</S.SummarySection>
									</S.StepContent>
								)}
							</S.ModalBody>

							<S.ModalFooter>
								{/* 1단계 버튼 */}
								{copyStep === 1 && (
									<>
										<S.BtnCancel
											onClick={() => {
												setShowCopyModal(false);
												setCopyStep(1);
											}}
										>
											취소
										</S.BtnCancel>
										<S.BtnNext
											onClick={() => setCopyStep(2)}
											disabled={
												!copyFormData.sourceSectionId ||
												!copyFormData.courseTitle
											}
										>
											다음
										</S.BtnNext>
									</>
								)}

								{/* 2단계 버튼 */}
								{copyStep === 2 && (
									<>
										<S.BtnPrev onClick={() => setCopyStep(1)}>이전</S.BtnPrev>
										<S.BtnSkip
											onClick={() => {
												setCopyFormData((prev) => ({
													...prev,
													copyNotices: false,
													selectedNoticeIds: [],
												}));
												setCopyStep(3);
											}}
										>
											건너뛰기
										</S.BtnSkip>
										<S.BtnNext
											onClick={() => {
												setCopyFormData((prev) => ({
													...prev,
													copyNotices: true,
												}));
												setCopyStep(3);
											}}
											disabled={copyFormData.selectedNoticeIds.length === 0}
										>
											다음 ({copyFormData.selectedNoticeIds.length}개 선택)
										</S.BtnNext>
									</>
								)}

								{/* 3단계 버튼 */}
								{copyStep === 3 && (
									<>
										<S.BtnPrev onClick={() => setCopyStep(2)}>이전</S.BtnPrev>
										<S.BtnSkip
											onClick={() => {
												setCopyFormData((prev) => ({
													...prev,
													copyAssignments: false,
													selectedAssignmentIds: [],
													assignmentProblems: {},
												}));
												setCopyStep(4);
											}}
										>
											건너뛰기
										</S.BtnSkip>
										<S.BtnNext
											onClick={() => {
												setCopyFormData((prev) => ({
													...prev,
													copyAssignments: true,
												}));
												setCopyStep(4);
											}}
											disabled={copyFormData.selectedAssignmentIds.length === 0}
										>
											다음 ({copyFormData.selectedAssignmentIds.length}개 과제)
										</S.BtnNext>
									</>
								)}

								{/* 4단계: 최종 확인 */}
								{copyStep === 4 && (
									<>
										<S.BtnPrev onClick={() => setCopyStep(3)}>이전</S.BtnPrev>
										<S.BtnSubmit onClick={handleCopySection}>
											수업 만들기
										</S.BtnSubmit>
									</>
								)}
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 상세보기 패널 */}
				{(selectedNoticeDetail || selectedProblemDetail) && (
					<>
						<S.DetailOverlay
							onClick={() => {
								setSelectedNoticeDetail(null);
								setSelectedProblemDetail(null);
							}}
						/>
						<S.DetailPanel onClick={(e) => e.stopPropagation()}>
							<S.DetailPanelHeader>
								<h3>{selectedNoticeDetail ? "공지사항 상세" : "문제 설명"}</h3>
								<S.BtnCloseDetail
									onClick={() => {
										setSelectedNoticeDetail(null);
										setSelectedProblemDetail(null);
									}}
								>
									×
								</S.BtnCloseDetail>
							</S.DetailPanelHeader>
							<S.DetailPanelContent>
								{selectedNoticeDetail && (
									<div>
										<S.DetailTitle>{selectedNoticeDetail.title}</S.DetailTitle>
										<S.DetailMeta>
											작성일:{" "}
											{new Date(
												selectedNoticeDetail.createdAt,
											).toLocaleDateString("ko-KR")}
										</S.DetailMeta>
										<S.DetailBody>{selectedNoticeDetail.content}</S.DetailBody>
									</div>
								)}
								{selectedProblemDetail && (
									<div>
										<S.DetailTitle>{selectedProblemDetail.title}</S.DetailTitle>
										<S.DetailMeta>
											{selectedProblemDetail.timeLimit && (
												<span>
													시간 제한: {selectedProblemDetail.timeLimit}초
												</span>
											)}
											{selectedProblemDetail.memoryLimit && (
												<span>
													메모리 제한: {selectedProblemDetail.memoryLimit}MB
												</span>
											)}
										</S.DetailMeta>
										<S.DetailBody>
											<S.ProblemDescription>
												{selectedProblemDetail.description ? (
													(() => {
														const description =
															selectedProblemDetail.description;
														const isMarkdown =
															description.includes("# ") ||
															description.includes("## ") ||
															description.includes("```") ||
															description.includes("**") ||
															!description.includes("<");

														return isMarkdown ? (
															<ReactMarkdown
																components={{
																	code({
																		node,
																		className,
																		children,
																		...props
																	}: any) {
																		const inline = !className;
																		return inline ? (
																			<code
																				className="tutor-inline-code"
																				{...props}
																			>
																				{children}
																			</code>
																		) : (
																			<pre className="tutor-code-block">
																				<code className={className} {...props}>
																					{children}
																				</code>
																			</pre>
																		);
																	},
																}}
															>
																{description}
															</ReactMarkdown>
														) : (
															<div
																dangerouslySetInnerHTML={{
																	__html: description,
																}}
															/>
														);
													})()
												) : (
													<p>설명이 없습니다.</p>
												)}
											</S.ProblemDescription>
										</S.DetailBody>
									</div>
								)}
							</S.DetailPanelContent>
						</S.DetailPanel>
					</>
				)}
			</S.Container>
		</TutorLayout>
	);
};

export default TutorDashboard;
