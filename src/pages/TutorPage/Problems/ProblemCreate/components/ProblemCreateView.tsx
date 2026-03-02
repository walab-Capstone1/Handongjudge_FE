import type React from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "../styles";
import ProblemPreview from "./ProblemPreview";
import type { ProblemCreateHookReturn } from "../hooks/useProblemCreate";

const REQUIRED_MSG = "필수 항목(*)을 입력해 주세요.";

export default function ProblemCreateView(d: ProblemCreateHookReturn) {
	const hasRequiredErrors = Object.keys(d.fieldErrors).length > 0;

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
						<S.RequiredMessage role="alert">{REQUIRED_MSG}</S.RequiredMessage>
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
													: "ZIP 파일 선택"}
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
											: "문제 ZIP 파일이 있다면 업로드하세요. 자동으로 문제 설명, 문제 제목이 채워집니다."}
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
									<S.PreviewHeader>미리보기</S.PreviewHeader>
									<S.PreviewContent>
										<ProblemPreview {...d.getFullDescription()} />
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
										테스트케이스 입력(.in) 및 출력(.ans) 파일
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
												<S.HelpText>
													이 테스트케이스들은 ZIP 파일에 포함되어 있습니다. 문제
													생성 시 자동으로 포함됩니다.
												</S.HelpText>
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
