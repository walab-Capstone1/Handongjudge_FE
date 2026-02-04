import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

/** 페이지 루트 - .assignment-management */
export const Container = styled.div`
  padding: 0;
`;

/** 헤더 (분반별/전체 공통) */
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
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

/** 필터/검색 섹션 */
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
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }

  body.section-modal-open & {
    &:focus {
      outline: none !important;
      border-color: #e1e8ed !important;
      box-shadow: none !important;
      background: white !important;
    }
  }
`;

export const SectionFilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
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

/** 버튼 */
export const BtnPrimary = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: nowrap;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

export const BtnSecondary = styled.button`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: nowrap;

  &:hover {
    background: #f8f9ff;
    border-color: #5568d3;
    color: #5568d3;
    transform: translateY(-2px);
  }
`;

export const BtnSecondaryPrimary = styled(BtnSecondary)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    color: white;
    border: none;
  }
`;

/** 문제 설명 패널 (오버레이) */
export const DetailOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease;
`;

export const DetailPanel = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  animation: ${slideInUp} 0.3s ease;
  overflow: hidden;
`;

export const DetailPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }
`;

export const BtnCloseDetail = styled.button`
  background: #e5e7eb;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  line-height: 1;
  transition: all 0.2s ease;

  &:hover {
    background: #d1d5db;
    color: #374151;
  }
`;

export const DetailPanelContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

export const DetailTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
`;

export const DetailMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: #64748b;

  span {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.8rem;
    background: #f1f5f9;
    border-radius: 6px;
    font-weight: 500;
  }
`;

export const DetailBody = styled.div`
  line-height: 1.7;
  color: #334155;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  .tutor-inline-code {
    background: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    color: #dc2626;
  }

  .tutor-code-block {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
  }
`;

/** 기존 문제 가져오기 모달 (createPortal용) */
export const CopyModalOverlay = styled.div`
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease;
  padding-top: 2rem;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const CopyModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 95vw;
  min-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideInUp} 0.3s ease;
  margin-top: 0;
  display: flex;
  flex-direction: column;
`;

export const CopyModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
`;

export const CopyModalHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

export const CopyModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

export const CopyModalBtnBack = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.25rem;
  color: white;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-2px);
  }
`;

export const CopyModalBtnClose = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.75rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

export const CopyModalBody = styled.div`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
  background: white;
`;

export const CopyModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
`;

export const CopyControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-shrink: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const SectionSelectBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
  }
`;

export const SectionSelect = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const CopyToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const ProblemSearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  max-width: 400px;

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

export const ViewModeTabs = styled.div`
  display: flex;
  gap: 0.25rem;
  background: #f1f5f9;
  padding: 0.15rem;
  border-radius: 8px;
  flex-shrink: 0;
  height: fit-content;
  align-items: center;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.5rem 1rem;
  background: ${(p) => (p.$active ? "white" : "transparent")};
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => (p.$active ? "#667eea" : "#64748b")};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0,0,0,0.1)" : "none")};

  &:hover {
    background: ${(p) => (p.$active ? "white" : "#e2e8f0")};
    color: ${(p) => (p.$active ? "#667eea" : "#475569")};
  }
`;

export const LoadingItems = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
  font-size: 1rem;
`;

export const NoItems = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
  font-size: 1rem;
`;

export const CopyFooterBtnSecondary = styled(BtnSecondary)`
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
`;

export const CopyFooterBtnPrimary = styled(BtnPrimary)`
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;

  &:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    color: white;
  }
