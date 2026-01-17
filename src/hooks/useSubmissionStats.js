import { useState, useEffect, useCallback } from 'react';
import APIService from '../services/APIService';

/**
 * 과제 제출 통계를 관리하는 커스텀 훅
 * @param {Array} assignments - 과제 목록
 * @param {string|null} sectionId - 분반 ID
 * @returns {Object} 제출 통계와 관련 함수들
 */
export const useSubmissionStats = (assignments, sectionId) => {
  const [submissionStats, setSubmissionStats] = useState({});

  const fetchSubmissionStats = useCallback(async () => {
    if (assignments.length === 0) {
      return;
    }

    try {
      console.log('제출 통계 조회 시작:', { assignments: assignments.length, sectionId });
      const stats = {};
      
      for (const assignment of assignments) {
        console.log(`과제 ${assignment.id} 처리 중:`, assignment);
        
        if (sectionId) {
          // 분반별 과제 제출 통계
          console.log(`분반별 과제 ${assignment.id} 제출 통계 조회 중...`);
          const response = await APIService.getAssignmentSubmissionStats(assignment.id, sectionId);
          console.log(`과제 ${assignment.id} 응답:`, response);
          
          // API 응답이 있으면 사용, 없으면 기본값 설정
          if (response) {
            console.log(`과제 ${assignment.id} 응답 데이터:`, {
              totalStudents: response.totalStudents,
              problemStats: response.problemStats
            });
            
            // 백엔드에서 이미 정확한 데이터를 제공하므로 그대로 사용
            stats[assignment.id] = response;
          } else {
            console.log(`과제 ${assignment.id} API 응답 없음`);
            // 백엔드 API 응답이 없으면 해당 과제는 통계에서 제외
          }
        } else {
          // 전체 과제 제출 통계 (교수용) - 분반별로 개별 호출
          console.log(`전체 과제 ${assignment.id} 제출 통계 조회 중...`);
          console.log(`과제 ${assignment.id}의 sectionId:`, assignment.sectionId);
          
          if (!assignment.sectionId) {
            console.error(`과제 ${assignment.id}의 sectionId가 없습니다!`);
            continue; // 이 과제는 건너뛰기
          }
          
          const response = await APIService.getAssignmentSubmissionStats(assignment.id, assignment.sectionId);
          
          if (response) {
            console.log(`과제 ${assignment.id} 전체 통계 데이터:`, response);
            
            // 백엔드에서 이미 정확한 데이터를 제공하므로 그대로 사용
            stats[assignment.id] = response;
          } else {
            console.log(`과제 ${assignment.id} 전체 통계 데이터 없음`);
            // 백엔드 API 응답이 없으면 해당 과제는 통계에서 제외
          }
        }
      }
      
      console.log('최종 제출 통계:', stats);
      setSubmissionStats(stats);
    } catch (error) {
      console.error('제출 통계 조회 실패:', error);
      
      // 에러 발생 시 빈 통계 설정
      setSubmissionStats({});
    }
  }, [assignments, sectionId]);

  useEffect(() => {
    if (assignments.length > 0) {
      fetchSubmissionStats();
    }
  }, [assignments, fetchSubmissionStats]);

  return {
    submissionStats,
    setSubmissionStats,
    refetch: fetchSubmissionStats
  };
};

