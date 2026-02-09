import type React from "react";
import * as S from "../styles";

interface DashboardFiltersProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterYear: string;
	onFilterYearChange: (value: string) => void;
	filterSemester: string;
	onFilterSemesterChange: (value: string) => void;
	filterStatus: string;
	onFilterStatusChange: (value: string) => void;
	availableYears: number[];
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
	searchTerm,
	onSearchChange,
	filterYear,
	onFilterYearChange,
	filterSemester,
	onFilterSemesterChange,
	filterStatus,
	onFilterStatusChange,
	availableYears,
}) => (
	<S.FiltersSection>
		<S.SearchBox>
			<S.SearchInput
				type="text"
				placeholder="수업명, 교수명으로 검색..."
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
			/>
		</S.SearchBox>
		<S.FilterGroup>
			<S.FilterSelect
				value={filterYear}
				onChange={(e) => onFilterYearChange(e.target.value)}
			>
				<option value="ALL">전체 년도</option>
				{availableYears.map((year) => (
					<option key={year} value={year}>
						{year}년
					</option>
				))}
			</S.FilterSelect>
		</S.FilterGroup>
		<S.FilterGroup>
			<S.FilterSelect
				value={filterSemester}
				onChange={(e) => onFilterSemesterChange(e.target.value)}
			>
				<option value="ALL">전체 학기</option>
				<option value="SPRING">1학기</option>
				<option value="SUMMER">여름학기</option>
				<option value="FALL">2학기</option>
				<option value="WINTER">겨울학기</option>
				<option value="CAMP">캠프</option>
				<option value="SPECIAL">특강</option>
				<option value="IRREGULAR">비정규 세션</option>
			</S.FilterSelect>
		</S.FilterGroup>
		<S.FilterGroup>
			<S.FilterSelect
				value={filterStatus}
				onChange={(e) => onFilterStatusChange(e.target.value)}
			>
				<option value="ALL">전체 상태</option>
				<option value="ACTIVE">활성</option>
				<option value="INACTIVE">비활성</option>
			</S.FilterSelect>
		</S.FilterGroup>
	</S.FiltersSection>
);

export default DashboardFilters;