`;

/* ========== 페이지 본문: 테이블 뷰 (AssignmentTableView) - 원본/Admin과 동일 ========== */
export const TableViewWrapper = styled.div`
  .tutor-assignments-table-container {
    margin-top: 0;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }

  .tutor-assignments-table {
    width: 100%;
    border-collapse: collapse;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-assignments-table thead {
    background: #f1f5f9;
  }

  .tutor-assignments-table th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.875rem;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #cbd5e1;
  }

  .tutor-assignments-table th:nth-child(n + 2) {
    text-align: right;
  }

  .tutor-assignments-table tbody tr {
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.2s ease;
  }

  .tutor-assignments-table tbody tr:hover {
    background: #f8fafc;
  }

  .tutor-assignments-table tbody tr:last-child {
    border-bottom: none;
  }

  .tutor-assignments-table tbody tr.tutor-disabled {
    opacity: 0.6;
    background: #f9fafb;
  }

  .tutor-assignments-table tbody tr.tutor-disabled:hover {
    background: #f1f5f9;
  }

  .tutor-assignments-table td {
    padding: 1.25rem 1.5rem;
    vertical-align: middle;
    font-size: 0.95rem;
    color: #1e293b;
  }

  .tutor-assignment-title-cell {
    min-width: 300px;
  }

  .tutor-assignment-title {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .tutor-assignment-description {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tutor-assignment-due-date-cell,
  .tutor-assignment-problem-count-cell,
  .tutor-assignment-submission-cell {
    font-size: 0.95rem;
    color: #1e293b;
    font-weight: 600;
    white-space: nowrap;
    text-align: right;
  }

  .tutor-table-empty {
    text-align: center;
    padding: 3rem 1.5rem !important;
    color: #94a3b8;
    font-size: 0.95rem;
  }

  .tutor-assignment-actions-cell {
    white-space: nowrap;
    text-align: right;
  }

  .tutor-assignment-actions-inline {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tutor-assignment-primary-actions {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .tutor-assignment-secondary-actions {
    display: flex;
    align-items: center;
  }

  .tutor-secondary-actions-layer {
    position: relative;
    display: flex;
    align-items: center;
  }

  /* 원본/Admin과 동일: 흰 배경 + 연한 테두리 버튼, 목록/추가/수정 파란 테두리, 비활성화/더보기 빨간 테두리 */
  .tutor-btn-table-action {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    color: #475569;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-btn-table-action:hover {
    background: #e2e8f0;
    color: #334155;
  }

  .tutor-btn-table-action.tutor-btn-edit {
    background: white;
    color: #667eea;
    border: 1px solid #667eea;
  }

  .tutor-btn-table-action.tutor-btn-edit:hover {
    background: #f3f4f6;
    color: #5568d3;
    border-color: #5568d3;
  }

  .tutor-btn-table-action.tutor-btn-secondary-action {
    color: #64748b;
    padding: 0.4rem 0.75rem;
  }

  .tutor-btn-table-action.tutor-btn-delete {
    color: #ef4444;
    background: white;
    border: 1px solid #ef4444;
  }

  .tutor-btn-table-action.tutor-btn-delete:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #ef4444;
  }

  .tutor-btn-table-action.tutor-btn-more {
    padding: 0.5rem 0.75rem;
    font-size: 1.2rem;
    line-height: 1;
    color: #ef4444;
    border: 1px solid #ef4444;
    background: white;
  }

  .tutor-btn-table-action.tutor-btn-more:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .tutor-more-menu {
    position: relative;
    display: inline-flex;
  }

  .tutor-more-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 120px;
    overflow: hidden;
  }

  .tutor-more-dropdown .tutor-btn-text-small {
    padding: 0.75rem 1rem;
    background: white;
    border: none;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .tutor-more-dropdown .tutor-btn-text-small:hover {
    background: #f8fafc;
  }

  .tutor-more-dropdown .tutor-btn-text-small.tutor-delete:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .tutor-btn-text-small {
    display: block;
    width: 100%;
    padding: 0.6rem 1rem;
    border: none;
    background: none;
    font-size: 0.9rem;
    color: #374151;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s ease;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-btn-text-small:hover {
    background: #f3f4f6;
  }

  .tutor-btn-text-small.tutor-delete {
    color: #ef4444;
  }

  .tutor-btn-text-small.tutor-delete:hover {
    background: #fef2f2;
  }

  /* 페이지네이션 영역 - 원본/Admin과 동일 (총 N개 중 X-Y개 표시, 이전/다음) */
  .tutor-assignments-table-container > div:last-child {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

/* ========== 페이지 본문: 리스트 뷰 (AssignmentListView) ========== */
export const ListViewWrapper = styled.div`
  .tutor-assignments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tutor-assignment-list-item {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  }

  .tutor-assignment-list-item:hover {
    border-color: #cbd5e1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .tutor-assignment-list-item.tutor-expanded {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .tutor-assignment-list-item.tutor-disabled {
    opacity: 0.65;
    background: #f9fafb;
  }

  .tutor-assignment-list-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    flex-wrap: wrap;
  }

  .tutor-assignment-list-info {
    flex: 1;
    min-width: 0;
  }

  .tutor-assignment-list-title-section {
    margin-bottom: 0.5rem;
  }

  .tutor-assignment-list-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-assignment-list-description {
    margin: 0;
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.5;
  }

  .tutor-assignment-list-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .tutor-assignment-meta-item {
    display: inline-flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .tutor-meta-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tutor-meta-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
  }

  .tutor-assignment-list-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tutor-btn-list-action {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #667eea;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-btn-list-action:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  }

  .tutor-btn-list-action.tutor-btn-more {
    padding: 0.4rem 0.75rem;
    color: #64748b;
  }

  .tutor-more-menu {
    position: relative;
    display: inline-flex;
  }

  .tutor-more-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.25rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    min-width: 100px;
    overflow: hidden;
  }

  .tutor-btn-text-small {
    display: block;
    width: 100%;
    padding: 0.6rem 1rem;
    border: none;
    background: none;
    font-size: 0.9rem;
    color: #374151;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s ease;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-btn-text-small:hover {
    background: #f3f4f6;
  }

  .tutor-btn-text-small.tutor-delete {
    color: #ef4444;
  }

  .tutor-btn-text-small.tutor-delete:hover {
    background: #fef2f2;
  }

  .assignment-expanded-content {
    padding: 0 1.5rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #fafbfc;
  }

  .tutor-problems-section {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .tutor-problems-header {
    margin-bottom: 0.75rem;
  }

  .tutor-problems-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
  }

  .tutor-problems-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tutor-problem-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .tutor-problem-item-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }

  .tutor-problem-number {
    font-weight: 600;
    color: #667eea;
    font-size: 0.9rem;
  }

  .tutor-problem-item .tutor-problem-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
    margin: 0;
  }

  .tutor-problem-difficulty {
    font-size: 0.8rem;
    font-weight: 500;
  }

  .tutor-problem-submission-rate {
    font-size: 0.85rem;
    color: #64748b;
    flex-shrink: 0;
  }

  .tutor-btn-remove-problem {
    padding: 0.35rem 0.6rem;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 6px;
    color: #ef4444;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .tutor-btn-remove-problem:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }

  .tutor-no-problems {
    text-align: center;
    padding: 1.5rem 1rem;
    color: #64748b;
    font-size: 0.95rem;
  }

  .tutor-no-problems p {
    margin: 0 0 0.75rem 0;
  }

  .tutor-btn-add-first-problem {
    padding: 0.6rem 1.25rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  .tutor-btn-add-first-problem:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .tutor-progress-container {
    margin-top: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  .tutor-progress-info {
    margin-bottom: 0.5rem;
  }

  .tutor-progress-label {
    font-size: 0.8rem;
    color: #64748b;
    margin-right: 0.5rem;
  }

  .tutor-progress-count {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
  }

  .tutor-progress-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .tutor-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .tutor-no-assignments {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 12px;
    border: 2px dashed #e5e7eb;
  }

  .tutor-no-assignments-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .tutor-no-assignments-icon {
    font-size: 2.5rem;
    opacity: 0.7;
  }

  .tutor-no-assignments-message p {
    margin: 0;
    font-size: 1rem;
    color: #64748b;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;
