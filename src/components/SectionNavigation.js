import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SectionNavigation.css";

const SectionNavigation = ({ 
  sectionId, 
  sectionName, 
  showSearch = false, 
  searchTerm = '', 
  onSearchChange = () => {},
  searchPlaceholder = "검색...",
  showFilter = false,
  filterValue = 'ALL',
  onFilterChange = () => {},
  filterOptions = [],
  showCreateButton = false,
  onCreateClick = () => {},
  createButtonText = "새로 만들기",
  showAdditionalButtons = false,
  additionalButtons = []
}) => {
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
          <button 
            className="back-to-dashboard"
            onClick={handleBackToDashboard}
            title="대시보드로 돌아가기"
          >
            <span className="back-icon">←</span>
            대시보드
          </button>
        </div>
      </div>
      
      <div className="section-nav-content">
        <div className="section-nav-tabs">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="section-nav-actions">
          {showSearch && (
            <div className="search-box">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
          )}
          
          {showFilter && (
            <div className="filter-dropdown">
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="filter-select"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {showAdditionalButtons && additionalButtons.map((button, index) => (
            <button
              key={index}
              className={button.className || "btn-secondary"}
              onClick={button.onClick}
            >
              {button.text}
            </button>
          ))}
          
          {showCreateButton && (
            <button
              className="btn-primary"
              onClick={onCreateClick}
            >
              {createButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionNavigation;
