import type React from "react";
import * as S from "./styles";

interface CommunityPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const CommunityPagination: React.FC<CommunityPaginationProps> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) => (
  <S.PaginationWrap>
    <button
      type="button"
      onClick={onPrev}
      disabled={currentPage === 0}
      aria-label="이전 페이지"
    >
      이전
    </button>
    <span className="page-info">
      {currentPage + 1} / {totalPages}
    </span>
    <button
      type="button"
      onClick={onNext}
      disabled={currentPage >= totalPages - 1}
      aria-label="다음 페이지"
    >
      다음
    </button>
  </S.PaginationWrap>
);

export default CommunityPagination;
