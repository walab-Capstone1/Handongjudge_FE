import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TutorLayout from '../../layouts/TutorLayout';
import TipTapEditor from '../../components/TipTapEditor';
import APIService from '../../services/APIService';
import './NoticeCreatePage.css';

const NoticeCreatePage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sectionId: sectionId || ''
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchSectionInfo();
    // sectionId가 있으면 자동으로 설정
    if (sectionId) {
      setFormData(prev => ({ ...prev, sectionId: sectionId }));
    }
    // 컴포넌트 마운트 후 에디터 렌더링
    setMounted(true);
  }, [sectionId]);

  const fetchSectionInfo = async () => {
    if (sectionId) {
      try {
        const dashboardResponse = await APIService.getInstructorDashboard();
        const sectionsData = dashboardResponse?.data || [];
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      } catch (error) {
        console.error('분반 정보 조회 실패:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    // HTML 태그를 제거하고 텍스트만 추출하여 검증
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = formData.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!textContent.trim()) {
      alert('내용을 입력해주세요');
      return;
    }

    if (!formData.sectionId) {
      alert('수업 정보가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      await APIService.createNotice(formData);
      alert('공지사항이 생성되었습니다.');
      // 공지사항 관리 페이지로 이동
      if (sectionId) {
        navigate(`/tutor/notices/section/${sectionId}`);
      } else {
        navigate('/tutor/notices');
      }
    } catch (error) {
      console.error('공지사항 생성 실패:', error);
      alert('공지사항 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (sectionId) {
      navigate(`/tutor/notices/section/${sectionId}`);
    } else {
      navigate('/tutor/notices');
    }
  };

  return (
    <TutorLayout selectedSection={currentSection}>
      <div className="notice-create-page">
        <div className="notice-create-header">
          <button 
            className="notice-create-back-btn"
            onClick={handleBack}
          >
            ← 뒤로가기
          </button>
          <div className="notice-create-header-content">
            <h1>새 공지사항 작성</h1>
            {currentSection && (
              <p className="notice-create-section-info">{currentSection.courseTitle}</p>
            )}
          </div>
        </div>

        <div className="notice-create-body">
          <form onSubmit={handleSubmit} className="notice-create-form">
            {/* 제목 */}
            <div className="notice-create-form-group">
              <label className="notice-create-label">
                제목 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="notice-create-input"
                placeholder="공지사항 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
              />
              <span className="notice-create-char-count">{formData.title.length}/200</span>
            </div>

            {/* 내용 */}
            <div className="notice-create-form-group">
              <label className="notice-create-label">
                내용 <span className="required">*</span>
              </label>
              {mounted && (
                <TipTapEditor
                  content={formData.content || ''}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="공지사항 내용을 자세히 작성해주세요"
                />
              )}
            </div>

            {/* 버튼 */}
            <div className="notice-create-form-actions">
              <button
                type="button"
                className="notice-create-btn-cancel"
                onClick={handleBack}
              >
                취소
              </button>
              <button
                type="submit"
                className="notice-create-btn-submit"
                disabled={loading}
              >
                {loading ? '작성 중...' : '작성 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TutorLayout>
  );
};

export default NoticeCreatePage;

