import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import SectionNavigation from "../../../components/SectionNavigation";
import APIService from "../../../services/APIService";
import {
	FaFileExport,
	FaChartBar,
	FaEdit,
	FaCode,
	FaClock,
	FaCheckCircle,
	FaTimesCircle,
	FaWeight,
} from "react-icons/fa";
import "./GradeManagement.css";
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
	CodeResponse,
	ProblemGrade,
} from "./types";

const GradeManagement: React.FC = () => {
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
	const [bulkInputs, setBulkInputs] = useState<Record<number, number | "">>({});
	const [bulkSaving, setBulkSaving] = useState(false);

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
				if (!assignmentGrades.length || !assignmentGrades[0]?.problemGrades) {
					continue;
				}
				const problems = assignmentGrades[0].problemGrades.map(
					(p: {
						problemId: number;
						problemTitle?: string;
						points?: number;
					}) => ({
						problemId: p.problemId,
						problemTitle: p.problemTitle,
						points: p.points,
					}),
				);
				const totalPoints =
					assignmentGrades[0].totalPoints ??
					problems.reduce((sum, p) => sum + (p.points ?? 0), 0);
				courseItems.push({
					type: "assignment",
					id: assignment.id,
					title: assignment.title,
					problems,
					totalPoints,
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

			for (const { item: quiz, problems, grades: quizGrades } of quizResults) {
				if (problems.length === 0) continue;
				const totalPoints = problems.length;
				courseItems.push({
					type: "quiz",
					id: quiz.id,
					title: quiz.title,
					problems: problems.map((p) => ({
						problemId: p.problemId ?? (p as { id?: number }).id,
						problemTitle:
							(p as { problemTitle?: string }).problemTitle ??
							(p as { title?: string }).title,
						points: p.points ?? 1,
					})),
					totalPoints,
				});
				if (quizGrades?.length > 0) {
					for (const student of quizGrades) {
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
						const quizTotalPoints = student.totalPoints ?? totalPoints ?? 0;
						const ratio =
							quizTotalPoints > 0
								? `${((totalScore / quizTotalPoints) * 100).toFixed(1)}`
								: "0.0";
						studentEntry.quizzes[quiz.id] = {
							totalScore,
							totalPoints: quizTotalPoints,
							ratio,
							problems: problemsMap,
						};
					}
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: selectedAssignment omitted to avoid resetting first assignment on every change
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
					if (arr.length > 0 && !selectedAssignment) {
						setSelectedAssignment(arr[0]);
					}
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
		// eslint-disable-next-line react-hooks/exhaustive-deps -- selectedAssignment omitted to avoid resetting first assignment
	}, [sectionId]);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
	}, [fetchData]);

	useEffect(() => {
		if (
			viewMode === "course" &&
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

	useEffect(() => {
		if (viewMode === "quiz" && quizzes.length > 0 && !selectedQuiz) {
			setSelectedQuiz(quizzes[0]);
		}
	}, [viewMode, quizzes, selectedQuiz]);

	const handleSaveGrade = async (
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
	};

	const handleViewCode = async (userId: number, problemId: number) => {
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
	};

	const getSectionDisplayName = () => {
		if (!currentSection) return "";
		const s = currentSection as {
			courseTitle?: string;
			sectionNumber?: string;
			sectionInfo?: { courseTitle?: string; sectionNumber?: string };
		};
		const title = s.courseTitle ?? s.sectionInfo?.courseTitle ?? "";
		const num = s.sectionNumber ?? s.sectionInfo?.sectionNumber ?? "";
		return num ? `${title} - ${num}분반` : title;
	};

	const handleExportCSV = () => {
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
			const headers = ["학생명", "학번"];
			if (grades[0]?.problemGrades) {
				for (const problem of grades[0].problemGrades) {
					headers.push(
						`${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
					);
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

		const headers = ["학생명", "학번"];
		if (grades[0]?.problemGrades) {
			for (const problem of grades[0].problemGrades) {
				headers.push(
					`${problem.problemTitle ?? ""} (${problem.points ?? 0}점)`,
				);
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
	};

	const handleBulkSave = async () => {
		if (
			!selectedAssignment ||
			!sectionId ||
			Object.keys(bulkInputs).length === 0
		) {
			alert("입력할 점수가 없습니다.");
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
			await APIService.saveBulkGrades(
				sectionId,
				selectedAssignment.id,
				bulkData,
			);
			await fetchGrades();
			setShowBulkModal(false);
			setBulkInputs({});
			alert(`${bulkData.grades.length}개의 성적이 저장되었습니다.`);
		} catch (error) {
			console.error("일괄 성적 저장 실패:", error);
			alert(`일괄 성적 저장에 실패했습니다. ${(error as Error).message ?? ""}`);
		} finally {
			setBulkSaving(false);
		}
	};

	useEffect(() => {
		const fetchAssignmentProblemsForPoints = async () => {
			if (!showPointsModal || !sectionId) return;
			try {
				setLoadingProblems(true);
				if (viewMode === "course" && assignments.length > 0) {
					const allProblemsData = await Promise.all(
						assignments.map(async (assignment) => {
							try {
								const problemsResponse = await APIService.getAssignmentProblems(
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
								console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
								return {
									assignmentId: assignment.id,
									assignmentTitle: assignment.title,
									problems: [] as AssignmentProblemRow[],
								};
							}
						}),
					);
					setAllAssignmentProblems(allProblemsData);
					const initialPoints: Record<string, number | ""> = {};
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
					const initialPoints: Record<string, number | ""> = {};
					for (const problem of problemsArray) {
						const problemId = problem.id ?? problem.problemId;
						if (problemId) {
							initialPoints[problemId] =
								problem.points && problem.points > 0 ? problem.points : 1;
						}
					}
					setPointsInputs(initialPoints);
				}
			} catch (error) {
				console.error("과제 문제 조회 실패:", error);
				setAssignmentProblems([]);
				setAllAssignmentProblems([]);
			} finally {
				setLoadingProblems(false);
			}
		};
		fetchAssignmentProblemsForPoints();
	}, [showPointsModal, selectedAssignment, sectionId, viewMode, assignments]);

	const handleSavePoints = async () => {
		if (!sectionId) {
			alert("분반 정보가 없습니다.");
			return;
		}
		try {
			setPointsSaving(true);
			if (viewMode === "course" && allAssignmentProblems.length > 0) {
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
				if (savedCount > 0) {
					await fetchCourseGrades();
					alert(
						`${savedCount}개 과제의 배점이 저장되었습니다.${errorCount > 0 ? ` (${errorCount}개 실패)` : ""}`,
					);
				} else {
					alert("저장할 배점이 없습니다.");
				}
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
	};

	const stats = useMemo(() => {
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
	}, [grades]);

	const filteredGrades = useMemo(() => {
		const term = searchTerm.toLowerCase();
		return grades.filter(
			(grade) =>
				grade.studentName?.toLowerCase().includes(term) ||
				grade.studentId?.toLowerCase().includes(term),
		);
	}, [grades, searchTerm]);

	const filteredCourseStudents = useMemo(() => {
		if (!courseGrades?.students) return [];
		const lower = searchTerm.toLowerCase();
		return courseGrades.students.filter(
			(student) =>
				student.studentName?.toLowerCase().includes(lower) ||
				student.studentId?.toLowerCase().includes(lower),
		);
	}, [courseGrades, searchTerm]);

	if (loading && !grades.length) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<div className="grade-management">
					<div className="grade-loading-container">
						<div className="grade-loading-spinner" />
						<p>성적 데이터를 불러오는 중...</p>
					</div>
				</div>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			{sectionId && currentSection && (
				<SectionNavigation
					sectionId={sectionId}
					sectionName={getSectionDisplayName()}
					enrollmentCode={
						(currentSection as { enrollmentCode?: string }).enrollmentCode
					}
					title="성적 관리"
					showSearch={false}
				/>
			)}

			<div className="grade-management">
				<div className="grade-page-header">
					<div className="grade-header-left">
						<div className="grade-search-box">
							<input
								type="text"
								className="tutor-search-input"
								placeholder="이름, 학번으로 검색..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						{sectionId &&
							(assignments.length > 0 || quizzes.length > 0) &&
							(viewMode === "assignment" || viewMode === "quiz") && (
								<div className="grade-filter-group">
									<label
										className="grade-filter-label"
										htmlFor="grade-item-select"
									>
										{viewMode === "assignment" ? "과제 선택" : "퀴즈 선택"}
									</label>
									<select
										id="grade-item-select"
										value={
											viewMode === "assignment"
												? (selectedAssignment?.id ?? "")
												: (selectedQuiz?.id ?? "")
										}
										onChange={(e) => {
											const val = e.target.value;
											if (viewMode === "assignment") {
												const a = assignments.find(
													(a) => a.id === Number.parseInt(val, 10),
												);
												setSelectedAssignment(a ?? null);
												setSelectedQuiz(null);
											} else {
												const q = quizzes.find(
													(q) => q.id === Number.parseInt(val, 10),
												);
												setSelectedQuiz(q ?? null);
												setSelectedAssignment(null);
											}
										}}
										className="grade-assignment-select"
									>
										<option value="">
											전체 {viewMode === "assignment" ? "과제" : "퀴즈"}
										</option>
										{viewMode === "assignment"
											? assignments.map((a) => (
													<option key={a.id} value={a.id}>
														{a.title}
													</option>
												))
											: quizzes.map((q) => (
													<option key={q.id} value={q.id}>
														{q.title}
													</option>
												))}
									</select>
								</div>
							)}
					</div>
					<div className="grade-header-right">
						<div className="grade-view-mode-tabs">
							<button
								type="button"
								className={`grade-tab-button ${viewMode === "assignment" ? "active" : ""}`}
								onClick={() => {
									setViewMode("assignment");
									setSelectedQuiz(null);
								}}
							>
								과제별 보기
							</button>
							<button
								type="button"
								className={`grade-tab-button ${viewMode === "quiz" ? "active" : ""}`}
								onClick={() => {
									setViewMode("quiz");
									setSelectedAssignment(null);
									if (quizzes.length > 0 && !selectedQuiz) {
										setSelectedQuiz(quizzes[0]);
									}
								}}
							>
								퀴즈별 보기
							</button>
							<button
								type="button"
								className={`grade-tab-button ${viewMode === "course" ? "active" : ""}`}
								onClick={() => {
									setViewMode("course");
									setSelectedAssignment(null);
									setSelectedQuiz(null);
								}}
							>
								수업 전체 보기
							</button>
						</div>
						{(selectedAssignment ||
							selectedQuiz ||
							(viewMode === "course" &&
								(assignments.length > 0 || quizzes.length > 0))) && (
							<>
								<button
									type="button"
									className="grade-btn-secondary"
									onClick={() => setShowPointsModal(true)}
								>
									<FaWeight /> 배점 설정
								</button>
								<button
									type="button"
									className="grade-btn-secondary"
									onClick={() => setShowBulkModal(true)}
								>
									<FaEdit /> 일괄 입력
								</button>
								<button
									type="button"
									className="grade-btn-secondary"
									onClick={() => setShowStatsModal(true)}
								>
									<FaChartBar /> 통계
								</button>
								<button
									type="button"
									className="grade-btn-primary"
									onClick={handleExportCSV}
								>
									<FaFileExport /> 내보내기
								</button>
							</>
						)}
					</div>
				</div>

				{/* 성적 테이블 */}
				{viewMode === "course" ? (
					<div className="grade-table-container grade-course-table-container">
						{courseLoading ? (
							<div className="grade-loading-container">
								<div className="grade-loading-spinner" />
								<p>수업 전체 성적 데이터를 불러오는 중...</p>
							</div>
						) : courseGrades?.items?.length &&
							filteredCourseStudents.length > 0 ? (
							<table className="grade-table grade-course-table">
								<thead>
									<tr>
										<th rowSpan={2}>학생</th>
										<th rowSpan={2}>학번</th>
										{courseGrades.items.map((item) => (
											<th
												key={`${item.type}-${item.id}`}
												className={`grade-course-assignment-header ${item.type === "quiz" ? "grade-course-quiz-header" : ""}`}
												colSpan={item.problems.length + 1}
											>
												<div className="grade-item-title">
													{item.type === "quiz" && (
														<span className="grade-item-type-badge">퀴즈</span>
													)}
													{item.title}
												</div>
											</th>
										))}
									</tr>
									<tr>
										{courseGrades.items.map((item) => (
											<React.Fragment key={`${item.type}-${item.id}-problems`}>
												{item.problems.map((problem) => (
													<th
														key={`${item.type}-${item.id}-${problem.problemId}`}
														className="grade-problem-header grade-course-problem-header"
													>
														<div className="grade-problem-title">
															{problem.problemTitle ?? ""}
														</div>
														<div className="grade-problem-points">
															({problem.points ?? 0}
															점)
														</div>
													</th>
												))}
												<th
													key={`${item.type}-${item.id}-total`}
													className="grade-course-assignment-total-header"
												>
													총점
												</th>
											</React.Fragment>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredCourseStudents.map((student) => (
										<tr key={student.userId}>
											<td className="grade-student-name">
												{student.studentName}
											</td>
											<td className="grade-student-id">{student.studentId}</td>
											{courseGrades.items.map((item) => {
												if (item.type === "assignment") {
													const assignmentData = student.assignments?.[item.id];
													return (
														<React.Fragment
															key={`${student.userId}-assignment-${item.id}`}
														>
															{item.problems.map((problem) => {
																const problemGrade =
																	assignmentData?.problems?.[problem.problemId];
																const score =
																	problemGrade?.score !== null &&
																	problemGrade?.score !== undefined
																		? problemGrade.score
																		: null;
																return (
																	<td
																		key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
																		className="grade-problem-cell grade-course-problem-cell"
																	>
																		{score !== null
																			? `${score} / ${problem.points ?? 0}`
																			: "-"}
																	</td>
																);
															})}
															<td className="grade-total-cell grade-course-assignment-total-cell">
																{assignmentData ? (
																	<strong>
																		{assignmentData.totalScore} /{" "}
																		{assignmentData.totalPoints}
																	</strong>
																) : (
																	"-"
																)}
															</td>
														</React.Fragment>
													);
												}
												if (item.type === "quiz") {
													const quizData = student.quizzes?.[item.id];
													return (
														<React.Fragment
															key={`${student.userId}-quiz-${item.id}`}
														>
															{item.problems.map((problem) => {
																const problemGrade =
																	quizData?.problems?.[problem.problemId];
																const score =
																	problemGrade?.score !== null &&
																	problemGrade?.score !== undefined
																		? problemGrade.score
																		: null;
																return (
																	<td
																		key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
																		className="grade-problem-cell grade-course-problem-cell"
																	>
																		{score !== null
																			? `${score} / ${problem.points ?? 0}`
																			: "-"}
																	</td>
																);
															})}
															<td className="grade-total-cell grade-course-assignment-total-cell">
																{quizData ? (
																	<strong>
																		{quizData.totalScore} /{" "}
																		{quizData.totalPoints}
																	</strong>
																) : (
																	"-"
																)}
															</td>
														</React.Fragment>
													);
												}
												return null;
											})}
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="grade-no-data">
								<p>수업 전체 성적 데이터가 없습니다.</p>
							</div>
						)}
					</div>
				) : selectedQuiz && viewMode === "quiz" && grades.length > 0 ? (
					<div className="grade-table-container">
						<table className="grade-table">
							<thead>
								<tr>
									<th>학생</th>
									<th>학번</th>
									{grades[0]?.problemGrades?.map((p) => (
										<th key={p.problemId} className="grade-problem-header">
											<div className="grade-problem-title">
												{p.problemTitle ?? ""}
											</div>
											<div className="grade-problem-points">
												({p.points ?? 0}점)
											</div>
										</th>
									))}
									<th>총점</th>
									<th>비율</th>
								</tr>
							</thead>
							<tbody>
								{filteredGrades.map((student) => {
									const totalScore = student.totalScore ?? 0;
									const totalPoints = student.totalPoints ?? 0;
									const ratio =
										totalPoints > 0
											? ((totalScore / totalPoints) * 100).toFixed(1)
											: 0;
									return (
										<tr key={student.userId}>
											<td className="grade-student-name">
												{student.studentName}
											</td>
											<td className="grade-student-id">{student.studentId}</td>
											{student.problemGrades?.map((problem) => (
												<td
													key={problem.problemId}
													className="grade-problem-cell"
												>
													<div className="grade-score-display">
														<div className="grade-score-value">
															{problem.score !== null &&
															problem.score !== undefined
																? `${problem.score} / ${problem.points ?? 0}`
																: "-"}
														</div>
														{problem.submitted && (
															<div className="grade-submission-info">
																<span
																	className={`grade-submission-status ${problem.isOnTime ? "on-time" : "late"}`}
																>
																	{problem.isOnTime ? (
																		<>
																			<FaCheckCircle /> 제시간
																		</>
																	) : (
																		<>
																			<FaTimesCircle /> 지연
																		</>
																	)}
																</span>
																{problem.submittedAt && (
																	<span className="grade-submission-time">
																		<FaClock />{" "}
																		{new Date(
																			problem.submittedAt,
																		).toLocaleString("ko-KR")}
																	</span>
																)}
															</div>
														)}
													</div>
												</td>
											))}
											<td className="grade-total-cell">
												<strong>
													{totalScore} / {totalPoints}
												</strong>
											</td>
											<td className="grade-ratio-cell">
												<strong>{ratio}%</strong>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				) : selectedQuiz && viewMode === "quiz" ? (
					<div className="grade-table-container">
						<div className="grade-no-data">
							<p>등록된 성적이 없습니다.</p>
						</div>
					</div>
				) : selectedAssignment && grades.length > 0 ? (
					<div className="grade-table-container">
						<table className="grade-table">
							<thead>
								<tr>
									<th>학생</th>
									<th>학번</th>
									{grades[0]?.problemGrades?.map((p) => (
										<th key={p.problemId} className="grade-problem-header">
											<div className="grade-problem-title">
												{p.problemTitle ?? ""}
											</div>
											<div className="grade-problem-points">
												({p.points ?? 0}점)
											</div>
										</th>
									))}
									<th>총점</th>
									<th>비율</th>
								</tr>
							</thead>
							<tbody>
								{filteredGrades.map((student) => {
									const totalScore = student.totalScore ?? 0;
									const totalPoints = student.totalPoints ?? 0;
									const ratio =
										totalPoints > 0
											? ((totalScore / totalPoints) * 100).toFixed(1)
											: 0;
									return (
										<tr key={student.userId}>
											<td className="grade-student-name">
												{student.studentName}
											</td>
											<td className="grade-student-id">{student.studentId}</td>
											{student.problemGrades?.map((problem) => {
												const key = `${student.userId}-${problem.problemId}`;
												const isEditing =
													editingGrade?.userId === student.userId &&
													editingGrade?.problemId === problem.problemId;
												const currentScore =
													gradeInputs[key] !== undefined
														? gradeInputs[key]
														: problem.score !== null &&
																problem.score !== undefined
															? problem.score
															: "";
												const currentComment = comments[key] ?? "";
												return (
													<td
														key={problem.problemId}
														className="grade-problem-cell"
													>
														{isEditing ? (
															<div className="grade-edit-form">
																<input
																	type="number"
																	min={0}
																	max={problem.points ?? 100}
																	value={currentScore}
																	onChange={(e) => {
																		const v =
																			e.target.value === ""
																				? ""
																				: Number(e.target.value);
																		setGradeInputs((prev) => ({
																			...prev,
																			[key]: v,
																		}));
																	}}
																	className="grade-score-input"
																	placeholder="점수"
																/>
																<div className="grade-edit-actions">
																	<button
																		type="button"
																		className="grade-btn-save"
																		onClick={() =>
																			handleSaveGrade(
																				student.userId,
																				problem.problemId,
																				currentScore,
																				currentComment,
																			)
																		}
																	>
																		저장
																	</button>
																	<button
																		type="button"
																		className="grade-btn-cancel"
																		onClick={() => {
																			setEditingGrade(null);
																			setGradeInputs((prev) => {
																				const next = {
																					...prev,
																				};
																				delete next[key];
																				return next;
																			});
																		}}
																	>
																		취소
																	</button>
																</div>
															</div>
														) : (
															<div className="grade-score-display">
																<div className="grade-score-value">
																	{problem.score !== null &&
																	problem.score !== undefined
																		? `${problem.score} / ${problem.points ?? 0}`
																		: "-"}
																</div>
																<div className="grade-score-actions">
																	<button
																		type="button"
																		className="grade-btn-edit"
																		onClick={() => {
																			setEditingGrade({
																				userId: student.userId,
																				problemId: problem.problemId,
																			});
																			setGradeInputs((prev) => ({
																				...prev,
																				[key]:
																					problem.score !== null &&
																					problem.score !== undefined
																						? problem.score
																						: "",
																			}));
																		}}
																		title="점수 입력/수정"
																	>
																		<FaEdit />
																	</button>
																	{problem.submitted && (
																		<button
																			type="button"
																			className="grade-btn-code"
																			onClick={() =>
																				handleViewCode(
																					student.userId,
																					problem.problemId,
																				)
																			}
																			title="코드 조회"
																		>
																			<FaCode />
																		</button>
																	)}
																</div>
																{problem.submitted && (
																	<div className="grade-submission-info">
																		<span
																			className={`grade-submission-status ${problem.isOnTime ? "on-time" : "late"}`}
																		>
																			{problem.isOnTime ? (
																				<>
																					<FaCheckCircle /> 제시간
																				</>
																			) : (
																				<>
																					<FaTimesCircle /> 지연
																				</>
																			)}
																		</span>
																		{problem.submittedAt && (
																			<span className="grade-submission-time">
																				<FaClock />{" "}
																				{new Date(
																					problem.submittedAt,
																				).toLocaleString("ko-KR")}
																			</span>
																		)}
																	</div>
																)}
															</div>
														)}
													</td>
												);
											})}
											<td className="grade-total-cell">
												<strong>
													{totalScore} / {totalPoints}
												</strong>
											</td>
											<td className="grade-ratio-cell">
												<strong>{ratio}%</strong>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				) : selectedAssignment ? (
					<div className="grade-no-data">
						<p>등록된 성적이 없습니다.</p>
					</div>
				) : (
					<div className="grade-no-data">
						<p>과제를 선택하여 성적을 확인하세요.</p>
					</div>
				)}

				{/* 코드 조회 모달 */}
				{showCodeModal && selectedCode && (
					<div
						className="grade-modal-overlay"
						onClick={() => setShowCodeModal(false)}
						onKeyDown={(e) => e.key === "Escape" && setShowCodeModal(false)}
					>
						<div
							className="grade-modal-content"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<div className="grade-modal-header">
								<h2 id="code-modal-title">제출 코드</h2>
								<button
									type="button"
									className="grade-modal-close"
									onClick={() => setShowCodeModal(false)}
									aria-label="닫기"
								>
									×
								</button>
							</div>
							<div className="grade-modal-body">
								<pre className="grade-code-display">
									<code>
										{selectedCode.code ??
											selectedCode.codeString ??
											"코드를 불러올 수 없습니다."}
									</code>
								</pre>
							</div>
						</div>
					</div>
				)}

				{/* 일괄 입력 모달 */}
				{showBulkModal && selectedAssignment && grades.length > 0 && (
					<div
						className="grade-modal-overlay"
						onClick={() => {
							setShowBulkModal(false);
							setBulkInputs({});
						}}
						onKeyDown={(e) => {
							if (e.key === "Escape") {
								setShowBulkModal(false);
								setBulkInputs({});
							}
						}}
					>
						<div
							className="grade-modal-content grade-modal-large"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<div className="grade-modal-header">
								<h2>일괄 점수 입력</h2>
								<button
									type="button"
									className="grade-modal-close"
									onClick={() => {
										setShowBulkModal(false);
										setBulkInputs({});
									}}
									aria-label="닫기"
								>
									×
								</button>
							</div>
							<div className="grade-modal-body">
								<div className="grade-bulk-info">
									<p>
										문제별로 모든 학생에게 동일한 점수를 일괄 입력할 수
										있습니다.
									</p>
								</div>
								<div className="grade-bulk-inputs">
									{grades[0]?.problemGrades?.map((problem) => (
										<div
											key={problem.problemId}
											className="grade-bulk-input-row"
										>
											<label
												className="grade-bulk-label"
												htmlFor={`bulk-problem-${problem.problemId}`}
											>
												{problem.problemTitle ?? ""} (배점:{" "}
												{problem.points ?? 0}
												점)
											</label>
											<input
												id={`bulk-problem-${problem.problemId}`}
												type="number"
												min={0}
												max={problem.points ?? 100}
												value={bulkInputs[problem.problemId] ?? ""}
												onChange={(e) => {
													const v =
														e.target.value === "" ? "" : Number(e.target.value);
													setBulkInputs((prev) => ({
														...prev,
														[problem.problemId]: v,
													}));
												}}
												className="grade-bulk-input"
												placeholder="점수 입력"
											/>
										</div>
									))}
								</div>
								<div className="grade-modal-actions">
									<button
										type="button"
										className="grade-btn-cancel"
										onClick={() => {
											setShowBulkModal(false);
											setBulkInputs({});
										}}
									>
										취소
									</button>
									<button
										type="button"
										className="grade-btn-submit"
										onClick={handleBulkSave}
										disabled={
											bulkSaving || Object.keys(bulkInputs).length === 0
										}
									>
										{bulkSaving ? "저장 중..." : "일괄 저장"}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 통계 모달 */}
				{showStatsModal && stats && (
					<div
						className="grade-modal-overlay"
						onClick={() => setShowStatsModal(false)}
						onKeyDown={(e) => e.key === "Escape" && setShowStatsModal(false)}
					>
						<div
							className="grade-modal-content grade-modal-large"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
						>
							<div className="grade-modal-header">
								<h2>성적 통계</h2>
								<button
									type="button"
									className="grade-modal-close"
									onClick={() => setShowStatsModal(false)}
									aria-label="닫기"
								>
									×
								</button>
							</div>
							<div className="grade-modal-body">
								<div className="grade-stats-section">
									<h3 className="grade-stats-title">전체 통계</h3>
									<div className="grade-stats-grid">
										<div className="grade-stat-card">
											<div className="grade-stat-label">평균 점수</div>
											<div className="grade-stat-value">
												{stats.overall.avg} / {stats.overall.totalPoints}
											</div>
										</div>
										<div className="grade-stat-card">
											<div className="grade-stat-label">최고 점수</div>
											<div className="grade-stat-value">
												{stats.overall.max} / {stats.overall.totalPoints}
											</div>
										</div>
										<div className="grade-stat-card">
											<div className="grade-stat-label">최저 점수</div>
											<div className="grade-stat-value">
												{stats.overall.min} / {stats.overall.totalPoints}
											</div>
										</div>
										<div className="grade-stat-card">
											<div className="grade-stat-label">학생 수</div>
											<div className="grade-stat-value">
												{stats.overall.totalStudents}명
											</div>
										</div>
									</div>
								</div>
								<div className="grade-stats-section">
									<h3 className="grade-stats-title">문제별 통계</h3>
									<div className="grade-problem-stats-table">
										<table className="grade-stats-table">
											<thead>
												<tr>
													<th>문제</th>
													<th>배점</th>
													<th>평균</th>
													<th>최고</th>
													<th>최저</th>
													<th>제출률</th>
												</tr>
											</thead>
											<tbody>
												{stats.problemStats.map((stat) => {
													const submissionRate =
														stat.totalCount > 0
															? (
																	(stat.submittedCount / stat.totalCount) *
																	100
																).toFixed(1)
															: "0";
													return (
														<tr key={stat.problemId}>
															<td className="grade-stat-problem-title">
																{stat.problemTitle}
															</td>
															<td>{stat.points}점</td>
															<td>{stat.avg.toFixed(1)}</td>
															<td>{stat.max}</td>
															<td>{stat.min}</td>
															<td>
																<div className="grade-submission-rate">
																	<span>{submissionRate}%</span>
																	<div className="grade-progress-bar">
																		<div
																			className="grade-progress-fill"
																			style={{
																				width: `${submissionRate}%`,
																			}}
																		/>
																	</div>
																</div>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 배점 설정 모달 */}
				{showPointsModal &&
					(selectedAssignment ||
						(viewMode === "course" && assignments.length > 0)) && (
						<div
							className="grade-modal-overlay"
							onClick={() => {
								setShowPointsModal(false);
								setPointsInputs({});
								setAssignmentProblems([]);
								setAllAssignmentProblems([]);
							}}
							onKeyDown={(e) => {
								if (e.key === "Escape") {
									setShowPointsModal(false);
									setPointsInputs({});
									setAssignmentProblems([]);
									setAllAssignmentProblems([]);
								}
							}}
						>
							<div
								className="grade-modal-content grade-modal-large"
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<div className="grade-modal-header">
									<h2>
										{viewMode === "course"
											? "수업 전체 배점 설정"
											: "배점 설정"}
									</h2>
									<button
										type="button"
										className="grade-modal-close"
										onClick={() => {
											setShowPointsModal(false);
											setPointsInputs({});
											setAssignmentProblems([]);
											setAllAssignmentProblems([]);
										}}
										aria-label="닫기"
									>
										×
									</button>
								</div>
								<div className="grade-modal-body">
									<div className="grade-bulk-info">
										<p>
											{viewMode === "course"
												? "수업의 모든 과제 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다."
												: "과제의 각 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다."}
										</p>
									</div>
									{loadingProblems ? (
										<div className="grade-loading-container">
											<div className="grade-loading-spinner" />
											<p>문제 목록을 불러오는 중...</p>
										</div>
									) : viewMode === "course" &&
										allAssignmentProblems.length > 0 ? (
										<>
											{allAssignmentProblems.map(
												({ assignmentId, assignmentTitle, problems }) => {
													if (problems.length === 0) return null;
													const assignmentTotal = problems.reduce(
														(sum, problem) => {
															const problemId = problem.id ?? problem.problemId;
															const key = `${assignmentId}-${problemId}`;
															const defaultPoints =
																problem.points && problem.points > 0
																	? problem.points
																	: 1;
															const current =
																pointsInputs[key] !== undefined
																	? (pointsInputs[key] ?? 0)
																	: defaultPoints;
															return sum + (Number(current) || 0);
														},
														0,
													);
													return (
														<div
															key={assignmentId}
															className="grade-assignment-group"
														>
															<div className="grade-assignment-group-header">
																<h3 className="grade-assignment-group-title">
																	{assignmentTitle}
																</h3>
																<div className="grade-assignment-group-total">
																	총점: {assignmentTotal}점
																</div>
															</div>
															<div className="grade-bulk-inputs">
																{problems.map((problem) => {
																	const problemId =
																		problem.id ?? problem.problemId;
																	const problemTitle =
																		problem.title ??
																		problem.problemTitle ??
																		"제목 없음";
																	const defaultPoints =
																		problem.points && problem.points > 0
																			? problem.points
																			: 1;
																	const key = `${assignmentId}-${problemId}`;
																	const currentPoints =
																		pointsInputs[key] !== undefined
																			? (pointsInputs[key] ?? 0)
																			: defaultPoints;
																	return (
																		<div
																			key={key}
																			className="grade-bulk-input-row"
																		>
																			<label
																				className="grade-bulk-label"
																				htmlFor={`points-${key}`}
																			>
																				{problemTitle}
																			</label>
																			<input
																				id={`points-${key}`}
																				type="number"
																				min={0}
																				step={1}
																				value={currentPoints}
																				onChange={(e) => {
																					const v =
																						e.target.value === ""
																							? ""
																							: Number(e.target.value);
																					setPointsInputs((prev) => ({
																						...prev,
																						[key]: v,
																					}));
																				}}
																				className="grade-bulk-input"
																				placeholder="배점 입력"
																			/>
																			<span className="grade-points-unit">
																				점
																			</span>
																		</div>
																	);
																})}
															</div>
														</div>
													);
												},
											)}
										</>
									) : assignmentProblems.length > 0 ? (
										<>
											<div className="grade-bulk-inputs">
												{assignmentProblems.map((problem) => {
													const problemId = problem.id ?? problem.problemId;
													const problemTitle =
														problem.title ??
														problem.problemTitle ??
														"제목 없음";
													const defaultPoints =
														problem.points && problem.points > 0
															? problem.points
															: 1;
													const currentPoints =
														pointsInputs[problemId] !== undefined
															? (pointsInputs[problemId] ?? 0)
															: defaultPoints;
													return (
														<div
															key={problemId}
															className="grade-bulk-input-row"
														>
															<label
																className="grade-bulk-label"
																htmlFor={`points-assignment-${problemId}`}
															>
																{problemTitle}
															</label>
															<input
																id={`points-assignment-${problemId}`}
																type="number"
																min={0}
																step={1}
																value={currentPoints}
																onChange={(e) => {
																	const v =
																		e.target.value === ""
																			? ""
																			: Number(e.target.value);
																	setPointsInputs((prev) => ({
																		...prev,
																		[problemId]: v,
																	}));
																}}
																className="grade-bulk-input"
																placeholder="배점 입력"
															/>
															<span className="grade-points-unit">점</span>
														</div>
													);
												})}
											</div>
											<div className="grade-total-points-summary">
												<div className="grade-total-points-label">
													과제 총점:
												</div>
												<div className="grade-total-points-value">
													{assignmentProblems.reduce((sum, problem) => {
														const problemId = problem.id ?? problem.problemId;
														const defaultPoints =
															problem.points && problem.points > 0
																? problem.points
																: 1;
														const current =
															pointsInputs[problemId] !== undefined
																? (pointsInputs[problemId] ?? 0)
																: defaultPoints;
														return sum + (Number(current) || 0);
													}, 0)}
													점
												</div>
											</div>
										</>
									) : (
										<div className="grade-no-data">
											<p>과제에 등록된 문제가 없습니다.</p>
										</div>
									)}
									<div className="grade-modal-actions">
										<button
											type="button"
											className="grade-btn-cancel"
											onClick={() => {
												setShowPointsModal(false);
												setPointsInputs({});
												setAssignmentProblems([]);
												setAllAssignmentProblems([]);
											}}
										>
											취소
										</button>
										<button
											type="button"
											className="grade-btn-submit"
											onClick={handleSavePoints}
											disabled={
												pointsSaving ||
												(viewMode === "course"
													? allAssignmentProblems.length === 0
													: assignmentProblems.length === 0)
											}
										>
											{pointsSaving ? "저장 중..." : "배점 저장"}
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
			</div>
		</TutorLayout>
	);
};

export default GradeManagement;
