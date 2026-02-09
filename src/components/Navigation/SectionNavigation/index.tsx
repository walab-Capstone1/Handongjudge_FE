import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLink } from "react-icons/fa";
import * as S from "./styles";

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface AdditionalButton {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface SectionNavigationProps {
  sectionId: string;
  sectionName: string;
  enrollmentCode?: string | null;
  title?: string;
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showFilter?: boolean;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
  showAdditionalButtons?: boolean;
  additionalButtons?: AdditionalButton[];
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
  sectionId,
  sectionName,
  enrollmentCode = null,
  title = "수강생 관리",
  showSearch = false,
  searchTerm = "",
  onSearchChange = () => {},
  searchPlaceholder = "검색...",
  showFilter = false,
  filterValue = "ALL",
  onFilterChange = () => {},
  filterOptions = [],
  showCreateButton = false,
  onCreateClick = () => {},
  createButtonText = "새로 만들기",
  showAdditionalButtons = false,
  additionalButtons = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCopyEnrollmentLink = () => {
    if (enrollmentCode) {
      const enrollmentLink = `${window.location.origin}/enroll/${enrollmentCode}`;
      navigator.clipboard
        .writeText(enrollmentLink)
        .then(() => {
          alert("수업 참가 링크가 복사되었습니다!");
        })
        .catch((err) => {
          console.error("복사 실패:", err);
          alert("링크 복사에 실패했습니다.");
        });
    }
  };

  return (
    <S.Container>
      <S.Header>
        <S.HeaderLeft>
          <S.Title>{title}</S.Title>
          <S.CourseName>{sectionName}</S.CourseName>
          {enrollmentCode && (
            <S.EnrollmentButton onClick={handleCopyEnrollmentLink}>
              <FaLink />
              수업 참가 링크 복사
            </S.EnrollmentButton>
          )}
        </S.HeaderLeft>
      </S.Header>

      <S.Content>
        <S.Actions>
          {showSearch && (
            <S.SearchBox>
              <S.SearchInput
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </S.SearchBox>
          )}

          {showFilter && (
            <S.FilterDropdown>
              <S.FilterSelect value={filterValue} onChange={(e) => onFilterChange(e.target.value)}>
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </S.FilterSelect>
            </S.FilterDropdown>
          )}

          {showCreateButton && (
            <S.CreateButton onClick={onCreateClick}>{createButtonText}</S.CreateButton>
          )}

          {showAdditionalButtons &&
            additionalButtons.map((button, index) => (
              <S.SecondaryButton key={index} onClick={button.onClick}>
                {button.label}
              </S.SecondaryButton>
            ))}
        </S.Actions>
      </S.Content>
    </S.Container>
  );
};

export default SectionNavigation;
