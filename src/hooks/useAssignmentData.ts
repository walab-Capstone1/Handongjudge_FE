import { useState, useEffect } from "react";
import APIService from "../services/APIService";
import { getSectionId } from "../utils/urlUtils";

interface AssignmentInfo {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  [key: string]: any;
}

export const useAssignmentData = (
  assignmentId: string,
  pathname: string,
  locationState: any
) => {
  const [problems, setProblems] = useState<any[]>([]);
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentSectionId = getSectionId(pathname, locationState);
        setSectionId(String(currentSectionId));

        console.log("과제 정보 로드 시작:", { assignmentId, sectionId: currentSectionId });
        const assignmentResponse = await APIService.getAssignmentInfoBySection(
          currentSectionId!,
          assignmentId
        );
        const assignmentData = assignmentResponse.data || assignmentResponse;
        console.log("과제 정보 로드 성공:", assignmentData);

        if (assignmentData) {
          setAssignmentInfo(assignmentData);
        }

        console.log("과제 문제 목록 로드 시작:", { sectionId: currentSectionId, assignmentId });
        const problemsResponse = await APIService.getAssignmentProblems(
          currentSectionId!,
          assignmentId
        );
        const problemsData = problemsResponse.data || problemsResponse;
        console.log("과제 문제 목록 로드 성공:", problemsData);

        setProblems(problemsData.problems || problemsData);

        if (!assignmentData && problemsData.assignment) {
          console.log("문제 목록에서 과제 정보 설정:", problemsData.assignment);
          setAssignmentInfo(problemsData.assignment);
        }

        if (!assignmentData && !problemsData.assignment) {
          console.log("기본 과제 정보 설정");
          setAssignmentInfo({
            id: parseInt(assignmentId),
            title: `과제 ${assignmentId}`,
            description: "과제 문제들을 풀어보세요.",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      } catch (err: any) {
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
      setSectionId((prev) => prev);
    },
  };
};
