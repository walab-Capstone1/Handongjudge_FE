import React from "react";
import { Link } from "react-router-dom";
import "./ProblemItem.css";

const ProblemItem = ({ problem, week }) => {
  return (
    <Link to={`/assignments/${week}/problem/${problem.id}`} className="problem-item-link">
      <div className="problem-item">
        <div className="problem-info">
          <h3 className="problem-title">{problem.title}</h3>
          <div className="problem-meta">
            <span className="problem-level">{problem.level}</span>
            <span className="problem-completed">{problem.completed}</span>
          </div>
        </div>
        
        <div className="problem-icons">
          <div className="status-icon">🟢</div>
          <div className="language-icon">{problem.language}</div>
          {problem.tags && problem.tags.map((tag, index) => (
            <div key={index} className="tag-icon">📝</div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProblemItem; 