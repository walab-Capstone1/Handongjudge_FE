import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import { markdownToHtml } from "../../utils/markdownToHtml";
import ReactMarkdown from "react-markdown";
import "./ProblemCreate.css";

// 미리보기 컴포넌트 (ProblemCreate와 동일)
const ProblemPreview = ({ title, description, inputFormat, outputFormat, sampleInputs }) => {
  const hasContent = description || inputFormat || outputFormat || 
                     (sampleInputs && sampleInputs.some(s => s.input || s.output));

  if (!hasContent) {
    return <div className="problem-preview-empty">문제 설명을 입력하세요</div>;
  }

  return (
    <div className="problem-preview-wrapper">
      {/* 문제 제목 */}
      {title && (
        <h1 className="problem-preview-title">{title}</h1>
      )}
      
      {/* 문제 설명 (마크다운 렌더링) */}
      {description && (
        <div className="problem-preview-description">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="problem-preview-h1" {...props} />,
              h2: ({node, ...props}) => <h2 className="problem-preview-h2" {...props} />,
              h3: ({node, ...props}) => <h3 className="problem-preview-h3" {...props} />,
              code: ({node, inline, className, children, ...props}) => {
                return inline ? (
                  <code className="problem-preview-inline-code" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="problem-preview-code-block">
                    <code {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              p: ({node, ...props}) => <p className="problem-preview-paragraph" {...props} />,
              hr: ({node, ...props}) => <hr className="problem-preview-hr" {...props} />,
            }}
          >
            {description}
          </ReactMarkdown>
        </div>
      )}
      
      {/* 입력 형식 */}
      {inputFormat && (
        <div className="problem-preview-section">
          <h2 className="problem-preview-h2">입력 형식</h2>
          <div className="problem-preview-content-text">
            {inputFormat.split('\n').map((line, idx) => (
              <p key={idx} className="problem-preview-paragraph">{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* 출력 형식 */}
      {outputFormat && (
        <div className="problem-preview-section">
          <h2 className="problem-preview-h2">출력 형식</h2>
          <div className="problem-preview-content-text">
            {outputFormat.split('\n').map((line, idx) => (
              <p key={idx} className="problem-preview-paragraph">{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* 예제 입출력 */}
      {sampleInputs && sampleInputs.some(s => s.input || s.output) && (
        <div className="problem-preview-section">
          <h2 className="problem-preview-h2">예제</h2>
          {sampleInputs.map((sample, idx) => {
            if (!sample.input && !sample.output) return null;
            return (
              <div key={idx} className="problem-preview-example">
                <h3 className="problem-preview-h3">예제 입력 {idx + 1}</h3>
                <pre className="problem-preview-code-block">
                  <code>{sample.input || ''}</code>
                </pre>
                <h3 className="problem-preview-h3">예제 출력 {idx + 1}</h3>
                <pre className="problem-preview-code-block">
                  <code>{sample.output || ''}</code>
                </pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProblemEdit = () => {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const descriptionRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    description: '', // HTML 형식
    descriptionText: '', // 텍스트 형식 (백엔드 전송용)
    inputFormat: '',
    outputFormat: '',
    tags: [],
    difficulty: '1',
    timeLimit: '',
    memoryLimit: '',
    sampleInputs: [{ input: '', output: '' }],
    testcases: []
  });

  const [currentTag, setCurrentTag] = useState('');
  const [originalTimeLimit, setOriginalTimeLimit] = useState('');
  const [originalMemoryLimit, setOriginalMemoryLimit] = useState('');

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  // 초기 로드 시에만 descriptionRef에 내용 설정
  useEffect(() => {
    if (descriptionRef.current && formData.description && isInitialLoad && !loading) {
      const isHTML = /<[^>]+>/.test(formData.description);
      if (isHTML) {
        descriptionRef.current.innerHTML = formData.description;
      } else {
        // 마크다운 텍스트를 그대로 넣기 (줄바꿈 보존)
        descriptionRef.current.textContent = formData.descriptionText || formData.description;
      }
      setIsInitialLoad(false);
    }
  }, [formData.description, formData.descriptionText, loading, isInitialLoad]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setIsInitialLoad(true);
      
      // 1. 기본 문제 정보 조회
      const response = await APIService.getProblemInfo(problemId);
      const problem = response?.data || response;
      
      // 2. ZIP 파일 파싱하여 테스트 케이스 등 상세 정보 가져오기
      let parsedData = null;
      try {
        parsedData = await APIService.parseProblemZip(problemId);
        console.log('ZIP 파싱 결과:', parsedData);
        console.log('테스트케이스:', parsedData?.testCases || parsedData?.testcases);
      } catch (err) {
        console.warn('ZIP 파일 파싱 실패 (계속 진행):', err);
        // ZIP 파싱 실패해도 기본 정보는 사용 가능
      }
      
      // 전체 description을 그대로 사용 (parsedData 우선, 없으면 problem에서)
      const description = parsedData?.description || problem.description || '';
      
      // HTML 태그가 있으면 제거하고 텍스트만 가져오기
      const descriptionText = description.replace(/<[^>]*>/g, '') || description;
      
      // timeLimit과 memoryLimit 처리 (parsedData 우선, 없으면 problem에서)
      let timeLimit = '';
      if (parsedData?.timeLimit != null) {
        timeLimit = String(parsedData.timeLimit);
      } else if (problem.timeLimit != null && problem.timeLimit !== undefined) {
        const timeLimitValue = Number(problem.timeLimit);
        if (!isNaN(timeLimitValue) && timeLimitValue > 0) {
          timeLimit = String(timeLimitValue);
        }
      }
      
      let memoryLimit = '';
      if (parsedData?.memoryLimit != null) {
        memoryLimit = String(parsedData.memoryLimit);
      } else if (problem.memoryLimit != null && problem.memoryLimit !== undefined) {
        const memoryLimitValue = Number(problem.memoryLimit);
        if (!isNaN(memoryLimitValue) && memoryLimitValue > 0) {
          memoryLimit = String(memoryLimitValue);
        }
      }
      
      // 기존 값 저장
      setOriginalTimeLimit(timeLimit);
      setOriginalMemoryLimit(memoryLimit);
      
      // 태그 파싱 (parsedData 우선, 없으면 problem에서)
      let tags = [];
      if (parsedData?.tags) {
        if (typeof parsedData.tags === 'string') {
          try {
            const parsedTags = JSON.parse(parsedData.tags);
            if (Array.isArray(parsedTags)) {
              tags = parsedTags.map(tag => tag && tag.trim()).filter(Boolean);
            } else if (parsedTags && parsedTags.trim()) {
              tags = [parsedTags.trim()];
            }
          } catch (e) {
            if (parsedData.tags.trim()) {
              tags = [parsedData.tags.trim()];
            }
          }
        } else if (Array.isArray(parsedData.tags)) {
          tags = parsedData.tags.map(tag => tag && tag.trim()).filter(Boolean);
        }
      } else if (problem.tags) {
        if (Array.isArray(problem.tags)) {
          tags = problem.tags.map(tag => tag && tag.trim()).filter(Boolean);
        } else if (typeof problem.tags === 'string') {
          try {
            const parsedTags = JSON.parse(problem.tags);
            if (Array.isArray(parsedTags)) {
              tags = parsedTags.map(tag => tag && tag.trim()).filter(Boolean);
            } else if (parsedTags && parsedTags.trim()) {
              tags = [parsedTags.trim()];
            }
          } catch (e) {
            if (problem.tags.trim()) {
              tags = [problem.tags.trim()];
            }
          }
        }
      }
      
      // 테스트 케이스에서 sample 타입만 필터링하여 예제 입출력으로 변환
      let sampleInputs = [{ input: '', output: '' }];
      if (parsedData) {
        const testCases = parsedData.testCases || parsedData.testcases || [];
        console.log('파싱된 테스트케이스:', testCases);
        
        if (testCases.length > 0) {
          const sampleTestCases = testCases.filter(tc => tc.type === 'sample');
          console.log('샘플 테스트케이스:', sampleTestCases);
          
          if (sampleTestCases.length > 0) {
            sampleInputs = sampleTestCases.map(tc => ({
              input: tc.input || '',
              output: tc.output || ''
            }));
          }
        }
      }
      
      setFormData({
        title: parsedData?.title || problem.title || '',
        description: description,
        descriptionText: descriptionText,
        inputFormat: '', // 기존 문제 수정 시에는 비워둠
        outputFormat: '', // 기존 문제 수정 시에는 비워둠
        tags: tags,
        difficulty: parsedData?.difficulty || problem.difficulty?.toString() || '1',
        timeLimit: timeLimit,
        memoryLimit: memoryLimit,
        sampleInputs: sampleInputs, // 파싱된 예제 입출력 사용
        testcases: [] // 테스트케이스 파일은 표시하지 않음 (ZIP에 포함되어 있음)
      });
      
      // descriptionRef에 마크다운 텍스트 그대로 설정
      setTimeout(() => {
        if (descriptionRef.current) {
          const isHTML = /<[^>]+>/.test(description);
          if (isHTML) {
            descriptionRef.current.innerHTML = description;
          } else {
            descriptionRef.current.textContent = descriptionText;
          }
          setIsInitialLoad(false);
        }
      }, 200);
    } catch (err) {
      console.error('문제 조회 실패:', err);
      setError('문제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleZipFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setError('ZIP 파일만 업로드 가능합니다.');
      return;
    }

    setZipFile(file);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagAdd = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSampleInputChange = (index, field, value) => {
    const newSamples = [...formData.sampleInputs];
    newSamples[index][field] = value;
    setFormData(prev => ({ ...prev, sampleInputs: newSamples }));
  };

  const addSampleInput = () => {
    setFormData(prev => ({
      ...prev,
      sampleInputs: [...prev.sampleInputs, { input: '', output: '' }]
    }));
  };

  const removeSampleInput = (index) => {
    if (formData.sampleInputs.length > 1) {
      setFormData(prev => ({
        ...prev,
        sampleInputs: prev.sampleInputs.filter((_, i) => i !== index)
      }));
    }
  };

  const handleTestcaseAdd = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      testcases: [...prev.testcases, ...files]
    }));
  };

  const handleTestcaseRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      testcases: prev.testcases.filter((_, i) => i !== index)
    }));
  };

  const applyFormat = (command, value = null) => {
    if (descriptionRef.current) {
      descriptionRef.current.focus();
      document.execCommand(command, false, value);
    }
  };

  const insertText = (text) => {
    if (descriptionRef.current) {
      descriptionRef.current.focus();
      document.execCommand('insertText', false, text);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('description', getFullDescriptionForBackend());
      submitFormData.append('inputFormat', formData.inputFormat);
      submitFormData.append('outputFormat', formData.outputFormat);
      submitFormData.append('tags', JSON.stringify(formData.tags));
      submitFormData.append('difficulty', formData.difficulty);
      
      // timeLimit과 memoryLimit이 비어있으면 기존 값 사용, 그래도 없으면 최소값 설정
      const timeLimit = formData.timeLimit || originalTimeLimit || '1';
      const memoryLimit = formData.memoryLimit || originalMemoryLimit || '256';
      
      submitFormData.append('timeLimit', timeLimit);
      submitFormData.append('memoryLimit', memoryLimit);
      submitFormData.append('sampleInputs', JSON.stringify(formData.sampleInputs));
      
      // ZIP 파일 (선택적)
      if (zipFile) {
        submitFormData.append('zipFile', zipFile);
      }

      // 테스트케이스 파일들
      formData.testcases.forEach((file, index) => {
        submitFormData.append(`testcase_${index}`, file);
      });

      await APIService.updateProblem(problemId, submitFormData);
      
      alert('문제가 성공적으로 수정되었습니다.');
      navigate('/tutor/problems');
    } catch (err) {
      console.error('문제 수정 실패:', err);
      setError('문제 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFullDescription = () => {
    // 미리보기용 HTML 생성
    return {
      title: formData.title,
      description: formData.description || '',
      inputFormat: formData.inputFormat,
      outputFormat: formData.outputFormat,
      sampleInputs: formData.sampleInputs
    };
  };

  const getFullDescriptionForBackend = () => {
    // 백엔드 전송용 텍스트 생성 (마크다운 형식)
    let full = formData.descriptionText || '';
    
    if (formData.inputFormat) {
      full += '\n\n## 입력 형식\n' + formData.inputFormat;
    }
    
    if (formData.outputFormat) {
      full += '\n\n## 출력 형식\n' + formData.outputFormat;
    }
    
    if (formData.sampleInputs.some(s => s.input || s.output)) {
      full += '\n\n## 예제';
      formData.sampleInputs.forEach((sample, idx) => {
        if (sample.input || sample.output) {
          full += `\n\n### 예제 입력 ${idx + 1}\n\`\`\`\n${sample.input}\n\`\`\``;
          full += `\n\n### 예제 출력 ${idx + 1}\n\`\`\`\n${sample.output}\n\`\`\``;
        }
      });
    }
    
    return full;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="problem-create">
        <div className="admin-page-header">
          <h1 className="admin-page-title">문제 수정</h1>
          <button 
            className="admin-btn-secondary"
            onClick={() => navigate('/admin/problems')}
          >
            취소
          </button>
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="problem-create-form">
          <div className="problem-create-step">
            
            <div className="problem-create-form-grid">
              {/* 기본 정보 */}
              <div className="problem-create-form-section">
                <label className="problem-create-label">문제 제목 *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="problem-create-input"
                  required
                  placeholder="문제 제목을 입력하세요"
                />
              </div>

              <div className="problem-create-form-row">
                <div className="problem-create-form-section">
                  <label className="problem-create-label">난이도 *</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="problem-create-input"
                    required
                  >
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                  </select>
                </div>

                <div className="problem-create-form-section">
                  <label className="problem-create-label">태그</label>
                  <div className="problem-create-tag-input-wrapper">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      className="problem-create-input"
                      placeholder="태그 입력 후 Enter"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="problem-create-tag-add-btn"
                    >
                      추가
                    </button>
                  </div>
                  <div className="problem-create-tags">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="problem-create-tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="problem-create-tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="problem-create-form-row">
                <div className="problem-create-form-section">
                  <label className="problem-create-label">시간 제한 (초)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleInputChange}
                    className="problem-create-input"
                    min="0"
                    step="0.1"
                    placeholder="예: 2.0"
                  />
                </div>

                <div className="problem-create-form-section">
                  <label className="problem-create-label">메모리 제한 (MB)</label>
                  <input
                    type="number"
                    name="memoryLimit"
                    value={formData.memoryLimit}
                    onChange={handleInputChange}
                    className="problem-create-input"
                    min="0"
                    placeholder="예: 256"
                  />
                </div>
              </div>

              {/* ZIP 파일 (선택적) */}
              <div className="problem-create-form-section">
                <label className="problem-create-label">ZIP 파일 (선택사항)</label>
                <div className="problem-create-file-upload-wrapper">
                  <input
                    type="file"
                    id="zipFileInput"
                    accept=".zip"
                    onChange={handleZipFileChange}
                    className="problem-create-file-input"
                  />
                  <label htmlFor="zipFileInput" className="problem-create-file-label-inline">
                    {zipFile ? `✓ ${zipFile.name}` : 'ZIP 파일 선택'}
                  </label>
                  <span className="problem-create-help-text">
                    새 ZIP 파일을 업로드하면 기존 ZIP을 대체합니다 (선택사항)
                  </span>
                </div>
              </div>

              {/* 문제 설명 */}
              <div className="problem-create-form-section problem-create-description-section">
                <label className="problem-create-label">문제 설명 *</label>
                <div className="problem-create-description-editor">
                  <div className="problem-create-editor-wrapper">
                    <div className="problem-create-editor-toolbar">
                      <button type="button" onClick={() => applyFormat('bold')} title="Bold">
                        <strong>B</strong>
                      </button>
                      <button type="button" onClick={() => applyFormat('italic')} title="Italic">
                        <em>I</em>
                      </button>
                      <button type="button" onClick={() => applyFormat('underline')} title="Underline">
                        <u>U</u>
                      </button>
                      <div className="problem-create-toolbar-divider"></div>
                      <button type="button" onClick={() => applyFormat('insertUnorderedList')} title="Bullet List">
                        •
                      </button>
                      <button type="button" onClick={() => applyFormat('insertOrderedList')} title="Numbered List">
                        1.
                      </button>
                      <div className="problem-create-toolbar-divider"></div>
                      <button type="button" onClick={() => applyFormat('formatBlock', 'blockquote')} title="Quote">
                        "
                      </button>
                      <button type="button" onClick={() => {
                        insertText('```\n코드\n```');
                      }} title="Code Block">
                        &lt;&gt;
                      </button>
                      <div className="problem-create-toolbar-divider"></div>
                      <div className="problem-create-color-wrapper">
                        <label htmlFor="textColorPicker" className="problem-create-color-label" title="텍스트 색상">
                          <FaPalette />
                        </label>
                        <input
                          type="color"
                          id="textColorPicker"
                          onChange={(e) => applyFormat('foreColor', e.target.value)}
                          className="problem-create-color-picker"
                        />
                      </div>
                      <div className="problem-create-color-wrapper">
                        <label htmlFor="bgColorPicker" className="problem-create-color-label" title="배경 색상">
                          <FaHighlighter />
                        </label>
                        <input
                          type="color"
                          id="bgColorPicker"
                          onChange={(e) => applyFormat('backColor', e.target.value)}
                          className="problem-create-color-picker"
                        />
                      </div>
                    </div>
                    <div
                      ref={descriptionRef}
                      contentEditable
                      className="problem-create-text-editor"
                      onPaste={(e) => {
                        // 붙여넣기 이벤트 가로채기
                        e.preventDefault();
                        const paste = (e.clipboardData || window.clipboardData).getData('text');
                        const selection = window.getSelection();
                        if (!selection.rangeCount) return;
                        
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const textNode = document.createTextNode(paste);
                        range.insertNode(textNode);
                        range.collapse(false);
                        
                        // 상태 업데이트
                        const htmlContent = descriptionRef.current?.innerHTML || '';
                        const textContent = descriptionRef.current?.textContent || descriptionRef.current?.innerText || '';
                        setFormData(prev => ({ 
                          ...prev, 
                          description: htmlContent,
                          descriptionText: textContent 
                        }));
                      }}
                      onInput={(e) => {
                        const htmlContent = e.currentTarget?.innerHTML || '';
                        const textContent = e.currentTarget?.textContent || e.currentTarget?.innerText || '';
                        setFormData(prev => ({ 
                          ...prev, 
                          description: htmlContent,
                          descriptionText: textContent 
                        }));
                      }}
                      onBlur={(e) => {
                        const htmlContent = e.currentTarget?.innerHTML || '';
                        const textContent = e.currentTarget?.textContent || e.currentTarget?.innerText || '';
                        setFormData(prev => ({ 
                          ...prev, 
                          description: htmlContent,
                          descriptionText: textContent 
                        }));
                      }}
                      onKeyDown={(e) => {
                        // Ctrl+Z (또는 Cmd+Z on Mac) - Undo
                        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                          e.preventDefault();
                          document.execCommand('undo', false);
                        }
                        // Ctrl+Shift+Z (또는 Cmd+Shift+Z on Mac) - Redo
                        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                          e.preventDefault();
                          document.execCommand('redo', false);
                        }
                        // Ctrl+Y - Redo (alternative)
                        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                          e.preventDefault();
                          document.execCommand('redo', false);
                        }
                      }}
                      suppressContentEditableWarning={true}
                      data-placeholder="문제 설명을 입력하세요"
                    />
                  </div>
                  <div className="problem-create-preview">
                    <div className="problem-create-preview-header">미리보기</div>
                    <div className="problem-create-preview-content">
                      <ProblemPreview {...getFullDescription()} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 입력/출력 형식 */}
              <div className="problem-create-form-row">
                <div className="problem-create-form-section">
                  <label className="problem-create-label">입력 형식</label>
                  <textarea
                    name="inputFormat"
                    value={formData.inputFormat}
                    onChange={handleInputChange}
                    className="problem-create-textarea"
                    rows={4}
                    placeholder="입력 형식을 설명하세요"
                  />
                </div>

                <div className="problem-create-form-section">
                  <label className="problem-create-label">출력 형식</label>
                  <textarea
                    name="outputFormat"
                    value={formData.outputFormat}
                    onChange={handleInputChange}
                    className="problem-create-textarea"
                    rows={4}
                    placeholder="출력 형식을 설명하세요"
                  />
                </div>
              </div>

              {/* 예제 입출력 */}
              <div className="problem-create-form-section">
                <label className="problem-create-label">예제 입출력</label>
                {formData.sampleInputs.map((sample, idx) => (
                  <div key={idx} className="problem-create-sample-item">
                    <div className="problem-create-sample-header">
                      <span>예제 #{idx + 1}</span>
                      {formData.sampleInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSampleInput(idx)}
                          className="problem-create-sample-remove"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <div className="problem-create-sample-grid">
                      <div>
                        <label className="problem-create-sample-label">입력</label>
                        <textarea
                          value={sample.input}
                          onChange={(e) => handleSampleInputChange(idx, 'input', e.target.value)}
                          className="problem-create-textarea"
                          rows={3}
                          placeholder="예제 입력"
                        />
                      </div>
                      <div>
                        <label className="problem-create-sample-label">출력</label>
                        <textarea
                          value={sample.output}
                          onChange={(e) => handleSampleInputChange(idx, 'output', e.target.value)}
                          className="problem-create-textarea"
                          rows={3}
                          placeholder="예제 출력"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSampleInput}
                  className="problem-create-add-btn"
                >
                  + 예제 추가
                </button>
              </div>

              {/* 테스트케이스 */}
              <div className="problem-create-form-section">
                <label className="problem-create-label">테스트케이스 파일</label>
                <div className="problem-create-file-upload-wrapper">
                  <input
                    type="file"
                    id="testcaseInput"
                    multiple
                    onChange={handleTestcaseAdd}
                    className="problem-create-file-input"
                  />
                  <label htmlFor="testcaseInput" className="problem-create-file-label-inline">
                    파일 선택
                  </label>
                  <span className="problem-create-help-text">
                    테스트케이스 입력(.in) 및 출력(.ans) 파일
                  </span>
                </div>
                <div className="problem-create-testcase-list">
                  {formData.testcases.map((file, idx) => (
                    <div key={idx} className="problem-create-testcase-item">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleTestcaseRemove(idx)}
                        className="problem-create-testcase-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="problem-create-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => navigate('/admin/problems')}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={submitting}
              >
                {submitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProblemEdit;
