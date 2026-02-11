import type React from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Split from "react-split";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import ProblemDescription from "../ProblemDescription";
import CodeEditor from "../CodeEditor";
import ExecutionResult from "../ExecutionResult";
import DraggablePanel from "../DraggablePanel";
import QuizTimer from "../../../../../components/Quiz/QuizTimer";
import ProblemSelectModal from "../ProblemSelectModal";
import type { UseCodingQuizSolveReturn } from "../hooks/useCodingQuizSolve";
import * as S from "../styles";

export default function CodingQuizSolveView(d: UseCodingQuizSolveReturn) {
	const navigate = useNavigate();

	if (d.isLoading) {
		return (
			<S.PageWrapper className={`problem-solve-page ${d.theme}`} $theme={d.theme}>
				<S.LoadingContainer $theme={d.theme}>
					<LoadingSpinner />
				</S.LoadingContainer>
			</S.PageWrapper>
		);
	}

	const panels: Record<string, React.ReactNode> = {
		description: (
			<ProblemDescription
				currentProblem={d.currentProblem}
				problemDescription={d.problemDescription}
			/>
		),
		editor: (
			<CodeEditor
				language={d.language}
				code={d.code}
				theme={d.theme}
				assignmentInfo={d.quizInfo}
				isSubmitting={d.isSubmitting || d.isTimeUp}
				onCodeChange={d.setCode}
				onSubmit={d.handleSubmit}
				onSubmitWithOutput={d.handleSubmitWithOutput}
				sessionSaveStatus={d.sessionSaveStatus}
				onSessionSave={d.saveToSession}
				codeLoadSource={d.codeLoadSource}
				sessionCleared={d.sessionCleared}
			/>
		),
		result: (
			<ExecutionResult
				submissionResult={d.submissionResult}
				isSubmitting={d.isSubmitting}
			/>
		),
	};

	const titles: Record<string, string> = {
		description: "문제 설명",
		editor: "코드 에디터",
		result: "실행 결과",
	};

	const renderPanel = (panelType: string, showDragHandle = true) => (
		<DraggablePanel
			id={panelType}
			type={panelType}
			title={titles[panelType]}
			onMove={d.handlePanelMove}
			showDragHandle={showDragHandle}
		>
			{panels[panelType]}
		</DraggablePanel>
	);

	return (
		<DndProvider backend={HTML5Backend}>
			<S.PageWrapper className={`problem-solve-page ${d.theme}`} $theme={d.theme}>
				{d.showSaveModal && (
					<S.SaveModal>
						<S.SaveModalContent>
							<S.SaveModalText>저장되었습니다</S.SaveModalText>
						</S.SaveModalContent>
					</S.SaveModal>
				)}
				<ProblemSelectModal
					isOpen={d.isProblemModalOpen}
					problems={d.problems}
					currentProblemId={d.selectedProblemId}
					onClose={() => d.setIsProblemModalOpen(false)}
					onSelectProblem={d.handleProblemChange}
				/>
				<S.Header $theme={d.theme}>
					<S.Breadcrumb>
						<S.BreadcrumbLink
							type="button"
							onClick={() => navigate(`/sections/${d.sectionId}/dashboard`)}
						>
							{d.sectionInfo?.courseTitle ?? "수업"}
						</S.BreadcrumbLink>
						<span> › </span>
						<S.BreadcrumbLink
							type="button"
							onClick={() => navigate(`/sections/${d.sectionId}/coding-quiz`)}
						>
							코딩 테스트
						</S.BreadcrumbLink>
						<span> › </span>
						<S.BreadcrumbCurrent $theme={d.theme}>
							{d.currentProblem?.title ?? d.quizInfo.title}
						</S.BreadcrumbCurrent>
					</S.Breadcrumb>
					<S.Controls>
						{d.problems.length > 1 && (
							<S.ProblemNavigateButton
								type="button"
								onClick={() => d.setIsProblemModalOpen(true)}
								$theme={d.theme}
							>
								다른 문제로 이동
							</S.ProblemNavigateButton>
						)}
						<S.TimerWrap>
							<QuizTimer
								endTime={d.quizInfo.endTime!}
								onTimeUp={d.handleTimeUp}
								compact
							/>
						</S.TimerWrap>
						<S.ThemeButton
							type="button"
							$active={d.theme === "light"}
							$theme={d.theme}
							onClick={() => d.setTheme("light")}
						>
							Light
						</S.ThemeButton>
						<S.ThemeButton
							type="button"
							$active={d.theme === "dark"}
							$theme={d.theme}
							onClick={() => d.setTheme("dark")}
						>
							Dark
						</S.ThemeButton>
						<S.LanguageSelect
							$theme={d.theme}
							value={d.language}
							onChange={(e) => d.handleLanguageChange(e.target.value)}
							disabled={d.isTimeUp}
						>
							<option value="c">C</option>
							<option value="cpp">C++</option>
							<option value="java">Java</option>
							<option value="python">Python</option>
						</S.LanguageSelect>
					</S.Controls>
				</S.Header>

				<S.MainSplit>
					<Split
						sizes={d.horizontalSizes}
						direction="horizontal"
						minSize={200}
						gutterSize={20}
						gutterStyle={d.gutterStyleCallback}
						onDragEnd={d.handleHorizontalDragEnd}
						style={{ display: "flex", width: "100%" }}
					>
						{renderPanel(d.panelLayout.left, true)}
						<Split
							sizes={d.verticalSizes}
							direction="vertical"
							minSize={100}
							gutterSize={20}
							gutterStyle={d.gutterStyleCallback}
							onDragEnd={d.handleVerticalDragEnd}
							style={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
							}}
						>
							{renderPanel(d.panelLayout.topRight, true)}
							{renderPanel(d.panelLayout.bottomRight, true)}
						</Split>
					</Split>
				</S.MainSplit>
			</S.PageWrapper>
		</DndProvider>
	);
}
