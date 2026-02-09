import Header from "../../../../components/Layout/Header";
import Footer from "../../../../components/Layout/Footer";
import CourseCard from "../../../../components/Course/CourseCard";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import type { ClassPageHookReturn } from "../hooks/useClassPage";
import * as S from "../styles";
import type { SortType } from "../types";

export default function ClassPageView(d: ClassPageHookReturn) {
	if (d.loading) {
		return (
			<S.ClassPageContainer>
				<Header onUserNameClick={() => {}} />
				<S.LoadingContainer>
					<LoadingSpinner />
					<p>수강 중인 강의를 불러오는 중...</p>
				</S.LoadingContainer>
				<Footer />
			</S.ClassPageContainer>
		);
	}

	if (d.error) {
		return (
			<S.ClassPageContainer>
				<Header onUserNameClick={() => {}} />
				<S.ErrorContainer>
					<S.ErrorMessage>{d.error}</S.ErrorMessage>
					<S.RetryButton onClick={() => window.location.reload()}>
						다시 시도
					</S.RetryButton>
				</S.ErrorContainer>
				<Footer />
			</S.ClassPageContainer>
		);
	}

	return (
		<S.ClassPageContainer>
			<Header onUserNameClick={() => {}} />
			<S.ContentSection>
				<S.PageTitle>수강 중인 코스</S.PageTitle>
				<S.TabNavigation>
					<S.Tab active={d.activeTab === "all"} onClick={() => d.setActiveTab("all")}>
						전체 ({d.stats.all})
					</S.Tab>
					<S.Tab
						active={d.activeTab === "in-progress"}
						onClick={() => d.setActiveTab("in-progress")}
					>
						수강 중 ({d.stats.inProgress})
					</S.Tab>
					<S.Tab
						active={d.activeTab === "completed"}
						onClick={() => d.setActiveTab("completed")}
					>
						수강 종료 ({d.stats.completed})
					</S.Tab>
					<S.EnrollButton onClick={() => d.setShowEnrollModal(true)}>
						수업 참가
					</S.EnrollButton>
				</S.TabNavigation>
				<S.SearchAndSort>
					<S.SearchBar>
						<S.SearchInput
							type="text"
							placeholder="강의명 검색"
							value={d.searchTerm}
							onChange={(e) => d.setSearchTerm(e.target.value)}
						/>
						<S.SearchIcon>🔍</S.SearchIcon>
					</S.SearchBar>
					<S.SortSelect
						value={d.sortBy}
						onChange={(e) => d.setSortBy(e.target.value as SortType)}
					>
						<option value="recent">최근 개설일 순</option>
						<option value="name">강의명 순</option>
					</S.SortSelect>
				</S.SearchAndSort>
				{d.filteredSections.length === 0 ? (
					<S.EmptyState>
						<p>수강 중인 강의가 없습니다.</p>
					</S.EmptyState>
				) : (
					<S.CoursesGrid>
						{d.filteredSections.map((course) => (
							<CourseCard
								key={course.id}
								course={course}
								onStatusUpdate={d.handleStatusUpdate}
								onEnroll={() => {}}
							/>
						))}
					</S.CoursesGrid>
				)}
			</S.ContentSection>
			{d.showEnrollModal && (
				<S.ModalOverlay onClick={() => d.setShowEnrollModal(false)}>
					<S.ModalContent onClick={(e) => e.stopPropagation()}>
						<S.ModalHeader>
							<h2>수업 참가</h2>
							<S.CloseButton onClick={() => d.setShowEnrollModal(false)}>
								×
							</S.CloseButton>
						</S.ModalHeader>
						<S.ModalBody>
							<label>참가 코드 또는 링크</label>
							<input
								type="text"
								className="enroll-input"
								placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
								value={d.enrollmentCode}
								onChange={(e) => d.setEnrollmentCode(e.target.value)}
							/>
							<p className="enroll-help-text">
								참가 코드만 입력하거나 전체 링크를 붙여넣으세요.
							</p>
						</S.ModalBody>
						<S.ModalActions>
							<S.CancelButton onClick={() => d.setShowEnrollModal(false)}>
								취소
							</S.CancelButton>
							<S.EnrollSubmitButton
								onClick={async () => {
									await d.handleEnrollByCode();
									d.setShowEnrollModal(false);
								}}
								disabled={d.enrollLoading}
							>
								{d.enrollLoading ? "처리 중..." : "참가하기"}
							</S.EnrollSubmitButton>
						</S.ModalActions>
					</S.ModalContent>
				</S.ModalOverlay>
			)}
			<Footer />
		</S.ClassPageContainer>
	);
}
