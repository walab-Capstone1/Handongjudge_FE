import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";
import { authState } from "../recoil/atoms";
import { MdMenu, MdClose } from "react-icons/md";
import APIService from "../services/APIService";
import "./CourseHeader.css";

const CourseHeader = ({ 
  courseName = "",
  onToggleSidebar,
  isSidebarCollapsed,
  sectionId: sectionIdProp = null
}) => {
  const auth = useRecoilValue(authState);
  const { sectionId: sectionIdFromParams } = useParams();
  const sectionId = sectionIdProp || sectionIdFromParams;
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      if (sectionId && auth.user) {
        try {
          const response = await APIService.getMyRoleInSection(sectionId);
          const role = response?.data || response;
          
          // 역할을 한글로 변환
          let roleText = '';
          if (role === 'ADMIN' || role === 'INSTRUCTOR') {
            roleText = '강의자';
          } else if (role === 'TUTOR') {
            roleText = '튜터';
          } else if (role === 'STUDENT') {
            roleText = '학생';
          }
          
          setUserRole(roleText);
        } catch (error) {
          console.error('역할 조회 실패:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };
    
    fetchUserRole();
  }, [sectionId, auth.user]);
  
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
          {auth.user?.name || "사용자"}
          {userRole && <span className="user-role"> · {userRole}</span>}
        </span>
      </div>
    </div>
  );
};

export default CourseHeader;

