import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import * as S from "../../../TutorPage/Dashboard/styles";
import type { SuperAdminCourseManagementHookReturn } from "../hooks/useSuperAdminCourseManagement";

export default function SuperAdminCourseManagementView(
	d: SuperAdminCourseManagementHookReturn,
) {
	if (d.loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="강좌 목록을 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.Title>분반/과제 관리</S.Title>
				</S.Header>

				<S.CoursesGrid>
					{d.sections.map((section) => (
						<S.CourseCard key={section.sectionId}>
							<S.CourseTitle>
								{section.courseTitle} - {section.sectionNumber}분반
							</S.CourseTitle>
							<S.SectionsList>
								{section.semester && (
									<S.SectionItem>
										<span>학기</span>
										<span>
											{section.year}-{section.semester}
										</span>
									</S.SectionItem>
								)}
								{section.instructorName && (
									<S.SectionItem>
										<span>담당 강사</span>
										<span>{section.instructorName}</span>
									</S.SectionItem>
								)}
								<S.SectionItem>
									<span>학생 수</span>
									<span>{section.studentCount || 0}명</span>
								</S.SectionItem>
								<S.SectionItem>
									<span>과제 수</span>
									<span>{section.assignmentCount || 0}개</span>
								</S.SectionItem>
							</S.SectionsList>
							<button
								type="button"
								onClick={() => d.toggleSectionDetail(section.sectionId)}
								style={{
									marginTop: "0.75rem",
									padding: "0.5rem 0.75rem",
									borderRadius: "8px",
									border: "1px solid #d1d5db",
									background: "white",
									cursor: "pointer",
								}}
							>
								{d.expandedSectionId === section.sectionId
									? "상세 닫기"
									: "학생/과제 보기"}
							</button>

							{d.expandedSectionId === section.sectionId && (
								<div
									style={{
										marginTop: "1rem",
										maxHeight: "320px",
										overflowY: "auto",
										paddingRight: "0.25rem",
									}}
								>
									<h4 style={{ marginBottom: "0.5rem" }}>학생 목록</h4>
									<ul style={{ margin: 0, paddingLeft: "1rem" }}>
										{(d.studentsBySection[section.sectionId] || []).map(
											(student) => (
												<li key={student.userId}>
													{student.name} ({student.email})
												</li>
											),
										)}
									</ul>

									<h4 style={{ margin: "1rem 0 0.5rem" }}>
										과제/문제 목록
									</h4>
									<ul style={{ margin: 0, paddingLeft: "1rem" }}>
										{(d.assignmentsBySection[section.sectionId] || []).map(
											(assignment) => (
												<li key={assignment.id}>
													<button
														type="button"
														onClick={() =>
															d.loadAssignmentProblems(
																section.sectionId,
																assignment.id,
															)
														}
														style={{
															border: "none",
															background: "transparent",
															padding: 0,
															cursor: "pointer",
															textDecoration: "underline",
														}}
													>
														{assignment.title}
													</button>
													<ul style={{ marginTop: "0.4rem" }}>
														{(
															d.problemsByAssignment[
																`${section.sectionId}-${assignment.id}`
															] || []
														).map((problem) => (
															<li key={problem.id}>{problem.title}</li>
														))}
													</ul>
												</li>
											),
										)}
									</ul>
								</div>
							)}
						</S.CourseCard>
					))}
				</S.CoursesGrid>

				{d.sections.length === 0 && (
					<div
						style={{
							textAlign: "center",
							padding: "4rem",
							background: "white",
							borderRadius: "8px",
						}}
					>
						<p style={{ color: "#9ca3af" }}>등록된 분반이 없습니다.</p>
					</div>
				)}
			</S.Container>
		</>
	);
}
