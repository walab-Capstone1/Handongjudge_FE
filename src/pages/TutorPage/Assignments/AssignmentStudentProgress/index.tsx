import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
import { useAssignmentStudentProgress } from "./hooks/useAssignmentStudentProgress";
import * as S from "./styles";
import type { SectionInfo } from "./types";
import ProgressDetailView from "./components/ProgressDetailView";
import ProgressListView from "./components/ProgressListView";

const AssignmentStudentProgress: FC = () => {
	const data = useAssignmentStudentProgress();
	const {
		sectionId,
		assignmentId,
		loading,
		assignments,
		assignment,
		currentSection,
		filteredProgressAssignments,
		progressSearchTerm,
		setProgressSearchTerm,
		submissionStats,
	} = data;

	if (loading && !assignmentId) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>학생 진행 현황을 불러오는 중...</p>
				</S.LoadingContainer>
			</TutorLayout>
		);
	}

	if (assignmentId && !assignment) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>과제 정보를 불러오는 중...</p>
				</S.LoadingContainer>
			</TutorLayout>
		);
	}

	if (assignmentId && assignment) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<ProgressDetailView
					sectionId={sectionId}
					assignment={assignment}
					problems={data.problems}
					studentProgress={data.studentProgress}
					searchTerm={data.searchTerm}
					setSearchTerm={data.setSearchTerm}
					filterStatus={data.filterStatus}
					setFilterStatus={data.setFilterStatus}
					expandedProblems={data.expandedProblems}
					toggleProblem={data.toggleProblem}
					filteredStudents={data.filteredStudents}
					getCompletionStatus={data.getCompletionStatus}
					getProgressPercentage={data.getProgressPercentage}
					handleBadgeClick={data.handleBadgeClick}
					selectedStudent={data.selectedStudent}
					showDetailModal={data.showDetailModal}
					setShowDetailModal={data.setShowDetailModal}
					setSelectedStudent={data.setSelectedStudent}
					detailModalRef={data.detailModalRef}
					showCodeModal={data.showCodeModal}
					setShowCodeModal={data.setShowCodeModal}
					selectedCodeData={data.selectedCodeData}
					loadingCode={data.loadingCode}
				/>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			<ProgressListView
				sectionId={sectionId}
				loading={loading}
				assignmentsLength={assignments.length}
				filteredAssignments={filteredProgressAssignments}
				progressSearchTerm={progressSearchTerm}
				onProgressSearchChange={setProgressSearchTerm}
				submissionStats={submissionStats}
			/>
		</TutorLayout>
	);
};

export default AssignmentStudentProgress;
