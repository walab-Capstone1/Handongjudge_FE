import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import "./CourseNotificationManagement.css";

const CourseNotificationManagement = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchNotifications();
  }, [sectionId, currentPage, filterType, filterRead]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // sectionId가 있으면 해당 수업만, 없으면 전체 조회
      const targetSectionId = sectionId ? parseInt(sectionId) : null;
      
      const response = await APIService.getCommunityNotifications(targetSectionId, currentPage, pageSize);
      const data = response?.data || {};
      
      let notificationsData = [];
      if (data.content) {
        notificationsData = data.content;
      } else if (Array.isArray(data)) {
        notificationsData = data;
      }

      // 타입 필터링
      if (filterType !== 'ALL') {
        notificationsData = notificationsData.filter(notif => {
          if (filterType === 'ASSIGNMENT') {
            return notif.type === 'ASSIGNMENT_CREATED' || notif.type === 'ASSIGNMENT_DEADLINE';
          } else if (filterType === 'STUDENT') {
            return notif.type === 'STUDENT_ENROLLED';
          } else if (filterType === 'NOTICE') {
            return notif.type === 'NOTICE_CREATED';
          }
          return notif.type === filterType;
        });
      }

      // 읽음 상태 필터링
      if (filterRead !== 'ALL') {
        notificationsData = notificationsData.filter(notif => {
          if (filterRead === 'UNREAD') {
            return !notif.isRead;
          } else if (filterRead === 'READ') {
            return notif.isRead;
          }
          return true;
        });
      }

      setNotifications(notificationsData);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || notificationsData.length);
      setLoading(false);
    } catch (error) {
      console.error('알림 조회 실패:', error);
      setNotifications([]);
      setLoading(false);
    }
  };


  const handleMarkAsRead = async (notificationId) => {
    try {
      await APIService.markCommunityNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      alert('알림 읽음 처리에 실패했습니다.');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (window.confirm('모든 알림을 읽음 처리하시겠습니까?')) {
      try {
        await APIService.markAllNotificationsAsRead();
        fetchNotifications();
        alert('모든 알림을 읽음 처리했습니다.');
      } catch (error) {
        console.error('전체 읽음 처리 실패:', error);
        alert('전체 읽음 처리에 실패했습니다.');
      }
    }
  };

  const getNotificationTypeLabel = (type) => {
    const typeMap = {
      'ASSIGNMENT_CREATED': '과제 생성',
      'ASSIGNMENT_DEADLINE': '과제 마감',
      'STUDENT_ENROLLED': '학생 추가',
      'NOTICE_CREATED': '공지사항',
      'QUESTION_COMMENT': '질문 댓글',
      'COMMENT_REPLY': '댓글 답글',
      'QUESTION_PINNED': '질문 고정',
      'QUESTION_RESOLVED': '질문 해결',
      'COMMENT_ACCEPTED': '댓글 채택',
      'QUESTION_LIKED': '질문 추천',
      'COMMENT_LIKED': '댓글 추천'
    };
    return typeMap[type] || type;
  };

  const getNotificationTypeIcon = (type) => {
    if (type === 'ASSIGNMENT_CREATED' || type === 'ASSIGNMENT_DEADLINE') {
      return '📝';
    } else if (type === 'STUDENT_ENROLLED') {
      return '👤';
    } else if (type === 'NOTICE_CREATED') {
      return '📢';
    } else {
      return '🔔';
    }
  };

  const getNotificationTypeColor = (type) => {
    if (type === 'ASSIGNMENT_DEADLINE') {
      return '#dc3545';
    } else if (type === 'ASSIGNMENT_CREATED') {
      return '#667eea';
    } else if (type === 'STUDENT_ENROLLED') {
      return '#28a745';
    } else if (type === 'NOTICE_CREATED') {
      return '#ffc107';
    }
    return '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = (notification) => {
    // 알림 타입에 따라 적절한 페이지로 이동
    if (notification.assignmentId) {
      navigate(`/tutor/assignments/section/${notification.sectionId || sectionId}`);
    } else if (notification.noticeId) {
      navigate(`/tutor/notices/section/${notification.sectionId || sectionId}`);
    } else if (notification.type === 'STUDENT_ENROLLED') {
      navigate(`/tutor/users/section/${notification.sectionId || sectionId}`);
    }
    
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notif.message?.toLowerCase().includes(searchLower) ||
        getNotificationTypeLabel(notif.type)?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && notifications.length === 0) {
    return (
      <TutorLayout>
        <div className="course-notification-management">
          <div className="course-notification-management-loading">
            <div className="course-notification-management-spinner"></div>
            <p>알림을 불러오는 중...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="course-notification-management">
        {/* 타이틀 헤더 섹션 */}
        <div className="course-notification-management-title-header">
          <div className="course-notification-management-title-left">
            <h1 className="course-notification-management-title">알림 관리</h1>
            <div className="course-notification-management-title-stats">
              <span className="course-notification-management-stat-badge">
                총 {totalElements}개 알림
              </span>
              {filteredNotifications.filter(n => !n.isRead).length > 0 && (
                <span className="course-notification-management-stat-badge unread">
                  읽지 않음 {filteredNotifications.filter(n => !n.isRead).length}개
                </span>
              )}
            </div>
          </div>
          <div className="course-notification-management-title-right">
            <button 
              className="course-notification-management-btn-mark-all"
              onClick={handleMarkAllAsRead}
            >
              모두 읽음 처리
            </button>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="course-notification-management-filters-section">
          <div className="course-notification-management-search-box">
            <input
              type="text"
              className="course-notification-management-search-input"
              placeholder="알림 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="course-notification-management-filter-group">
            <select
              className="course-notification-management-filter-select"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="ALL">전체 타입</option>
              <option value="ASSIGNMENT">과제 관련</option>
              <option value="STUDENT">학생 추가</option>
              <option value="NOTICE">공지사항</option>
            </select>
          </div>

          <div className="course-notification-management-filter-group">
            <select
              className="course-notification-management-filter-select"
              value={filterRead}
              onChange={(e) => {
                setFilterRead(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="ALL">전체</option>
              <option value="UNREAD">읽지 않음</option>
              <option value="READ">읽음</option>
            </select>
          </div>
        </div>

        {/* 알림 목록 */}
        <div className="course-notification-management-list">
          {filteredNotifications.length === 0 ? (
            <div className="course-notification-management-empty">
              <p>알림이 없습니다.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`course-notification-management-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="course-notification-management-item-icon" style={{ backgroundColor: getNotificationTypeColor(notification.type) + '20', color: getNotificationTypeColor(notification.type) }}>
                  {getNotificationTypeIcon(notification.type)}
                </div>
                <div className="course-notification-management-item-content">
                  <div className="course-notification-management-item-header">
                    <span className="course-notification-management-item-type" style={{ color: getNotificationTypeColor(notification.type) }}>
                      {getNotificationTypeLabel(notification.type)}
                    </span>
                    <span className="course-notification-management-item-date">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <div className="course-notification-management-item-message">
                    {notification.message}
                  </div>
                  {notification.sectionName && (
                    <div className="course-notification-management-item-section">
                      {notification.sectionName}
                    </div>
                  )}
                </div>
                {!notification.isRead && (
                  <div className="course-notification-management-item-unread-badge"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="course-notification-management-pagination">
            <button
              className="course-notification-management-pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              이전
            </button>
            <span className="course-notification-management-pagination-info">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              className="course-notification-management-pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default CourseNotificationManagement;

