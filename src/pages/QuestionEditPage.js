import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import CourseHeader from '../components/CourseHeader';
import APIService from '../services/APIService';
import { useRecoilState } from 'recoil';
import { sidebarCollapsedState } from '../recoil/atoms';
import './QuestionCreatePage.css';

const QuestionEditPage = () => {
  const { sectionId, questionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  const [sectionInfo, setSectionInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublic: true
  });

  useEffect(() => {
    fetchQuestionData();
  }, [questionId]);

  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData);

      const response = await fetch(
        `http://localhost:8080/api/community/questions/${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('질문 조회 실패');

      const data = await response.json();
      const question = data.data;

      // 작성자가 아니면 접근 불가
      if (!question.isAuthor) {
        alert('수정 권한이 없습니다');
        navigate(`/sections/${sectionId}/community/${questionId}`);
        return;
      }

      setFormData({
        title: question.title,
        content: question.content,
        isPublic: question.isPublic
      });
    } catch (err) {
      console.error('Error fetching question:', err);
      alert('질문을 불러오는 중 오류가 발생했습니다');
      navigate(`/sections/${sectionId}/community/${questionId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `http://localhost:8080/api/community/questions/${questionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            isPublic: formData.isPublic
          })
        }
      );

      if (!response.ok) throw new Error('질문 수정 실패');

      alert('질문이 수정되었습니다!');
      navigate(`/sections/${sectionId}/community/${questionId}`);
    } catch (err) {
      console.error('Error updating question:', err);
      alert('질문 수정 중 오류가 발생했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (loading) {
    return (
      <div className={`question-create-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          currentMenu="community"
          isCollapsed={isSidebarCollapsed}
        />
        <div className="question-create-content">
          <CourseHeader 
            courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '로딩 중...'}
            onToggleSidebar={handleToggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <div className="question-create-body">
            <div className="loading">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`question-create-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        currentMenu="community"
        isCollapsed={isSidebarCollapsed}
      />
      <div className="question-create-content">
        <CourseHeader 
          courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '질문 수정'}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="question-create-body">
          <div className="question-create-header">
            <h1>질문 수정</h1>
            <p>질문 내용을 수정해주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="question-form">
            {/* 제목 */}
            <div className="form-group">
              <label className="form-label">
                제목 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="질문 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
              />
              <span className="char-count">{formData.title.length}/200</span>
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label className="form-label">
                내용 <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="질문 내용을 자세히 작성해주세요"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
              />
            </div>

            {/* 옵션 */}
            <div className="form-options">
              <div className="option-group">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={!formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: !e.target.checked })}
                  />
                  <span>비공개 질문 (교수만 볼 수 있음)</span>
                </label>
                <p className="option-description">
                  비공개로 설정하면 교수님만 질문을 볼 수 있습니다
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(`/sections/${sectionId}/community/${questionId}`)}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditPage;

