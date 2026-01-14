import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../recoil/atoms";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import APIService from "../services/APIService";
import "./CourseNoticeDetailPage.css";

const CourseNoticeDetailPage = () => {
  const { sectionId, noticeId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [activeMenu, setActiveMenu] = useState("공지사항");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  
  // 데이터 상태
  const [sectionInfo, setSectionInfo] = useState(null);
  const [notice, setNotice] = useState(null);
  const [allNotices, setAllNotices] = useState([]);

  useEffect(() => {
    if (sectionId && noticeId && auth.user) {
      fetchNoticeDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, noticeId, auth.user]);

  const fetchNoticeDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // 섹션 정보 조회
      const sectionResponse = await APIService.getSectionInfo(sectionId);
      const sectionData = sectionResponse.data || sectionResponse;
      setSectionInfo(sectionData);

      // 공지사항 목록 조회 (이전/다음 글 찾기 위해)
      const noticesResponse = await APIService.getSectionNotices(sectionId);
      const noticesList = noticesResponse.data || noticesResponse;
      setAllNotices(noticesList);

      // 현재 공지사항 찾기
      const currentNotice = noticesList.find(n => n.id === parseInt(noticeId));
      
      if (!currentNotice) {
        setError("공지사항을 찾을 수 없습니다.");
        return;
      }

      setNotice(currentNotice);

      // 읽음 처리
      if (currentNotice.isNew) {
        try {
          await APIService.markNoticeAsRead(currentNotice.id);
        } catch (readErr) {
          console.error("공지사항 읽음 처리 실패:", readErr);
        }
      }

    } catch (err) {
      console.error("공지사항 상세 조회 실패:", err);
      setError(err.message || "공지사항을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
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
        navigate(`/sections/${sectionId}/course-notices`);
        break;
      case "notification":
        break;
      default:
        break;
    }
  };

  const goToList = () => {
    navigate(`/sections/${sectionId}/course-notices`);
  };

  const goToPrevNotice = () => {
    const currentIndex = allNotices.findIndex(n => n.id === parseInt(noticeId));
    if (currentIndex > 0) {
      const prevNotice = allNotices[currentIndex - 1];
      navigate(`/sections/${sectionId}/course-notices/${prevNotice.id}`);
    }
  };

  const goToNextNotice = () => {
    const currentIndex = allNotices.findIndex(n => n.id === parseInt(noticeId));
    if (currentIndex < allNotices.length - 1) {
      const nextNotice = allNotices[currentIndex + 1];
      navigate(`/sections/${sectionId}/course-notices/${nextNotice.id}`);
    }
  };

  const hasPrevNotice = () => {
    const currentIndex = allNotices.findIndex(n => n.id === parseInt(noticeId));
    return currentIndex > 0;
  };

  const hasNextNotice = () => {
    const currentIndex = allNotices.findIndex(n => n.id === parseInt(noticeId));
    return currentIndex < allNotices.length - 1;
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (loading) {
    return (
      <div className={`course-notice-detail-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="course-notice-detail-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`course-notice-detail-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="course-notice-detail-content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={goToList}>목록으로</button>
          </div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return null;
  }

  return (
    <div className={`course-notice-detail-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick}
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="course-notice-detail-content">
        <CourseHeader
          courseName={
            sectionInfo?.courseTitle 
              ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber || ''}분반`
              : sectionInfo?.courseName || "강의"
          }
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <div className="notice-detail-body">
          <div className="notice-detail-card">
            <div className="notice-detail-header">
              <h1 className="notice-detail-title">{notice.title}</h1>
              <div className="notice-detail-meta">
                <span className="notice-detail-author">작성자: {notice.instructorName || "작성자"}</span>
                <span className="notice-detail-date">날짜: {formatDate(notice.createdAt)}</span>
              </div>
            </div>

            <div className="notice-detail-content">
              <div className="notice-content-text">
                {notice.content || "공지사항 내용이 없습니다."}
              </div>
            </div>

            <div className="notice-detail-footer">
              <button 
                className="nav-button prev"
                onClick={goToPrevNotice}
                disabled={!hasPrevNotice()}
              >
                ← 이전 글
              </button>
              
              <button 
                className="nav-button list"
                onClick={goToList}
              >
                목록으로
              </button>
              
              <button 
                className="nav-button next"
                onClick={goToNextNotice}
                disabled={!hasNextNotice()}
              >
                다음 글 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseNoticeDetailPage;

