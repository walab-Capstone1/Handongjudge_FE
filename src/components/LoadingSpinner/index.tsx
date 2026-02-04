import React from "react";
import * as S from "./styles";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "로딩 중...", size = "md" }) => {
  return (
    <S.Container>
      <S.Spinner $size={size} />
      {message && <S.Message>{message}</S.Message>}
    </S.Container>
  );
};

export default LoadingSpinner;
