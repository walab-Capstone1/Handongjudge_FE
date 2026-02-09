import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import * as S from "../../../TutorPage/Problems/ProblemManagement/styles";
import type { SuperAdminProblemManagementHookReturn } from "../hooks/useSuperAdminProblemManagement";

export default function SuperAdminProblemManagementView(
	d: SuperAdminProblemManagementHookReturn,
) {
	if (d.loading) {
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
						value={d.searchTerm}
						onChange={(e) => d.setSearchTerm(e.target.value)}
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
						{d.filteredProblems.map((problem) => (
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
				{d.filteredProblems.length === 0 && (
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
					>
						{d.searchTerm ? "검색 결과가 없습니다." : "문제가 없습니다."}
					</div>
				)}
			</S.Container>
		</>
	);
}
