import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import APIService from "../../../services/APIService";
import * as S from "../../TutorPage/ProblemManagement/styles";
import { type Assignment, Problem } from "./types";

const AssignmentDetailPage: React.FC = () => {
	const { sectionId, assignmentId } = useParams<{
		sectionId: string;
		assignmentId: string;
	}>();
	const navigate = useNavigate();
	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAssignmentDetail = async () => {
			try {
				setLoading(true);
				const response = await APIService.getAssignmentInfoBySection(
					sectionId!,
					assignmentId!,
				);
				setAssignment(response?.data || response);
			} catch (error) {
				console.error("과제 상세 조회 실패:", error);
			} finally {
				setLoading(false);
			}
		};

		if (sectionId && assignmentId) {
			fetchAssignmentDetail();
		}
	}, [sectionId, assignmentId]);

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleString("ko-KR");
	};

	if (loading) {
		return (
			<MainLayout>
				<LoadingSpinner message="과제 정보를 불러오는 중..." />
			</MainLayout>
		);
	}

	if (!assignment) {
		return (
			<MainLayout>
				<S.Container>
					<S.Title>과제를 찾을 수 없습니다</S.Title>
				</S.Container>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<S.Container>
				<S.Header>
					<div>
						<S.Title>{assignment.title}</S.Title>
						{assignment.description && (
							<p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
								{assignment.description}
							</p>
						)}
						<p
							style={{
								color: "#9ca3af",
								fontSize: "0.85rem",
								marginTop: "0.5rem",
							}}
						>
							마감일: {formatDate(assignment.deadline)}
						</p>
					</div>
				</S.Header>

				<div style={{ marginTop: "2rem" }}>
					<h3
						style={{
							fontSize: "1.25rem",
							fontWeight: 700,
							marginBottom: "1rem",
						}}
					>
						문제 목록
					</h3>

					<S.Table>
						<thead>
							<tr>
								<S.Th>#</S.Th>
								<S.Th>제목</S.Th>
								<S.Th>난이도</S.Th>
								<S.Th>상태</S.Th>
								<S.Th></S.Th>
							</tr>
						</thead>
						<tbody>
							{assignment.problems?.map((problem, index) => (
								<tr key={problem.id}>
									<S.Td>{index + 1}</S.Td>
									<S.Td>{problem.title}</S.Td>
									<S.Td>
										<S.Badge
											style={{ background: "#f3f4f6", color: "#6b7280" }}
										>
											{problem.difficulty || "-"}
										</S.Badge>
									</S.Td>
									<S.Td>
										<S.Badge
											style={{
												background: problem.isSolved ? "#d1fae5" : "#fee2e2",
												color: problem.isSolved ? "#059669" : "#dc2626",
											}}
										>
											{problem.isSolved ? "완료" : "미완료"}
										</S.Badge>
									</S.Td>
									<S.Td>
										<S.ActionButton
											onClick={() =>
												navigate(
													`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problem.id}`,
												)
											}
										>
											문제 풀기
										</S.ActionButton>
									</S.Td>
								</tr>
							))}
						</tbody>
					</S.Table>

					{(!assignment.problems || assignment.problems.length === 0) && (
						<div
							style={{
								textAlign: "center",
								padding: "3rem",
								background: "white",
								borderRadius: "8px",
							}}
						>
							<p style={{ color: "#9ca3af" }}>등록된 문제가 없습니다.</p>
						</div>
					)}
				</div>
			</S.Container>
		</MainLayout>
	);
};

export default AssignmentDetailPage;
