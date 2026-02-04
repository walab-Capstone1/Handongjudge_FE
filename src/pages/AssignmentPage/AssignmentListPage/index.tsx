import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import APIService from "../../../services/APIService";
import * as S from "../../TutorPage/CourseManagement/styles";
import type { Assignment } from "./types";

const AssignmentListPage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAssignments = async () => {
			try {
				setLoading(true);
				const response = await APIService.getAssignmentsBySection(
					Number.parseInt(sectionId!),
				);
				setAssignments(response?.data || response || []);
			} catch (error) {
				console.error("과제 목록 조회 실패:", error);
			} finally {
				setLoading(false);
			}
		};

		if (sectionId) {
			fetchAssignments();
		}
	}, [sectionId]);

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString("ko-KR");
	};

	if (loading) {
		return (
			<MainLayout>
				<LoadingSpinner message="과제 목록을 불러오는 중..." />
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<S.Container>
				<S.Header>
					<S.Title>과제 목록</S.Title>
				</S.Header>

				<S.CoursesGrid>
					{assignments.map((assignment) => (
						<S.CourseCard
							key={assignment.id}
							onClick={() =>
								navigate(
									`/sections/${sectionId}/assignments/${assignment.id}/detail`,
								)
							}
						>
							<S.CourseTitle>{assignment.title}</S.CourseTitle>
							{assignment.description && (
								<S.CourseInfo>{assignment.description}</S.CourseInfo>
							)}
							<S.SectionsList>
								<S.SectionItem>
									<span>마감일</span>
									<span>{formatDate(assignment.deadline)}</span>
								</S.SectionItem>
								{assignment.problemCount && (
									<S.SectionItem>
										<span>문제 수</span>
										<span>{assignment.problemCount}개</span>
									</S.SectionItem>
								)}
								{assignment.completionRate !== undefined && (
									<S.SectionItem>
										<span>완료율</span>
										<span>{assignment.completionRate}%</span>
									</S.SectionItem>
								)}
							</S.SectionsList>
						</S.CourseCard>
					))}
				</S.CoursesGrid>

				{assignments.length === 0 && (
					<div
						style={{
							textAlign: "center",
							padding: "4rem",
							background: "white",
							borderRadius: "8px",
						}}
					>
						<p style={{ color: "#9ca3af" }}>등록된 과제가 없습니다.</p>
					</div>
				)}
			</S.Container>
		</MainLayout>
	);
};

export default AssignmentListPage;
