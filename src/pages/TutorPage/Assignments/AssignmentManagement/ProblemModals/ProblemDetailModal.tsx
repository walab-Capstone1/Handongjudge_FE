import type React from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import * as S from "../AssignmentModals/styles";
import type { ProblemDetailModalProps } from "./types";

const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
	isOpen,
	problemDetail,
	onClose,
}) => {
	if (!isOpen || !problemDetail) return null;

	const description = problemDetail.description ?? "";
	const isMarkdown =
		description.includes("# ") ||
		description.includes("## ") ||
		description.includes("```") ||
		description.includes("**") ||
		!description.includes("<");

	return createPortal(
		<S.Overlay
			$zIndex={50000}
			$alignCenter
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="button"
			tabIndex={0}
			aria-label="닫기"
		>
			<S.Content
				$large
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<S.Header>
					<h2>문제 상세 - {problemDetail.title}</h2>
					<S.CloseButton type="button" onClick={onClose}>
						✕
					</S.CloseButton>
				</S.Header>

				<S.Body>
					<S.DetailContent>
						<S.DetailMeta>
							{problemDetail.timeLimit != null && (
								<span>시간 제한: {problemDetail.timeLimit}초</span>
							)}
							{problemDetail.memoryLimit != null && (
								<span>메모리 제한: {problemDetail.memoryLimit}MB</span>
							)}
						</S.DetailMeta>
						<S.DetailBody>
							{description ? (
								isMarkdown ? (
									<ReactMarkdown>{description}</ReactMarkdown>
								) : (
									<div dangerouslySetInnerHTML={{ __html: description }} />
								)
							) : (
								<p>문제 설명이 없습니다.</p>
							)}
						</S.DetailBody>
					</S.DetailContent>

					<S.Actions>
						<S.BtnSecondary type="button" onClick={onClose}>
							닫기
						</S.BtnSecondary>
					</S.Actions>
				</S.Body>
			</S.Content>
		</S.Overlay>,
		document.body,
	);
};

export default ProblemDetailModal;
