import React from 'react';
import './Alert.css';

const Alert = ({ 
  type = 'info', 
  message, 
  onClose,
  children 
}) => {
  const alertClass = `alert alert--${type}`;
  
  return (
    <div className={alertClass}>
      <div className="alert__content">
        {children || message}
      </div>
      {onClose && (
        <button 
          className="alert__close"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;

