import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStats, setSubmissionStats] = useState(null);
  const [userSubmissionStatus, setUserSubmissionStatus] = useState(null);
  const [sectionInfo, setSectionInfo] = useState(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('assignmentId:', assignmentId);
        console.log('sectionId:', sectionId);
        
        // 병렬로 과제 정보와 섹션 정보를 가져옴
        const [assignmentResponse, sectionResponse] = await Promise.all([
          APIService.getAssignmentInfoBySection(sectionId, assignmentId),
          APIService.getSectionInfo(sectionId)
        ]);
        
        const assignmentData = assignmentResponse.data || assignmentResponse;
        const sectionData = sectionResponse.data || sectionResponse;
        console.log('assignmentData:', assignmentData);
        console.log('sectionData:', sectionData);
        setAssignmentInfo(assignmentData);
        setSectionInfo(sectionData);

        // 과제 문제 목록 조회
        const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignmentId);
        const problemsData = problemsResponse.data || problemsResponse;
        console.log('problemsData:', problemsData);
        
        // 각 문제의 상세 정보를 가져와서 시간 제한과 메모리 제한 정보 추가
        const problemsWithDetails = await Promise.all(
          (problemsData.problems || problemsData).map(async (problem) => {
            try {
              console.log(`🔍 문제 ${problem.id} 상세 정보 조회 시작:`, problem);
              const problemDetail = await APIService.getProblemInfo(problem.id);
              console.log(`🔍 문제 ${problem.id} 상세 정보 조회 결과:`, problemDetail);
              
              const enhancedProblem = {
                ...problem,
                timeLimit: problemDetail.timeLimit,
                memoryLimit: problemDetail.memoryLimit
              };
              
              console.log(`🔍 문제 ${problem.id} 최종 데이터:`, enhancedProblem);
              return enhancedProblem;
            } catch (error) {
              console.error(`문제 ${problem.id} 상세 정보 조회 실패:`, error);
              return problem; // 상세 정보 조회 실패 시 원본 문제 정보 사용
            }
          })
        );
        
        setProblems(problemsWithDetails);
        
        // 과제 제출 통계 조회
        try {
          const statsResponse = await APIService.getAssignmentSubmissionStats(assignmentId, sectionId);
          console.log('제출 통계:', statsResponse);
          setSubmissionStats(statsResponse);
        } catch (statsError) {
          console.error('제출 통계 조회 실패:', statsError);
          setSubmissionStats(null);
        }

        // 사용자별 제출 상태 조회
        try {
          const userStatusResponse = await APIService.getUserSubmissionStatus(sectionId, assignmentId);
          console.log('사용자 제출 상태:', userStatusResponse);
          setUserSubmissionStatus(userStatusResponse);
        } catch (userStatusError) {
          console.error('사용자 제출 상태 조회 실패:', userStatusError);
          setUserSubmissionStatus(null);
        }
        
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

  // 네비게이션 함수들
  const handleBackToSection = () => {
    navigate(`/sections/${sectionId}`);
  };

  const handleBackToAssignments = () => {
    navigate(`/sections/${sectionId}?tab=assignments`);
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
          {/* 네비게이션 바 */}
          <div className="assignment-navigation-header">
            <button 
              className="back-button"
              onClick={handleBackToAssignments}
            >
              <span className="back-icon">←</span>
              목록으로
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-item">{sectionInfo?.courseTitle || "강의"}</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item">{sectionInfo?.sectionNumber || sectionId}분반</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item current">과제</span>
            </div>
          </div>

          {/* 과제 헤더 */}
          <AssignmentHeader 
            assignmentInfo={assignmentInfo} 
            assignmentId={assignmentId} 
          />
          
          {/* 문제 목록 */}
          <ProblemsList 
            problems={problems || []} 
            assignmentId={assignmentId} 
            submissionStats={submissionStats}
            userSubmissionStatus={userSubmissionStatus}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentDetailPage; 