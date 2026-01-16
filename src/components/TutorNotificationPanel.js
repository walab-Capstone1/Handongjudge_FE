import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell, FaComments } from "react-icons/fa";
import APIService from "../services/APIService";
import "./TutorNotificationPanel.css";

/**
 * TutorNotificationPanel - 튜터 페이지 전용 알림 패널 컴포넌트
 * 
 * 모든 튜터 페이지에서 사용할 수 있는 알림 패널입니다.
 * 오른쪽 하단에 고정되어 있으며, 읽지 않은 알림이 있을 때 시각적 피드백을 제공합니다.
 */
const TutorNotificationPanel = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sections, setSections] = useState([]);

  // 수업 목록 가져오기 (알림의 수업 이름 표시용)
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
      } catch (error) {
        console.error('수업 목록 조회 실패:', error);
      }
    };
    fetchSections();
  }, []);

  // 알림 조회
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      // 모든 수업의 알림 조회 (sectionId 없이)
      const notificationsResponse = await APIService.getCommunityNotifications(null, 0, 20);
      const notificationsList = notificationsResponse.data?.content || [];
      
      // 알림 데이터 변환
      const processedNotifications = notificationsList.map(notif => {
        let title = '';
        let link = '';
        let sectionTitle = '';
        
        switch (notif.type) {
          case 'NOTICE_CREATED':
            title = notif.noticeTitle || '공지사항';
            link = notif.sectionId && notif.noticeId ? `/sections/${notif.sectionId}/course-notices/${notif.noticeId}` : null;
            break;
          case 'ASSIGNMENT_CREATED':
            title = notif.assignmentTitle || '새 과제';
            link = notif.sectionId && notif.assignmentId ? `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}` : null;
            break;
          case 'QUESTION_COMMENT':
            title = notif.message || '커뮤니티에 새 댓글이 달렸습니다';
            link = notif.sectionId && notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
            break;
          case 'COMMENT_ACCEPTED':
            title = notif.message || '댓글이 채택되었습니다';
            link = notif.sectionId && notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
            break;
          default:
            title = notif.message || '알림';
            link = notif.sectionId ? `/sections/${notif.sectionId}/community` : null;
        }
        
        // API에서 직접 courseTitle을 가져오거나, 없으면 sections에서 찾기
        if (notif.courseTitle) {
          sectionTitle = notif.courseTitle;
        } else {
          const section = sections.find(s => s.sectionId === notif.sectionId);
          if (section) {
            sectionTitle = section.courseTitle;
          }
        }
        
        return {
          ...notif,
          displayTitle: title,
          displayLink: link,
          sectionTitle: sectionTitle || '알 수 없는 수업',
          createdAt: notif.createdAt
        };
      });
      
      setNotifications(processedNotifications);
      // 읽지 않은 알림 개수 계산
      const unread = processedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('알림 조회 실패:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // 초기 알림 로드
  useEffect(() => {
    fetchNotifications();
  }, []);

  // 수업 목록이 업데이트되면 알림 다시 조회
  useEffect(() => {
    if (sections.length > 0) {
      fetchNotifications();
    }
  }, [sections]);

  // 알림 아이템 클릭 핸들러
  const handleNotificationClick = (notif, e) => {
    e.stopPropagation();
    let targetPath = null;
    
    // 알림 타입에 따라 정확한 경로로 리다이렉트
    switch (notif.type) {
      case 'NOTICE_CREATED':
        if (notif.sectionId && notif.noticeId) {
          targetPath = `/sections/${notif.sectionId}/course-notices/${notif.noticeId}`;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/course-notices`;
        }
        break;
      case 'ASSIGNMENT_CREATED':
        if (notif.sectionId && notif.assignmentId) {
          targetPath = `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}`;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/course-assignments`;
        }
        break;
      case 'QUESTION_COMMENT':
      case 'COMMENT_ACCEPTED':
      case 'COMMENT_REPLY':
        if (notif.sectionId && notif.questionId) {
          targetPath = `/sections/${notif.sectionId}/community/${notif.questionId}`;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/community`;
        }
        break;
      default:
        if (notif.displayLink) {
          targetPath = notif.displayLink;
        } else if (notif.sectionId) {
          targetPath = `/sections/${notif.sectionId}/community`;
        }
    }
    
    if (targetPath) {
      navigate(targetPath);
      setShowNotificationPanel(false);
    }
  };

  return (
    <div className="tutor-notification-container">
      <button 
        className={`tutor-notification-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setShowNotificationPanel(!showNotificationPanel)}
        title="수업 알림"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="tutor-notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {showNotificationPanel && (
        <>
          <div 
            className="tutor-notification-overlay"
            onClick={() => setShowNotificationPanel(false)}
          ></div>
          <div className="tutor-notification-panel">
            <div className="tutor-notification-panel-header">
              <h2 className="tutor-notification-panel-title">
                <FaBell className="section-title-icon" />
                교수 수업 알림
              </h2>
              <button 
                className="tutor-notification-close-btn"
                onClick={() => setShowNotificationPanel(false)}
              >
                ×
              </button>
            </div>
            <div className="tutor-notification-panel-body">
              {loadingNotifications ? (
                <div className="tutor-notification-loading">
                  <div className="tutor-loading-spinner"></div>
                  <p>알림을 불러오는 중...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="notifications-list">
                  {notifications.map((notif, index) => (
                    <div
                      key={notif.id || index}
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={(e) => handleNotificationClick(notif, e)}
                    >
                      <div className="notification-icon">
                        {notif.type === 'QUESTION_COMMENT' || notif.type === 'COMMENT_ACCEPTED' ? (
                          <FaComments />
                        ) : (
                          <FaBell />
                        )}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notif.displayTitle}</div>
                        <div className="notification-meta">
                          <span className="notification-section">{notif.sectionTitle}</span>
                          <span className="notification-time">
                            {new Date(notif.createdAt).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tutor-notification-empty">
                  <p>알림이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TutorNotificationPanel;

