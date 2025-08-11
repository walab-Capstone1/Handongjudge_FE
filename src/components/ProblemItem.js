import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./ProblemItem.css";

const ProblemItem = ({ problem, assignmentId }) => {
  const location = useLocation();

  // URL에서 sectionId 추출
  const urlParts = location.pathname.split('/');
  const sectionIndex = urlParts.indexOf('sections');
  const sectionId = sectionIndex !== -1 ? urlParts[sectionIndex + 1] : null;

  return (
    <Link 
      to={`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problem.id}`} 
      className="problem-item-link"
    >
      <div className="problem-item">
        <div className="problem-info">
          <h3 className="problem-title">{problem.title}</h3>
          <div className="problem-meta">
            <span className="problem-level">{problem.level || "Level 1"}</span>
            <span className="problem-completed">{problem.completed || "0명 완료"}</span>
          </div>
        </div>
        
        <div className="problem-icons">
          <div className="status-icon">🟢</div>
          <div className="language-icon">{problem.language || "JS"}</div>
          {problem.tags && problem.tags.map((tag, index) => (
            <div key={index} className="tag-icon">📝</div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProblemItem; 