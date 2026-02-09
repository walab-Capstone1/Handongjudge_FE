import React from "react";
import TutorLayout from "../../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../../components/Navigation/SectionNavigation";
import * as S from "../styles";
import type { GradeManagementHookReturn } from "../hooks/useGradeManagement";
import GradeManagementHeader from "./GradeManagementHeader";
import GradeManagementCourseTable from "./GradeManagementCourseTable";
import GradeManagementQuizTable from "./GradeManagementQuizTable";
import GradeManagementAssignmentTable from "./GradeManagementAssignmentTable";
import GradeCodeModal from "./GradeCodeModal";
import GradeBulkInputModal from "./GradeBulkInputModal";
import GradeStatsModal from "./GradeStatsModal";
import GradePointsModal from "./GradePointsModal";

export default function GradeManagementView(d: GradeManagementHookReturn) {
	const {
		sectionId,
		currentSection,
		assignments,
		quizzes,
		selectedAssignment,
		setSelectedAssignment,
		selectedQuiz,
		setSelectedQuiz,
		grades,
		loading,
		searchTerm,
		setSearchTerm,
		editingGrade,
		setEditingGrade,
		gradeInputs,
		setGradeInputs,
		comments,
		viewMode,
		setViewMode,
		courseGrades,
		courseLoading,
		showCodeModal,
		setShowCodeModal,
		selectedCode,
		showBulkModal,
		setShowBulkModal,
		showStatsModal,
		setShowStatsModal,
		showPointsModal,
		setShowPointsModal,
		pointsInputs,
		setPointsInputs,
		pointsSaving,
		assignmentProblems,
		setAssignmentProblems,
		loadingProblems,
		allAssignmentProblems,
		setAllAssignmentProblems,
		bulkInputs,
		setBulkInputs,
		bulkSaving,
		getSectionDisplayName,
		handleSaveGrade,
		handleViewCode,
		handleExportCSV,
		handleBulkSave,
		handleSavePoints,
		stats,
		filteredGrades,
		filteredCourseStudents,
	} = d;

	const handleClosePointsModal = () => {
		setShowPointsModal(false);
		setPointsInputs({});
		setAssignmentProblems([]);
		setAllAssignmentProblems([]);
	};

	if (loading && !grades.length) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<S.Container>
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<p>성적 데이터를 불러오는 중...</p>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			{sectionId && currentSection && (
				<SectionNavigation
					sectionId={sectionId}
					sectionName={getSectionDisplayName()}
					enrollmentCode={
						(currentSection as { enrollmentCode?: string }).enrollmentCode
					}
					title="성적 관리"
					showSearch={false}
				/>
			)}

			<S.Container>
				<GradeManagementHeader
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					sectionId={sectionId}
					assignments={assignments}
					quizzes={quizzes}
					viewMode={viewMode}
					setViewMode={setViewMode}
					selectedAssignment={selectedAssignment}
					setSelectedAssignment={setSelectedAssignment}
					selectedQuiz={selectedQuiz}
					setSelectedQuiz={setSelectedQuiz}
					onShowPointsModal={() => setShowPointsModal(true)}
					onShowBulkModal={() => setShowBulkModal(true)}
					onShowStatsModal={() => setShowStatsModal(true)}
					onExportCSV={handleExportCSV}
				/>

				{/* 성적 테이블 */}
				{viewMode === "course" ? (
					<GradeManagementCourseTable
						courseLoading={courseLoading}
						courseGrades={courseGrades}
						filteredCourseStudents={filteredCourseStudents}
					/>
				) : selectedQuiz && viewMode === "quiz" && grades.length > 0 ? (
					<GradeManagementQuizTable
						grades={grades}
						filteredGrades={filteredGrades}
					/>
				) : selectedQuiz && viewMode === "quiz" ? (
					<S.TableContainer>
						<S.NoData>
							<p>등록된 성적이 없습니다.</p>
						</S.NoData>
					</S.TableContainer>
				) : selectedAssignment && grades.length > 0 ? (
					<GradeManagementAssignmentTable
						grades={grades}
						filteredGrades={filteredGrades}
						editingGrade={editingGrade}
						setEditingGrade={setEditingGrade}
						gradeInputs={gradeInputs}
						setGradeInputs={setGradeInputs}
						comments={comments}
						handleSaveGrade={handleSaveGrade}
						handleViewCode={handleViewCode}
					/>
				) : selectedAssignment ? (
					<S.NoData>
						<p>등록된 성적이 없습니다.</p>
					</S.NoData>
				) : (
					<S.NoData>
						<p>과제를 선택하여 성적을 확인하세요.</p>
					</S.NoData>
				)}

				<GradeCodeModal
					show={showCodeModal}
					selectedCode={selectedCode}
					onClose={() => setShowCodeModal(false)}
				/>

				<GradeBulkInputModal
					show={showBulkModal && !!selectedAssignment && grades.length > 0}
					grades={grades}
					bulkInputs={bulkInputs}
					setBulkInputs={setBulkInputs}
					bulkSaving={bulkSaving}
					onClose={() => {
						setShowBulkModal(false);
						setBulkInputs({});
					}}
					onSave={handleBulkSave}
				/>

				<GradeStatsModal
					show={showStatsModal}
					stats={stats}
					onClose={() => setShowStatsModal(false)}
				/>

				<GradePointsModal
					show={showPointsModal}
					viewMode={viewMode}
					hasAssignments={assignments.length > 0}
					selectedAssignment={selectedAssignment}
					loadingProblems={loadingProblems}
					allAssignmentProblems={allAssignmentProblems}
					assignmentProblems={assignmentProblems}
					pointsInputs={pointsInputs}
					setPointsInputs={setPointsInputs}
					pointsSaving={pointsSaving}
					onClose={handleClosePointsModal}
					onSave={handleSavePoints}
				/>
			</S.Container>
		</TutorLayout>
	);
}
