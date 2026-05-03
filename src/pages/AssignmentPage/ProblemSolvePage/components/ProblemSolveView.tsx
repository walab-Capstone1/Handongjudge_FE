import type React from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Split from "react-split";
import ProblemDescription from "../../../Course/CodingQuiz/CodingQuizSolvePage/ProblemDescription";
import CodeEditor from "../../../Course/CodingQuiz/CodingQuizSolvePage/CodeEditor";
import ExecutionResult from "../../../Course/CodingQuiz/CodingQuizSolvePage/ExecutionResult";
import DraggablePanel from "../../../Course/CodingQuiz/CodingQuizSolvePage/DraggablePanel";
import ProblemSelectModal from "../../../Course/CodingQuiz/CodingQuizSolvePage/ProblemSelectModal";
import AssignmentSelectModal from "./AssignmentSelectModal";
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
	problems: Array<{ id: number; title: string; order: number }>;
	isProblemModalOpen: boolean;
	isProblemChanging: boolean;
	setIsProblemModalOpen: (open: boolean) => void;
	handlePanelMove: (dragged: string, target: string) => void;
	handleProblemChange: (problemId: number) => void;
	problemNav: {
		prevProblemId: number | null;
		nextProblemId: number | null;
		indexLabel: string;
	};
	sectionAssignments: Array<{ id: number; title: string }>;
	isAssignmentModalOpen: boolean;
	setIsAssignmentModalOpen: (open: boolean) => void;
	handleSelectOtherAssignment: (assignmentId: number) => void;
	handleSubmit: () => void;
	handleSubmitWithOutput: () => void;
	saveToSession: () => void;
	saveToBackend: (showModal?: boolean) => void;
	showSaveModal: boolean;
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
	showUnsavedModal: boolean;
	handleUnsavedModalSave: () => void;
	handleUnsavedModalSkip: () => void;
	handleUnsavedModalCancel: () => void;
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
		problems,
		isProblemModalOpen,
		isProblemChanging,
		setIsProblemModalOpen,
		handlePanelMove,
		handleProblemChange,
		problemNav,
		sectionAssignments,
		isAssignmentModalOpen,
		setIsAssignmentModalOpen,
		handleSelectOtherAssignment,
		handleSubmit,
		handleSubmitWithOutput,
		saveToSession,
		saveToBackend,
		showSaveModal,
		handleHorizontalDragEnd,
		handleVerticalDragEnd,
		gutterStyleCallback,
		isDeadlinePassed,
		isAssignmentActive,
		userRole,
		showUnsavedModal,
		handleUnsavedModalSave,
		handleUnsavedModalSkip,
		handleUnsavedModalCancel,
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
				onBackendSave={saveToBackend}
				saveMode="backend"
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
				{showSaveModal && (
					<S.SaveModal>
						<S.SaveModalContent>
							<S.SaveModalText>저장되었습니다</S.SaveModalText>
						</S.SaveModalContent>
					</S.SaveModal>
				)}
				<S.Header $theme={theme}>
					<S.HeaderBreadcrumbWrap>
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
					</S.HeaderBreadcrumbWrap>
					<S.ProblemToolbarRow>
						<S.PrevNextButton
							type="button"
							$theme={theme}
							$disabled={problemNav.prevProblemId == null || isProblemChanging}
							disabled={problemNav.prevProblemId == null || isProblemChanging}
							onClick={() => {
								if (problemNav.prevProblemId != null) {
									handleProblemChange(problemNav.prevProblemId);
								}
							}}
						>
							‹ 이전 문제
						</S.PrevNextButton>
						{problemNav.indexLabel ? (
							<S.ProblemIndexHint $theme={theme}>
								문제 {problemNav.indexLabel}
							</S.ProblemIndexHint>
						) : null}
						<S.PrevNextButton
							type="button"
							$theme={theme}
							$disabled={problemNav.nextProblemId == null || isProblemChanging}
							disabled={problemNav.nextProblemId == null || isProblemChanging}
							onClick={() => {
								if (problemNav.nextProblemId != null) {
									handleProblemChange(problemNav.nextProblemId);
								}
							}}
						>
							다음 문제 ›
						</S.PrevNextButton>
						<S.ProblemNavigateButton
							type="button"
							$theme={theme}
							onClick={() => setIsProblemModalOpen(true)}
						>
							문제 목록
						</S.ProblemNavigateButton>
						<S.ProblemNavigateButton
							type="button"
							$theme={theme}
							onClick={() => setIsAssignmentModalOpen(true)}
						>
							과제 이동
						</S.ProblemNavigateButton>
					</S.ProblemToolbarRow>
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
				<ProblemSelectModal
					isOpen={isProblemModalOpen}
					problems={problems}
					currentProblemId={currentProblem.id ?? null}
					isChanging={isProblemChanging}
					onClose={() => setIsProblemModalOpen(false)}
					onSelectProblem={(pid) => {
						handleProblemChange(pid);
					}}
				/>
				<AssignmentSelectModal
					isOpen={isAssignmentModalOpen}
					assignments={sectionAssignments}
					currentAssignmentId={
						assignmentId != null ? Number(assignmentId) : null
					}
					isChanging={isProblemChanging}
					onClose={() => setIsAssignmentModalOpen(false)}
					onSelectAssignment={handleSelectOtherAssignment}
				/>
				{showUnsavedModal && (
					<S.UnsavedModalOverlay>
						<S.UnsavedModalCard $theme={theme}>
							<S.UnsavedModalTitle $theme={theme}>
								저장되지 않은 변경사항이 있습니다
							</S.UnsavedModalTitle>
							<S.UnsavedModalDesc $theme={theme}>
								문제를 이동하기 전에 변경사항을 저장하시겠습니까?
							</S.UnsavedModalDesc>
							<S.UnsavedModalActions>
								<S.UnsavedModalButton
									type="button"
									$theme={theme}
									onClick={handleUnsavedModalCancel}
								>
									취소
								</S.UnsavedModalButton>
								<S.UnsavedModalButton
									type="button"
									$theme={theme}
									onClick={handleUnsavedModalSkip}
								>
									저장 안 함
								</S.UnsavedModalButton>
								<S.UnsavedModalPrimaryButton
									type="button"
									$theme={theme}
									onClick={handleUnsavedModalSave}
								>
									저장 후 이동
								</S.UnsavedModalPrimaryButton>
							</S.UnsavedModalActions>
						</S.UnsavedModalCard>
					</S.UnsavedModalOverlay>
				)}
			</S.PageWrapper>
		</DndProvider>
	);
};

export default ProblemSolveView;
