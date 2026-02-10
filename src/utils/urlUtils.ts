/**
 * URL 경로에서 sectionId를 추출합니다.
 */
export const extractSectionIdFromUrl = (pathname: string): number | null => {
	const urlParts = pathname.split("/");
	const sectionIndex = urlParts.indexOf("sections");

	if (sectionIndex !== -1 && urlParts[sectionIndex + 1]) {
		const sectionId = Number.parseInt(urlParts[sectionIndex + 1], 10);
		return Number.isNaN(sectionId) ? null : sectionId;
	}

	return null;
};

export interface LocationStateWithSectionId {
	sectionId?: number;
}

/**
 * 여러 소스에서 sectionId를 우선순위에 따라 추출합니다.
 */
export const getSectionId = (
	pathname: string,
	locationState?: LocationStateWithSectionId | null,
	fallbackId = 1,
): number => {
	const urlSectionId = extractSectionIdFromUrl(pathname);
	if (urlSectionId !== null) return urlSectionId;
	if (locationState?.sectionId != null) return locationState.sectionId;
	return fallbackId;
};
