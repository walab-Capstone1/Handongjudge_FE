import type React from "react";
import "../AssignmentModals/AssignmentModals.css";
import type { BulkProblemCreateModalProps } from "./types";

const BulkProblemCreateModal: React.FC<BulkProblemCreateModalProps> = ({
	isOpen,
	bulkProblemData,
	onClose,
	onSubmit,
	onInputChange,
	onFileChange,
	onAddRow,
	onRemoveRow,
}) => {
	if (!isOpen) return null;

	return (
		<div className="tutor-modal-overlay">
			<div className="tutor-modal-content tutor-large-modal">
				<div className="tutor-modal-header">
					<h2>문제 대량 생성</h2>
					<button type="button" className="tutor-modal-close" onClick={onClose}>
						✕
					</button>
				</div>

				<form onSubmit={onSubmit} className="tutor-bulk-problem-form">
					<div className="tutor-info-box">
						<p>
							<strong>📄 문제 설명 파일 우선순위:</strong>
						</p>
						<p>1. 별도 업로드 파일 (최우선) - .md, .txt, .tex 지원</p>
						<p>
							2. ZIP 파일 내 problem_statement 폴더의 파일 (.tex → .md → .txt
							순)
						</p>
						<p>3. 파일이 없으면 빈 설명으로 생성됩니다.</p>
						<br />
						<p>
							<strong>💡 안내:</strong>
						</p>
						<p>• 여러 문제를 한번에 생성할 수 있습니다</p>
						<p>• ZIP 파일은 필수, 설명 파일은 선택사항입니다</p>
						<p>
							• 생성 후 원하는 과제에서 &quot;문제 추가&quot; 버튼으로 추가할 수
							있습니다
						</p>
					</div>

					<div className="tutor-bulk-problems-container">
						{bulkProblemData.problems.map((problem, index) => (
							<div key={index} className="tutor-bulk-problem-row">
								<div className="tutor-problem-row-header">
									<h4>문제 {index + 1}</h4>
									{bulkProblemData.problems.length > 1 && (
										<button
											type="button"
											className="tutor-btn-remove-row"
											onClick={() => onRemoveRow(index)}
											title="이 문제 제거"
										>
											✕
										</button>
									)}
								</div>

								<div className="tutor-problem-row-content">
									<div className="tutor-form-group">
										<label>문제 제목 *</label>
										<input
											type="text"
											value={problem.title}
											onChange={(e) =>
												onInputChange(index, "title", e.target.value)
											}
											placeholder="문제 제목을 입력하세요"
											required
										/>
									</div>

									<div className="tutor-form-row">
										<div className="tutor-form-group">
											<label>
												문제 설명 파일{" "}
												<span className="tutor-optional">(선택사항)</span>
											</label>
											<input
												type="file"
												onChange={(e) =>
													onFileChange(
														index,
														"descriptionFile",
														e.target.files?.[0] ?? null,
													)
												}
												accept=".md,.txt,.tex"
												className="tutor-file-input"
											/>
											<small className="tutor-file-help">
												.md, .txt, .tex 형식 지원. ZIP 파일보다 우선 적용됩니다.
											</small>
											{problem.descriptionFile && (
												<small className="tutor-file-selected">
													선택됨: {problem.descriptionFile.name}
												</small>
											)}
										</div>

										<div className="tutor-form-group">
											<label>문제 파일 (.zip) *</label>
											<input
												type="file"
												onChange={(e) =>
													onFileChange(
														index,
														"zipFile",
														e.target.files?.[0] ?? null,
													)
												}
												accept=".zip"
												className="tutor-file-input"
												required
											/>
											<small className="tutor-file-help">
												테스트 케이스 포함. problem_statement 폴더가 있으면 설명
												자동 추출.
											</small>
											{problem.zipFile && (
												<small className="tutor-file-selected">
													선택됨: {problem.zipFile.name} (
													{(problem.zipFile.size / 1024 / 1024).toFixed(2)}MB)
												</small>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="tutor-bulk-actions">
						<button
							type="button"
							className="tutor-btn-add-row"
							onClick={onAddRow}
						>
							문제 추가
						</button>
					</div>

					<div className="tutor-form-actions">
						<button
							type="button"
							className="tutor-btn-secondary"
							onClick={onClose}
						>
							취소
						</button>
						<button type="submit" className="tutor-btn-primary">
							{bulkProblemData.problems.length}개 문제 생성
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default BulkProblemCreateModal;
