import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SectionNavigation.css";

const SectionNavigation = ({ 
  sectionId, 
  sectionName, 
  enrollmentCode = null,
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

  const handleCopyEnrollmentLink = () => {
    if (enrollmentCode) {
      const enrollmentLink = `${window.location.origin}/enroll/${enrollmentCode}`;
      navigator.clipboard.writeText(enrollmentLink).then(() => {
        alert('수업 참가 링크가 복사되었습니다!');
      }).catch((err) => {
        console.error('복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  const navigationItems = [
    {
      path: `/tutor/notices/section/${sectionId}`,
      label: "공지사항 관리",
      icon: "notices"
    },
    {
      path: `/tutor/assignments/section/${sectionId}`,
      label: "과제 관리", 
      icon: "assignments"
    },
    {
      path: `/tutor/users/section/${sectionId}`,
      label: "수강생 관리",
      icon: "users"
    }
  ];

  const handleBackToDashboard = () => {
    navigate('/tutor');
  };

  return (
    <div className="section-navigation">
      <div className="section-nav-header">
        <div className="section-info">
          <h2 className="section-title">{sectionName}</h2>
          <div className="section-info-buttons">
            {enrollmentCode && (
              <button 
                className="enrollment-link-button"
                onClick={handleCopyEnrollmentLink}
                title="수업 참가 링크 복사"
              >
                🔗 수업 링크 복사
              </button>
            )}
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
      </div>
      
      <div className="section-nav-content">
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
