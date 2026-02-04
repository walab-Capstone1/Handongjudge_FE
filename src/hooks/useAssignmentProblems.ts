import { useState, useCallback } from "react";
import APIService from "../services/APIService";

interface Problem {
  id: number;
  title: string;
  [key: string]: any;
}

interface Assignment {
  id: number;
  title: string;
  problems?: Problem[];
  [key: string]: any;
}

export const useAssignmentProblems = () => {
  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
  const [copyableProblems, setCopyableProblems] = useState<Problem[]>([]);
  const [assignmentsForProblem, setAssignmentsForProblem] = useState<Assignment[]>([]);
  const [assignmentProblems, setAssignmentProblems] = useState<Record<number, Problem[]>>({});
  const [expandedAssignmentsForProblem, setExpandedAssignmentsForProblem] = useState<Record<number, boolean>>({});
  const [loadingAssignmentsForProblem, setLoadingAssignmentsForProblem] = useState(false);

  const fetchAvailableProblems = useCallback(async () => {
    try {
      const response = await APIService.getAllProblems();
      const problems = response.data || response || [];
      setAvailableProblems(Array.isArray(problems) ? problems : []);
    } catch (error) {
      console.error("사용 가능한 문제 조회 실패:", error);
      setAvailableProblems([]);
    }
  }, []);

  const fetchCopyableProblems = useCallback(async (sectionId: string | null = null) => {
    try {
      let problems: Problem[] = [];

      if (sectionId) {
        const response = await APIService.getAllProblems();
        problems = response.data || response || [];
      } else {
        const response = await APIService.getAllProblems();
        problems = response.data || response || [];
      }

      setCopyableProblems(Array.isArray(problems) ? problems : []);
    } catch (error) {
      console.error("복사 가능한 문제 조회 실패:", error);
      setCopyableProblems([]);
    }
  }, []);

  const handleSectionChangeForProblem = useCallback(async (sectionId: string) => {
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

      const assignmentsWithProblems = await Promise.all(
        assignmentsData.map(async (assignment: Assignment) => {
          try {
            const problemsResponse = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);
            const problems = problemsResponse.data || problemsResponse;
            return {
              ...assignment,
              problems: Array.isArray(problems) ? problems : problems.problems || [],
            };
          } catch (error) {
            console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
            return {
              ...assignment,
              problems: [],
            };
          }
        })
      );

      setAssignmentsForProblem(assignmentsWithProblems);

      const problemsMap: Record<number, Problem[]> = {};
      assignmentsWithProblems.forEach((assignment) => {
        problemsMap[assignment.id] = assignment.problems || [];
      });
      setAssignmentProblems(problemsMap);
    } catch (error) {
      console.error("과제 목록 조회 실패:", error);
      setAssignmentsForProblem([]);
    } finally {
      setLoadingAssignmentsForProblem(false);
    }
  }, []);

  const toggleAssignmentForProblem = useCallback((assignmentId: number) => {
    setExpandedAssignmentsForProblem((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
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
    toggleAssignmentForProblem,
  };
};
