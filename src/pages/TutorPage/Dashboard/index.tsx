import type { FC } from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import LoadingSpinner from "../../../components/UI/LoadingSpinner";
import { useDashboard } from "./hooks/useDashboard";
import * as S from "./styles";
import DashboardHeader from "./components/DashboardHeader";
import DashboardFilters from "./components/DashboardFilters";
import SectionGrid from "./components/SectionGrid";
import CreateSectionModal from "./components/CreateSectionModal";
import CopySectionModal from "./components/CopySectionModal";
import ViewNoticeModal from "./components/ViewNoticeModal";

const CourseManagement: FC = () => {
	const dashboard = useDashboard();
	const {
		loading,
		showCreateModal,
		setShowCreateModal,
		showCopyModal,
		setShowCopyModal,
		isCopyingSection,
		copyStep,
		setCopyStep,
		editingNoticeId,
		setEditingNoticeId,
		editingAssignmentId,
		setEditingAssignmentId,
		editingProblemId,
		setEditingProblemId,
		viewingNoticeId,
		setViewingNoticeId,
		filteredSections,
		sections,
		hasActiveFilters,
		searchTerm,
		setSearchTerm,
		filterYear,
		setFilterYear,
		filterSemester,
		setFilterSemester,
		filterStatus,
		setFilterStatus,
		availableYears,
		formData,
		setFormData,
		availableCourses,
		copyFormData,
		setCopyFormData,
		sourceNotices,
		sourceAssignments,
		loadingNotices,
		loadingAssignments,
		expandedAssignments,
		openDropdownId,
		setOpenDropdownId,
		handleCreateSection,
		handleToggleActive,
		handleDeleteSection,
		handleSourceSectionChange,
		handleNoticeToggle,
		handleSelectAllNotices,
		handleNoticeEdit,
		handleAssignmentToggle,
		handleSelectAllAssignments,
		handleAssignmentEdit,
		toggleAssignmentExpand,
		handleProblemToggle,
		handleSelectAllProblems,
		handleProblemEdit,
		handleCopySection,
	} = dashboard;

	const closeCopyModal = () => {
		setShowCopyModal(false);
		setCopyStep(1);
		setEditingNoticeId(null);
		setEditingAssignmentId(null);
		setEditingProblemId(null);
	};

	const viewedNotice =
		viewingNoticeId != null
			? sourceNotices.find((n) => n.id === viewingNoticeId)
			: null;
	const noticeEditData = viewedNotice
		? copyFormData.noticeEdits[viewedNotice.id] || {}
		: {};

	return (
		<TutorLayout>
			{isCopyingSection &&
				createPortal(
					<div
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "rgba(0,0,0,0.35)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 10000,
						}}
					>
						<div
							style={{
								background: "white",
								padding: "1.5rem 2rem",
								borderRadius: "12px",
								boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
							}}
						>
							<LoadingSpinner message="수업 복사 중..." />
						</div>
					</div>,
					document.body,
				)}
			{loading ? (
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>수업 목록을 불러오는 중...</p>
				</S.LoadingContainer>
			) : (
				<S.Container>
					<DashboardHeader
						totalCount={sections.length}
						displayCount={filteredSections.length}
						canCopySection={sections.some(
							(s) =>
								s.roleInSection === "ADMIN" || s.roleInSection === "INSTRUCTOR",
						)}
						onCopy={() => setShowCopyModal(true)}
						onCreate={() => setShowCreateModal(true)}
					/>
					<DashboardFilters
						searchTerm={searchTerm}
						onSearchChange={setSearchTerm}
						filterYear={filterYear}
						onFilterYearChange={setFilterYear}
						filterSemester={filterSemester}
						onFilterSemesterChange={setFilterSemester}
						filterStatus={filterStatus}
						onFilterStatusChange={setFilterStatus}
						availableYears={availableYears}
					/>
					<SectionGrid
						sections={filteredSections}
						hasActiveFilters={hasActiveFilters}
						onToggleActive={handleToggleActive}
						onDelete={handleDeleteSection}
						openDropdownId={openDropdownId}
						setOpenDropdownId={setOpenDropdownId}
					/>
					<CreateSectionModal
						isOpen={showCreateModal}
						onClose={() => setShowCreateModal(false)}
						formData={formData}
						setFormData={setFormData}
						availableCourses={availableCourses}
						onSubmit={handleCreateSection}
					/>
					<CopySectionModal
						isOpen={showCopyModal}
						onClose={closeCopyModal}
						loading={isCopyingSection}
						copyStep={copyStep}
						setCopyStep={setCopyStep}
						copyFormData={copyFormData}
						setCopyFormData={setCopyFormData}
						sections={sections}
						sourceNotices={sourceNotices}
						sourceAssignments={sourceAssignments}
						loadingNotices={loadingNotices}
						loadingAssignments={loadingAssignments}
						editingNoticeId={editingNoticeId}
						setEditingNoticeId={setEditingNoticeId}
						editingAssignmentId={editingAssignmentId}
						setEditingAssignmentId={setEditingAssignmentId}
						editingProblemId={editingProblemId}
						setEditingProblemId={setEditingProblemId}
						expandedAssignments={expandedAssignments}
						toggleAssignmentExpand={toggleAssignmentExpand}
						handleSourceSectionChange={handleSourceSectionChange}
						handleNoticeToggle={handleNoticeToggle}
						handleSelectAllNotices={handleSelectAllNotices}
						handleNoticeEdit={handleNoticeEdit}
						handleAssignmentToggle={handleAssignmentToggle}
						handleSelectAllAssignments={handleSelectAllAssignments}
						handleAssignmentEdit={handleAssignmentEdit}
						handleProblemToggle={handleProblemToggle}
						handleSelectAllProblems={handleSelectAllProblems}
						handleProblemEdit={handleProblemEdit}
						handleCopySection={handleCopySection}
						onViewNotice={(id) => setViewingNoticeId(id)}
					/>
					<ViewNoticeModal
						isOpen={viewingNoticeId != null}
						onClose={() => setViewingNoticeId(null)}
						title={
							viewedNotice ? (noticeEditData.title ?? viewedNotice.title) : ""
						}
						content={
							viewedNotice
								? (noticeEditData.content ?? viewedNotice.content)
								: ""
						}
						createdAt={
							viewedNotice
								? new Date(viewedNotice.createdAt).toLocaleDateString("ko-KR")
								: ""
						}
						onEdit={() => {
							if (viewedNotice) {
								setViewingNoticeId(null);
								setEditingNoticeId(viewedNotice.id);
							}
						}}
					/>
				</S.Container>
			)}
		</TutorLayout>
	);
};

export default CourseManagement;
