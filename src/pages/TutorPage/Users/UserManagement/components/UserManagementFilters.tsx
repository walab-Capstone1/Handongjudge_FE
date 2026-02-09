import type React from "react";
import * as S from "../styles";
import type { RoleFilter } from "../types";

interface UserManagementFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterRole: RoleFilter;
	onFilterRoleChange: (value: RoleFilter) => void;
}

const UserManagementFilters: React.FC<UserManagementFiltersProps> = ({
	searchTerm,
	onSearchChange,
	filterRole,
	onFilterRoleChange,
}) => (
	<S.Container>
		<S.Filters>
			<S.SearchBox>
				<S.SearchInput
					type="text"
					placeholder="이름, 이메일, 팀ID로 검색..."
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
		</S.Filters>
	</S.Container>
);

export default UserManagementFilters;
