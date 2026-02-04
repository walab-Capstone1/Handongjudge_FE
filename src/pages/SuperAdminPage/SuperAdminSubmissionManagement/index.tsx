import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "../../TutorPage/UserManagement/styles";
import type { Submission, ResultFilter } from "./types";

const SuperAdminSubmissionManagement: React.FC = () => {
	const { user } = useAuth();
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [resultFilter, setResultFilter] = useState<ResultFilter>("ALL");

	useEffect(() => {
		fetchSubmissions();
	}, []);

	const fetchSubmissions = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSubmissionsForSuperAdmin();
			setSubmissions(response?.data?.content || response || []);
		} catch (error) {
			console.error("제출 내역 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const getResultColor = (result: string): string => {
		const colors: Record<string, string> = {
			ACCEPTED: "#10b981",
			WRONG_ANSWER: "#ef4444",
			RUNTIME_ERROR: "#f59e0b",
			TIME_LIMIT: "#8b5cf6",
			COMPILE_ERROR: "#6b7280",
		};
		return colors[result] || "#6b7280";
	};

	const filteredSubmissions = submissions.filter(
		(s) => resultFilter === "ALL" || s.result === resultFilter,
	);

	if (loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="제출 내역을 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.HeaderLeft>
						<S.Title>제출 내역 관리</S.Title>
					</S.HeaderLeft>
				</S.Header>

				<div style={{ marginBottom: "1rem" }}>
					<select
						value={resultFilter}
						onChange={(e) => setResultFilter(e.target.value as ResultFilter)}
						style={{
							padding: "0.75rem",
							border: "1px solid #e5e7eb",
							borderRadius: "6px",
						}}
					>
						<option value="ALL">전체 결과</option>
						<option value="ACCEPTED">정답</option>
						<option value="WRONG_ANSWER">오답</option>
						<option value="RUNTIME_ERROR">런타임 에러</option>
						<option value="TIME_LIMIT">시간 초과</option>
						<option value="COMPILE_ERROR">컴파일 에러</option>
					</select>
				</div>

				<S.TableContainer>
					<S.Table>
						<thead>
							<tr>
								<S.Th>제출 ID</S.Th>
								<S.Th>사용자</S.Th>
								<S.Th>문제</S.Th>
								<S.Th>언어</S.Th>
								<S.Th>결과</S.Th>
								<S.Th>제출 시간</S.Th>
							</tr>
						</thead>
						<tbody>
							{filteredSubmissions.map((submission) => (
								<tr key={submission.id}>
									<S.Td>#{submission.id}</S.Td>
									<S.Td>{submission.userName}</S.Td>
									<S.Td>{submission.problemTitle}</S.Td>
									<S.Td>{submission.language}</S.Td>
									<S.Td>
										<span
											style={{
												padding: "0.25rem 0.6rem",
												borderRadius: "12px",
												fontSize: "0.75rem",
												fontWeight: 600,
												backgroundColor:
													getResultColor(submission.result) + "20",
												color: getResultColor(submission.result),
											}}
										>
											{submission.result}
										</span>
									</S.Td>
									<S.Td>
										{new Date(submission.submittedAt).toLocaleString("ko-KR")}
									</S.Td>
								</tr>
							))}
						</tbody>
					</S.Table>
				</S.TableContainer>

				{filteredSubmissions.length === 0 && (
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
					>
						{resultFilter !== "ALL"
							? "검색 결과가 없습니다."
							: "제출 내역이 없습니다."}
					</div>
				)}
			</S.Container>
		</>
	);
};

export default SuperAdminSubmissionManagement;
