import type { ProblemGrade } from "../types";

export type GradeProblemCellKind =
	| "ontime_full"
	| "ontime_wrong"
	| "late_full"
	| "late_wrong"
	| "not_submitted";

/** 해당 문제 정답 여부 (배점이 0이면 제출만 했으면 정답으로 간주) */
function isFullScore(
	score: number | null | undefined,
	points: number,
): boolean {
	if (points <= 0) return true;
	const s = Number(score ?? 0);
	return s >= points - 1e-9;
}

export function getGradeProblemCellKind(
	problem:
		| Pick<ProblemGrade, "submitted" | "score" | "points" | "isOnTime">
		| null
		| undefined,
	fallbackPoints = 1,
): GradeProblemCellKind {
	if (!problem?.submitted) return "not_submitted";
	const pts = problem.points ?? fallbackPoints;
	const full = isFullScore(problem.score, pts);
	const late = problem.isOnTime === false;
	if (late) return full ? "late_full" : "late_wrong";
	return full ? "ontime_full" : "ontime_wrong";
}

export const GRADE_CELL_LABEL: Record<GradeProblemCellKind, string> = {
	ontime_full: "정답",
	ontime_wrong: "오답",
	late_full: "정답·지각",
	late_wrong: "오답·지각",
	not_submitted: "미제출",
};

export const GRADE_CELL_HINT: Record<GradeProblemCellKind, string> = {
	ontime_full: "제시간 제출 · 배점 획득",
	ontime_wrong: "제시간 제출 · 정답 아님",
	late_full: "지각 제출 · 배점 획득",
	late_wrong: "지각 제출 · 정답 아님",
	not_submitted: "제출 없음",
};
