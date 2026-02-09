import { useState, useEffect } from "react";
import APIService from "../../../../services/APIService";
import type {
	DashboardSection,
	DashboardFormData,
	DashboardCopyFormData,
	DashboardNotice,
	DashboardAssignment,
	DashboardCourse,
} from "../types";

const initialFormData: DashboardFormData = {
	courseId: "",
	courseTitle: "",
	description: "",
	year: new Date().getFullYear(),
	semester: "SPRING",
};

const initialCopyFormData: DashboardCopyFormData = {
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
};

export function getSemesterLabel(semester: string): string {
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
}

export function formatDate(dateString: string): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}.${m}.${d}`;
}

export function useDashboard() {
	const [sections, setSections] = useState<DashboardSection[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterYear, setFilterYear] = useState("ALL");
	const [filterSemester, setFilterSemester] = useState("ALL");
	const [filterStatus, setFilterStatus] = useState("ALL");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [formData, setFormData] = useState<DashboardFormData>(initialFormData);
	const [availableCourses, setAvailableCourses] = useState<DashboardCourse[]>(
		[],
	);
	const [showCopyModal, setShowCopyModal] = useState(false);
	const [copyFormData, setCopyFormData] =
		useState<DashboardCopyFormData>(initialCopyFormData);
	const [sourceNotices, setSourceNotices] = useState<DashboardNotice[]>([]);
	const [sourceAssignments, setSourceAssignments] = useState<
		DashboardAssignment[]
	>([]);
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

	const fetchSections = async () => {
		try {
			setLoading(true);
			const res = await APIService.getInstructorDashboard();
			const data = res?.data || [];
			setSections(data);
		} catch {
			setSections([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchAvailableCourses = async () => {
		try {
			const courses = await APIService.getCourses();
			setAvailableCourses(courses || []);
		} catch (error) {
			console.error("강의 목록 조회 실패:", error);
			setAvailableCourses([]);
		}
	};

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
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [openDropdownId]);

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
				courseId,
				instructorId: await APIService.getCurrentUserId(),
				sectionNumber: null,
				year: Number.parseInt(String(formData.year)),
				semester: formData.semester,
			});
			alert("수업이 성공적으로 생성되었습니다!");
			setShowCreateModal(false);
			setFormData(initialFormData);
			fetchSections();
		} catch (err: unknown) {
			console.error("수업 생성 실패:", err);
			alert((err as Error).message || "수업 생성에 실패했습니다.");
		}
	};

	const handleToggleActive = async (
		sectionId: number,
		currentActive: boolean,
	) => {
		try {
			const newActive = !currentActive;
			await APIService.toggleSectionActive(sectionId, newActive);
			alert(
				newActive ? "수업이 활성화되었습니다." : "수업이 비활성화되었습니다.",
			);
			fetchSections();
		} catch (err: unknown) {
			console.error("수업 상태 변경 실패:", err);
			alert((err as Error).message || "수업 상태 변경에 실패했습니다.");
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
		} catch (err: unknown) {
			console.error("분반 삭제 실패:", err);
			alert((err as Error).message || "분반 삭제에 실패했습니다.");
		}
	};

	const handleSourceSectionChange = async (sectionId: string) => {
		setCopyFormData((prev) => ({
			...prev,
			sourceSectionId: sectionId,
			selectedNoticeIds: [],
			selectedAssignmentIds: [],
			assignmentProblems: {},
			noticeEdits: {},
			assignmentEdits: {},
			problemEdits: {},
		}));
		setExpandedAssignments({});

		if (!sectionId) {
			setSourceNotices([]);
			setSourceAssignments([]);
			return;
		}

		try {
			setLoadingNotices(true);
			setLoadingAssignments(true);
			const sid = Number.parseInt(sectionId);

			const notices = await APIService.getSectionNotices(sid);
			const noticesData = notices?.data || notices || [];
			setSourceNotices(noticesData);

			const assignments = await APIService.getAssignmentsBySection(sid);
			const assignmentsData = assignments?.data || assignments || [];
			const withProblems = await Promise.all(
				assignmentsData.map(async (a: DashboardAssignment) => {
					try {
						const problems = await APIService.getAssignmentProblems(sid, a.id);
						return { ...a, problems: problems || [] };
					} catch {
						return { ...a, problems: [] };
					}
				}),
			);
			setSourceAssignments(withProblems);
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
		setCopyFormData((prev) => ({
			...prev,
			selectedNoticeIds:
				prev.selectedNoticeIds.length === sourceNotices.length
					? []
					: sourceNotices.map((n) => n.id),
		}));
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
				const next = { ...prev.assignmentProblems };
				delete next[assignmentId];
				return {
					...prev,
					selectedAssignmentIds: prev.selectedAssignmentIds.filter(
						(id) => id !== assignmentId,
					),
					assignmentProblems: next,
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
			const assignmentProblems: Record<number, number[]> = {};
			for (const a of sourceAssignments) {
				assignmentProblems[a.id] = a.problems.map((p) => p.id);
			}
			setCopyFormData((prev) => ({
				...prev,
				selectedAssignmentIds: sourceAssignments.map((a) => a.id),
				assignmentProblems,
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
			const current = prev.assignmentProblems[assignmentId] || [];
			const isSelected = current.includes(problemId);
			return {
				...prev,
				assignmentProblems: {
					...prev.assignmentProblems,
					[assignmentId]: isSelected
						? current.filter((id) => id !== problemId)
						: [...current, problemId],
				},
			};
		});
	};

	const handleSelectAllProblems = (assignmentId: number) => {
		const assignment = sourceAssignments.find((a) => a.id === assignmentId);
		if (!assignment) return;
		const allIds = assignment.problems.map((p) => p.id);
		const current = copyFormData.assignmentProblems[assignmentId] || [];
		setCopyFormData((prev) => ({
			...prev,
			assignmentProblems: {
				...prev.assignmentProblems,
				[assignmentId]: current.length === allIds.length ? [] : allIds,
			},
		}));
	};

	const handleProblemEdit = (problemId: number, title: string) => {
		setCopyFormData((prev) => ({
			...prev,
			problemEdits: { ...prev.problemEdits, [problemId]: { title } },
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
				setCopyFormData(initialCopyFormData);
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
		} catch (err: unknown) {
			console.error("수업 복사 실패:", err);
			alert((err as Error).message || "수업 복사에 실패했습니다.");
		}
	};

	const availableYears = [
		...new Set(sections.map((s) => s.year).filter(Boolean)),
	].sort((a, b) => b - a) as number[];

	const filteredSections = sections.filter((section) => {
		const matchSearch =
			!searchTerm ||
			section.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(section.instructorName &&
				section.instructorName
					.toLowerCase()
					.includes(searchTerm.toLowerCase()));
		const matchYear =
			filterYear === "ALL" || section.year === Number.parseInt(filterYear);
		const matchSemester =
			filterSemester === "ALL" || section.semester === filterSemester;
		const matchStatus =
			filterStatus === "ALL" ||
			(filterStatus === "ACTIVE" && section.active !== false) ||
			(filterStatus === "INACTIVE" && section.active === false);
		return matchSearch && matchYear && matchSemester && matchStatus;
	});

	const hasActiveFilters =
		!!searchTerm ||
		filterYear !== "ALL" ||
		filterSemester !== "ALL" ||
		filterStatus !== "ALL";

	return {
		// state
		sections,
		loading,
		searchTerm,
		setSearchTerm,
		filterYear,
		setFilterYear,
		filterSemester,
		setFilterSemester,
		filterStatus,
		setFilterStatus,
		showCreateModal,
		setShowCreateModal,
		formData,
		setFormData,
		availableCourses,
		showCopyModal,
		setShowCopyModal,
		copyFormData,
		setCopyFormData,
		sourceNotices,
		sourceAssignments,
		loadingNotices,
		loadingAssignments,
		expandedAssignments,
		copyStep,
		setCopyStep,
		editingNoticeId,
		setEditingNoticeId,
		editingAssignmentId,
		setEditingAssignmentId,
		editingProblemId,
		setEditingProblemId,
		viewingNoticeId,
		setViewingNoticeId,
		openDropdownId,
		setOpenDropdownId,
		// computed
		filteredSections,
		availableYears,
		hasActiveFilters,
		// actions
		fetchSections,
		handleCreateSection,
		handleToggleActive,
		handleDeleteSection,
		handleSourceSectionChange,
		handleNoticeToggle,
		handleSelectAllNotices,
		handleNoticeEdit,
		handleAssignmentToggle,
		handleSelectAllAssignments,
		handleAssignmentEdit,
		toggleAssignmentExpand,
		handleProblemToggle,
		handleSelectAllProblems,
		handleProblemEdit,
		handleCopySection,
	};
}
