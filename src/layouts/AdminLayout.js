import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import "./AdminLayout.css";

const AdminLayout = ({ children, selectedSection = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 학기 표시 헬퍼 함수
  const getSemesterLabel = (semester) => {
    switch(semester) {
      case 'SPRING': return '1학기';
      case 'SUMMER': return '여름학기';
      case 'FALL': return '2학기';
      case 'WINTER': return '겨울학기';
      default: return '1학기';
    }
  };

  // 기본 메뉴 (대시보드만)
  const defaultMenuItems = [
    { path: "/admin", label: "대시보드" },
  ];

  // 수업이 선택되었을 때의 메뉴
  const sectionMenuItems = selectedSection ? [
    { path: "/admin", label: "← 대시보드로" },
    { path: `/admin/assignments/section/${selectedSection.sectionId}`, label: "과제 관리" },
    { path: `/admin/notices/section/${selectedSection.sectionId}`, label: "공지사항 관리" },
    { path: `/admin/users/section/${selectedSection.sectionId}`, label: "수강생 관리" },
  ] : defaultMenuItems;

  const menuItems = selectedSection ? sectionMenuItems : defaultMenuItems;

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              {selectedSection ? selectedSection.courseTitle : "관리 페이지"}
            </h2>
            {selectedSection && (
              <p className="sidebar-subtitle">
                {selectedSection.sectionNumber}분반 · {selectedSection.year}년 {getSemesterLabel(selectedSection.semester)}
              </p>
            )}
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${
                  location.pathname === item.path || 
                  location.pathname.startsWith(item.path + '/') ? "active" : ""
                }`}
              >
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
