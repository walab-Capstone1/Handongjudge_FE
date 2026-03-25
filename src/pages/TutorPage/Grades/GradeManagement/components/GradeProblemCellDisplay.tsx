import * as S from "../styles";
import type { ProblemGrade } from "../types";
import {
	getGradeProblemCellKind,
	GRADE_CELL_HINT,
	GRADE_CELL_LABEL,
	type GradeProblemCellKind,
} from "../utils/gradeProblemCellKind";

function kindToUi(k: GradeProblemCellKind): S.GradeCellKindUi {
	return k;
}

type Props = {
	problem: ProblemGrade | null | undefined;
	fallbackPoints: number;
	dueAt?: string;
	showLateOnly?: boolean;
};

const LEGEND: { kind: GradeProblemCellKind; caption: string }[] = [
	{ kind: "ontime_full", caption: "제시간 제출, 정답" },
	{ kind: "ontime_wrong", caption: "제시간 제출, 오답" },
	{ kind: "late_full", caption: "지각 제출, 정답" },
	{ kind: "late_wrong", caption: "지각 제출, 오답" },
	{ kind: "not_submitted", caption: "미제출" },
];

type LegendBarProps = {
	totalOnly?: boolean;
	onToggleTotalOnly?: (v: boolean) => void;
	showLateOnly?: boolean;
	onToggleShowLateOnly?: (v: boolean) => void;
};

export function GradeStatusLegendBar({
	totalOnly = false,
	onToggleTotalOnly,
	showLateOnly = false,
	onToggleShowLateOnly,
}: LegendBarProps) {
	return (
		<S.GradeStatusLegendSticky>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "0.75rem",
					flexWrap: "wrap",
				}}
			>
				<S.GradeLegend>
					<span style={{ fontWeight: 600, color: "#475569" }}>표시 기준</span>
					{LEGEND.map(({ kind, caption }) => (
						<span key={kind}>
							<S.GradeCellStatusBadge $kind={kindToUi(kind)}>
								{GRADE_CELL_LABEL[kind]}
							</S.GradeCellStatusBadge>
							{caption}
						</span>
					))}
				</S.GradeLegend>
				<div
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "0.8rem",
						flexWrap: "wrap",
						justifyContent: "flex-end",
					}}
				>
					<label
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "0.35rem",
							color: "#334155",
							fontWeight: 600,
							cursor: "pointer",
							whiteSpace: "nowrap",
						}}
					>
						<input
							type="checkbox"
							checked={totalOnly}
							onChange={(e) => onToggleTotalOnly?.(e.target.checked)}
						/>
						총점 모아보기
					</label>
					<label
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "0.35rem",
							color: "#334155",
							fontWeight: 600,
							cursor: "pointer",
							whiteSpace: "nowrap",
						}}
					>
						<input
							type="checkbox"
							checked={showLateOnly}
							onChange={(e) => onToggleShowLateOnly?.(e.target.checked)}
						/>
						지각 시간 보여주기
					</label>
				</div>
			</div>
		</S.GradeStatusLegendSticky>
	);
}

export function GradeProblemCellDisplay({
	problem,
	fallbackPoints,
	dueAt,
	showLateOnly = false,
}: Props) {
	const toLocalDate = (raw?: string): Date | null => {
		if (!raw) return null;
		const normalized = raw.trim().replace(" ", "T");
		const m = normalized
			.trim()
			.match(
				/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/,
			);
		if (!m) {
			const d = new Date(normalized);
			return Number.isNaN(d.getTime()) ? null : d;
		}
		const year = Number(m[1]);
		const month = Number(m[2]) - 1;
		const day = Number(m[3]);
		const hour = Number(m[4]);
		const minute = Number(m[5]);
		const second = Number(m[6] ?? "0");
		const frac = (m[7] ?? "0").slice(0, 3).padEnd(3, "0");
		const ms = Number(frac);
		return new Date(year, month, day, hour, minute, second, ms);
	};
	const pts = Number(problem?.points ?? fallbackPoints ?? 0);
	const score = Number(problem?.score ?? 0);
	const kind = getGradeProblemCellKind(problem, fallbackPoints);
	const tcTotal = problem?.totalTestCaseCount;
	const tcPassed = problem?.passedTestCaseCount;
	const hasTcDetail =
		typeof tcTotal === "number" && tcTotal > 0 && typeof tcPassed === "number";
	const submittedAt =
		problem?.submittedAt ??
		(problem as { submitted_at?: string })?.submitted_at;
	const title = [
		GRADE_CELL_HINT[kind],
		problem?.submitted
			? hasTcDetail
				? `테스트케이스 통과 ${tcPassed}/${tcTotal}`
				: `배점 ${score}/${pts}`
			: null,
		problem?.submitted && hasTcDetail
			? `과제 배점(문항): ${score}/${pts}`
			: null,
		problem?.result ? `채점 결과: ${problem.result}` : null,
		submittedAt
			? `제출: ${(toLocalDate(submittedAt) ?? new Date(submittedAt)).toLocaleString("ko-KR")}`
			: null,
	]
		.filter(Boolean)
		.join("\n");
	const isLateFull =
		Boolean(problem?.submitted) &&
		problem?.isOnTime === false &&
		pts > 0 &&
		score >= pts;
	const lateMinutes =
		submittedAt && dueAt
			? (() => {
					const s = toLocalDate(submittedAt);
					const d = toLocalDate(dueAt);
					if (!s || !d) return 0;
					return Math.floor(Math.max(0, (s.getTime() - d.getTime()) / 60000));
				})()
			: 0;
	const formatLateDuration = (minutes: number): string => {
		if (minutes <= 0) return "0분";
		const days = Math.floor(minutes / (24 * 60));
		const hours = Math.floor((minutes % (24 * 60)) / 60);
		const mins = minutes % 60;
		const parts: string[] = [];
		if (days > 0) parts.push(`${days}일`);
		if (hours > 0) parts.push(`${hours}시간`);
		if (mins > 0 || parts.length === 0) parts.push(`${mins}분`);
		return parts.join(" ");
	};

	return (
		<S.ScoreDisplay title={title}>
			<S.GradeCellStatusBadge $kind={kindToUi(kind)}>
				{GRADE_CELL_LABEL[kind]}
			</S.GradeCellStatusBadge>
			{problem?.submitted ? (
				<>
					<S.GradeCellScoreMeta>
						{hasTcDetail
							? `${tcPassed}/${tcTotal}`
							: `${score}/${pts}`}
					</S.GradeCellScoreMeta>
					{showLateOnly && isLateFull && lateMinutes > 0 ? (
						<S.GradeCellScoreMeta>{`지각 ${formatLateDuration(lateMinutes)}`}</S.GradeCellScoreMeta>
					) : null}
				</>
			) : null}
		</S.ScoreDisplay>
	);
}
