import React from "react";
import { useParams, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import AssignmentHeader from "../../components/AssignmentHeader";
import ProblemsList from "../../components/ProblemsList";
import ErrorMessage from "../../components/ErrorMessage";
import { useAssignmentData } from "../../hooks/useAssignmentData";
import "./AssignmentDetailPage.css";

/**
 * 과제 상세 페이지 컴포넌트
 * 과제 정보와 문제 목록을 표시합니다.
 */
const AssignmentDetailPage = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  
  // 커스텀 훅을 사용하여 과제 데이터 로드
  const {
    problems,
    assignmentInfo,
    loading,
    error,
    refetch
  } = useAssignmentData(assignmentId, location.pathname, location.state);

  // 로딩 상태 처리
  if (loading) {
    return (
      <MainLayout>
        <div className="assignment-detail-page">
          <div className="content-area">
            <LoadingSpinner />
          </div>
        </div>
      </MainLayout>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <MainLayout>
        <div className="assignment-detail-page">
          <div className="content-area">
            <ErrorMessage 
              error={error} 
              onRetry={refetch}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="assignment-detail-page">
        <div className="content-area">
          {/* 과제 헤더 */}
          <AssignmentHeader 
            assignmentInfo={assignmentInfo} 
            assignmentId={assignmentId} 
          />
          
          {/* 문제 목록 */}
          <ProblemsList 
            problems={problems} 
            assignmentId={assignmentId} 
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentDetailPage; 