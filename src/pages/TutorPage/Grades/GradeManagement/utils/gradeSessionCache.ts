import type { CourseGradesData, StudentGradeRow } from "../types";

const COURSE_AGGREGATE_TTL_MS = 120_000;
const DETAIL_TTL_MS = 60_000;

const courseAggregateCache = new Map<
	string,
	{ at: number; value: CourseGradesData }
>();
const assignmentDetailCache = new Map<
	string,
	{ at: number; value: StudentGradeRow[] }
>();
const quizDetailCache = new Map<string, { at: number; value: StudentGradeRow[] }>();

function isFresh(at: number, ttl: number): boolean {
	return Date.now() - at < ttl;
}

export function courseAggregateCacheKey(
	sectionId: string,
	assignmentIds: number[],
	quizIds: number[],
	includeTestCaseResults: boolean,
): string {
	const a = [...assignmentIds].sort((x, y) => x - y).join(",");
	const q = [...quizIds].sort((x, y) => x - y).join(",");
	return `${sectionId}|course|tc:${includeTestCaseResults ? "1" : "0"}|a:${a}|q:${q}`;
}

export function getCachedCourseAggregate(
	key: string,
): CourseGradesData | null {
	const e = courseAggregateCache.get(key);
	if (!e || !isFresh(e.at, COURSE_AGGREGATE_TTL_MS)) {
		if (e) courseAggregateCache.delete(key);
		return null;
	}
	return e.value;
}

export function setCachedCourseAggregate(
	key: string,
	value: CourseGradesData,
): void {
	courseAggregateCache.set(key, { at: Date.now(), value });
}

export function assignmentDetailCacheKey(
	sectionId: string,
	assignmentId: number,
	includeTestCaseResults: boolean,
): string {
	return `${sectionId}|a|${assignmentId}|tc:${includeTestCaseResults ? "1" : "0"}`;
}

export function getCachedAssignmentDetail(
	key: string,
): StudentGradeRow[] | null {
	const e = assignmentDetailCache.get(key);
	if (!e || !isFresh(e.at, DETAIL_TTL_MS)) {
		if (e) assignmentDetailCache.delete(key);
		return null;
	}
	return e.value;
}

export function setCachedAssignmentDetail(
	key: string,
	value: StudentGradeRow[],
): void {
	assignmentDetailCache.set(key, { at: Date.now(), value });
}

export function quizDetailCacheKey(
	sectionId: string,
	quizId: number,
	includeTestCaseResults: boolean,
): string {
	return `${sectionId}|q|${quizId}|tc:${includeTestCaseResults ? "1" : "0"}`;
}

export function getCachedQuizDetail(key: string): StudentGradeRow[] | null {
	const e = quizDetailCache.get(key);
	if (!e || !isFresh(e.at, DETAIL_TTL_MS)) {
		if (e) quizDetailCache.delete(key);
		return null;
	}
	return e.value;
}

export function setCachedQuizDetail(
	key: string,
	value: StudentGradeRow[],
): void {
	quizDetailCache.set(key, { at: Date.now(), value });
}

/** 성적/배점 변경 후 해당 분반 캐시 전부 무효화 */
export function buildGradeInputsFromRows(
	rows: StudentGradeRow[],
): Record<string, number | ""> {
	const initialInputs: Record<string, number | ""> = {};
	for (const student of rows) {
		for (const problem of student.problemGrades ?? []) {
			const key = `${student.userId}-${problem.problemId}`;
			if (problem.score !== null && problem.score !== undefined) {
				initialInputs[key] = problem.score;
			}
		}
	}
	return initialInputs;
}

export function invalidateSectionGradeCaches(sectionId: string): void {
	const p = `${sectionId}|`;
	for (const k of courseAggregateCache.keys()) {
		if (k.startsWith(p)) courseAggregateCache.delete(k);
	}
	for (const k of assignmentDetailCache.keys()) {
		if (k.startsWith(p)) assignmentDetailCache.delete(k);
	}
	for (const k of quizDetailCache.keys()) {
		if (k.startsWith(p)) quizDetailCache.delete(k);
	}
}
