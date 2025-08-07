import React from "react";
import { Link } from "react-router-dom";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  const getColorClass = (color) => {
    switch (color) {
      case "purple": return "purple";
      case "orange": return "orange";
      case "red": return "red";
      case "blue": return "blue";
      case "green": return "green";
      default: return "blue";
    }
  };

  const getStatusColor = (color) => {
    switch (color) {
      case "blue": return "status-blue";
      case "yellow": return "status-yellow";
      case "green": return "status-green";
      default: return "status-blue";
    }
  };

  // sectionId가 있으면 해당 section의 과제 페이지로 라우팅
  const getLinkPath = () => {
    if (course.sectionId) {
      return `/sections/${course.sectionId}/assignments`;
    }
    return "/assignments";
  };

  return (
    <Link to={getLinkPath()} className="course-card-link">
      <div className="course-card">
        <div className={`card-header ${getColorClass(course.color)}`}>
          <div className="card-title">
            <h3>{course.title}</h3>
          </div>
          <div className="batch-badge">{course.batch}</div>
        </div>
        
        <div className="card-content">
          <h4 className="course-name">{course.courseName}</h4>
          
          <div className="status-tags">
            {course.status.map((status, index) => (
              <span key={index} className={`status-tag ${getStatusColor(status.color)}`}>
                {status.text}
              </span>
            ))}
          </div>
          
          <p className="instructor">{course.instructor} 교수님</p>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard; 