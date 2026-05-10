import React from "react";
import * as S from "./styles";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  /** 인라인·패널 헤더 등: min-height 제거로 불필요한 세로 여백 방지 */
  compact?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "로딩 중...",
  size = "md",
  compact = false,
}) => {
  return (
    <S.Container $compact={compact}>
      <S.Spinner $size={size} />
      {message ? <S.Message>{message}</S.Message> : null}
    </S.Container>
  );
};

export default LoadingSpinner;
