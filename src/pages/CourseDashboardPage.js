import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../recoil/atoms";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import CourseCard from "../components/CourseCard";
import APIService from "../services/APIService";
import "./CourseDashboardPage.css";

const CourseDashboardPage = () => {
  const navigate = useNavigate();
  const { sectionId: sectionIdParam } = useParams();
  // sectionId가 undefined일 수 있으므로 명시적으로 처리
  const sectionId = sectionIdParam || null;
  const auth = useRecoilValue(authState);
  
  const [activeMenu, setActiveMenu] = useState("대시보드");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  
  // 데이터 상태
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [allNotices, setAllNotices] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [sectionNewItems, setSectionNewItems] = useState({});
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    if (auth.user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, sectionId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // sectionId가 있으면 해당 수업 정보 조회
      if (sectionId) {
        try {
      const sectionResponse = await APIService.getSectionInfo(sectionId);
      const sectionData = sectionResponse.data || sectionResponse;
      setSectionInfo(sectionData);
        } catch (err) {
          console.error("수업 정보 조회 실패:", err);
        }
      } else {
        setSectionInfo(null);
      }

      // 모든 수업 조회
      const sectionsResponse = await APIService.getUserEnrolledSections();
      const sectionsData = sectionsResponse.data || sectionsResponse;
      setEnrolledSections(sectionsData);

      // 모든 수업의 공지사항, 과제, 알림 수집
      let noticesList = [];
      let assignmentsList = [];
      let notificationsList = [];
      // 각 수업별로 새로운 과제/공지사항 정보 저장
      let sectionNewItems = {};

      // 각 수업별로 데이터 수집
      for (const section of sectionsData) {
        try {
          // 공지사항 조회
          const noticesResponse = await APIService.getSectionNotices(section.sectionId);
          const notices = noticesResponse.data || noticesResponse;
          const noticesWithSection = notices.map(notice => ({
            ...notice,
            sectionId: section.sectionId,
            sectionName: section.courseTitle
          }));
          noticesList = [...noticesList, ...noticesWithSection];

          // 과제 조회
          const assignmentsResponse = await APIService.getAssignmentsBySection(section.sectionId);
          const assignments = assignmentsResponse.data || assignmentsResponse;
          const assignmentsWithSection = assignments.map(assignment => ({
            ...assignment,
            sectionId: section.sectionId,
            sectionName: section.courseTitle
          }));
          assignmentsList = [...assignmentsList, ...assignmentsWithSection];

          // 알림 조회 (각 수업별)
          try {
            const notificationsResponse = await APIService.getCommunityNotifications(section.sectionId, 0, 50);
            const notifications = notificationsResponse.data?.content || [];
            const notificationsWithSection = notifications.map(notif => ({
              ...notif,
              sectionId: section.sectionId,
              sectionName: section.courseTitle
            }));
            notificationsList = [...notificationsList, ...notificationsWithSection];

            // 읽지 않은 새로운 과제/공지사항/알림 찾기
            const unreadNotifications = notifications.filter(notif => !notif.isRead);
            const newAssignment = unreadNotifications.find(notif => notif.type === 'ASSIGNMENT_CREATED');
            const newNotice = unreadNotifications.find(notif => notif.type === 'NOTICE_CREATED');
            // 과제/공지사항이 아닌 다른 알림들 (커뮤니티 관련 알림)
            const otherNotifications = unreadNotifications.filter(notif => 
              notif.type !== 'ASSIGNMENT_CREATED' && 
              notif.type !== 'NOTICE_CREATED' &&
              (notif.type === 'QUESTION_COMMENT' || 
               notif.type === 'COMMENT_ACCEPTED' || 
               notif.type === 'QUESTION_LIKED' || 
               notif.type === 'COMMENT_LIKED')
            );
            const newNotification = otherNotifications.length > 0 ? otherNotifications[0] : null; // 가장 최신 알림 하나만

            sectionNewItems[section.sectionId] = {
              newAssignment: newAssignment ? {
                id: newAssignment.id,
                assignmentId: newAssignment.assignmentId,
                title: newAssignment.assignmentTitle || '과제'
              } : null,
              newNotice: newNotice ? {
                id: newNotice.id,
                noticeId: newNotice.noticeId,
                title: newNotice.noticeTitle || '공지사항'
              } : null,
              newNotification: newNotification ? {
                id: newNotification.id,
                questionId: newNotification.questionId,
                type: newNotification.type,
                title: newNotification.message || '새 알림'
              } : null
            };
          } catch (notifErr) {
            console.error(`수업 ${section.sectionId} 알림 조회 실패:`, notifErr);
            sectionNewItems[section.sectionId] = {
              newAssignment: null,
              newNotice: null,
              newNotification: null
            };
          }
        } catch (err) {
          console.error(`수업 ${section.sectionId} 데이터 조회 실패:`, err);
          sectionNewItems[section.sectionId] = {
            newAssignment: null,
            newNotice: null,
            newNotification: null
          };
        }
      }

      // 공지사항 정렬: 최신 작성일 기준 내림차순
      const sortedNotices = noticesList
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5); // 최근 5개만 표시

      // 과제 정렬: 마감일이 가까운 순, 마감된 과제는 하단으로
      const now = new Date();
      const activeAssignments = assignmentsList.filter(a => new Date(a.endDate) >= now);
      const expiredAssignments = assignmentsList.filter(a => new Date(a.endDate) < now);
      
      activeAssignments.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
      expiredAssignments.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
      
      const sortedAssignments = [...activeAssignments, ...expiredAssignments].slice(0, 5); // 최대 5개만 표시

      // 알림 정렬: 최근 발생한 알림이 최상단
      const sortedNotifications = notificationsList
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5) // 최대 5개만 표시
            .map(notif => {
              // 알림 타입에 따라 다른 정보 표시
              let title = '';
              let link = '';
              
              switch (notif.type) {
                case 'NOTICE_CREATED':
                  title = `새 공지사항: ${notif.noticeTitle || '공지사항'}`;
              link = notif.noticeId ? `/sections/${notif.sectionId}/course-notices/${notif.noticeId}` : null;
                  break;
                case 'ASSIGNMENT_CREATED':
                  title = `새 과제: ${notif.assignmentTitle || '과제'}`;
              link = notif.assignmentId ? `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}` : null;
                  break;
                case 'QUESTION_COMMENT':
                  title = notif.message || '내 질문에 댓글이 달렸습니다';
              link = notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
                  break;
                case 'COMMENT_ACCEPTED':
                  title = notif.message || '내 댓글이 채택되었습니다';
              link = notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
                  break;
                case 'QUESTION_LIKED':
                case 'COMMENT_LIKED':
                  title = notif.message || '추천을 받았습니다';
              link = notif.questionId ? `/sections/${notif.sectionId}/community/${notif.questionId}` : null;
                  break;
                default:
                  title = notif.message || '새 알림';
                  break;
              }
              
              return {
                id: notif.id,
                title: title,
                date: formatDate(notif.createdAt),
                isNew: !notif.isRead,
                type: notif.type,
            link: link,
            sectionName: notif.sectionName
              };
            });
          
      setAllNotices(sortedNotices);
      setAllAssignments(sortedAssignments);
      setAllNotifications(sortedNotifications);
      setSectionNewItems(sectionNewItems);

    } catch (err) {
      console.error("대시보드 데이터 조회 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
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

  const formatDeadline = (dateString) => {
    if (!dateString) return "";
    return `${formatDate(dateString)} 마감`;
  };

  const calculateDDay = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleMenuClick = (menuId) => {
    // 사이드바 메뉴 클릭 시 아무 동작도 하지 않음 (통합 대시보드이므로)
  };

  const handleNotificationClick = async (notification) => {
    // 알림 타입에 따라 다른 페이지로 이동
    if (notification.link) {
      navigate(notification.link);
      
      // 알림 읽음 처리
      if (notification.isNew && notification.id) {
        try {
          await APIService.markCommunityNotificationAsRead(notification.id);
          // 알림 목록 새로고침
          fetchDashboardData();
        } catch (err) {
          console.error('알림 읽음 처리 실패:', err);
        }
      }
    }
  };

  const handleNoticeClick = (notice) => {
    // 공지사항 상세페이지로 이동 (이미 수업 정보가 포함되어 있으므로 바로 이동)
    navigate(`/sections/${notice.sectionId}/course-notices/${notice.id}`);
  };

  const handleAssignmentClick = (assignment) => {
    // 과제 페이지로 이동 (이미 수업 정보가 포함되어 있으므로 바로 이동)
    navigate(`/sections/${assignment.sectionId}/course-assignments?assignmentId=${assignment.id}`);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // URL이나 입력값에서 참가 코드 추출
  const extractEnrollmentCode = (input) => {
    const trimmed = input.trim();
    
    // URL 패턴 체크: /enroll/코드 형식
    const urlPattern = /\/enroll\/([^\/\s?#]+)/;
    const urlMatch = trimmed.match(urlPattern);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // 전체 URL인 경우 (http://... 또는 https://...)
    try {
      const url = new URL(trimmed);
      const pathMatch = url.pathname.match(/\/enroll\/([^\/\s?#]+)/);
      if (pathMatch) {
        return pathMatch[1];
      }
    } catch (e) {
      // URL이 아닌 경우 그대로 사용
    }
    
    // 참가 코드만 입력한 경우 그대로 반환
    return trimmed;
  };

  const handleEnrollByCode = async () => {
    if (!enrollmentCode.trim()) {
      alert('참가 코드를 입력하세요.');
      return;
    }
    
    // 입력값에서 참가 코드 추출 (링크 또는 코드 모두 지원)
    const code = extractEnrollmentCode(enrollmentCode);
    
    if (!code) {
      alert('유효한 참가 코드나 링크를 입력하세요.');
      return;
    }

    // 로그인하지 않은 경우
    if (!auth.user) {
      // sessionStorage에 enrollmentCode 저장
      sessionStorage.setItem('pendingEnrollmentCode', code);
      // 모달 닫기
      setShowEnrollModal(false);
      setEnrollmentCode("");
      // 로그인 페이지로 이동
      navigate("/login", {
        state: {
          redirectTo: `/enroll/${code}`,
          message: '수업 참가를 위해 로그인이 필요합니다.'
        }
      });
      return;
    }
    
    try {
      setEnrollLoading(true);
      const resp = await APIService.enrollByCode(code);
      if (resp && resp.success) {
        alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
        setEnrollmentCode("");
        setShowEnrollModal(false);
        // 대시보드 데이터 새로고침
        fetchDashboardData();
      } else {
        alert(resp?.message || '수강 신청에 실패했습니다.');
      }
    } catch (e) {
      alert(e.message || '수강 신청 중 오류가 발생했습니다.');
    } finally {
      setEnrollLoading(false);
    }
  };

  // 수업 카드 데이터 변환
  const transformSectionData = (section, sectionNewItems) => {
    // sectionNumber가 null이면 분반 표시하지 않음
    const batch = section.sectionNumber ? `${section.sectionNumber}분반` : '';
    const courseName = section.sectionNumber 
      ? `[${section.courseTitle}] ${section.sectionNumber}분반`
      : `[${section.courseTitle}]`;
    
    // 새로운 과제/공지사항/알림 배지 생성
    const status = [];
    const newItems = sectionNewItems[section.sectionId] || { newAssignment: null, newNotice: null, newNotification: null };
    
    if (newItems.newAssignment) {
      status.push({
        type: "assignment",
        text: "새로운 과제",
        color: "blue",
        notificationId: newItems.newAssignment.id,
        assignmentId: newItems.newAssignment.assignmentId
      });
    }
    
    if (newItems.newNotice) {
      status.push({
        type: "announcement",
        text: "새로운 공지사항",
        color: "green",
        notificationId: newItems.newNotice.id,
        noticeId: newItems.newNotice.noticeId
      });
    }
    
    if (newItems.newNotification) {
      status.push({
        type: "notification",
        text: "새로운 알림",
        color: "yellow",
        notificationId: newItems.newNotification.id,
        questionId: newItems.newNotification.questionId,
        notificationType: newItems.newNotification.type
      });
    }
    
    return {
      id: section.sectionId,
      title: section.courseTitle,
      subtitle: `강의 ID: ${section.courseId}`,
      batch: batch,
      courseName: courseName,
      status: status,
      instructor: section.instructorName || "담당 교수",
      color: getRandomColor(section.sectionId),
      sectionId: section.sectionId,
      courseId: section.courseId,
      active: section.active
    };
  };

  const getRandomColor = (id) => {
    const colors = ['purple', 'orange', 'red', 'blue', 'green'];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <div className="course-dashboard-container">
        <CourseSidebar 
          sectionId={sectionId ? parseInt(sectionId) : null}
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="course-dashboard-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-dashboard-container">
        <CourseSidebar 
          sectionId={sectionId ? parseInt(sectionId) : null}
          activeMenu={activeMenu} 
          onMenuClick={handleMenuClick}
          isCollapsed={isSidebarCollapsed}
        />
        <div className="course-dashboard-content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchDashboardData}>다시 시도</button>
          </div>
        </div>
      </div>
    );
  }

  const transformedSections = enrolledSections.map(section => transformSectionData(section, sectionNewItems));

  return (
    <div className={`course-dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId ? parseInt(sectionId) : null}
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick}
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="course-dashboard-content">
        <CourseHeader
          courseName={sectionId ? (sectionInfo?.courseTitle ? (sectionInfo.sectionNumber ? `${sectionInfo.courseTitle} ${sectionInfo.sectionNumber}분반` : `${sectionInfo.courseTitle}`) : "수업 대시보드") : "전체 수업 대시보드"}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <div className="dashboard-body">
          {/* 좌측 컬럼: 프로필 + 수업 목록 */}
          <div className="left-column">
          {/* Profile Section */}
          <div className="profile-section">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/blBC3g5kkQ/pe2v4bz8_expires_30_days.png"
              alt="User Avatar"
              className="profile-avatar"
            />
            <span className="profile-greeting">
              {auth.user?.name || "사용자"} {auth.user?.role === "INSTRUCTOR" ? "교수" : "학부생"}님, 반가워요!
            </span>
          </div>

            {/* 수업 목록 */}
            <div className="courses-section">
            <div className="section-header">
                <span className="section-title">수업 목록</span>
                <button
                  className="enroll-button"
                  onClick={() => setShowEnrollModal(true)}
                >
                  + 수업 참가
                </button>
            </div>

              <div className="courses-grid">
                {transformedSections.length > 0 ? (
                  transformedSections.map((course) => (
                    <CourseCard 
                      key={course.id} 
                      course={course}
                      onStatusUpdate={fetchDashboardData}
                    />
                  ))
                ) : (
                  <div className="no-courses">
                    <span>수강 중인 수업이 없습니다.</span>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* 우측 컬럼: 알림 / 과제 / 공지사항 */}
          <div className="right-column">
            {/* 알림 섹션 */}
            <div className="notifications-subsection">
              <span className="section-title">알림</span>
              <div className="notifications-box">
                {allNotifications.length > 0 ? (
                  allNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.isNew ? 'new' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="notification-text">
                        {notification.isNew && <span className="new-badge">NEW</span>}
                        {notification.title}
                        <span className="notification-date"> [{notification.date}]</span>
                        {notification.sectionName && (
                          <span className="notification-section"> ({notification.sectionName})</span>
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <span>새로운 알림이 없습니다.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 과제 섹션 */}
            <div className="assignments-subsection">
              <span className="section-title">과제</span>
              <div className="assignments-summary-box">
                {allAssignments.length > 0 ? (
                  allAssignments.map((assignment) => {
                    const dDay = calculateDDay(assignment.endDate);
                    const isExpired = dDay !== null && dDay < 0;
                    
                    return (
                      <div 
                        key={`${assignment.sectionId}-${assignment.id}`}
                        className={`assignment-summary-item ${isExpired ? 'expired' : ''}`}
                        onClick={() => handleAssignmentClick(assignment)}
                      >
                        <div className="assignment-summary-header">
                          <span className="assignment-summary-title">{assignment.title}</span>
                        </div>
                        <div className="assignment-summary-info">
                          <span className="assignment-summary-section">{assignment.sectionName}</span>
                          <span className="assignment-summary-deadline">{formatDeadline(assignment.endDate)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-assignments">
                    <span>과제가 없습니다.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 공지사항 섹션 */}
            <div className="notices-subsection">
              <span className="section-title">공지사항</span>
              <div className="notices-box">
                {allNotices.length > 0 ? (
                  allNotices.map((notice) => (
                    <div 
                      key={`${notice.sectionId}-${notice.id}`}
                        className={`dashboard-notice-item ${notice.isNew ? 'new' : ''}`}
                      onClick={() => handleNoticeClick(notice)}
                      >
                        <div className="dashboard-notice-header">
                          {notice.isNew && <span className="new-badge">NEW</span>}
                          <span className="dashboard-notice-title">{notice.title}</span>
                          {notice.sectionName && (
                            <span className="dashboard-notice-section">{notice.sectionName}</span>
                          )}
                          {notice.date && (
                            <span className="dashboard-notice-date">{notice.date}</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notices">
                      <span>공지사항이 없습니다.</span>
                    </div>
                  )}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* 수업 참가 모달 */}
      {showEnrollModal && (
        <div className="enroll-modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="enroll-modal" onClick={(e) => e.stopPropagation()}>
            <div className="enroll-modal-header">
              <h2>수업 참가</h2>
              <button className="enroll-modal-close" onClick={() => setShowEnrollModal(false)}>×</button>
            </div>
            <div className="enroll-modal-body">
              <label>참가 코드 또는 링크</label>
              <input
                type="text"
                className="enroll-input"
                placeholder={`예: ABCD1234 또는 ${window.location.origin}/enroll/ABCD1234`}
                value={enrollmentCode}
                onChange={(e) => setEnrollmentCode(e.target.value)}
              />
              <p className="enroll-help-text">참가 코드만 입력하거나 전체 링크를 붙여넣으세요.</p>
            </div>
            <div className="enroll-modal-actions">
              <button className="enroll-cancel" onClick={() => setShowEnrollModal(false)}>취소</button>
              <button
                className="enroll-button-modal"
                onClick={handleEnrollByCode}
                disabled={enrollLoading}
              >
                {enrollLoading ? '처리 중...' : '참가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDashboardPage;
