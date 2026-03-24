import type React from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../../components/Navigation/SectionNavigation";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "../styles";
import type { CodingTestManagementHookReturn } from "../hooks/useCodingTestManagement";
import AddProblemsToQuizModal from "./AddProblemsToQuizModal";
import CreateQuizModal from "./CreateQuizModal";
import EditQuizModal from "./EditQuizModal";
import ProblemSelectModal from "./ProblemSelectModal";
import SubmissionCodeModal from "./SubmissionCodeModal";
import MainTabView from "./tabs/MainTabView";
import ProblemsTabView from "./tabs/ProblemsTabView";
import StudentProgressTabView from "./tabs/StudentProgressTabView";
import SubmissionsTabView from "./tabs/SubmissionsTabView";

function getStatusBadge(status: string) {
	switch (status) {
		case "ACTIVE":
			return <S.StatusBadge $status="active">진행중</S.StatusBadge>;
		case "WAITING":
			return <S.StatusBadge $status="waiting">대기중</S.StatusBadge>;
		case "PAUSED":
			return <S.StatusBadge $status="paused">일시정지</S.StatusBadge>;
		case "ENDED":
			return <S.StatusBadge $status="ended">종료</S.StatusBadge>;
		default:
			return <S.StatusBadge $status={undefined}>{status ?? "-"}</S.StatusBadge>;
	}
}

const TABS = [
	{ id: "main", label: "메인" },
	{ id: "problems", label: "대회 문제" },
	{ id: "submissions", label: "제출 상세정보" },
	{ id: "student-progress", label: "학생 진행 현황" },
];

