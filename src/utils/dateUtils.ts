/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 */
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export type DeadlineStatusType = "expired" | "urgent" | "warning" | "normal";

export interface DeadlineStatus {
	text: string;
	status: DeadlineStatusType;
	color: string;
}

/**
 * 마감일까지 남은 일수를 계산하고 상태를 반환합니다.
 */
export const getDeadlineStatus = (endDate: string): DeadlineStatus => {
	const now = new Date();
	const deadline = new Date(endDate);
	const diffTime = deadline.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return { text: "마감됨", status: "expired", color: "#6c757d" };
	}
	if (diffDays <= 3) {
		return { text: `D-${diffDays}`, status: "urgent", color: "#dc3545" };
	}
	if (diffDays <= 7) {
		return { text: `D-${diffDays}`, status: "warning", color: "#ffc107" };
	}
	return { text: `D-${diffDays}`, status: "normal", color: "#28a745" };
};
