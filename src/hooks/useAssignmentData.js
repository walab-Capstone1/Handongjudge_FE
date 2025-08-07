import { useState, useEffect } from 'react';
import APIService from '../services/APIService';
import { getSectionId } from '../utils/urlUtils';

/**
 * 과제 데이터를 로드하는 커스텀 훅
 * @param {string} assignmentId - 과제 ID
 * @param {string} pathname - 현재 경로
 * @param {Object} locationState - location.state 객체
 * @returns {Object} 과제 데이터와 로딩 상태
 */
export const useAssignmentData = (assignmentId, pathname, locationState) => {
  const [problems, setProblems] = useState([]);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionId, setSectionId] = useState(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // sectionId 추출
        const currentSectionId = getSectionId(pathname, locationState);
        setSectionId(currentSectionId);

        // 1. 과제 정보 가져오기
        console.log('과제 정보 로드 시작:', { assignmentId, sectionId: currentSectionId });
        const assignmentResponse = await APIService.getAssignmentInfo(currentSectionId, assignmentId);
        const assignmentData = assignmentResponse.data || assignmentResponse;
        console.log('과제 정보 로드 성공:', assignmentData);
        
        if (assignmentData) {
          setAssignmentInfo(assignmentData);
        }

        // 2. 과제 문제 목록 가져오기
        console.log('과제 문제 목록 로드 시작:', { sectionId: currentSectionId, assignmentId });
        const problemsResponse = await APIService.getAssignmentProblems(currentSectionId, assignmentId);
        const problemsData = problemsResponse.data || problemsResponse;
        console.log('과제 문제 목록 로드 성공:', problemsData);
        
        setProblems(problemsData.problems || problemsData);
        
        // 과제 정보가 아직 설정되지 않았다면 문제 목록에서 가져온 정보 사용
        if (!assignmentData && problemsData.assignment) {
          console.log('문제 목록에서 과제 정보 설정:', problemsData.assignment);
          setAssignmentInfo(problemsData.assignment);
        }
        
        // 과제 정보가 전혀 없는 경우 기본 정보 설정
        if (!assignmentData && !problemsData.assignment) {
          console.log('기본 과제 정보 설정');
          setAssignmentInfo({
            id: assignmentId,
            title: `과제 ${assignmentId}`,
            description: "과제 문제들을 풀어보세요.",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        
      } catch (err) {
        console.error("과제 데이터 조회 실패:", err);
        setError("과제 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId, pathname, locationState]);

  return {
    problems,
    assignmentInfo,
    loading,
    error,
    sectionId,
    refetch: () => {
      setLoading(true);
      setError(null);
      // useEffect가 다시 실행되도록 의존성 배열의 값을 변경
      setSectionId(prev => prev);
    }
  };
}; 