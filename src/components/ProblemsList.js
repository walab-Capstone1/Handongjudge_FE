import React from 'react';
import ProblemItem from './ProblemItem';

/**
 * 문제 목록 컴포넌트
 * @param {Array} problems - 문제 목록
 * @param {string} assignmentId - 과제 ID
 * @returns {JSX.Element} 문제 목록 JSX
 */
const ProblemsList = ({ problems, assignmentId }) => {
  if (problems.length === 0) {
    return (
      <div className="no-problems">
        <h3>등록된 문제가 없습니다</h3>
        <p>새로운 문제가 등록되면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="problems-list">
      {problems.map((problem) => (
        <ProblemItem 
          key={problem.id} 
          problem={problem} 
          assignmentId={assignmentId}
        />
      ))}
    </div>
  );
};

export default ProblemsList; 