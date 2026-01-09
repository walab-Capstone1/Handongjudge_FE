import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AssignmentProblemsList.css';

/**
 * 대시보드용 과제 문제 목록 컴포넌트
 * @param {Array} problems - 문제 목록
 * @param {boolean} showIndicator - 인디케이터 표시 여부
 * @param {string} sectionId - 섹션 ID
 * @param {string} assignmentId - 과제 ID
 */
const AssignmentProblemsList = ({ 
  problems = [], 
  showIndicator = true,
  sectionId,
  assignmentId 
}) => {
  const navigate = useNavigate();

  const handleProblemClick = (problemId) => {
    if (sectionId && assignmentId && problemId) {
      navigate(`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problemId}`);
    }
  };
  if (problems.length === 0) {
    return (
      <div className="dashboard-problems-list">
        <div className="no-problems-message">
          <span>문제 정보를 불러올 수 없습니다.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-problems-list">
      {showIndicator && (
        <img
          src="https://i.imgur.com/1tMFzp8.png"
          alt="indicator"
          className="problems-indicator"
        />
      )}
      <div className="problems-items">
        {problems.map((problem, index) => (
          <div
            key={problem.id || index}
            className={`problem-row ${problem.completed ? 'completed' : 'not-completed'}`}
            onClick={() => handleProblemClick(problem.id)}
          >
            <span className="bullet">•</span>
            <span className="problem-title">{problem.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentProblemsList;

