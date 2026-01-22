import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import "./NoticeManagement.css";

const NoticeManagement = () => {
  const { sectionId } = useParams(); // URL에서 분반 고유 ID 가져오기
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sectionId: ''
  });

  useEffect(() => {
    fetchNotices();
    fetchSections();
  }, [sectionId]); // sectionId가 변경될 때마다 다시 조회

  const fetchNotices = async () => {
    try {
      setLoading(true);
      console.log('🔍 공지사항 조회 시작...', { sectionId });
      
      let response;
      if (sectionId) {
        // 특정 분반의 공지사항만 조회
        response = await APIService.getSectionNotices(sectionId);
        console.log('📋 분반별 공지사항 API 응답:', response);
      } else {
        // 교수의 모든 공지사항 조회
        response = await APIService.getInstructorNotices();
        console.log('📋 전체 공지사항 API 응답:', response);
      }
      
      // 응답 구조에 따라 데이터 추출
      const noticesData = response?.data || response || [];
      console.log('📋 최종 공지사항 데이터:', noticesData);
      
      setNotices(noticesData);
      setLoading(false);
    } catch (error) {
      console.error('❌ 공지사항 조회 실패:', error);
      setNotices([]);
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      }
    } catch (error) {
      console.error('분반 정보 조회 실패:', error);
      setSections([]);
    }
  };

  const handleCreateNotice = () => {
    setEditingNotice(null);
    resetForm();
    setShowModal(true);
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      sectionId: notice.sectionId
    });
    setShowModal(true);
  };

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await APIService.deleteNotice(noticeId);
        fetchNotices(); // 목록 새로고침
        alert('공지사항이 삭제되었습니다.');
      } catch (error) {
        console.error('공지사항 삭제 실패:', error);
        alert('공지사항 삭제에 실패했습니다.');
      }
    }
  };

  const handleToggleActive = async (noticeId, currentActive) => {
    try {
      const newActive = !currentActive;
      await APIService.toggleNoticeActive(noticeId, newActive);
      fetchNotices(); // 목록 새로고침
    } catch (error) {
      console.error('공지사항 활성화 상태 변경 실패:', error);
      alert('공지사항 활성화 상태 변경에 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNotice(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      sectionId: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sectionId) {
      alert('분반을 선택해주세요.');
      return;
    }

    try {
      if (editingNotice) {
        // 수정
        await APIService.updateNotice(editingNotice.id, formData);
        alert('공지사항이 수정되었습니다.');
      } else {
        // 생성
        await APIService.createNotice(formData);
        alert('공지사항이 생성되었습니다.');
      }
      
      handleCloseModal();
      fetchNotices(); // 목록 새로고침
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다.');
    }
  };



  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'ALL' || notice.sectionId.toString() === filterSection;
    return matchesSearch && matchesSection;
  });

  const uniqueSections = Array.from(
    new Map(notices.map(notice => [notice.sectionId, { id: notice.sectionId, name: notice.sectionName }])).values()
  );

  if (loading) {
    return (
      <TutorLayout>
        <div className="notice-management">
          <div className="tutor-loading-container">
            <div className="tutor-loading-spinner"></div>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  const handleCopyEnrollmentLink = () => {
    if (currentSection?.enrollmentCode) {
      const enrollmentLink = `${window.location.origin}/enroll/${currentSection.enrollmentCode}`;
      navigator.clipboard.writeText(enrollmentLink).then(() => {
        alert('수업 참가 링크가 복사되었습니다!');
      }).catch((err) => {
        console.error('복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  return (
    <TutorLayout selectedSection={currentSection}>
      <div className="notice-management">
        {/* 분반별 페이지인 경우 헤더 디자인 */}
        {sectionId && currentSection && (
          <div className="tutor-page-header">
            <div className="tutor-header-left">
              <h1 className="tutor-page-title">
                {currentSection.courseTitle} - {currentSection.sectionNumber}분반
              </h1>
            </div>
            <div className="tutor-header-right">
              {currentSection.enrollmentCode && (
                <button
                  className="tutor-btn-link-copy"
                  onClick={handleCopyEnrollmentLink}
                  title="수업 참가 링크 복사"
                >
                  🔗 수업 링크 복사
                </button>
              )}
              <button
                className="tutor-btn-primary"
                onClick={handleCreateNotice}
              >
                새 공지사항 작성
              </button>
            </div>
          </div>
        )}
        
        {/* 전체 페이지인 경우 기존 헤더 유지 */}
        {!sectionId && (
          <div className="tutor-page-header">
            <div className="tutor-header-left">
              <h1 className="tutor-page-title">전체 공지사항 관리</h1>
              <div className="tutor-search-box">
                <input
                  type="text"
                  placeholder="제목, 내용, 분반으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tutor-search-input"
                />
              </div>
            </div>
            <div className="tutor-header-right">
              <div className="tutor-filter-dropdown">
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="tutor-filter-select"
                >
                  <option value="ALL">모든 수업</option>
                  {uniqueSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tutor-header-actions">
                <button
                  className="tutor-btn-primary"
                  onClick={handleCreateNotice}
                >
                  새 공지사항 작성
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="tutor-notices-list">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className={`notice-card ${notice.active === false ? 'disabled' : ''}`}>
              <div className="notice-title-row">
                <div className="tutor-title-and-course">
                  <p className="notice-course">{notice.sectionName}</p>
                  <h3 className="notice-title">{notice.title}</h3>
                </div>
                <div className="notice-actions">
                  <button 
                    className="tutor-btn-text-small tutor-edit"
                    onClick={() => handleEditNotice(notice)}
                  >
                    수정
                  </button>
                  <div className="tutor-more-menu">
                    <button 
                      className="tutor-btn-icon-small tutor-more"
                      title="더보기"
                    >
                      ⋯
                    </button>
                    <div className="tutor-more-dropdown">
                      <button 
                        className="tutor-btn-text-small"
                        onClick={() => handleToggleActive(notice.id, notice.active)}
                      >
                        {notice.active ? '비활성화' : '활성화'}
                      </button>
                      <button 
                        className="tutor-btn-text-small tutor-delete"
                        onClick={() => handleDeleteNotice(notice.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="notice-compact-stats">
                <span className="tutor-compact-stat">
                  <span className="tutor-stat-label-compact">작성일:</span>
                  <span className="tutor-stat-value-compact">
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </span>
                {notice.isNew && (
                  <span className="notice-new-badge">NEW</span>
                )}
              </div>

              <div className="notice-content">
                <p>{notice.content}</p>
              </div>
            </div>
          ))}

          {filteredNotices.length === 0 && (
            <div className="tutor-no-notices">
              <div className="tutor-no-notices-message">
                <span className="tutor-no-notices-icon">📢</span>
                <div>
                  {notices.length === 0 ? (
                    <>
                      <p><strong>작성된 공지사항이 없습니다</strong></p>
                      <p>새 공지사항을 작성해보세요.</p>
                    </>
                  ) : (
                    <>
                      <p><strong>검색 조건에 맞는 공지사항이 없습니다</strong></p>
                      <p>다른 검색어나 필터 조건을 사용해보세요.</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 공지사항 생성/수정 모달 */}
        {showModal && (
          <div className="tutor-modal-overlay">
            <div className="tutor-modal-content">
              <div className="tutor-modal-header">
                <h2>{editingNotice ? '공지사항 수정' : '새 공지사항 작성'}</h2>
                <button
                  className="tutor-modal-close"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="notice-form">
                <div className="tutor-form-row">
                  <div className="tutor-form-group">
                    <label htmlFor="title">공지사항 제목 *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="공지사항 제목을 입력하세요"
                      required
                    />
                  </div>
                  <div className="tutor-form-group">
                    <label htmlFor="sectionId">분반 선택 *</label>
                    <select
                      id="sectionId"
                      name="sectionId"
                      value={formData.sectionId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">분반을 선택하세요</option>
                      {sections.map((section) => (
                        <option key={section.sectionId} value={section.sectionId}>
                          {section.courseTitle} ({section.sectionNumber}분반)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>



                <div className="tutor-form-group">
                  <label htmlFor="content">공지사항 내용 *</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="공지사항 내용을 입력하세요"
                    rows="8"
                    required
                  />
                </div>

                <div className="tutor-form-actions">
                  <button type="button" className="tutor-btn-secondary" onClick={handleCloseModal}>
                    취소
                  </button>
                  <button type="submit" className="tutor-btn-primary">
                    {editingNotice ? '수정' : '작성'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default NoticeManagement;
