import type { FC } from "react";
import * as S from "../styles";
import type { Section } from "../types";

interface NoticeHeaderProps {
	isSectionPage: boolean;
	currentSection: Section | null;
	searchTerm: string;
	onSearchChange: (value: string) => void;
	filterSection: string;
	onFilterSectionChange: (value: string) => void;
	uniqueSections: { id: number; name: string }[];
	onCreateNotice: () => void;
	onCopyEnrollmentLink: () => void;
}

const NoticeHeader: FC<NoticeHeaderProps> = ({
	isSectionPage,
	currentSection,
	searchTerm,
	onSearchChange,
	filterSection,
	onFilterSectionChange,
	uniqueSections,
	onCreateNotice,
	onCopyEnrollmentLink,
}) => {
	if (isSectionPage && currentSection) {
		return (
			<S.PageHeader>
				<S.HeaderLeft>
					<S.PageTitle>{currentSection.courseTitle}</S.PageTitle>
				</S.HeaderLeft>
				<S.HeaderRight>
					{currentSection.enrollmentCode && (
						<S.LinkCopyButton
							onClick={onCopyEnrollmentLink}
							title="수업 참가 링크 복사"
						>
							🔗 수업 링크 복사
						</S.LinkCopyButton>
					)}
					<S.PrimaryButton onClick={onCreateNotice}>
						새 공지사항 작성
					</S.PrimaryButton>
				</S.HeaderRight>
			</S.PageHeader>
		);
	}

	return (
		<S.PageHeader>
			<S.HeaderLeft>
				<S.PageTitle>전체 공지사항 관리</S.PageTitle>
				<S.SearchBox>
					<S.SearchInput
						type="text"
						placeholder="제목, 내용, 분반으로 검색..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</S.SearchBox>
			</S.HeaderLeft>
			<S.HeaderRight>
				<S.FilterDropdown>
					<S.FilterSelect
						value={filterSection}
						onChange={(e) => onFilterSectionChange(e.target.value)}
					>
						<option value="ALL">모든 수업</option>
						{uniqueSections.map((section) => (
							<option key={section.id} value={section.id}>
								{section.name}
							</option>
						))}
					</S.FilterSelect>
				</S.FilterDropdown>
				<S.HeaderActions>
					<S.PrimaryButton onClick={onCreateNotice}>
						새 공지사항 작성
					</S.PrimaryButton>
				</S.HeaderActions>
			</S.HeaderRight>
		</S.PageHeader>
	);
};

export default NoticeHeader;
