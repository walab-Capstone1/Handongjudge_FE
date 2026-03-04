/**
 * 문제 제목을 그대로 반환합니다.
 * DB에 저장된 "(복사본)" 등 복사 표시를 프론트에서도 그대로 노출합니다.
 */
export const removeCopyLabel = (title: string | null | undefined): string => {
	if (!title) return title ?? "";
	return title.trim();
};
