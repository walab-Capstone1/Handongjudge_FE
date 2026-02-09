import styled, { keyframes } from "styled-components";

// 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 컨테이너
export const Container = styled.div`
  padding: 0;
`;

// 로딩
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  background-color: white;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// 페이지 헤더
export const PageHeader = styled.div`
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

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

// 검색 박스
export const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    background: white;
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: rgba(255, 255, 255, 0.3) !important;
    box-shadow: none !important;
    background: rgba(255, 255, 255, 0.95) !important;
  }
`;

// 필터 드롭다운
export const FilterDropdown = styled.div`
  display: flex;
  align-items: center;
`;

export const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    background: white;
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

// 버튼
export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  border: 2px solid white;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: nowrap;

  &:hover {
    background: #f8f9ff;
    border-color: white;
    color: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  }
`;

export const LinkCopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }
`;

// 테이블
export const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  position: relative;
  margin: 0 2rem 2rem 2rem;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

export const Thead = styled.thead`
  background: #f8fafc;
`;

export const Th = styled.th<{ width?: string; align?: string }>`
  padding: 0.75rem 1rem;
  text-align: ${(props) => props.align || "left"};
  font-weight: 600;
  font-size: 0.8125rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  overflow: hidden;
  text-overflow: ellipsis;
  width: ${(props) => props.width};

  ${(props) =>
		props.align === "left" &&
		`
    padding-left: calc(1rem - 3px);
    border-left: 3px solid transparent;
  `}

  ${(props) =>
		props.align === "right" &&
		`
    padding-right: 1rem;
  `}
`;

export const Tbody = styled.tbody``;

export const Tr = styled.tr<{ disabled?: boolean }>`
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s ease;
  position: relative;
  overflow: visible;

  &:hover {
    background: #f8fafc;
  }

  ${(props) =>
		props.disabled &&
		`
    background: #f9fafb;
    opacity: 0.65;
  `}

  td:first-child {
    border-left: 3px solid ${(props) => (props.disabled ? "#d1d5db" : "transparent")};
    padding-left: calc(1rem - 3px);
    transition: border-color 0.2s ease;
  }

  &:not([disabled]):hover td:first-child {
    border-left-color: #667eea;
  }
`;

export const Td = styled.td<{ width?: string; align?: string }>`
  padding: 0.875rem 1rem;
  vertical-align: middle;
  overflow: visible;
  text-overflow: ellipsis;
  position: relative;
  width: ${(props) => props.width};
  max-width: 0;
  text-align: ${(props) => props.align || "left"};
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  white-space: ${(props) => (props.align === "right" ? "nowrap" : "normal")};
  min-width: ${(props) => (props.align === "left" ? "0" : "auto")};

  ${(props) =>
		props.align === "right" &&
		`
    padding-right: 1rem;
    max-width: 100%;
  `}
`;

export const NoticeTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const NoticeDescription = styled.div`
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const NewBadge = styled.span`
  background: #10b981;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
`;

export const ActionsInline = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  min-width: 0;
`;

export const PrimaryActions = styled.div`
  display: flex;
  gap: 0.375rem;
  align-items: center;
`;

export const SecondaryActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const SecondaryActionsLayer = styled.div`
  display: flex;
  gap: 0.375rem;
  align-items: center;
  padding: 0.25rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 70%;
    background: #d1d5db;
  }
`;

export const TableButton = styled.button<{
	variant?: "edit" | "delete" | "secondary";
}>`
  padding: 0.5rem 0.625rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  flex-shrink: 0;
  min-width: fit-content;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }

  ${(props) =>
		props.variant === "edit" &&
		`
    background: white;
    color: #667eea;
    border: 1px solid #667eea;
    padding: 0.5rem 0.875rem;

    &:hover {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }
  `}

  ${(props) =>
		props.variant === "delete" &&
		`
    color: #ef4444;

    &:hover {
      background: #fee2e2;
      color: #dc2626;
    }
  `}

  ${(props) =>
		props.variant === "secondary" &&
		`
    background: #f3f4f6 !important;
    color: #6b7280 !important;
    border: 1px solid #e5e7eb !important;

    &:hover {
      background: #e5e7eb !important;
      color: #374151 !important;
      border-color: #d1d5db !important;
    }
  `}
`;

export const MoreMenu = styled.div`
  position: relative;
  display: inline-block;
  z-index: 100;
`;

export const MoreDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.375rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10000 !important;
  min-width: auto;
  width: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0.125rem;
`;

export const MoreDropdownButton = styled.button<{ variant?: "delete" }>`
  padding: 0.375rem 0.625rem;
  background: white;
  border: none;
  text-align: left;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
  width: auto;
  border-radius: 4px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #f3f4f6;
  }

  ${(props) =>
		props.variant === "delete" &&
		`
    color: #ef4444;

    &:hover {
      background: #fee2e2;
      color: #dc2626;
    }
  `}
`;

export const EmptyMessage = styled.td`
  text-align: center;
  padding: 2.5rem 1.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

// 반응형
export const ResponsiveWrapper = styled.div`
  @media (max-width: 768px) {
    ${PageHeader} {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    ${HeaderLeft} {
      flex-direction: column;
      align-items: stretch;
    }

    ${HeaderRight} {
      flex-direction: column;
      align-items: stretch;
      width: 100%;
    }

    ${SearchBox} {
      max-width: none;
    }

    ${TableContainer} {
      margin: 0 1rem 1rem 1rem;
      overflow-x: auto;
    }

    ${Table} {
      min-width: 800px;
      table-layout: auto;
    }

    ${ActionsInline} {
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    ${TableButton} {
      padding: 0.375rem 0.5rem;
      font-size: 0.6875rem;
    }
  }
`;
