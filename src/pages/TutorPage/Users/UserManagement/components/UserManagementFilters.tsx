import type React from "react";
import * as S from "../styles";
import type { RoleFilter } from "../types";

interface UserManagementFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterRole: RoleFilter;
	onFilterRoleChange: (value: RoleFilter) => void;
	/** 현재 로그인한 사용자의 이 수업 내 역할 (관리자/튜터일 때만 표시) */
	currentUserRole: string | null;
}

const UserManagementFilters: React.FC<UserManagementFiltersProps> = ({
	searchTerm,
	onSearchChange,
	filterRole,
	onFilterRoleChange,
	currentUserRole,
}) => (
	<S.Container>
		<S.Filters>
			<S.SearchBox>
				<S.SearchInput
					type="text"
					placeholder="이름, 이메일로 검색..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</S.SearchBox>
			<S.Select
				value={filterRole}
				onChange={(e) => onFilterRoleChange(e.target.value as RoleFilter)}
			>
				<option value="ALL">전체</option>
				<option value="STUDENT">수강생</option>
				<option value="TUTOR">튜터</option>
				<option value="ADMIN">관리자</option>
			</S.Select>
			{currentUserRole === "ADMIN" && (
				<S.CurrentRoleBadge $role="ADMIN">현재 권한: 관리자</S.CurrentRoleBadge>
			)}
			{currentUserRole === "TUTOR" && (
				<S.CurrentRoleBadge $role="TUTOR">현재 권한: 튜터</S.CurrentRoleBadge>
			)}
		</S.Filters>
	</S.Container>
);

export default UserManagementFilters;
