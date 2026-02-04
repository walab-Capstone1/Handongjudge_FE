import styled, { keyframes } from "styled-components";

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 2000px; }
`;

export const ProblemCreateContainer = styled.div`
  padding: 0;
`;

export const ProblemCreateStep = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
`;

export const ProblemCreateFileInput = styled.input`
  display: none;
`;

export const ProblemCreateFileUploadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ProblemCreateFileLabelInline = styled.label`
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

export const ProblemCreateHelpText = styled.span`
  color: #64748b;
  font-size: 0.85rem;
`;

export const ProblemCreateForm = styled.form`
  margin-top: 2rem;
`;

export const ProblemCreateFormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ProblemCreateFormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
`;

export const ProblemCreateFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ProblemCreateLabel = styled.label`
  font-weight: 500;
  color: #334155;
  font-size: 0.95rem;
`;

export const ProblemCreateInput = styled.input`
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

export const ProblemCreateDescriptionSection = styled.div`
  grid-column: 1 / -1;
`;

export const ProblemCreateDescriptionEditor = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

export const ProblemCreateEditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #f8fafc;
`;

export const ProblemCreateEditorToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;
  select, button {
    padding: 0.4rem 0.8rem;
    border: 1px solid #cbd5e1;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  select:hover, button:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }
`;

export const ProblemCreateHeadingSelect = styled.select`
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

export const ProblemCreateTextEditor = styled.div`
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
  &[contenteditable]:empty::before {
    content: attr(data-placeholder);
    color: #94a3b8;
    pointer-events: none;
  }
`;

export const ProblemCreateToolbarDivider = styled.span`
  width: 1px;
  background: #cbd5e1;
  margin: 0 0.5rem;
`;

export const ProblemCreateRemoveZipBtn = styled.button`
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

export const ProblemCreateColorWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const ProblemCreateColorLabel = styled.label`
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

export const ProblemCreateColorPicker = styled.input`
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
`;

export const ProblemCreateTextarea = styled.textarea`
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

export const ProblemCreatePreview = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
`;

export const ProblemCreatePreviewHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 500;
  font-size: 0.875rem;
  color: #64748b;
`;

export const ProblemCreatePreviewContent = styled.div`
  padding: 1rem;
  overflow-y: visible;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #334155;
`;

export const ProblemPreviewWrapper = styled.div`
  width: 100%;
`;

export const ProblemPreviewEmpty = styled.div`
  color: #94a3b8;
  font-style: italic;
  padding: 2rem;
  text-align: center;
`;

export const ProblemPreviewTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #667eea;
`;

export const ProblemPreviewDescription = styled.div`
  margin-bottom: 2rem;
  line-height: 1.7;
  color: #475569;
  p { margin: 0.75rem 0; }
  strong, b { font-weight: 600; color: #1e293b; }
  em, i { font-style: italic; }
  u { text-decoration: underline; }
  ul, ol { margin: 0.75rem 0; padding-left: 2rem; }
  li { margin: 0.5rem 0; }
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

export const ProblemPreviewSection = styled.div`
  margin-top: 2rem;
`;

export const ProblemPreviewContentText = styled.div`
  margin-top: 0.5rem;
`;

export const ProblemPreviewH2 = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

export const ProblemPreviewH3 = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #334155;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
`;

export const ProblemPreviewParagraph = styled.p`
  margin: 0.75rem 0;
  color: #475569;
  line-height: 1.7;
`;

export const ProblemPreviewInlineCode = styled.code`
  background: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  color: #dc2626;
  border: 1px solid #e2e8f0;
`;

export const ProblemPreviewCodeBlock = styled.pre`
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

export const ProblemCreateActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
`;

export const AdminErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  border: 1px solid #fecaca;
`;

export const ProblemCreateTagInputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ProblemCreateTagAddBtn = styled.button`
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

export const ProblemCreateTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const ProblemCreateTag = styled.span`
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

export const ProblemCreateTagRemove = styled.button`
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

export const ProblemCreateSampleItem = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

export const ProblemCreateSampleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #334155;
`;

export const ProblemCreateSampleRemove = styled.button`
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

export const ProblemCreateSampleGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const ProblemCreateSampleLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
`;

export const ProblemCreateAddBtn = styled.button`
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

export const ProblemCreateTestcaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

export const ProblemCreateTestcaseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
`;

export const ProblemCreateTestcaseRemove = styled.button`
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

export const ProblemCreateParsedTestcasesSection = styled.div`
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
`;

export const ProblemCreateParsedTestcasesToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s ease;
  text-align: left;
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  span:first-child {
    font-size: 0.8rem;
    color: #64748b;
    transition: transform 0.2s ease;
    display: inline-block;
    width: 1rem;
  }
`;

export const ProblemCreateParsedTestcases = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.75rem;
  animation: ${slideDown} 0.2s ease;
  overflow: hidden;
`;

export const ProblemCreateParsedTestcaseItem = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  overflow: hidden;
`;

export const ProblemCreateParsedTestcaseHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #e2e8f0;
  border-bottom: 1px solid #cbd5e1;
  font-size: 0.9rem;
  color: #475569;
`;

export const ProblemCreateParsedTestcaseContent = styled.div`
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

export const ProblemEditBtnBack = styled.button`
  background: #f8fafc !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;
  padding: 0.75rem 1.5rem !important;
  font-size: 0.95rem !important;
  color: #475569 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 600 !important;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  min-height: 40px !important;
  text-decoration: none !important;
  appearance: none !important;
  &:hover {
    background: #e2e8f0 !important;
    border-color: #cbd5e1 !important;
    color: #1e293b !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  }
  &:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
    background: #f3f4f6 !important;
  }
`;

export const ProblemEditConvertBtn = styled.button`
  background: #3b82f6 !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.75rem 1.5rem !important;
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
  min-height: 40px !important;
  text-decoration: none !important;
  appearance: none !important;
  margin-left: 16px !important;
  white-space: nowrap !important;
  &:hover {
    background: #2563eb !important;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
    transform: translateY(-1px) !important;
  }
`;
