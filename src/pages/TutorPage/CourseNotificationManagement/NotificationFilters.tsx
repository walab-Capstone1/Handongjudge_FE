import type React from "react";
import * as S from "./styles";
import type { NotificationFilterType, NotificationReadFilter } from "./types";

interface NotificationFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterType: NotificationFilterType;
	onFilterTypeChange: (value: NotificationFilterType) => void;
	filterRead: NotificationReadFilter;
	onFilterReadChange: (value: NotificationReadFilter) => void;
	onPageReset: () => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
	searchTerm,
	onSearchChange,
	filterType,
	onFilterTypeChange,
	filterRead,
	onFilterReadChange,
	onPageReset,
}) => {
	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onFilterTypeChange(e.target.value as NotificationFilterType);
		onPageReset();
	};
	const handleReadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onFilterReadChange(e.target.value as NotificationReadFilter);
		onPageReset();
	};

	return (
		<S.FiltersSection>
			<S.SearchBox>
				<S.SearchInput
					type="text"
					placeholder="알림 검색..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</S.SearchBox>

			<S.FilterGroup>
				<S.FilterSelect value={filterType} onChange={handleTypeChange}>
					<option value="ALL">전체 타입</option>
					<option value="ASSIGNMENT">과제 관련</option>
					<option value="STUDENT">학생 추가</option>
					<option value="NOTICE">공지사항</option>
				</S.FilterSelect>
			</S.FilterGroup>

			<S.FilterGroup>
				<S.FilterSelect value={filterRead} onChange={handleReadChange}>
					<option value="ALL">전체</option>
					<option value="UNREAD">읽지 않음</option>
					<option value="READ">읽음</option>
				</S.FilterSelect>
			</S.FilterGroup>
		</S.FiltersSection>
	);
};

export default NotificationFilters;
