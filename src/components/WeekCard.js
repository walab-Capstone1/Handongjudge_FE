import React from "react";
import { Link } from "react-router-dom";
import "./WeekCard.css";

const WeekCard = ({ week }) => {
  const getLevelIcon = (level) => {
    switch (level) {
      case "높음": return "↗️";
      case "보통": return "→";
      case "낮음": return "↘️";
      default: return "→";
    }
  };

  return (
    <Link to={`/assignments/${week.title.replace(' ', '')}/detail`} className="week-card-link">
      <div className="week-card">
        <div className="week-header">
          <h3 className="week-title">{week.title}</h3>
          <div className="expand-icon">▶</div>
        </div>
        
        <p className="week-description">{week.description}</p>
        
        <div className="week-metrics">
          <div className="metric">
            <span className="metric-label">출제빈도</span>
            <span className="metric-value">
              {getLevelIcon(week.frequency)} {week.frequency}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">평균 점수</span>
            <span className="metric-value">
              {getLevelIcon(week.avgScore)} {week.avgScore}
            </span>
          </div>
          
          <div className="metric">
            <span className="metric-label">문제 세트</span>
            <span className="metric-value">{week.problemSet}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WeekCard; 