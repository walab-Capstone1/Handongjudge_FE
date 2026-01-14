import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../recoil/atoms";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import AssignmentProblemsList from "../components/AssignmentProblemsList";
import APIService from "../services/APIService";
import "./CourseDashboardPage.css";

const CourseDashboardPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [activeMenu, setActiveMenu] = useState("대시보드");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc': 오름차순, 'desc': 내림차순
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  
  // 데이터 상태
  const [sectionInfo, setSectionInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [collapsedAssignments, setCollapsedAssignments] = useState(new Set());

  useEffect(() => {
    if (sectionId && auth.user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, auth.user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 섹션 정보 조회
      const sectionResponse = await APIService.getSectionInfo(sectionId);
      const sectionData = sectionResponse.data || sectionResponse;
      setSectionInfo(sectionData);

      // 과제 목록 조회
      const assignmentsResponse = await APIService.getAssignmentsBySection(sectionId);
      const assignmentsList = assignmentsResponse.data || assignmentsResponse;

      // 각 과제에 대한 진도율과 문제 상태 조회
      const assignmentsWithProgress = await Promise.all(
        assignmentsList.map(async (assignment) => {
          try {
            // 과제의 문제 목록 조회
            const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignment.id);
            const problemsList = problemsResponse.data || problemsResponse;

            // 학생의 문제별 제출 상태 조회
            let problemsStatus = [];
            try {
              const statusResponse = await APIService.getStudentAssignmentProblemsStatus(
                auth.user.id,
                sectionId,
                assignment.id
              );
              problemsStatus = statusResponse.data || statusResponse;
            } catch (statusErr) {
              // 상태 조회 실패 시 기본값 사용
            }

            // 문제 목록과 상태를 결합
            const problems = problemsList.map(problem => {
              const status = problemsStatus.find(s => s.problemId === problem.id);
              // status가 'SUBMITTED' 또는 'COMPLETED'면 제출된 것으로 간주
              const isSubmitted = status && (status.status === 'SUBMITTED' || status.status === 'COMPLETED');
              return {
                id: problem.id,
                title: problem.title,
                completed: isSubmitted,
                status: status ? status.status : 'NOT_SUBMITTED'
              };
            });

            // 진도율 계산: 제출한 문제 / 전체 문제 * 100
            const totalProblems = problems.length;
            const submittedProblems = problems.filter(p => p.completed).length;
            const progress = totalProblems > 0 ? Math.round((submittedProblems / totalProblems) * 100) : 0;

            // D-day 계산
            const dDay = calculateDDay(assignment.endDate);

            return {
              ...assignment,
              progress,
              dDay,
              problems
            };
          } catch (err) {
            console.error(`과제 ${assignment.id} 상태 조회 실패:`, err);
            return {
              ...assignment,
              progress: 0,
              dDay: calculateDDay(assignment.endDate),
              problems: []
            };
          }
        })
      );

      // 초기에는 오름차순으로 정렬 (빠른 마감일이 먼저)
      const sortedAssignments = assignmentsWithProgress.sort((a, b) => {
        return new Date(a.endDate) - new Date(b.endDate);
      });

      setAssignments(sortedAssignments);

      // 커뮤니티 알림 조회 (통합 알림 시스템)
      try {
        const notificationsResponse = await APIService.getCommunityNotifications(sectionId, 0, 50);
        const notificationsList = notificationsResponse.data?.content || [];
          
          // 백엔드에서 이미 섹션별로 필터링된 알림을 받음
          const sectionNotifications = notificationsList
            .slice(0, 5) // 최대 5개
            .map(notif => {
              // 알림 타입에 따라 다른 정보 표시
              let title = '';
              let link = '';
              
              switch (notif.type) {
                case 'NOTICE_CREATED':
                  title = `새 공지사항: ${notif.noticeTitle || '공지사항'}`;
                  link = notif.noticeId ? `/sections/${sectionId}/course-notices/${notif.noticeId}` : null;
                  break;
                case 'ASSIGNMENT_CREATED':
                  title = `새 과제: ${notif.assignmentTitle || '과제'}`;
                  link = notif.assignmentId ? `/sections/${sectionId}/course-assignments?assignmentId=${notif.assignmentId}` : null;
                  break;
                case 'QUESTION_COMMENT':
                  title = notif.message || '내 질문에 댓글이 달렸습니다';
                  link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
                  break;
                case 'COMMENT_ACCEPTED':
                  title = notif.message || '내 댓글이 채택되었습니다';
                  link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
                  break;
                case 'QUESTION_LIKED':
                case 'COMMENT_LIKED':
                  title = notif.message || '추천을 받았습니다';
                  link = notif.questionId ? `/sections/${sectionId}/community/${notif.questionId}` : null;
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
                link: link
              };
            });
          
          setNotifications(sectionNotifications);
      } catch (err) {
        console.error("알림 조회 실패:", err);
        setNotifications([]);
      }

      // 최근 공지사항 조회
      try {
        const noticesResponse = await APIService.getSectionNotices(sectionId);
        const noticesList = noticesResponse.data || noticesResponse;
        
        // 최근 공지사항 5개만 표시
        const recentNoticesList = noticesList
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(notice => ({
            id: notice.id,
            title: notice.title,
            date: formatDate(notice.createdAt),
            isNew: notice.isNew || false
          }));
        
        setRecentNotices(recentNoticesList);
      } catch (err) {
        console.error("공지사항 조회 실패:", err);
        setRecentNotices([]);
      }

    } catch (err) {
      console.error("대시보드 데이터 조회 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const calculateDDay = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const handleMenuClick = (menuId) => {
    switch (menuId) {
      case "dashboard":
        // 현재 페이지
        break;
      case "assignment":
        navigate(`/sections/${sectionId}/course-assignments`);
        break;
      case "notice":
        navigate(`/sections/${sectionId}/course-notices`);
        break;
      case "notification":
        // 알림 페이지로 이동 (구현 필요)
        break;
      default:
        break;
    }
  };

  const handleAssignmentClick = (assignmentId) => {
    // 과제 페이지로 이동하면서 해당 과제 아이템을 펼치도록 assignmentId를 URL 파라미터로 전달
    navigate(`/sections/${sectionId}/course-assignments?assignmentId=${assignmentId}`);
  };

  const handleNotificationClick = async (notification) => {
    // 알림 타입에 따라 다른 페이지로 이동
    if (notification.link) {
      navigate(notification.link);
      
      // 알림 읽음 처리
      if (notification.isNew && notification.id) {
        try {
          await APIService.markCommunityNotificationAsRead(notification.id);
        } catch (err) {
          console.error('알림 읽음 처리 실패:', err);
        }
      }
    }
  };

  const handleNoticeClick = (noticeId) => {
    // 공지사항 상세페이지로 이동
    navigate(`/sections/${sectionId}/course-notices/${noticeId}`);
  };

  // 정렬 순서 변경 핸들러
  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);

    // 과제 목록 재정렬
    const sortedAssignments = [...assignments].sort((a, b) => {
      const dateA = new Date(a.endDate);
      const dateB = new Date(b.endDate);
      
      if (newSortOrder === "asc") {
        return dateA - dateB; // 오름차순: 빠른 마감일이 먼저
      } else {
        return dateB - dateA; // 내림차순: 늦은 마감일이 먼저
      }
    });

    setAssignments(sortedAssignments);
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const handleToggleAssignment = (assignmentId) => {
    setCollapsedAssignments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="course-dashboard-container">
        <CourseSidebar 
          sectionId={sectionId} 
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
          sectionId={sectionId} 
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

  return (
    <div className={`course-dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick}
        isCollapsed={isSidebarCollapsed}
      />
      
      <div className="course-dashboard-content">
        <CourseHeader
          courseName={
            sectionInfo?.courseTitle 
              ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber || ''}분반`
              : sectionInfo?.courseName || "강의"
          }
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <div className="dashboard-body">
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

          {/* Content wrapper for assignments, notifications and notices */}
          <div className="content-wrapper">
            <div className="content-wrapper-row">
            <div className="assignments-section">
            <div className="section-header">
              <span className="section-title">과제 현황</span>
              <div className="sort-dropdown" onClick={handleSortToggle}>
                <span className="sort-text">마감일 순</span>
                <div className={`sort-arrow ${sortOrder === "desc" ? "desc" : "asc"}`}>
                  {sortOrder === "asc" ? "▲" : "▼"}
                </div>
              </div>
            </div>

            <div className="assignments-list">
              {assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const isCollapsed = collapsedAssignments.has(assignment.id);
                  return (
                    <div key={assignment.id} className={`assignment-card ${isCollapsed ? 'collapsed' : ''}`}>
                      <div 
                        className="assignment-header"
                        onClick={() => handleToggleAssignment(assignment.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
                        <span className="assignment-title">{assignment.title}</span>
                        {assignment.dDay !== null && (
                          <div className={`d-day-badge ${assignment.dDay < 0 ? 'expired' : ''}`}>
                            <span className="d-day-text">
                              {assignment.dDay < 0 ? `D+${Math.abs(assignment.dDay)}` : `D-${assignment.dDay}`}
                            </span>
                          </div>
                        )}
                        <div className="flex-spacer"></div>
                        {!isCollapsed && (
                          <span className="assignment-deadline">
                            {formatDeadline(assignment.endDate)}
                          </span>
                        )}
                        <button
                          className="assignment-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignmentClick(assignment.id);
                          }}
                        >
                          과제 바로가기
                        </button>
                      </div>

                      {!isCollapsed && (
                        <>
                          <span className="progress-label">현재 과제 완료율</span>

                          <div className="progress-bar-container">
                            <span className="progress-text">{assignment.progress}%</span>
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${assignment.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <AssignmentProblemsList 
                            problems={assignment.problems}
                            showIndicator={true}
                            sectionId={sectionId}
                            assignmentId={assignment.id}
                          />
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="no-assignments">
                  <span>진행 중인 과제가 없습니다.</span>
                </div>
              )}
            </div>
          </div>

            <div className="notifications-section">
              <span className="section-title">알림</span>
              <div className="notifications-box">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.isNew ? 'new' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="notification-text">
                        {notification.isNew && <span className="new-badge">NEW</span>}
                        {notification.title}
                        <span className="notification-date"> [{notification.date}]</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <span>새로운 알림이 없습니다.</span>
                  </div>
                )}
              </div>

              <div className="notices-section">
                <span className="section-title">공지사항</span>
                <div className="notices-box">
                  {recentNotices.length > 0 ? (
                    recentNotices.map((notice) => (
                      <div 
                        key={notice.id} 
                        className={`notice-item ${notice.isNew ? 'new' : ''}`}
                        onClick={() => handleNoticeClick(notice.id)}
                      >
                        <span className="notice-text">
                          {notice.isNew && <span className="new-badge">NEW</span>}
                          {notice.title}
                          <span className="notice-date"> [{notice.date}]</span>
                        </span>
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
        </div>
      </div>
    </div>
  );
};

export default CourseDashboardPage;

