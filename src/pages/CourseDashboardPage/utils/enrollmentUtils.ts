/**
 * 수업 참가 코드 관련 유틸리티
 */

export const extractEnrollmentCode = (input: string): string => {
	const trimmed = input.trim();

	// URL 패턴 체크: /enroll/코드 형식
	const urlPattern = /\/enroll\/([^\/\s?#]+)/;
	const urlMatch = trimmed.match(urlPattern);
	if (urlMatch) {
		return urlMatch[1];
	}

	// 전체 URL인 경우 (http://... 또는 https://...)
	try {
		const url = new URL(trimmed);
		const pathMatch = url.pathname.match(/\/enroll\/([^\/\s?#]+)/);
		if (pathMatch) {
			return pathMatch[1];
		}
	} catch (e) {
		// URL이 아닌 경우 그대로 사용
	}

	// 참가 코드만 입력한 경우 그대로 반환
	return trimmed;
};
