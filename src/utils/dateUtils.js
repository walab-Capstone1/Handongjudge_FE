/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 * @param {string} dateString - ISO 날짜 문자열
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 마감일까지 남은 일수를 계산하고 상태를 반환합니다.
 * @param {string} endDate - 마감일 ISO 문자열
 * @returns {Object} 마감 상태 정보
 */
export const getDeadlineStatus = (endDate) => {
  const now = new Date();
  const deadline = new Date(endDate);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: "마감됨", status: "expired", color: "#6c757d" };
  } else if (diffDays <= 3) {
    return { text: `D-${diffDays}`, status: "urgent", color: "#dc3545" };
  } else if (diffDays <= 7) {
    return { text: `D-${diffDays}`, status: "warning", color: "#ffc107" };
  } else {
    return { text: `D-${diffDays}`, status: "normal", color: "#28a745" };
  }
}; 