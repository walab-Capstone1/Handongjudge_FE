import type { ProblemGrade } from "../types";

/**
 * 백엔드 {@code SubmissionDeadlineComparison}과 동일한 전제:
 * - 제출 시각 문자열: KST 벽시계(타임존 없는 ISO)
 * - 마감/종료 문자열: UTC 벽시계(과제 endDate·퀴즈 endTime 저장 방식과 동일)
 */
function instantMsFromKstWall(raw: string): number | null {
	const trimmed = raw.trim().replace(" ", "T");
	if (!trimmed) return null;
	if (/Z$/i.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
		const t = Date.parse(trimmed);
		return Number.isNaN(t) ? null : t;
	}
	const base = trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`;
	const t = Date.parse(`${base}+09:00`);
	return Number.isNaN(t) ? null : t;
}

function instantMsFromUtcWall(raw: string): number | null {
	const trimmed = raw.trim().replace(" ", "T");
	if (!trimmed) return null;
	if (/Z$/i.test(trimmed)) {
		const t = Date.parse(trimmed);
		return Number.isNaN(t) ? null : t;
	}
	if (/[+-]\d{2}:?\d{2}$/.test(trimmed)) {
		const t = Date.parse(trimmed);
		return Number.isNaN(t) ? null : t;
	}
	const base = trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`;
	const t = Date.parse(`${base}Z`);
	return Number.isNaN(t) ? null : t;
}

/** Java {@code SubmissionDeadlineComparison.lateDurationText} 와 동일한 분 단위·문구 */
function lateDurationTextKo(submittedMs: number, dueMs: number): string {
	if (submittedMs <= dueMs) return "";
	const minutes = Math.floor((submittedMs - dueMs) / 60000);
	const days = Math.floor(minutes / (24 * 60));
	const hours = Math.floor((minutes % (24 * 60)) / 60);
	const mins = minutes % 60;
	const parts: string[] = [];
	if (days > 0) parts.push(`${days}일`);
	if (hours > 0) parts.push(`${hours}시간`);
	if (mins > 0 || parts.length === 0) parts.push(`${mins}분`);
	return parts.join(" ");
}

function csvQuote(text: string): string {
	return `"${text.replace(/"/g, '""')}"`;
}

/**
 * 성적보내기 CSV의 지각시간 열 (ZIP submissions.csv lateDuration 과 동일 규칙).
 * 제출·마감 시각이 있으면 항상 위 규칙으로 계산하고, 파싱 실패 시에만 API lateDuration 사용.
 */
export function formatLateDurationForGradeCsv(
	pg: ProblemGrade | null | undefined,
	dueAt: string | undefined,
): string {
	if (!pg?.submitted) return '""';
	const subMs = pg.submittedAt
		? instantMsFromKstWall(pg.submittedAt)
		: null;
	const dueMs = dueAt ? instantMsFromUtcWall(dueAt) : null;
	if (subMs != null && dueMs != null) {
		const text = lateDurationTextKo(subMs, dueMs);
		return text ? csvQuote(text) : '""';
	}
	const fallback = pg.lateDuration?.trim();
	return fallback ? csvQuote(fallback) : '""';
}
