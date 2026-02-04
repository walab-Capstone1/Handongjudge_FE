import type React from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import "../AssignmentModals/AssignmentModals.css";
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
		<div
			className="tutor-modal-overlay tutor-modal-overlay-detail"
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="button"
			tabIndex={0}
			aria-label="닫기"
		>
			<div
				className="tutor-modal-content tutor-large-modal"
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				<div className="tutor-modal-header">
					<h2>문제 상세 - {problemDetail.title}</h2>
					<button type="button" className="tutor-modal-close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="tutor-modal-body">
					<div className="tutor-problem-detail-content">
						<div className="tutor-detail-meta">
							{problemDetail.timeLimit != null && (
								<span>시간 제한: {problemDetail.timeLimit}초</span>
							)}
							{problemDetail.memoryLimit != null && (
								<span>메모리 제한: {problemDetail.memoryLimit}MB</span>
							)}
						</div>
						<div className="tutor-detail-body tutor-problem-description">
							{description ? (
								isMarkdown ? (
									<ReactMarkdown>{description}</ReactMarkdown>
								) : (
									<div dangerouslySetInnerHTML={{ __html: description }} />
								)
							) : (
								<p>문제 설명이 없습니다.</p>
							)}
						</div>
					</div>

					<div className="tutor-modal-actions">
						<button
							type="button"
							className="tutor-btn-secondary"
							onClick={onClose}
						>
							닫기
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default ProblemDetailModal;
