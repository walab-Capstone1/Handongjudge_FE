import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import AssignmentCard from "./AssignmentCard";
import APIService from "../../services/APIService";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./AssignmentListPage.css";

const AssignmentListPage = () => {
  const { sectionId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionInfo, setSectionInfo] = useState({
    courseTitle: "Loading...",
    sectionNumber: 0,
    instructorName: "Loading..."
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        
        // 병렬로 과제 목록과 섹션 정보 조회
        const [assignmentsResponse, sectionResponse] = await Promise.all([
          APIService.getAssignments(sectionId),
          APIService.getSectionInfo(sectionId)
        ]);
        
        setAssignments(assignmentsResponse.data || assignmentsResponse);
        setSectionInfo(sectionResponse.data || sectionResponse);
        
      } catch (err) {
        console.error("과제 목록 조회 실패:", err);
        setError("과제 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [sectionId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeadlineStatus = (endDate) => {
    const now = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: "마감됨", status: "expired" };
    } else if (diffDays <= 3) {
      return { text: `D-${diffDays}`, status: "urgent" };
    } else if (diffDays <= 7) {
      return { text: `D-${diffDays}`, status: "warning" };
    } else {
      return { text: `D-${diffDays}`, status: "normal" };
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="assignment-list-page">
          <div className="content-area">
            <LoadingSpinner />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="assignment-list-page">
          <div className="content-area">
            <div className="error-message">
              <h3>오류가 발생했습니다</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="assignment-list-page">
        <div className="content-area">
          <div className="assignment-section-container">
            <div className="class-info">
              <div className="class-details">
                <h2 className="class-title">{sectionInfo.courseTitle} - {sectionInfo.sectionNumber}분반</h2>
                <p className="class-description">
                  과제 목록을 확인하세요.
                </p>
              </div>
              <div className="class-icon">📚</div>
            </div>
            
            {assignments.length === 0 ? (
              <div className="no-assignments">
                <h3>등록된 과제가 없습니다</h3>
                <p>새로운 과제가 등록되면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="assignments-grid">
                {assignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment}
                    formatDate={formatDate}
                    getDeadlineStatus={getDeadlineStatus}
                    onAssignmentRead={(assignmentId) => {
                      // 읽음 처리 후 과제 상태 업데이트
                      setAssignments(prev => prev.map(a => 
                        a.id === assignmentId ? { ...a, isNew: false } : a
                      ));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentListPage; 