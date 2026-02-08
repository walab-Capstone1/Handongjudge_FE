import type React from "react";
import * as S from "./styles";
import type { AlertProps } from "./types";

const Alert: React.FC<AlertProps> = ({
	type = "info",
	message,
	onClose,
	children,
}) => {
	return (
		<S.AlertContainer $type={type}>
			<S.AlertContent>{children || message}</S.AlertContent>
			{onClose && (
				<S.AlertClose onClick={onClose} aria-label="닫기">
					×
				</S.AlertClose>
			)}
		</S.AlertContainer>
	);
};

export default Alert;
