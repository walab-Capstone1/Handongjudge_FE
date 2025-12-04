/**
 * 문제 제목에서 "(복사본)" 텍스트를 제거합니다.
 * 문제 목록에서는 복사본 표시를 하지 않기 위해 사용됩니다.
 * 
 * @param {string} title - 원본 문제 제목
 * @returns {string} "(복사본)"이 제거된 제목
 */
export const removeCopyLabel = (title) => {
  if (!title) return title;
  // "(복사본)" 또는 " (복사본)" 패턴 제거
  return title.replace(/\s*\(복사본\)/g, '').trim();
};

