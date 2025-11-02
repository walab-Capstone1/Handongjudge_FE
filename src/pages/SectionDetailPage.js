import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoadingSpinner from "../components/LoadingSpinner";
import APIService from "../services/APIService";
import "./SectionDetailPage.css";

const SectionDetailPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('assignments');
  const [loading, setLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [notices, setNotices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSectionData();
    
    // URL 쿼리 파라미터에서 탭 설정
    const tabParam = searchParams.get('tab');
    if (tabParam === 'assignments' || tabParam === 'notices') {
      setActiveTab(tabParam);
    }
  }, [sectionId, searchParams]);

  const fetchSectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 섹션 정보, 공지사항, 과제 목록을 가져옴
      const [sectionResponse, noticesResponse, assignmentsResponse] = await Promise.all([
        APIService.getSectionInfo(sectionId),
        APIService.getSectionNotices(sectionId),
        APIService.getAssignments(sectionId)
      ]);

      const sectionData = sectionResponse.data || sectionResponse;
      
      // 비활성화된 수업인지 확인
      if (sectionData.active === false) {
        setError("DISABLED");
        setSectionInfo(sectionData);
        return;
      }

      setSectionInfo(sectionData);
      setNotices(noticesResponse.data || noticesResponse);
      setAssignments(assignmentsResponse.data || assignmentsResponse);

    } catch (err) {
      console.error("분반 데이터 조회 실패:", err);
      setError("분반 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = (notice) => {
    // 공지사항 디테일 페이지로 이동
    navigate(`/sections/${sectionId}/notices/${notice.id}`);
  };

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/sections/${sectionId}/assignments/${assignmentId}/detail`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeadlineStatus = (endDate) => {
    const now = new Date();
    const deadline = new Date(endDate);
    const timeDiff = deadline - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return { text: "마감", color: "red" };
    if (daysDiff === 0) return { text: "오늘 마감", color: "orange" };
    if (daysDiff <= 3) return { text: `${daysDiff}일 남음`, color: "orange" };
    return { text: `${daysDiff}일 남음`, color: "green" };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="section-detail-page">
          <div className="loading-container">
            <LoadingSpinner />
            <p>분반 정보를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    if (error === "DISABLED") {
      return (
        <MainLayout>
          <div className="section-detail-page">
            <div className="disabled-section-container">
              <div className="disabled-icon-large">🚫</div>
              <h2>수업이 비활성화되었습니다</h2>
              <p className="disabled-message">
                {sectionInfo?.courseTitle} - {sectionInfo?.sectionNumber}분반은 현재 비활성화되어 있어<br />
                접근할 수 없습니다.
              </p>
              <p className="disabled-submessage">
                교수님께 문의하시기 바랍니다.
              </p>
              <button onClick={() => navigate('/')} className="btn-primary">
                홈으로 돌아가기
              </button>
            </div>
          </div>
        </MainLayout>
      );
    }
    
    return (
      <MainLayout>
        <div className="section-detail-page">
          <div className="error-container">
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button onClick={() => window.history.back()} className="btn-secondary">
              돌아가기
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="section-detail-page">
        <div className="section-header">
          <div className="section-info">
            <div className="title-container">
              <h1 className="section-title">
                {sectionInfo?.courseTitle} - {sectionInfo?.sectionNumber}분반
              </h1>
           
            </div>
            <p className="section-instructor">{sectionInfo?.instructorName} 교수님</p>
          </div>
        </div>

        <div className="tab-navigation">
        <button 
            className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            과제
            {assignments.filter(a => a.isNew).length > 0 && (
              <span className="new-badge">{assignments.filter(a => a.isNew).length}</span>
            )}
          </button>
          <button 
            className={`tab-button ${activeTab === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            공지사항
            {notices.filter(n => n.isNew).length > 0 && (
              <span className="new-badge">{notices.filter(n => n.isNew).length}</span>
            )}
          </button>
          
        </div>

        <div className="tab-content">
          {activeTab === 'notices' && (
            <div className="notices-section">
              {notices.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h3>등록된 공지사항이 없습니다</h3>
                  <p>새로운 공지사항이 등록되면 여기에 표시됩니다.</p>
                </div>
              ) : (
                <div className="notices-list">
                  {notices.map((notice) => (
                    <div 
                      key={notice.id} 
                      className="notice-card"
                      onClick={() => handleNoticeClick(notice)}
                    >
                      <div className="notice-title-row">
                        <div className="title-and-course">
                          <p className="notice-course">{sectionInfo?.courseTitle} - {sectionInfo?.sectionNumber}분반</p>
                          <h3 className="notice-title">{notice.title}</h3>
                        </div>
                        <div className="notice-meta">
                          <span className="notice-date">{formatDate(notice.createdAt)}</span>
                          {notice.isNew && <span className="new-indicator">NEW</span>}
                        </div>
                      </div>
                      <div className="notice-content">
                        <p className="notice-preview">
                          {notice.content.length > 150 
                            ? `${notice.content.substring(0, 150)}...` 
                            : notice.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="assignments-section">
              {assignments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"></div>
                  <h3>등록된 과제가 없습니다</h3>
                  <p>새로운 과제가 등록되면 여기에 표시됩니다.</p>
                </div>
              ) : (
                <div className="assignments-grid">
                  {assignments.map((assignment) => (
                    <div 
                      key={assignment.id} 
                      className={`assignment-item ${assignment.isNew ? 'new' : ''}`}
                      onClick={() => handleAssignmentClick(assignment.id)}
                    >
                      <div className="assignment-header">
                        <div className="assignment-title-section">
                          <h3 className="assignment-title">{assignment.title}</h3>
                          {assignment.isNew && <span className="new-indicator">NEW</span>}
                        </div>
                        <span className={`deadline-status ${getDeadlineStatus(assignment.endDate).color}`}>
                          {getDeadlineStatus(assignment.endDate).text}
                        </span>
                      </div>
                      <div className="assignment-meta">
                        <div className="assignment-dates">
                          <span className="start-date">시작: {formatDate(assignment.startDate)}</span>
                          <span className="end-date">마감: {formatDate(assignment.endDate)}</span>
                        </div>
                      </div>
                      <div className="assignment-description">
                        {assignment.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SectionDetailPage;
