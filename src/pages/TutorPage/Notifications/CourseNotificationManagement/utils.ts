/** 알림 타입 → 한글 라벨 */
export function getNotificationTypeLabel(type: string): string {
	const typeMap: Record<string, string> = {
		ASSIGNMENT_CREATED: "과제 생성",
		ASSIGNMENT_DEADLINE: "과제 마감",
		STUDENT_ENROLLED: "학생 추가",
		NOTICE_CREATED: "공지사항",
		QUESTION_COMMENT: "질문 댓글",
		COMMENT_REPLY: "댓글 답글",
		QUESTION_PINNED: "질문 고정",
		QUESTION_RESOLVED: "질문 해결",
		COMMENT_ACCEPTED: "댓글 채택",
		QUESTION_LIKED: "질문 추천",
		COMMENT_LIKED: "댓글 추천",
	};
	return typeMap[type] ?? type;
}

/** 알림 타입 → 이모지 아이콘 */
export function getNotificationTypeIcon(type: string): string {
	if (type === "ASSIGNMENT_CREATED" || type === "ASSIGNMENT_DEADLINE") {
		return "📝";
	}
	if (type === "STUDENT_ENROLLED") {
		return "👤";
	}
	if (type === "NOTICE_CREATED") {
		return "📢";
	}
	return "🔔";
}

/** 알림 타입 → 색상 */
export function getNotificationTypeColor(type: string): string {
	if (type === "ASSIGNMENT_DEADLINE") return "#dc3545";
	if (type === "ASSIGNMENT_CREATED") return "#667eea";
	if (type === "STUDENT_ENROLLED") return "#28a745";
	if (type === "NOTICE_CREATED") return "#ffc107";
	return "#6c757d";
}

/** 날짜 포맷 */
export function formatNotificationDate(dateString: string): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	return date.toLocaleString("ko-KR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}
