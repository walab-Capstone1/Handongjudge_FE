import React from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", label: "대시보드", icon: "📊" },
    { path: "/admin/courses", label: "수업 관리", icon: "📚" },
    { path: "/admin/assignments", label: "과제 관리", icon: "📝" },
    { path: "/admin/notices", label: "공지사항 관리", icon: "📢" },
    { path: "/admin/users", label: "학생 관리", icon: "👥" },
  ];

  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">
              <span className="admin-icon">👨‍🏫</span>
              관리 페이지
            </h2>
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="sidebar-icon">{item.icon}</span>
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
