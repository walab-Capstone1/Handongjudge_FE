import { useState, useEffect, useCallback } from "react";
import APIService from "../services/APIService";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  sectionName: string;
  sectionId: number;
  problemCount: number;
  problems: any[];
  dueDate: string;
  submissionCount: number;
  totalStudents: number;
  [key: string]: any;
}

interface Section {
  sectionId: number;
  courseTitle: string;
  sectionNumber: string;
  totalStudents?: number;
  [key: string]: any;
}

export const useAssignments = (sectionId: string | null) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);

      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);

      if (sectionId) {
        const currentSectionData = sectionsData.find(
          (section: Section) => section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData || null);
      }

      let allAssignments: Assignment[] = [];

      if (sectionId) {
        try {
          const currentSectionData = sectionsData.find(
            (section: Section) => section.sectionId === parseInt(sectionId)
          );
          if (currentSectionData) {
            const sectionAssignments = await APIService.getAssignmentsBySection(parseInt(sectionId));

            const assignmentsWithDetails = await Promise.all(
              (sectionAssignments || []).map(async (assignment: any) => {
                try {
                  const problems = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);

                  return {
                    ...assignment,
                    sectionName: `${currentSectionData.courseTitle} - ${currentSectionData.sectionNumber}분반`,
                    sectionId: parseInt(sectionId),
                    problemCount: problems?.length || 0,
                    problems: problems || [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: currentSectionData.totalStudents || 0,
                  };
                } catch (error) {
                  return {
                    ...assignment,
                    sectionName: `${currentSectionData.courseTitle} - ${currentSectionData.sectionNumber}분반`,
                    sectionId: parseInt(sectionId),
                    problemCount: 0,
                    problems: [],
                    dueDate: assignment.endDate,
                    submissionCount: 0,
                    totalStudents: currentSectionData.totalStudents || 0,
                  };
                }
              })
            );

            allAssignments = assignmentsWithDetails;
          }
        } catch (error) {
          console.error("분반별 과제 조회 실패:", error);
        }
      } else {
        for (const section of sectionsData) {
          try {
            const sectionAssignments = await APIService.getAssignmentsBySection(section.sectionId);

            const assignmentsWithDetails = await Promise.all(
              (sectionAssignments || []).map(async (assignment: any) => {
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
                    totalStudents: section.totalStudents || 0,
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
                    totalStudents: section.totalStudents || 0,
                  };
                }
              })
            );

            allAssignments = [...allAssignments, ...assignmentsWithDetails];
          } catch (error) {
            // 무시
          }
        }
      }

      setAssignments(allAssignments);
      setLoading(false);
    } catch (error) {
      console.error("과제 조회 실패:", error);
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
    refetch: fetchAssignments,
  };
};
