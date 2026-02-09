import type { FC } from "react";
import TutorLayout from "../../../../layouts/TutorLayout";
import { useNoticeManagement } from "./hooks/useNoticeManagement";
import * as S from "./styles";
import NoticeHeader from "./components/NoticeHeader";
import NoticeTable from "./components/NoticeTable";

const NoticeManagementPage: FC = () => {
	const {
		sectionId,
		currentSection,
		loading,
		notices,
		searchTerm,
		setSearchTerm,
		filterSection,
		setFilterSection,
		filteredNotices,
		uniqueSections,
		openMoreMenu,
		setOpenMoreMenu,
		handleCreateNotice,
		handleEditNotice,
		handleDeleteNotice,
		handleToggleActive,
		handleCopyEnrollmentLink,
	} = useNoticeManagement();

	if (loading) {
		return (
			<TutorLayout>
				<S.Container>
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<p>공지사항을 불러오는 중...</p>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Container>
				<NoticeHeader
					isSectionPage={!!sectionId}
					currentSection={currentSection}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterSection={filterSection}
					onFilterSectionChange={setFilterSection}
					uniqueSections={uniqueSections}
					onCreateNotice={handleCreateNotice}
					onCopyEnrollmentLink={handleCopyEnrollmentLink}
				/>
				<NoticeTable
					notices={filteredNotices}
					totalCount={notices.length}
					openMoreMenu={openMoreMenu}
					onMoreMenuToggle={setOpenMoreMenu}
					onEdit={handleEditNotice}
					onToggleActive={handleToggleActive}
					onDelete={handleDeleteNotice}
				/>
			</S.Container>
		</TutorLayout>
	);
};

export default NoticeManagementPage;
