import React from 'react';

/**
 * 에러 메시지 컴포넌트
 * @param {string} error - 에러 메시지
 * @param {Function} onRetry - 재시도 함수
 * @returns {JSX.Element} 에러 메시지 JSX
 */
const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="error-message">
      <h3>오류가 발생했습니다</h3>
      <p>{error}</p>
      <button onClick={onRetry}>다시 시도</button>
    </div>
  );
};

export default ErrorMessage; 