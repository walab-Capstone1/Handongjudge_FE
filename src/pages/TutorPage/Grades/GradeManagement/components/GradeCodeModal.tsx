import * as S from "../styles";
import type { CodeResponse } from "../types";

export interface GradeCodeModalProps {
	show: boolean;
	selectedCode: CodeResponse | null;
	onClose: () => void;
}

export default function GradeCodeModal({
	show,
	selectedCode,
	onClose,
}: GradeCodeModalProps) {
	if (!show || !selectedCode) return null;

	return (
		<S.ModalOverlay
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="button"
			tabIndex={0}
		>
			<S.ModalContent
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<S.ModalHeader>
					<h2 id="code-modal-title">제출 코드</h2>
					<S.ModalClose type="button" onClick={onClose} aria-label="닫기">
						×
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					<S.CodeDisplay>
						<code>
							{selectedCode.code ??
								selectedCode.codeString ??
								"코드를 불러올 수 없습니다."}
						</code>
					</S.CodeDisplay>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
}
