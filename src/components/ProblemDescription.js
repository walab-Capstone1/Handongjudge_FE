import React from 'react';
import './ProblemDescription.css';

const ProblemDescription = ({ 
  currentProblem, 
  problemDescription 
}) => {
  return (
    <div className="description-area">
      <div className="description-header">
        <span>문제 설명</span>
        
        {/* Problem Limits in Header */}
        {(currentProblem.timeLimit || currentProblem.memoryLimit) && (
          <div className="problem-limits-header">
            {currentProblem.timeLimit && (
              <span className="limit-badge-header time-limit">
                시간 제한: {currentProblem.timeLimit}초
              </span>
            )}
            {currentProblem.memoryLimit && (
              <span className="limit-badge-header memory-limit">
                메모리 제한: {currentProblem.memoryLimit}MB
              </span>
            )}
          </div>
        )}
      </div>
      
      <div 
        className="description-content"
        dangerouslySetInnerHTML={{ 
          __html: currentProblem.description || problemDescription 
        }}
      />
    </div>
  );
};

export default ProblemDescription;
