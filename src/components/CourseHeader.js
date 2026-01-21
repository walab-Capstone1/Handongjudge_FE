import React from "react";
import { useRecoilValue } from "recoil";
import { authState } from "../recoil/atoms";
import { MdMenu, MdClose } from "react-icons/md";
import "./CourseHeader.css";

const CourseHeader = ({ 
  courseName = "",
  onToggleSidebar,
  isSidebarCollapsed
}) => {
  const auth = useRecoilValue(authState);
  
  return (
    <div className={`course-header-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="course-header-top">
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isSidebarCollapsed ? <MdMenu /> : <MdClose />}
        </button>
        <span className="course-name">{courseName}</span>
      </div>
      <div className="course-header-user">
        <span className="user-info">
          {auth.user?.name || "사용자"} {auth.user?.role === "INSTRUCTOR" ? "교수" : "학부생"}
        </span>
      </div>
    </div>
  );
};

export default CourseHeader;

