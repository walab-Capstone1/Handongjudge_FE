import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import Header from "../../components/Header";
import "../AdminPage/CourseManagement.css";

const SuperAdminCourseManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const userName = user?.name || user?.username || user?.email || "시스템 관리자";

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllSectionsForSuperAdmin();
      console.log('수업 목록 API 응답:', response);
      
      // 응답 구조 확인: response.data.data 또는 response.data
      const sectionsData = response?.data?.data || response?.data || response;
      
      if (Array.isArray(sectionsData)) {
        setSections(sectionsData);
      } else {
        console.warn('수업 데이터가 배열이 아닙니다:', sectionsData);
        setSections([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('수업 목록 조회 실패:', error);
      setSections([]);
      setLoading(false);
    }
  };

  const handleToggleActive = async (sectionId, currentActive) => {
    try {
      const newActiveStatus = !currentActive;
      await APIService.toggleSectionActive(sectionId, newActiveStatus);
      alert(newActiveStatus ? '수업이 활성화되었습니다.' : '수업이 비활성화되었습니다.');
      fetchSections();
    } catch (error) {
      console.error('수업 상태 변경 실패:', error);
      alert(error.message || '수업 상태 변경에 실패했습니다.');
    }
  };

  const filteredSections = sections.filter(section =>
    section.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <Header userName={userName} />
        <div className="course-management" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="admin-loading-container">
            <div className="admin-loading-spinner"></div>
            <p>수업 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header userName={userName} />
      <div className="course-management" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="admin-page-header">
          <div className="admin-header-left">
            <h1 className="admin-page-title">수업 관리 (시스템 관리자)</h1>
            <div className="admin-search-box">
              <input
                type="text"
                placeholder="수업명, 교수명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
          <div className="admin-header-right">
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/super-admin')}
            >
              대시보드로
            </button>
            <div className="admin-header-stats">
              <span className="admin-stat-badge">총 {sections.length}개 분반</span>
            </div>
          </div>
        </div>

        <div className="admin-sections-grid">
          {filteredSections.map((section) => (
            <div key={section.sectionId} className="section-card">
              <div className="section-header">
                <h3 className="section-title">{section.courseTitle}</h3>
              </div>

              <div className="section-info-grid">
                <div className="admin-info-row">
                  <span className="admin-info-label">담당교수</span>
                  <span className="admin-info-value">{section.instructorName}</span>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">공지 수</span>
                  <span className="admin-info-value">{section.noticeCount || 0}개</span>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">학생 관리</span>
                  <span className="admin-info-value">{section.studentCount || 0}명</span>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">상태</span>
                  <span className={`info-value ${section.active !== false ? 'status-active' : 'status-inactive'}`}>
                    {section.active !== false ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              <div className="section-actions">
                <button 
                  className={`btn-toggle-active ${section.active !== false ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(section.sectionId, section.active !== false)}
                  title={section.active !== false ? '비활성화하기' : '활성화하기'}
                >
                  {section.active !== false ? '✓ 활성' : '✕ 비활성'}
                </button>
                <button 
                  className="admin-btn-action"
                  onClick={() => navigate(`/admin/notices/section/${section.sectionId}`)}
                >
                  공지사항
                </button>
                <button 
                  className="admin-btn-action"
                  onClick={() => navigate(`/admin/users/section/${section.sectionId}`)}
                >
                  학생 관리
                </button>
                <button 
                  className="admin-btn-action admin-primary"
                  onClick={() => navigate(`/admin/assignments/section/${section.sectionId}`)}
                >
                  과제 관리
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="admin-no-sections">
            <p>
              {searchTerm 
                ? '검색 조건에 맞는 수업이 없습니다.' 
                : '등록된 수업이 없습니다.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminCourseManagement;

