import { useState, useEffect, useCallback } from 'react';
import APIService from '../services/APIService';

/**
 * 과제 데이터를 관리하는 커스텀 훅
 * @param {string|null} sectionId - 분반 ID (없으면 전체 조회)
 * @returns {Object} 과제 데이터와 관련 함수들
 */
export const useAssignments = (sectionId) => {
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. 먼저 dashboard에서 분반 정보 가져오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      }
      
      // 2. 과제 조회 (분반별 또는 전체)
      let allAssignments = [];
      
      if (sectionId) {
        // 분반별 과제 관리: 해당 분반의 과제만 조회
        try {
          const currentSection = sectionsData.find(section => section.sectionId === parseInt(sectionId));
          if (currentSection) {
            const sectionAssignments = await APIService.getAssignmentsBySection(parseInt(sectionId));
            
            // 각 과제의 문제 수 조회
            const assignmentsWithDetails = await Promise.all(
              (sectionAssignments || []).map(async (assignment) => {
                try {
                  const problems = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);
                  
                  return {
                    ...assignment,
                    sectionName: `${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`,
                    sectionId: parseInt(sectionId),
                    problemCount: problems?.length || 0,
                    problems: problems || [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: currentSection.totalStudents || 0
                  };
                } catch (error) {
                  return {
                    ...assignment,
                    sectionName: `${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`,
                    sectionId: parseInt(sectionId),
                    problemCount: 0,
                    problems: [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: currentSection.totalStudents || 0
                  };
                }
              })
            );
            
            allAssignments = assignmentsWithDetails;
          }
        } catch (error) {
          console.error('분반별 과제 조회 실패:', error);
        }
      } else {
        // 전체 과제 관리: 모든 분반의 과제 조회
        for (const section of sectionsData) {
          try {
            const sectionAssignments = await APIService.getAssignmentsBySection(section.sectionId);
            
            // 각 과제의 문제 수 조회
            const assignmentsWithDetails = await Promise.all(
              (sectionAssignments || []).map(async (assignment) => {
                try {
                  const problems = await APIService.getAssignmentProblems(section.sectionId, assignment.id);
                  
                  return {
                    ...assignment,
                    sectionName: `${section.courseTitle} - ${section.sectionNumber}분반`,
                    sectionId: section.sectionId,
                    problemCount: problems?.length || 0,
                    problems: problems || [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: section.totalStudents || 0
                  };
                } catch (error) {
                  return {
                    ...assignment,
                    sectionName: `${section.courseTitle} - ${section.sectionNumber}분반`,
                    sectionId: section.sectionId,
                    problemCount: 0,
                    problems: [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: section.totalStudents || 0
                  };
                }
              })
            );
            
            allAssignments = [...allAssignments, ...assignmentsWithDetails];
          } catch (error) {
            // 분반 과제 조회 실패 시 무시
          }
        }
      }
      
      setAssignments(allAssignments);
      setLoading(false);
    } catch (error) {
      console.error('과제 조회 실패:', error);
      setAssignments([]);
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    setAssignments,
    sections,
    currentSection,
    loading,
    refetch: fetchAssignments
  };
};

