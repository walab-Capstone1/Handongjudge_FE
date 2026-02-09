import type React from "react";
import * as S from "../styles";

interface ViewNoticeModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	content: string;
	createdAt: string;
	onEdit: () => void;
}

const ViewNoticeModal: React.FC<ViewNoticeModalProps> = ({
	isOpen,
	onClose,
	title,
	content,
	createdAt,
	onEdit,
}) => {
	if (!isOpen) return null;

	return (
		<S.ModalOverlay onClick={onClose}>
			<S.ModalContent $view onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2>공지사항 내용</h2>
					<S.ModalClose onClick={onClose}>×</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					<S.NoticeView>
						<S.NoticeViewTitle>{title}</S.NoticeViewTitle>
						<S.NoticeViewMeta>작성일: {createdAt}</S.NoticeViewMeta>
						<S.NoticeViewContent>{content}</S.NoticeViewContent>
						<S.NoticeViewActions>
							<S.BtnEdit onClick={onEdit}>수정하기</S.BtnEdit>
							<S.BtnCancel onClick={onClose}>닫기</S.BtnCancel>
						</S.NoticeViewActions>
					</S.NoticeView>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default ViewNoticeModal;
