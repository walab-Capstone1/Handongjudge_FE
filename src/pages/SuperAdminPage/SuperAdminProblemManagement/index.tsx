import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "../../TutorPage/ProblemManagement/styles";
import type { Problem } from "./types";

const SuperAdminProblemManagement: React.FC = () => {
	const { user } = useAuth();
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchProblems();
	}, []);

	const fetchProblems = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllProblems();
			setProblems(response?.data || response || []);
		} catch (error) {
			console.error("문제 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredProblems = problems.filter(
		(p) =>
			p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			p.id.toString().includes(searchTerm),
	);

	if (loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="문제 목록을 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.Title>문제 관리</S.Title>
				</S.Header>

				<S.Filters>
					<S.SearchInput
						type="text"
						placeholder="문제 제목 또는 ID로 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</S.Filters>

				<S.Table>
					<thead>
						<tr>
							<S.Th>ID</S.Th>
							<S.Th>제목</S.Th>
							<S.Th>난이도</S.Th>
							<S.Th>시간 제한</S.Th>
							<S.Th>메모리 제한</S.Th>
						</tr>
					</thead>
					<tbody>
						{filteredProblems.map((problem) => (
							<tr key={problem.id}>
								<S.Td>#{problem.id}</S.Td>
								<S.Td>{problem.title}</S.Td>
								<S.Td>{problem.difficulty || "-"}</S.Td>
								<S.Td>{problem.timeLimit}초</S.Td>
								<S.Td>{problem.memoryLimit}MB</S.Td>
							</tr>
						))}
					</tbody>
				</S.Table>

				{filteredProblems.length === 0 && (
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
					>
						{searchTerm ? "검색 결과가 없습니다." : "문제가 없습니다."}
					</div>
				)}
			</S.Container>
		</>
	);
};

export default SuperAdminProblemManagement;
