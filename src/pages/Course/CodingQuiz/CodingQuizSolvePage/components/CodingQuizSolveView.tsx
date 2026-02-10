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
import type { UseCodingQuizSolveReturn } from "../hooks/useCodingQuizSolve";

export default function CodingQuizSolveView(d: UseCodingQuizSolveReturn) {
	const navigate = useNavigate();

	if (d.isLoading) {
		return (
			<div className={`problem-solve-page ${d.theme}`}>
				<div className="loading-container">
					<LoadingSpinner />
				</div>
			</div>
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
			<div className={`problem-solve-page ${d.theme}`}>
				<div className="problem-solve-header quiz-header">
					<div className="breadcrumb">
						<span
							className="breadcrumb-link"
							onClick={() => navigate(`/sections/${d.sectionId}/coding-quiz`)}
							onKeyDown={(e) =>
								e.key === "Enter" &&
								navigate(`/sections/${d.sectionId}/coding-quiz`)
							}
							role="button"
							tabIndex={0}
						>
							코딩 테스트
						</span>
						<span> › </span>
						<strong>{d.quizInfo.title}</strong>
					</div>
					<div className="header-right">
						{d.problems.length > 1 && (
							<div className="problem-selector-header">
								{d.problems.map((problem, index) => (
									<button
										key={problem.id}
										type="button"
										className={`problem-selector-btn ${d.selectedProblemId === problem.id ? "active" : ""}`}
										onClick={() => d.handleProblemChange(problem.id)}
									>
										{index + 1}
									</button>
								))}
							</div>
						)}
						<QuizTimer
							endTime={d.quizInfo.endTime!}
							onTimeUp={d.handleTimeUp}
						/>
						<div className="controls">
							<button
								type="button"
								className={`theme-button ${d.theme === "light" ? "active" : ""}`}
								onClick={() => d.setTheme("light")}
							>
								Light
							</button>
							<button
								type="button"
								className={`theme-button ${d.theme === "dark" ? "active" : ""}`}
								onClick={() => d.setTheme("dark")}
							>
								Dark
							</button>
							<select
								className="language-select"
								value={d.language}
								onChange={(e) => d.handleLanguageChange(e.target.value)}
								disabled={d.isTimeUp}
							>
								<option value="c">C</option>
								<option value="cpp">C++</option>
								<option value="java">Java</option>
								<option value="python">Python</option>
							</select>
						</div>
					</div>
				</div>

				<div className="main-split">
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
				</div>
			</div>
		</DndProvider>
	);
}
