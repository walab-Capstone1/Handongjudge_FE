import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import MainLayout from "../../layouts/MainLayout";
import APIService from "../../services/APIService";
import "./NoticeList.css";

const NoticeList = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchNotices();
    fetchSections();
  }, []);

  const fetchNotices = async () => {
    console.log('🔥 fetchNotices 시작');
    try {
      setLoading(true);
      // 학생이 수강 중인 모든 분반의 공지사항을 가져오기 위해
      // 먼저 대시보드에서 수강 중인 분반 목록을 가져온 후
      // 각 분반의 공지사항을 조회
      console.log('🔥 대시보드 API 호출 시작');
      const dashboardResponse = await APIService.getUserEnrolledSections();
      console.log('🔥 대시보드 API 응답:', dashboardResponse);
      const sectionsData = dashboardResponse?.data || [];
      
      let allNotices = [];
      console.log('🔥 분반 수:', sectionsData.length);
      for (const section of sectionsData) {
        try {
          console.log('🔥 분반 공지사항 조회 시작 - sectionId:', section.sectionId);
          const sectionNotices = await APIService.getSectionNotices(section.sectionId);
          console.log('🔥 분반 공지사항 응답:', sectionNotices);
          console.log('🔥 개별 공지사항 isNew 상태:', sectionNotices.map(n => ({id: n.id, title: n.title, isNew: n.isNew, new: n.new})));
          console.log('🔥 공지사항 원본 데이터:', sectionNotices);
          
          // 각 공지사항에 분반 정보 추가
          const noticesWithSectionInfo = sectionNotices.map(notice => ({
            ...notice,
            sectionName: `${section.courseTitle} - ${section.sectionNumber}분반`
          }));
          
          allNotices = [...allNotices, ...noticesWithSectionInfo];
        } catch (error) {
          console.error(`🔥 분반 ${section.sectionId} 공지사항 조회 실패:`, error);
        }
      }
      
      // 최신순으로 정렬
      allNotices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotices(allNotices);
      
      // 🎯 새로운 공지사항들을 자동으로 읽음 처리
      await markAllNewNoticesAsRead(allNotices);
      
      setLoading(false);
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      setNotices([]);
      setLoading(false);
    }
  };

  // 모든 새로운 공지사항을 읽음 처리하는 함수
  const markAllNewNoticesAsRead = async (notices) => {
    console.log('🔥 markAllNewNoticesAsRead 호출됨 - 전체 공지사항:', notices.length);
    const newNotices = notices.filter(notice => notice.new || notice.isNew);
    console.log('🔥 새로운 공지사항 필터링 결과:', newNotices.length, '개');
    console.log('🔥 새로운 공지사항 목록:', newNotices);
    
    if (newNotices.length === 0) {
      console.log('🔥 새로운 공지사항이 없어서 읽음 처리 스킵');
      return;
    }
    
    console.log('🔥 자동 읽음 처리할 공지사항:', newNotices.length, '개');
    
    try {
      // 모든 새로운 공지사항을 병렬로 읽음 처리
      console.log('🔥 읽음 처리 API 호출 시작');
      await Promise.all(
        newNotices.map(notice => {
          console.log('🔥 개별 공지 읽음 처리:', notice.id);
          return APIService.markNoticeAsRead(notice.id);
        })
      );
      
      // 상태 업데이트: 모든 공지사항을 읽음으로 표시
      setNotices(prev => prev.map(n => 
        newNotices.some(newNotice => newNotice.id === n.id) 
          ? { ...n, new: false, isNew: false }
          : n
      ));
      
      console.log('🔥 모든 새로운 공지사항 읽음 처리 완료');
    } catch (error) {
      console.error('🔥 공지사항 자동 읽음 처리 실패:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const dashboardResponse = await APIService.getUserEnrolledSections();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
    } catch (error) {
      console.error('분반 정보 조회 실패:', error);
      setSections([]);
    }
  };

  const handleNoticeClick = async (notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
    
    // 공지사항을 읽음 처리
    if (notice.new || notice.isNew) { // isNew 또는 new 필드 확인
      try {
        console.log('🔥 공지사항 읽음 처리 시작:', notice.id);
        const response = await APIService.markNoticeAsRead(notice.id);
        console.log('🔥 공지사항 읽음 처리 응답:', response);
        
        // 목록에서도 읽음 상태로 업데이트
        setNotices(prev => prev.map(n => 
          n.id === notice.id ? { ...n, new: false, isNew: false } : n
        ));
        console.log('🔥 공지사항 상태 업데이트 완료:', notice.id);
      } catch (error) {
        console.error('🔥 공지사항 읽음 처리 실패:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNotice(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#636e72';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '중요';
      default: return '일반';
    }
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'ALL' || notice.sectionId.toString() === filterSection;
    return matchesSearch && matchesSection;
  });

  const uniqueSections = notices.reduce((acc, notice) => {
    if (!acc.find(section => section.id === notice.sectionId)) {
      acc.push({ 
        id: notice.sectionId, 
        name: notice.sectionName 
      });
    }
    return acc;
  }, []).filter(Boolean);

  const newNoticesCount = notices.filter(notice => notice.new || notice.isNew).length;

  if (loading) {
    return (
      <MainLayout>
        <div className="notice-list-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="notice-list-container">
        <div className="notice-header">
          <div className="header-info">
            <h1 className="page-title">공지사항</h1>
            <p className="page-subtitle">
              수강 중인 분반의 공지사항을 확인하세요.
            </p>
          </div>
          <div className="header-stats">
            <span className="stat-badge">총 {notices.length}개</span>
            {newNoticesCount > 0 && (
              <span className="stat-badge new">새 공지 {newNoticesCount}개</span>
            )}
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="제목, 내용, 분반으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
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

        <div className="notices-grid">
          {filteredNotices.map((notice) => (
            <div 
              key={notice.id} 
              className={`notice-item ${(notice.new || notice.isNew) ? 'new' : ''}`}
              onClick={() => handleNoticeClick(notice)}
            >
              <div className="notice-item-header">
                <div className="notice-badges">
                  {(notice.new || notice.isNew) && (
                    <span className="new-badge">NEW</span>
                  )}
                  {notice.difficulty && (
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(notice.difficulty) }}
                    >
                      {getDifficultyLabel(notice.difficulty)}
                    </span>
                  )}
                </div>
                <span className="notice-date">
                  {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              
              <h3 className="notice-item-title">{notice.title}</h3>
              <p className="notice-item-preview">
                {notice.content.length > 100 
                  ? notice.content.substring(0, 100) + '...' 
                  : notice.content
                }
              </p>
              
              <div className="notice-item-footer">
                <span className="notice-section">{notice.sectionName}</span>
                <span className="read-more">자세히 보기 →</span>
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
                      <p><strong>공지사항이 없습니다</strong></p>
                      <p>아직 수강 중인 분반에 공지사항이 없습니다.</p>
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

        {/* 공지사항 상세 모달 */}
        {showModal && selectedNotice && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>{selectedNotice.title}</h2>
                  <div className="modal-meta">
                    <span className="modal-section">{selectedNotice.sectionName}</span>
                    <span className="modal-date">
                      {new Date(selectedNotice.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {selectedNotice.difficulty && (
                      <span 
                        className="modal-difficulty"
                        style={{ color: getDifficultyColor(selectedNotice.difficulty) }}
                      >
                        {getDifficultyLabel(selectedNotice.difficulty)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="modal-close"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="notice-content">
                  <p>{selectedNotice.content}</p>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-primary" onClick={handleCloseModal}>
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NoticeList;

