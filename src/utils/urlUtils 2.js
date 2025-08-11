/**
 * URL 경로에서 sectionId를 추출합니다.
 * @param {string} pathname - 현재 경로
 * @returns {number|null} 추출된 sectionId 또는 null
 */
export const extractSectionIdFromUrl = (pathname) => {
  const urlParts = pathname.split('/');
  const sectionIndex = urlParts.indexOf('sections');
  
  if (sectionIndex !== -1 && urlParts[sectionIndex + 1]) {
    const sectionId = parseInt(urlParts[sectionIndex + 1]);
    return isNaN(sectionId) ? null : sectionId;
  }
  
  return null;
};

/**
 * 여러 소스에서 sectionId를 우선순위에 따라 추출합니다.
 * @param {string} pathname - 현재 경로
 * @param {Object} locationState - location.state 객체
 * @param {number} fallbackId - 기본값
 * @returns {number} 추출된 sectionId
 */
export const getSectionId = (pathname, locationState, fallbackId = 1) => {
  // 1. URL에서 추출
  const urlSectionId = extractSectionIdFromUrl(pathname);
  if (urlSectionId !== null) {
    return urlSectionId;
  }
  
  // 2. location state에서 추출
  if (locationState?.sectionId) {
    return locationState.sectionId;
  }
  
  // 3. 기본값 반환
  return fallbackId;
}; 