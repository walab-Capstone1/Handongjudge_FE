import styled from "styled-components";

export const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
`;

export const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  flex: 1;
  min-width: 0;
`;

export const EditMetaButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f5f3ff;
  }
`;

export const Description = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
`;

export const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
  }
`;

export const ProblemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

export const ProblemCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export const ProblemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

export const ProblemInfo = styled.div`
  flex: 1;
`;

export const ProblemTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

export const ProblemMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const Badge = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
`;

export const RemoveButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #dc2626;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

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

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

export const ModalContentCompact = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 520px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 120px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const ModalLoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.9rem;
`;

/* 문제 추가 모달 — 2열(문제집 만들기 스타일) + 넓은 폭 */
export const AddProblemModalOuter = styled.div`
  background: #f1f5f9;
  border-radius: 12px;
  width: min(1180px, 96vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

export const AddModalBodyTwoCol = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem 0.5rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  align-items: stretch;
`;

export const AddModalRightPanel = styled.div`
  flex: 1 1 420px;
  min-width: min(320px, 100%);
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.125rem 1.25rem;
  box-sizing: border-box;
`;

export const SectionSegment = styled.div`
  display: flex;
  border-radius: 10px;
  background: #e2e8f0;
  padding: 4px;
  gap: 4px;
  margin-bottom: 1rem;
`;

export const SectionTab = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 0.6rem 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  background: ${(p) => (p.$active ? "white" : "transparent")};
  color: ${(p) => (p.$active ? "#4338ca" : "#64748b")};
  box-shadow: ${(p) =>
		p.$active ? "0 1px 3px rgba(0,0,0,0.08)" : "none"};

  &:hover {
    color: ${(p) => (p.$active ? "#4338ca" : "#334155")};
  }
`;

export const AddModalSearchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: center;
`;

export const AddModalSearchInput = styled.input`
  flex: 1 1 200px;
  min-width: 0;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const AddModalOriginalSelect = styled.select`
  padding: 0.65rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;
  cursor: pointer;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const AddModalListWhite = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  max-height: min(380px, 42vh);
  overflow-y: auto;
`;

export const AddProblemModalInner = styled.div`
  padding: 0 2rem 1.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
`;

export const AddProblemModalHeaderBar = styled.div`
  padding: 1.5rem 2rem 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
`;

export const FilterTabGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.625rem 1.125rem;
  background: ${(p) => (p.$active ? "#667eea" : "#f8fafc")};
  border: 2px solid ${(p) => (p.$active ? "#667eea" : "#e2e8f0")};
  color: ${(p) => (p.$active ? "white" : "#475569")};
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: #667eea;
    ${(p) => !p.$active && "color: #667eea;"}
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const AddProblemToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

export const MetaText = styled.span`
  color: #64748b;
  font-size: 0.875rem;
`;

export const AddProblemListBox = styled.div`
  max-height: min(400px, 42vh);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const AddProblemCard = styled.div<{
  $selected: boolean;
  $disabled: boolean;
}>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 2px solid
    ${(p) =>
      p.$disabled ? "#e2e8f0" : p.$selected ? "#667eea" : "#e2e8f0"};
  border-radius: 8px;
  background: ${(p) =>
    p.$disabled ? "#f8fafc" : p.$selected ? "#f5f3ff" : "white"};
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(p) => (p.$disabled ? 0.75 : 1)};
  transition: all 0.2s ease;

  &:hover {
    ${(p) =>
      !p.$disabled &&
      `
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    `}
  }

  input[type="checkbox"] {
    width: 1.125rem;
    height: 1.125rem;
    accent-color: #667eea;
    margin-top: 0.15rem;
    flex-shrink: 0;
    cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  }
`;

export const AddProblemCardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AddProblemCardTitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
`;

export const AddIdBadge = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-weight: 600;
`;

export const AddProblemTitleText = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
`;

export const AddedPill = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  background: #e2e8f0;
  color: #64748b;
  border-radius: 6px;
  font-weight: 500;
`;

export const DiffPill = styled.span<{ $bg: string; $color: string }>`
  font-size: 0.75rem;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-weight: 600;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

export const EmptyProblemsHint = styled.div`
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
`;

export const AddModalFooterBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: white;
  flex-shrink: 0;
`;

export const PaginationBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const SelectAllButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #667eea;
    color: #667eea;
  }

  &.active {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

export const CancelButton = styled.button`
  padding: 0.75rem 2rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
`;

export const SubmitButton = styled.button`
  padding: 0.75rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
