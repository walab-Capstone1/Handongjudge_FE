import type { ProblemGrade, StudentGradeRow } from "../types";

/** 헤더 기준으로 보여 줄 문제 열 (null이면 전체) */
export function getVisibleProblemColumns(
	grades: StudentGradeRow[],
	filterProblemId: number | null,
): ProblemGrade[] {
	const all = grades[0]?.problemGrades ?? [];
	if (filterProblemId == null) return all;
	return all.filter((p) => p.problemId === filterProblemId);
}

/** 필터로 일부 열만 보일 때는 해당 문항만 합산, 전체 보기면 API 총점 사용 */
export function getTotalsForVisibleProblemColumns(
	student: StudentGradeRow,
	filterProblemId: number | null,
	visibleProblems: ProblemGrade[],
): { score: number; points: number } {
	if (filterProblemId == null) {
		return {
			score: student.totalScore ?? 0,
			points: student.totalPoints ?? 0,
		};
	}
	const idSet = new Set(visibleProblems.map((p) => p.problemId));
	let score = 0;
	let points = 0;
	for (const pg of student.problemGrades ?? []) {
		if (idSet.has(pg.problemId)) {
			score += Number(pg.score ?? 0);
			points += Number(pg.points ?? 1);
		}
	}
	return { score, points };
}
