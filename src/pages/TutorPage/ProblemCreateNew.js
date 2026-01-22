import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import "./ProblemCreate.css";

const ProblemCreate = () => {
  const navigate = useNavigate();
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedTestCases, setParsedTestCases] = useState([]); // ZIP에서 파싱한 테스트케이스
  const descriptionRef = useRef(null);

  // description이 변경되면 contentEditable에 반영
  useEffect(() => {
    if (descriptionRef.current && formData.description) {
      // 현재 내용과 다를 때만 업데이트 (무한 루프 방지)
      if (descriptionRef.current.innerHTML !== formData.description) {
        descriptionRef.current.innerHTML = formData.description;
      }
    }
  }, [formData.description]);
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

  const handleZipFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setError('ZIP 파일만 업로드 가능합니다.');
      return;
    }

    setZipFile(file);
    setError(null);
    setLoading(true);

    try {
      // ZIP 파일 파싱
      const formData = new FormData();
      formData.append('zipFile', file);
      
      console.log('ZIP 파일 파싱 시작:', file.name);
      const parsedData = await APIService.parseZipFile(formData);
      console.log('파싱된 데이터:', parsedData);
      
      // 파싱된 데이터로 폼 채우기
      if (parsedData) {
        // 제목 설정
        if (parsedData.title) {
          setFormData(prev => ({
            ...prev,
            title: parsedData.title
          }));
        }

        // 시간 제한 설정
        if (parsedData.timeLimit !== null && parsedData.timeLimit !== undefined) {
          setFormData(prev => ({
            ...prev,
            timeLimit: String(parsedData.timeLimit)
          }));
        }

        // 메모리 제한 설정
        if (parsedData.memoryLimit !== null && parsedData.memoryLimit !== undefined) {
          setFormData(prev => ({
            ...prev,
            memoryLimit: String(parsedData.memoryLimit)
          }));
        }

        // 설명 설정
        if (parsedData.description) {
          // 마크다운을 간단히 HTML로 변환
          const htmlDescription = parsedData.description
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          setFormData(prev => ({
            ...prev,
            description: htmlDescription
          }));
          
          // contentEditable에 직접 설정 (useEffect가 처리하지만 즉시 반영)
          if (descriptionRef.current) {
            descriptionRef.current.innerHTML = htmlDescription;
          }
        }

        // 테스트케이스 처리 (대소문자 구분 없이)
        const testCases = parsedData.testCases || parsedData.testcases || [];
        console.log('테스트케이스:', testCases);
        if (testCases.length > 0) {
          // 샘플 테스트케이스를 예제로 변환
          const sampleTestCases = testCases.filter(tc => tc.type === 'sample');
          if (sampleTestCases.length > 0) {
            setFormData(prev => ({
              ...prev,
              sampleInputs: sampleTestCases.map(tc => ({
                input: tc.input || '',
                output: tc.output || ''
              }))
            }));
          }

          // 모든 테스트케이스 저장 (표시용)
          setParsedTestCases(testCases);
          
          const secretCount = testCases.filter(tc => tc.type === 'secret').length;
          const sampleCount = testCases.filter(tc => tc.type === 'sample').length;
          console.log(`ZIP 파일에서 ${sampleCount}개의 샘플 테스트케이스와 ${secretCount}개의 비밀 테스트케이스를 찾았습니다.`);
        } else {
          setParsedTestCases([]);
        }
      }
    } catch (err) {
      console.error('ZIP 파일 파싱 실패:', err);
      setError(`ZIP 파일 파싱 중 오류가 발생했습니다: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
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

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
    descriptionRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description);
      submitFormData.append('inputFormat', formData.inputFormat);
      submitFormData.append('outputFormat', formData.outputFormat);
      submitFormData.append('tags', JSON.stringify(formData.tags));
      submitFormData.append('difficulty', formData.difficulty);
      submitFormData.append('timeLimit', formData.timeLimit || '0');
      submitFormData.append('memoryLimit', formData.memoryLimit || '0');
      submitFormData.append('sampleInputs', JSON.stringify(formData.sampleInputs));
      
      // ZIP 파일 (선택적)
      if (zipFile) {
        submitFormData.append('zipFile', zipFile);
      }

      // 테스트케이스 파일들
      formData.testcases.forEach((file, index) => {
        submitFormData.append(`testcase_${index}`, file);
      });

      const response = await APIService.createProblem(submitFormData);
      
      if (response?.data || response) {
        alert('문제가 성공적으로 생성되었습니다.');
        navigate('/tutor/problems');
      }
    } catch (err) {
      console.error('문제 생성 실패:', err);
      setError('문제 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getFullDescription = () => {
    let full = formData.description || '';
    
    if (formData.inputFormat) {
      full += '<br/><br/><strong>입력 형식</strong><br/>' + formData.inputFormat.replace(/\n/g, '<br/>');
    }
    
    if (formData.outputFormat) {
      full += '<br/><br/><strong>출력 형식</strong><br/>' + formData.outputFormat.replace(/\n/g, '<br/>');
    }
    
    if (formData.sampleInputs.some(s => s.input || s.output)) {
      full += '<br/><br/><strong>예제</strong>';
      formData.sampleInputs.forEach((sample, idx) => {
        if (sample.input || sample.output) {
          full += `<br/><br/><strong>예제 입력 ${idx + 1}</strong><br/><pre>${sample.input}</pre>`;
          full += `<br/><strong>예제 출력 ${idx + 1}</strong><br/><pre>${sample.output}</pre>`;
        }
      });
    }
    
    return full;
  };

  return (
    <TutorLayout>
      <div className="problem-create">
        <div className="tutor-page-header">
          <h1 className="tutor-page-title">새 문제 만들기</h1>
          <button 
            className="tutor-btn-secondary"
            onClick={() => navigate('/tutor/problems')}
          >
            취소
          </button>
        </div>

        {error && (
          <div className="tutor-error-message">
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
                    disabled={loading}
                  />
                  <label htmlFor="zipFileInput" className="problem-create-file-label-inline">
                    {loading ? '파싱 중...' : zipFile ? `✓ ${zipFile.name}` : 'ZIP 파일 선택'}
                  </label>
                  <span className="problem-create-help-text">
                    {loading 
                      ? 'ZIP 파일 내용을 분석 중입니다...'
                      : '문제 ZIP 파일이 있다면 업로드하세요. 자동으로 내용이 채워집니다.'}
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
                    </div>
                    <div
                      ref={descriptionRef}
                      contentEditable
                      className="problem-create-text-editor"
                      onInput={(e) => {
                        const html = e.currentTarget.innerHTML;
                        // HTML을 마크다운으로 변환 (간단한 버전)
                        const text = e.currentTarget.textContent || e.currentTarget.innerText || '';
                        setFormData(prev => ({ ...prev, description: html }));
                      }}
                      placeholder="문제 설명을 입력하세요"
                      suppressContentEditableWarning
                    />
                  </div>
                  <div className="problem-create-preview">
                    <div className="problem-create-preview-header">미리보기</div>
                    <div className="problem-create-preview-content">
                      <div 
                        dangerouslySetInnerHTML={{ __html: getFullDescription() || '문제 설명을 입력하세요' }}
                        style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                      />
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

              {/* ZIP에서 파싱된 테스트케이스 표시 */}
              {parsedTestCases.length > 0 && (
                <div className="problem-create-form-section">
                  <label className="problem-create-label">
                    ZIP 파일에서 발견된 테스트케이스 ({parsedTestCases.length}개)
                  </label>
                  <div className="problem-create-parsed-testcases">
                    {parsedTestCases.map((testCase, idx) => (
                      <div key={idx} className="problem-create-parsed-testcase-item">
                        <div className="problem-create-parsed-testcase-header">
                          <span>
                            <strong>{testCase.name}</strong> ({testCase.type === 'sample' ? '샘플' : '비밀'})
                          </span>
                        </div>
                        <div className="problem-create-parsed-testcase-content">
                          <div>
                            <strong>입력:</strong>
                            <pre>{testCase.input || '(없음)'}</pre>
                          </div>
                          <div>
                            <strong>출력:</strong>
                            <pre>{testCase.output || '(없음)'}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                    <span className="problem-create-help-text">
                      이 테스트케이스들은 ZIP 파일에 포함되어 있습니다. 문제 생성 시 자동으로 포함됩니다.
                    </span>
                  </div>
                </div>
              )}

              {/* 테스트케이스 */}
              <div className="problem-create-form-section">
                <label className="problem-create-label">추가 테스트케이스 파일 (선택사항)</label>
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
                    ZIP 파일에 없는 추가 테스트케이스 입력(.in) 및 출력(.ans) 파일
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
                className="tutor-btn-secondary"
                onClick={() => navigate('/tutor/problems')}
                disabled={loading}
              >
                취소
              </button>
              <button
                type="submit"
                className="tutor-btn-primary"
                disabled={loading}
              >
                {loading ? '생성 중...' : '문제 생성'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </TutorLayout>
  );
};

export default ProblemCreate;

