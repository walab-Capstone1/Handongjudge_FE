import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AssignmentCard.css";

const AssignmentCard = ({ assignment, formatDate, getDeadlineStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const deadlineStatus = getDeadlineStatus(assignment.endDate);

  // URL에서 sectionId 추출
  const urlParts = location.pathname.split('/');
  const sectionIndex = urlParts.indexOf('sections');
  const sectionId = sectionIndex !== -1 ? urlParts[sectionIndex + 1] : null;

  const handleCardClick = () => {
    console.log('과제 카드 클릭:', { sectionId, assignmentId: assignment.id });
    navigate(`/sections/${sectionId}/assignments/${assignment.id}/detail`);
  };

  return (
    <div 
      className="assignment-card-link"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="assignment-card">
        <div className="assignment-header">
          <div className="assignment-number">
            과제 {assignment.assignmentNumber}
          </div>
          <div className={`deadline-badge ${deadlineStatus.status}`}>
            {deadlineStatus.text}
          </div>
        </div>
        
        <div className="assignment-content">
          <h3 className="assignment-title">{assignment.title}</h3>
          <p className="assignment-description">{assignment.description}</p>
        </div>
        
        <div className="assignment-dates">
          <div className="date-item">
            <span className="date-label">시작일:</span>
            <span className="date-value">{formatDate(assignment.startDate)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">마감일:</span>
            <span className={`date-value ${deadlineStatus.status}`}>
              {formatDate(assignment.endDate)}
            </span>
          </div>
        </div>
        
        <div className="assignment-footer">
          <div className="expand-icon">▶</div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard; 