export default function CodingTestManagementView(
	d: CodingTestManagementHookReturn,
) {
	if (!d.sectionId) {
		return (
			<TutorLayout>
				<S.Container>
					<S.PageHeader>
						<S.PageTitle>코딩 테스트 관리</S.PageTitle>
					</S.PageHeader>
					<S.NoData>
						<p>수업을 선택해주세요.</p>
					</S.NoData>
				</S.Container>
			</TutorLayout>
		);
	}

	// Detail view (d.quizId present)
	if (d.quizId && d.selectedQuizDetail) {
		const tabs = TABS;

		return (
			<TutorLayout selectedSection={d.currentSection}>
				<S.Container>
					{d.currentSection && d.sectionId && (
						<SectionNavigation
							title="코딩 테스트 관리"
							sectionId={d.sectionId}
							sectionName={`${d.currentSection.courseTitle ?? ""}${d.currentSection.sectionNumber ? ` - ${d.currentSection.sectionNumber}분반` : ""}`}
							enrollmentCode={d.currentSection.enrollmentCode ?? null}
							showSearch={false}
						/>
					)}
					<S.DetailWrapper>
						<S.DetailHeader>
							<S.BackButton
								type="button"
								onClick={() =>
									d.navigate(`/tutor/coding-tests/section/${d.sectionId}`)
								}
							>
								← 목록으로
							</S.BackButton>
							<S.DetailTitle>{d.selectedQuizDetail.title}</S.DetailTitle>
						</S.DetailHeader>

						<S.DetailContent>
							<S.Sidebar>
								<S.TabList>
									{tabs.map((tab) => (
										<S.Tab
											key={tab.id}
											type="button"
											$active={d.activeTab === tab.id}
											onClick={() => d.setActiveTab(tab.id)}
										>
											{tab.label}
										</S.Tab>
									))}
								</S.TabList>
							</S.Sidebar>

							<S.MainContent>
								{d.activeTab === "main" && <MainTabView d={d} />}
								{d.activeTab === "problems" && <ProblemsTabView d={d} />}
								{d.activeTab === "submissions" && <SubmissionsTabView d={d} />}
								{d.activeTab === "student-progress" && (
									<StudentProgressTabView d={d} />
								)}
							</S.MainContent>
						</S.DetailContent>
					</S.DetailWrapper>
					<AddProblemsToQuizModal d={d} />
					<SubmissionCodeModal d={d} />
				</S.Container>
			</TutorLayout>
		);
	}

	// List view
	if (d.loading) {
		return (
			<TutorLayout selectedSection={d.currentSection}>
				<LoadingSpinner message="코딩 테스트 목록을 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={d.currentSection}>
			{(d.isSubmittingCreate || d.isSubmittingEdit) &&
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
							<LoadingSpinner
								message={
									d.isSubmittingCreate
										? "코딩 테스트 생성 중..."
										: "코딩 테스트 수정 중..."
								}
							/>
						</div>
					</div>,
					document.body,
				)}
			<S.Container>
				{d.currentSection && d.sectionId && (
					<SectionNavigation
						title="코딩 테스트 관리"
						sectionId={d.sectionId}
						sectionName={`${d.currentSection.courseTitle ?? ""}${d.currentSection.sectionNumber ? ` - ${d.currentSection.sectionNumber}분반` : ""}`}
						enrollmentCode={d.currentSection.enrollmentCode ?? null}
						showSearch={true}
						searchTerm={d.searchTerm}
						onSearchChange={d.setSearchTerm}
						searchPlaceholder="과제명으로 검색..."
					/>
				)}
				<S.Content>
					<S.PageHeader>
						<S.HeaderLeft>
							<S.PageTitle>코딩 테스트 목록</S.PageTitle>
							<S.QuizCount>
								전체 {d.quizzes.length}개 / 표시 {d.filteredQuizzes.length}개
							</S.QuizCount>
						</S.HeaderLeft>
						<S.HeaderRight>
							<S.StatusFilter
								value={d.filterStatus}
								onChange={(e) => d.setFilterStatus(e.target.value)}
							>
								<option value="ALL">전체</option>
								<option value="WAITING">대기중</option>
								<option value="ACTIVE">진행중</option>
								<option value="PAUSED">일시정지</option>
								<option value="ENDED">종료</option>
							</S.StatusFilter>
							<S.CreateButton type="button" onClick={d.handleCreateQuiz}>
								+ 새 코딩 테스트 만들기
							</S.CreateButton>
						</S.HeaderRight>
					</S.PageHeader>

					{d.filteredQuizzes.length === 0 ? (
						<S.EmptyState>
							<p>등록된 코딩 테스트가 없습니다.</p>
						</S.EmptyState>
					) : (
						<S.TableContainer>
							<S.Table>
								<thead>
									<tr>
										<th>제목</th>
										<th>설명</th>
										<th>시작 시간</th>
										<th>종료 시간</th>
										<th>문제 수</th>
										<th>상태</th>
										<th>작업</th>
									</tr>
								</thead>
								<tbody>
									{d.filteredQuizzes.map((quiz) => (
										<S.ClickableRow
											key={quiz.id}
											onClick={() =>
												d.navigate(
													`/tutor/coding-tests/section/${d.sectionId}/${quiz.id}`,
												)
											}
											onKeyDown={(e: React.KeyboardEvent) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													d.navigate(
														`/tutor/coding-tests/section/${d.sectionId}/${quiz.id}`,
													);
												}
											}}
											tabIndex={0}
										>
											<td>
												<S.QuizTitle>{quiz.title}</S.QuizTitle>
											</td>
											<td>
												<S.QuizDescription>
													{quiz.description ?? "-"}
												</S.QuizDescription>
											</td>
											<td>{d.formatDateTime(quiz.startTime)}</td>
											<td>{d.formatDateTime(quiz.endTime)}</td>
											<td>{quiz.problemCount ?? 0}개</td>
											<td>{getStatusBadge(quiz.status ?? "")}</td>
											<td
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<S.QuizActions>
													<S.EditButton
														type="button"
														onClick={() => d.handleEditQuiz(quiz)}
													>
														수정
													</S.EditButton>
													<S.DeleteButton
														type="button"
														onClick={() => d.handleDeleteQuiz(quiz.id)}
													>
														삭제
													</S.DeleteButton>
												</S.QuizActions>
											</td>
										</S.ClickableRow>
									))}
								</tbody>
							</S.Table>
						</S.TableContainer>
					)}
				</S.Content>

				<CreateQuizModal d={d} />
				<EditQuizModal d={d} />
				<ProblemSelectModal d={d} />
			</S.Container>
		</TutorLayout>
	);
}
