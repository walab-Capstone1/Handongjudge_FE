import React from 'react';

/**
 * 과제 목록 페이지네이션 컴포넌트
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 * @param {number} startIndex - 시작 인덱스
 * @param {number} endIndex - 끝 인덱스
 * @param {number} totalItems - 전체 아이템 수
 * @param {Function} onPageChange - 페이지 변경 핸들러
 */
const AssignmentPagination = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="tutor-pagination">
      <div className="tutor-pagination-info">
        총 {totalItems}개 중 {startIndex + 1}-{Math.min(endIndex, totalItems)}개 표시
      </div>
      <div className="tutor-pagination-controls">
        <button
          className="tutor-btn-pagination"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>
        <div className="tutor-pagination-pages">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`tutor-btn-pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          className="tutor-btn-pagination"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default AssignmentPagination;

