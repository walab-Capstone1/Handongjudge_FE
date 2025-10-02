import React from "react";
import "./ProblemCard.css";

const ProblemCard = ({ title, timeLimit, memoryLimit, onClick }) => (
  <div className="problem-card" onClick={onClick}>
    <h4 className="problem-title">{title}</h4>
    {(timeLimit || memoryLimit) && (
      <div className="problem-limits">
        {timeLimit && (
          <span className="limit-badge time-limit">
            시간 제한: {timeLimit}초
          </span>
        )}
        {memoryLimit && (
          <span className="limit-badge memory-limit">
            메모리 제한: {memoryLimit}MB
          </span>
        )}
      </div>
    )}
  </div>
);

export default ProblemCard; 