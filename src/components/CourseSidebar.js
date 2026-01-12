import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./CourseSidebar.css";

const CourseSidebar = ({ activeMenu = "대시보드", onMenuClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const menuItems = [
    { id: "dashboard", label: "대시보드" },
    { id: "assignment", label: "과제" },
    { id: "notice", label: "공지사항" },
    { id: "notification", label: "알림" },
  ];

  return (
    <div className="course-sidebar">
      <div 
        className="sidebar-header"
        onClick={() => navigate("/courses")}
      >
        <img
          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/blBC3g5kkQ/0xrnt7m1_expires_30_days.png"
          alt="CodeSturdy Logo"
          className="sidebar-logo"
        />
        <span className="sidebar-title">CodeSturdy</span>
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-menu-item ${
              activeMenu === item.label ? "active" : ""
            }`}
            onClick={() => onMenuClick && onMenuClick(item.id)}
          >
            <span className="menu-text">{item.label}</span>
          </div>
        ))}
      </div>

      <div 
        className="sidebar-logout"
        onClick={async () => {
          try {
            await logout();
            navigate("/");
          } catch (error) {
            console.error("로그아웃 실패:", error);
          }
        }}
      >
        <span className="menu-text">로그아웃</span>
      </div>
    </div>
  );
};

export default CourseSidebar;

