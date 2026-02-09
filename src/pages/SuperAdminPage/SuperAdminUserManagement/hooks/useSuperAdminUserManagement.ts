import { useState, useEffect, useCallback, useMemo } from "react";
import APIService from "../../../../services/APIService";
import type { User, RoleFilter } from "../types";

export function useSuperAdminUserManagement() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllUsers();
			setUsers(response?.data || response || []);
		} catch (error) {
			console.error("사용자 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const getRoleLabel = useCallback((role: string): string => {
		const labels: Record<string, string> = {
			STUDENT: "학생",
			INSTRUCTOR: "강사",
			ADMIN: "관리자",
			SUPER_ADMIN: "시스템 관리자",
		};
		return labels[role] || role;
	}, []);

	const filteredUsers = useMemo(
		() =>
			users.filter((u) => {
				const matchesSearch =
					u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.studentId && u.studentId.includes(searchTerm));
				const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
				return matchesSearch && matchesRole;
			}),
		[users, searchTerm, roleFilter],
	);

	return {
		loading,
		searchTerm,
		setSearchTerm,
		roleFilter,
		setRoleFilter,
		filteredUsers,
		getRoleLabel,
	};
}

export type SuperAdminUserManagementHookReturn = ReturnType<
	typeof useSuperAdminUserManagement
>;
