import type React from "react";
import * as S from "../styles";

interface UserManagementHeaderProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterSection: string;
	onFilterSectionChange: (value: string) => void;
	uniqueSections: (string | undefined)[];
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
	searchTerm,
	onSearchChange,
	filterSection,
	onFilterSectionChange,
	uniqueSections,
}) => (
	<S.Container>
		<S.Header $purple>
			<S.HeaderLeft>
				<S.Title $white>학생 관리</S.Title>
				<S.SearchBox>
					<S.SearchInput
						type="text"
						placeholder="이름, 이메일로 검색..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</S.SearchBox>
			</S.HeaderLeft>
			<S.HeaderRight>
				<S.Select
					$inHeader
					value={filterSection}
					onChange={(e) => onFilterSectionChange(e.target.value)}
				>
					<option value="ALL">모든 수업</option>
					{uniqueSections.map((section) => (
						<option key={String(section)} value={section as string}>
							{section}
						</option>
					))}
				</S.Select>
			</S.HeaderRight>
		</S.Header>
	</S.Container>
);

export default UserManagementHeader;
