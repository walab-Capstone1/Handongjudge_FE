/**
 * AssignmentModals styled-components.
 * 과제 관리 모달(추가/수정, 문제 목록, 문제 선택, 복사 등) 공통 스타일.
 */
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const Overlay = styled.div<{ $zIndex?: number; $alignCenter?: boolean }>`
  position: fixed;
  top: 65px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: ${(p) => (p.$alignCenter ? "center" : "flex-start")};
  justify-content: center;
  z-index: ${(p) => p.$zIndex ?? 10000};
  animation: ${fadeIn} 0.2s ease;
  padding-top: 2rem;
  padding: 2rem;
  overflow-y: auto;
  box-sizing: border-box;
`;

export const Content = styled.div<{ $extraLarge?: boolean; $large?: boolean }>`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: ${(p) => (p.$extraLarge ? "95vw" : p.$large ? "80vw" : "600px")};
  min-width: ${(p) => (p.$extraLarge ? "800px" : p.$large ? "600px" : "auto")};
  max-height: calc(90vh - 65px);
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideInUp} 0.3s ease;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  color: #1e293b;
  flex-shrink: 0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const HeaderGradient = styled(Header)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h2 {
    color: white;
  }
`;

export const CloseButton = styled.button`
  background: #e5e7eb;
  border: none;
  font-size: 1.75rem;
  color: #6b7280;
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
    background: #d1d5db;
    color: #374151;
    transform: rotate(90deg);
  }
`;

export const CloseButtonOnDark = styled(CloseButton)`
  background: rgba(255, 255, 255, 0.2);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const Body = styled.div`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: white;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: auto;
  border-top: 1px solid #e5e7eb;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

export const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.625rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const BtnPrimary = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const BtnSecondary = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

export const InfoBox = styled.div`
  padding: 1rem 1.25rem;
  background: #f0f4ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 1.5rem;

  p {
    margin: 0 0 0.5rem;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

export const FormHelp = styled.small`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const FileInput = styled(FormInput).attrs({ type: "file" })`
  padding: 0.5rem;
`;

export const FileSelected = styled.span`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #059669;
  font-weight: 500;
`;

export const OptionalLabel = styled.span`
  font-weight: 400;
  color: #6b7280;
  font-size: 0.9rem;
`;

export const DetailContent = styled.div`
  margin-bottom: 1.5rem;
`;

export const DetailMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
`;

export const DetailBody = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #374151;

  p {
    margin: 0 0 0.75rem;
  }
`;

export const BulkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const BulkRow = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  background: #fafafa;
`;

export const BulkRowHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
  }
`;

export const BulkRowContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const BtnRemoveRow = styled.button`
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fee2e2;
  }
`;

export const BulkActions = styled.div`
  margin-bottom: 1.5rem;
`;

export const BtnAddRow = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: 1px dashed #d1d5db;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
`;

/* Problem list modal (table, filters, actions) */
export const FiltersSection = styled.div`
  margin-bottom: 1rem;
`;

export const SearchBox = styled.div`
  max-width: 320px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0984e3;
    box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.1);
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
  }
  th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
  }
  tbody tr {
    border-bottom: 1px solid #e5e7eb;
  }
  tbody tr:hover {
    background: #f9fafb;
  }
  td {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    color: #374151;
  }
`;

export const ProblemTitleCell = styled.td`
  font-weight: 500;
`;

export const BtnLink = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  font-weight: 500;
  text-decoration: underline;

  &:hover {
    color: #5568d3;
  }
`;

export const BtnTableAction = styled.button`
  background: #f3f4f6;
  border: none;
  color: #374151;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

export const BtnTableActionDelete = styled(BtnTableAction)`
  background: #fef2f2;
  color: #dc2626;

  &:hover {
    background: #fee2e2;
  }
`;

export const NoProblems = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;

  p {
    margin: 0 0 1rem;
  }
`;

/* ProblemSelectModal inner */
export const ModeTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ModeTab = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.25rem;
  border: none;
  background: ${(p) => (p.$active ? "#667eea" : "transparent")};
  color: ${(p) => (p.$active ? "white" : "#6b7280")};
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  font-size: 0.95rem;

  &:hover {
    background: ${(p) => (p.$active ? "#5568d3" : "#f3f4f6")};
    color: ${(p) => (p.$active ? "white" : "#374151")};
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
`;

export const LoadingText = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

export const NoAvailableText = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;

  p {
    margin: 0;
  }
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ListItem = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #667eea;
  }

  h4 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
  }
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #6b7280;
  }
`;

export const ItemCount = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

export const BtnCreateNew = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

/* CopyProblemModal inner (grid, cards, hierarchy) */
export const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

export const ProblemCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
`;

export const ProblemCardHeader = styled.div`
  flex-shrink: 0;
`;

export const ProblemCardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProblemCardTitle = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
`;

export const ProblemCardMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6b7280;
`;

export const ProblemCardDate = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
`;

export const BtnViewDetailCard = styled(BtnTableAction)`
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
`;

export const AssignmentListLarge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const AssignmentItemLarge = styled.div<{ $expanded?: boolean }>`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: ${(p) => (p.$expanded ? "#f9fafb" : "white")};
`;

export const AssignmentItemHeaderLarge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

export const AssignmentInfoLarge = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AssignmentTitleLarge = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

export const AssignmentMeta = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  display: block;
  margin-top: 0.25rem;
`;

export const BtnExpandAssignment = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  color: #667eea;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const ProblemSelectionBoxLarge = styled.div`
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

export const ProblemListLarge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
`;

export const ProblemItemLarge = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  transition: background 0.2s ease;
  &:hover {
    background: #f9fafb;
  }
`;

export const ProblemItemLargeHeader = styled.div`
  flex-shrink: 0;
`;

export const ProblemItemLargeBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProblemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const ProblemTitleLarge = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
`;

export const ProblemNumberLarge = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
`;
