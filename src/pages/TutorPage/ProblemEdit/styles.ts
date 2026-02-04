import styled, { createGlobalStyle, keyframes } from "styled-components";

/* 모달 열림 시 input focus 스타일 무시 (Tutor 규칙) */
export const ProblemEditGlobalStyle = createGlobalStyle`
  body.section-modal-open .problem-edit input:focus {
    outline: none !important;
    border-color: #e1e8ed !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

export const Container = styled.div`
  padding: 0;
`;

export const Step = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

export const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const Form = styled.form`
  margin-top: 2rem;
`;

export const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
`;

export const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const FileUploadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const FileLabelInline = styled.label`
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  color: #475569;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

export const HelpText = styled.span`
  color: #64748b;
  font-size: 0.85rem;
`;

export const DescriptionSection = styled.div`
  grid-column: 1 / -1;
`;

export const DescriptionEditor = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #f8fafc;
`;

export const EditorToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;

  button {
    padding: 0.4rem 0.8rem;
    border: 1px solid #cbd5e1;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  }
`;

export const ToolbarDivider = styled.div`
  width: 1px;
  background: #cbd5e1;
  margin: 0 0.5rem;
`;

export const ColorWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const ColorLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  background: white;
  color: #475569;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #1e293b;
  }
`;

export const ColorPicker = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
`;

export const TextEditor = styled.div`
  padding: 1rem;
  min-height: 300px;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
  background: white;
  white-space: pre-wrap;
  word-wrap: break-word;

  &:empty::before {
    content: attr(data-placeholder);
    color: #94a3b8;
    pointer-events: none;
  }
`;

export const Textarea = styled.textarea`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.6;
  resize: vertical;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Preview = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
`;

export const PreviewHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 500;
  font-size: 0.875rem;
  color: #64748b;
`;

export const PreviewContent = styled.div`
  padding: 1rem;
  overflow-y: visible;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

export const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #fecaca;
`;

export const TagInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const TagAddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #5568d3;
  }
`;

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: #eef2ff;
  color: #667eea;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const TagRemove = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
    color: #5568d3;
  }
`;

export const SampleItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

export const SampleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #334155;
`;

export const SampleRemove = styled.button`
  padding: 0.4rem 0.8rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #fecaca;
  }
`;

export const SampleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const SampleLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
`;

export const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  width: 100%;

  &:hover {
    border-color: #667eea;
    background: #f8fafc;
  }
`;

export const TestcaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const TestcaseItemCompact = styled.div`
  background: #fff;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  margin-bottom: 8px;
  overflow: hidden;
`;

export const TestcaseHeaderCompact = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e1e8ed;
`;

export const TestcaseHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TestcaseName = styled.span`
  font-weight: 600;
  font-size: 0.875rem;
  color: #334155;
  min-width: 100px;
`;

export const TestcaseTypeSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
`;

export const TestcaseTypeBadge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #e2e8f0;
  color: #475569;
`;

export const TestcaseRemoveBtn = styled.button`
  padding: 4px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #fecaca;
  }
`;

export const TestcaseBodyCompact = styled.div`
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TestcaseContentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TestcaseContentLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TestcaseContentText = styled.pre`
  margin: 0;
  padding: 6px 8px;
  background: #f8fafc;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 80px;
  overflow-y: auto;
  color: #334155;
  line-height: 1.4;
`;

export const ParsedSection = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
`;

export const ParsedToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
`;

export const ParsedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const BackButton = styled.button`
  background: #475569;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  min-height: 40px;
  text-decoration: none;
  appearance: none;

  &:hover {
    background: #334155;
    border-color: #1e293b;
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ConvertButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 40px;
  white-space: nowrap;

  &:hover {
    background: #5568d3;
  }
`;

export const SubmitButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

/* ProblemPreview 전용 (ProblemPreview.tsx에서 사용) */
export const PreviewWrapper = styled.div`
  width: 100%;
`;

export const PreviewEmpty = styled.div`
  color: #94a3b8;
  font-style: italic;
  padding: 2rem;
  text-align: center;
`;

export const PreviewTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #667eea;
`;

export const PreviewDescription = styled.div`
  margin-bottom: 2rem;
  line-height: 1.7;
  color: #475569;

  p {
    margin: 0.75rem 0;
  }
`;

export const PreviewSection = styled.div`
  margin-top: 2rem;
`;

export const PreviewContentText = styled.div`
  margin-top: 0.5rem;
`;

export const PreviewH1 = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

export const PreviewH2 = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

export const PreviewH3 = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
`;

export const PreviewParagraph = styled.p`
  margin: 0.75rem 0;
  color: #475569;
  line-height: 1.7;
`;

export const PreviewInlineCode = styled.code`
  background: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.9em;
  color: #dc2626;
  border: 1px solid #e2e8f0;
`;

export const PreviewCodeBlock = styled.pre`
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
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.9em;
    white-space: pre;
    display: block;
  }
`;

export const PreviewExample = styled.div`
  margin-top: 0.5rem;
`;

export const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: none;
  padding: 0;
  margin: 0;
  min-width: 0;
`;

export const Legend = styled.legend`
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
`;
