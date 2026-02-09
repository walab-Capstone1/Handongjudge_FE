import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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

export const LoadingText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 1rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
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

export const CopyButton = styled.button`
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
`;

// Sections Grid
export const SectionsGrid = styled.div`
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 0.75rem !important;
  margin-bottom: 2rem;
  align-content: start;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr !important;
  }
`;

// Course Card
export const CourseCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1rem;
  min-height: auto;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f3f5;
  overflow: visible;
  min-width: 0;
`;

export const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  overflow: visible;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatusBadge = styled.span<{ $active?: boolean }>`
  flex-shrink: 0;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: ${(props) => (props.$active ? "#dbeafe" : "#f3f4f6")};
  color: ${(props) => (props.$active ? "#1e40af" : "#6b7280")};
`;

export const StatsCompact = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 0.75rem;
  padding: 0.25rem 0;
  overflow: visible;
  min-width: 0;
`;

export const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #64748b;
  min-width: 0;
  overflow: visible;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const StatLabel = styled.span`
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: normal;
  min-width: 42px;
  text-align: left;
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const StatValue = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: normal;
  flex: 1;
  text-align: left;
  word-break: break-word;
  overflow-wrap: break-word;
  min-width: 0;
`;

export const ActionsCompact = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f3f5;
  align-items: center;
  overflow: visible;
  flex-wrap: wrap;
  min-width: 0;
`;

export const ToggleButton = styled.button<{ $active?: boolean }>`
  flex-shrink: 0;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 70px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  background: ${(props) => (props.$active ? "#667eea" : "#f3f4f6")};
  border-color: ${(props) => (props.$active ? "#667eea" : "#d1d5db")};
  color: ${(props) => (props.$active ? "white" : "#6b7280")};

  &:hover {
    background: ${(props) => (props.$active ? "#5568d3" : "#e5e7eb")};
    border-color: ${(props) => (props.$active ? "#5568d3" : "#9ca3af")};
  }
`;

export const ActionButtonsCompact = styled.div`
  display: flex;
  gap: 0.375rem;
  flex: 1;
  justify-content: flex-end;
`;

export const ActionButton = styled.button<{
	$primary?: boolean;
	$delete?: boolean;
}>`
  min-width: 48px;
  height: 36px;
  padding: 0.375rem 0.625rem;
  border: 1px solid ${(props) => (props.$primary ? "#667eea" : props.$delete ? "#ef4444" : "#e5e7eb")};
  background: ${(props) => (props.$primary ? "#667eea" : props.$delete ? "#ef4444" : "white")};
  color: ${(props) => (props.$primary || props.$delete ? "white" : "#64748b")};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: ${(props) =>
			props.$primary ? "#5568d3" : props.$delete ? "#dc2626" : "#f8f9ff"};
    border-color: ${(props) =>
			props.$primary ? "#5568d3" : props.$delete ? "#dc2626" : "#667eea"};
    color: ${(props) => (props.$primary || props.$delete ? "white" : "#667eea")};
    transform: translateY(-1px);
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownToggle = styled.button`
  min-width: 36px;
  height: 36px;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0.375rem 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #f8f9ff;
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-1px);
  }
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 100px;
  overflow: hidden;
`;

export const DropdownItem = styled.button<{ $delete?: boolean }>`
  display: block;
  width: 100%;
  padding: 0.625rem 1rem;
  text-align: left;
  background: white;
  border: none;
  color: ${(props) => (props.$delete ? "#dc2626" : "#64748b")};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: ${(props) => (props.$delete ? "#fee2e2" : "#f9fafb")};
    color: ${(props) => (props.$delete ? "#b91c1c" : "#1e293b")};
  }
`;

export const NoSections = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  color: #6b7280;

  p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
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

export const ModalContent = styled.div<{ $large?: boolean; $view?: boolean }>`
  background: white;
  border-radius: 16px;
  width: ${(props) => (props.$large ? "63vw" : "90%")};
  max-width: ${(props) => (props.$large ? "63vw" : props.$view ? "700px" : "600px")};
  min-width: ${(props) => (props.$large ? "600px" : "auto")};
  max-height: ${(props) => (props.$view ? "calc(85vh - 65px)" : "calc(90vh - 65px)")};
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideInUp} 0.3s ease;
  margin-top: 0;
  display: ${(props) => (props.$large ? "flex" : "block")};
  flex-direction: ${(props) => (props.$large ? "column" : "initial")};
  position: relative;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #667eea;
  /* linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  color: white;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #000000;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const ModalClose = styled.button`
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

export const ModalBody = styled.div<{ $large?: boolean }>`
  padding: 2rem;
  flex: ${(props) => (props.$large ? "1" : "initial")};
  overflow-y: ${(props) => (props.$large ? "auto" : "visible")};
  overflow-x: ${(props) => (props.$large ? "hidden" : "visible")};
  min-height: ${(props) => (props.$large ? "0" : "auto")};
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
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #e1e8ed !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

export const FormSelect = styled.select`
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
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

// Step Content
export const StepContent = styled.div`
  padding: 1rem 0;
`;

