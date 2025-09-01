import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import SectionNavigation from "../../components/SectionNavigation";
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

  const uniqueSections = [...new Set(notices.map(notice => ({ 
    id: notice.sectionId, 
    name: notice.sectionName 
  })).filter(Boolean))];

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>공지사항을 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* 분반별 페이지인 경우 네비게이션 표시 */}
      {sectionId && currentSection && (
        <SectionNavigation 
          sectionId={sectionId}
          sectionName={`${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`}
        />
      )}
      
      <div className="notice-management">
        <div className="page-header">
          <h1 className="page-title">
            {sectionId ? '분반별 공지사항 관리' : '전체 공지사항 관리'}
          </h1>
          <div className="header-actions">
            <button
              className="btn-primary"
              onClick={handleCreateNotice}
            >
              새 공지사항 작성
            </button>
          </div>
        </div>

        {/* 분반별 페이지가 아닌 경우에만 필터 표시 */}
        {!sectionId && (
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="제목, 내용, 분반으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon"></span>
            </div>
            
            <div className="filter-dropdown">
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">모든 분반</option>
                {uniqueSections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="notices-list">
          {filteredNotices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <div className="notice-header">
                <div className="notice-info">
                  <h3 className="notice-title">{notice.title}</h3>
                  <div className="notice-meta">
                    <span className="notice-section">{notice.sectionName}</span>
                    <span className="notice-date">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </span>

                    {notice.isNew && (
                      <span className="notice-new-badge">NEW</span>
                    )}
                  </div>
                </div>
                
                <div className="notice-actions">
                  <button
                    className="btn-icon edit"
                    onClick={() => handleEditNotice(notice)}
                    title="수정"
                  >
                    <span className="edit-icon"></span>
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDeleteNotice(notice.id)}
                    title="삭제"
                  >
                    <span className="delete-icon"></span>
                  </button>
                </div>
              </div>

              <div className="notice-content">
                <p>{notice.content}</p>
              </div>
            </div>
          ))}

          {filteredNotices.length === 0 && (
            <div className="no-notices">
              <div className="no-notices-message">
                <span className="no-notices-icon">📢</span>
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
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingNotice ? '공지사항 수정' : '새 공지사항 작성'}</h2>
                <button
                  className="modal-close"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="notice-form">
                <div className="form-row">
                  <div className="form-group">
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
                  <div className="form-group">
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



                <div className="form-group">
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

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingNotice ? '수정' : '작성'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default NoticeManagement;
