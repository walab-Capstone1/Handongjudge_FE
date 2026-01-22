import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon, 
  title = "데이터가 없습니다", 
  message, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {message && <p className="empty-state__message">{message}</p>}
      {actionLabel && onAction && (
        <button className="empty-state__action btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

