import type React from "react";
import * as S from "../AssignmentModals/styles";
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
		<S.Overlay onClick={onClose}>
			<S.Content $large onClick={(e: React.MouseEvent) => e.stopPropagation()}>
				<S.Header>
					<h2>문제 대량 생성</h2>
					<S.CloseButton type="button" onClick={onClose}>
						✕
					</S.CloseButton>
				</S.Header>

				<form onSubmit={onSubmit}>
					<S.Body
						as="div"
						style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
					>
						<S.InfoBox>
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
								• 생성 후 원하는 과제에서 &quot;문제 추가&quot; 버튼으로 추가할
								수 있습니다
							</p>
						</S.InfoBox>

						<S.BulkContainer>
							{bulkProblemData.problems.map((problem, index) => (
								<S.BulkRow key={index}>
									<S.BulkRowHeader>
										<h4>문제 {index + 1}</h4>
										{bulkProblemData.problems.length > 1 && (
											<S.BtnRemoveRow
												type="button"
												onClick={() => onRemoveRow(index)}
												title="이 문제 제거"
											>
												✕
											</S.BtnRemoveRow>
										)}
									</S.BulkRowHeader>

									<S.BulkRowContent>
										<S.FormGroup>
											<S.FormLabel>문제 제목 *</S.FormLabel>
											<S.FormInput
												type="text"
												value={problem.title}
												onChange={(e) =>
													onInputChange(index, "title", e.target.value)
												}
												placeholder="문제 제목을 입력하세요"
												required
											/>
										</S.FormGroup>

										<S.FormRow>
											<S.FormGroup>
												<S.FormLabel>
													문제 설명 파일{" "}
													<S.OptionalLabel>(선택사항)</S.OptionalLabel>
												</S.FormLabel>
												<S.FileInput
													onChange={(e) =>
														onFileChange(
															index,
															"descriptionFile",
															e.target.files?.[0] ?? null,
														)
													}
													accept=".md,.txt,.tex"
												/>
												<S.FormHelp>
													.md, .txt, .tex 형식 지원. ZIP 파일보다 우선
													적용됩니다.
												</S.FormHelp>
												{problem.descriptionFile && (
													<S.FileSelected>
														선택됨: {problem.descriptionFile.name}
													</S.FileSelected>
												)}
											</S.FormGroup>

											<S.FormGroup>
												<S.FormLabel>문제 파일 (.zip) *</S.FormLabel>
												<S.FileInput
													onChange={(e) =>
														onFileChange(
															index,
															"zipFile",
															e.target.files?.[0] ?? null,
														)
													}
													accept=".zip"
													required
												/>
												<S.FormHelp>
													테스트 케이스 포함. problem_statement 폴더가 있으면
													설명 자동 추출.
												</S.FormHelp>
												{problem.zipFile && (
													<S.FileSelected>
														선택됨: {problem.zipFile.name} (
														{(problem.zipFile.size / 1024 / 1024).toFixed(2)}MB)
													</S.FileSelected>
												)}
											</S.FormGroup>
										</S.FormRow>
									</S.BulkRowContent>
								</S.BulkRow>
							))}
						</S.BulkContainer>

						<S.BulkActions>
							<S.BtnAddRow type="button" onClick={onAddRow}>
								문제 추가
							</S.BtnAddRow>
						</S.BulkActions>

						<S.Actions>
							<S.BtnSecondary type="button" onClick={onClose}>
								취소
							</S.BtnSecondary>
							<S.BtnPrimary type="submit">
								{bulkProblemData.problems.length}개 문제 생성
							</S.BtnPrimary>
						</S.Actions>
					</S.Body>
				</form>
			</S.Content>
		</S.Overlay>
	);
};

export default BulkProblemCreateModal;
