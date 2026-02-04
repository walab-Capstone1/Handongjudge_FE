import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import APIService from "../../../services/APIService";
import Header from "../../../components/Header";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "../../TutorPage/UserManagement/styles";
import type { User, RoleFilter } from "./types";

const SuperAdminUserManagement: React.FC = () => {
	const { user } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllUsers();
			setUsers(response?.data || response || []);
		} catch (error) {
			console.error("사용자 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const getRoleLabel = (role: string): string => {
		const labels: Record<string, string> = {
			STUDENT: "학생",
			INSTRUCTOR: "강사",
			ADMIN: "관리자",
			SUPER_ADMIN: "시스템 관리자",
		};
		return labels[role] || role;
	};

	const filteredUsers = users.filter((u) => {
		const matchesSearch =
			u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(u.studentId && u.studentId.includes(searchTerm));
		const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
		return matchesSearch && matchesRole;
	});

	if (loading) {
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
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</S.SearchBox>
					</S.HeaderLeft>
				</S.Header>

				<div style={{ marginBottom: "1rem" }}>
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
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
							{filteredUsers.map((u) => (
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
											{getRoleLabel(u.role)}
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

				{filteredUsers.length === 0 && (
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
					>
						{searchTerm || roleFilter !== "ALL"
							? "검색 결과가 없습니다."
							: "사용자가 없습니다."}
					</div>
				)}
			</S.Container>
		</>
	);
};

export default SuperAdminUserManagement;
