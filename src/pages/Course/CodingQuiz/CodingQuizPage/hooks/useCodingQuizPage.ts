import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { Quiz, Problem, SectionInfo } from "../types";

export function useCodingQuizPage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [loading, setLoading] = useState(true);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
	const [quizProblems, setQuizProblems] = useState<Problem[]>([]);

	const fetchData = useCallback(async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
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
	}, [sectionId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	const handleQuizClick = useCallback(
		async (quiz: Quiz) => {
			if (quiz.status === "WAITING" || !sectionId) return;
			try {
				const problemsResponse = await APIService.getQuizProblems(
					sectionId,
					quiz.id,
				);
				const problemsData = problemsResponse.data || problemsResponse;
				const problems = (Array.isArray(problemsData) ? problemsData : []).map(
					(p: { problemId: number; title: string; problemOrder: number }) => ({
						id: p.problemId,
						title: p.title,
						order: p.problemOrder,
					}),
				);
				setSelectedQuiz(quiz);
				setQuizProblems(problems);
			} catch (err) {
				console.error("문제 목록 조회 실패:", err);
			}
		},
		[sectionId],
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
		handleToggleSidebar,
		handleQuizClick,
		handleProblemSelect,
		handleBackToList,
		formatDateTime,
	};
}

export type CodingQuizPageHookReturn = ReturnType<typeof useCodingQuizPage>;
