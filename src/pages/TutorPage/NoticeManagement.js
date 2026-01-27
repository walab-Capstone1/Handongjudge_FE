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
  const [openMoreMenu, setOpenMoreMenu] = useState(null);

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
    // 페이지로 이동
    if (sectionId) {
      navigate(`/tutor/notices/section/${sectionId}/create`);
    } else {
      navigate('/tutor/notices/create');
    }
  };

  const handleEditNotice = (notice) => {
    // 페이지로 이동
    const noticeSectionId = sectionId || notice.sectionId;
    if (noticeSectionId) {
      navigate(`/tutor/notices/section/${noticeSectionId}/${notice.id}/edit`);
    } else {
      navigate(`/tutor/notices/${notice.id}/edit`);
    }
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




  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'ALL' || notice.sectionId.toString() === filterSection;
    return matchesSearch && matchesSection;
  });

  // sectionName에서 "분반" 텍스트 및 sectionNumber 제거 헬퍼 함수
  const getSectionNameWithoutSection = (sectionName) => {
    if (!sectionName) return '미지정';
    // "분반" 텍스트와 관련된 모든 패턴 제거
    // 예: " - 1분반", " (1분반)", " 1분반", "분반 1", "1분반", "null분반" 등
    let cleaned = sectionName
      .replace(/\s*[-–]\s*\d+분반/gi, '')           // " - 1분반"
      .replace(/\s*\(\d+분반\)/gi, '')             // " (1분반)"
      .replace(/\s+\d+분반/gi, '')                  // " 1분반"
      .replace(/\s*분반\s*\d+/gi, '')               // "분반 1"
      .replace(/\d+분반/gi, '')                     // "1분반"
      .replace(/\s*[-–]\s*분반\s*\d+/gi, '')       // " - 분반 1"
      .replace(/\s*\(\s*분반\s*\d+\s*\)/gi, '')    // " ( 분반 1 )"
      .replace(/\s*[-–]\s*null\s*분반/gi, '')      // " - null 분반"
      .replace(/\s*\(\s*null\s*분반\s*\)/gi, '')  // " ( null 분반 )"
      .replace(/\s+null\s*분반/gi, '')             // " null 분반"
      .replace(/null\s*분반/gi, '')                 // "null 분반"
      .replace(/\s*[-–]\s*null분반/gi, '')         // " - null분반"
      .replace(/\s*\(\s*null분반\s*\)/gi, '')      // " ( null분반 )"
      .replace(/\s+null분반/gi, '')                 // " null분반"
      .replace(/null분반/gi, '')                    // "null분반"
      .replace(/\s+/g, ' ')                         // 연속된 공백을 하나로
      .trim();
    return cleaned || '미지정';
  };

  const uniqueSections = Array.from(
    new Map(notices.map(notice => [notice.sectionId, { id: notice.sectionId, name: getSectionNameWithoutSection(notice.sectionName) }])).values()
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
                {currentSection.courseTitle}
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

        <div className="tutor-notices-table-container">
          <table className="tutor-notices-table">
            <thead>
              <tr>
                <th className="tutor-notice-title-cell">제목</th>
                <th className="tutor-notice-section-cell">수업</th>
                <th className="tutor-notice-date-cell">작성일</th>
                <th className="tutor-notice-actions-cell">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="tutor-table-empty">
                    {notices.length === 0 ? '작성된 공지사항이 없습니다.' : '검색 조건에 맞는 공지사항이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice) => (
                  <tr key={notice.id} className={notice.active === false ? 'tutor-disabled' : ''}>
                    <td className="tutor-notice-title-cell">
                      <div>
                        <div className="tutor-notice-title">
                          {notice.title}
                          {notice.isNew && (
                            <span className="notice-new-badge">NEW</span>
                          )}
                        </div>
                        {notice.content && (
                          <div className="tutor-notice-description">{notice.content}</div>
                        )}
                      </div>
                    </td>
                    <td className="tutor-notice-section-cell">
                      {getSectionNameWithoutSection(notice.sectionName)}
                    </td>
                    <td className="tutor-notice-date-cell">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="tutor-notice-actions-cell">
                      <div className="tutor-notice-actions-inline">
                        <div className="tutor-notice-primary-actions">
                          <button 
                            className="tutor-btn-table-action tutor-btn-edit"
                            onClick={() => handleEditNotice(notice)}
                            title="수정"
                          >
                            수정
                          </button>
                        </div>
                        <div className="tutor-notice-secondary-actions">
                          <div className="tutor-secondary-actions-layer">
                            <button 
                              className="tutor-btn-table-action tutor-btn-secondary-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(notice.id, notice.active);
                              }}
                              title={notice.active ? '비활성화' : '활성화'}
                            >
                              {notice.active ? '비활성화' : '활성화'}
                            </button>
                            <div className="tutor-more-menu">
                              <button 
                                className="tutor-btn-table-action tutor-btn-secondary-action tutor-btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMoreMenu(openMoreMenu === notice.id ? null : notice.id);
                                }}
                                title="더보기"
                              >
                                ⋯
                              </button>
                              {openMoreMenu === notice.id && (
                                <div className="tutor-more-dropdown">
                                  <button 
                                    className="tutor-btn-text-small tutor-delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotice(notice.id);
                                      setOpenMoreMenu(null);
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </TutorLayout>
  );
};

export default NoticeManagement;
