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
					<S.Title>강좌 관리</S.Title>
				</S.Header>

				<S.CoursesGrid>
					{d.courses.map((course) => (
						<S.CourseCard key={course.id}>
							<S.CourseTitle>{course.title}</S.CourseTitle>
							{course.description && (
								<S.CourseInfo>{course.description}</S.CourseInfo>
							)}
							<S.SectionsList>
								{course.semester && (
									<S.SectionItem>
										<span>학기</span>
										<span>
											{course.year}-{course.semester}
										</span>
									</S.SectionItem>
								)}
								{course.instructorName && (
									<S.SectionItem>
										<span>담당 강사</span>
										<span>{course.instructorName}</span>
									</S.SectionItem>
								)}
								<S.SectionItem>
									<span>분반 수</span>
									<span>{course.sectionCount || 0}개</span>
								</S.SectionItem>
							</S.SectionsList>
						</S.CourseCard>
					))}
				</S.CoursesGrid>

				{d.courses.length === 0 && (
					<div
						style={{
							textAlign: "center",
							padding: "4rem",
							background: "white",
							borderRadius: "8px",
						}}
					>
						<p style={{ color: "#9ca3af" }}>등록된 강좌가 없습니다.</p>
					</div>
				)}
			</S.Container>
		</>
	);
}
