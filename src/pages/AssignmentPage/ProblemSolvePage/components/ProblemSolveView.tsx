import type React from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Split from "react-split";
import ProblemDescription from "../../../Course/CodingQuiz/CodingQuizSolvePage/ProblemDescription";
import CodeEditor from "../../../Course/CodingQuiz/CodingQuizSolvePage/CodeEditor";
import ExecutionResult from "../../../Course/CodingQuiz/CodingQuizSolvePage/ExecutionResult";
import DraggablePanel from "../../../Course/CodingQuiz/CodingQuizSolvePage/DraggablePanel";
import type { PanelKey } from "../hooks/useProblemSolve";
import type { Problem } from "../types";
import * as S from "../styles";

interface ProblemSolveViewProps {
	sectionId: string | undefined;
	assignmentId: string | undefined;
	sectionInfo: { courseTitle: string; sectionNumber: number };
	assignmentInfo: {
		title: string;
		assignmentNumber?: string;
		dueDate: string | null;
		endDate: string | null;
	};
	currentProblem: Problem;
	problemDescription: string;
	language: string;
	theme: "light" | "dark";
	setTheme: (t: "light" | "dark") => void;
	code: string;
	setCode: (c: string) => void;
	submissionResult: unknown;
	isSubmitting: boolean;
	sessionSaveStatus: "idle" | "saving" | "saved" | "error";
	codeLoadSource: string | undefined;
	sessionCleared: boolean;
	horizontalSizes: number[];
	verticalSizes: number[];
	panelLayout: { left: PanelKey; topRight: PanelKey; bottomRight: PanelKey };
	handlePanelMove: (dragged: string, target: string) => void;
	handleLanguageChange: (lang: string) => void;
	handleSubmit: () => void;
	handleSubmitWithOutput: () => void;
	saveToSession: () => void;
	handleHorizontalDragEnd: (sizes: number[]) => void;
	handleVerticalDragEnd: (sizes: number[]) => void;
	gutterStyleCallback: (
		dim: "width" | "height",
		gutterSize: number,
		index: number,
	) => Record<string, string>;
	isDeadlinePassed: boolean;
	isAssignmentActive: boolean;
	userRole: string | null;
}

const ProblemSolveView: React.FC<ProblemSolveViewProps> = (props) => {
	const {
		sectionId,
		assignmentId,
		sectionInfo,
		assignmentInfo,
		currentProblem,
		problemDescription,
		language,
		theme,
		setTheme,
		code,
		setCode,
		submissionResult,
		isSubmitting,
		sessionSaveStatus,
		codeLoadSource,
		sessionCleared,
		horizontalSizes,
		verticalSizes,
		panelLayout,
		handlePanelMove,
		handleLanguageChange,
		handleSubmit,
		handleSubmitWithOutput,
		saveToSession,
		handleHorizontalDragEnd,
		handleVerticalDragEnd,
		gutterStyleCallback,
		isDeadlinePassed,
		isAssignmentActive,
		userRole,
	} = props;
	const navigate = useNavigate();

	const panels: Record<PanelKey, React.ReactNode> = {
		description: (
			<ProblemDescription
				currentProblem={currentProblem}
				problemDescription={problemDescription}
			/>
		),
		editor: (
			<CodeEditor
				language={language}
				code={code}
				theme={theme}
				assignmentInfo={assignmentInfo}
				isSubmitting={isSubmitting}
				onCodeChange={setCode}
				onSubmit={handleSubmit}
				onSubmitWithOutput={handleSubmitWithOutput}
				sessionSaveStatus={sessionSaveStatus}
				onSessionSave={saveToSession}
				codeLoadSource={codeLoadSource}
				sessionCleared={sessionCleared}
				isDeadlinePassed={isDeadlinePassed}
				isAssignmentActive={isAssignmentActive}
				userRole={userRole}
			/>
		),
		result: (
			<ExecutionResult
				submissionResult={submissionResult}
				isSubmitting={isSubmitting}
			/>
		),
	};

	const titles: Record<PanelKey, string> = {
		description: "문제 설명",
		editor: "코드 에디터",
		result: "실행 결과",
	};

	const renderPanel = (panelType: PanelKey, showDragHandle = true) => (
		<DraggablePanel
			id={panelType}
			type={panelType}
			title={titles[panelType]}
			onMove={handlePanelMove}
			showDragHandle={showDragHandle}
		>
			{panels[panelType]}
		</DraggablePanel>
	);

	return (
		<DndProvider backend={HTML5Backend}>
			<S.PageWrapper className={`problem-solve-page ${theme}`} $theme={theme}>
				<S.Header $theme={theme}>
					<S.Breadcrumb>
						<S.BreadcrumbLink
							type="button"
							onClick={() => navigate(`/sections/${sectionId}/dashboard`)}
						>
							{sectionInfo.courseTitle}
						</S.BreadcrumbLink>
						<span> › </span>
						<S.BreadcrumbLink
							type="button"
							onClick={() =>
								navigate(
									`/sections/${sectionId}/course-assignments?assignmentId=${assignmentId}`,
								)
							}
						>
							{assignmentInfo.title}
						</S.BreadcrumbLink>
						<span> › </span>
						<S.BreadcrumbCurrent $theme={theme}>
							{currentProblem.title}
						</S.BreadcrumbCurrent>
					</S.Breadcrumb>
					<S.Controls>
						<S.ThemeButton
							type="button"
							$active={theme === "light"}
							$theme={theme}
							onClick={() => setTheme("light")}
						>
							Light
						</S.ThemeButton>
						<S.ThemeButton
							type="button"
							$active={theme === "dark"}
							$theme={theme}
							onClick={() => setTheme("dark")}
						>
							Dark
						</S.ThemeButton>
						<S.LanguageSelect
							$theme={theme}
							value={language}
							onChange={(e) => handleLanguageChange(e.target.value)}
							disabled
							style={{ opacity: 0.7, cursor: "not-allowed" }}
						>
							<option value="c">C</option>
						</S.LanguageSelect>
					</S.Controls>
				</S.Header>

				<S.MainSplit>
					<Split
						sizes={horizontalSizes}
						direction="horizontal"
						minSize={200}
						gutterSize={20}
						gutterStyle={gutterStyleCallback}
						onDragEnd={handleHorizontalDragEnd}
						style={{ display: "flex", width: "100%" }}
					>
						{renderPanel(panelLayout.left, true)}
						<Split
							sizes={verticalSizes}
							direction="vertical"
							minSize={100}
							gutterSize={20}
							gutterStyle={gutterStyleCallback}
							onDragEnd={handleVerticalDragEnd}
							style={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
							}}
						>
							{renderPanel(panelLayout.topRight, true)}
							{renderPanel(panelLayout.bottomRight, true)}
						</Split>
					</Split>
				</S.MainSplit>
			</S.PageWrapper>
		</DndProvider>
	);
};

export default ProblemSolveView;
