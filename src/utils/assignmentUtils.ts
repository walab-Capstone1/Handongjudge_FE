/**
 * 과제 관리 관련 유틸리티 함수들
 */

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Semester = "SPRING" | "SUMMER" | "FALL" | "WINTER";

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
	EASY: "#28a745",
	MEDIUM: "#ffc107",
	HARD: "#dc3545",
};

const SEMESTER_LABELS: Record<Semester, string> = {
	SPRING: "봄",
	SUMMER: "여름",
	FALL: "가을",
	WINTER: "겨울",
};

/**
 * 난이도에 따른 색상 반환
 */
export const getDifficultyColor = (difficulty: string | undefined): string => {
	return (
		(difficulty && DIFFICULTY_COLORS[difficulty as Difficulty]) ?? "#6c757d"
	);
};

/**
 * 학기 레이블 반환
 */
export const getSemesterLabel = (semester: string | undefined): string => {
	return (semester && SEMESTER_LABELS[semester as Semester]) ?? semester ?? "";
};

/**
 * 제출률 계산
 */
export const getSubmissionRate = (submitted: number, total: number): string => {
	if (total === 0) return "0%";
	return `${Math.round((submitted / total) * 100)}%`;
};
