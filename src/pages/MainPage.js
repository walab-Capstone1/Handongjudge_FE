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
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

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
        console.log('🔥 메인 페이지 대시보드 응답:', response);
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

  // 상태 업데이트 콜백 (공지사항/과제 읽음 처리 후 대시보드 새로고침)
  const handleStatusUpdate = async () => {
    console.log('🔥 상태 업데이트 콜백 호출됨 - 대시보드 새로고침');
    try {
      const response = await APIService.getUserEnrolledSections();
      console.log('🔥 대시보드 새로고침 응답:', response);
      setEnrolledSections(response.data || response);
    } catch (err) {
      console.error('🔥 대시보드 새로고침 실패:', err);
    }
  };

  // API 응답 데이터를 CourseCard 컴포넌트에 맞는 형태로 변환
  const transformSectionData = (section) => {
    return {
      id: section.sectionId,
      title: section.courseTitle,
      subtitle: `강의 ID: ${section.courseId}`,
      batch: `${section.sectionNumber}분반`,
      courseName: `[${section.courseTitle}] ${section.sectionNumber}분반`,
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
    
    // 새로운 과제가 있으면 추가
    if (section.newAssignmentCount > 0) {
      status.push({ type: "assignment", text: `새로운 과제`, color: "blue" });
    }
    
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

  const handleEnrollByCode = async () => {
    if (!enrollmentCode.trim()) {
      alert('참가 코드를 입력하세요.');
      return;
    }
    try {
      setEnrollLoading(true);
      const resp = await APIService.enrollByCode(enrollmentCode.trim());
      if (resp && resp.success) {
        alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
        setEnrollmentCode("");
        // 목록 새로고침
        const refreshed = await APIService.getUserEnrolledSections();
        setEnrolledSections(refreshed.data || refreshed);
      } else {
        alert(resp?.message || '수강 신청에 실패했습니다.');
      }
    } catch (e) {
      alert(e.message || '수강 신청 중 오류가 발생했습니다.');
    } finally {
      setEnrollLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="main-page">
                  
        <div className="content-section">
          <div className="section-header">
            <div className="section-info">
              <div className="title-container">
                <h1 className="section-title">
                  {user?.name || '사용자'}'s class
                </h1>
                <button
                  className="open-enroll-modal"
                  onClick={() => setShowEnrollModal(true)}
                >
                  수업 참가
                </button>
              </div>
            </div>
          </div>
          
          {transformedSections.length === 0 ? (
            <div className="empty-state">
              <p>수강 중인 강의가 없습니다.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {transformedSections.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {showEnrollModal && (
          <div className="enroll-modal-overlay" onClick={() => setShowEnrollModal(false)}>
            <div className="enroll-modal" onClick={(e) => e.stopPropagation()}>
              <div className="enroll-modal-header">
                <h2>수업 참가</h2>
                <button className="enroll-modal-close" onClick={() => setShowEnrollModal(false)}>×</button>
              </div>
              <div className="enroll-modal-body">
                <label>참가 코드</label>
                <input
                  type="text"
                  className="enroll-input"
                  placeholder="예: ABCD1234"
                  value={enrollmentCode}
                  onChange={(e) => setEnrollmentCode(e.target.value)}
                />
              </div>
              <div className="enroll-modal-actions">
                <button className="enroll-cancel" onClick={() => setShowEnrollModal(false)}>취소</button>
                <button
                  className="enroll-button"
                  onClick={async () => {
                    await handleEnrollByCode();
                    setShowEnrollModal(false);
                  }}
                  disabled={enrollLoading}
                >
                  {enrollLoading ? '처리 중...' : '참가하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MainPage; 