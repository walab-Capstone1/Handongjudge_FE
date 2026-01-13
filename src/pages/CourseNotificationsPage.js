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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 섹션 정보 가져오기
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData);

      // 공지사항 가져오기
      const noticesData = await APIService.getSectionNotices(sectionId);
      
      // 과제 가져오기
      const assignmentsData = await APIService.getAssignmentsBySection(sectionId);

      // 알림 데이터 생성
      const notificationList = [];

      // 공지사항을 알림으로 변환
      if (noticesData && noticesData.length > 0) {
        noticesData.forEach(notice => {
          notificationList.push({
            id: `notice-${notice.id}`,
            type: 'notice',
            originalId: notice.id,
            title: notice.title,
            date: notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '.').replace(/\.$/, '') : '',
            isNew: notice.isNew || false,
            createdAt: notice.createdAt
          });
        });
      }

      // 과제를 알림으로 변환
      if (assignmentsData && assignmentsData.length > 0) {
        assignmentsData.forEach(assignment => {
          notificationList.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            originalId: assignment.id,
            title: assignment.title,
            date: assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '.').replace(/\.$/, '') : '',
            isNew: assignment.isNew || false,
            createdAt: assignment.createdAt
          });
        });
      }

      // 최신순으로 정렬
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
      if (notification.isNew) {
        if (notification.type === 'notice') {
          await APIService.markNoticeAsRead(notification.originalId);
        } else if (notification.type === 'assignment') {
          await APIService.markAssignmentAsRead(notification.originalId);
        }
        
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
      if (notification.type === 'notice') {
        navigate(`/sections/${sectionId}/course-notices/${notification.originalId}`);
      } else if (notification.type === 'assignment') {
        navigate(`/sections/${sectionId}/course-assignments`);
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
                      새로운 {notification.type === 'notice' ? '공지' : '과제'} [{notification.title}]
                    </span>
                    <span className="notification-date">
                      [{notification.date}]
                    </span>
                    <span className={`notification-tag ${notification.type}`}>
                      {notification.type === 'notice' ? '공지' : '과제'}
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

