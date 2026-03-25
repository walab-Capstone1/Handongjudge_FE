import * as S from "./styles";

export type SortColumnKey = "studentName" | "studentId";

type Props = {
	label: string;
	sortKey: SortColumnKey;
	activeKey: SortColumnKey;
	dir: "asc" | "desc";
};

/** 학생/학번 열 공통: 라벨 왼쪽 · ▲▼ 오른쪽 고정, 비활성 ◇ */
export function SortableStudentColumnHeader({
	label,
	sortKey,
	activeKey,
	dir,
}: Props) {
	const active = activeKey === sortKey;
	return (
		<S.Row>
			<S.Label>{label}</S.Label>
			<S.ArrowSlot $dim={!active} aria-hidden>
				{active ? (dir === "asc" ? "▲" : "▼") : "◇"}
			</S.ArrowSlot>
		</S.Row>
	);
}
