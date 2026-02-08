import type React from "react";

export interface ErrorMessageProps {
	/** 에러 메시지 (원본: error) */
	error?: string;
	/** 동일 의미 별칭 */
	message?: string;
	/** 재시도 버튼 클릭 시 호출 */
	onRetry?: () => void;
	children?: React.ReactNode;
}
