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
				isSubmitting={d.isSubmitting || d.isSubmitBlocked}
				onCodeChange={d.setCode}
				onSubmit={d.handleSubmit}
				onSubmitWithOutput={d.handleSubmitWithOutput}
				sessionSaveStatus={d.sessionSaveStatus}
				onBackendSave={d.saveToBackend}
				saveMode="backend"
				codeLoadSource={d.codeLoadSource}
				sessionCleared={d.sessionCleared}
				isEditLocked={d.isEditLocked}
				isSaveLocked={d.isEditLocked}
				showSaveWarning={d.isSaveWarning}
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
				{/* 다른 환경에서 이미 시험 진행 중 - 강제 인계 확인 모달 */}
				{d.examSessionConflict && (
					<S.OverlayModal>
						<S.OverlayModalBox>
							<S.OverlayModalTitle>이미 다른 환경에서 시험 진행 중</S.OverlayModalTitle>
							<S.OverlayModalDesc>
								현재 다른 기기 또는 브라우저에서 이 시험이 진행 중입니다.
								<br />
								여기서 계속 진행하면 기존 세션이 종료됩니다.
							</S.OverlayModalDesc>
							<S.OverlayModalButtons>
								<S.OverlayModalConfirm type="button" onClick={d.handleExamSessionTakeover}>
									여기서 계속하기
								</S.OverlayModalConfirm>
								<S.OverlayModalCancel
									type="button"
									onClick={() => navigate(`/sections/${d.sectionId}/coding-quiz`)}
								>
									돌아가기
								</S.OverlayModalCancel>
							</S.OverlayModalButtons>
						</S.OverlayModalBox>
					</S.OverlayModal>
				)}
				{/* 다른 환경에서 세션을 인계해간 경우 */}
				{d.examSessionTakenOver && (
					<S.OverlayModal>
						<S.OverlayModalBox>
							<S.OverlayModalTitle>세션이 종료되었습니다</S.OverlayModalTitle>
							<S.OverlayModalDesc>
								다른 기기 또는 브라우저에서 동일한 계정으로 시험에 접속했습니다.
								<br />
								이 페이지에서는 더 이상 시험을 진행할 수 없습니다.
							</S.OverlayModalDesc>
							<S.OverlayModalButtons>
								<S.OverlayModalCancel
									type="button"
									onClick={() => navigate(`/sections/${d.sectionId}/coding-quiz`)}
								>
									목록으로 돌아가기
								</S.OverlayModalCancel>
							</S.OverlayModalButtons>
						</S.OverlayModalBox>
					</S.OverlayModal>
				)}
			{d.showSaveModal && (
				<S.SaveModal>
					<S.SaveModalContent>
						<S.SaveModalText>저장되었습니다</S.SaveModalText>
					</S.SaveModalContent>
				</S.SaveModal>
			)}
			{/* 문제 전환 시 미저장 변경사항 안내 모달 */}
			{d.showUnsavedModal && (
				<S.OverlayModal>
					<S.OverlayModalBox>
						<S.OverlayModalTitle>저장하지 않은 변경사항</S.OverlayModalTitle>
						<S.OverlayModalDesc>
							현재 작성 중인 코드가 저장되지 않았습니다.
							<br />
							다른 문제로 이동하기 전에 저장하시겠습니까?
						</S.OverlayModalDesc>
						<S.OverlayModalButtons>
							<S.OverlayModalConfirm type="button" onClick={d.handleUnsavedModalSave}>
								저장하고 이동
							</S.OverlayModalConfirm>
							<S.OverlayModalCancel type="button" onClick={d.handleUnsavedModalSkip}>
								저장 없이 이동
							</S.OverlayModalCancel>
							<S.OverlayModalCancel type="button" onClick={d.handleUnsavedModalCancel}>
								취소
							</S.OverlayModalCancel>
						</S.OverlayModalButtons>
					</S.OverlayModalBox>
				</S.OverlayModal>
			)}
				<ProblemSelectModal
					isOpen={d.isProblemModalOpen}
					problems={d.problems}
					currentProblemId={d.selectedProblemId}
					isChanging={d.isProblemChanging}
					onClose={() => d.setIsProblemModalOpen(false)}
					onSelectProblem={d.handleProblemChange}
					problemStatusById={d.problemStatusById}
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
