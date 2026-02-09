import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type {
	Assignment,
	StudentProgress,
	Problem,
	SectionInfo,
	FilterStatus,
	SubmissionStats,
} from "../types";

export function useAssignmentStudentProgress() {
	const { sectionId, assignmentId } = useParams<{
		sectionId: string;
		assignmentId?: string;
	}>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
	const [problems, setProblems] = useState<Problem[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [expandedProblems, setExpandedProblems] = useState<Set<number>>(
		new Set(),
	);
	const [selectedStudent, setSelectedStudent] =
		useState<StudentProgress | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [submissionStats, setSubmissionStats] = useState<
		Record<number, SubmissionStats>
	>({});
	const [progressSearchTerm, setProgressSearchTerm] = useState("");
	const [showCodeModal, setShowCodeModal] = useState(false);
	const [selectedCodeData, setSelectedCodeData] = useState<{
		student: StudentProgress;
		problem: Problem;
		codeData?: {
			studentName?: string;
			studentId?: string;
			problemTitle?: string;
			language?: string;
			submittedAt?: string;
			code?: string;
		};
	} | null>(null);
	const [loadingCode, setLoadingCode] = useState(false);
	const detailModalRef = useRef<HTMLDialogElement>(null);

	const fetchSectionInfo = useCallback(async () => {
		if (!sectionId) return;
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			const currentSectionData = (sectionsData as SectionInfo[]).find(
				(s) => s.sectionId === Number.parseInt(sectionId, 10),
			);
			setCurrentSection(currentSectionData ?? null);
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	}, [sectionId]);

	const fetchAssignments = useCallback(async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
			const sectionAssignments = await APIService.getAssignmentsBySection(
				Number.parseInt(sectionId, 10),
			);
			const list = sectionAssignments || [];
			const assignmentsWithDetails = await Promise.all(
				list.map(async (a: Assignment) => {
					try {
						const probs = await APIService.getAssignmentProblems(
							Number.parseInt(sectionId, 10),
							a.id,
						);
						const stats = await APIService.getAssignmentSubmissionStats(
							a.id,
							Number.parseInt(sectionId, 10),
						);
						return {
							...a,
							problemCount: probs?.length || 0,
							problems: probs || [],
							stats: stats || {},
						};
					} catch (error) {
						console.error(`과제 ${a.id} 정보 조회 실패:`, error);
						return { ...a, problemCount: 0, problems: [], stats: {} };
					}
				}),
			);
			setAssignments(assignmentsWithDetails);
			const stats: Record<number, SubmissionStats> = {};
			for (const a of assignmentsWithDetails as Assignment[]) {
				if (a.stats) stats[a.id] = a.stats;
			}
			setSubmissionStats(stats);
		} catch (error) {
			console.error("과제 목록 조회 실패:", error);
			setAssignments([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	const fetchAssignmentDetail = useCallback(async () => {
		if (!assignmentId || !sectionId) return;
		try {
			const response = await APIService.getAssignmentInfoBySection(
				sectionId,
				assignmentId,
			);
			const data = response?.data ?? response;
			setAssignment(data);
			const problemsData = await APIService.getAssignmentProblems(
				sectionId,
				assignmentId,
			);
			setProblems(problemsData || []);
		} catch (error) {
			console.error("과제 정보 조회 실패:", error);
			alert("과제 정보를 불러오는데 실패했습니다.");
		}
	}, [sectionId, assignmentId]);

	const fetchStudentProgress = useCallback(async () => {
		if (!assignmentId || !sectionId) return;
		try {
			setLoading(true);
			const response = await APIService.getAssignmentStudentProgress(
				assignmentId,
				sectionId,
			);
			setStudentProgress(response || []);
		} catch (error) {
			console.error("학생 진행 현황 조회 실패:", error);
			alert("학생 진행 현황을 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	}, [assignmentId, sectionId]);

	useEffect(() => {
		fetchSectionInfo();
		fetchAssignments();
		if (assignmentId) {
			fetchAssignmentDetail();
			fetchStudentProgress();
		}
	}, [
		assignmentId,
		fetchSectionInfo,
		fetchAssignments,
		fetchAssignmentDetail,
		fetchStudentProgress,
	]);

	useEffect(() => {
		const dialog = detailModalRef.current;
		if (!dialog) return;
		if (showDetailModal) dialog.showModal();
		else dialog.close();
	}, [showDetailModal]);

	useEffect(() => {
		if (problems.length > 0) {
			setExpandedProblems(new Set(problems.map((p) => p.id)));
		}
	}, [problems]);

	const getCompletionStatus = useCallback(
		(student: StudentProgress): FilterStatus => {
			const totalProblems = problems.length;
			const solvedProblems = student.solvedProblems?.length || 0;
			if (solvedProblems === 0) return "NOT_STARTED";
			if (solvedProblems === totalProblems) return "COMPLETED";
			return "IN_PROGRESS";
		},
		[problems.length],
	);

	const getProgressPercentage = useCallback(
		(student: StudentProgress): number => {
			const totalProblems = problems.length;
			const solvedProblems = student.solvedProblems?.length || 0;
			return totalProblems > 0
				? Math.round((solvedProblems / totalProblems) * 100)
				: 0;
		},
		[problems.length],
	);

	const filteredStudents = studentProgress.filter((student) => {
		const matchesSearch =
			student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
		const status = getCompletionStatus(student);
		const matchesStatus = filterStatus === "ALL" || status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const toggleProblem = useCallback((problemId: number) => {
		setExpandedProblems((prev) => {
			const next = new Set(prev);
			if (next.has(problemId)) next.delete(problemId);
			else next.add(problemId);
			return next;
		});
	}, []);

	const handleBadgeClick = useCallback(
		async (student: StudentProgress, problem: Problem) => {
			const isSolved = student.solvedProblems?.includes(problem.id);
			if (!isSolved || !sectionId || !assignmentId) return;
			try {
				setLoadingCode(true);
				setSelectedCodeData({ student, problem });
				const codeData = await APIService.getStudentAcceptedCode(
					Number(sectionId),
					Number(assignmentId),
					student.userId,
					problem.id,
				);
				setSelectedCodeData((prev) =>
					prev ? { ...prev, codeData: codeData?.data ?? codeData } : null,
				);
				setShowCodeModal(true);
			} catch (error) {
				const msg = error instanceof Error ? error.message : "알 수 없는 오류";
				alert(`코드를 불러오는데 실패했습니다: ${msg}`);
			} finally {
				setLoadingCode(false);
			}
		},
		[sectionId, assignmentId],
	);

	const filteredProgressAssignments = assignments.filter((a) => {
		const term = progressSearchTerm.toLowerCase();
		return (
			a.title.toLowerCase().includes(term) ||
			(a.description?.toLowerCase().includes(term) ?? false)
		);
	});

	return {
		sectionId,
		assignmentId,
		navigate,
		loading,
		assignments,
		assignment,
		studentProgress,
		problems,
		searchTerm,
		setSearchTerm,
		filterStatus,
		setFilterStatus,
		currentSection,
		expandedProblems,
		selectedStudent,
		setSelectedStudent,
		showDetailModal,
		setShowDetailModal,
		submissionStats,
		progressSearchTerm,
		setProgressSearchTerm,
		showCodeModal,
		setShowCodeModal,
		selectedCodeData,
		loadingCode,
		detailModalRef,
		filteredStudents,
		filteredProgressAssignments,
		getCompletionStatus,
		getProgressPercentage,
		toggleProblem,
		handleBadgeClick,
	};
}
