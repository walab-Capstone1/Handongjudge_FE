import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TutorLayout from '../../layouts/TutorLayout';
import TipTapEditor from '../../components/TipTapEditor';
import APIService from '../../services/APIService';
import './NoticeEditPage.css';

const NoticeEditPage = () => {
  const { noticeId, sectionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sectionId: sectionId || ''
  });
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    fetchNoticeData();
    fetchSectionInfo();
  }, [noticeId, sectionId]);

  useEffect(() => {
    // 데이터 로드 후 에디터 준비
    if (formData.content !== undefined && !loading && !editorReady) {
      const timer = setTimeout(() => {
        setEditorReady(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [formData.content, loading, editorReady]);

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

  const fetchNoticeData = async () => {
    try {
      setLoading(true);
      // 공지사항 상세 정보 가져오기
      const response = sectionId 
        ? await APIService.getSectionNotices(sectionId)
        : await APIService.getInstructorNotices();
      
      const noticesData = response?.data || response || [];
      const notice = noticesData.find(n => n.id === parseInt(noticeId));
      
      if (notice) {
        setFormData({
          title: notice.title || '',
          content: notice.content || '',
          sectionId: notice.sectionId || sectionId || ''
        });
      } else {
        alert('공지사항을 찾을 수 없습니다.');
        handleBack();
      }
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      alert('공지사항을 불러오는데 실패했습니다.');
      handleBack();
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
      setSaving(true);
      await APIService.updateNotice(noticeId, formData);
      alert('공지사항이 수정되었습니다.');
      // 공지사항 관리 페이지로 이동
      if (sectionId) {
        navigate(`/tutor/notices/section/${sectionId}`);
      } else {
        navigate('/tutor/notices');
      }
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      alert('공지사항 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (sectionId) {
      navigate(`/tutor/notices/section/${sectionId}`);
    } else {
      navigate('/tutor/notices');
    }
  };

  if (loading) {
    return (
      <TutorLayout selectedSection={currentSection}>
        <div className="notice-edit-page">
          <div className="notice-edit-loading">
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout selectedSection={currentSection}>
      <div className="notice-edit-page">
        <div className="notice-edit-header">
          <button 
            className="notice-edit-back-btn"
            onClick={handleBack}
          >
            ← 뒤로가기
          </button>
          <div className="notice-edit-header-content">
            <h1>공지사항 수정</h1>
            {currentSection && (
              <p className="notice-edit-section-info">{currentSection.courseTitle}</p>
            )}
          </div>
        </div>

        <div className="notice-edit-body">
          <form onSubmit={handleSubmit} className="notice-edit-form">
            {/* 제목 */}
            <div className="notice-edit-form-group">
              <label className="notice-edit-label">
                제목 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="notice-edit-input"
                placeholder="공지사항 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
              />
              <span className="notice-edit-char-count">{formData.title.length}/200</span>
            </div>

            {/* 내용 */}
            <div className="notice-edit-form-group">
              <label className="notice-edit-label">
                내용 <span className="required">*</span>
              </label>
              {editorReady ? (
                <TipTapEditor
                  content={formData.content || ''}
                  onChange={(html) => setFormData({ ...formData, content: html })}
                  placeholder="공지사항 내용을 자세히 작성해주세요"
                />
              ) : (
                <div style={{ minHeight: '200px', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  로딩 중...
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="notice-edit-form-actions">
              <button
                type="button"
                className="notice-edit-btn-cancel"
                onClick={handleBack}
              >
                취소
              </button>
              <button
                type="submit"
                className="notice-edit-btn-submit"
                disabled={saving}
              >
                {saving ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TutorLayout>
  );
};

export default NoticeEditPage;

