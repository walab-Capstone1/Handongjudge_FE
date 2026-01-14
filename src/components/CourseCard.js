import React from "react";
import { Link, useNavigate } from "react-router-dom";
import APIService from "../services/APIService";
import "./CourseCard.css";

const CourseCard = ({ course, onStatusUpdate }) => {
  const navigate = useNavigate();
  
  const getColorClass = (color) => {
    switch (color) {
      case "purple": return "purple";
      case "orange": return "orange";
      case "red": return "red";
      case "blue": return "blue";
      case "green": return "green";
      default: return "blue";
    }
  };

  const getStatusColor = (color) => {
    switch (color) {
      case "blue": return "status-blue";
      case "yellow": return "status-yellow";
      case "green": return "status-green";
      default: return "status-blue";
    }
  };

  // sectionId가 있으면 해당 section의 대시보드로 라우팅
  const getLinkPath = () => {
    if (course.sectionId) {
      return `/sections/${course.sectionId}/dashboard`;
    }
    return "/assignments";
  };

  // 상태 배지 클릭 처리
  const handleStatusClick = async (e, status) => {
    e.preventDefault(); // Link 이벤트 방지
    e.stopPropagation();
    
    if (status.type === "announcement") {
      // 분반 상세 페이지의 공지사항 탭으로 이동
      navigate(`/sections/${course.sectionId}?tab=notices`);
      
      // 상태 업데이트 콜백 호출 (메인 페이지에서 대시보드 새로고침)
      if (onStatusUpdate) {
        setTimeout(() => {
          console.log('🔥 공지사항 배지 클릭 후 대시보드 업데이트 시작');
          onStatusUpdate();
        }, 2000); // 2초 후 업데이트 (읽음 처리 완료 대기)
      }
    } else if (status.type === "assignment") {
      // 분반 상세 페이지의 과제 탭으로 이동
      navigate(`/sections/${course.sectionId}?tab=assignments`);
      
      // 상태 업데이트 콜백 호출
      if (onStatusUpdate) {
        setTimeout(() => onStatusUpdate(), 1000);
      }
    }
  };

  // 비활성화된 수업인지 확인 (active가 false인 경우)
  const isDisabled = course.active === false;

  const handleCardClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      alert('이 수업은 현재 비활성화되어 있어 접근할 수 없습니다.\n교수님께 문의하시기 바랍니다.');
    }
  };

  const cardContent = (
    <div className={`course-card ${isDisabled ? 'disabled' : ''}`}>
      {isDisabled && (
        <div className="disabled-overlay">
          <div className="disabled-message">
            <p>비활성화된 수업</p>
          </div>
        </div>
      )}
      <div className={`card-header ${getColorClass(course.color)} ${isDisabled ? 'opacity-reduced' : ''}`}>
        <div className="card-title">
          <h3>{course.title}</h3>
        </div>
        <div className="batch-badge">{course.batch}</div>
      </div>
      
      <div className="card-content">
        <h4 className="course-name">{course.courseName}</h4>
        
        <div className="status-tags">
          {course.status.map((status, index) => (
            <span 
              key={index} 
              className={`status-tag ${getStatusColor(status.color)}`}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                handleStatusClick(e, status);
              }}
              style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            >
              {status.text}
            </span>
          ))}
        </div>
        
        <p className="instructor">{course.instructor} 교수님</p>
      </div>
    </div>
  );

  if (isDisabled) {
    return (
      <div className="course-card-link" onClick={handleCardClick} style={{ cursor: 'not-allowed' }}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={getLinkPath()} className="course-card-link" onClick={handleCardClick}>
      {cardContent}
    </Link>
  );
};

export default CourseCard; 