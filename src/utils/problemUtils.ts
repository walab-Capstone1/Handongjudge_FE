/**
 * 문제 제목에서 "(복사본)" 텍스트를 제거합니다.
 * 문제 목록에서는 복사본 표시를 하지 않기 위해 사용됩니다.
 */
export const removeCopyLabel = (title: string | null | undefined): string => {
	if (!title) return title ?? "";
	return title.replace(/\s*\(복사본\)/g, "").trim();
};
