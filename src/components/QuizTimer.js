import React, { useState, useEffect } from 'react';
import './QuizTimer.css';

const QuizTimer = ({ endTime, onTimeUp }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (onTimeUp) {
          onTimeUp();
        }
        return;
      }

      setTimeRemaining(diff);
      setIsExpired(false);
    };

    // 즉시 계산
    calculateTimeRemaining();

    // 1초마다 업데이트
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  if (isExpired) {
    return (
      <div className="quiz-timer expired">
        <span className="timer-label">시간 종료</span>
        <span className="timer-value">00:00</span>
      </div>
    );
  }

  const minutes = Math.floor(timeRemaining / 60000);
  const isWarning = minutes < 5; // 5분 미만이면 경고

  return (
    <div className={`quiz-timer ${isWarning ? 'warning' : ''}`}>
      <span className="timer-label">남은 시간</span>
      <span className="timer-value">{formatTime(timeRemaining)}</span>
    </div>
  );
};

export default QuizTimer;

