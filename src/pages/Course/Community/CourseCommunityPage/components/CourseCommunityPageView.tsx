import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import CommunityHeader from "../CommunityHeader";
import CommunityStatsBar from "../CommunityStatsBar";
import CommunityFilterBar from "../CommunityFilterBar";
import CommunitySearchBar from "../CommunitySearchBar";
import QuestionList from "../QuestionList";
import CommunityPagination from "../CommunityPagination";
import type { CourseCommunityPageHookReturn } from "../hooks/useCourseCommunityPage";
import * as S from "../styles";

export default function CourseCommunityPageView(
	d: CourseCommunityPageHookReturn,
) {
	if (d.loading && d.questions.length === 0) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="커뮤니티"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={d.sectionInfo?.courseTitle ?? "로딩 중..."}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.CommunityBody>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.CommunityBody>
				</S.Content>
			</S.Container>
		);
	}

	if (d.error) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="커뮤니티"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={d.sectionInfo?.courseTitle ?? "오류"}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.CommunityBody>
						<S.ErrorMessage>오류: {d.error}</S.ErrorMessage>
					</S.CommunityBody>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu="커뮤니티"
				isCollapsed={d.isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={
						d.sectionInfo?.courseTitle ??
						d.sectionInfo?.courseName ??
						"커뮤니티"
					}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
				/>
				<S.CommunityBody>
					<CommunityHeader onCreateQuestion={d.handleCreateQuestion} />

					<CommunityStatsBar
						filter={d.filter}
						stats={d.stats}
						onFilterChange={d.handleFilterChange}
					/>

					<CommunityFilterBar
						assignmentFilter={d.assignmentFilter}
						problemFilter={d.problemFilter}
						assignments={d.assignments}
						problems={d.problems}
						onAssignmentChange={d.handleAssignmentFilterChange}
						onProblemChange={d.handleProblemFilterChange}
						onClearFilters={d.clearFilters}
					/>

					<CommunitySearchBar
						searchKeyword={d.searchKeyword}
						onKeywordChange={d.setSearchKeyword}
						onSearch={d.handleSearch}
					/>

					<QuestionList
						questions={d.questions}
						onQuestionClick={d.handleQuestionClick}
					/>

					{d.totalPages > 1 && (
						<CommunityPagination
							currentPage={d.currentPage}
							totalPages={d.totalPages}
							onPrev={() => d.setCurrentPage((prev) => Math.max(0, prev - 1))}
							onNext={() =>
								d.setCurrentPage((prev) => Math.min(d.totalPages - 1, prev + 1))
							}
						/>
					)}
				</S.CommunityBody>
			</S.Content>
		</S.Container>
	);
}
