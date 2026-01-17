/**
 * 과제 관리 관련 유틸리티 함수들
 */

/**
 * 난이도에 따른 색상 반환
 * @param {string} difficulty - 난이도 (EASY, MEDIUM, HARD)
 * @returns {string} 색상 코드
 */
export const getDifficultyColor = (difficulty) => {
  const colors = {
    EASY: '#28a745',
    MEDIUM: '#ffc107',
    HARD: '#dc3545'
  };
  return colors[difficulty] || '#6c757d';
};

/**
 * 학기 레이블 반환
 * @param {string} semester - 학기 코드
 * @returns {string} 학기 레이블
 */
export const getSemesterLabel = (semester) => {
  const labels = {
    SPRING: '봄',
    SUMMER: '여름',
    FALL: '가을',
    WINTER: '겨울'
  };
  return labels[semester] || semester;
};

/**
 * 제출률 계산
 * @param {number} submitted - 제출한 학생 수
 * @param {number} total - 전체 학생 수
 * @returns {string} 제출률 문자열
 */
export const getSubmissionRate = (submitted, total) => {
  if (total === 0) return '0%';
  return `${Math.round((submitted / total) * 100)}%`;
};

