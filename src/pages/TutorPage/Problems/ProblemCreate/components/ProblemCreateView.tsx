import type React from "react";
import { createPortal } from "react-dom";
import { useRef, useEffect } from "react";
import TutorLayout from "../../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "../styles";
import ProblemPreview from "./ProblemPreview";
import type { ProblemCreateHookReturn } from "../hooks/useProblemCreate";

const REQUIRED_MSG = "필수 항목(*)을 입력해 주세요.";

export default function ProblemCreateView(d: ProblemCreateHookReturn) {
	const hasRequiredErrors = Object.keys(d.fieldErrors).length > 0;
	const folderDirInputRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		const el = folderDirInputRef.current;
		if (el) {
			el.setAttribute("webkitdirectory", "");
			el.setAttribute("directory", "");
		}
	}, []);

	return (
		<TutorLayout>
			{d.loading &&
				createPortal(
					<div
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "rgba(0,0,0,0.35)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 10000,
						}}
					>
						<div
							style={{
								background: "white",
								padding: "1.5rem 2rem",
								borderRadius: "12px",
								boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
							}}
						>
							<LoadingSpinner message="문제 생성 중..." />
						</div>
					</div>,
					document.body,
				)}
			<S.Container>
				<S.PageHeader>
					<S.PageTitle>새 문제 만들기</S.PageTitle>
					<S.CancelHeaderButton
						type="button"
						onClick={() => d.navigate("/tutor/problems")}
					>
						취소
					</S.CancelHeaderButton>
				</S.PageHeader>

				{d.error && <S.ErrorMessage>{d.error}</S.ErrorMessage>}

				<S.Form onSubmit={d.handleSubmit}>
					{hasRequiredErrors && (
						<S.RequiredMessage role="alert">
							{REQUIRED_MSG}
							{d.fieldErrors.testcases && (
								<>
									<br />
									테스트케이스가 최소 1개 이상 필요합니다.
								</>
							)}
						</S.RequiredMessage>
					)}
					<S.Step>
						<S.FormGrid>
							<S.FormSection>
								<S.Label>문제 제목 *</S.Label>
								<S.Input
									type="text"
									name="title"
									value={d.formData.title}
									onChange={(e) => {
										d.clearFieldError("title");
										d.handleInputChange(e);
									}}
									required
									placeholder="문제 제목을 입력하세요"
									style={d.fieldErrors.title ? { borderColor: "#dc2626" } : undefined}
								/>
							</S.FormSection>

							<S.FormRow>
								<S.FormSection>
									<S.Label>난이도 *</S.Label>
									<S.Select
										name="difficulty"
										value={d.formData.difficulty}
										onChange={d.handleInputChange}
										required
									>
										<option value="1">Level 1</option>
										<option value="2">Level 2</option>
										<option value="3">Level 3</option>
									</S.Select>
								</S.FormSection>
								<S.FormSection>
									<S.Label>태그</S.Label>
									<S.TagInputWrapper>
										<S.Input
											type="text"
											value={d.currentTag}
											onChange={(e) => d.setCurrentTag(e.target.value)}
											onKeyDown={d.handleTagKeyPress}
											placeholder="태그 입력 후 Enter"
										/>
										<S.TagAddButton type="button" onClick={d.handleTagAdd}>
											추가
										</S.TagAddButton>
									</S.TagInputWrapper>
									<S.Tags>
										{d.formData.tags.map((tag, idx) => (
											<S.Tag key={idx}>
												{tag}
												<S.TagRemove
													type="button"
													onClick={() => d.handleTagRemove(tag)}
												>
													×
												</S.TagRemove>
											</S.Tag>
										))}
									</S.Tags>
								</S.FormSection>
							</S.FormRow>

							<S.FormRow>
								<S.FormSection>
									<S.Label>시간 제한 (초) *</S.Label>
									<S.Input
										type="number"
										name="timeLimit"
										value={d.formData.timeLimit}
										onChange={(e) => {
											d.clearFieldError("timeLimit");
											d.handleInputChange(e);
										}}
										min={0}
										step={0.1}
										placeholder="예: 2.0"
										style={d.fieldErrors.timeLimit ? { borderColor: "#dc2626" } : undefined}
									/>
								</S.FormSection>
								<S.FormSection>
									<S.Label>메모리 제한 (MB) *</S.Label>
									<S.Input
										type="number"
										name="memoryLimit"
										value={d.formData.memoryLimit}
										onChange={(e) => {
											d.clearFieldError("memoryLimit");
											d.handleInputChange(e);
										}}
										min={0}
										placeholder="예: 256"
										style={d.fieldErrors.memoryLimit ? { borderColor: "#dc2626" } : undefined}
									/>
								</S.FormSection>
							</S.FormRow>

							<S.FormSection>
								<S.Label>ZIP 파일 (선택사항)</S.Label>
								<S.FileUploadWrapper>
									<S.FileInput
										type="file"
										id="zipFileInput"
										accept=".zip"
										onChange={d.handleZipFileChange}
										disabled={d.loading}
									/>
									<S.FileRow>
										<S.FileLabelInline htmlFor="zipFileInput">
											{d.loading
												? "파싱 중..."
												: d.zipFile
													? `✓ ${d.zipFile.name}`
													: "ZIP 파일 선택 (DomJudge)"}
										</S.FileLabelInline>
										{d.zipFile && !d.loading && (
											<S.RemoveZipButton
												type="button"
												onClick={d.clearZipFile}
												title="ZIP 파일 제거"
											>
												×
											</S.RemoveZipButton>
										)}
									</S.FileRow>
									<S.HelpText>
										{d.loading
											? "ZIP 파일 내용을 분석 중입니다..."
											: "DomJudge 형식(problem_statement/, problem.yaml 등) ZIP"}
									</S.HelpText>
								</S.FileUploadWrapper>
								<S.FileUploadWrapper style={{ marginTop: 12 }}>
									<input
										ref={folderDirInputRef}
										type="file"
										id="folderFormatDirInput"
										style={{ display: "none" }}
										onChange={d.handleFolderFormatFolderChange}
										disabled={d.loading}
									/>
									<S.FileRow>
										<S.FileLabelInline htmlFor="folderFormatDirInput">
											{d.loading
												? "파싱 중..."
												: d.folderFormatFolderName
													? `✓ ${d.folderFormatFolderName}`
													: "문제 폴더 선택"}
										</S.FileLabelInline>
										{d.folderFormatFolderName && !d.loading && (
											<S.RemoveZipButton
												type="button"
												onClick={d.clearFolderFormatZip}
												title="폴더 형식 제거"
											>
												×
											</S.RemoveZipButton>
										)}
									</S.FileRow>
									<S.HelpText>
										description.md, problem.ini, testcases/ 포함 폴더 (일부만 있어도 파싱됨)
									</S.HelpText>
								</S.FileUploadWrapper>
							</S.FormSection>

						<S.FormSection as={S.DescriptionSection}>
							<S.Label>문제 설명 *</S.Label>
							<S.DescriptionEditor
								style={d.fieldErrors.description ? { border: "1px solid #dc2626", borderRadius: 8 } : undefined}
							>
								<S.EditorWrapper>
									{/* 마크다운 전용 툴바 */}
									<S.EditorToolbar>
								<S.HeadingSelect
										onChange={(e) => {
											const v = e.target.value;
											if (v) {
												d.insertMarkdownHeading(v);
												e.target.value = "";
											}
										}}
										title="제목 스타일 (# 삽입)"
									>
										<option value="">제목 스타일</option>
										<option value="h1">제목 1 (#)</option>
										<option value="h2">제목 2 (##)</option>
										<option value="h3">제목 3 (###)</option>
										<option value="h4">제목 4 (####)</option>
									</S.HeadingSelect>
									<S.HeadingSelect
										onChange={(e) => {
											const size = e.target.value;
											if (!size) return;
											const el = d.descriptionRef.current;
											if (!el) { e.target.value = ""; return; }
											el.focus();
											const openTag = `<span style="font-size: ${size}">`;
											const closeTag = `</span>`;
											const sel = window.getSelection();
											if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
												const selectedText = sel.getRangeAt(0).toString();
												document.execCommand("insertText", false, `${openTag}${selectedText}${closeTag}`);
											} else {
												document.execCommand("insertText", false, `${openTag}${closeTag}`);
											}
											const plain = el.innerText || el.textContent || "";
											d.setFormData((prev) => ({ ...prev, description: plain, descriptionText: plain }));
											e.target.value = "";
										}}
										title="글자 크기"
									>
										<option value="">글자 크기</option>
										<option value="0.75em">작게 (0.75x)</option>
										<option value="1em">기본 (1x)</option>
										<option value="1.25em">크게 (1.25x)</option>
										<option value="1.5em">더 크게 (1.5x)</option>
										<option value="2em">매우 크게 (2x)</option>
									</S.HeadingSelect>
									<S.ToolbarDivider />
										<S.ToolbarButton
											type="button"
											onClick={() => d.wrapWithMarkdown("**")}
											title="Bold (**텍스트**)"
										>
											<strong>B</strong>
										</S.ToolbarButton>
										<S.ToolbarButton
											type="button"
											onClick={() => d.wrapWithMarkdown("*")}
											title="Italic (*텍스트*)"
										>
											<em>I</em>
										</S.ToolbarButton>
										<S.ToolbarButton
											type="button"
											onClick={() => d.wrapWithMarkdown("`")}
											title="인라인 코드 (`코드`)"
										>
											{"</>"}
										</S.ToolbarButton>
										<S.ToolbarDivider />
										<S.ToolbarButton
											type="button"
											onClick={() => d.insertMarkdownText("\n- ")}
											title="글머리 기호 목록"
										>
											•
										</S.ToolbarButton>
										<S.ToolbarButton
											type="button"
											onClick={() => d.insertMarkdownText("\n1. ")}
											title="번호 매기기 목록"
										>
											1.
										</S.ToolbarButton>
										<S.ToolbarDivider />
										<S.ToolbarButton
											type="button"
											onClick={() => d.insertMarkdownText("\n> ")}
											title="인용문 (> 텍스트)"
										>
											"
										</S.ToolbarButton>
										<S.ToolbarButton
											type="button"
											onClick={() => d.insertMarkdownText("\n```\n코드\n```\n")}
											title="코드 블록"
										>
											&lt;&gt;
										</S.ToolbarButton>
										<S.ToolbarButton
											type="button"
											onClick={() => d.insertMarkdownText("\n---\n")}
											title="구분선"
										>
											—
										</S.ToolbarButton>
									</S.EditorToolbar>
									<S.TextEditor
										ref={d.descriptionRef}
										contentEditable
										suppressContentEditableWarning
										data-placeholder="마크다운으로 문제 설명을 입력하세요 (예: # 제목, **굵게**, ```코드```)"
										onPaste={(e) => {
											// 마크다운 텍스트로 붙여넣기: 순수 텍스트만 받습니다
											e.preventDefault();
											const paste =
												e.clipboardData?.getData("text") ?? "";
											const selection = window.getSelection();
											if (!selection?.rangeCount) return;
											const range = selection.getRangeAt(0);
											range.deleteContents();
											range.insertNode(document.createTextNode(paste));
											range.collapse(false);
											selection.removeAllRanges();
											selection.addRange(range);
											// 순수 텍스트를 description으로 저장
											const plain =
												d.descriptionRef.current?.innerText ||
												d.descriptionRef.current?.textContent ||
												"";
											d.clearFieldError("description");
											d.setFormData((prev) => ({
												...prev,
												description: plain,
												descriptionText: plain,
											}));
										}}
										onInput={(e) => {
											d.clearFieldError("description");
											const plain =
												e.currentTarget?.innerText ||
												e.currentTarget?.textContent ||
												"";
											d.setFormData((prev) => ({
												...prev,
												description: plain,
												descriptionText: plain,
											}));
										}}
										onBlur={(e) => {
											const plain =
												e.currentTarget?.innerText ||
												e.currentTarget?.textContent ||
												"";
											d.setFormData((prev) => ({
												...prev,
												description: plain,
												descriptionText: plain,
											}));
										}}
										onKeyDown={(e) => {
											if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
												e.preventDefault();
												document.execCommand("undo", false);
											}
											if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
												e.preventDefault();
												document.execCommand("redo", false);
											}
										}}
									/>
								</S.EditorWrapper>
								<S.Preview>
									<S.PreviewHeader>
										<span>미리보기</span>
										<S.PreviewModeToggle>
											<S.PreviewModeButton
												type="button"
												$active={d.previewMode === "descriptionOnly"}
												onClick={() => d.setPreviewMode("descriptionOnly")}
											>
												문제 설명만
											</S.PreviewModeButton>
											<S.PreviewModeButton
												type="button"
												$active={d.previewMode === "full"}
												onClick={() => d.setPreviewMode("full")}
											>
												전체
											</S.PreviewModeButton>
										</S.PreviewModeToggle>
									</S.PreviewHeader>
									<S.PreviewContent>
										<ProblemPreview
											{...(d.previewMode === "descriptionOnly"
												? d.getDescriptionOnlyForPreview()
												: d.getFullDescriptionForPreview())}
											descriptionOnly={d.previewMode === "descriptionOnly"}
										/>
									</S.PreviewContent>
								</S.Preview>
							</S.DescriptionEditor>
						</S.FormSection>

							<S.FormRow>
								<S.FormSection>
									<S.Label>입력 형식</S.Label>
									<S.Textarea
										name="inputFormat"
										value={d.formData.inputFormat}
										onChange={d.handleInputChange}
										rows={4}
										placeholder="입력 형식을 설명하세요"
									/>
								</S.FormSection>
								<S.FormSection>
									<S.Label>출력 형식</S.Label>
									<S.Textarea
										name="outputFormat"
										value={d.formData.outputFormat}
										onChange={d.handleInputChange}
										rows={4}
										placeholder="출력 형식을 설명하세요"
									/>
								</S.FormSection>
							</S.FormRow>

							<S.FormSection>
								<S.Label>예제 입출력</S.Label>
								{d.formData.sampleInputs.map((sample, idx) => (
									<S.SampleItem key={idx}>
										<S.SampleItemHeader>
											<span>예제 #{idx + 1}</span>
											{d.formData.sampleInputs.length > 1 && (
												<S.SampleRemove
													type="button"
													onClick={() => d.removeSampleInput(idx)}
												>
													삭제
												</S.SampleRemove>
											)}
										</S.SampleItemHeader>
										<S.SampleGrid>
											<div>
												<S.SampleLabel>입력</S.SampleLabel>
												<S.Textarea
													value={sample.input}
													onChange={(e) =>
														d.handleSampleInputChange(
															idx,
															"input",
															e.target.value,
														)
													}
													rows={3}
													placeholder="예제 입력"
												/>
											</div>
											<div>
												<S.SampleLabel>출력</S.SampleLabel>
												<S.Textarea
													value={sample.output}
													onChange={(e) =>
														d.handleSampleInputChange(
															idx,
															"output",
															e.target.value,
														)
													}
													rows={3}
													placeholder="예제 출력"
												/>
											</div>
										</S.SampleGrid>
									</S.SampleItem>
								))}
								<S.AddSampleButton type="button" onClick={d.addSampleInput}>
									+ 예제 추가
								</S.AddSampleButton>
							</S.FormSection>

							<S.FormSection>
								<S.Label>테스트케이스 파일</S.Label>
								<S.FileUploadWrapper>
									<S.FileInput
										type="file"
										id="testcaseInput"
										multiple
										onChange={d.handleTestcaseAdd}
									/>
									<S.FileLabelInline htmlFor="testcaseInput">
										파일 선택
									</S.FileLabelInline>
									<S.HelpText>
										테스트케이스 입력(.in) 및 출력(.ans) 파일 · 아래에서 직접 입력도 가능
									</S.HelpText>
								</S.FileUploadWrapper>
								<S.TestcaseList>
									{d.formData.testcases.map((file, idx) => (
										<S.TestcaseItem key={idx}>
											<span>{file.name}</span>
											<S.TestcaseRemove
												type="button"
												onClick={() => d.handleTestcaseRemove(idx)}
											>
												×
											</S.TestcaseRemove>
										</S.TestcaseItem>
									))}
								</S.TestcaseList>

								<div style={{ marginTop: "1rem" }}>
									<button
										type="button"
										onClick={d.handleManualTestcaseAdd}
										style={{
											padding: "8px 14px",
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											background: "#f8fafc",
											cursor: "pointer",
											fontSize: "14px",
										}}
									>
										+ 테스트케이스 직접 추가
									</button>
								</div>
								{d.manualTestCases.length > 0 && (
									<S.ParsedTestcasesSection style={{ marginTop: "1rem" }}>
										<S.Label style={{ marginBottom: "0.5rem" }}>
											직접 추가한 테스트케이스 ({d.manualTestCases.length}개)
										</S.Label>
										<S.ParsedTestcases>
											{d.manualTestCases.map((tc, idx) => (
												<S.ParsedTestcaseItem key={idx}>
													<S.ParsedTestcaseHeader>
														<span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
															<input
																type="text"
																value={tc.name ?? ""}
																onChange={(e) =>
																	d.handleManualTestcaseChange(idx, "name", e.target.value)
																}
																placeholder="이름"
																style={{
																	width: "120px",
																	padding: "0.35rem 0.5rem",
																	fontSize: "0.9rem",
																	border: "1px solid #cbd5e1",
																	borderRadius: "4px",
																}}
															/>
															<select
																value={tc.type ?? "secret"}
																onChange={(e) =>
																	d.handleManualTestcaseChange(
																		idx,
																		"type",
																		e.target.value as "sample" | "secret",
																	)
																}
																style={{
																	padding: "0.35rem 0.5rem",
																	borderRadius: "4px",
																	border: "1px solid #cbd5e1",
																	fontSize: "0.85rem",
																}}
															>
																<option value="sample">샘플</option>
																<option value="secret">비밀</option>
															</select>
														</span>
														<S.TestcaseRemove
															type="button"
															onClick={() => d.handleManualTestcaseRemove(idx)}
														>
															×
														</S.TestcaseRemove>
													</S.ParsedTestcaseHeader>
													<S.ParsedTestcaseContent>
														<div>
															<strong>입력:</strong>
															<textarea
																value={tc.input ?? ""}
																onChange={(e) =>
																	d.handleManualTestcaseChange(idx, "input", e.target.value)
																}
																rows={3}
																placeholder="입력 데이터"
																style={{
																	width: "100%",
																	fontFamily: "monospace",
																	fontSize: "0.85rem",
																	padding: "8px",
																	border: "1px solid #e2e8f0",
																	borderRadius: "4px",
																	marginTop: "4px",
																	resize: "vertical",
																}}
															/>
														</div>
														<div>
															<strong>출력:</strong>
															<textarea
																value={tc.output ?? ""}
																onChange={(e) =>
																	d.handleManualTestcaseChange(idx, "output", e.target.value)
																}
																rows={3}
																placeholder="출력 데이터"
																style={{
																	width: "100%",
																	fontFamily: "monospace",
																	fontSize: "0.85rem",
																	padding: "8px",
																	border: "1px solid #e2e8f0",
																	borderRadius: "4px",
																	marginTop: "4px",
																	resize: "vertical",
																}}
															/>
														</div>
													</S.ParsedTestcaseContent>
												</S.ParsedTestcaseItem>
											))}
										</S.ParsedTestcases>
									</S.ParsedTestcasesSection>
								)}

								{d.parsedTestCases.length > 0 && (
									<S.ParsedTestcasesSection>
										<S.ParsedTestcasesToggle
											type="button"
											onClick={() =>
												d.setShowParsedTestCases(!d.showParsedTestCases)
											}
										>
											<S.ParsedTestcasesToggleIcon>
												{d.showParsedTestCases ? "▼" : "▶"}
											</S.ParsedTestcasesToggleIcon>
											<span>
												ZIP 파일에서 발견된 테스트케이스 (
												{d.parsedTestCases.length}개)
											</span>
										</S.ParsedTestcasesToggle>
										{d.showParsedTestCases && (
											<S.ParsedTestcases>
												{d.parsedTestCases.map((testCase, idx) => (
													<S.ParsedTestcaseItem key={idx}>
														<S.ParsedTestcaseHeader>
															<span>
																<strong>{testCase.name}</strong> (
																{testCase.type === "sample" ? "샘플" : "비밀"})
															</span>
															<S.TestcaseRemove
																type="button"
																onClick={() => d.handleParsedTestcaseRemove(idx)}
															>
																×
															</S.TestcaseRemove>
														</S.ParsedTestcaseHeader>
														<S.ParsedTestcaseContent>
															<div>
																<strong>입력:</strong>
																<pre>{testCase.input || "(없음)"}</pre>
															</div>
															<div>
																<strong>출력:</strong>
																<pre>{testCase.output || "(없음)"}</pre>
															</div>
														</S.ParsedTestcaseContent>
													</S.ParsedTestcaseItem>
												))}
											</S.ParsedTestcases>
										)}
									</S.ParsedTestcasesSection>
								)}
							</S.FormSection>
						</S.FormGrid>

						<S.Actions>
							<S.CancelButton
								type="button"
								onClick={() => d.navigate("/tutor/problems")}
								disabled={d.loading}
							>
								취소
							</S.CancelButton>
							<S.SubmitButton type="submit" disabled={d.loading}>
								{d.loading ? "생성 중..." : "문제 생성"}
							</S.SubmitButton>
						</S.Actions>
					</S.Step>
				</S.Form>
			</S.Container>
		</TutorLayout>
	);
}
