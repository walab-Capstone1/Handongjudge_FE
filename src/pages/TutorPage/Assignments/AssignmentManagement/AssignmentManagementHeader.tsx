import type React from "react";
import * as S from "./styles";

interface AssignmentManagementHeaderProps {
	sectionId: string | undefined;
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterSection: string;
	onFilterSectionChange: (value: string) => void;
	uniqueSections: string[];
	onAddAssignment: () => void;
	onStandaloneProblemCreate: () => void;
	onBulkProblemCreate: () => void;
	/** 조교(TUTOR)인 수업이면 과제 추가/수정 등 제한 */
	isTutorOnly?: boolean;
}

const AssignmentManagementHeader: React.FC<AssignmentManagementHeaderProps> = ({
	sectionId,
	searchTerm,
	onSearchChange,
	filterSection,
	onFilterSectionChange,
	uniqueSections,
	onAddAssignment,
	onStandaloneProblemCreate,
	onBulkProblemCreate,
	isTutorOnly,
}) => {
	/* 2번 사진 원본: 헤더에 제목 + 오른쪽 "과제 추가하기" 버튼만, 뱃지 없음 */
	if (sectionId) {
		return (
			<>
				<S.PageHeader>
					<S.HeaderLeft>
						<S.PageTitle>과제 관리</S.PageTitle>
					</S.HeaderLeft>
					{!isTutorOnly && (
						<S.HeaderActions>
							<S.BtnPrimary type="button" onClick={onAddAssignment}>
								과제 추가하기
							</S.BtnPrimary>
						</S.HeaderActions>
					)}
				</S.PageHeader>
				<S.FiltersSection>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="과제명으로 검색..."
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
					</S.SearchBox>
				</S.FiltersSection>
			</>
		);
	}

	return (
		<>
			<S.PageHeader>
				<S.HeaderLeft>
					<S.PageTitle>전체 과제 관리</S.PageTitle>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="과제명, 설명으로 검색..."
							value={searchTerm}
							onChange={(e) => onSearchChange(e.target.value)}
						/>
					</S.SearchBox>
				</S.HeaderLeft>
				<S.HeaderRight>
					<S.SectionFilterSelect
						value={filterSection}
						onChange={(e) => onFilterSectionChange(e.target.value)}
					>
						<option value="ALL">모든 수업</option>
						{uniqueSections.map((sec) => (
							<option key={sec} value={sec}>
								{sec}
							</option>
						))}
					</S.SectionFilterSelect>
					<S.HeaderActions>
						<S.BtnSecondary
							type="button"
							onClick={onStandaloneProblemCreate}
							title="단일 문제를 생성합니다"
						>
							<span>📝</span> 새 문제 만들기
						</S.BtnSecondary>
						<S.BtnSecondary
							type="button"
							onClick={onBulkProblemCreate}
							title="여러 문제를 한번에 생성합니다"
						>
							문제 대량 생성
						</S.BtnSecondary>
						<S.BtnSecondaryPrimary type="button" onClick={onAddAssignment}>
							새 과제 만들기
						</S.BtnSecondaryPrimary>
					</S.HeaderActions>
				</S.HeaderRight>
			</S.PageHeader>
		</>
	);
};

export default AssignmentManagementHeader;
