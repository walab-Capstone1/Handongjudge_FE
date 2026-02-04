import React from "react";
import * as S from "./styles";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = "데이터가 없습니다",
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <S.Container>
      {icon && <S.Icon>{icon}</S.Icon>}
      <S.Title>{title}</S.Title>
      {message && <S.Message>{message}</S.Message>}
      {actionLabel && onAction && (
        <S.Action>
          <S.Button onClick={onAction}>{actionLabel}</S.Button>
        </S.Action>
      )}
    </S.Container>
  );
};

export default EmptyState;
