import type React from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import { useAssignmentManagement } from "./hooks/useAssignmentManagement";
import AssignmentAddModal from "./AssignmentModals/AssignmentAddModal";
import AssignmentEditModal from "./AssignmentModals/AssignmentEditModal";
import AssignmentTableView from "./AssignmentViews/AssignmentTableView";
import AssignmentListView from "./AssignmentViews/AssignmentListView";
import ProblemSelectModal from "./ProblemModals/ProblemSelectModal";
import ProblemCreateModal from "./ProblemModals/ProblemCreateModal";
import StandaloneProblemCreateModal from "./ProblemModals/StandaloneProblemCreateModal";
import BulkProblemCreateModal from "./ProblemModals/BulkProblemCreateModal";
import ProblemListModal from "./ProblemModals/ProblemListModal";
import ProblemDetailModal from "./ProblemModals/ProblemDetailModal";
import type { Assignment, SectionInfo } from "./types";
import * as S from "./styles";
import AssignmentManagementHeader from "./AssignmentManagementHeader";
import ProblemDetailPanel from "./ProblemDetailPanel";
import CopyProblemModal from "./CopyProblemModal";

const AssignmentManagement: React.FC = () => {
	const d = useAssignmentManagement();

	if (d.loading) {
		return (
			<TutorLayout selectedSection={d.currentSection as SectionInfo | null}>
				<LoadingSpinner message="과제 데이터를 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={d.currentSection as SectionInfo | null}>
			<S.Container>
				<AssignmentManagementHeader
					sectionId={d.sectionId}
					searchTerm={d.searchTerm}
					onSearchChange={d.setSearchTerm}
					filterSection={d.filterSection}
					onFilterSectionChange={d.setFilterSection}
					uniqueSections={d.uniqueSections}
					onAddAssignment={d.handleAddAssignment}
					onStandaloneProblemCreate={d.handleStandaloneProblemCreate}
					onBulkProblemCreate={d.handleBulkProblemCreate}
				/>

				{d.sectionId ? (
					<S.TableViewWrapper>
						<AssignmentTableView
							paginatedAssignments={d.paginatedAssignments}
							submissionStats={
								d.submissionStats as Record<
									number,
									{ submittedStudents: number; totalStudents: number }
								>
							}
							openMoreMenu={d.openMoreMenu}
							onToggleMoreMenu={(id) =>
								d.setOpenMoreMenu(d.openMoreMenu === id ? null : id)
							}
							onProblemListManage={(assignment) => {
								d.setSelectedAssignmentForProblemList(assignment as Assignment);
								d.setShowProblemListModal(true);
								d.setProblemListSearchTerm("");
							}}
							onAddProblem={d.handleAddProblem}
							onEdit={d.handleEdit}
							onToggleActive={d.handleToggleActive}
							onDelete={d.handleDelete}
							paginationProps={{
								currentPage: d.currentPage,
								totalItems: d.filteredAssignments.length,
								itemsPerPage: d.itemsPerPage,
								onPageChange: d.setCurrentPage,
								onItemsPerPageChange: d.onItemsPerPageChange,
								showItemsPerPage: false,
							}}
						/>
					</S.TableViewWrapper>
				) : (
					<S.ListViewWrapper>
						<AssignmentListView
							filteredAssignments={d.filteredAssignments}
							submissionStats={
								d.submissionStats as Record<
									number,
									{
										submittedStudents: number;
										totalStudents: number;
										problemStats?: {
											problemId: number;
											totalStudents: number;
										}[];
									}
								>
							}
							expandedAssignments={d.expandedAssignments}
							searchTerm={d.searchTerm}
							filterSection={d.filterSection}
							openMoreMenu={d.openMoreMenu}
							onToggleAssignment={d.toggleAssignment}
							onToggleMoreMenu={(id) =>
								d.setOpenMoreMenu(d.openMoreMenu === id ? null : id)
							}
							onAddProblem={d.handleAddProblem}
							onEdit={d.handleEdit}
							onToggleActive={d.handleToggleActive}
							onDelete={d.handleDelete}
							onRemoveProblem={d.handleRemoveProblem}
						/>
					</S.ListViewWrapper>
				)}
			</S.Container>

			<AssignmentAddModal
				isOpen={d.showAddModal}
				formData={d.formData}
				sections={d.sectionsForModal}
				onClose={d.handleCloseAddModal}
				onSubmit={d.handleSubmitAdd}
				onInputChange={d.handleInputChange}
			/>

			<AssignmentEditModal
				isOpen={d.showEditModal}
				formData={d.formData}
				selectedAssignment={d.selectedAssignment}
				sections={d.sectionsForModal}
				onClose={d.handleCloseEditModal}
				onSubmit={d.handleSubmitEdit}
				onInputChange={d.handleInputChange}
			/>

			<ProblemSelectModal
				isOpen={d.showProblemModal}
				selectedAssignment={d.selectedAssignment}
				filteredProblems={d.filteredProblems}
				selectedProblemIds={d.selectedProblemIds}
				problemSearchTerm={d.problemSearchTerm}
				onClose={d.closeProblemModals}
				onProblemToggle={d.handleProblemToggle}
				onSelectAll={d.handleSelectAllProblems}
				onSearchChange={d.setProblemSearchTerm}
				onSelectProblems={d.handleSelectProblem}
				onCopyProblem={() => {
					d.setShowProblemModal(false);
					d.setShowCopyProblemModal(true);
					d.setSelectedSectionForProblem("");
					d.handleSectionChangeForProblem("");
					d.setCopyProblemSearchTerm("");
					d.setProblemViewMode("list");
				}}
				onCreateNew={d.handleCreateNewProblem}
				onProblemDetail={d.openProblemDetail}
			/>

			<ProblemCreateModal
				isOpen={d.showCreateProblemModal}
				formData={d.problemFormData}
				onClose={d.closeProblemModals}
				onSubmit={d.handleCreateProblemSubmit}
				onInputChange={d.handleProblemInputChange}
			/>

			<StandaloneProblemCreateModal
				isOpen={d.showStandaloneProblemModal}
				formData={d.problemFormData}
				onClose={d.closeStandaloneProblemModal}
				onSubmit={d.handleStandaloneProblemSubmit}
				onInputChange={d.handleProblemInputChange}
			/>

			<BulkProblemCreateModal
				isOpen={d.showBulkProblemModal}
				bulkProblemData={d.bulkProblemData}
				onClose={d.closeBulkProblemModal}
				onSubmit={d.handleBulkProblemSubmit}
				onInputChange={d.handleBulkProblemInputChange}
				onFileChange={d.handleBulkProblemFileChange}
				onAddRow={d.addProblemRow}
				onRemoveRow={d.removeProblemRow}
			/>

			{d.selectedProblemDetail &&
				createPortal(
					<ProblemDetailPanel
						detail={d.selectedProblemDetail}
						onClose={() => d.setSelectedProblemDetail(null)}
					/>,
					document.body,
				)}

			{d.showCopyProblemModal &&
				createPortal(
					<CopyProblemModal
						isOpen={d.showCopyProblemModal}
						selectedAssignmentTitle={d.selectedAssignment?.title}
						sections={d.sectionsForModal}
						selectedSectionForProblem={d.selectedSectionForProblem}
						onSelectedSectionChange={(sid) => {
							d.setSelectedSectionForProblem(sid);
							d.setSelectedProblemIds([]);
							d.setCopyProblemSearchTerm("");
							if (sid) d.handleSectionChangeForProblem(sid);
							else {
								d.setAssignmentsForProblem([]);
								d.setExpandedAssignmentsForProblem({});
								d.setAssignmentProblems({});
							}
						}}
						assignmentsForProblem={d.assignmentsForProblem}
						assignmentProblems={d.assignmentProblems}
						expandedAssignmentsForProblem={
							d.expandedAssignmentsForProblem
						}
						loadingAssignmentsForProblem={
							d.loadingAssignmentsForProblem
						}
						copyProblemSearchTerm={d.copyProblemSearchTerm}
						onCopyProblemSearchTermChange={d.setCopyProblemSearchTerm}
						problemViewMode={d.problemViewMode}
						onProblemViewModeChange={d.setProblemViewMode}
						selectedProblemIds={d.selectedProblemIds}
						onProblemToggle={d.handleProblemToggle}
						onProblemToggleForAdd={d.handleProblemToggleForAdd}
						onSelectAllProblemsForAssignment={
							d.handleSelectAllProblemsForAssignment
						}
						toggleAssignmentForProblem={d.toggleAssignmentForProblem}
						onClose={d.closeCopyModal}
						onBack={() => {
							d.setShowCopyProblemModal(false);
							d.setShowProblemModal(true);
						}}
						onSelectProblems={(ids) => {
							d.handleSelectProblem(ids);
							d.closeCopyModal();
						}}
						onSelectAllInList={d.setSelectedProblemIds}
						onOpenProblemDetail={(detail) =>
							d.setSelectedProblemDetail(detail)
						}
					/>,
					document.body,
				)}

			<ProblemListModal
				isOpen={d.showProblemListModal}
				selectedAssignment={d.selectedAssignmentForProblemList}
				submissionStats={d.submissionStats}
				searchTerm={d.problemListSearchTerm}
				onEditProblemNavigate={
					d.sectionId && d.selectedAssignmentForProblemList
						? (problemId) =>
								d.navigate(`/tutor/problems/${problemId}/edit`, {
									state: {
										fromAssignmentProblemList: true,
										sectionId: d.sectionId,
										assignmentId: d.selectedAssignmentForProblemList?.id,
									},
								})
						: undefined
				}
				onClose={d.closeProblemListModal}
				onAddProblem={d.handleAddProblem}
				onRemoveProblem={d.handleRemoveProblem}
				onProblemDetail={d.openProblemDetail}
				onProblemViewDetail={d.openProblemDetail}
				onSearchChange={d.setProblemListSearchTerm}
				onProblemUpdated={() => {
					d.refetchAssignments();
					d.refetchSubmissionStats();
				}}
			/>

			<ProblemDetailModal
				isOpen={d.showProblemDetailModal}
				problemDetail={d.selectedProblemForDetail}
				onClose={d.closeProblemDetailModal}
			/>
		</TutorLayout>
	);
};

export default AssignmentManagement;
