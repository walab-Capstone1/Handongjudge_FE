import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getDeadlineStatus } from '../utils/dateUtils';

/**
 * 과제 헤더 컴포넌트
 * @param {Object} assignmentInfo - 과제 정보
 * @param {string} assignmentId - 과제 ID
 * @returns {JSX.Element} 과제 헤더 JSX
 */
const AssignmentHeader = ({ assignmentInfo, assignmentId }) => {
  const deadlineStatus = assignmentInfo ? getDeadlineStatus(assignmentInfo.endDate) : null;

  return (
    <div className="assignment-header">
      <div className="assignment-info">
        <div className="assignment-title-section">
          <h2 className="assignment-title">
            {assignmentInfo?.title || `과제 ${assignmentId}`}
          </h2>
          {deadlineStatus && (
            <div className={`deadline-badge ${deadlineStatus.status}`}>
              {deadlineStatus.text}
            </div>
          )}
        </div>
        
        <p className="assignment-description">
          {assignmentInfo?.description || "과제 문제들을 풀어보세요."}
        </p>
        
        {assignmentInfo && (
          <div className="assignment-dates">
            <div className="date-item">
              <span className="date-label">시작일:</span>
              <span className="date-value">{formatDate(assignmentInfo.startDate)}</span>
            </div>
            <div className="date-item">
              <span className="date-label">마감일:</span>
              <span className={`date-value ${deadlineStatus?.status}`}>
                {formatDate(assignmentInfo.endDate)}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <Link to="/mypage/info" className="profile-avatar">
        <div className="avatar-icon">🐦</div>
      </Link>
    </div>
  );
};

export default AssignmentHeader; 