import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../recoil/atoms";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import APIService from "../services/APIService";
import "./CourseNotificationsPage.css";

const CourseNotificationsPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [sectionInfo, setSectionInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("latest"); // "latest" or "oldest"
  
  // 통계
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    notices: 0,
    assignments: 0
  });

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 섹션 정보 가져오기
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData);

      // 커뮤니티 알림 조회 (통합 알림 시스템)
      const notificationsResponse = await APIService.getCommunityNotifications(sectionId, 0, 200);
      const notificationsList = notificationsResponse.data?.content || [];

      // 알림 데이터 변환
      const notificationList = notificationsList.map(notif => {
        // 알림 타입에 따라 다른 정보 표시
        let title = '';
        let link = '';
        let displayType = '';
        
        switch (notif.type) {
          case 'NOTICE_CREATED':
            title = notif.noticeTitle || '공지사항';
            link = notif.noticeId ? `/sections/${sectionId}/course-notices/${notif.noticeId}` : null;
            displayType = 'notice';
            break;
          case 'ASSIGNMENT_CREATED':
            title = notif.assignmentTitle || '과제';
            link = notif.assignmentId ? `/sections/${sectionId}/course-assignments?assignmentId=${notif.assignmentId}` : null;
            displayType = 'assignment';
            break;
          case 'QUESTION_COMMENT':
            title = notif.message || '내 질문에 댓글이 달렸습니다';
            link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
            displayType = 'community';
            break;
          case 'COMMENT_ACCEPTED':
            title = notif.message || '내 댓글이 채택되었습니다';
            link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
            displayType = 'community';
            break;
          case 'QUESTION_LIKED':
          case 'COMMENT_LIKED':
            title = notif.message || '추천을 받았습니다';
            link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
            displayType = 'community';
            break;
          case 'QUESTION_PINNED':
            title = notif.message || '내 질문이 고정되었습니다';
            link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
            displayType = 'community';
            break;
          case 'QUESTION_RESOLVED':
            title = notif.message || '내 질문이 해결되었습니다';
            link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
            displayType = 'community';
            break;
          default:
            title = notif.message || '새 알림';
            displayType = 'other';
            break;
        }
        
        return {
          id: notif.id,
          type: displayType,
          originalId: notif.noticeId || notif.assignmentId || notif.questionId || notif.id,
          title: title,
          date: formatDate(notif.createdAt),
          isNew: !notif.isRead,
          createdAt: notif.createdAt,
          link: link,
          notificationType: notif.type
        };
      });

      // 최신순으로 정렬 (이미 백엔드에서 정렬되어 있지만, 안전을 위해)
      notificationList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(notificationList);

      // 통계 계산
      const unreadCount = notificationList.filter(n => n.isNew).length;
      const noticeCount = notificationList.filter(n => n.type === 'notice').length;
      const assignmentCount = notificationList.filter(n => n.type === 'assignment').length;

      setStats({
        total: notificationList.length,
        unread: unreadCount,
        notices: noticeCount,
        assignments: assignmentCount
      });

    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortToggle = () => {
    setSortOrder(prev => prev === "latest" ? "oldest" : "latest");
    setNotifications(prev => [...prev].reverse());
  };

  const handleNotificationClick = async (notification) => {
    try {
      // 읽음 처리
      if (notification.isNew && notification.id) {
        await APIService.markCommunityNotificationAsRead(notification.id);
        
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, isNew: false } : n
          )
        );
        
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }

      // 페이지 이동
      if (notification.link) {
        navigate(notification.link);
      } else {
        // link가 없는 경우 타입별 기본 경로
        if (notification.type === 'notice') {
          navigate(`/sections/${sectionId}/course-notices/${notification.originalId}`);
        } else if (notification.type === 'assignment') {
          navigate(`/sections/${sectionId}/course-assignments`);
        } else if (notification.type === 'community') {
          navigate(`/sections/${sectionId}/community/${notification.originalId}`);
        }
      }
    } catch (error) {
      console.error("알림 처리 실패:", error);
    }
  };

  if (loading) {
    return (
      <div className="notifications-page-container">
        <CourseSidebar sectionId={sectionId} activeMenu="알림" />
        <div className="notifications-page-content">
          <CourseHeader
            courseName={
              sectionInfo?.courseTitle 
                ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber || ''}분반`
                : "강의"
            }
          />
          <div className="notifications-page-body">
            <div className="loading-message">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page-container">
      <CourseSidebar sectionId={sectionId} activeMenu="알림" />
      
      <div className="notifications-page-content">
        <CourseHeader
          courseName={
            sectionInfo?.courseTitle 
              ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber || ''}분반`
              : sectionInfo?.courseName || "강의"
          }
        />

        <div className="notifications-page-body">
          <h2 className="notifications-page-title">알림</h2>

          {/* 통계 및 정렬 */}
          <div className="notifications-stats-bar">
            <div className="notifications-stats">
              <span className="stat-item">전체 {stats.total}</span>
              <span className="stat-item">안 읽음 {stats.unread}</span>
              <span className="stat-item">공지 {stats.notices}</span>
              <span className="stat-item">과제 {stats.assignments}</span>
            </div>
            <button className="sort-button" onClick={handleSortToggle}>
              <span>최신순</span>
              <span className={`sort-arrow ${sortOrder === "latest" ? "desc" : "asc"}`}>
                ▲
              </span>
            </button>
          </div>

          {/* 알림 리스트 */}
          <div className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${notification.isNew ? 'unread' : 'read'} ${notification.type}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <span className="notification-title">
                      {notification.title}
                    </span>
                    <span className="notification-date">
                      [{notification.date}]
                    </span>
                    <span className={`notification-tag ${notification.type}`}>
                      {notification.type === 'notice' ? '공지' : 
                       notification.type === 'assignment' ? '과제' : 
                       notification.type === 'community' ? '커뮤니티' : '알림'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications-message">
                <span>알림이 없습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseNotificationsPage;

