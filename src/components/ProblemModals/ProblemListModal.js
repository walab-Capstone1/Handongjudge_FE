import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { removeCopyLabel } from '../../utils/problemUtils';
import APIService from '../../services/APIService';
import { FaPalette, FaHighlighter } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import '../../components/AssignmentModals/AssignmentModals.css';
import '../../pages/TutorPage/ProblemCreate.css';

// 미리보기 컴포넌트
const ProblemPreview = ({ title, description, inputFormat, outputFormat, sampleInputs }) => {
  const hasContent = description || inputFormat || outputFormat || 
                     (sampleInputs && sampleInputs.some(s => s.input || s.output));

  if (!hasContent) {
    return <div className="problem-preview-empty">문제 설명을 입력하세요</div>;
  }

  return (
    <div className="problem-preview-wrapper">
      {title && <h1 className="problem-preview-title">{title}</h1>}
      {description && (
        <div className="problem-preview-description">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="problem-preview-h1" {...props} />,
              h2: ({node, ...props}) => <h2 className="problem-preview-h2" {...props} />,
              h3: ({node, ...props}) => <h3 className="problem-preview-h3" {...props} />,
              code: ({node, inline, className, children, ...props}) => {
                return inline ? (
                  <code className="problem-preview-inline-code" {...props}>{children}</code>
                ) : (
                  <pre className="problem-preview-code-block"><code {...props}>{children}</code></pre>
                );
              },
              p: ({node, ...props}) => <p className="problem-preview-paragraph" {...props} />,
            }}
          >
            {description}
          </ReactMarkdown>
        </div>
      )}
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
      {sampleInputs && sampleInputs.some(s => s.input || s.output) && (
        <div className="problem-preview-section">
          <h2 className="problem-preview-h2">예제</h2>
          {sampleInputs.map((sample, idx) => {
            if (!sample.input && !sample.output) return null;
            return (
              <div key={idx} className="problem-preview-example">
                <h3 className="problem-preview-h3">예제 입력 {idx + 1}</h3>
                <pre className="problem-preview-code-block"><code>{sample.input || ''}</code></pre>
                <h3 className="problem-preview-h3">예제 출력 {idx + 1}</h3>
                <pre className="problem-preview-code-block"><code>{sample.output || ''}</code></pre>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * 문제 목록 모달 컴포넌트
 */
const ProblemListModal = ({
  isOpen,
  selectedAssignment,
  submissionStats,
  searchTerm,
  onClose,
  onAddProblem,
  onRemoveProblem,
  onProblemDetail,
  onSearchChange,
  onProblemViewDetail,
  onProblemUpdated // 문제 업데이트 후 콜백
}) => {
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const descriptionRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    descriptionText: '',
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
  const [enableFullEdit, setEnableFullEdit] = useState(false);

  // 편집 모드 진입 시 문제 데이터 로드
  useEffect(() => {
    if (editingProblemId) {
      fetchProblemForEdit(editingProblemId);
    }
  }, [editingProblemId]);

  // descriptionRef 초기화
  useEffect(() => {
    if (editingProblemId && descriptionRef.current && formData.description && isInitialLoad && !loading) {
      const isHTML = /<[^>]+>/.test(formData.description);
      if (isHTML) {
        descriptionRef.current.innerHTML = formData.description;
      } else {
        descriptionRef.current.textContent = formData.descriptionText || formData.description;
      }
      setIsInitialLoad(false);
    }
  }, [formData.description, formData.descriptionText, loading, isInitialLoad, editingProblemId]);

  // 문제 변환 모드 활성화 시 descriptionRef 설정
  useEffect(() => {
    if (enableFullEdit && descriptionRef.current && formData.description) {
      const isHTML = /<[^>]+>/.test(formData.description);
      if (isHTML) {
        descriptionRef.current.innerHTML = formData.description;
      } else {
        descriptionRef.current.textContent = formData.descriptionText || formData.description;
      }
    }
  }, [enableFullEdit, formData.description, formData.descriptionText]);

  const fetchProblemForEdit = async (problemId) => {
    try {
      setLoading(true);
      setIsInitialLoad(true);
      setError(null);
      
      const response = await APIService.getProblemInfo(problemId);
      const problem = response?.data || response;
      
      let parsedData = null;
      try {
        parsedData = await APIService.parseProblemZip(problemId);
      } catch (err) {
        console.warn('ZIP 파일 파싱 실패:', err);
      }
      
      const description = parsedData?.description || problem.description || '';
      const descriptionText = description.replace(/<[^>]*>/g, '') || description;
      
      let timeLimit = '';
      if (parsedData?.timeLimit != null) {
        timeLimit = String(parsedData.timeLimit);
      } else if (problem.timeLimit != null) {
        const timeLimitValue = Number(problem.timeLimit);
        if (!isNaN(timeLimitValue) && timeLimitValue > 0) {
          timeLimit = String(timeLimitValue);
        }
      }
      
      let memoryLimit = '';
      if (parsedData?.memoryLimit != null) {
        memoryLimit = String(parsedData.memoryLimit);
      } else if (problem.memoryLimit != null) {
        const memoryLimitValue = Number(problem.memoryLimit);
        if (!isNaN(memoryLimitValue) && memoryLimitValue > 0) {
          memoryLimit = String(memoryLimitValue);
        }
      }
      
      setOriginalTimeLimit(timeLimit);
      setOriginalMemoryLimit(memoryLimit);
      
      let tags = [];
      if (parsedData?.tags) {
        if (typeof parsedData.tags === 'string') {
          try {
            const parsedTags = JSON.parse(parsedData.tags);
            tags = Array.isArray(parsedTags) ? parsedTags.map(t => t && t.trim()).filter(Boolean) : [parsedTags.trim()];
          } catch (e) {
            if (parsedData.tags.trim()) tags = [parsedData.tags.trim()];
          }
        } else if (Array.isArray(parsedData.tags)) {
          tags = parsedData.tags.map(t => t && t.trim()).filter(Boolean);
        }
      } else if (problem.tags) {
        if (Array.isArray(problem.tags)) {
          tags = problem.tags.map(t => t && t.trim()).filter(Boolean);
        } else if (typeof problem.tags === 'string') {
          try {
            const parsedTags = JSON.parse(problem.tags);
            tags = Array.isArray(parsedTags) ? parsedTags.map(t => t && t.trim()).filter(Boolean) : [parsedTags.trim()];
          } catch (e) {
            if (problem.tags.trim()) tags = [problem.tags.trim()];
          }
        }
      }
      
      let sampleInputs = [{ input: '', output: '' }];
      if (parsedData) {
        const testCases = parsedData.testCases || parsedData.testcases || [];
        const sampleTestCases = testCases.filter(tc => tc.type === 'sample');
        if (sampleTestCases.length > 0) {
          sampleInputs = sampleTestCases.map(tc => ({
            input: tc.input || '',
            output: tc.output || ''
          }));
        }
      }
      
      setFormData({
        title: parsedData?.title || problem.title || '',
        description: description,
        descriptionText: descriptionText,
        inputFormat: '',
        outputFormat: '',
        tags: tags,
        difficulty: parsedData?.difficulty || problem.difficulty?.toString() || '1',
        timeLimit: timeLimit,
        memoryLimit: memoryLimit,
        sampleInputs: sampleInputs,
        testcases: []
      });
      
      setEnableFullEdit(false);
      
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagAdd = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
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
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSampleInputChange = (index, field, value) => {
    const newSamples = [...formData.sampleInputs];
    newSamples[index][field] = value;
    setFormData(prev => ({ ...prev, sampleInputs: newSamples }));
  };

  const addSampleInput = () => {
    setFormData(prev => ({ ...prev, sampleInputs: [...prev.sampleInputs, { input: '', output: '' }] }));
  };

  const removeSampleInput = (index) => {
    if (formData.sampleInputs.length > 1) {
      setFormData(prev => ({ ...prev, sampleInputs: prev.sampleInputs.filter((_, i) => i !== index) }));
    }
  };

  const handleTestcaseAdd = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, testcases: [...prev.testcases, ...files] }));
  };

  const handleTestcaseRemove = (index) => {
    setFormData(prev => ({ ...prev, testcases: prev.testcases.filter((_, i) => i !== index) }));
  };

  const handleZipFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      setError('ZIP 파일만 업로드 가능합니다.');
      return;
    }
    setZipFile(file);
    setError(null);
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

  const getFullDescription = () => ({
    title: formData.title,
    description: formData.description || '',
    inputFormat: formData.inputFormat,
    outputFormat: formData.outputFormat,
    sampleInputs: formData.sampleInputs
  });

  const getFullDescriptionForBackend = () => {
    let full = formData.descriptionText || '';
    if (formData.inputFormat) full += '\n\n## 입력 형식\n' + formData.inputFormat;
    if (formData.outputFormat) full += '\n\n## 출력 형식\n' + formData.outputFormat;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (enableFullEdit) {
        // 문제 변환: 새 문제 생성
        const submitFormData = new FormData();
        submitFormData.append('title', formData.title);
        submitFormData.append('tags', JSON.stringify(formData.tags));
        submitFormData.append('difficulty', formData.difficulty);
        submitFormData.append('description', getFullDescriptionForBackend());
        submitFormData.append('inputFormat', formData.inputFormat);
        submitFormData.append('outputFormat', formData.outputFormat);
        submitFormData.append('timeLimit', formData.timeLimit || originalTimeLimit || '1');
        submitFormData.append('memoryLimit', formData.memoryLimit || originalMemoryLimit || '256');
        submitFormData.append('sampleInputs', JSON.stringify(formData.sampleInputs));
        
        if (zipFile) {
          submitFormData.append('zipFile', zipFile);
        }
        
        formData.testcases.forEach((file, index) => {
          submitFormData.append(`testcase_${index}`, file);
        });

        // 새 문제 생성
        const newProblemResponse = await APIService.createProblem(submitFormData);
        const newProblemId = newProblemResponse?.data || newProblemResponse;

        // 새 문제를 과제에 추가
        await APIService.addProblemToAssignment(selectedAssignment.id, newProblemId);

        // 기존 문제를 과제에서 제거
        await APIService.removeProblemFromAssignment(selectedAssignment.id, editingProblemId);

        alert('문제가 성공적으로 변환되었습니다.');
      } else {
        // 일반 수정: 메타데이터만 업데이트
        const submitFormData = new FormData();
        submitFormData.append('title', formData.title);
        submitFormData.append('tags', JSON.stringify(formData.tags));
        submitFormData.append('difficulty', formData.difficulty);
        submitFormData.append('metadataUpdated', 'true');

        await APIService.updateProblem(editingProblemId, submitFormData);
        alert('문제가 성공적으로 수정되었습니다.');
      }

      // 편집 모드 종료 및 목록 새로고침
      setEditingProblemId(null);
      setEnableFullEdit(false);
      setZipFile(null);
      if (onProblemUpdated) {
        onProblemUpdated();
      }
    } catch (err) {
      console.error('문제 수정 실패:', err);
      setError('문제 수정 중 오류가 발생했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProblemId(null);
    setEnableFullEdit(false);
    setZipFile(null);
    setError(null);
    setFormData({
      title: '',
      description: '',
      descriptionText: '',
      inputFormat: '',
      outputFormat: '',
      tags: [],
      difficulty: '1',
      timeLimit: '',
      memoryLimit: '',
      sampleInputs: [{ input: '', output: '' }],
      testcases: []
    });
  };

  if (!isOpen || !selectedAssignment) return null;

  const filteredProblems = selectedAssignment.problems?.filter(problem => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      problem.id?.toString().includes(searchLower) ||
      problem.title?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // 편집 모드일 때 편집 UI 표시
  if (editingProblemId) {
    return createPortal(
      <div className="assignment-management-problem-list-modal-overlay" onClick={handleCancelEdit}>
        <div className="assignment-management-problem-list-modal-content assignment-management-problem-list-modal-content-extra-large" onClick={(e) => e.stopPropagation()}>
          <div className="assignment-management-problem-list-modal-header">
            <h2>문제 수정 - {formData.title || '로딩 중...'}</h2>
            <button 
              className="assignment-management-problem-list-modal-close"
              onClick={handleCancelEdit}
            >
              ✕
            </button>
          </div>
          
          <div className="assignment-management-problem-list-modal-body" style={{ padding: '2rem', overflowY: 'auto', maxHeight: 'calc(90vh - 200px)' }}>
            {error && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fee', color: '#c33', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>로딩 중...</div>
            ) : (
              <>
                {!enableFullEdit && (
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '16px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <strong style={{ color: '#856404' }}>⚠️ 메타데이터 수정 모드</strong>
                      <p style={{ margin: '8px 0 0 0', color: '#856404', fontSize: '14px' }}>
                        현재 제목, 난이도, 태그만 수정 가능합니다. 다른 필드를 수정하려면 '문제 변환' 버튼을 클릭하세요.
                        <br />
                        <span style={{ fontSize: '13px', fontStyle: 'italic' }}>
                          (문제 변환 시 Domjudge까지 변환하는 전체 업데이트가 수행되며, 새로운 문제로 취급됩니다)
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('문제 변환 모드를 활성화하시겠습니까?\n\n이 모드에서는 문제 설명, 시간/메모리 제한, 테스트케이스 등을 수정할 수 있습니다.\n\n⚠️ 주의: 이러한 변경사항은 Domjudge까지 변환하는 전체 업데이트를 수행하며, 새로운 문제로 취급됩니다.')) {
                          setEnableFullEdit(true);
                        }
                      }}
                      className="problem-edit-convert-btn"
                    >
                      문제 변환
                    </button>
                  </div>
                )}

                {enableFullEdit && (
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '16px', 
                    backgroundColor: '#d1ecf1', 
                    border: '1px solid #0c5460', 
                    borderRadius: '8px'
                  }}>
                    <strong style={{ color: '#0c5460' }}>⚠️ 문제 변환 모드 활성화</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#0c5460', fontSize: '14px' }}>
                      모든 필드를 수정할 수 있습니다. 변경사항은 Domjudge까지 변환하는 전체 업데이트를 수행하며, 새로운 문제로 취급됩니다.
                    </p>
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

                      {enableFullEdit && (
                        <>
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
                              <label 
                                htmlFor="zipFileInput" 
                                className="problem-create-file-label-inline"
                              >
                                {zipFile ? `✓ ${zipFile.name}` : 'ZIP 파일 선택'}
                              </label>
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
                                  <button type="button" onClick={() => insertText('```\n코드\n```')} title="Code Block">
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
                                  onInput={(e) => {
                                    const htmlContent = e.currentTarget?.innerHTML || '';
                                    const textContent = e.currentTarget?.textContent || e.currentTarget?.innerText || '';
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      description: htmlContent,
                                      descriptionText: textContent 
                                    }));
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
                        </>
                      )}
                    </div>

                    <div className="problem-create-actions">
                      <button
                        type="button"
                        className="problem-edit-btn-back"
                        onClick={handleCancelEdit}
                        disabled={submitting}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="tutor-btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? '수정 중...' : '수정 완료'}
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // 목록 모드
  return createPortal(
    <div className="assignment-management-problem-list-modal-overlay" onClick={onClose}>
      <div className="assignment-management-problem-list-modal-content assignment-management-problem-list-modal-content-extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="assignment-management-problem-list-modal-header">
          <h2>문제 목록 관리 - {selectedAssignment.title}</h2>
          <button 
            className="assignment-management-problem-list-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="assignment-management-problem-list-modal-body">
          {/* 문제 검색 */}
          <div className="tutor-filters-section">
            <div className="tutor-search-box">
              <input
                type="text"
                placeholder="문제 ID, 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="tutor-search-input"
              />
            </div>
          </div>

          {selectedAssignment.problems && selectedAssignment.problems.length > 0 ? (
            filteredProblems.length > 0 ? (
              <div className="tutor-problems-table-container">
                <table className="tutor-problems-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>제목</th>
                      <th>난이도</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((problem, index) => {
                      const problemStat = submissionStats[selectedAssignment.id]?.problemStats?.find(
                        stat => stat.problemId === problem.id
                      );
                      
                      const getStatusText = () => {
                        if (problemStat) {
                          const correctCount = problemStat.correctSubmissions || 0;
                          const totalCount = problemStat.totalStudents || 0;
                          return `${correctCount}/${totalCount}명 완료`;
                        }
                        const totalStudents = submissionStats[selectedAssignment.id]?.totalStudents || 0;
                        return `0/${totalStudents}명 완료`;
                      };
                      
                      return (
                        <tr key={problem.id || index}>
                          <td>{problem.id}</td>
                          <td className="tutor-problem-title-cell">
                            <button
                              className="tutor-btn-link"
                              onClick={() => onProblemDetail && onProblemDetail(problem.id)}
                            >
                              {removeCopyLabel(problem.title)}
                            </button>
                          </td>
                          <td>{problem.difficulty || 'N/A'}</td>
                          <td>
                            {getStatusText()}
                          </td>
                          <td>
                            <button
                              className="tutor-btn-table-action"
                              onClick={() => onProblemViewDetail && onProblemViewDetail(problem.id)}
                            >
                              설명보기
                            </button>
                            <button
                              className="tutor-btn-table-action"
                              onClick={() => setEditingProblemId(problem.id)}
                            >
                              수정
                            </button>
                            <button
                              className="tutor-btn-table-action tutor-btn-delete"
                              onClick={() => onRemoveProblem(selectedAssignment.id, problem.id)}
                            >
                              제거
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="tutor-no-problems">
                <p>검색 조건에 맞는 문제가 없습니다.</p>
              </div>
            )
          ) : (
            <div className="tutor-no-problems">
              <p>등록된 문제가 없습니다.</p>
              <button 
                className="tutor-btn-primary"
                onClick={() => {
                  onClose();
                  onAddProblem(selectedAssignment);
                }}
              >
                첫 번째 문제 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProblemListModal;
