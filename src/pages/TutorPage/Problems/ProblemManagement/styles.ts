import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Container
export const Container = styled.div`
  padding: 0;
`;

// Title Header
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TitleStats = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

export const StatBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  backdrop-filter: blur(10px);
`;

export const TitleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const CreateButton = styled.button`
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  padding: 0.875rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

// Filters Section
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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

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
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

// Table
export const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f8fafc;
  }

  th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: #475569;
    border-bottom: 2px solid #e2e8f0;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

    &.meta-cell {
      text-align: right;
    }

    &.actions-cell {
      text-align: right;
    }
  }

  td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 0.95rem;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  tbody tr:hover {
    background: #f8fafc;
  }

  @media (max-width: 768px) {
    min-width: 800px;
  }
`;

export const IdCell = styled.td`
  min-width: 80px;
  text-align: center;
`;

export const IdText = styled.span`
  color: #64748b;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
`;

export const TitleCell = styled.td`
  min-width: 300px;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const TitleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const TitleText = styled.span<{ $clickable?: boolean }>`
  font-weight: 500;
  color: #1e293b;
  font-size: 1rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  ${(props) =>
    props.$clickable &&
    `
    cursor: pointer;
    transition: color 0.2s ease;
    text-decoration: underline;

    &:hover {
      color: #667eea;
    }
  `}
`;

export const UsageBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const UsageCount = styled.span`
  margin-left: 0.25rem;
  opacity: 0.9;
  font-weight: 500;
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  background: #eef2ff;
  color: #667eea;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const MetaCell = styled.td`
  text-align: right;
  color: #64748b;
`;

export const ActionsCell = styled.td`
  text-align: right;
`;

export const ActionsInline = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
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

export const MoreMenuItem = styled.button<{ $delete?: boolean }>`
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
  color: ${(props) => (props.$delete ? "#ef4444" : "inherit")};

  &:hover {
    background: ${(props) => (props.$delete ? "#fee2e2" : "#f3f4f6")};
    color: ${(props) => (props.$delete ? "#dc2626" : "inherit")};
  }
`;

// Table Action Buttons
export const TableActionButton = styled.button<{
  $edit?: boolean;
  $secondary?: boolean;
  $delete?: boolean;
}>`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  color: #667eea;
  flex-shrink: 0;
  min-width: fit-content;

  ${(props) =>
    props.$edit &&
    `
    color: #667eea;
    border-color: #667eea;

    &:hover {
      background: #667eea;
      color: white;
    }
  `}

  ${(props) =>
    props.$secondary &&
    `
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #e5e7eb;
      color: #374151;
      border-color: #d1d5db;
    }
  `}

  ${(props) =>
    props.$secondary &&
    props.$delete &&
    `
    color: #ef4444;
    border-color: #fee2e2;

    &:hover {
      background: #fee2e2;
      color: #dc2626;
      border-color: #ef4444;
    }
  `}

  &:hover {
    transform: translateY(-1px);
  }
`;

// Modal
export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div<{ $large?: boolean }>`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: ${(props) => (props.$large ? "800px" : "600px")};
  max-height: ${(props) => (props.$large ? "calc(85vh - 65px)" : "calc(90vh - 65px)")};
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideInUp} 0.3s ease;
  margin-top: 0;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb !important;
  color: #1e293b;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const ModalClose = styled.button`
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ModalBody = styled.div`
  padding: 2rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
`;

// Form
export const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.625rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.95rem;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f3f4f6;
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

// Buttons
export const BtnCancel = styled.button`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: #f3f4f6;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BtnSubmit = styled.button`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

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

export const BtnDanger = styled.button`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: #ef4444;
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    background: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Description Content
export const DescriptionContent = styled.div`
  padding: 1.5rem;
  line-height: 1.7;
  color: #334155;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  h1,
  .problem-description-h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 1.5rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 3px solid #667eea;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  h2,
  .problem-description-h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  h3,
  .problem-description-h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  p,
  .problem-description-paragraph {
    margin: 0.75rem 0;
    color: #475569;
    line-height: 1.7;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  code,
  .problem-description-inline-code {
    background: #f1f5f9;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
    color: #dc2626;
    border: 1px solid #e2e8f0;
  }

  pre,
  .problem-description-code-block {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
    border: 1px solid #334155;

    code {
      background: transparent;
      padding: 0;
      color: inherit;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
      white-space: pre;
      display: block;
      border: none;
    }
  }
`;

export const TagsInModal = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TagInModal = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: #eef2ff;
  color: #667eea;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
`;

// Usage Modal Tables
export const UsageSection = styled.div`
  margin-bottom: 30px;

  h3 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
`;

export const UsageTableWrapper = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

export const UsageTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead tr {
    border-bottom: 2px solid #e1e8ed;
    background-color: #f8f9fa;
  }

  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  tbody tr {
    border-bottom: 1px solid #e1e8ed;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;

    &:hover {
      background-color: #f0f7ff !important;
      transform: translateX(2px);
    }

    &:active {
      transform: translateX(0);
      background-color: #e0f2fe !important;
    }
  }

  td {
    padding: 12px;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
`;

export const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;

  p {
    margin: 0;
  }
`;

export const WarningText = styled.p`
  color: #e74c3c;
  margin-top: 16px;
  font-size: 14px;
`;

export const BoldText = styled.p`
  font-weight: bold;
  margin-top: 8px;
`;

export const CopyPrompt = styled.p`
  font-weight: bold;
  margin-top: 8px;
  margin-bottom: 16px;
`;

export const UsagePrompt = styled.p`
  font-weight: bold;
  margin-bottom: 20px;
  font-size: 16px;
`;

// Responsive
export const ResponsiveWrapper = styled.div`
  @media (max-width: 768px) {
    overflow-x: auto;
  }
`;

// Additional components used by other pages
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
`;

export const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
  }
`;

export const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.95rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const Badge = styled.span`
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
  }

  &.delete {
    background: #ef4444;

    &:hover {
      background: #dc2626;
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

export const Button = styled.button`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: white;
  color: #667eea;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  }
`;

export const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }
`;
