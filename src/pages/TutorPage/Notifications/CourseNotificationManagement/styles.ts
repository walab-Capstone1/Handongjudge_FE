import styled from "styled-components";

const fontFamily =
	"'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif";

export const Container = styled.div`
  padding: 0;
  max-width: 100%;
`;

/* 로딩 */
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  background-color: white;

  p {
    margin: 0;
    color: #64748b;
    font-family: ${fontFamily};
  }
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

/* 타이틀 헤더 (보라색) */
export const TitleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 2rem;
  background: #667eea;
  color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1.25rem;
`;

export const TitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: ${fontFamily};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TitleStats = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const StatBadge = styled.span<{ $unread?: boolean }>`
  background: ${(p) =>
		p.$unread ? "rgba(220, 53, 69, 0.3)" : "rgba(255, 255, 255, 0.2)"};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid
    ${(p) => (p.$unread ? "rgba(220, 53, 69, 0.5)" : "rgba(255, 255, 255, 0.3)")};
  font-family: ${fontFamily};
  backdrop-filter: blur(10px);
`;

export const TitleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const MarkAllButton = styled.button`
  background: white;
  color: #667eea;
  border: 2px solid white;
  border-radius: 10px;
  padding: 0.875rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: ${fontFamily};
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  }
`;

/* 필터 섹션 */
export const FiltersSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
  font-family: ${fontFamily};

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
    background: white !important;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

export const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${fontFamily};
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }
`;

/* 알림 목록 */
export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const Item = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: 100%;
  text-align: left;
  font: inherit;
  color: inherit;
  margin: 0;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }

  &.unread {
    background: #f8f9ff;
    border-color: #667eea;
    border-left: 4px solid #667eea;
  }
`;

export const ItemIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

export const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
`;

export const ItemType = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  font-family: ${fontFamily};
`;

export const ItemDate = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  font-family: ${fontFamily};
  white-space: nowrap;
`;

export const ItemMessage = styled.div`
  font-size: 0.95rem;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  font-family: ${fontFamily};
`;

export const ItemSection = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  font-family: ${fontFamily};
`;

export const ItemUnreadBadge = styled.div`
  width: 10px;
  height: 10px;
  background: #dc3545;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.5rem;
`;

export const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  p {
    margin: 0;
    font-size: 1rem;
    color: #6b7280;
    font-family: ${fontFamily};
  }
`;

/* 페이지네이션 */
export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

export const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: ${fontFamily};

  &:hover:not(:disabled) {
    border-color: #667eea;
    color: #667eea;
    background: #f8f9ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
  font-family: ${fontFamily};
`;
