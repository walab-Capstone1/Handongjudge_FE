import type React from "react";
import * as S from "./styles";
import type { ErrorMessageProps } from "./types";

const ErrorMessage: React.FC<ErrorMessageProps> = ({
	error,
	message,
	onRetry,
	children,
}) => {
	const text = children ?? error ?? message;
	return (
		<S.Container>
			<S.Title>오류가 발생했습니다</S.Title>
			{text && <S.Text>{text}</S.Text>}
			{onRetry && (
				<S.RetryButton type="button" onClick={onRetry}>
					다시 시도
				</S.RetryButton>
			)}
		</S.Container>
	);
};

export default ErrorMessage;
