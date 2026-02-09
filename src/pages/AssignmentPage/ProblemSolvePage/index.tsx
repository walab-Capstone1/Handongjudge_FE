import type React from "react";
import LoadingSpinner from "../../../components/UI/LoadingSpinner";
import { useProblemSolve } from "./hooks/useProblemSolve";
import ProblemSolveView from "./components/ProblemSolveView";
import * as S from "./styles";

const ProblemSolvePage: React.FC = () => {
	const hook = useProblemSolve();

	if (hook.isLoading) {
		return (
			<S.PageWrapper
				className={`problem-solve-page ${hook.theme}`}
				$theme={hook.theme}
			>
				<S.LoadingContainer $theme={hook.theme}>
					<LoadingSpinner />
				</S.LoadingContainer>
			</S.PageWrapper>
		);
	}

	return (
		<ProblemSolveView
			sectionId={hook.sectionId}
			assignmentId={hook.assignmentId}
			sectionInfo={hook.sectionInfo}
			assignmentInfo={hook.assignmentInfo}
			currentProblem={hook.currentProblem}
			problemDescription={hook.problemDescription}
			language={hook.language}
			theme={hook.theme}
			setTheme={hook.setTheme}
			code={hook.code}
			setCode={hook.setCode}
			submissionResult={hook.submissionResult}
			isSubmitting={hook.isSubmitting}
			sessionSaveStatus={hook.sessionSaveStatus}
			codeLoadSource={hook.codeLoadSource ?? undefined}
			sessionCleared={hook.sessionCleared}
			horizontalSizes={hook.horizontalSizes}
			verticalSizes={hook.verticalSizes}
			panelLayout={hook.panelLayout}
			handlePanelMove={hook.handlePanelMove}
			handleLanguageChange={hook.handleLanguageChange}
			handleSubmit={hook.handleSubmit}
			handleSubmitWithOutput={hook.handleSubmitWithOutput}
			saveToSession={hook.saveToSession}
			handleHorizontalDragEnd={hook.handleHorizontalDragEnd}
			handleVerticalDragEnd={hook.handleVerticalDragEnd}
			gutterStyleCallback={hook.gutterStyleCallback}
			isDeadlinePassed={hook.isDeadlinePassed}
			isAssignmentActive={hook.isAssignmentActive}
			userRole={hook.userRole}
		/>
	);
};

export default ProblemSolvePage;
