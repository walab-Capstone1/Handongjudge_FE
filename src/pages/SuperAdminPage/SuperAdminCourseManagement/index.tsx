import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "../../TutorPage/CourseManagement/styles";
import type { Course } from "./types";

const SuperAdminCourseManagement: React.FC = () => {
	const { user } = useAuth();
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCourses();
	}, []);

	const fetchCourses = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllCourses();
			setCourses(response?.data || response || []);
		} catch (error) {
			console.error("강좌 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
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
					{courses.map((course) => (
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

				{courses.length === 0 && (
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
};

export default SuperAdminCourseManagement;
