import styled, { keyframes, css } from "styled-components";

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.8), 0 0 0 8px rgba(102, 126, 234, 0.2);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Container
export const Container = styled.div`
  padding: 0;
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const LandscapeLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export const SectionsPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

// Loading
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingText = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  margin: 0;
`;

// Title Header
export const TitleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

export const TitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const TitleStats = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StatBadge = styled.span`
  padding: 0.35rem 0.75rem;
  background: #e0e7ff;
  color: #667eea;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const TitleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const CreateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
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

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }

  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
  }
`;

export const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
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
    border-color: #e1e8ed !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  color: #374151;
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

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Sections Grid
export const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Course Card
export const CourseCard = styled.div`
  background: #f8f9ff;
  border: 1px solid #d1d5f0;
  border-radius: 8px;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  min-height: 180px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(102, 126, 234, 0.1);
  cursor: pointer;
  overflow: visible;
  word-wrap: break-word;
  overflow-wrap: break-word;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
  }
`;

export const CardHeader = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #e0e3f5;
  overflow: visible;
  min-width: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

export const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatusBadge = styled.span<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? "#667eea" : "#9ca3af")};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatsCompact = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
`;

export const StatLabel = styled.span`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatValue = styled.span`
  font-size: 0.85rem;
  color: #1e293b;
  font-weight: 600;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ActionsCompact = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-top: 0;
  margin-bottom: 0;
`;

export const ToggleButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 2px solid;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: ${(props) => (props.$active ? "#667eea" : "#9ca3af")} !important;
  border-color: ${(props) => (props.$active ? "#667eea" : "#9ca3af")} !important;
  color: white !important;

  &:hover {
    background: ${(props) => (props.$active ? "#5568d3" : "#6b7280")} !important;
    border-color: ${(props) => (props.$active ? "#5568d3" : "#6b7280")} !important;
  }
`;

export const ActionButtonsCompact = styled.div`
  display: flex;
  gap: 0.4rem;
  flex: 1;
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 0.6rem 0.6rem;
  border: 1px solid ${(props) => (props.$primary ? "#667eea" : "#d1d5f0")};
  background: ${(props) => (props.$primary ? "#667eea" : "white")};
  color: ${(props) => (props.$primary ? "white" : "#475569")};
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: ${(props) => (props.$primary ? "#5568d3" : "white")};
    border-color: ${(props) => (props.$primary ? "#5568d3" : "#667eea")};
    color: ${(props) => (props.$primary ? "white" : "#667eea")};
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
`;

export const DropdownToggle = styled.button`
  padding: 0.6rem 0.6rem;
  border: 1px solid #d1d5f0;
  background: white;
  color: #475569;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 40px;
  min-width: 40px;
  text-align: center;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: white;
    border-color: #667eea;
    color: #667eea;
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 100;
  overflow: hidden;
`;

export const DropdownItem = styled.button<{ $delete?: boolean }>`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: white;
  color: ${(props) => (props.$delete ? "#ef4444" : "#374151")};
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: ${(props) => (props.$delete ? "#fef2f2" : "#f9fafb")};
  }
`;

export const NoSections = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #636e72;
  font-style: italic;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  p {
    margin: 0;
  }
`;

// Modal
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalContent = styled.div<{ $large?: boolean }>`
  background: white;
  border-radius: 16px;
  width: ${(props) => (props.$large ? "95vw" : "90%")};
  max-width: ${(props) => (props.$large ? "95vw" : "600px")};
  min-width: ${(props) => (props.$large ? "800px" : "auto")};
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: ${(props) => (props.$large ? "flex" : "block")};
  flex-direction: ${(props) => (props.$large ? "column" : "initial")};
  position: relative;
  margin: auto;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #000000;
  }
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
  }
`;

export const ModalBody = styled.div<{ $large?: boolean }>`
  padding: 2rem;
  flex: ${(props) => (props.$large ? "1" : "initial")};
  overflow-y: ${(props) => (props.$large ? "auto" : "visible")};
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
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  resize: vertical;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
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
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

// Buttons
export const BtnCancel = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #f3f4f6;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
  }
`;

export const BtnSubmit = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #667eea;
  color: white;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const BtnNext = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  background: #667eea;
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const BtnPrev = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;

  &:hover {
    background: #f3f4f6;
  }
`;

export const BtnSkip = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  background: white;
  color: #9ca3af;
  border: 2px solid #e5e7eb;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
    color: #6b7280;
  }
`;

// Step Content
export const StepContent = styled.div`
  min-height: 400px;
  display: flex;
  flex-direction: column;
`;

export const StepTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

export const StepDescription = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

// Selection Box
export const SelectionBoxLarge = styled.div`
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  flex: 1;
`;

export const SelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ItemCount = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #374151;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
  }
`;

export const LoadingItems = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

export const NoItems = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

export const ItemListLarge = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

export const ListItemLarge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  input[type="checkbox"] {
    accent-color: #667eea;
  }
`;

export const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const ItemTitleLarge = styled.span`
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
`;

export const ItemMeta = styled.span`
  font-size: 0.8rem;
  color: #9ca3af;
`;

export const BtnViewDetail = styled.button`
  padding: 0.4rem 0.8rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }
`;

// Assignment List
export const AssignmentListLarge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: none;
  overflow-y: visible;
