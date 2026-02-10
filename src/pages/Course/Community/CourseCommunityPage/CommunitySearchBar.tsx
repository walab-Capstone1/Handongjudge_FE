import type React from "react";
import * as S from "./styles";

interface CommunitySearchBarProps {
  searchKeyword: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
}

const CommunitySearchBar: React.FC<CommunitySearchBarProps> = ({
  searchKeyword,
  onKeywordChange,
  onSearch,
}) => (
  <S.SearchBar>
    <input
      type="text"
      placeholder="질문 검색..."
      value={searchKeyword}
      onChange={(e) => onKeywordChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch()}
      aria-label="질문 검색"
    />
    <button type="button" onClick={onSearch}>
      검색
    </button>
  </S.SearchBar>
);

export default CommunitySearchBar;
