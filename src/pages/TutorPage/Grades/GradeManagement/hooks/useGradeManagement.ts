import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { StudentSortDir, StudentSortKey } from "../../../../../utils/studentSort";
import { compareStudentsByField } from "../../../../../utils/studentSort";
import type {
	SectionInfo,
	AssignmentItem,
	QuizItem,
	StudentGradeRow,
	ViewMode,
	CourseGradesData,
	EditingGrade,
	AssignmentProblemRow,
	AllAssignmentProblemsEntry,
	AllQuizProblemsEntry,
	CodeResponse,
	ProblemGrade,
} from "../types";

export function useGradeManagement() {
	const { sectionId } = useParams<{ sectionId?: string }>();
	const [, setSections] = useState<SectionInfo[]>([]);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
	const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
	const [selectedAssignment, setSelectedAssignment] =
		useState<AssignmentItem | null>(null);
	const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);
	const [grades, setGrades] = useState<StudentGradeRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const gradeSortRef = useRef<{
		key: StudentSortKey;
		dir: StudentSortDir;
	}>({ key: "studentName", dir: "asc" });
	const [gradeSort, setGradeSort] = useState(gradeSortRef.current);
	const gradeSortKey = gradeSort.key;
	const gradeSortDir = gradeSort.dir;
	const [editingGrade, setEditingGrade] = useState<EditingGrade | null>(null);
	const [gradeInputs, setGradeInputs] = useState<Record<string, number | "">>(
		{},
	);
	const [comments, setComments] = useState<Record<string, string>>({});
	const [viewMode, setViewMode] = useState<ViewMode>("course");
	const [courseGrades, setCourseGrades] = useState<CourseGradesData | null>(
		null,
	);
	const [courseLoading, setCourseLoading] = useState(false);
	const [showCodeModal, setShowCodeModal] = useState(false);
	const [selectedCode, setSelectedCode] = useState<CodeResponse | null>(null);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [showStatsModal, setShowStatsModal] = useState(false);
	const [showPointsModal, setShowPointsModal] = useState(false);
	const [pointsInputs, setPointsInputs] = useState<Record<string, number | "">>(
		{},
	);
	const [pointsSaving, setPointsSaving] = useState(false);
	const [assignmentProblems, setAssignmentProblems] = useState<
		AssignmentProblemRow[]
	>([]);
	const [loadingProblems, setLoadingProblems] = useState(false);
	const [allAssignmentProblems, setAllAssignmentProblems] = useState<
		AllAssignmentProblemsEntry[]
	>([]);
	const [allQuizProblems, setAllQuizProblems] = useState<
		AllQuizProblemsEntry[]
	>([]);
	const [bulkInputs, setBulkInputs] = useState<Record<number, number | "">>({});
	const [bulkSaving, setBulkSaving] = useState(false);
	const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
	const [problemDetail, setProblemDetail] = useState<{
		title?: string;
		description?: string;
		timeLimit?: number;
		memoryLimit?: number;
	} | null>(null);

	const fetchQuizGrades = useCallback(async () => {
		if (!selectedQuiz || !sectionId) return;
		try {
			setLoading(true);
			const response = await APIService.getQuizGrades(
				sectionId,
				selectedQuiz.id,
			);
			const gradesData = response?.data ?? response ?? [];
			setGrades(Array.isArray(gradesData) ? gradesData : []);
			const initialInputs: Record<string, number | ""> = {};
			const initialComments: Record<string, string> = {};
			for (const student of Array.isArray(gradesData) ? gradesData : []) {
				for (const problem of student.problemGrades ?? []) {
					const key = `${student.userId}-${problem.problemId}`;
					if (problem.score !== null && problem.score !== undefined) {
						initialInputs[key] = problem.score;
					}
				}
			}
			setGradeInputs(initialInputs);
			setComments(initialComments);
		} catch (error) {
			console.error("퀴즈 성적 조회 실패:", error);
			setGrades([]);
		} finally {
			setLoading(false);
		}
	}, [selectedQuiz, sectionId]);

	const fetchGrades = useCallback(async () => {
		if (!selectedAssignment || !sectionId) return;
		try {
			setLoading(true);
			const response = await APIService.getAssignmentGrades(
				sectionId,
				selectedAssignment.id,
			);
			const gradesData = response?.data ?? response ?? [];
			setGrades(Array.isArray(gradesData) ? gradesData : []);
			const initialInputs: Record<string, number | ""> = {};
			const initialComments: Record<string, string> = {};
			for (const student of Array.isArray(gradesData) ? gradesData : []) {
				for (const problem of student.problemGrades ?? []) {
					const key = `${student.userId}-${problem.problemId}`;
					if (problem.score !== null && problem.score !== undefined) {
						initialInputs[key] = problem.score;
					}
				}
			}
			setGradeInputs(initialInputs);
			setComments(initialComments);
		} catch (error) {
			console.error("성적 조회 실패:", error);
			setGrades([]);
		} finally {
			setLoading(false);
		}
	}, [selectedAssignment, sectionId]);

	useEffect(() => {
		if (selectedAssignment && sectionId) {
			fetchGrades();
		} else if (selectedQuiz && sectionId) {
			fetchQuizGrades();
		}
	}, [
		selectedAssignment,
		selectedQuiz,
		sectionId,
		fetchGrades,
		fetchQuizGrades,
	]);

	const fetchCourseGrades = useCallback(async () => {
		if (!sectionId || (assignments.length === 0 && quizzes.length === 0)) {
			return;
		}
		try {
			setCourseLoading(true);
			const assignmentGradeResults = await Promise.all(
				assignments.map(async (assignment) => {
					try {
						const response = await APIService.getAssignmentGrades(
							sectionId,
							assignment.id,
						);
						const gradesData = response?.data ?? response ?? [];
						return {
							type: "assignment" as const,
							item: assignment,
							grades: Array.isArray(gradesData) ? gradesData : [],
						};
					} catch (error) {
						console.error(
							"수업 전체 성적 조회 중 과제별 조회 실패:",
							assignment.id,
							error,
						);
						return {
							type: "assignment" as const,
							item: assignment,
							grades: [] as StudentGradeRow[],
						};
					}
				}),
			);

			const quizResults = await Promise.all(
				quizzes.map(async (quiz) => {
					try {
						const gradesResponse = await APIService.getQuizGrades(
							sectionId,
							quiz.id,
						);
						const quizGrades = gradesResponse?.data ?? gradesResponse ?? [];
						const arr = Array.isArray(quizGrades) ? quizGrades : [];
						const problems =
							arr.length > 0 && arr[0]?.problemGrades
								? arr[0].problemGrades.map(
										(pg: {
											problemId: number;
											problemTitle?: string;
											points?: number;
										}) => ({
											problemId: pg.problemId,
											problemTitle: pg.problemTitle,
											points: pg.points ?? 1,
										}),
									)
								: [];
						return {
							type: "quiz" as const,
							item: quiz,
							problems,
							grades: arr,
						};
					} catch (error) {
						console.error(
							"수업 전체 성적 조회 중 퀴즈별 조회 실패:",
							quiz.id,
							error,
						);
						return {
							type: "quiz" as const,
							item: quiz,
							problems: [] as {
								problemId: number;
								problemTitle?: string;
								points?: number;
							}[],
							grades: [] as StudentGradeRow[],
						};
					}
				}),
			);

			const studentMap = new Map<number, CourseGradesData["students"][0]>();
			const courseItems: CourseGradesData["items"] = [];

			for (const {
				item: assignment,
				grades: assignmentGrades,
			} of assignmentGradeResults) {
				if (!assignmentGrades.length) continue;
				const hasProblems =
					assignmentGrades[0]?.problemGrades &&
					assignmentGrades[0].problemGrades.length > 0;
				const problems = hasProblems
					? assignmentGrades[0].problemGrades.map(
							(p: {
								problemId: number;
								problemTitle?: string;
								points?: number;
							}) => ({
								problemId: p.problemId,
								problemTitle: p.problemTitle,
								points: p.points,
							}),
						)
					: [];
				const totalPoints = hasProblems
					? (assignmentGrades[0].totalPoints ??
						problems.reduce((sum, p) => sum + (p.points ?? 0), 0))
					: 0;
				const assignmentDue =
					(assignment as AssignmentItem).dueDate ??
					(assignment as { endDate?: string }).endDate ??
					(assignment as { deadline?: string }).deadline;
				courseItems.push({
					type: "assignment",
					id: assignment.id,
					title: assignment.title,
					problems,
					totalPoints,
					dueAt: assignmentDue,
				});
				for (const student of assignmentGrades) {
					if (!studentMap.has(student.userId)) {
						studentMap.set(student.userId, {
							userId: student.userId,
							studentName: student.studentName,
							studentId: student.studentId,
							assignments: {},
							quizzes: {},
						});
					}
					const studentEntry = studentMap.get(student.userId);
					if (!studentEntry) continue;
					const problemsMap: Record<number, ProblemGrade> = {};
					for (const pg of student.problemGrades ?? []) {
						problemsMap[pg.problemId] = pg;
					}
					const totalScore = student.totalScore ?? 0;
					const assignmentTotalPoints = student.totalPoints ?? totalPoints ?? 0;
					const ratio =
						assignmentTotalPoints > 0
							? `${((totalScore / assignmentTotalPoints) * 100).toFixed(1)}`
							: "0.0";
					studentEntry.assignments[assignment.id] = {
						totalScore,
						totalPoints: assignmentTotalPoints,
						ratio,
						problems: problemsMap,
					};
				}
			}

			// 코딩 테스트(퀴즈): 같은 제목이면 하나의 항목으로 묶어서 과제처럼 "항목 안에 문제 N개"로 표시
			const quizGroupsByTitle = new Map<
				string,
				{
					item: QuizItem;
					problems: {
						problemId: number;
						problemTitle?: string;
						points?: number;
					}[];
					grades: StudentGradeRow[];
				}[]
			>();
			for (const { item: quiz, problems, grades: quizGrades } of quizResults) {
				const title = quiz.title ?? "";
				if (!quizGroupsByTitle.has(title)) {
					quizGroupsByTitle.set(title, []);
				}
				const list = quizGroupsByTitle.get(title);
				if (list) {
					list.push({
						item: quiz,
						problems: problems.map((p) => ({
							problemId: p.problemId ?? (p as { id?: number }).id ?? 0,
							problemTitle:
								(p as { problemTitle?: string }).problemTitle ??
								(p as { title?: string }).title,
							points: p.points ?? 1,
						})),
						grades: quizGrades ?? [],
					});
				}
			}

			for (const [, group] of quizGroupsByTitle) {
				if (group.length === 0) continue;
				const first = group[0];
				const mergedProblems = group.flatMap((g) => g.problems);
				if (mergedProblems.length === 0) continue;
				const totalPoints = mergedProblems.reduce(
					(sum, p) => sum + (p.points ?? 1),
					0,
				);
				const quizDue = (first.item as QuizItem).endTime;
				courseItems.push({
					type: "quiz",
					id: first.item.id,
					title: first.item.title,
					problems: mergedProblems,
					totalPoints,
					dueAt: quizDue,
				});
				// 학생별로 그룹 내 퀴즈 성적 합쳐서 한 항목으로 저장
				const studentToMerged = new Map<
					number,
					{
						totalScore: number;
						totalPoints: number;
						problems: Record<number, ProblemGrade>;
					}
				>();
				for (const g of group) {
					for (const student of g.grades) {
						if (!studentToMerged.has(student.userId)) {
							studentToMerged.set(student.userId, {
								totalScore: 0,
								totalPoints: 0,
								problems: {},
							});
						}
						const merged = studentToMerged.get(student.userId);
						if (merged) {
							merged.totalScore += student.totalScore ?? 0;
							merged.totalPoints += student.totalPoints ?? 0;
							for (const pg of student.problemGrades ?? []) {
								merged.problems[pg.problemId] = pg;
							}
						}
					}
				}
				for (const [userId, merged] of studentToMerged) {
					if (!studentMap.has(userId)) {
						const firstStudent = group
							.flatMap((g) => g.grades)
							.find((s) => s.userId === userId);
						studentMap.set(userId, {
							userId,
							studentName: firstStudent?.studentName,
							studentId: firstStudent?.studentId,
							assignments: {},
							quizzes: {},
						});
					}
					const studentEntry = studentMap.get(userId);
					if (!studentEntry) continue;
					const ratio =
						merged.totalPoints > 0
							? `${((merged.totalScore / merged.totalPoints) * 100).toFixed(1)}`
							: "0.0";
					studentEntry.quizzes[first.item.id] = {
						totalScore: merged.totalScore,
						totalPoints: merged.totalPoints,
						ratio,
						problems: merged.problems,
					};
				}
			}

			setCourseGrades({
				items: courseItems,
				students: Array.from(studentMap.values()),
			});
		} catch (error) {
			console.error("수업 전체 성적 조회 실패:", error);
			setCourseGrades(null);
		} finally {
			setCourseLoading(false);
		}
	}, [sectionId, assignments, quizzes]);

	const fetchData = useCallback(async () => {
		try {
			setLoading(true);
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data ?? dashboardResponse ?? [];
			setSections(Array.isArray(sectionsData) ? sectionsData : []);

			if (sectionId) {
				const parsedId = Number.parseInt(sectionId, 10);
				const currentSectionData = (
					Array.isArray(sectionsData) ? sectionsData : []
				).find((s: { sectionId: number }) => s.sectionId === parsedId);
				setCurrentSection((currentSectionData ?? null) as SectionInfo | null);

				try {
					const assignmentsResponse =
						await APIService.getAssignmentsBySection(sectionId);
					const assignmentsData =
						assignmentsResponse?.data ?? assignmentsResponse ?? [];
					const arr = Array.isArray(assignmentsData) ? assignmentsData : [];
					setAssignments(arr);
				} catch (error) {
					console.error("과제 목록 조회 실패:", error);
					setAssignments([]);
				}

				try {
					const quizzesResponse =
						await APIService.getQuizzesBySection(sectionId);
					const quizzesData = quizzesResponse?.data ?? quizzesResponse ?? [];
					setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
				} catch (error) {
					console.error("퀴즈 목록 조회 실패:", error);
					setQuizzes([]);
				}
			}
		} catch (error) {
			console.error("데이터 조회 실패:", error);
			setSections([]);
			setAssignments([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (
			(viewMode === "course" ||
				viewMode === "assignment" ||
				viewMode === "quiz") &&
			sectionId &&
			(assignments.length > 0 || quizzes.length > 0)
		) {
			fetchCourseGrades();
		}
	}, [
		viewMode,
		sectionId,
		assignments.length,
		quizzes.length,
		fetchCourseGrades,
	]);

	const handleSaveGrade = useCallback(
		async (
			userId: number,
			problemId: number,
			score: number | "",
			comment: string,
		) => {
			if (!selectedAssignment || !sectionId) return;
			try {
				const gradeData = {
					userId,
					problemId,
					score: score !== null && score !== "" ? Number(score) : null,
					comment: comment || null,
				};
				await APIService.saveGrade(sectionId, selectedAssignment.id, gradeData);
				await fetchGrades();
				setEditingGrade(null);
				alert("성적이 저장되었습니다.");
			} catch (error) {
				console.error("성적 저장 실패:", error);
				alert(`성적 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
			}
		},
		[selectedAssignment, sectionId, fetchGrades],
	);

	const handleViewCode = useCallback(
		async (userId: number, problemId: number) => {
			if (!selectedAssignment || !sectionId) return;
			try {
				const codeResponse = await APIService.getStudentAcceptedCode(
					sectionId,
					selectedAssignment.id,
					userId,
					problemId,
				);
				setSelectedCode(codeResponse);
				setShowCodeModal(true);
			} catch (error) {
				console.error("코드 조회 실패:", error);
				alert("코드를 불러올 수 없습니다.");
			}
		},
		[selectedAssignment, sectionId],
	);

	const handleSaveGradeForAssignment = useCallback(
		async (
			assignmentId: number,
			userId: number,
			problemId: number,
			score: number | "",
			comment: string,
		) => {
			if (!sectionId) return;
			try {
				const gradeData = {
					userId,
					problemId,
					score: score !== null && score !== "" ? Number(score) : null,
					comment: comment || null,
				};
				await APIService.saveGrade(sectionId, assignmentId, gradeData);
				await fetchCourseGrades();
				setEditingGrade(null);
				alert("성적이 저장되었습니다.");
			} catch (error) {
				console.error("성적 저장 실패:", error);
				alert(`성적 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
			}
		},
		[sectionId, fetchCourseGrades],
	);

	const handleViewCodeForAssignment = useCallback(
		async (assignmentId: number, userId: number, problemId: number) => {
			if (!sectionId) return;
			try {
				const codeResponse = await APIService.getStudentAcceptedCode(
					sectionId,
					assignmentId,
					userId,
					problemId,
				);
				setSelectedCode(codeResponse);
				setShowCodeModal(true);
			} catch (error) {
				console.error("코드 조회 실패:", error);
				alert("코드를 불러올 수 없습니다.");
			}
		},
		[sectionId],
	);

	const handleViewCodeForQuiz = useCallback(
		async (quizId: number, userId: number, problemId: number) => {
			if (!sectionId) return;
			try {
				const codeResponse = await APIService.getStudentQuizAcceptedCode(
					sectionId,
					quizId,
					userId,
					problemId,
				);
				setSelectedCode(codeResponse);
				setShowCodeModal(true);
			} catch (error) {
				console.error("퀴즈 코드 조회 실패:", error);
				alert("코드를 불러올 수 없습니다.");
			}
		},
		[sectionId],
	);

	const openProblemDetail = useCallback(async (problemId: number) => {
		try {
			const response = await APIService.getProblemInfo(problemId);
			const info = response?.data ?? response ?? {};
			let description: string | undefined =
				info.description != null ? String(info.description) : undefined;
			try {
				const parsed = await APIService.parseProblemZip(problemId);
				const data = parsed?.data ?? parsed;
				if (data?.description != null) {
					description =
						typeof data.description === "string"
							? data.description
							: String(data.description);
				}
			} catch {
				// ignore parse failure
			}
			setProblemDetail({
				title: info.title ?? "문제",
				description,
				timeLimit:
					info.timeLimit != null ? Number(info.timeLimit) : undefined,
				memoryLimit:
					info.memoryLimit != null ? Number(info.memoryLimit) : undefined,
			});
			setShowProblemDetailModal(true);
		} catch (err) {
			console.error("문제 정보 조회 실패:", err);
			alert("문제 정보를 불러오는데 실패했습니다.");
		}
	}, []);

	const closeProblemDetailModal = useCallback(() => {
		setShowProblemDetailModal(false);
		setProblemDetail(null);
	}, []);

	const handleSaveGradeForQuiz = useCallback(
		async (
			userId: number,
			problemId: number,
			score: number | "",
			comment: string,
		) => {
			if (!selectedQuiz || !sectionId) return;
			try {
				const gradeData = {
					userId,
					problemId,
					score: score !== null && score !== "" ? Number(score) : null,
					comment: comment || null,
				};
				await APIService.saveQuizGrade(sectionId, selectedQuiz.id, gradeData);
				await fetchQuizGrades();
				setEditingGrade(null);
				alert("성적이 저장되었습니다.");
			} catch (error) {
				console.error("퀴즈 성적 저장 실패:", error);
				alert(`성적 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
			}
		},
		[selectedQuiz, sectionId, fetchQuizGrades],
	);

	/** 수업 전체 보기에서 퀴즈 셀 저장 시 사용 (quizId 전달) */
	const handleSaveGradeForQuizCourse = useCallback(
		async (
			quizId: number,
			userId: number,
			problemId: number,
			score: number | "",
			comment: string,
		) => {
			if (!sectionId) return;
			try {
				const gradeData = {
					userId,
					problemId,
					score: score !== null && score !== "" ? Number(score) : null,
					comment: comment || null,
				};
				await APIService.saveQuizGrade(sectionId, quizId, gradeData);
				await fetchCourseGrades();
				setEditingGrade(null);
				alert("성적이 저장되었습니다.");
			} catch (error) {
				console.error("퀴즈 성적 저장 실패:", error);
				alert(`성적 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
			}
		},
		[sectionId, fetchCourseGrades],
	);

	const getSectionDisplayName = useCallback(() => {
		if (!currentSection) return "";
		const s = currentSection as {
			courseTitle?: string;
			sectionNumber?: string;
			sectionInfo?: { courseTitle?: string; sectionNumber?: string };
		};
		const title = s.courseTitle ?? s.sectionInfo?.courseTitle ?? "";
		const num = s.sectionNumber ?? s.sectionInfo?.sectionNumber ?? "";
		return num ? `${title} - ${num}분반` : title;
	}, [currentSection]);

	const toggleGradeStudentSort = useCallback((key: StudentSortKey) => {
		const prev = gradeSortRef.current;
		const next =
			prev.key === key
				? { key, dir: (prev.dir === "asc" ? "desc" : "asc") as StudentSortDir }
				: { key, dir: "asc" as StudentSortDir };
		gradeSortRef.current = next;
		setGradeSort(next);
	}, []);

	const filteredGrades = useMemo(() => {
		const term = searchTerm.toLowerCase();
		const filtered = grades.filter(
			(grade) =>
				grade.studentName?.toLowerCase().includes(term) ||
				grade.studentId?.toLowerCase().includes(term),
		);
		return [...filtered].sort((a, b) =>
			compareStudentsByField(
				a.studentName,
				a.studentId,
				b.studentName,
				b.studentId,
				gradeSortKey,
				gradeSortDir,
			),
		);
	}, [grades, searchTerm, gradeSortKey, gradeSortDir]);

	const filteredCourseStudents = useMemo(() => {
		if (!courseGrades?.students) return [];
		const lower = searchTerm.toLowerCase();
		const filtered = courseGrades.students.filter(
			(student) =>
				student.studentName?.toLowerCase().includes(lower) ||
				student.studentId?.toLowerCase().includes(lower),
		);
		return [...filtered].sort((a, b) =>
			compareStudentsByField(
				a.studentName,
				a.studentId,
				b.studentName,
				b.studentId,
				gradeSortKey,
				gradeSortDir,
			),
		);
	}, [courseGrades, searchTerm, gradeSortKey, gradeSortDir]);

	const handleExportCSV = useCallback(() => {
		const formatDateForCSV = (s: string | undefined): string =>
			s ? `"${new Date(s).toLocaleString("ko-KR")}"` : '""';
		const getSubmissionDisplayForCSV = (
			submittedAt: string | undefined,
			dueAt: string | undefined,
		): string => {
			if (submittedAt) return formatDateForCSV(submittedAt);
			if (dueAt && new Date() > new Date(dueAt)) return '"미제출"';
			return '""';
		};
		const getLateMinutesForCSV = (
			submittedAt: string | undefined,
			dueAt: string | undefined,
		): number => {
			if (!submittedAt || !dueAt) return 0;
			const parse = (raw?: string): number => {
				if (!raw) return Number.NaN;
				const normalized = raw.trim().replace(" ", "T");
				const m = normalized
					.trim()
					.match(
						/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/,
					);
				if (!m) return new Date(normalized).getTime();
				const ms = Number((m[7] ?? "0").slice(0, 3).padEnd(3, "0"));
				return new Date(
					Number(m[1]),
					Number(m[2]) - 1,
					Number(m[3]),
					Number(m[4]),
					Number(m[5]),
					Number(m[6] ?? "0"),
					ms,
				).getTime();
			};
			const s = parse(submittedAt);
			const d = parse(dueAt);
			if (Number.isNaN(s) || Number.isNaN(d) || s <= d) return 0;
			return Math.floor((s - d) / 60000);
		};
		const formatLateDurationForCSV = (
			submittedAt: string | undefined,
			dueAt: string | undefined,
		): string => {
			const minutes = getLateMinutesForCSV(submittedAt, dueAt);
			if (!minutes || minutes <= 0) return '""';
			const days = Math.floor(minutes / (24 * 60));
			const hours = Math.floor((minutes % (24 * 60)) / 60);
			const mins = minutes % 60;
			const parts: string[] = [];
			if (days > 0) parts.push(`${days}일`);
			if (hours > 0) parts.push(`${hours}시간`);
			if (mins > 0 || parts.length === 0) parts.push(`${mins}분`);
			return `"${parts.join(" ")}"`;
		};

		// 전체 과제 보기: 과제만 필터한 courseGrades로 내보내기
		if (
			viewMode === "assignment" &&
			!selectedAssignment &&
			courseGrades?.items?.length &&
			filteredCourseStudents.length > 0
		) {
			const assignmentItems = courseGrades.items.filter(
				(i) => i.type === "assignment",
			);
			if (assignmentItems.length > 0) {
				const headers = ["학생명", "학번"];
				for (const item of assignmentItems) {
					for (const problem of item.problems) {
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
						);
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} 제출일자`,
						);
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} 마감일자`,
						);
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} 지각시간`,
						);
					}
					headers.push(`${item.title} 총점`);
				}
				headers.push("전체 총점", "전체 비율(%)");
				const rows = [headers.join(",")];
				for (const student of filteredCourseStudents) {
					const row: string[] = [
						`"${student.studentName ?? ""}"`,
						`"${student.studentId ?? ""}"`,
					];
					let totalAllScore = 0;
					let totalAllPoints = 0;
					for (const item of assignmentItems) {
						const assignmentData = student.assignments?.[item.id];
						const dueAt = item.dueAt;
						for (const problem of item.problems) {
							const problemGrade =
								assignmentData?.problems?.[problem.problemId];
							const score =
								problemGrade?.score !== null &&
								problemGrade?.score !== undefined
									? problemGrade.score
									: "";
							row.push(String(score));
							row.push(
								getSubmissionDisplayForCSV(problemGrade?.submittedAt, dueAt),
							);
							row.push(formatDateForCSV(dueAt));
							row.push(formatLateDurationForCSV(problemGrade?.submittedAt, dueAt));
							if (typeof score === "number") {
								totalAllScore += score;
							}
							totalAllPoints += problem.points ?? 0;
						}
						if (assignmentData) {
							row.push(
								`${assignmentData.totalScore} / ${assignmentData.totalPoints}`,
							);
						} else {
							row.push("-");
						}
					}
					const totalRatio =
						totalAllPoints > 0
							? ((totalAllScore / totalAllPoints) * 100).toFixed(1)
							: "0.0";
					row.push(`${totalAllScore} / ${totalAllPoints}`, totalRatio);
					rows.push(row.join(","));
				}
				const csvContent = rows.join("\n");
				const blob = new Blob([`\uFEFF${csvContent}`], {
					type: "text/csv;charset=utf-8;",
				});
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				const fileName = currentSection
					? `${(currentSection as { courseTitle?: string }).courseTitle ?? ""}_${(currentSection as { sectionNumber?: string }).sectionNumber ?? ""}분반_과제전체성적_${new Date().toISOString().split("T")[0]}.csv`
					: `과제전체성적_${new Date().toISOString().split("T")[0]}.csv`;
				link.setAttribute("download", fileName);
				link.style.visibility = "hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(link.href);
				return;
			}
		}

		// 전체 퀴즈 보기: 퀴즈만 필터한 courseGrades로 내보내기
		if (
			viewMode === "quiz" &&
			!selectedQuiz &&
			courseGrades?.items?.length &&
			filteredCourseStudents.length > 0
		) {
			const quizItems = courseGrades.items.filter((i) => i.type === "quiz");
			if (quizItems.length > 0) {
				const headers = ["학생명", "학번"];
				for (const item of quizItems) {
					for (const problem of item.problems) {
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
						);
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} 제출일자`,
						);
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} 마감일자`,
						);
						headers.push(
							`${item.title} - ${problem.problemTitle ?? ""} 지각시간`,
						);
					}
					headers.push(`${item.title} 총점`);
				}
				headers.push("전체 총점", "전체 비율(%)");
				const rows = [headers.join(",")];
				for (const student of filteredCourseStudents) {
					const row: string[] = [
						`"${student.studentName ?? ""}"`,
						`"${student.studentId ?? ""}"`,
					];
					let totalAllScore = 0;
					let totalAllPoints = 0;
					for (const item of quizItems) {
						const quizData = student.quizzes?.[item.id];
						const dueAt = item.dueAt;
						for (const problem of item.problems) {
							const problemGrade = quizData?.problems?.[problem.problemId];
							const score =
								problemGrade?.score !== null &&
								problemGrade?.score !== undefined
									? problemGrade.score
									: "";
							row.push(String(score));
							row.push(
								getSubmissionDisplayForCSV(problemGrade?.submittedAt, dueAt),
							);
							row.push(formatDateForCSV(dueAt));
							row.push(formatLateDurationForCSV(problemGrade?.submittedAt, dueAt));
							if (typeof score === "number") {
								totalAllScore += score;
							}
							totalAllPoints += problem.points ?? 0;
						}
						if (quizData) {
							row.push(`${quizData.totalScore} / ${quizData.totalPoints}`);
						} else {
							row.push("-");
						}
					}
					const totalRatio =
						totalAllPoints > 0
							? ((totalAllScore / totalAllPoints) * 100).toFixed(1)
							: "0.0";
					row.push(`${totalAllScore} / ${totalAllPoints}`, totalRatio);
					rows.push(row.join(","));
				}
				const csvContent = rows.join("\n");
				const blob = new Blob([`\uFEFF${csvContent}`], {
					type: "text/csv;charset=utf-8;",
				});
				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob);
				const fileName = currentSection
					? `${(currentSection as { courseTitle?: string }).courseTitle ?? ""}_${(currentSection as { sectionNumber?: string }).sectionNumber ?? ""}분반_퀴즈전체성적_${new Date().toISOString().split("T")[0]}.csv`
					: `퀴즈전체성적_${new Date().toISOString().split("T")[0]}.csv`;
				link.setAttribute("download", fileName);
				link.style.visibility = "hidden";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(link.href);
				return;
			}
		}

		if (
			viewMode === "course" &&
			courseGrades?.items?.length &&
			filteredCourseStudents.length > 0
		) {
			const headers = ["학생명", "학번"];
			for (const item of courseGrades.items) {
				for (const problem of item.problems) {
					headers.push(
						`${item.title} - ${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
					);
					headers.push(
						`${item.title} - ${problem.problemTitle ?? ""} 제출일자`,
					);
					headers.push(
						`${item.title} - ${problem.problemTitle ?? ""} 마감일자`,
					);
					headers.push(
						`${item.title} - ${problem.problemTitle ?? ""} 지각시간`,
					);
				}
				headers.push(`${item.title} 총점`);
			}
			headers.push("전체 총점", "전체 비율(%)");
			const rows = [headers.join(",")];
			for (const student of filteredCourseStudents) {
				const row: string[] = [
					`"${student.studentName ?? ""}"`,
					`"${student.studentId ?? ""}"`,
				];
				let totalAllScore = 0;
				let totalAllPoints = 0;
				for (const item of courseGrades.items) {
					const dueAt = item.dueAt;
					if (item.type === "assignment") {
						const assignmentData = student.assignments?.[item.id];
						for (const problem of item.problems) {
							const problemGrade =
								assignmentData?.problems?.[problem.problemId];
							const score =
								problemGrade?.score !== null &&
								problemGrade?.score !== undefined
									? problemGrade.score
									: "";
							row.push(String(score));
							row.push(
								getSubmissionDisplayForCSV(problemGrade?.submittedAt, dueAt),
							);
							row.push(formatDateForCSV(dueAt));
							row.push(formatLateDurationForCSV(problemGrade?.submittedAt, dueAt));
							if (score !== "" && score !== null && typeof score === "number") {
								totalAllScore += score;
							}
							totalAllPoints += problem.points ?? 0;
						}
						if (assignmentData) {
							row.push(
								`${assignmentData.totalScore} / ${assignmentData.totalPoints}`,
							);
							totalAllScore += assignmentData.totalScore;
							totalAllPoints += assignmentData.totalPoints;
						} else {
							row.push("-");
						}
					} else if (item.type === "quiz") {
						const quizData = student.quizzes?.[item.id];
						for (const problem of item.problems) {
							const problemGrade = quizData?.problems?.[problem.problemId];
							const score =
								problemGrade?.score !== null &&
								problemGrade?.score !== undefined
									? problemGrade.score
									: "";
							row.push(String(score));
							row.push(
								getSubmissionDisplayForCSV(problemGrade?.submittedAt, dueAt),
							);
							row.push(formatDateForCSV(dueAt));
							row.push(formatLateDurationForCSV(problemGrade?.submittedAt, dueAt));
							if (score !== "" && score !== null && typeof score === "number") {
								totalAllScore += score;
							}
							totalAllPoints += problem.points ?? 0;
						}
						if (quizData) {
							row.push(`${quizData.totalScore} / ${quizData.totalPoints}`);
							totalAllScore += quizData.totalScore;
							totalAllPoints += quizData.totalPoints;
						} else {
							row.push("-");
						}
					}
				}
				const totalRatio =
					totalAllPoints > 0
						? ((totalAllScore / totalAllPoints) * 100).toFixed(1)
						: "0.0";
				row.push(`${totalAllScore} / ${totalAllPoints}`, totalRatio);
				rows.push(row.join(","));
			}
			const csvContent = rows.join("\n");
			const blob = new Blob([`\uFEFF${csvContent}`], {
				type: "text/csv;charset=utf-8;",
			});
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			const fileName = currentSection
				? `${(currentSection as { courseTitle?: string }).courseTitle ?? ""}_${(currentSection as { sectionNumber?: string }).sectionNumber ?? ""}분반_전체성적_${new Date().toISOString().split("T")[0]}.csv`
				: `전체성적_${new Date().toISOString().split("T")[0]}.csv`;
			link.setAttribute("download", fileName);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
			return;
		}

		if (viewMode === "quiz" && selectedQuiz && grades.length > 0) {
			const quizDueAt = selectedQuiz.endTime;
			const headers = ["학생명", "학번"];
			if (grades[0]?.problemGrades) {
				for (const problem of grades[0].problemGrades) {
					headers.push(
						`${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
					);
					headers.push(`${problem.problemTitle ?? ""} 제출일자`);
					headers.push(`${problem.problemTitle ?? ""} 마감일자`);
					headers.push(`${problem.problemTitle ?? ""} 지각시간`);
				}
			}
			headers.push("총점", "비율(%)");
			const rows = [headers.join(",")];
			for (const student of filteredGrades) {
				const row: string[] = [
					`"${student.studentName ?? ""}"`,
					`"${student.studentId ?? ""}"`,
				];
				for (const problem of student.problemGrades ?? []) {
					const score =
						problem.score !== null && problem.score !== undefined
							? problem.score
							: "";
					row.push(String(score));
					row.push(getSubmissionDisplayForCSV(problem.submittedAt, quizDueAt));
					row.push(formatDateForCSV(quizDueAt));
					row.push(formatLateDurationForCSV(problem.submittedAt, quizDueAt));
				}
				const totalScore = student.totalScore ?? 0;
				const totalPoints = student.totalPoints ?? 0;
				const ratio =
					totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
				row.push(String(totalScore), String(ratio));
				rows.push(row.join(","));
			}
			const csvContent = rows.join("\n");
			const blob = new Blob([`\uFEFF${csvContent}`], {
				type: "text/csv;charset=utf-8;",
			});
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.setAttribute(
				"download",
				`${selectedQuiz.title}_성적_${new Date().toISOString().split("T")[0]}.csv`,
			);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(link.href);
			return;
		}

		if (!selectedAssignment || grades.length === 0) {
			alert("내보낼 성적 데이터가 없습니다.");
			return;
		}

		const assignmentDueAt =
			selectedAssignment.dueDate ??
			(selectedAssignment as { endDate?: string }).endDate ??
			(selectedAssignment as { deadline?: string }).deadline;
		const headers = ["학생명", "학번"];
		if (grades[0]?.problemGrades) {
			for (const problem of grades[0].problemGrades) {
				headers.push(
					`${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
				);
				headers.push(`${problem.problemTitle ?? ""} 제출일자`);
				headers.push(`${problem.problemTitle ?? ""} 마감일자`);
				headers.push(`${problem.problemTitle ?? ""} 지각시간`);
			}
		}
		headers.push("총점", "비율(%)");
		const rows = [headers.join(",")];
		for (const student of filteredGrades) {
			const row: string[] = [
				`"${student.studentName ?? ""}"`,
				`"${student.studentId ?? ""}"`,
			];
			for (const problem of student.problemGrades ?? []) {
				const score =
					problem.score !== null && problem.score !== undefined
						? problem.score
						: "";
				row.push(String(score));
				row.push(
					getSubmissionDisplayForCSV(problem.submittedAt, assignmentDueAt),
				);
				row.push(formatDateForCSV(assignmentDueAt));
				row.push(formatLateDurationForCSV(problem.submittedAt, assignmentDueAt));
			}
			const totalScore = student.totalScore ?? 0;
			const totalPoints = student.totalPoints ?? 0;
			const ratio =
				totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
			row.push(String(totalScore), String(ratio));
			rows.push(row.join(","));
		}
		const csvContent = rows.join("\n");
		const blob = new Blob([`\uFEFF${csvContent}`], {
			type: "text/csv;charset=utf-8;",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.setAttribute(
			"download",
			`${selectedAssignment.title}_성적_${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href);
	}, [
		viewMode,
		courseGrades,
		filteredCourseStudents,
		filteredGrades,
		grades,
		selectedQuiz,
		selectedAssignment,
		currentSection,
	]);

	const handleBulkSave = useCallback(async () => {
		if (!sectionId || Object.keys(bulkInputs).length === 0) {
			alert("입력할 점수가 없습니다.");
			return;
		}
		const isQuiz = viewMode === "quiz" && selectedQuiz;
		const isAssignment = viewMode === "assignment" && selectedAssignment;
		if (!isQuiz && !isAssignment) {
			alert("과제 또는 퀴즈를 선택해 주세요.");
			return;
		}
		try {
			setBulkSaving(true);
			const bulkData: {
				grades: { userId: number; problemId: number; score: number }[];
			} = {
				grades: [],
			};
			for (const student of filteredGrades) {
				for (const problem of student.problemGrades ?? []) {
					const problemId = problem.problemId;
					const val = bulkInputs[problemId];
					if (val !== undefined && val !== "" && typeof val === "number") {
						bulkData.grades.push({
							userId: student.userId,
							problemId,
							score: val,
						});
					}
				}
			}
			if (bulkData.grades.length === 0) {
				alert("입력할 점수가 없습니다.");
				setBulkSaving(false);
				return;
			}
			if (isQuiz && selectedQuiz) {
				await APIService.saveBulkQuizGrades(
					sectionId,
					selectedQuiz.id,
					bulkData,
				);
				await fetchQuizGrades();
			} else if (selectedAssignment) {
				await APIService.saveBulkGrades(
					sectionId,
					selectedAssignment.id,
					bulkData,
				);
				await fetchGrades();
			}
			setShowBulkModal(false);
			setBulkInputs({});
			alert(`${bulkData.grades.length}개의 성적이 저장되었습니다.`);
		} catch (error) {
			console.error("일괄 성적 저장 실패:", error);
			alert(`일괄 성적 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
		} finally {
			setBulkSaving(false);
		}
	}, [
		viewMode,
		selectedAssignment,
		selectedQuiz,
		sectionId,
		bulkInputs,
		filteredGrades,
		fetchGrades,
		fetchQuizGrades,
	]);

	const handleShowBulkModal = useCallback(() => {
		const assignmentOk =
			viewMode === "assignment" && selectedAssignment && grades.length > 0;
		const quizOk = viewMode === "quiz" && selectedQuiz && grades.length > 0;
		if (assignmentOk || quizOk) {
			setShowBulkModal(true);
		} else {
			if (viewMode === "quiz" && !selectedQuiz) {
				alert(
					"일괄 입력을 사용하려면 위 '퀴즈 선택'에서 퀴즈를 하나 선택한 후 사용해 주세요.",
				);
			} else if (viewMode === "assignment" && !selectedAssignment) {
				alert(
					"일괄 입력을 사용하려면 위에서 과제를 하나 선택한 후 사용해 주세요.",
				);
			} else {
				alert(
					"일괄 입력은 과제별 보기에서 과제를 선택하거나, 퀴즈별 보기에서 퀴즈를 선택한 후 사용할 수 있습니다.",
				);
			}
		}
	}, [viewMode, selectedAssignment, selectedQuiz, grades.length]);

	useEffect(() => {
		const fetchAssignmentProblemsForPoints = async () => {
			if (!showPointsModal || !sectionId) return;
			try {
				setLoadingProblems(true);
				if (
					(viewMode === "course" ||
						viewMode === "assignment" ||
						viewMode === "quiz") &&
					(assignments.length > 0 || quizzes.length > 0)
				) {
					const initialPoints: Record<string, number | ""> = {};

					if (viewMode !== "quiz" && assignments.length > 0) {
						const allProblemsData = await Promise.all(
							assignments.map(async (assignment) => {
								try {
									const problemsResponse =
										await APIService.getAssignmentProblems(
											sectionId,
											assignment.id,
										);
									const problemsData =
										problemsResponse?.data ?? problemsResponse ?? {};
									const problems = problemsData.problems ?? problemsData ?? [];
									const problemsArray = Array.isArray(problems) ? problems : [];
									return {
										assignmentId: assignment.id,
										assignmentTitle: assignment.title,
										problems: problemsArray.map(
											(
												p: AssignmentProblemRow & {
													assignmentId?: number;
													assignmentTitle?: string;
												},
											) => ({
												...p,
												assignmentId: assignment.id,
												assignmentTitle: assignment.title,
											}),
										),
									};
								} catch (error) {
									console.error(
										`과제 ${assignment.id}의 문제 조회 실패:`,
										error,
									);
									return {
										assignmentId: assignment.id,
										assignmentTitle: assignment.title,
										problems: [] as AssignmentProblemRow[],
									};
								}
							}),
						);
						setAllAssignmentProblems(allProblemsData);
						for (const { problems } of allProblemsData) {
							for (const problem of problems) {
								const problemId = problem.id ?? problem.problemId;
								if (problemId) {
									const key = `${problem.assignmentId ?? 0}-${problemId}`;
									initialPoints[key] =
										problem.points && problem.points > 0 ? problem.points : 1;
								}
							}
						}
					} else {
						setAllAssignmentProblems([]);
					}

					if (
						(viewMode === "course" || viewMode === "quiz") &&
						quizzes.length > 0
					) {
						const allQuizData = await Promise.all(
							quizzes.map(async (quiz) => {
								try {
									const problemsResponse = await APIService.getQuizProblems(
										sectionId,
										quiz.id,
									);
									const problemsData =
										problemsResponse?.data ?? problemsResponse ?? {};
									const problems = problemsData.problems ?? problemsData ?? [];
									const problemsArray = Array.isArray(problems) ? problems : [];
									// 같은 퀴즈 내 동일 문제(problemId) 중복 제거
									const seenProblemIds = new Set<number>();
									const uniqueProblems = problemsArray.filter((p) => {
										const id = p.problemId ?? p.id;
										if (id == null) return true;
										if (seenProblemIds.has(Number(id))) return false;
										seenProblemIds.add(Number(id));
										return true;
									});
									return {
										quizId: quiz.id,
										quizTitle: quiz.title,
										problems: uniqueProblems,
									};
								} catch (error) {
									console.error(
										`퀴즈 ${quiz.id}(코딩 테스트) 문제 조회 실패:`,
										error,
									);
									return {
										quizId: quiz.id,
										quizTitle: quiz.title,
										problems: [] as AssignmentProblemRow[],
									};
								}
							}),
						);
						// 동일 퀴즈(quizId)가 두 번 나오지 않도록 중복 제거
						const seenQuizIds = new Set<number>();
						let dedupedQuizData = allQuizData.filter(({ quizId }) => {
							if (seenQuizIds.has(quizId)) return false;
							seenQuizIds.add(quizId);
							return true;
						});
						// 같은 제목의 퀴즈가 여러 개면 첫 번째만 표시 (섹션 중복 방지)
						const seenTitles = new Set<string>();
						dedupedQuizData = dedupedQuizData.filter(({ quizTitle }) => {
							const title = String(quizTitle ?? "").trim();
							if (!title || seenTitles.has(title)) return false;
							seenTitles.add(title);
							return true;
						});
						setAllQuizProblems(dedupedQuizData);
						for (const { quizId, problems } of dedupedQuizData) {
							for (const problem of problems) {
								const problemId = problem.id ?? problem.problemId;
								if (problemId) {
									const key = `quiz-${quizId}-${problemId}`;
									initialPoints[key] =
										problem.points && problem.points > 0 ? problem.points : 1;
								}
							}
						}
					} else {
						setAllQuizProblems([]);
					}

					setPointsInputs(initialPoints);
					setAssignmentProblems([]);
				} else if (selectedAssignment) {
					const problemsResponse = await APIService.getAssignmentProblems(
						sectionId,
						selectedAssignment.id,
					);
					const problemsData = problemsResponse?.data ?? problemsResponse ?? {};
					const problems = problemsData.problems ?? problemsData ?? [];
					const problemsArray = Array.isArray(problems) ? problems : [];
					setAssignmentProblems(problemsArray);
					setAllAssignmentProblems([]);
					setAllQuizProblems([]);
					const initialPoints: Record<string, number | ""> = {};
					for (const problem of problemsArray) {
						const problemId = problem.id ?? problem.problemId;
						if (problemId) {
							initialPoints[problemId] =
								problem.points && problem.points > 0 ? problem.points : 1;
						}
					}
					setPointsInputs(initialPoints);
				} else if (viewMode === "quiz" && selectedQuiz) {
					const problemsResponse = await APIService.getQuizProblems(
						sectionId,
						selectedQuiz.id,
					);
					const problemsData = problemsResponse?.data ?? problemsResponse ?? [];
					const problemsArray = Array.isArray(problemsData) ? problemsData : [];
					setAssignmentProblems(problemsArray);
					setAllAssignmentProblems([]);
					setAllQuizProblems([]);
					const initialPoints: Record<string, number | ""> = {};
					for (const problem of problemsArray) {
						const problemId = problem.id ?? problem.problemId;
						if (problemId) {
							initialPoints[problemId] =
								problem.points && problem.points > 0 ? problem.points : 1;
						}
					}
					setPointsInputs(initialPoints);
				} else {
					setAssignmentProblems([]);
					setAllAssignmentProblems([]);
					setAllQuizProblems([]);
				}
			} catch (error) {
				console.error("과제/퀴즈 문제 조회 실패:", error);
				setAssignmentProblems([]);
				setAllAssignmentProblems([]);
				setAllQuizProblems([]);
			} finally {
				setLoadingProblems(false);
			}
		};
		fetchAssignmentProblemsForPoints();
	}, [
		showPointsModal,
		selectedAssignment,
		selectedQuiz,
		sectionId,
		viewMode,
		assignments,
		quizzes,
	]);

	const handleSavePoints = useCallback(async () => {
		if (!sectionId) {
			alert("분반 정보가 없습니다.");
			return;
		}
		try {
			setPointsSaving(true);
			if (allAssignmentProblems.length > 0 || allQuizProblems.length > 0) {
				let savedCount = 0;
				let errorCount = 0;
				for (const { assignmentId, problems } of allAssignmentProblems) {
					if (problems.length === 0) continue;
					const problemPoints: Record<number, number> = {};
					for (const problem of problems) {
						const problemId = problem.id ?? problem.problemId;
						if (!problemId) continue;
						const key = `${assignmentId}-${problemId}`;
						const inputPoints = pointsInputs[key];
						let finalPoints = 1;
						if (
							inputPoints !== undefined &&
							inputPoints !== "" &&
							inputPoints !== null
						) {
							const parsed = Number(inputPoints);
							if (!Number.isNaN(parsed) && parsed >= 0) {
								finalPoints = parsed > 0 ? parsed : 1;
							}
						} else {
							const existing = problem.points;
							finalPoints = existing && existing > 0 ? existing : 1;
						}
						problemPoints[Number(problemId)] = finalPoints;
					}
					if (Object.keys(problemPoints).length > 0) {
						try {
							await APIService.setBulkProblemPoints(
								sectionId,
								assignmentId,
								problemPoints,
							);
							savedCount++;
						} catch (error) {
							console.error(`과제 ${assignmentId} 배점 저장 실패:`, error);
							errorCount++;
						}
					}
				}
				// 퀴즈 전체 배점 저장 (수업 전체 모드)
				for (const { quizId, problems } of allQuizProblems) {
					if (problems.length === 0) continue;
					const problemPoints: Record<number, number> = {};
					for (const problem of problems) {
						const problemId = problem.id ?? problem.problemId;
						if (!problemId) continue;
						// 백엔드 API는 Problem.id(problemId)로 조회하므로 problemId 사용
						const apiProblemId = problem.problemId ?? problem.id;
						if (apiProblemId == null) continue;
						const key = `quiz-${quizId}-${problemId}`;
						const inputPoints = pointsInputs[key];
						let finalPoints = 1;
						if (
							inputPoints !== undefined &&
							inputPoints !== "" &&
							inputPoints !== null
						) {
							const parsed = Number(inputPoints);
							if (!Number.isNaN(parsed) && parsed >= 0) {
								finalPoints = parsed > 0 ? parsed : 1;
							}
						} else {
							const existing = problem.points;
							finalPoints = existing && existing > 0 ? existing : 1;
						}
						problemPoints[Number(apiProblemId)] = finalPoints;
					}
					if (Object.keys(problemPoints).length > 0) {
						try {
							await APIService.setBulkQuizProblemPoints(
								sectionId,
								quizId,
								problemPoints,
							);
							savedCount++;
						} catch (error) {
							console.error(`퀴즈 ${quizId} 배점 저장 실패:`, error);
							errorCount++;
						}
					}
				}
				if (savedCount > 0) {
					await fetchCourseGrades();
					if (viewMode === "assignment" && selectedAssignment) {
						await fetchGrades();
					}
					if (viewMode === "quiz" && selectedQuiz) {
						await fetchQuizGrades();
					}
					alert(
						`${savedCount}개 과제/퀴즈의 배점이 저장되었습니다.${errorCount > 0 ? ` (${errorCount}개 실패)` : ""}`,
					);
				} else {
					alert("저장할 배점이 없습니다.");
				}
			} else if (
				selectedQuiz &&
				assignmentProblems.length > 0 &&
				viewMode === "quiz"
			) {
				// 단일 퀴즈 배점 저장 (백엔드 API는 Problem.id로 조회하므로 problemId 사용)
				const problemPoints: Record<number, number> = {};
				for (const problem of assignmentProblems) {
					const problemId = problem.id ?? problem.problemId;
					if (!problemId) continue;
					const apiProblemId = problem.problemId ?? problem.id;
					if (apiProblemId == null) continue;
					const inputPoints = pointsInputs[problemId];
					let finalPoints = 1;
					if (
						inputPoints !== undefined &&
						inputPoints !== "" &&
						inputPoints !== null
					) {
						const parsed = Number(inputPoints);
						if (!Number.isNaN(parsed) && parsed >= 0) {
							finalPoints = parsed > 0 ? parsed : 1;
						}
					} else {
						const existing = problem.points;
						finalPoints = existing && existing > 0 ? existing : 1;
					}
					problemPoints[Number(apiProblemId)] = finalPoints;
				}
				if (Object.keys(problemPoints).length === 0) {
					alert("유효한 배점을 입력해주세요.");
					setPointsSaving(false);
					return;
				}
				await APIService.setBulkQuizProblemPoints(
					sectionId,
					selectedQuiz.id,
					problemPoints,
				);
				await fetchQuizGrades();
				alert("배점이 저장되었습니다.");
			} else if (selectedAssignment && assignmentProblems.length > 0) {
				const problemPoints: Record<number, number> = {};
				for (const problem of assignmentProblems) {
					const problemId = problem.id ?? problem.problemId;
					if (!problemId) continue;
					const inputPoints = pointsInputs[problemId];
					let finalPoints = 1;
					if (
						inputPoints !== undefined &&
						inputPoints !== "" &&
						inputPoints !== null
					) {
						const parsed = Number(inputPoints);
						if (!Number.isNaN(parsed) && parsed >= 0) {
							finalPoints = parsed > 0 ? parsed : 1;
						}
					} else {
						const existing = problem.points;
						finalPoints = existing && existing > 0 ? existing : 1;
					}
					problemPoints[Number(problemId)] = finalPoints;
				}
				if (Object.keys(problemPoints).length === 0) {
					alert("유효한 배점을 입력해주세요.");
					setPointsSaving(false);
					return;
				}
				await APIService.setBulkProblemPoints(
					sectionId,
					selectedAssignment.id,
					problemPoints,
				);
				await fetchGrades();
				alert("배점이 저장되었습니다.");
			} else {
				alert("설정할 배점이 없습니다.");
				setPointsSaving(false);
				return;
			}
			setShowPointsModal(false);
			setPointsInputs({});
			setAssignmentProblems([]);
			setAllAssignmentProblems([]);
		} catch (error) {
			console.error("배점 저장 실패:", error);
			alert(`배점 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
		} finally {
			setPointsSaving(false);
		}
	}, [
		sectionId,
		viewMode,
		allAssignmentProblems,
		allQuizProblems,
		assignmentProblems,
		selectedAssignment,
		selectedQuiz,
		pointsInputs,
		fetchCourseGrades,
		fetchGrades,
		fetchQuizGrades,
	]);

	const stats = useMemo(() => {
		// 전체 과제 / 전체 퀴즈: courseGrades + filteredCourseStudents로 통계 계산
		const useCourseGrades =
			(viewMode === "assignment" && !selectedAssignment) ||
			(viewMode === "quiz" && !selectedQuiz);
		if (
			useCourseGrades &&
			courseGrades?.items?.length &&
			filteredCourseStudents.length > 0
		) {
			const items = courseGrades.items.filter(
				(i) =>
					(viewMode === "assignment" && i.type === "assignment") ||
					(viewMode === "quiz" && i.type === "quiz"),
			);
			if (items.length === 0) return null;
			const problemStats: Array<{
				problemId: number;
				problemTitle: string;
				points: number;
				avg: number;
				max: number;
				min: number;
				submittedCount: number;
				totalCount: number;
			}> = [];
			for (const item of items) {
				for (const problem of item.problems) {
					const scores = filteredCourseStudents
						.map((student) => {
							const data =
								item.type === "assignment"
									? student.assignments?.[item.id]
									: student.quizzes?.[item.id];
							const pg = data?.problems?.[problem.problemId];
							return pg?.score !== null && pg?.score !== undefined
								? pg.score
								: null;
						})
						.filter((s): s is number => s !== null);
					const submittedCount = filteredCourseStudents.filter((student) => {
						const data =
							item.type === "assignment"
								? student.assignments?.[item.id]
								: student.quizzes?.[item.id];
						const pg = data?.problems?.[problem.problemId];
						return pg?.submitted ?? false;
					}).length;
					problemStats.push({
						problemId: problem.problemId,
						problemTitle: `${item.title} - ${problem.problemTitle ?? ""}`,
						points: problem.points ?? 0,
						avg:
							scores.length > 0
								? Number(
										(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(
											1,
										),
									)
								: 0,
						max: scores.length > 0 ? Math.max(...scores) : 0,
						min: scores.length > 0 ? Math.min(...scores) : 0,
						submittedCount,
						totalCount: filteredCourseStudents.length,
					});
				}
			}
			const totalPoints = items.reduce(
				(sum, item) =>
					sum + item.problems.reduce((s, p) => s + (p.points ?? 0), 0),
				0,
			);
			const totalScores = filteredCourseStudents.map((student) =>
				items.reduce((sum, item) => {
					const data =
						item.type === "assignment"
							? student.assignments?.[item.id]
							: student.quizzes?.[item.id];
					return sum + (data?.totalScore ?? 0);
				}, 0),
			);
			const overallAvg =
				totalScores.length > 0
					? (
							totalScores.reduce((a, b) => a + b, 0) / totalScores.length
						).toFixed(1)
					: "0";
			return {
				problemStats,
				overall: {
					avg: Number.parseFloat(overallAvg),
					max: totalScores.length > 0 ? Math.max(...totalScores) : 0,
					min: totalScores.length > 0 ? Math.min(...totalScores) : 0,
					totalPoints,
					totalStudents: filteredCourseStudents.length,
				},
			};
		}

		if (!grades.length || !grades[0]?.problemGrades) return null;
		const problemStats = grades[0].problemGrades.map((problem) => {
			const scores = grades
				.map((student) => {
					const pg = student.problemGrades?.find(
						(p) => p.problemId === problem.problemId,
					);
					return pg?.score !== null && pg?.score !== undefined
						? pg.score
						: null;
				})
				.filter((s): s is number => s !== null);
			const avg =
				scores.length > 0
					? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
					: "0";
			const max = scores.length > 0 ? Math.max(...scores) : 0;
			const min = scores.length > 0 ? Math.min(...scores) : 0;
			const submittedCount = grades.filter((student) => {
				const pg = student.problemGrades?.find(
					(p) => p.problemId === problem.problemId,
				);
				return pg?.submitted ?? false;
			}).length;
			return {
				problemId: problem.problemId,
				problemTitle: problem.problemTitle ?? "",
				points: problem.points ?? 0,
				avg: Number.parseFloat(avg),
				max,
				min,
				submittedCount,
				totalCount: grades.length,
			};
		});
		const totalScores = grades.map((s) => s.totalScore ?? 0);
		const totalPoints = grades[0]?.totalPoints ?? 0;
		const overallAvg =
			totalScores.length > 0
				? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(
						1,
					)
				: "0";
		return {
			problemStats,
			overall: {
				avg: Number.parseFloat(overallAvg),
				max: totalScores.length > 0 ? Math.max(...totalScores) : 0,
				min: totalScores.length > 0 ? Math.min(...totalScores) : 0,
				totalPoints,
				totalStudents: grades.length,
			},
		};
	}, [
		grades,
		viewMode,
		selectedAssignment,
		selectedQuiz,
		courseGrades,
		filteredCourseStudents,
	]);

	return {
		sectionId,
		currentSection,
		assignments,
		quizzes,
		selectedAssignment,
		setSelectedAssignment,
		selectedQuiz,
		setSelectedQuiz,
		grades,
		loading,
		searchTerm,
		setSearchTerm,
		editingGrade,
		setEditingGrade,
		gradeInputs,
		setGradeInputs,
		comments,
		setComments,
		viewMode,
		setViewMode,
		courseGrades,
		courseLoading,
		showCodeModal,
		setShowCodeModal,
		selectedCode,
		setSelectedCode,
		showBulkModal,
		setShowBulkModal,
		showStatsModal,
		setShowStatsModal,
		showPointsModal,
		setShowPointsModal,
		pointsInputs,
		setPointsInputs,
		pointsSaving,
		assignmentProblems,
		setAssignmentProblems,
		loadingProblems,
		allAssignmentProblems,
		setAllAssignmentProblems,
		allQuizProblems,
		setAllQuizProblems,
		bulkInputs,
		setBulkInputs,
		bulkSaving,
		getSectionDisplayName,
		handleSaveGrade,
		handleViewCode,
		handleSaveGradeForAssignment,
		handleViewCodeForAssignment,
		handleSaveGradeForQuiz,
		handleSaveGradeForQuizCourse,
		handleViewCodeForQuiz,
		handleExportCSV,
		handleShowBulkModal,
		handleBulkSave,
		handleSavePoints,
		stats,
		filteredGrades,
		filteredCourseStudents,
		gradeSortKey,
		gradeSortDir,
		toggleGradeStudentSort,
		showProblemDetailModal,
		problemDetail,
		openProblemDetail,
		closeProblemDetailModal,
	};
}

export type GradeManagementHookReturn = ReturnType<typeof useGradeManagement>;
