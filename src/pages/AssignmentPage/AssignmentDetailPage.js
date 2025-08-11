import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import AssignmentHeader from "../../components/AssignmentHeader";
import ProblemsList from "../../components/ProblemsList";
import ErrorMessage from "../../components/ErrorMessage";
import APIService from "../../services/APIService";
import "./AssignmentDetailPage.css";

/**
 * 과제 상세 페이지 컴포넌트
 * 과제 정보와 문제 목록을 표시합니다.
 */
const AssignmentDetailPage = () => {  
  const { assignmentId, sectionId } = useParams();
  const location = useLocation();
  
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('assignmentId:', assignmentId);
        console.log('sectionId:', sectionId);
        
      

        // 과제 문제 목록 조회
        const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignmentId);
        const problemsData = problemsResponse.data || problemsResponse;
        console.log('problemsData:', problemsData);
        setProblems(problemsData.problems || problemsData);
        
      } catch (err) {
        console.error("과제 데이터 조회 실패:", err);
        setError("과제 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId && sectionId) {
      fetchAssignmentData();
    } else {
      setLoading(false);
    }
  }, [assignmentId, sectionId]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // useEffect가 다시 실행되도록 의존성 배열의 값을 변경
    setAssignmentInfo(prev => prev);
  };

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
            problems={problems || []} 
            assignmentId={assignmentId} 
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentDetailPage; 