import type React from "react";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import TutorLayout from "../../../../../layouts/TutorLayout";
import * as S from "../styles";
import ProblemPreview from "./ProblemPreview";
import type { ProblemCreateHookReturn } from "../hooks/useProblemCreate";

export default function ProblemCreateView(d: ProblemCreateHookReturn) {
	return (
		<TutorLayout>
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
					<S.Step>
						<S.FormGrid>
							<S.FormSection>
								<S.Label>문제 제목 *</S.Label>
								<S.Input
									type="text"
									name="title"
									value={d.formData.title}
									onChange={d.handleInputChange}
									required
									placeholder="문제 제목을 입력하세요"
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
									<S.Label>시간 제한 (초)</S.Label>
									<S.Input
										type="number"
										name="timeLimit"
										value={d.formData.timeLimit}
										onChange={d.handleInputChange}
										min={0}
										step={0.1}
										placeholder="예: 2.0"
									/>
								</S.FormSection>
								<S.FormSection>
									<S.Label>메모리 제한 (MB)</S.Label>
									<S.Input
										type="number"
										name="memoryLimit"
										value={d.formData.memoryLimit}
										onChange={d.handleInputChange}
										min={0}
										placeholder="예: 256"
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
											: "문제 ZIP 파일이 있다면 업로드하세요. 자동으로 내용이 채워집니다."}
									</S.HelpText>
								</S.FileUploadWrapper>
							</S.FormSection>

							<S.FormSection as={S.DescriptionSection}>
								<S.Label>문제 설명 *</S.Label>
								<S.DescriptionEditor>
									<S.EditorWrapper>
										<S.EditorToolbar>
											<S.HeadingSelect
												onChange={(e) => {
													const v = e.target.value;
													if (v) {
														d.applyFormat("formatBlock", v);
														e.target.value = "";
													}
												}}
												title="제목 스타일"
											>
												<option value="">제목 스타일</option>
												<option value="h1">제목 1</option>
												<option value="h2">제목 2</option>
												<option value="h3">제목 3</option>
												<option value="h4">제목 4</option>
												<option value="p">일반 텍스트</option>
											</S.HeadingSelect>
											<S.ToolbarDivider />
											<S.ToolbarButton
												type="button"
												onClick={() => d.applyFormat("bold")}
												title="Bold"
											>
												<strong>B</strong>
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() => d.applyFormat("italic")}
												title="Italic"
											>
												<em>I</em>
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() => d.applyFormat("underline")}
												title="Underline"
											>
												<u>U</u>
											</S.ToolbarButton>
											<S.ToolbarDivider />
											<S.ToolbarButton
												type="button"
												onClick={() => d.applyFormat("insertUnorderedList")}
												title="Bullet List"
											>
												•
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() => d.applyFormat("insertOrderedList")}
												title="Numbered List"
											>
												1.
											</S.ToolbarButton>
											<S.ToolbarDivider />
											<S.ToolbarButton
												type="button"
												onClick={() =>
													d.applyFormat("formatBlock", "blockquote")
												}
												title="Quote"
											>
												"
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() => d.insertText("```\n코드\n```")}
												title="Code Block"
											>
												&lt;&gt;
											</S.ToolbarButton>
											<S.ToolbarDivider />
											<S.HeadingSelect
												onChange={(e) => {
													const v = e.target.value;
													if (v) {
														document.execCommand("fontSize", false, v);
														d.descriptionRef.current?.focus();
														e.target.value = "";
													}
												}}
												title="글자 크기"
											>
												<option value="">글자 크기</option>
												<option value="1">매우 작게</option>
												<option value="2">작게</option>
												<option value="3">보통</option>
												<option value="4">크게</option>
												<option value="5">매우 크게</option>
												<option value="6">아주 크게</option>
												<option value="7">최대 크기</option>
											</S.HeadingSelect>
											<S.ToolbarDivider />
											<S.ColorWrapper>
												<S.ColorLabel
													htmlFor="textColorPicker"
													title="텍스트 색상"
												>
													<FaPalette />
												</S.ColorLabel>
												<S.ColorPicker
													type="color"
													id="textColorPicker"
													onChange={(e) =>
														d.applyFormat("foreColor", e.target.value)
													}
												/>
											</S.ColorWrapper>
											<S.ColorWrapper>
												<S.ColorLabel htmlFor="bgColorPicker" title="배경 색상">
													<FaHighlighter />
												</S.ColorLabel>
												<S.ColorPicker
													type="color"
													id="bgColorPicker"
													onChange={(e) =>
														d.applyFormat("backColor", e.target.value)
													}
												/>
											</S.ColorWrapper>
										</S.EditorToolbar>
										<S.TextEditor
											ref={d.descriptionRef}
											contentEditable
											suppressContentEditableWarning
											data-placeholder="문제 설명을 입력하세요"
											onPaste={(e) => {
												e.preventDefault();
												const clipboardData =
													e.clipboardData || (window as any).clipboardData;
												const paste = clipboardData
													? clipboardData.getData("text")
													: "";
												const selection = window.getSelection();
												if (!selection?.rangeCount) return;
												const range = selection.getRangeAt(0);
												range.deleteContents();
												const textNode = document.createTextNode(paste);
												range.insertNode(textNode);
												range.collapse(false);
												const htmlContent =
													d.descriptionRef.current?.innerHTML || "";
												const textContent =
													d.descriptionRef.current?.textContent ||
													d.descriptionRef.current?.innerText ||
													"";
												d.setFormData((prev) => ({
													...prev,
													description: htmlContent,
													descriptionText: textContent,
												}));
											}}
											onInput={(e) => {
												const target = e.currentTarget;
												const htmlContent = target?.innerHTML || "";
												const textContent =
													target?.textContent || target?.innerText || "";
												d.setFormData((prev) => ({
													...prev,
													description: htmlContent,
													descriptionText: textContent,
												}));
											}}
											onBlur={(e) => {
												const target = e.currentTarget;
												const htmlContent = target?.innerHTML || "";
												const textContent =
													target?.textContent || target?.innerText || "";
												d.setFormData((prev) => ({
													...prev,
													description: htmlContent,
													descriptionText: textContent,
												}));
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													const editor = d.descriptionRef.current;
													if (!editor) return;
													const selection = window.getSelection();
													if (!selection?.rangeCount) return;
													const range = selection.getRangeAt(0);
													let textNode = range.startContainer;
													if (textNode.nodeType !== Node.TEXT_NODE) {
														const walker = document.createTreeWalker(
															textNode,
															NodeFilter.SHOW_TEXT,
															null,
														);
														textNode = walker.nextNode() || textNode;
													}
													if (
														textNode &&
														textNode.nodeType === Node.TEXT_NODE
													) {
														const text = textNode.textContent || "";
														const cursorPos = range.startOffset;
														const lineStart =
															text.lastIndexOf("\n", cursorPos - 1) + 1;
														const lineText = text.substring(
															lineStart,
															cursorPos,
														);
														const headingMatch = lineText
															.trim()
															.match(/^(#{1,6})\s*(.+)$/);
														if (headingMatch) {
															e.preventDefault();
															const hashCount = headingMatch[1].length;
															const titleText = headingMatch[2].trim();
															const headingLevel = Math.min(
																Math.max(hashCount, 1),
																6,
															);
															const headingTag = `h${headingLevel}`;
															const beforeText = text.substring(0, lineStart);
															const afterText = text.substring(cursorPos);
															const parent = textNode.parentNode;
															if (!parent) return;
															if (lineStart > 0) {
																const beforeNode =
																	document.createTextNode(beforeText);
																parent.insertBefore(beforeNode, textNode);
															}
															const headingElement =
																document.createElement(headingTag);
															headingElement.textContent = titleText;
															parent.insertBefore(headingElement, textNode);
															if (afterText.length > 0) {
																const afterNode = document.createTextNode(
																	"\n" + afterText,
																);
																parent.insertBefore(afterNode, textNode);
															}
															parent.removeChild(textNode);
															const newRange = document.createRange();
															const newTextNode =
																parent.childNodes[parent.childNodes.length - 1];
															if (
																newTextNode &&
																newTextNode.nodeType === Node.TEXT_NODE
															) {
																newRange.setStart(newTextNode, 0);
															} else {
																const emptyText = document.createTextNode("");
																parent.appendChild(emptyText);
																newRange.setStart(emptyText, 0);
															}
															newRange.collapse(true);
															selection.removeAllRanges();
															selection.addRange(newRange);
															d.setFormData((prev) => ({
																...prev,
																description: editor.innerHTML,
															}));
															return;
														}
													}
												}
												if (
													(e.ctrlKey || e.metaKey) &&
													e.key === "z" &&
													!e.shiftKey
												) {
													e.preventDefault();
													document.execCommand("undo", false);
												}
												if (
													(e.ctrlKey || e.metaKey) &&
													e.key === "z" &&
													e.shiftKey
												) {
													e.preventDefault();
													document.execCommand("redo", false);
												}
												if ((e.ctrlKey || e.metaKey) && e.key === "y") {
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
