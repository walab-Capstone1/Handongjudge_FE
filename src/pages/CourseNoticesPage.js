import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../recoil/atoms";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import APIService from "../services/APIService";
import "./CourseNoticesPage.css";

const CourseNoticesPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [activeMenu, setActiveMenu] = useState("공지사항");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  
  // 데이터 상태
  const [sectionInfo, setSectionInfo] = useState(null);
  const [notices, setNotices] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // desc: 최신순, asc: 오래된순

  useEffect(() => {
    if (sectionId && auth.user) {
      fetchNoticesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, auth.user]);

  const fetchNoticesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 섹션 정보 조회
      const sectionResponse = await APIService.getSectionInfo(sectionId);
      const sectionData = sectionResponse.data || sectionResponse;
      setSectionInfo(sectionData);

      // 공지사항 목록 조회
      const noticesResponse = await APIService.getSectionNotices(sectionId);
      const noticesList = noticesResponse.data || noticesResponse;

      // 최신순으로 정렬
      const sortedNotices = [...noticesList].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotices(sortedNotices);

    } catch (err) {
      console.error("공지사항 데이터 조회 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);

    const sortedNotices = [...notices].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      if (newSortOrder === "desc") {
        return dateB - dateA; // 최신순
      } else {
        return dateA - dateB; // 오래된순
      }
    });

    setNotices(sortedNotices);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const handleMenuClick = (menuId) => {
    switch (menuId) {
      case "dashboard":
        navigate(`/sections/${sectionId}/dashboard`);
        break;
      case "assignment":
        navigate(`/sections/${sectionId}/course-assignments`);
        break;
      case "notice":
        // 현재 페이지
        break;
      case "notification":
        // 알림 페이지로 이동
        break;
      default:
        break;
    }
  };

  const handleNoticeClick = async (notice) => {
    // 새 공지사항인 경우 읽음 처리
    if (notice.isNew) {
      try {
        await APIService.markNoticeAsRead(notice.id);
        
        // 로컬 상태 업데이트
        setNotices(notices.map(n => 
          n.id === notice.id ? { ...n, isNew: false } : n
        ));
      } catch (err) {
        console.error("공지사항 읽음 처리 실패:", err);
      }
    }

    // 공지사항 상세 페이지로 이동
    navigate(`/sections/${sectionId}/course-notices/${notice.id}`);
  };

  const newNoticesCount = notices.filter(n => n.isNew).length;
  const totalNoticesCount = notices.length;

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (loading) {
    return (
      <div className={`course-notices-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="course-notices-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`course-notices-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="course-notices-content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchNoticesData}>다시 시도</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`course-notices-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick}
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="course-notices-content">
        <CourseHeader
          courseName={
            sectionInfo?.courseTitle 
              ? sectionInfo.courseTitle
              : sectionInfo?.courseName || "강의"
          }
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <div className="notices-body">
          <div className="notices-header">
            <h2 className="notices-title">공지사항</h2>
            <div className="notices-summary">
              <span className="new-count">새 공지 {newNoticesCount}</span>
              <span className="total-count">공지사항 {totalNoticesCount}</span>
            </div>
            <div className="sort-button" onClick={handleSortToggle}>
              <span className="sort-text">최신순</span>
              <span className="sort-arrow">{sortOrder === "desc" ? "▼" : "▲"}</span>
            </div>
          </div>

          <div className="notices-list">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  className={`notice-item ${notice.isNew ? 'unread' : ''}`}
                  onClick={() => handleNoticeClick(notice)}
                >
                  <div className="notice-left">
                    <span className="notice-title">{notice.title}</span>
                    {notice.isNew && (
                      <span className="notice-new-badge">NEW</span>
                    )}
                  </div>
                  <div className="notice-right">
                    <span className="notice-author">{notice.instructorName || "작성자"}</span>
                    <span className="notice-date">{formatDate(notice.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notices">
                <p>등록된 공지사항이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseNoticesPage;

