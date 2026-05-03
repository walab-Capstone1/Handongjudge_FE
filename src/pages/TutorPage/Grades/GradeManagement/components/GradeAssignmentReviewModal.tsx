import { useCallback, useEffect, useState, type CSSProperties } from "react";
import APIService from "../../../../../services/APIService";
import * as S from "../styles";

export type GradeAssignmentReviewModalProps = {
	show: boolean;
	sectionId: number;
	assignmentId: number;
	userId: number;
	problemId: number;
	studentName: string;
	problemTitle: string;
	initialComment: string;
	initialRejected: boolean;
	submitted: boolean;
	/** 성적에 반영된 점수(있으면 코드 화면에 표시) */
	displayScore?: number | null;
	onClose: () => void;
	onSaved: () => void;
};

type Step = "code" | "feedback";

const codeBlockStyle: CSSProperties = {
	maxHeight: "min(70vh, 720px)",
	minHeight: "120px",
	overflow: "auto",
	background: "#0f172a",
	color: "#e2e8f0",
	borderRadius: "8px",
	padding: "12px",
	fontSize: "13px",
	lineHeight: 1.45,
	whiteSpace: "pre-wrap",
	wordBreak: "break-word",
	margin: "0.5rem 0 0",
};

export default function GradeAssignmentReviewModal({
	show,
	sectionId,
	assignmentId,
	userId,
	problemId,
	studentName,
	problemTitle,
	initialComment,
	initialRejected,
	submitted,
	displayScore,
	onClose,
	onSaved,
}: GradeAssignmentReviewModalProps) {
	const [step, setStep] = useState<Step>("code");
	const [comment, setComment] = useState(initialComment);
	const [code, setCode] = useState<string | null>(null);
	const [codeLoading, setCodeLoading] = useState(false);
	const [codeError, setCodeError] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (show) {
			setComment(initialComment);
			setStep("code");
			setCode(null);
			setCodeError(null);
		}
	}, [show, initialComment, userId, problemId, assignmentId]);

	useEffect(() => {
		if (!show || !submitted) return;
		let cancelled = false;
		(async () => {
			setCodeLoading(true);
			setCodeError(null);
			try {
				const res = await APIService.getStudentAcceptedCode(
					sectionId,
					assignmentId,
					userId,
					problemId,
				);
				const raw = res?.data ?? res;
				const text = raw?.code ?? raw?.codeString ?? "";
				if (!cancelled) setCode(typeof text === "string" ? text : "");
			} catch (e) {
				if (!cancelled) {
					setCodeError(
						e instanceof Error ? e.message : "코드를 불러올 수 없습니다.",
					);
				}
			} finally {
				if (!cancelled) setCodeLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [show, submitted, sectionId, assignmentId, userId, problemId]);

	const handleSaveCommentOnly = useCallback(async () => {
		setSaving(true);
		try {
			await APIService.saveGrade(sectionId, assignmentId, {
				userId,
				problemId,
				comment: comment.trim() || null,
			});
			onSaved();
			onClose();
		} catch (e) {
			alert(e instanceof Error ? e.message : "저장에 실패했습니다.");
		} finally {
			setSaving(false);
		}
	}, [sectionId, assignmentId, userId, problemId, comment, onSaved, onClose]);

	const handleSaveReject = useCallback(async () => {
		if (!comment.trim()) {
			alert("반려 시 학생에게 전달할 코멘트를 입력해 주세요.");
			return;
		}
		if (
			!window.confirm(
				`${studentName} 학생에게 반려 알림을 보내시겠습니까?\n\n코멘트가 학생에게 전달되며, 학생이 수정 후 재제출하면 자동 채점 결과에 따라 점수가 반영됩니다.`,
			)
		) {
			return;
		}
		setSaving(true);
		try {
			await APIService.saveGrade(sectionId, assignmentId, {
				userId,
				problemId,
				comment: comment.trim(),
				rejected: true,
				score: 0,
			});
			onSaved();
			alert(
				"저장되었습니다.\n\n학생에게 반려 알림이 전달되었습니다.\n재제출 후 자동 채점에서 맞으면(Mark Correct) 배점이 반영되고, 반려 상태는 자동으로 해제됩니다.",
			);
			onClose();
		} catch (e) {
			alert(e instanceof Error ? e.message : "저장에 실패했습니다.");
		} finally {
			setSaving(false);
		}
	}, [
		sectionId,
		assignmentId,
		userId,
		problemId,
		comment,
		studentName,
		onSaved,
		onClose,
	]);

	if (!show) return null;

	return (
		<S.ModalOverlay
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="presentation"
		>
			{step === "code" ? (
				<S.ModalContent
					$large
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<S.ModalHeader>
						<div>
							<h2 id="assignment-review-code-title">제출 코드</h2>
							<p
								style={{
									margin: "0.35rem 0 0",
									fontSize: "0.9rem",
									fontWeight: 500,
									opacity: 0.95,
								}}
							>
								<strong>{studentName}</strong>
								{` · ${problemTitle}`}
								{displayScore != null && !Number.isNaN(Number(displayScore))
									? ` · 반영 점수: ${displayScore}`
									: ""}
							</p>
						</div>
						<S.ModalClose type="button" onClick={onClose} aria-label="닫기">
							×
						</S.ModalClose>
					</S.ModalHeader>
					<S.ModalBody>
						{submitted ? (
							<div>
								{codeLoading ? (
									<p style={{ fontSize: "0.85rem", color: "#64748b" }}>불러오는 중…</p>
								) : codeError ? (
									<p style={{ fontSize: "0.85rem", color: "#dc2626" }}>{codeError}</p>
								) : (
									<pre style={codeBlockStyle}>{code ?? "(비어 있음)"}</pre>
								)}
							</div>
						) : (
							<p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: 0 }}>
								이 문제는 아직 제출이 없습니다. 아래에서 코멘트만 저장하거나, 반려 알림을 보낼 수
								있습니다.
							</p>
						)}

						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								flexWrap: "wrap",
								gap: "0.5rem",
								marginTop: "1.25rem",
							}}
						>
							<S.SecondaryButton type="button" onClick={onClose}>
								닫기
							</S.SecondaryButton>
							<S.PrimaryButton type="button" onClick={() => setStep("feedback")}>
								반려·코멘트 보내기
							</S.PrimaryButton>
						</div>
					</S.ModalBody>
				</S.ModalContent>
			) : (
				<S.ModalContent
					$large={false}
					style={{ maxWidth: "480px", width: "92vw" }}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<S.ModalHeader>
						<div>
							<h2 id="assignment-review-feedback-title">반려·코멘트</h2>
							<p
								style={{
									margin: "0.35rem 0 0",
									fontSize: "0.9rem",
									fontWeight: 500,
									opacity: 0.95,
								}}
							>
								{studentName} · {problemTitle}
							</p>
						</div>
						<S.ModalClose type="button" onClick={onClose} aria-label="닫기">
							×
						</S.ModalClose>
					</S.ModalHeader>
					<S.ModalBody>
						<p style={{ marginTop: 0, fontSize: "0.85rem", color: "#64748b" }}>
							코멘트만 저장하면 학생 화면에 반영됩니다. 반려 시 학생에게 알림이 가며, 재제출 후 자동
							채점에서 맞으면 배점이 반영되고 반려는 자동 해제됩니다.
						</p>
						{initialRejected && (
							<p
								style={{
									margin: "0 0 0.75rem",
									fontSize: "0.8rem",
									color: "#b45309",
									background: "#fffbeb",
									padding: "0.5rem 0.65rem",
									borderRadius: "6px",
								}}
							>
								이미 반려된 제출입니다. 코멘트를 수정할 수 있으며, 학생이 재제출·통과 시 반려가
								해제됩니다.
							</p>
						)}
						<label
							style={{
								display: "block",
								fontWeight: 600,
								marginBottom: "0.35rem",
								fontSize: "0.85rem",
							}}
						>
							학생에게 보이는 코멘트
						</label>
						<textarea
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							rows={5}
							placeholder="피드백·재제출 요청 사유 등"
							style={{
								width: "100%",
								padding: "0.65rem",
								borderRadius: "8px",
								border: "1px solid #cbd5e1",
								fontSize: "0.9rem",
								boxSizing: "border-box",
								resize: "vertical",
								fontFamily: "inherit",
							}}
						/>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "0.5rem",
								marginTop: "1rem",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<S.SecondaryButton type="button" onClick={() => setStep("code")} disabled={saving}>
								← 코드로
							</S.SecondaryButton>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
								<S.SecondaryButton
									type="button"
									onClick={handleSaveCommentOnly}
									disabled={saving}
								>
									{saving ? "저장 중…" : "코멘트만 저장"}
								</S.SecondaryButton>
								{!initialRejected && (
									<S.DangerButton type="button" onClick={handleSaveReject} disabled={saving}>
										반려 처리하고 알림 보내기
									</S.DangerButton>
								)}
							</div>
						</div>
					</S.ModalBody>
				</S.ModalContent>
			)}
		</S.ModalOverlay>
	);
}
