import type React from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import * as S from "../styles";

export interface GradeProblemDetailModalProps {
	isOpen: boolean;
	problemDetail: {
		title?: string;
		description?: string;
		timeLimit?: number;
		memoryLimit?: number;
	} | null;
	onClose: () => void;
}

export default function GradeProblemDetailModal({
	isOpen,
	problemDetail,
	onClose,
}: GradeProblemDetailModalProps) {
	if (!isOpen || !problemDetail) return null;

	const description = problemDetail.description ?? "";
	const isMarkdown =
		description.includes("# ") ||
		description.includes("## ") ||
		description.includes("```") ||
		description.includes("**") ||
		!description.includes("<");

	return createPortal(
		<S.ModalOverlay
			onClick={onClose}
			onKeyDown={(e: React.KeyboardEvent) => e.key === "Escape" && onClose()}
			tabIndex={0}
			role="presentation"
		>
			<S.ModalContent
				$large
				as="dialog"
				open
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
				onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
				aria-modal="true"
			>
				<S.ModalHeader>
					<h2>문제 상세 - {problemDetail.title ?? "문제"}</h2>
					<S.ModalClose type="button" onClick={onClose}>
						✕
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					{(problemDetail.timeLimit != null ||
						problemDetail.memoryLimit != null) && (
						<S.ProblemDetailMeta>
							{problemDetail.timeLimit != null && (
								<span>시간 제한: {problemDetail.timeLimit}초</span>
							)}
							{problemDetail.memoryLimit != null && (
								<span>메모리 제한: {problemDetail.memoryLimit}MB</span>
							)}
						</S.ProblemDetailMeta>
					)}
					<S.ProblemDetailBody>
						{description ? (
							isMarkdown ? (
								<ReactMarkdown>{description}</ReactMarkdown>
							) : (
								<div
									// biome-ignore lint/security/noDangerouslySetInnerHtml: API 문제 설명 HTML
									dangerouslySetInnerHTML={{ __html: description }}
								/>
							)
						) : (
							<p>문제 설명이 없습니다.</p>
						)}
					</S.ProblemDetailBody>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>,
		document.body,
	);
}