`;

export const AssignmentItemLarge = styled.div<{ $expanded?: boolean }>`
  background: white;
  border: 2px solid ${(props) => (props.$expanded ? "#667eea" : "#e5e7eb")};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: ${(props) => (props.$expanded ? "0 4px 12px rgba(102, 126, 234, 0.15)" : "none")};
`;

export const AssignmentHeaderLarge = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: white;
  gap: 1rem;
`;

export const AssignmentInfoLarge = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const AssignmentTitleLarge = styled.span`
  font-size: 1rem;
  color: #374151;
  font-weight: 600;
`;

export const AssignmentMeta = styled.span`
  font-size: 0.85rem;
  color: #9ca3af;
`;

export const BtnExpandAssignment = styled.button`
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #667eea;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// Problem Selection
export const ProblemSelectionBox = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

export const ProblemSelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ProblemListLarge = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-height: none;
  overflow-y: visible;
`;

export const ProblemItemLarge = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  padding-top: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

export const ProblemItemHeader = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  display: flex;
  justify-content: flex-end;
  z-index: 1;
`;

export const ProblemCheckbox = styled.input.attrs({ type: "checkbox" })`
  width: 1.3rem;
  height: 1.3rem;
  cursor: pointer;
  accent-color: #667eea;
`;

export const ProblemItemBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0;
  padding-top: 0;
  padding-right: 3rem;
  padding-left: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const ProblemTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

export const ProblemTitleLarge = styled.h4`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
`;

export const ProblemNumber = styled.span`
  font-weight: 600;
  color: #667eea;
  font-size: 0.95rem;
  margin-right: 0.5rem;
`;

export const BtnViewDetailCard = styled.button`
  padding: 0.4rem 0.8rem;
  background: #f3f4f6;
  color: #667eea;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }
`;

// Detail Panel
export const DetailOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1999;
`;

export const DetailPanel = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85vw;
  max-width: 1200px;
  max-height: 85vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  flex-direction: column;
`;

export const DetailPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #374151;
  }
`;

export const BtnCloseDetail = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

export const DetailPanelContent = styled.div`
  padding: 2rem;
  padding-bottom: 3rem;
  overflow-y: auto;
  flex: 1;
`;

export const DetailTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
`;

export const DetailMeta = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
`;

export const DetailBody = styled.div`
  font-size: 0.95rem;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
`;

export const ProblemDescription = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  .tutor-inline-code {
    background: #f3f4f6;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    color: #e11d48;
  }

  .tutor-code-block {
    background: #1f2937;
    color: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;

    code {
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
  }
`;

// Summary
export const SummarySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const SummaryItem = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
`;

export const SummaryLabel = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
`;

export const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const SummaryRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

export const SummaryKey = styled.span`
  font-weight: 500;
  color: #6b7280;
  min-width: 100px;
`;

export const SummaryValue = styled.span`
  color: #374151;
  flex: 1;
`;

export const SummaryList = styled.div`
  margin-top: 0.5rem;
  padding-left: 1rem;
`;

export const SummaryListItem = styled.div`
  color: #374151;
  margin: 0.5rem 0;
  line-height: 1.6;
`;

export const SummarySkipped = styled.span`
  color: #9ca3af;
  font-style: italic;
`;

// Misc
export const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

// Notification (기존 코드 유지)
export const NotificationContainer = styled.div`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1000;
`;

export const NotificationIconBtn = styled.button<{ $hasUnread?: boolean }>`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  color: white;
  font-size: 1.5rem;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
  }

  ${(props) =>
		props.$hasUnread &&
		css`
			animation: ${pulse} 2s ease-in-out infinite;
		`}
`;

export const NotificationBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  padding: 0 6px;
  animation: ${bounce} 1s ease-in-out infinite;
`;

export const NotificationPanel = styled.div<{ $open?: boolean }>`
  position: fixed;
  right: 2rem;
  bottom: 5rem;
  width: 420px;
  max-height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  display: ${(props) => (props.$open ? "flex" : "none")};
  flex-direction: column;
  z-index: 999;
  overflow: hidden;
`;

export const NotificationPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const NotificationCloseBtn = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const NotificationPanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 4px;

    &:hover {
      background: #5568d3;
    }
  }
`;

export const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: visible;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const NotificationItem = styled.div<{ $unread?: boolean }>`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: ${(props) => (props.$unread ? "#eff6ff" : "#f9fafb")};
  border: 1px solid ${(props) => (props.$unread ? "#3b82f6" : "#e5e7eb")};
  border-left: 4px solid ${(props) => (props.$unread ? "#3b82f6" : "transparent")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #667eea;
    transform: scaleY(${(props) => (props.$unread ? 1 : 0)});
    transition: transform 0.2s ease;
  }

  &:hover {
    background: #f0f4ff;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);

    &::before {
      transform: scaleY(1);
    }
  }
`;

export const NotificationIcon = styled.div`
  font-size: 0.9rem;
  color: #667eea;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
`;

export const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const NotificationTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NotificationMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

export const NotificationSection = styled.span`
  font-weight: 500;
  color: #667eea;
`;

export const NotificationTime = styled.span`
  flex-shrink: 0;
`;

// Dashboard Header (unused but kept for compatibility)
export const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1.75rem 2rem;
  background: #667eea;
  color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  margin-bottom: 1.5rem;
`;

export const DashboardTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  text-align: left;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const DashboardSubtitle = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
  text-align: left;
  line-height: 1.5;
`;
