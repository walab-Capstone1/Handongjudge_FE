import { useCallback, useEffect } from "react";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import * as S from "../styles";
import type {
	QuizSubmissionLogCode,
	QuizSubmissionLogTarget,
	QuizSubmissionRecord,
} from "../types";
import {
	formatQuizSubmissionDateTime,
	getQuizSubmissionResultColor,
	getQuizSubmissionResultLabel,
} from "../utils/quizSubmissionResult";

export interface GradeQuizSubmissionLogModalProps {
	show: boolean;
	target: QuizSubmissionLogTarget | null;
	records: QuizSubmissionRecord[];
	selectedSubmissionId: number | null;
	code: QuizSubmissionLogCode | null;
	listLoading: boolean;
	codeLoading: boolean;
	onClose: () => void;
	onSelectSubmission: (submissionId: number) => void;
}

export default function GradeQuizSubmissionLogModal({
	show,
	target,
	records,
	selectedSubmissionId,
	code,
	listLoading,
	codeLoading,
	onClose,
	onSelectSubmission,
}: GradeQuizSubmissionLogModalProps) {
	const selectedIndex = records.findIndex(
		(r) => r.submissionId === selectedSubmissionId,
	);

	const moveSelection = useCallback(
		(delta: number) => {
			if (records.length === 0) return;
			const base = selectedIndex >= 0 ? selectedIndex : 0;
			const next = Math.max(0, Math.min(records.length - 1, base + delta));
			onSelectSubmission(records[next].submissionId);
		},
		[records, selectedIndex, onSelectSubmission],
	);

	useEffect(() => {
		if (!show) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				moveSelection(1);
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				moveSelection(-1);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [show, onClose, moveSelection]);

	if (!show || !target) return null;

	const title = `${target.studentName} · ${removeCopyLabel(target.problemTitle)}`;

	return (
		<S.ModalOverlay
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="presentation"
		>
			<S.ModalContent
				$large
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<S.ModalHeader>
					<div>
						<h2 id="quiz-submission-log-title">제출 로그</h2>
						<p
							style={{
								margin: "0.35rem 0 0",
								fontSize: "0.9rem",
								fontWeight: 500,
								opacity: 0.92,
							}}
						>
							{title}
							{target.quizTitle ? ` · ${target.quizTitle}` : ""}
						</p>
					</div>
					<S.ModalClose type="button" onClick={onClose} aria-label="닫기">
						×
					</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody>
					{listLoading ? (
						<p style={{ color: "#64748b", margin: 0 }}>제출 기록을 불러오는 중...</p>
					) : records.length === 0 ? (
						<p style={{ color: "#64748b", margin: 0 }}>제출 기록이 없습니다.</p>
					) : (
						<S.QuizLogModalLayout>
							<S.QuizLogListPanel>
								<S.QuizLogListHeader>
									제출 이력 ({records.length}건) · ↑↓ 선택
								</S.QuizLogListHeader>
								<S.QuizLogListScroll>
									{records.map((rec, idx) => {
										const active = rec.submissionId === selectedSubmissionId;
										const resultColor = getQuizSubmissionResultColor(rec.result);
										return (
											<S.QuizLogListItem key={rec.submissionId} $active={active}>
												<button
													type="button"
													onClick={() => onSelectSubmission(rec.submissionId)}
												>
													<S.QuizLogItemTime>
														#{records.length - idx}{" "}
														{formatQuizSubmissionDateTime(rec.submittedAt)}
													</S.QuizLogItemTime>
													<S.QuizLogItemMeta>
														<span
															style={{
																display: "inline-block",
																padding: "0.1rem 0.35rem",
																borderRadius: "4px",
																fontWeight: 600,
																background: `${resultColor}20`,
																color: resultColor,
															}}
														>
															{getQuizSubmissionResultLabel(rec.result)}
														</span>
														<span>{rec.language ?? "-"}</span>
													</S.QuizLogItemMeta>
												</button>
											</S.QuizLogListItem>
										);
									})}
								</S.QuizLogListScroll>
							</S.QuizLogListPanel>
							<S.QuizLogDetailPanel>
								{codeLoading ? (
									<p style={{ color: "#64748b", margin: 0 }}>
										코드를 불러오는 중...
									</p>
								) : code ? (
									<>
										<S.QuizLogDetailMeta>
											<span>
												<strong>제출</strong>
												{formatQuizSubmissionDateTime(code.submittedAt)}
											</span>
											<span>
												<strong>결과</strong>
												{getQuizSubmissionResultLabel(code.result)}
											</span>
											<span>
												<strong>언어</strong>
												{code.language ?? "-"}
											</span>
										</S.QuizLogDetailMeta>
										<S.CodeDisplay style={{ flex: 1, maxHeight: "min(55vh, 480px)" }}>
											<code>{code.code || "(빈 코드)"}</code>
										</S.CodeDisplay>
									</>
								) : (
									<p style={{ color: "#64748b", margin: 0 }}>
										코드를 불러올 수 없습니다.
									</p>
								)}
							</S.QuizLogDetailPanel>
						</S.QuizLogModalLayout>
					)}
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
}
