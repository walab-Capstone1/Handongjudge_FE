/** 튜터 화면 학생 목록(이름·학번) 정렬 공통 */

export type StudentSortKey = "studentName" | "studentId";
export type StudentSortDir = "asc" | "desc";

export function compareStudentsByField(
	aName: string | undefined,
	aId: string | undefined,
	bName: string | undefined,
	bId: string | undefined,
	key: StudentSortKey,
	dir: StudentSortDir,
): number {
	const mul = dir === "asc" ? 1 : -1;
	const na = (aName ?? "").trim();
	const nb = (bName ?? "").trim();
	const ida = String(aId ?? "");
	const idb = String(bId ?? "");
	if (key === "studentName") {
		const c = na.localeCompare(nb, "ko");
		if (c !== 0) return mul * c;
		return mul * ida.localeCompare(idb, "ko", { numeric: true });
	}
	const idCmp = ida.localeCompare(idb, "ko", { numeric: true });
	if (idCmp !== 0) return mul * idCmp;
	return mul * na.localeCompare(nb, "ko");
}
