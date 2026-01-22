import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import ReactMarkdown from "react-markdown";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import "./ProblemCreate.css";

// 미리보기 컴포넌트
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

const ProblemCreate = () => {
  const navigate = useNavigate();
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedTestCases, setParsedTestCases] = useState([]); // ZIP에서 파싱한 테스트케이스
  const [showParsedTestCases, setShowParsedTestCases] = useState(false); // 파싱된 테스트케이스 표시 여부
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

  // description이 변경되면 contentEditable에 반영
  useEffect(() => {
    if (descriptionRef.current) {
      const currentContent = descriptionRef.current.innerHTML || '';
      const newContent = formData.description || '';
      
      // 현재 내용과 다를 때만 업데이트 (무한 루프 방지)
      if (currentContent !== newContent) {
        descriptionRef.current.innerHTML = newContent;
      }
    }
  }, [formData.description]);

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
          // 먼저 마크다운 제목을 HTML로 변환 (## 제목 또는 ##제목 모두 지원)
          let processedDescription = convertMarkdownHeadingsToHtml(parsedData.description);
          
          // HTML 태그가 이미 포함되어 있는지 확인
          const hasHtmlTags = /<[a-z][\s\S]*>/i.test(processedDescription);
          
          let htmlDescription;
          if (hasHtmlTags) {
            // 이미 HTML 태그가 있으면 그대로 사용 (제목은 이미 변환됨)
            htmlDescription = processedDescription;
          } else {
            // 마크다운을 HTML로 변환
            htmlDescription = processedDescription
              .replace(/\n/g, '<br>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>');
          }
          
          setFormData(prev => ({
            ...prev,
            description: htmlDescription,
            descriptionText: parsedData.description // 원본도 저장
          }));
          
          // contentEditable에 직접 설정
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
    setLoading(true);
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

  // 마크다운 제목을 HTML로 변환하는 함수
  const convertMarkdownHeadingsToHtml = (html) => {
    if (!html) return html;
    
    // HTML 태그가 이미 있는 경우와 없는 경우를 구분
    // 줄 단위로 처리
    const lines = html.split(/\n/);
    const convertedLines = lines.map(line => {
      // HTML 태그가 포함된 줄은 그대로 유지
      if (line.match(/<[^>]+>/)) {
        return line;
      }
      
      // 마크다운 제목 패턴 확인 (#, ##, ###, ####, #####, ######)
      // 공백이 있어도 없어도 인식: ## 제목 또는 ##제목
      const trimmedLine = line.trim();
      const headingMatch = trimmedLine.match(/^(#{1,6})\s*(.+)$/);
      if (headingMatch) {
        const hashCount = headingMatch[1].length;
        const titleText = headingMatch[2].trim();
        const headingLevel = Math.min(Math.max(hashCount, 1), 6);
        return `<h${headingLevel}>${titleText}</h${headingLevel}>`;
      }
      
      return line;
    });
    
    return convertedLines.join('\n');
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

  return (
    <AdminLayout>
      <div className="problem-create">
        <div className="admin-page-header">
          <h1 className="admin-page-title">새 문제 만들기</h1>
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
                    disabled={loading}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <label htmlFor="zipFileInput" className="problem-create-file-label-inline">
                      {loading ? '파싱 중...' : zipFile ? `✓ ${zipFile.name}` : 'ZIP 파일 선택'}
                    </label>
                    {zipFile && !loading && (
                      <button
                        type="button"
                        onClick={() => {
                          setZipFile(null);
                          setParsedTestCases([]);
                          // ZIP 파일 입력 초기화
                          const fileInput = document.getElementById('zipFileInput');
                          if (fileInput) {
                            fileInput.value = '';
                          }
                        }}
                        className="problem-create-remove-zip-btn"
                        title="ZIP 파일 제거"
                      >
                        ×
                      </button>
                    )}
                  </div>
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
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            applyFormat('formatBlock', e.target.value);
                            e.target.value = ''; // 선택 초기화
                          }
                        }}
                        className="problem-create-heading-select"
                        title="제목 스타일"
                      >
                        <option value="">제목 스타일</option>
                        <option value="h1">제목 1</option>
                        <option value="h2">제목 2</option>
                        <option value="h3">제목 3</option>
                        <option value="h4">제목 4</option>
                        <option value="p">일반 텍스트</option>
                      </select>
                      <div className="problem-create-toolbar-divider"></div>
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
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            // fontSize 명령 사용 (1~7)
                            document.execCommand('fontSize', false, e.target.value);
                            descriptionRef.current?.focus();
                            e.target.value = ''; // 선택 초기화
                          }
                        }}
                        className="problem-create-heading-select"
                        title="글자 크기"
                      >
                        <option value="">글자 크기</option>
                        <option value="1">매우 작게</option>
                        <option value="2">작게</option>
                        <option value="3">보통</option>
                        <option value="4">크게</option>
                        <option value="5">매우 크게</option>
                        <option value="6">아주 크게</option>
                        <option value="7">최대 크기</option>
                      </select>
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
                        // Enter 키로 마크다운 제목 변환 (#, ##, ###, ####, #####, ######)
                        if (e.key === 'Enter') {
                          const editor = descriptionRef.current;
                          if (!editor) return;
                          
                          const selection = window.getSelection();
                          if (selection.rangeCount === 0) return;
                          
                          const range = selection.getRangeAt(0);
                          
                          // 현재 커서 위치의 텍스트 노드 찾기
                          let textNode = range.startContainer;
                          if (textNode.nodeType !== Node.TEXT_NODE) {
                            // 텍스트 노드가 아니면 가장 가까운 텍스트 노드 찾기
                            const walker = document.createTreeWalker(
                              textNode,
                              NodeFilter.SHOW_TEXT,
                              null
                            );
                            textNode = walker.nextNode() || textNode;
                          }
                          
                          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                            const text = textNode.textContent;
                            const cursorPos = range.startOffset;
                            
                            // 현재 줄의 시작부터 커서까지의 텍스트 확인
                            const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
                            const lineText = text.substring(lineStart, cursorPos);
                            
                              // 마크다운 제목 패턴 확인 (#, ##, ###, ####, #####, ######)
                              // 패턴: 1~6개의 # 뒤에 공백(0개 이상), 그 다음 텍스트
                              // ## 제목 또는 ##제목 모두 지원
                              const headingMatch = lineText.trim().match(/^(#{1,6})\s*(.+)$/);
                            if (headingMatch) {
                              e.preventDefault();
                              
                              const hashCount = headingMatch[1].length; // # 개수 (1~6)
                              const titleText = headingMatch[2].trim(); // 제목 텍스트
                              
                              // # 개수에 따라 적절한 헤딩 태그 선택 (h1~h6)
                              const headingLevel = Math.min(Math.max(hashCount, 1), 6);
                              const headingTag = `h${headingLevel}`;
                              
                              // 현재 HTML 내용 가져오기
                              const currentHTML = editor.innerHTML;
                              
                              // 커서 위치를 HTML 기준으로 찾기
                              const textBeforeCursor = text.substring(0, lineStart);
                              const textAfterCursor = text.substring(cursorPos);
                              
                              // HTML에서 해당 위치 찾기 (간단한 방법: 텍스트 기준으로 분할)
                              const htmlParts = currentHTML.split(/(<[^>]+>)/);
                              let htmlBefore = '';
                              let htmlAfter = '';
                              let found = false;
                              
                              // 더 간단한 방법: 전체 텍스트를 다시 생성
                              const beforeText = text.substring(0, lineStart);
                              const afterText = text.substring(cursorPos);
                              
                              // 제목 태그로 변환
                              const headingElement = document.createElement(headingTag);
                              headingElement.textContent = titleText;
                              
                              // DOM 조작
                              const parent = textNode.parentNode;
                              
                              // 기존 텍스트 노드를 분할
                              if (lineStart > 0) {
                                const beforeNode = document.createTextNode(beforeText);
                                parent.insertBefore(beforeNode, textNode);
                              }
                              
                              // 제목 요소 삽입
                              parent.insertBefore(headingElement, textNode);
                              
                              // 나머지 텍스트 처리
                              if (afterText.length > 0) {
                                const afterNode = document.createTextNode('\n' + afterText);
                                parent.insertBefore(afterNode, textNode);
                              }
                              
                              // 원본 텍스트 노드 제거
                              parent.removeChild(textNode);
                              
                              // 커서를 새 줄로 이동
                              const newRange = document.createRange();
                              const newTextNode = parent.childNodes[parent.childNodes.length - 1];
                              if (newTextNode && newTextNode.nodeType === Node.TEXT_NODE) {
                                newRange.setStart(newTextNode, 0);
                              } else {
                                // 텍스트 노드가 없으면 제목 뒤에 빈 텍스트 노드 생성
                                const emptyText = document.createTextNode('');
                                parent.appendChild(emptyText);
                                newRange.setStart(emptyText, 0);
                              }
                              newRange.collapse(true);
                              selection.removeAllRanges();
                              selection.addRange(newRange);
                              
                              // 상태 업데이트
                              const htmlContent = editor.innerHTML;
                              setFormData(prev => ({ 
                                ...prev, 
                                description: htmlContent
                              }));
                              
                              return;
                            }
                          }
                        }
                        
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

                {/* ZIP에서 파싱된 테스트케이스 표시 (접기/펼치기 가능) */}
                {parsedTestCases.length > 0 && (
                  <div className="problem-create-parsed-testcases-section">
                    <button
                      type="button"
                      onClick={() => setShowParsedTestCases(!showParsedTestCases)}
                      className="problem-create-parsed-testcases-toggle"
                    >
                      <span>{showParsedTestCases ? '▼' : '▶'}</span>
                      <span>ZIP 파일에서 발견된 테스트케이스 ({parsedTestCases.length}개)</span>
                    </button>
                    {showParsedTestCases && (
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
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="problem-create-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => navigate('/admin/problems')}
                disabled={loading}
              >
                취소
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={loading}
              >
                {loading ? '생성 중...' : '문제 생성'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProblemCreate;

