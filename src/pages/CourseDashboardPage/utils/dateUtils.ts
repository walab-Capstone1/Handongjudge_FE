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
