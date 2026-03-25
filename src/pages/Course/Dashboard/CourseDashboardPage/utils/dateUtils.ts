/**
 * 날짜 포맷팅 유틸리티
 */

export const formatDate = (dateString: string | null | undefined): string => {
	if (!dateString) return "";
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}.${month}.${day}`;
};

export const formatDeadline = (
	dateString: string | null | undefined,
): string => {
	if (!dateString) return "";
	return `${formatDate(dateString)} 마감`;
};

/** "YYYY.MM.DD HH:mm 까지 제출" 형식 (과제 행 스타일) */
export const formatDeadlineUntil = (
	dateString: string | null | undefined,
): string => {
	if (!dateString) return "";
	const date = new Date(dateString);
	const y = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const h = String(date.getHours()).padStart(2, "0");
	const m = String(date.getMinutes()).padStart(2, "0");
	return `${y}.${month}.${day} ${h}:${m} 까지 제출`;
};

/** 다가오는 마감 등 한 줄 표시용: "3/25 23:59" */
export const formatDeadlineShort = (
	dateString: string | null | undefined,
): string => {
	if (!dateString) return "";
	const date = new Date(dateString);
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const h = date.getHours();
	const m = date.getMinutes();
	return `${month}/${day} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const calculateDDay = (
	endDate: string | null | undefined,
): number | null => {
	if (!endDate) return null;
	const now = new Date();
	const end = new Date(endDate);
	const diffTime = end.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
};
