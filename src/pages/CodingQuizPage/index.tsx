import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../recoil/atoms";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import QuizTimer from "../../components/QuizTimer";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { Quiz, Problem, SectionInfo } from "./types";

const CodingQuizPage: React.FC = () => {
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

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionId]);

	const fetchData = async () => {
		if (!sectionId) return;

		try {
			setLoading(true);

			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(sectionData?.data || sectionData);

			const quizzesResponse = await APIService.getQuizzesBySection(sectionId);
			const quizzesData = quizzesResponse.data || quizzesResponse;

			const quizzes = quizzesData.map((quiz: any) => ({
				...quiz,
				startTime: new Date(quiz.startTime),
				endTime: new Date(quiz.endTime),
			}));

			setQuizzes(quizzes);
		} catch (err) {
			console.error("Error fetching data:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	const handleQuizClick = async (quiz: Quiz) => {
		if (quiz.status === "WAITING") {
			return;
		}

		try {
			const problemsResponse = await APIService.getQuizProblems(
				sectionId!,
				quiz.id,
			);
			const problemsData = problemsResponse.data || problemsResponse;

			const problems = problemsData.map((p: any) => ({
				id: p.problemId,
				title: p.title,
				order: p.problemOrder,
			}));

			setSelectedQuiz(quiz);
			setQuizProblems(problems);
		} catch (err) {
			console.error("문제 목록 조회 실패:", err);
		}
	};

	const handleProblemSelect = (problemId: number) => {
		if (selectedQuiz) {
			navigate(
				`/sections/${sectionId}/coding-quiz/${selectedQuiz.id}?problemId=${problemId}`,
			);
			setSelectedQuiz(null);
			setQuizProblems([]);
		}
	};

	const handleBackToList = () => {
		setSelectedQuiz(null);
		setQuizProblems([]);
	};

	const getStatusBadge = (status: string): React.ReactNode => {
		switch (status) {
			case "ACTIVE":
				return <S.StatusBadge $status="ACTIVE">진행중</S.StatusBadge>;
			case "WAITING":
				return <S.StatusBadge $status="WAITING">대기중</S.StatusBadge>;
			case "ENDED":
				return <S.StatusBadge $status="ENDED">종료</S.StatusBadge>;
			default:
				return null;
		}
	};

	const formatDateTime = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}.${month}.${day} ${hours}:${minutes}`;
	};

	if (loading) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu="코딩퀴즈"
					isCollapsed={isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<CourseHeader
						courseName={sectionInfo?.courseTitle || "강의"}
						onToggleSidebar={handleToggleSidebar}
						isSidebarCollapsed={isSidebarCollapsed}
					/>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (selectedQuiz && quizProblems.length > 0) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu="코딩퀴즈"
					isCollapsed={isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<CourseHeader
						courseName={
							sectionInfo?.courseTitle || sectionInfo?.courseName || "강의"
						}
						onToggleSidebar={handleToggleSidebar}
						isSidebarCollapsed={isSidebarCollapsed}
					/>
					<S.CodingQuizBody>
						<S.ProblemsHeader>
							<S.BackButton onClick={handleBackToList}>← 목록으로</S.BackButton>
							{selectedQuiz.status === "ACTIVE" && (
								<QuizTimer
									endTime={selectedQuiz.endTime.toISOString()}
									onTimeUp={() => {}}
								/>
							)}
						</S.ProblemsHeader>

						<S.QuizHeader>
							<h1>{selectedQuiz.title}</h1>
							<p>{selectedQuiz.description || ""}</p>
						</S.QuizHeader>

						<S.ProblemsList>
							{quizProblems.map((problem) => (
								<S.ProblemItem
									key={problem.id}
									onClick={() => handleProblemSelect(problem.id)}
								>
									<S.ProblemItemTitle>{problem.title}</S.ProblemItemTitle>
									<S.ProblemItemArrow>→</S.ProblemItemArrow>
								</S.ProblemItem>
							))}
						</S.ProblemsList>
					</S.CodingQuizBody>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu="코딩퀴즈"
				isCollapsed={isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle || sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>
				<S.CodingQuizBody>
					<S.QuizHeader>
						<h1>코딩 퀴즈</h1>
						<p>실시간 코딩 테스트에 참여하세요</p>
					</S.QuizHeader>

					<S.QuizSection>
						<S.SectionTitle>코딩 퀴즈 목록</S.SectionTitle>
						<S.QuizList>
							{quizzes.length > 0 ? (
								quizzes.map((quiz) => (
									<S.QuizCard
										key={quiz.id}
										$status={quiz.status}
										onClick={() => handleQuizClick(quiz)}
									>
										<S.QuizCardHeader>
											<h3>{quiz.title}</h3>
											{getStatusBadge(quiz.status)}
										</S.QuizCardHeader>
										<S.QuizCardContent>
											<S.QuizDescription>
												{quiz.description || ""}
											</S.QuizDescription>
											<S.QuizInfo>
												<span className="start-time">
													시작: {formatDateTime(quiz.startTime)}
												</span>
												<span className="end-time">
													종료: {formatDateTime(quiz.endTime)}
												</span>
												<span className="problem-count">
													문제: {quiz.problemCount}개
												</span>
											</S.QuizInfo>
										</S.QuizCardContent>
									</S.QuizCard>
								))
							) : (
								<S.EmptyState>
									<p>등록된 코딩 퀴즈가 없습니다.</p>
								</S.EmptyState>
							)}
						</S.QuizList>
					</S.QuizSection>
				</S.CodingQuizBody>
			</S.Content>
		</S.Container>
	);
};

export default CodingQuizPage;
