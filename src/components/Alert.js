import React from 'react';
import {
  AlertSuccess,
  AlertError,
  AlertWarning,
  AlertInfo,
  AlertContent,
  AlertClose
} from './styleddiv';

const Alert = ({ 
  type = 'info', 
  message, 
  onClose,
  children 
}) => {
  const AlertComponent = {
    success: AlertSuccess,
    error: AlertError,
    warning: AlertWarning,
    info: AlertInfo
  }[type] || AlertInfo;
  
  return (
    <AlertComponent>
      <AlertContent>
        {children || message}
      </AlertContent>
      {onClose && (
        <AlertClose
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </AlertClose>
      )}
    </AlertComponent>
  );
};

export default Alert;

