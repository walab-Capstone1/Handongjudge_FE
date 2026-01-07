import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import { FaPalette, FaHighlighter } from "react-icons/fa";
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
      
      {/* 문제 설명 (HTML 그대로 렌더링) */}
      {description && (
        <div 
          className="problem-preview-description"
          dangerouslySetInnerHTML={{ __html: description }}
        />
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    fetchProblem();
  }, [problemId]);

  // 초기 로드 시에만 descriptionRef에 내용 설정
  useEffect(() => {
    if (descriptionRef.current && formData.description && isInitialLoad && !loading) {
      descriptionRef.current.innerHTML = formData.description;
      setIsInitialLoad(false);
    }
  }, [formData.description, loading, isInitialLoad]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await APIService.getProblemInfo(problemId);
      const problem = response?.data || response;
      
      console.log('불러온 문제 데이터:', problem);
      
      // 기존 설명에서 입력 형식, 출력 형식, 예제 추출
      const description = problem.description || '';
      
      let mainDescription = description;
      let inputFormat = '';
      let outputFormat = '';
      let sampleInputs = [{ input: '', output: '' }];
      
      // 마크다운 형식 파싱
      const inputFormatMatch = description.match(/## 입력 형식\s*\n([\s\S]*?)(?=\n\n## |$)/);
      const outputFormatMatch = description.match(/## 출력 형식\s*\n([\s\S]*?)(?=\n\n## |$)/);
      const exampleMatch = description.match(/## 예제\s*\n([\s\S]*?)$/);
      
      if (inputFormatMatch) {
        inputFormat = inputFormatMatch[1].trim();
        mainDescription = mainDescription.replace(/## 입력 형식\s*\n[\s\S]*?(?=\n\n## |$)/, '').trim();
      }
      
      if (outputFormatMatch) {
        outputFormat = outputFormatMatch[1].trim();
        mainDescription = mainDescription.replace(/## 출력 형식\s*\n[\s\S]*?(?=\n\n## |$)/, '').trim();
      }
      
      if (exampleMatch) {
        // 예제 파싱
        const exampleText = exampleMatch[1];
        const exampleInputRegex = /### 예제 입력 (\d+)\s*\n```\s*\n([\s\S]*?)\n```/g;
        const exampleOutputRegex = /### 예제 출력 (\d+)\s*\n```\s*\n([\s\S]*?)\n```/g;
        
        const inputMatches = [...exampleText.matchAll(exampleInputRegex)];
        const outputMatches = [...exampleText.matchAll(exampleOutputRegex)];
        
        const maxIndex = Math.max(
          inputMatches.length > 0 ? Math.max(...inputMatches.map(m => parseInt(m[1]))) : 0,
          outputMatches.length > 0 ? Math.max(...outputMatches.map(m => parseInt(m[1]))) : 0
        );
        
        sampleInputs = [];
        for (let i = 1; i <= maxIndex; i++) {
          const inputMatch = inputMatches.find(m => parseInt(m[1]) === i);
          const outputMatch = outputMatches.find(m => parseInt(m[1]) === i);
          sampleInputs.push({
            input: inputMatch ? inputMatch[2].trim() : '',
            output: outputMatch ? outputMatch[2].trim() : ''
          });
        }
        
        if (sampleInputs.length === 0) {
          sampleInputs = [{ input: '', output: '' }];
        }
        
        mainDescription = mainDescription.replace(/## 예제[\s\S]*$/, '').trim();
      }
      
      // description이 HTML인지 마크다운인지 확인
      const isHTML = /<[^>]+>/.test(mainDescription);
      const descriptionHTML = isHTML ? mainDescription : mainDescription;
      const descriptionText = isHTML ? mainDescription.replace(/<[^>]*>/g, '') : mainDescription;
      
      const newFormData = {
        title: problem.title || '',
        description: descriptionHTML, // HTML 또는 마크다운
        descriptionText: descriptionText,
        inputFormat: inputFormat,
        outputFormat: outputFormat,
        tags: [], // 태그는 백엔드에서 제공하지 않으면 빈 배열
        difficulty: problem.difficulty?.toString() || '1',
        timeLimit: problem.timeLimit?.toString() || '',
        memoryLimit: problem.memoryLimit?.toString() || '',
        sampleInputs: sampleInputs,
        testcases: []
      };
      
      setFormData(newFormData);
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
      submitFormData.append('timeLimit', formData.timeLimit || '0');
      submitFormData.append('memoryLimit', formData.memoryLimit || '0');
      submitFormData.append('sampleInputs', JSON.stringify(formData.sampleInputs));
      
      // ZIP 파일 (선택적)
      if (zipFile) {
        submitFormData.append('newZipFile', zipFile);
      }

      // 테스트케이스 파일들
      formData.testcases.forEach((file, index) => {
        submitFormData.append(`testcase_${index}`, file);
      });

      await APIService.updateProblem(problemId, submitFormData);
      
      alert('문제가 성공적으로 수정되었습니다.');
      navigate('/admin/problems');
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
    let full = formData.descriptionText || formData.description.replace(/<[^>]*>/g, '') || '';
    
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
