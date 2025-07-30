import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CourseCard from "../components/CourseCard";
import "./MainPage.css";

const MainPage = () => {
  const courses = [
    {
      id: 1,
      title: "Data Engineering",
      subtitle: "데이터 엔지니어링 데브코스",
      batch: "7기",
      courseName: "[CS] A Class (section 2)",
      status: [
        { type: "assignment", text: "과제제출 D-5", color: "blue" },
        { type: "new", text: "새로운 과제", color: "yellow" }
      ],
      instructor: "OOO 교수님",
      color: "purple"
    },
    {
      id: 2,
      title: "Web Full Stack",
      subtitle: "웹풀스택 데브코스",
      batch: "8기",
      courseName: "[CS] Java Camp (section1)",
      status: [
        { type: "assignment", text: "과제제출 D-16", color: "blue" },
        { type: "new", text: "새로운 과제", color: "yellow" },
        { type: "announcement", text: "새로운 공지", color: "green" }
      ],
      instructor: "OOO 교수님",
      color: "orange"
    },
    {
      id: 3,
      title: "Data Analysis",
      subtitle: "데이터 분석 데브코스",
      batch: "8기",
      courseName: "[CS] C/C++ Camp(section1)",
      status: [
        { type: "assignment", text: "과제제출 D-2", color: "blue" },
        { type: "new", text: "새로운 과제", color: "yellow" },
        { type: "announcement", text: "새로운 공지", color: "green" }
      ],
      instructor: "OOO 교수님",
      color: "red"
    },
    {
      id: 4,
      title: "Web Full Stack",
      subtitle: "웹플스택 데브코스",
      batch: "8기",
      courseName: "[cs] Intro to AI",
      status: [
        { type: "assignment", text: "과제제출 D-16", color: "blue" },
        { type: "announcement", text: "새로운 공지", color: "green" }
      ],
      instructor: "OOO 교수님",
      color: "orange"
    }
  ];

  return (
    <MainLayout>
      <div className="main-page">
        <div className="main-header">
          <Link to="/mypage/info" className="profile-avatar">
            <div className="avatar-icon">🐦</div>
          </Link>
        </div>
        
        <div className="content-section">
          <div className="class-header">
            <h1 className="class-title">John Do' class</h1>
            <a href="/assignments" className="more-link">More &gt;</a>
          </div>
          
          <div className="courses-grid">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MainPage; 