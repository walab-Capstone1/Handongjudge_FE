import styled from "styled-components";

/* Page container - .problem-create */
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

/* Header */
export const PageHeader = styled.div`
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  margin-bottom: 2rem !important;
`;

export const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

export const CancelHeaderButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  color: #475569;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }
`;

/* Error */
export const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #fecaca;
`;

export const RequiredMessage = styled.p`
  margin: 0 0 1rem 0;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
`;

/* Form */
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

/* File upload */
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

export const RemoveZipButton = styled.button`
  padding: 0.3rem 0.6rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  transition: all 0.2s ease;
  font-weight: bold;

  &:hover {
    background: #b91c1c;
    transform: scale(1.1);
  }
`;

/* Tags */
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

/* Description section & editor */
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
`;

export const HeadingSelect = styled.select`
  padding: 0.4rem 0.8rem;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
`;

export const ToolbarDivider = styled.div`
  width: 1px;
  background: #cbd5e1;
  margin: 0 0.5rem;
`;

export const ToolbarButton = styled.button`
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

/* Preview */
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

/* Problem preview (right panel) */
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
  strong, b {
    font-weight: 600;
    color: #1e293b;
  }
  em, i {
    font-style: italic;
  }
  u {
    text-decoration: underline;
  }
  ul, ol {
    margin: 0.75rem 0;
    padding-left: 2rem;
  }
  li {
    margin: 0.5rem 0;
  }
  blockquote {
    margin: 1rem 0;
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-left: 4px solid #667eea;
    border-radius: 4px;
    font-style: italic;
    color: #64748b;
  }
`;

export const PreviewSection = styled.div`
  margin-top: 2rem;
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

export const PreviewContentText = styled.div`
  margin-top: 0.5rem;
`;

export const PreviewParagraph = styled.p`
  margin: 0.75rem 0;
  color: #475569;
  line-height: 1.7;
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
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
    white-space: pre;
    display: block;
  }
`;

export const PreviewExample = styled.div`
  margin-bottom: 1rem;
`;

/* Sample I/O */
export const SampleItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

export const SampleItemHeader = styled.div`
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

export const AddSampleButton = styled.button`
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

/* Testcases */
export const TestcaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const TestcaseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
`;

export const TestcaseRemove = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
    color: #b91c1c;
  }
`;

/* Parsed testcases */
export const ParsedTestcasesSection = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
`;

export const ParsedTestcasesToggle = styled.button`
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

export const ParsedTestcasesToggleIcon = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  transition: transform 0.2s ease;
  display: inline-block;
  width: 1rem;
`;

export const ParsedTestcases = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  overflow: hidden;
`;

export const ParsedTestcaseItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
`;

export const ParsedTestcaseHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #e2e8f0;
  border-bottom: 1px solid #cbd5e1;
  font-size: 0.9rem;
  color: #475569;
`;

export const ParsedTestcaseContent = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  > div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  strong {
    color: #1e293b;
    font-size: 0.9rem;
  }
  pre {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 0.75rem;
    margin: 0;
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-height: 200px;
    overflow-y: auto;
    color: #334155;
  }
`;

/* Actions */
export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

export const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SubmitButton = styled.button`
  padding: 0.875rem 1.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    background: #5568d3;
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

/* Inline flex for file row */
export const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

/* Aliases for ProblemSolvePage and other consumers */
export const Title = PageTitle;
export const Header = PageHeader;
export const FormGroup = FormSection;
