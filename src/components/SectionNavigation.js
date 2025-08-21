import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SectionNavigation.css";

const SectionNavigation = ({ sectionId, sectionName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      path: `/admin/notices/section/${sectionId}`,
      label: "공지사항 관리",
      icon: "notices"
    },
    {
      path: `/admin/assignments/section/${sectionId}`,
      label: "과제 관리", 
      icon: "assignments"
    },
    {
      path: `/admin/users/section/${sectionId}`,
      label: "수강생 관리",
      icon: "users"
    }
  ];

  const handleBackToDashboard = () => {
    navigate('/admin');
  };

  return (
    <div className="section-navigation">
      <div className="section-nav-header">
        <div className="section-info">
          <h2 className="section-title">{sectionName}</h2>
        </div>
        
        <button 
          className="back-to-dashboard"
          onClick={handleBackToDashboard}
          title="대시보드로 돌아가기"
        >
          <span className="back-icon">←</span>
          대시보드
        </button>
      </div>
      
      <div className="section-nav-tabs">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className={`nav-icon ${item.icon}`}></span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectionNavigation;
