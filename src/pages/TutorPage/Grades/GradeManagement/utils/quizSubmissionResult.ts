export function getQuizSubmissionResultLabel(result: string): string {
	const labels: Record<string, string> = {
		AC: "정답",
		WA: "오답",
		TLE: "시간초과",
		RE: "런타임에러",
		CE: "컴파일에러",
		MLE: "메모리초과",
		OLE: "출력초과",
	};
	return labels[result] ?? result ?? "-";
}

export function getQuizSubmissionResultColor(result: string): string {
	switch (result) {
		case "AC":
			return "#10b981";
		case "WA":
			return "#ef4444";
		case "TLE":
		case "MLE":
		case "OLE":
			return "#f59e0b";
		case "RE":
		case "CE":
			return "#8b5cf6";
		default:
			return "#64748b";
	}
}

export function formatQuizSubmissionDateTime(iso: string | undefined): string {
	if (!iso) return "-";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}
