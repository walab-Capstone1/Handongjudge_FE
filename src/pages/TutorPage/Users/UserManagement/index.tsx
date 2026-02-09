import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../components/Navigation/SectionNavigation";
import { useUserManagement } from "./hooks/useUserManagement";
import UserManagementHeader from "./components/UserManagementHeader";
import UserManagementFilters from "./components/UserManagementFilters";
import UserManagementTable from "./components/UserManagementTable";
import * as S from "./styles";
import type { SortField } from "./types";

const UserManagement: FC = () => {
	const data = useUserManagement();
	const {
		sectionId,
		currentSection,
		loading,
		students,
		searchTerm,
		setSearchTerm,
		filterSection,
		setFilterSection,
		filterRole,
		setFilterRole,
		currentPage,
		setCurrentPage,
		itemsPerPage,
		setItemsPerPage,
		userRoles,
		currentUserRole,
		sortField,
		sortDirection,
		paginatedStudents,
		totalPages,
		uniqueSections,
		getSectionDisplayName,
		handleSort,
		handleAddTutor,
		handleRemoveTutor,
	} = data;
	const sortedStudents = data.sortedStudents;

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) {
			return <S.SortIcon>⇅</S.SortIcon>;
		}
		return sortDirection === "asc" ? (
			<S.SortIcon className="asc">↑</S.SortIcon>
		) : (
			<S.SortIcon className="desc">↓</S.SortIcon>
		);
	};

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<S.Container>
					<S.LoadingContainer>
						<S.Spinner />
						<p>학생 데이터를 불러오는 중...</p>
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
				/>
			)}
			{!sectionId && (
				<UserManagementHeader
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterSection={filterSection}
					onFilterSectionChange={setFilterSection}
					uniqueSections={uniqueSections}
				/>
			)}
			{sectionId && (
				<UserManagementFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterRole={filterRole}
					onFilterRoleChange={setFilterRole}
					currentUserRole={currentUserRole}
				/>
			)}
			<UserManagementTable
				sectionId={sectionId}
				paginatedStudents={paginatedStudents}
				studentsLength={students.length}
				userRoles={userRoles}
				currentUserRole={currentUserRole}
				sortField={sortField}
				sortDirection={sortDirection}
				currentPage={currentPage}
				itemsPerPage={itemsPerPage}
				totalItems={sortedStudents.length}
				totalPages={totalPages}
				onSort={handleSort}
				onPageChange={setCurrentPage}
				onItemsPerPageChange={setItemsPerPage}
				onAddTutor={handleAddTutor}
				onRemoveTutor={handleRemoveTutor}
				getSortIcon={getSortIcon}
			/>
		</TutorLayout>
	);
};

export default UserManagement;
