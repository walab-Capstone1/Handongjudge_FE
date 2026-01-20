import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { MdDashboard, MdAssignment, MdAnnouncement, MdNotifications, MdLogout, MdMenuBook, MdClose, MdForum } from "react-icons/md";
import APIService from "../services/APIService";
import "./CourseSidebar.css";

const CourseSidebar = ({ sectionId, activeMenu = "대시보드", onMenuClick, isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showCourseList, setShowCourseList] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const courseListRef = useRef(null);
  
  // sectionId가 없을 때 에러 방지
  // sectionId가 null이거나 undefined이거나 NaN이면 과제, 공지사항, 커뮤니티, 알림 메뉴 숨김
  // 처음에는 대시보드만 표시하고, 수업 카드를 클릭하면 나머지 메뉴가 나타남
  const hasSectionId = sectionId !== null && sectionId !== undefined && !isNaN(sectionId) && sectionId > 0;
  
  const menuItems = [
    { id: "dashboard", label: "대시보드", path: hasSectionId ? `/sections/${sectionId}/dashboard` : '/dashboard', icon: MdDashboard },
    ...(hasSectionId ? [
      { id: "assignment", label: "과제", path: `/sections/${sectionId}/course-assignments`, icon: MdAssignment },
      { id: "notice", label: "공지사항", path: `/sections/${sectionId}/course-notices`, icon: MdAnnouncement },
      { id: "community", label: "커뮤니티", path: `/sections/${sectionId}/community`, icon: MdForum },
      { id: "notification", label: "알림", path: `/sections/${sectionId}/alarm`, icon: MdNotifications },
    ] : []),
  ];

  // 수강 중인 강의 목록 가져오기
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (showCourseList && enrolledCourses.length === 0) {
        try {
          setLoadingCourses(true);
          const response = await APIService.getUserEnrolledSections();
          setEnrolledCourses(response.data || response);
        } catch (error) {
          console.error('강의 목록 조회 실패:', error);
        } finally {
          setLoadingCourses(false);
        }
      }
    };
    fetchEnrolledCourses();
  }, [showCourseList, enrolledCourses.length]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseListRef.current && !courseListRef.current.contains(event.target)) {
        setShowCourseList(false);
      }
    };

    if (showCourseList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCourseList]);

  // ESC 키 감지
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowCourseList(false);
      }
    };

    if (showCourseList) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCourseList]);

  // 강의 선택 시 URL의 sectionId만 변경
  const handleCourseSelect = (selectedSectionId) => {
    const currentPath = location.pathname;
    // 현재 경로에서 sectionId 부분만 교체
    const newPath = currentPath.replace(/\/sections\/\d+/, `/sections/${selectedSectionId}`);
    navigate(newPath);
    setShowCourseList(false);
  };

  return (
    <>
      <div className={`course-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div 
          className="sidebar-header"
          onClick={() => !isCollapsed && navigate("/index")}
        >
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/blBC3g5kkQ/0xrnt7m1_expires_30_days.png"
            alt="CodeSturdy Logo"
            className="sidebar-logo"
          />
          {!isCollapsed && <span className="sidebar-title">CodeSturdy</span>}
        </div>

        <div className="sidebar-menu">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            // 현재 경로를 기반으로 활성 메뉴 판단
            const isActive = location.pathname.includes(item.id === 'assignment' ? 'course-assignments' : 
                                                        item.id === 'notice' ? 'course-notices' :
                                                        item.id === 'notification' ? 'alarm' :
                                                        item.id);
            // 대시보드가 아닌 메뉴는 애니메이션 지연 적용
            const isSubMenu = item.id !== 'dashboard';
            return (
              <div
                key={item.id}
                className={`sidebar-menu-item ${
                  isActive ? "active" : ""
                } ${isSubMenu ? "sub-menu-item" : ""}`}
                style={isSubMenu ? {
                  animationDelay: `${(index - 1) * 0.1}s`
                } : {}}
                onClick={() => {
                  if (item.type === 'action' && item.id === 'courses') {
                    // "수업" 메뉴 클릭 시 강의 목록 사이드바 토글 (접힌 상태에서도 작동)
                    setShowCourseList(!showCourseList);
                    return;
                  }
                  
                  if (item.path && item.path !== '#') {
                    navigate(item.path);
                  }
                  if (onMenuClick) {
                    onMenuClick(item.id);
                  }
                }}
                title={isCollapsed ? item.label : ''}
              >
                <IconComponent className="menu-icon" />
                {!isCollapsed && <span className="menu-text">{item.label}</span>}
              </div>
            );
          })}
        </div>

        <div 
          className="sidebar-logout"
          onClick={async () => {
            try {
              await logout();
              navigate("/index");
            } catch (error) {
              console.error("로그아웃 실패:", error);
            }
          }}
          title={isCollapsed ? "로그아웃" : ''}
        >
          <MdLogout className="menu-icon" />
          {!isCollapsed && <span className="menu-text">로그아웃</span>}
        </div>
      </div>

      {/* 강의 목록 사이드바 */}
      {showCourseList && (
        <div 
          ref={courseListRef}
          className={`course-list-sidebar ${showCourseList ? 'show' : ''}`}
        >
          <div className="course-list-header">
            <span className="course-list-title">Courses</span>
            <button 
              className="course-list-close"
              onClick={() => setShowCourseList(false)}
            >
              <MdClose />
            </button>
          </div>
          
          <div className="course-list-content">
            {loadingCourses ? (
              <div className="course-list-loading">로딩 중...</div>
            ) : (
              enrolledCourses.map((course) => (
                <div
                  key={course.sectionId}
                  className={`course-list-item ${
                    course.sectionId === parseInt(sectionId) ? 'active' : ''
                  }`}
                  onClick={() => handleCourseSelect(course.sectionId)}
                >
                  <div className="course-list-item-title">
                    {course.courseTitle}
                  </div>
                  <div className="course-list-item-section">
                    {course.sectionNumber}분반
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </>
  );
};

export default CourseSidebar;

