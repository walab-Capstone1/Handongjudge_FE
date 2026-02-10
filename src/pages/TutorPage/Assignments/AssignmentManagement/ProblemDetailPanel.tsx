import type React from "react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import * as S from "./styles";

export interface ProblemDetailData {
	title?: string;
	description?: string;
	timeLimit?: number;
	memoryLimit?: number;
	[key: string]: any;
}

interface ProblemDetailPanelProps {
	detail: ProblemDetailData | null;
	onClose: () => void;
}

const ProblemDetailPanel: React.FC<ProblemDetailPanelProps> = ({
	detail,
	onClose,
}) => {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.body.classList.add("problem-detail-panel-open");
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.body.classList.remove("problem-detail-panel-open");
			document.body.style.overflow = prevOverflow;
			document.removeEventListener("keydown", handleEscape);
		};
	}, [onClose]);

	if (!detail) return null;

	const desc = detail.description;
	const isMd =
		desc &&
		typeof desc === "string" &&
		(desc.includes("# ") ||
			desc.includes("## ") ||
			desc.includes("```") ||
			desc.includes("**") ||
			!desc.includes("<"));

	return (
		<>
			<S.DetailOverlay onClick={onClose} aria-hidden="true" />
			<S.DetailPanel onClick={(e: React.MouseEvent) => e.stopPropagation()}>
				<S.DetailPanelHeader>
					<h3>문제 설명</h3>
					<S.BtnCloseDetail type="button" onClick={onClose} aria-label="닫기">
						×
					</S.BtnCloseDetail>
				</S.DetailPanelHeader>
				<S.DetailPanelContent>
					<S.DetailTitle>{detail.title ?? "제목 없음"}</S.DetailTitle>
					<S.DetailMeta>
						{detail.timeLimit != null && (
							<span>시간 제한: {detail.timeLimit}초</span>
						)}
						{detail.memoryLimit != null && (
							<span>메모리 제한: {detail.memoryLimit}MB</span>
						)}
					</S.DetailMeta>
					<S.DetailBody className="tutor-problem-description">
						{desc ? (
							isMd ? (
								<ReactMarkdown
									components={{
										code({ node, inline, className, children, ...props }: any) {
											return inline ? (
												<code className="tutor-inline-code" {...props}>
													{children}
												</code>
											) : (
												<pre className="tutor-code-block">
													<code className={className} {...props}>
														{children}
													</code>
												</pre>
											);
										},
									}}
								>
									{String(desc)}
								</ReactMarkdown>
							) : (
								<div dangerouslySetInnerHTML={{ __html: String(desc) }} />
							)
						) : (
							<p>설명이 없습니다.</p>
						)}
					</S.DetailBody>
				</S.DetailPanelContent>
			</S.DetailPanel>
		</>
	);
};

export default ProblemDetailPanel;