export const StepTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StepDescription = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  line-height: 1.6;
`;

export const StepHighlight = styled.strong`
  color: #667eea;
  font-weight: 600;
  display: block;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f0f4ff;
  border-left: 3px solid #667eea;
  border-radius: 4px;
`;

// Checkbox
export const CheckboxLabel = styled.label<{
	$large?: boolean;
	$item?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  
  ${(props) =>
		props.$large &&
		`
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }
  `}
  
  ${(props) =>
		props.$item &&
		`
    flex: 1;
    min-width: 0;
  `}

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #667eea;
    flex-shrink: 0;
  }

  input[type="checkbox"]:checked {
    background-color: #667eea;
    border-color: #667eea;
  }
`;

export const CheckboxContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const CheckboxTitle = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
  color: #1e293b;
`;

export const CheckboxDescription = styled.span`
  font-size: 0.85rem;
  color: #64748b;
`;

// Selection Box
export const SelectionBoxLarge = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
`;

export const SelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const ItemCount = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ItemListLarge = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: ${(props) => (props.$compact ? "350px" : "400px")};
  overflow-y: auto;
  padding-right: 0.5rem;
`;

export const ListItemLarge = styled.div<{ $selected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: ${(props) => (props.$selected ? "#f0f4ff" : "#f9fafb")};
  border: 2px solid ${(props) => (props.$selected ? "#667eea" : "#e5e7eb")};
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  gap: 1rem;
  opacity: ${(props) => (props.$selected ? "1" : "0.7")};
  box-shadow: ${(props) => (props.$selected ? "0 2px 8px rgba(102, 126, 234, 0.15)" : "none")};

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }

  ${(props) =>
		props.$selected &&
		`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #667eea;
      border-radius: 8px 0 0 8px;
    }
  `}
`;

export const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const ItemTitleLarge = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ItemMeta = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const BtnView = styled.button`
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

export const BtnEdit = styled.button`
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
`;

export const BtnExpand = styled.button`
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
  white-space: nowrap;

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
  }
`;

// Edit Form
export const EditForm = styled.div<{ $inline?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: ${(props) => (props.$inline ? "100%" : "auto")};
  ${(props) => props.$inline && "grid-column: 1 / -1;"}
`;

export const EditFormActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
`;

export const EditInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #e1e8ed !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

export const EditTextarea = styled.textarea`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #e1e8ed !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

export const BtnSaveEdit = styled.button`
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  align-self: flex-start;

  &:hover {
    background: #059669;
  }
`;

// Assignment
export const AssignmentListLarge = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

export const AssignmentItemLarge = styled.div<{ $selected?: boolean }>`
  border: 2px solid ${(props) => (props.$selected ? "#667eea" : "#e5e7eb")};
  border-radius: 8px;
  padding: 1rem;
  background: ${(props) => (props.$selected ? "#f0f4ff" : "#f9fafb")};
  transition: all 0.2s ease;
  position: relative;
  opacity: ${(props) => (props.$selected ? "1" : "0.7")};
  box-shadow: ${(props) => (props.$selected ? "0 2px 8px rgba(102, 126, 234, 0.15)" : "none")};

  ${(props) =>
		props.$selected &&
		`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #667eea;
      border-radius: 8px 0 0 8px;
    }
  `}
`;

export const AssignmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const AssignmentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
`;

export const AssignmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

export const AssignmentTitle = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const AssignmentMeta = styled.span`
  font-size: 0.875rem;
  color: #64748b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

// Problems
export const ProblemsList = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

export const ProblemsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const ProblemItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: ${(props) => (props.$selected ? "#f0f4ff" : "#f9fafb")};
  border: 2px solid ${(props) => (props.$selected ? "#667eea" : "#e5e7eb")};
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  position: relative;
  gap: 0.75rem;
  opacity: ${(props) => (props.$selected ? "1" : "0.6")};
  box-shadow: ${(props) => (props.$selected ? "0 1px 4px rgba(102, 126, 234, 0.1)" : "none")};

  ${(props) =>
		props.$selected &&
		`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: #667eea;
      border-radius: 6px 0 0 6px;
    }
  `}
`;

export const ProblemInfo = styled.div`
  flex: 1;
`;

export const ProblemTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

// Loading & Empty
export const LoadingItems = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NoItems = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

// Summary
export const SummaryBox = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f9fafb;
`;

export const SummaryItem = styled.div`
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #1e293b;
    margin-right: 0.5rem;
  }
`;

// Notice View
export const NoticeView = styled.div`
  padding: 1rem 0;
`;

export const NoticeViewTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NoticeViewMeta = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NoticeViewContent = styled.div`
  font-size: 1rem;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  min-height: 200px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const NoticeViewActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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

export const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f3f5;
`;

export const CourseTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const CourseInfo = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  line-height: 1.6;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const SectionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const SectionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding: 0.5rem 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  span:first-child {
    color: #64748b;
    font-weight: 500;
  }

  span:last-child {
    color: #1e293b;
    font-weight: 600;
  }
`;

export const Badge = styled.span`
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;
