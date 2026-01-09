import React from "react";
import "./CourseHeader.css";

const CourseHeader = ({ 
  courseName = "[Coding Studio] 1 분반"
}) => {
  return (
    <div className="course-header-container">
      <div className="course-header-top">
        <span className="course-name">{courseName}</span>
      </div>
    </div>
  );
};

export default CourseHeader;

