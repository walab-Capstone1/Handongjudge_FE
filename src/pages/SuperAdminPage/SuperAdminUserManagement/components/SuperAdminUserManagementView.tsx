import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import * as S from "../../../TutorPage/Users/UserManagement/styles";
import type { SuperAdminUserManagementHookReturn } from "../hooks/useSuperAdminUserManagement";
import type { RoleFilter } from "../types";

export default function SuperAdminUserManagementView(
	d: SuperAdminUserManagementHookReturn,
) {
	if (d.loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="사용자 목록을 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.HeaderLeft>
						<S.Title>사용자 관리</S.Title>
						<S.SearchBox>
							<S.SearchInput
								type="text"
								placeholder="이름, 이메일 또는 학번으로 검색..."
								value={d.searchTerm}
								onChange={(e) => d.setSearchTerm(e.target.value)}
							/>
						</S.SearchBox>
					</S.HeaderLeft>
				</S.Header>
				<div style={{ marginBottom: "1rem" }}>
					<select
						value={d.roleFilter}
						onChange={(e) => d.setRoleFilter(e.target.value as RoleFilter)}
						style={{
							padding: "0.75rem",
							border: "1px solid #e5e7eb",
							borderRadius: "6px",
						}}
					>
						<option value="ALL">전체 역할</option>
						<option value="STUDENT">학생</option>
						<option value="INSTRUCTOR">강사</option>
						<option value="ADMIN">관리자</option>
						<option value="SUPER_ADMIN">시스템 관리자</option>
					</select>
				</div>
				<S.TableContainer>
					<S.Table>
						<thead>
							<tr>
								<S.Th>이름</S.Th>
								<S.Th>이메일</S.Th>
								<S.Th>학번</S.Th>
								<S.Th>역할</S.Th>
								<S.Th>가입일</S.Th>
							</tr>
						</thead>
						<tbody>
							{d.filteredUsers.map((u) => (
								<tr key={u.id}>
									<S.Td>{u.name}</S.Td>
									<S.Td>{u.email}</S.Td>
									<S.Td>{u.studentId || "-"}</S.Td>
									<S.Td>
										<span
											style={{
												padding: "0.25rem 0.6rem",
												borderRadius: "12px",
												fontSize: "0.75rem",
												fontWeight: 600,
												background: "#f3f4f6",
												color: "#6b7280",
											}}
										>
											{d.getRoleLabel(u.role)}
										</span>
									</S.Td>
									<S.Td>
										{new Date(u.createdAt).toLocaleDateString("ko-KR")}
									</S.Td>
								</tr>
							))}
						</tbody>
					</S.Table>
				</S.TableContainer>
				{d.filteredUsers.length === 0 && (
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
					>
						{d.searchTerm || d.roleFilter !== "ALL"
							? "검색 결과가 없습니다."
							: "사용자가 없습니다."}
					</div>
				)}
			</S.Container>
		</>
	);
}
