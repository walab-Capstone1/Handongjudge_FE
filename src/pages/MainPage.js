import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import CourseCard from "../components/CourseCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import APIService from "../services/APIService";
import "./MainPage.css";

const MainPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnrolledSections = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await APIService.getUserEnrolledSections();
        setEnrolledSections(response.data || response);
      } catch (err) {
        console.error('수강 중인 section 조회 실패:', err);
        setError(err.message || '수강 중인 강의를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledSections();
  }, [isAuthenticated]);

  // API 응답 데이터를 CourseCard 컴포넌트에 맞는 형태로 변환
  const transformSectionData = (section) => {
    return {
      id: section.sectionId,
      title: section.courseTitle,
      subtitle: `강의 ID: ${section.courseId}`,
      batch: `Section ${section.sectionId}`,
      courseName: `[${section.courseTitle}] Section ${section.sectionId}`,
      status: generateStatus(section),
      instructor: section.instructorName,
      color: getRandomColor(section.sectionId),
      sectionId: section.sectionId,
      courseId: section.courseId
    };
  };

  // section 데이터를 기반으로 상태 정보 생성
  const generateStatus = (section) => {
    const status = [];
    
    // 새로운 공지사항이 있으면 추가
    if (section.newNoticeCount > 0) {
      status.push({ type: "announcement", text: `새로운 공지`, color: "green" });
    }
    
    // 현재는 과제 정보가 없으므로 기본 상태만 표시
    // 향후 과제 정보가 추가되면 여기에 로직 추가
    
    return status;
  };

  // section ID를 기반으로 일관된 색상 생성
  const getRandomColor = (id) => {
    const colors = ['purple', 'orange', 'red', 'blue', 'green'];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="main-page">
          <div className="loading-container">
            <LoadingSpinner />
            <p>수강 중인 강의를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="main-page">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              다시 시도
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const transformedSections = enrolledSections.map(transformSectionData);

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
            <h1 className="class-title">
              {user?.name || '사용자'}'s class
            </h1>
          </div>
          
          {transformedSections.length === 0 ? (
            <div className="empty-state">
              <p>수강 중인 강의가 없습니다.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {transformedSections.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MainPage; 