import type { ReactNode } from "react";

export interface ProblemListEditViewProps {
	title: string;
	error: string | null;
	loading: boolean;
	onCancel: () => void;
	children: ReactNode;
}

/**
 * 문제 목록 모달 - 편집 모드 UI (오버레이, 헤더, 에러/로딩, 폼 영역)
 */
export default function ProblemListEditView({
	title,
	error,
	loading,
	onCancel,
	children,
}: ProblemListEditViewProps) {
	return (
		<div
			className="assignment-management-problem-list-modal-overlay"
			onClick={onCancel}
			onKeyDown={() => {}}
			role="presentation"
		>
			<div
				className="assignment-management-problem-list-modal-content assignment-management-problem-list-modal-content-extra-large"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
				role="presentation"
			>
				<div className="assignment-management-problem-list-modal-header">
					<h2>문제 수정 - {title || "로딩 중..."}</h2>
					<button
						type="button"
						className="assignment-management-problem-list-modal-close"
						onClick={onCancel}
					>
						✕
					</button>
				</div>

				<div
					className="assignment-management-problem-list-modal-body"
					style={{
						padding: "2rem",
						overflowY: "auto",
						maxHeight: "calc(90vh - 200px)",
					}}
				>
					{error && (
						<div
							style={{
								marginBottom: "1rem",
								padding: "1rem",
								background: "#fee",
								color: "#c33",
								borderRadius: "8px",
							}}
						>
							{error}
						</div>
					)}

					{loading ? (
						<div style={{ textAlign: "center", padding: "3rem" }}>
							로딩 중...
						</div>
					) : (
						children
					)}
				</div>
			</div>
		</div>
	);
}
