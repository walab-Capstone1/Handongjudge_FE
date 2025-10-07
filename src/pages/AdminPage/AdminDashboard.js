import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
        setLoading(false);
      } catch (error) {
        setSections([]);
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSection(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>분반 정보를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">담당 분반 목록</h1>
          <p className="dashboard-subtitle">
            분반을 클릭하면 상세 정보를 확인할 수 있습니다.
          </p>
        </div>

        <div className="sections-grid">
          {sections.map((section) => (
            <div 
              key={section.sectionId} 
              className="section-card clickable"
              onClick={() => handleSectionClick(section)}
            >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/notices/section/${section.sectionId}`);
                  }}
                >
                  공지사항
                </button>
                <button 
                  className="btn-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/users/section/${section.sectionId}`);
                  }}
                >
                  학생 관리
                </button>
                <button 
                  className="btn-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/grades/section/${section.sectionId}`);
                  }}
                >
                  성적 관리
                </button>
                <button 
                  className="btn-action primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/assignments/section/${section.sectionId}`);
                  }}
                >
                  과제 관리
                </button>
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="no-sections">
              <div className="no-sections-message">
                <span className="no-sections-icon">📚</span>
                <p>담당하고 있는 분반이 없습니다.</p>
              </div>
            </div>
          )}
        </div>

        {/* 분반 상세 모달 */}
        {showModal && selectedSection && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{selectedSection.courseTitle} - {selectedSection.sectionNumber}분반</h2>
                <button 
                  className="modal-close"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <div className="section-detail-stats">
                  <div className="detail-stat-item">
                    <span className="detail-stat-icon">👨‍🏫</span>
                    <div className="detail-stat-content">
                      <span className="detail-stat-label">담당교수</span>
                      <span className="detail-stat-value">{selectedSection.instructorName}</span>
                    </div>
                  </div>
                  <div className="detail-stat-item">
                    <span className="detail-stat-icon">🔔</span>
                    <div className="detail-stat-content">
                      <span className="detail-stat-label">새 공지</span>
                      <span className="detail-stat-value">{selectedSection.newNoticeCount || 0}개</span>
                    </div>
                  </div>
                  <div className="detail-stat-item">
                    <span className="detail-stat-icon">📚</span>
                    <div className="detail-stat-content">
                      <span className="detail-stat-label">분반</span>
                      <span className="detail-stat-value">{selectedSection.sectionNumber}분반</span>
                    </div>
                  </div>
                </div>

                <div className="section-detail-actions">
                  <button 
                    className="btn-detail"
                    onClick={() => {
                      console.log('공지사항 관리 클릭:', selectedSection);
                      console.log('이동할 URL:', `/admin/notices/section/${selectedSection.sectionId}`);
                      handleCloseModal();
                      navigate(`/admin/notices/section/${selectedSection.sectionId}`);
                    }}
                  >
                    <span className="btn-icon">📢</span>
                    <div className="btn-content">
                      <h4>공지사항 관리</h4>
                      <p>이 분반의 공지사항을 작성하고 관리합니다</p>
                    </div>
                  </button>
                  
                  <button 
                    className="btn-detail"
                    onClick={() => {
                      console.log('수강생 관리 클릭:', selectedSection);
                      console.log('이동할 URL:', `/admin/users/section/${selectedSection.sectionId}`);
                      handleCloseModal();
                      navigate(`/admin/users/section/${selectedSection.sectionId}`);
                    }}
                  >
                    <span className="btn-icon">👥</span>
                    <div className="btn-content">
                      <h4>수강생 관리</h4>
                      <p>이 분반의 수강생 목록을 확인하고 관리합니다</p>
                    </div>
                  </button>
                  
                  <button 
                    className="btn-detail primary"
                    onClick={() => {
                      console.log('과제 관리 클릭:', selectedSection);
                      console.log('이동할 URL:', `/admin/assignments/section/${selectedSection.sectionId}`);
                      handleCloseModal();
                      navigate(`/admin/assignments/section/${selectedSection.sectionId}`);
                    }}
                  >
                    <span className="btn-icon">📝</span>
                    <div className="btn-content">
                      <h4>과제 관리</h4>
                      <p>이 분반의 과제를 생성하고 관리합니다</p>
                    </div>
                  </button>
                  
                  <button className="btn-detail">
                    <span className="btn-icon">📊</span>
                    <div className="btn-content">
                      <h4>성적 관리</h4>
                      <p>학생들의 성적을 확인하고 관리합니다</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;