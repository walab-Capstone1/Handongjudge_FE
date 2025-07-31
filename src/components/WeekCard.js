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

  const getDeadlineText = (frequency) => {
    switch (frequency) {
      case "높음": return "D-3";
      case "보통": return "D-7";
      case "낮음": return "D-14";
      default: return "D-7";
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
            <span className="metric-label">과제 기한</span>
            <span className="metric-value deadline">
              {getDeadlineText(week.frequency)}
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