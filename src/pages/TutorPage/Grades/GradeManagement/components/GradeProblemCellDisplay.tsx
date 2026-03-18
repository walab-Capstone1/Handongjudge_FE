import { FaCode } from "react-icons/fa";
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
	onViewCode?: () => void;
};

const LEGEND: { kind: GradeProblemCellKind; caption: string }[] = [
	{ kind: "ontime_full", caption: "제시간 제출, 만점" },
	{ kind: "ontime_wrong", caption: "제시간 제출, 오답" },
	{ kind: "late_full", caption: "지각 제출, 만점" },
	{ kind: "late_wrong", caption: "지각 제출, 오답" },
	{ kind: "not_submitted", caption: "미제출" },
];

export function GradeStatusLegendBar() {
	return (
		<S.GradeStatusLegendSticky>
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
		</S.GradeStatusLegendSticky>
	);
}

export function GradeProblemCellDisplay({
	problem,
	fallbackPoints,
	onViewCode,
}: Props) {
	const pts = problem?.points ?? fallbackPoints;
	const score = problem?.score ?? 0;
	const kind = getGradeProblemCellKind(problem, fallbackPoints);
	const submittedAt =
		problem?.submittedAt ??
		(problem as { submitted_at?: string })?.submitted_at;
	const title = [
		GRADE_CELL_HINT[kind],
		`획득 점수 ${score} / ${pts}`,
		submittedAt
			? `제출: ${new Date(submittedAt).toLocaleString("ko-KR")}`
			: null,
	]
		.filter(Boolean)
		.join("\n");

	return (
		<S.ScoreDisplay title={title}>
			<S.GradeCellStatusBadge $kind={kindToUi(kind)}>
				{GRADE_CELL_LABEL[kind]}
			</S.GradeCellStatusBadge>
			<S.GradeCellScoreMeta>
				{kind === "not_submitted" ? "—" : `${score} / ${pts}점`}
			</S.GradeCellScoreMeta>
			{problem?.submitted && onViewCode ? (
				<S.GradeCellCodeBtn
					type="button"
					onClick={onViewCode}
					title="제출 코드 조회"
					aria-label="코드 조회"
				>
					<FaCode />
				</S.GradeCellCodeBtn>
			) : null}
		</S.ScoreDisplay>
	);
}
