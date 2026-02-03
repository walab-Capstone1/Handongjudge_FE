import React from 'react';
import {
  EmptyState as EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateMessage,
  EmptyStateAction
} from './styleddiv';

const EmptyState = ({ 
  icon, 
  title = "데이터가 없습니다", 
  message, 
  actionLabel, 
  onAction 
}) => {
  return (
    <EmptyStateContainer>
      {icon && <EmptyStateIcon>{icon}</EmptyStateIcon>}
      <EmptyStateTitle>{title}</EmptyStateTitle>
      {message && <EmptyStateMessage>{message}</EmptyStateMessage>}
      {actionLabel && onAction && (
        <EmptyStateAction>
          <button className="btn btn-primary" onClick={onAction}>
            {actionLabel}
          </button>
        </EmptyStateAction>
      )}
    </EmptyStateContainer>
  );
};

export default EmptyState;

