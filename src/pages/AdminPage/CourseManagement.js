import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import "./CourseManagement.css";

const CourseManagement = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      setLoading(false);
    } catch (error) {
      setSections([]);
      setLoading(false);
    }
  };

  const filteredSections = sections.filter(section =>
    section.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="course-management">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>수업 정보를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="course-management">
        <div className="page-header">
          <h1 className="page-title">수업 관리</h1>
          <div className="header-stats">
            <span className="stat-badge">총 {sections.length}개 분반</span>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="수업명, 교수명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="sections-grid">
          {filteredSections.map((section) => (
            <div key={section.sectionId} className="section-card">
              <div className="section-header">
                <div className="section-info">
                  <h3 className="section-title">{section.courseTitle}</h3>
                  <p className="section-details">{section.sectionNumber}분반</p>
                </div>

              </div>

              <div className="section-stats">
                <div className="stat-item">
                  <span className="stat-icon">👨‍🏫</span>
                  <span className="stat-label">담당교수</span>
                  <span className="stat-value">{section.instructorName}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">🔔</span>
                  <span className="stat-label">새 공지</span>
                  <span className="stat-value">{section.newNoticeCount || 0}개</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📚</span>
                  <span className="stat-label">분반</span>
                  <span className="stat-value">{section.sectionNumber}분반</span>
                </div>
              </div>

              <div className="section-actions-bottom">
                <button 
                  className="btn-secondary"
                  onClick={() => navigate(`/admin/notices/section/${section.sectionId}`)}
                >
                  공지사항 관리
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate(`/admin/users/section/${section.sectionId}`)}
                >
                  수강생 관리
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => navigate(`/admin/assignments/section/${section.sectionId}`)}
                >
                  과제 관리
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="no-sections">
            <div className="no-sections-message">
              <span className="no-sections-icon">📚</span>
              <p>
                {searchTerm 
                  ? '검색 조건에 맞는 수업이 없습니다.' 
                  : '담당하고 있는 수업이 없습니다.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CourseManagement;