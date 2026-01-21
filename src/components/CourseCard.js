import React from "react";
import { Link, useNavigate } from "react-router-dom";
import APIService from "../services/APIService";
import "./CourseCard.css";

const CourseCard = ({ course, onStatusUpdate, showEnrollButton = false, onEnroll }) => {
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
    
    // 알림 읽음 처리
    if (status.notificationId) {
      try {
        await APIService.markCommunityNotificationAsRead(status.notificationId);
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
    
    if (status.type === "announcement") {
      // 공지사항 상세 페이지로 이동
      if (status.noticeId) {
        navigate(`/sections/${course.sectionId}/course-notices/${status.noticeId}`);
      } else {
        navigate(`/sections/${course.sectionId}/course-notices`);
      }
      
      // 상태 업데이트 콜백 호출
      if (onStatusUpdate) {
        setTimeout(() => {
          onStatusUpdate();
        }, 500);
      }
    } else if (status.type === "assignment") {
      // 과제 페이지로 이동
      if (status.assignmentId) {
        navigate(`/sections/${course.sectionId}/course-assignments?assignmentId=${status.assignmentId}`);
      } else {
        navigate(`/sections/${course.sectionId}/course-assignments`);
      }
      
      // 상태 업데이트 콜백 호출
      if (onStatusUpdate) {
        setTimeout(() => {
          onStatusUpdate();
        }, 500);
      }
    } else if (status.type === "notification") {
      // 알림 페이지로 이동 (커뮤니티 질문으로 이동)
      if (status.questionId) {
        navigate(`/sections/${course.sectionId}/community/${status.questionId}`);
      } else {
        navigate(`/sections/${course.sectionId}/alarm`);
      }
      
      // 상태 업데이트 콜백 호출
      if (onStatusUpdate) {
        setTimeout(() => {
          onStatusUpdate();
        }, 500);
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
        {course.batch && <div className="batch-badge">{course.batch}</div>}
      </div>
      
      <div className="card-content">
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
        
        <div className="instructor-row">
          <p className="instructor">{course.instructor} 교수님</p>
          {showEnrollButton && (
            <button 
              className="enroll-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onEnroll) {
                  onEnroll();
                }
              }}
            >
              참가하기
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 공개된 클래스는 카드 클릭 시 참가 모달만 열리도록
  if (showEnrollButton) {
    return (
      <div className="course-card-link" onClick={(e) => {
        if (!e.target.closest('.enroll-button')) {
          if (onEnroll) {
            onEnroll();
          }
        }
      }} style={{ cursor: 'pointer' }}>
        {cardContent}
      </div>
    );
  }

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