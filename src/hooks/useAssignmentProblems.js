import { useState, useCallback } from 'react';
import APIService from '../services/APIService';

/**
 * 과제 문제 관리를 위한 커스텀 훅
 * @returns {Object} 문제 관련 상태와 함수들
 */
export const useAssignmentProblems = () => {
  const [availableProblems, setAvailableProblems] = useState([]);
  const [copyableProblems, setCopyableProblems] = useState([]);
  const [assignmentsForProblem, setAssignmentsForProblem] = useState([]);
  const [assignmentProblems, setAssignmentProblems] = useState({});
  const [expandedAssignmentsForProblem, setExpandedAssignmentsForProblem] = useState({});
  const [loadingAssignmentsForProblem, setLoadingAssignmentsForProblem] = useState(false);

  const fetchAvailableProblems = useCallback(async () => {
    try {
      const response = await APIService.getProblems();
      const problems = response.data || response || [];
      setAvailableProblems(Array.isArray(problems) ? problems : []);
    } catch (error) {
      console.error('사용 가능한 문제 조회 실패:', error);
      setAvailableProblems([]);
    }
  }, []);

  const fetchCopyableProblems = useCallback(async (sectionId = null) => {
    try {
      let problems = [];
      
      if (sectionId) {
        // 특정 분반의 문제만 조회
        const response = await APIService.getProblemsBySection(sectionId);
        problems = response.data || response || [];
      } else {
        // 모든 문제 조회
        const response = await APIService.getProblems();
        problems = response.data || response || [];
      }
      
      setCopyableProblems(Array.isArray(problems) ? problems : []);
    } catch (error) {
      console.error('복사 가능한 문제 조회 실패:', error);
      setCopyableProblems([]);
    }
  }, []);

  const handleSectionChangeForProblem = useCallback(async (sectionId) => {
    setExpandedAssignmentsForProblem({});
    setAssignmentProblems({});
    
    if (!sectionId) {
      setAssignmentsForProblem([]);
      return;
    }

    try {
      setLoadingAssignmentsForProblem(true);
      const assignments = await APIService.getAssignmentsBySection(parseInt(sectionId));
      const assignmentsData = assignments.data || assignments;
      
      // 각 과제의 문제 목록 가져오기
      const assignmentsWithProblems = await Promise.all(
        assignmentsData.map(async (assignment) => {
          try {
            const problemsResponse = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);
            const problems = problemsResponse.data || problemsResponse;
            return {
              ...assignment,
              problems: Array.isArray(problems) ? problems : (problems.problems || [])
            };
          } catch (error) {
            console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
            return {
              ...assignment,
              problems: []
            };
          }
        })
      );
      
      setAssignmentsForProblem(assignmentsWithProblems);
      
      // assignmentProblems 맵 초기화
      const problemsMap = {};
      assignmentsWithProblems.forEach(assignment => {
        problemsMap[assignment.id] = assignment.problems || [];
      });
      setAssignmentProblems(problemsMap);
    } catch (error) {
      console.error('과제 목록 조회 실패:', error);
      setAssignmentsForProblem([]);
    } finally {
      setLoadingAssignmentsForProblem(false);
    }
  }, []);

  const toggleAssignmentForProblem = useCallback((assignmentId) => {
    setExpandedAssignmentsForProblem(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  }, []);

  return {
    availableProblems,
    setAvailableProblems,
    copyableProblems,
    setCopyableProblems,
    assignmentsForProblem,
    setAssignmentsForProblem,
    assignmentProblems,
    setAssignmentProblems,
    expandedAssignmentsForProblem,
    setExpandedAssignmentsForProblem,
    loadingAssignmentsForProblem,
    fetchAvailableProblems,
    fetchCopyableProblems,
    handleSectionChangeForProblem,
    toggleAssignmentForProblem
  };
};

