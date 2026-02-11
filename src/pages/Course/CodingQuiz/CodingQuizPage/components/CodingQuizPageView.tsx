import type React from "react";
import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import QuizTimer from "../../../../../components/Quiz/QuizTimer";
import type { CodingQuizPageHookReturn } from "../hooks/useCodingQuizPage";
import * as S from "../styles";

export default function CodingQuizPageView(d: CodingQuizPageHookReturn) {
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

	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="코딩퀴즈"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={d.sectionInfo?.courseTitle || "강의"}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (d.selectedQuiz && d.quizProblems.length > 0) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="코딩퀴즈"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={
							d.sectionInfo?.courseTitle || d.sectionInfo?.courseName || "강의"
						}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.CodingQuizBody>
						<S.ProblemsHeader>
							<S.BackButton onClick={d.handleBackToList}>
								← 목록으로
							</S.BackButton>
							{d.selectedQuiz.status === "ACTIVE" && (
								<QuizTimer
									endTime={d.selectedQuiz.endTime.toISOString()}
									onTimeUp={() => {}}
								/>
							)}
						</S.ProblemsHeader>

						<S.QuizHeader>
							<h1>{d.selectedQuiz.title}</h1>
							<p>{d.selectedQuiz.description || ""}</p>
						</S.QuizHeader>

						<S.ProblemsList>
							{d.quizProblems.map((problem) => (
								<S.ProblemItem
									key={problem.id}
									onClick={() => d.handleProblemSelect(problem.id)}
								>
									<S.ProblemItemTitle>{problem.title}</S.ProblemItemTitle>
									<S.ProblemBadge
										$status={problem.status ?? "NOT_SUBMITTED"}
									>
										{problem.status === "ACCEPTED"
											? "정답"
											: problem.status === "SUBMITTED"
												? "제출"
												: "미제출"}
									</S.ProblemBadge>
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
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu="코딩퀴즈"
				isCollapsed={d.isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={
						d.sectionInfo?.courseTitle || d.sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
				/>
				<S.CodingQuizBody>
					<S.QuizHeader>
						<h1>코딩 퀴즈</h1>
						<p>실시간 코딩 테스트에 참여하세요</p>
					</S.QuizHeader>

					<S.QuizSection>
						<S.SectionTitle>코딩 퀴즈 목록</S.SectionTitle>
						<S.QuizList>
							{d.quizzes.length > 0 ? (
								d.quizzes.map((quiz) => (
									<S.QuizCard
										key={quiz.id}
										$status={quiz.status}
										$inactive={d.isManager && quiz.active === false}
										onClick={() => d.handleQuizClick(quiz)}
									>
										<S.QuizCardHeader>
											<h3>{quiz.title}</h3>
											<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
												{getStatusBadge(quiz.status)}
												{d.isManager && quiz.active === false && (
													<S.InactiveBadge>비활성화</S.InactiveBadge>
												)}
											</div>
										</S.QuizCardHeader>
										<S.QuizCardContent>
											<S.QuizDescription>
												{quiz.description || ""}
											</S.QuizDescription>
											<S.QuizInfo>
												<span className="start-time">
													시작: {d.formatDateTime(quiz.startTime)}
												</span>
												<span className="end-time">
													종료: {d.formatDateTime(quiz.endTime)}
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
}
