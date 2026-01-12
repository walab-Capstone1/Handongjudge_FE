import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import "./ProblemCreate.css";

// 미리보기 컴포넌트
const ProblemPreview = ({ title, description }) => {
  if (!description || description.trim() === '') {
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
    </div>
  );
};

const ProblemEdit = () => {
  const navigate = useNavigate();
  const { problemId } = useParams();
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
    timeLimit: '',
    memoryLimit: ''
  });

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
      
      // description이 HTML인지 마크다운인지 확인
      const description = problem.description || '';
      const isHTML = /<[^>]+>/.test(description);
      const descriptionHTML = isHTML ? description : description;
      const descriptionText = isHTML ? description.replace(/<[^>]*>/g, '') : description;
      
      setFormData({
        title: problem.title || '',
        description: descriptionHTML,
        descriptionText: descriptionText,
        timeLimit: problem.timeLimit?.toString() || '',
        memoryLimit: problem.memoryLimit?.toString() || ''
      });
    } catch (err) {
      console.error('문제 조회 실패:', err);
      setError('문제를 불러오는 중 오류가 발생했습니다.');
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
      submitFormData.append('description', formData.descriptionText || formData.description.replace(/<[^>]*>/g, ''));
      submitFormData.append('timeLimit', formData.timeLimit || '0');
      submitFormData.append('memoryLimit', formData.memoryLimit || '0');

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
    return {
      title: formData.title,
      description: formData.description || ''
    };
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

