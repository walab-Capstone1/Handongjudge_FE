import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import APIService from "../../../services/APIService";
import * as S from "./styles";
import type { Submission, EnrolledSection, TabType } from "./types";

const MyAssignmentsPage: React.FC = () => {
	const navigate = useNavigate();
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [enrolledSections, setEnrolledSections] = useState<EnrolledSection[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<TabType>("submissions");
	const [selectedSubmission, setSelectedSubmission] =
		useState<Submission | null>(null);
	const [showCodeModal, setShowCodeModal] = useState(false);

	useEffect(() => {
		fetchAssignmentData();
	}, []);

	const fetchAssignmentData = async () => {
		try {
			setLoading(true);
			setError(null);

			const [submissionsResponse, sectionsResponse] = await Promise.all([
				APIService.getRecentSubmissions(20),
				APIService.getEnrolledSections(),
			]);

			setSubmissions(submissionsResponse.data || submissionsResponse);
			setEnrolledSections(sectionsResponse.data || sectionsResponse);
		} catch (err: any) {
			console.error("과제 페이지 데이터 조회 실패:", err);
			setError(err.message || "데이터를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getResultBadge = (result: string) => {
		const colors: Record<string, { bg: string; color: string }> = {
			correct: { bg: "#d1fae5", color: "#059669" },
			"wrong-answer": { bg: "#fee2e2", color: "#dc2626" },
			incorrect: { bg: "#fee2e2", color: "#dc2626" },
			"compile-error": { bg: "#fef3c7", color: "#d97706" },
			"runtime-error": { bg: "#fecaca", color: "#dc2626" },
			"time-limit": { bg: "#e0e7ff", color: "#6366f1" },
		};

		const style = colors[result] || { bg: "#f3f4f6", color: "#6b7280" };

		return (
			<S.Badge style={{ background: style.bg, color: style.color }}>
				{result === "correct"
					? "정답"
					: result === "wrong-answer" || result === "incorrect"
						? "오답"
						: result === "compile-error"
							? "컴파일 에러"
							: result === "runtime-error"
								? "런타임 에러"
								: result === "time-limit"
									? "시간 초과"
									: result}
			</S.Badge>
		);
	};

	if (loading) {
		return (
			<MainLayout>
				<S.Container>
					<LoadingSpinner message="과제 정보를 불러오는 중..." />
				</S.Container>
			</MainLayout>
		);
	}

	if (error) {
		return (
			<MainLayout>
				<S.Container>
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#ef4444" }}
					>
						<p>{error}</p>
						<S.Button onClick={fetchAssignmentData}>다시 시도</S.Button>
					</div>
				</S.Container>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<S.Container>
				<S.Title>내 과제</S.Title>

				<S.Tabs>
					<S.Tab
						active={activeTab === "submissions"}
						onClick={() => setActiveTab("submissions")}
					>
						제출 기록 ({submissions.length})
					</S.Tab>
					<S.Tab
						active={activeTab === "sections"}
						onClick={() => setActiveTab("sections")}
					>
						수강 중인 강좌 ({enrolledSections.length})
					</S.Tab>
				</S.Tabs>

				{activeTab === "submissions" && (
					<S.Table>
						<thead>
							<tr>
								<S.Th>문제</S.Th>
								<S.Th>결과</S.Th>
								<S.Th>언어</S.Th>
								<S.Th>제출 시간</S.Th>
								<S.Th>액션</S.Th>
							</tr>
						</thead>
						<tbody>
							{submissions.map((submission) => (
								<tr key={submission.id}>
									<S.Td>{submission.problemTitle}</S.Td>
									<S.Td>{getResultBadge(submission.result)}</S.Td>
									<S.Td>{submission.language}</S.Td>
									<S.Td>{formatDate(submission.submittedAt)}</S.Td>
									<S.Td>
										<S.Button
											onClick={() => {
												setSelectedSubmission(submission);
												setShowCodeModal(true);
											}}
										>
											코드 보기
										</S.Button>
									</S.Td>
								</tr>
							))}
							{submissions.length === 0 && (
								<tr>
									<S.Td
										colSpan={5}
										style={{
											textAlign: "center",
											padding: "3rem",
											color: "#9ca3af",
										}}
									>
										제출한 과제가 없습니다.
									</S.Td>
								</tr>
							)}
						</tbody>
					</S.Table>
				)}

				{activeTab === "sections" && (
					<S.SectionsGrid>
						{enrolledSections.map((section) => (
							<S.SectionCard
								key={section.sectionId}
								onClick={() =>
									navigate(`/sections/${section.sectionId}/dashboard`)
								}
							>
								<h3
									style={{
										fontSize: "1.1rem",
										fontWeight: 600,
										margin: "0 0 0.5rem 0",
									}}
								>
									{section.courseTitle}
								</h3>
								<p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
									{section.sectionNumber}분반
								</p>
								<S.Badge
									style={{
										background: "#f3f4f6",
										color: "#6b7280",
										marginTop: "1rem",
									}}
								>
									{section.enrollmentCode}
								</S.Badge>
							</S.SectionCard>
						))}
						{enrolledSections.length === 0 && (
							<div
								style={{
									gridColumn: "1 / -1",
									textAlign: "center",
									padding: "3rem",
									color: "#9ca3af",
								}}
							>
								수강 중인 강좌가 없습니다.
							</div>
						)}
					</S.SectionsGrid>
				)}

				{showCodeModal && selectedSubmission && (
					<div
						style={{
							position: "fixed",
							inset: 0,
							background: "rgba(0,0,0,0.5)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 1000,
						}}
					>
						<div
							style={{
								background: "white",
								padding: "2rem",
								borderRadius: "8px",
								width: "90%",
								maxWidth: "800px",
								maxHeight: "80vh",
								overflow: "auto",
							}}
						>
							<h3 style={{ margin: "0 0 1rem 0" }}>제출 코드</h3>
							<pre
								style={{
									background: "#f9fafb",
									padding: "1rem",
									borderRadius: "6px",
									overflow: "auto",
								}}
							>
								{selectedSubmission.code || "코드를 불러올 수 없습니다."}
							</pre>
							<div style={{ textAlign: "right", marginTop: "1rem" }}>
								<S.Button onClick={() => setShowCodeModal(false)}>
									닫기
								</S.Button>
							</div>
						</div>
					</div>
				)}
			</S.Container>
		</MainLayout>
	);
};

export default MyAssignmentsPage;
