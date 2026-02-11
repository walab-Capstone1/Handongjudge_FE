import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { ProblemStatus, Quiz, Problem, SectionInfo } from "../types";

export function useCodingQuizPage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [loading, setLoading] = useState(true);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
	const [quizProblems, setQuizProblems] = useState<Problem[]>([]);
	const [userRole, setUserRole] = useState<string | null>(null);
	const [isManager, setIsManager] = useState(false);

	const fetchUserRole = useCallback(async () => {
		if (!sectionId || !auth.user) return;

		try {
			const response = await APIService.getMyRoleInSection(Number(sectionId));
			let raw: unknown = response;
			if (typeof response === "object" && response !== null) {
				raw =
					(response as { data?: unknown })?.data ??
					(response as { role?: unknown })?.role ??
					response;
				if (typeof raw === "object" && raw !== null && "role" in raw) {
					raw = (raw as { role: unknown }).role;
				}
			}
			const role =
				typeof raw === "string"
					? raw.toUpperCase()
					: String(raw ?? "").toUpperCase();

			setUserRole(role);
			setIsManager(role === "ADMIN" || role === "TUTOR");
		} catch (error) {
			console.error("역할 조회 실패:", error);
			setUserRole(null);
			setIsManager(false);
		}
	}, [sectionId, auth.user]);

	const fetchData = useCallback(async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
			
			// 사용자 역할 조회
			await fetchUserRole();

			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(
				(sectionData as { data?: SectionInfo })?.data ?? sectionData,
			);
			const quizzesResponse = await APIService.getQuizzesBySection(sectionId);
			const quizzesData = quizzesResponse.data || quizzesResponse;
			const quizzesList = (Array.isArray(quizzesData) ? quizzesData : []).map(
				(
					quiz: Record<string, unknown> & {
						startTime: string;
						endTime: string;
					},
				) => ({
					...quiz,
					startTime: new Date(quiz.startTime),
					endTime: new Date(quiz.endTime),
				}),
			) as Quiz[];
			setQuizzes(quizzesList);
		} catch (err) {
			console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	}, [sectionId, fetchUserRole]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	const handleQuizClick = useCallback(
		async (quiz: Quiz) => {
			if (quiz.status === "WAITING" || !sectionId || !auth.user) return;
			try {
				const [problemsResponse, statusResponse] = await Promise.all([
					APIService.getQuizProblems(sectionId, quiz.id),
					APIService.getStudentQuizProblemsStatus(
						auth.user.id,
						sectionId,
						quiz.id,
					).catch(() => ({ data: [] })),
				]);
				const problemsData = problemsResponse.data || problemsResponse;
				const statusList = statusResponse.data ?? statusResponse ?? [];
				const statusMap = Array.isArray(statusList)
					? (statusList as { problemId: number; status: string }[]).reduce(
							(acc, s) => {
								acc[s.problemId] =
									s.status === "ACCEPTED" || s.status === "SUBMITTED"
										? (s.status as ProblemStatus)
										: "NOT_SUBMITTED";
								return acc;
							},
							{} as Record<number, ProblemStatus>,
						)
					: {};

				const problems = (Array.isArray(problemsData) ? problemsData : []).map(
					(p: { problemId: number; title: string; problemOrder: number }) => ({
						id: p.problemId,
						title: p.title,
						order: p.problemOrder,
						status: statusMap[p.problemId] ?? "NOT_SUBMITTED",
					}),
				);
				setSelectedQuiz(quiz);
				setQuizProblems(problems);
			} catch (err) {
				console.error("문제 목록 조회 실패:", err);
			}
		},
		[sectionId, auth.user],
	);

	const handleProblemSelect = useCallback(
		(problemId: number) => {
			if (selectedQuiz && sectionId) {
				navigate(
					`/sections/${sectionId}/coding-quiz/${selectedQuiz.id}?problemId=${problemId}`,
				);
				setSelectedQuiz(null);
				setQuizProblems([]);
			}
		},
		[selectedQuiz, sectionId, navigate],
	);

	const handleBackToList = useCallback(() => {
		setSelectedQuiz(null);
		setQuizProblems([]);
	}, []);

	const formatDateTime = useCallback((date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}.${month}.${day} ${hours}:${minutes}`;
	}, []);

	return {
		sectionId,
		loading,
		isSidebarCollapsed,
		sectionInfo,
		quizzes,
		selectedQuiz,
		quizProblems,
		userRole,
		isManager,
		handleToggleSidebar,
		handleQuizClick,
		handleProblemSelect,
		handleBackToList,
		formatDateTime,
	};
}

export type CodingQuizPageHookReturn = ReturnType<typeof useCodingQuizPage>;
