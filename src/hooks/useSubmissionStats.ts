import { useState, useEffect, useCallback } from "react";
import APIService from "../services/APIService";

interface Assignment {
  id: number;
  sectionId?: number;
  [key: string]: any;
}

interface SubmissionStat {
  totalStudents?: number;
  problemStats?: any[];
  [key: string]: any;
}

export const useSubmissionStats = (assignments: Assignment[], sectionId: string | null) => {
  const [submissionStats, setSubmissionStats] = useState<Record<number, SubmissionStat>>({});

  const fetchSubmissionStats = useCallback(async () => {
    if (assignments.length === 0) {
      return;
    }

    try {
      console.log("제출 통계 조회 시작:", { assignments: assignments.length, sectionId });
      const stats: Record<number, SubmissionStat> = {};

      for (const assignment of assignments) {
        console.log(`과제 ${assignment.id} 처리 중:`, assignment);

        if (sectionId) {
          console.log(`분반별 과제 ${assignment.id} 제출 통계 조회 중...`);
          const response = await APIService.getAssignmentSubmissionStats(assignment.id, sectionId);
          console.log(`과제 ${assignment.id} 응답:`, response);

          if (response) {
            console.log(`과제 ${assignment.id} 응답 데이터:`, {
              totalStudents: response.totalStudents,
              problemStats: response.problemStats,
            });

            stats[assignment.id] = response;
          } else {
            console.log(`과제 ${assignment.id} API 응답 없음`);
          }
        } else {
          console.log(`전체 과제 ${assignment.id} 제출 통계 조회 중...`);
          console.log(`과제 ${assignment.id}의 sectionId:`, assignment.sectionId);

          if (!assignment.sectionId) {
            console.error(`과제 ${assignment.id}의 sectionId가 없습니다!`);
            continue;
          }

          const response = await APIService.getAssignmentSubmissionStats(
            assignment.id,
            assignment.sectionId
          );

          if (response) {
            console.log(`과제 ${assignment.id} 전체 통계 데이터:`, response);
            stats[assignment.id] = response;
          } else {
            console.log(`과제 ${assignment.id} 전체 통계 데이터 없음`);
          }
        }
      }

      console.log("최종 제출 통계:", stats);
      setSubmissionStats(stats);
    } catch (error) {
      console.error("제출 통계 조회 실패:", error);
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
    refetch: fetchSubmissionStats,
  };
};
