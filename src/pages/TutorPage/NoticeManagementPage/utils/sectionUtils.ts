/**
 * sectionName에서 "분반" 텍스트 및 sectionNumber 제거 헬퍼 함수
 */
export const getSectionNameWithoutSection = (sectionName?: string): string => {
	if (!sectionName) return "미지정";

	// "분반" 텍스트와 관련된 모든 패턴 제거
	// 예: " - 1분반", " (1분반)", " 1분반", "분반 1", "1분반", "null분반" 등
	const cleaned = sectionName
		.replace(/\s*[-–]\s*\d+분반/gi, "") // " - 1분반"
		.replace(/\s*\(\d+분반\)/gi, "") // " (1분반)"
		.replace(/\s+\d+분반/gi, "") // " 1분반"
		.replace(/\s*분반\s*\d+/gi, "") // "분반 1"
		.replace(/\d+분반/gi, "") // "1분반"
		.replace(/\s*[-–]\s*분반\s*\d+/gi, "") // " - 분반 1"
		.replace(/\s*\(\s*분반\s*\d+\s*\)/gi, "") // " ( 분반 1 )"
		.replace(/\s*[-–]\s*null\s*분반/gi, "") // " - null 분반"
		.replace(/\s*\(\s*null\s*분반\s*\)/gi, "") // " ( null 분반 )"
		.replace(/\s+null\s*분반/gi, "") // " null 분반"
		.replace(/null\s*분반/gi, "") // "null 분반"
		.replace(/\s*[-–]\s*null분반/gi, "") // " - null분반"
		.replace(/\s*\(\s*null분반\s*\)/gi, "") // " ( null분반 )"
		.replace(/\s+null분반/gi, "") // " null분반"
		.replace(/null분반/gi, "") // "null분반"
		.replace(/\s+/g, " ") // 연속된 공백을 하나로
		.trim();

	return cleaned || "미지정";
};

/**
 * 분반 목록에서 중복 제거
 */
export const getUniqueSections = (notices: any[]) => {
	return Array.from(
		new Map(
			notices.map((notice) => [
				notice.sectionId,
				{
					id: notice.sectionId,
					name: getSectionNameWithoutSection(notice.sectionName),
				},
			]),
		).values(),
	);
};
