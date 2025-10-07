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
          <div className="header-left">
            <h1 className="page-title">수업 관리</h1>
            <div className="search-box">
              <input
                type="text"
                placeholder="수업명, 교수명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <span className="stat-badge">총 {sections.length}개 분반</span>
            </div>
          </div>
        </div>

        <div className="sections-grid">
          {filteredSections.map((section) => (
            <div key={section.sectionId} className="section-card">
              <div className="section-header">
                <h3 className="section-title">{section.courseTitle}</h3>
                <span className="section-badge">{section.sectionNumber}분반</span>
              </div>

              <div className="section-info-grid">
                <div className="info-row">
                  <span className="info-label">담당교수</span>
                  <span className="info-value">{section.instructorName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">공지 수</span>
                  <span className="info-value">{section.noticeCount || 0}개</span>
                </div>
                <div className="info-row">
                  <span className="info-label">학생 관리</span>
                  <span className="info-value">{section.studentCount || 0}명</span>
                </div>
                <div className="info-row">
                  <span className="info-label">생성일</span>
                  <span className="info-value">{section.createdAt || '-'}</span>
                </div>
              </div>

              <div className="section-actions">
                <button 
                  className="btn-action"
                  onClick={() => navigate(`/admin/notices/section/${section.sectionId}`)}
                >
                  공지사항
                </button>
                <button 
                  className="btn-action"
                  onClick={() => navigate(`/admin/users/section/${section.sectionId}`)}
                >
                  학생 관리
                </button>
                <button 
                  className="btn-action"
                  onClick={() => navigate(`/admin/grades/section/${section.sectionId}`)}
                >
                  성적 관리
                </button>
                <button 
                  className="btn-action primary"
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
            <p>
              {searchTerm 
                ? '검색 조건에 맞는 수업이 없습니다.' 
                : '담당하고 있는 수업이 없습니다.'
              }
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CourseManagement;