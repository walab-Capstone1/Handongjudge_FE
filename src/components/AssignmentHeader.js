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
    <div className="assignment-detail-header">
      <div className="assignment-detail-info">
        <div className="assignment-detail-title-section">
          <h2 className="assignment-detail-title">
            {assignmentInfo?.title || "과제 정보를 불러오는 중..."}
          </h2>
        </div>
        
        <p className="assignment-detail-description">
          {assignmentInfo?.description || "과제 문제들을 풀어보세요."}
        </p>
      </div>
      
      {assignmentInfo && (
        <div className="assignment-detail-dates">
          {deadlineStatus && (
            <div className={`assignment-detail-deadline-status ${deadlineStatus.status}`}>
              {deadlineStatus.text}
            </div>
          )}
          <div className="assignment-detail-date-item">
            <span className="assignment-detail-date-label">시작일:</span>
            <span className="assignment-detail-date-value">{formatDate(assignmentInfo.startDate)}</span>
          </div>
          <div className="assignment-detail-date-item">
            <span className="assignment-detail-date-label">마감일:</span>
            <span className={`assignment-detail-date-value ${deadlineStatus?.status}`}>
              {formatDate(assignmentInfo.endDate)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentHeader; 