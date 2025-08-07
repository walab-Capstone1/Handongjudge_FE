import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AssignmentCard.css";

const AssignmentCard = ({ assignment, formatDate, getDeadlineStatus }) => {
  const location = useLocation();
  const deadlineStatus = getDeadlineStatus(assignment.endDate);

  // URL에서 sectionId 추출
  const urlParts = location.pathname.split('/');
  const sectionIndex = urlParts.indexOf('sections');
  const sectionId = sectionIndex !== -1 ? urlParts[sectionIndex + 1] : null;

  return (
    <Link 
      to={`/assignments/${assignment.id}/detail`} 
      state={{ sectionId: sectionId }}
      className="assignment-card-link"
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
    </Link>
  );
};

export default AssignmentCard; 