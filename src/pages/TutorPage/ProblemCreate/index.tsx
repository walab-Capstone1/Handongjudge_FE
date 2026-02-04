import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import * as S from "./styles";
import type { ProblemFormData, SampleInput, ParsedTestcase } from "./types";

interface ProblemPreviewProps {
	title: string;
	description: string;
	inputFormat: string;
	outputFormat: string;
	sampleInputs: SampleInput[];
}

const ProblemPreview: React.FC<ProblemPreviewProps> = ({
	title,
	description,
	inputFormat,
	outputFormat,
	sampleInputs,
}) => {
	const hasContent =
		description ||
		inputFormat ||
		outputFormat ||
		(sampleInputs && sampleInputs.some((s) => s.input || s.output));

	if (!hasContent) {
		return <S.PreviewEmpty>문제 설명을 입력하세요</S.PreviewEmpty>;
	}

	return (
		<S.PreviewWrapper>
			{title && <S.PreviewTitle>{title}</S.PreviewTitle>}
			{description && (
				<S.PreviewDescription
					dangerouslySetInnerHTML={{ __html: description }}
				/>
			)}
			{inputFormat && (
				<S.PreviewSection>
					<S.PreviewH2>입력 형식</S.PreviewH2>
					<S.PreviewContentText>
						{inputFormat.split("\n").map((line, idx) => (
							<S.PreviewParagraph key={idx}>
								{line || "\u00A0"}
							</S.PreviewParagraph>
						))}
					</S.PreviewContentText>
				</S.PreviewSection>
			)}
			{outputFormat && (
				<S.PreviewSection>
					<S.PreviewH2>출력 형식</S.PreviewH2>
					<S.PreviewContentText>
						{outputFormat.split("\n").map((line, idx) => (
							<S.PreviewParagraph key={idx}>
								{line || "\u00A0"}
							</S.PreviewParagraph>
						))}
					</S.PreviewContentText>
				</S.PreviewSection>
			)}
			{sampleInputs &&
				sampleInputs.some((s) => s.input || s.output) && (
					<S.PreviewSection>
						<S.PreviewH2>예제</S.PreviewH2>
						{sampleInputs.map((sample, idx) => {
							if (!sample.input && !sample.output) return null;
							return (
								<S.PreviewExample key={idx}>
									<S.PreviewH3>예제 입력 {idx + 1}</S.PreviewH3>
									<S.PreviewCodeBlock>
										<code>{sample.input || ""}</code>
									</S.PreviewCodeBlock>
									<S.PreviewH3>예제 출력 {idx + 1}</S.PreviewH3>
									<S.PreviewCodeBlock>
										<code>{sample.output || ""}</code>
									</S.PreviewCodeBlock>
								</S.PreviewExample>
							);
						})}
					</S.PreviewSection>
				)}
		</S.PreviewWrapper>
	);
};

const ProblemCreate: React.FC = () => {
	const navigate = useNavigate();
	const [zipFile, setZipFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedTestCases, setParsedTestCases] = useState<ParsedTestcase[]>(
		[],
	);
	const [showParsedTestCases, setShowParsedTestCases] = useState(false);
	const descriptionRef = useRef<HTMLDivElement>(null);

	const [formData, setFormData] = useState<ProblemFormData>({
		title: "",
		description: "",
		descriptionText: "",
		inputFormat: "",
		outputFormat: "",
		tags: [],
		difficulty: "1",
		timeLimit: "",
		memoryLimit: "",
		sampleInputs: [{ input: "", output: "" }],
		testcases: [],
	});
	const [currentTag, setCurrentTag] = useState("");

	useEffect(() => {
		if (descriptionRef.current) {
			const currentContent = descriptionRef.current.innerHTML || "";
			const newContent = formData.description || "";
			if (currentContent !== newContent) {
				descriptionRef.current.innerHTML = newContent;
			}
		}
	}, [formData.description]);

	const convertMarkdownHeadingsToHtml = (html: string): string => {
		if (!html) return html;
		const lines = html.split(/\n/);
		const convertedLines = lines.map((line) => {
			if (line.match(/<[^>]+>/)) return line;
			const trimmedLine = line.trim();
			const headingMatch = trimmedLine.match(/^(#{1,6})\s*(.+)$/);
			if (headingMatch) {
				const hashCount = headingMatch[1].length;
				const titleText = headingMatch[2].trim();
				const headingLevel = Math.min(Math.max(hashCount, 1), 6);
				return `<h${headingLevel}>${titleText}</h${headingLevel}>`;
			}
			return line;
		});
		return convertedLines.join("\n");
	};

	const handleZipFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.name.endsWith(".zip")) {
			setError("ZIP 파일만 업로드 가능합니다.");
			return;
		}
		setZipFile(file);
		setError(null);
		setLoading(true);
		try {
			const fd = new FormData();
			fd.append("zipFile", file);
			const parsedData = await APIService.parseZipFile(fd);
			if (parsedData) {
				if (parsedData.title) {
					setFormData((prev) => ({ ...prev, title: parsedData.title }));
				}
				if (
					parsedData.timeLimit != null &&
					parsedData.timeLimit !== undefined
				) {
					setFormData((prev) => ({
						...prev,
						timeLimit: String(parsedData.timeLimit),
					}));
				}
				if (
					parsedData.memoryLimit != null &&
					parsedData.memoryLimit !== undefined
				) {
					setFormData((prev) => ({
						...prev,
						memoryLimit: String(parsedData.memoryLimit),
					}));
				}
				if (parsedData.description) {
					let processedDescription =
						convertMarkdownHeadingsToHtml(parsedData.description);
					const hasHtmlTags = /<[a-z][\s\S]*>/i.test(
						processedDescription,
					);
					let htmlDescription: string;
					if (hasHtmlTags) {
						htmlDescription = processedDescription;
					} else {
						htmlDescription = processedDescription
							.replace(/\n/g, "<br>")
							.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
							.replace(/\*(.*?)\*/g, "<em>$1</em>");
					}
					setFormData((prev) => ({
						...prev,
						description: htmlDescription,
						descriptionText: parsedData.description,
					}));
					if (descriptionRef.current) {
						descriptionRef.current.innerHTML = htmlDescription;
					}
				}
				const testCases =
					parsedData.testCases || parsedData.testcases || [];
				if (testCases.length > 0) {
					const sampleTestCases = testCases.filter(
						(tc: ParsedTestcase) => tc.type === "sample",
					);
					if (sampleTestCases.length > 0) {
						setFormData((prev) => ({
							...prev,
							sampleInputs: sampleTestCases.map(
								(tc: ParsedTestcase) => ({
									input: tc.input || "",
									output: tc.output || "",
								}),
							),
						}));
					}
					setParsedTestCases(testCases);
				} else {
					setParsedTestCases([]);
				}
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "알 수 없는 오류";
			setError(`ZIP 파일 파싱 중 오류가 발생했습니다: ${message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleTagAdd = () => {
		const tag = currentTag.trim();
		if (tag && !formData.tags.includes(tag)) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, tag],
			}));
			setCurrentTag("");
		}
	};

	const handleTagKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleTagAdd();
		}
	};

	const handleTagRemove = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleSampleInputChange = (
		index: number,
		field: "input" | "output",
		value: string,
	) => {
		const newSamples = [...formData.sampleInputs];
		newSamples[index] = { ...newSamples[index], [field]: value };
		setFormData((prev) => ({ ...prev, sampleInputs: newSamples }));
	};

	const addSampleInput = () => {
		setFormData((prev) => ({
			...prev,
			sampleInputs: [...prev.sampleInputs, { input: "", output: "" }],
		}));
	};

	const removeSampleInput = (index: number) => {
		if (formData.sampleInputs.length > 1) {
			setFormData((prev) => ({
				...prev,
				sampleInputs: prev.sampleInputs.filter((_, i) => i !== index),
			}));
		}
	};

	const handleTestcaseAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files ? Array.from(e.target.files) : [];
		setFormData((prev) => ({
			...prev,
			testcases: [...prev.testcases, ...files],
		}));
	};

	const handleTestcaseRemove = (index: number) => {
		setFormData((prev) => ({
			...prev,
			testcases: prev.testcases.filter((_, i) => i !== index),
		}));
	};

	const applyFormat = (command: string, value?: string) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand(command, false, value ?? undefined);
		}
	};

	const insertText = (text: string) => {
		if (descriptionRef.current) {
			descriptionRef.current.focus();
			document.execCommand("insertText", false, text);
		}
	};

	const getFullDescription = () => ({
		title: formData.title,
		description: formData.description || "",
		inputFormat: formData.inputFormat,
		outputFormat: formData.outputFormat,
		sampleInputs: formData.sampleInputs,
	});

	const getFullDescriptionForBackend = (): string => {
		let full = formData.descriptionText || "";
		if (formData.inputFormat) {
			full += "\n\n## 입력 형식\n" + formData.inputFormat;
		}
		if (formData.outputFormat) {
			full += "\n\n## 출력 형식\n" + formData.outputFormat;
		}
		if (formData.sampleInputs.some((s) => s.input || s.output)) {
			full += "\n\n## 예제";
			formData.sampleInputs.forEach((sample, idx) => {
				if (sample.input || sample.output) {
					full += `\n\n### 예제 입력 ${idx + 1}\n\`\`\`\n${sample.input}\n\`\`\``;
					full += `\n\n### 예제 출력 ${idx + 1}\n\`\`\`\n${sample.output}\n\`\`\``;
				}
			});
		}
		return full;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const submitFormData = new FormData();
			submitFormData.append("title", formData.title);
			submitFormData.append(
				"description",
				getFullDescriptionForBackend(),
			);
			submitFormData.append("inputFormat", formData.inputFormat);
			submitFormData.append("outputFormat", formData.outputFormat);
			submitFormData.append("tags", JSON.stringify(formData.tags));
			submitFormData.append("difficulty", formData.difficulty);
			submitFormData.append("timeLimit", formData.timeLimit || "0");
			submitFormData.append("memoryLimit", formData.memoryLimit || "0");
			submitFormData.append(
				"sampleInputs",
				JSON.stringify(formData.sampleInputs),
			);

			let testcaseIndex = 0;
			parsedTestCases.forEach((testcase) => {
				const baseName = testcase.name || `testcase_${testcaseIndex}`;
				if (testcase.input) {
					const inputBlob = new Blob([testcase.input], {
						type: "text/plain",
					});
					const inputFile = new File(
						[inputBlob],
						`${baseName}.in`,
						{ type: "text/plain" },
					);
					submitFormData.append(
						`testcase_${testcaseIndex}`,
						inputFile,
					);
					testcaseIndex++;
				}
				if (testcase.output) {
					const outputBlob = new Blob([testcase.output], {
						type: "text/plain",
					});
					const outputFile = new File(
						[outputBlob],
						`${baseName}.ans`,
						{ type: "text/plain" },
					);
					submitFormData.append(
						`testcase_${testcaseIndex}`,
						outputFile,
					);
					testcaseIndex++;
				}
			});
			formData.testcases.forEach((file) => {
				submitFormData.append(`testcase_${testcaseIndex}`, file);
				testcaseIndex++;
			});

			await APIService.createProblem(submitFormData);
			alert("문제가 성공적으로 생성되었습니다.");
			navigate("/tutor/problems");
		} catch (err) {
			console.error("문제 생성 실패:", err);
			setError("문제 생성 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<TutorLayout>
			<S.Container>
				<S.PageHeader>
					<S.PageTitle>새 문제 만들기</S.PageTitle>
					<S.CancelHeaderButton
						type="button"
						onClick={() => navigate("/tutor/problems")}
					>
						취소
					</S.CancelHeaderButton>
				</S.PageHeader>

				{error && <S.ErrorMessage>{error}</S.ErrorMessage>}

				<S.Form onSubmit={handleSubmit}>
					<S.Step>
						<S.FormGrid>
							<S.FormSection>
								<S.Label>문제 제목 *</S.Label>
								<S.Input
									type="text"
									name="title"
									value={formData.title}
									onChange={handleInputChange}
									required
									placeholder="문제 제목을 입력하세요"
								/>
							</S.FormSection>

							<S.FormRow>
								<S.FormSection>
									<S.Label>난이도 *</S.Label>
									<S.Select
										name="difficulty"
										value={formData.difficulty}
										onChange={handleInputChange}
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
											value={currentTag}
											onChange={(e) =>
												setCurrentTag(e.target.value)
											}
											onKeyDown={handleTagKeyPress}
											placeholder="태그 입력 후 Enter"
										/>
										<S.TagAddButton
											type="button"
											onClick={handleTagAdd}
										>
											추가
										</S.TagAddButton>
									</S.TagInputWrapper>
									<S.Tags>
										{formData.tags.map((tag, idx) => (
											<S.Tag key={idx}>
												{tag}
												<S.TagRemove
													type="button"
													onClick={() =>
														handleTagRemove(tag)
													}
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
										value={formData.timeLimit}
										onChange={handleInputChange}
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
										value={formData.memoryLimit}
										onChange={handleInputChange}
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
										onChange={handleZipFileChange}
										disabled={loading}
									/>
									<S.FileRow>
										<S.FileLabelInline htmlFor="zipFileInput">
											{loading
												? "파싱 중..."
												: zipFile
													? `✓ ${zipFile.name}`
													: "ZIP 파일 선택"}
										</S.FileLabelInline>
										{zipFile && !loading && (
											<S.RemoveZipButton
												type="button"
												onClick={() => {
													setZipFile(null);
													setParsedTestCases([]);
													const el = document.getElementById(
														"zipFileInput",
													) as HTMLInputElement;
													if (el) el.value = "";
												}}
												title="ZIP 파일 제거"
											>
												×
											</S.RemoveZipButton>
										)}
									</S.FileRow>
									<S.HelpText>
										{loading
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
														applyFormat(
															"formatBlock",
															v,
														);
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
												onClick={() =>
													applyFormat("bold")}
												title="Bold"
											>
												<strong>B</strong>
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() =>
													applyFormat("italic")}
												title="Italic"
											>
												<em>I</em>
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() =>
													applyFormat("underline")}
												title="Underline"
											>
												<u>U</u>
											</S.ToolbarButton>
											<S.ToolbarDivider />
											<S.ToolbarButton
												type="button"
												onClick={() =>
													applyFormat(
														"insertUnorderedList",
													)}
												title="Bullet List"
											>
												•
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() =>
													applyFormat(
														"insertOrderedList",
													)}
												title="Numbered List"
											>
												1.
											</S.ToolbarButton>
											<S.ToolbarDivider />
											<S.ToolbarButton
												type="button"
												onClick={() =>
													applyFormat(
														"formatBlock",
														"blockquote",
													)}
												title="Quote"
											>
												"
											</S.ToolbarButton>
											<S.ToolbarButton
												type="button"
												onClick={() =>
													insertText(
														"```\n코드\n```",
													)}
												title="Code Block"
											>
												&lt;&gt;
											</S.ToolbarButton>
											<S.ToolbarDivider />
											<S.HeadingSelect
												onChange={(e) => {
													const v = e.target.value;
													if (v) {
														document.execCommand(
															"fontSize",
															false,
															v,
														);
														descriptionRef.current?.focus();
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
														applyFormat(
															"foreColor",
															e.target.value,
														)}
												/>
											</S.ColorWrapper>
											<S.ColorWrapper>
												<S.ColorLabel
													htmlFor="bgColorPicker"
													title="배경 색상"
												>
													<FaHighlighter />
												</S.ColorLabel>
												<S.ColorPicker
													type="color"
													id="bgColorPicker"
													onChange={(e) =>
														applyFormat(
															"backColor",
															e.target.value,
														)}
												/>
											</S.ColorWrapper>
										</S.EditorToolbar>
										<S.TextEditor
											ref={descriptionRef}
											contentEditable
											suppressContentEditableWarning
											data-placeholder="문제 설명을 입력하세요"
											onPaste={(e) => {
												e.preventDefault();
												const clipboardData =
													e.clipboardData ||
													(window as any).clipboardData;
												const paste = clipboardData
													? clipboardData.getData(
															"text",
														)
													: "";
												const selection =
													window.getSelection();
												if (!selection?.rangeCount)
													return;
												const range =
													selection.getRangeAt(0);
												range.deleteContents();
												const textNode =
													document.createTextNode(
														paste,
													);
												range.insertNode(textNode);
												range.collapse(false);
												const htmlContent =
													descriptionRef.current?.innerHTML ||
													"";
												const textContent =
													descriptionRef.current?.textContent ||
													descriptionRef.current?.innerText ||
													"";
												setFormData((prev) => ({
													...prev,
													description: htmlContent,
													descriptionText: textContent,
												}));
											}}
											onInput={(e) => {
												const target =
													e.currentTarget;
												const htmlContent =
													target?.innerHTML || "";
												const textContent =
													target?.textContent ||
													target?.innerText ||
													"";
												setFormData((prev) => ({
													...prev,
													description: htmlContent,
													descriptionText: textContent,
												}));
											}}
											onBlur={(e) => {
												const target =
													e.currentTarget;
												const htmlContent =
													target?.innerHTML || "";
												const textContent =
													target?.textContent ||
													target?.innerText ||
													"";
												setFormData((prev) => ({
													...prev,
													description: htmlContent,
													descriptionText: textContent,
												}));
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													const editor =
														descriptionRef.current;
													if (!editor) return;
													const selection =
														window.getSelection();
													if (
														!selection?.rangeCount
													)
														return;
													const range =
														selection.getRangeAt(0);
													let textNode =
														range.startContainer;
													if (
														textNode.nodeType !==
														Node.TEXT_NODE
													) {
														const walker =
															document.createTreeWalker(
																textNode,
																NodeFilter.SHOW_TEXT,
																null,
															);
														textNode =
															walker.nextNode() ||
															textNode;
													}
													if (
														textNode &&
														textNode.nodeType ===
															Node.TEXT_NODE
													) {
														const text =
															textNode.textContent ||
															"";
														const cursorPos =
															range.startOffset;
														const lineStart =
															text.lastIndexOf(
																"\n",
																cursorPos - 1,
															) + 1;
														const lineText = text.substring(
															lineStart,
															cursorPos,
														);
														const headingMatch =
															lineText
																.trim()
																.match(
																	/^(#{1,6})\s*(.+)$/,
																);
														if (headingMatch) {
															e.preventDefault();
															const hashCount =
																headingMatch[1]
																	.length;
															const titleText =
																headingMatch[2].trim();
															const headingLevel =
																Math.min(
																	Math.max(
																		hashCount,
																		1,
																	),
																	6,
																);
															const headingTag = `h${headingLevel}`;
															const beforeText =
																text.substring(
																	0,
																	lineStart,
																);
															const afterText =
																text.substring(
																	cursorPos,
																);
															const parent =
																textNode.parentNode;
															if (!parent) return;
															if (lineStart > 0) {
																const beforeNode =
																	document.createTextNode(
																		beforeText,
																	);
																parent.insertBefore(
																	beforeNode,
																	textNode,
																);
															}
															const headingElement =
																document.createElement(
																	headingTag,
																);
															headingElement.textContent =
																titleText;
															parent.insertBefore(
																headingElement,
																textNode,
															);
															if (
																afterText.length >
																0
															) {
																const afterNode =
																	document.createTextNode(
																		"\n" +
																			afterText,
																	);
																parent.insertBefore(
																	afterNode,
																	textNode,
																);
															}
															parent.removeChild(
																textNode,
															);
															const newRange =
																document.createRange();
															const newTextNode =
																parent.childNodes[
																	parent
																		.childNodes
																		.length - 1
																];
															if (
																newTextNode &&
																newTextNode.nodeType ===
																	Node.TEXT_NODE
															) {
																newRange.setStart(
																	newTextNode,
																	0,
																);
															} else {
																const emptyText =
																	document.createTextNode(
																		"",
																	);
																parent.appendChild(
																	emptyText,
																);
																newRange.setStart(
																	emptyText,
																	0,
																);
															}
															newRange.collapse(
																true,
															);
															selection.removeAllRanges();
															selection.addRange(
																newRange,
															);
															setFormData(
																(prev) => ({
																	...prev,
																	description:
																		editor.innerHTML,
																}),
															);
															return;
														}
													}
												}
												if (
													(e.ctrlKey ||
														e.metaKey) &&
													e.key === "z" &&
													!e.shiftKey
												) {
													e.preventDefault();
													document.execCommand(
														"undo",
														false,
													);
												}
												if (
													(e.ctrlKey ||
														e.metaKey) &&
													e.key === "z" &&
													e.shiftKey
												) {
													e.preventDefault();
													document.execCommand(
														"redo",
														false,
													);
												}
												if (
													(e.ctrlKey ||
														e.metaKey) &&
													e.key === "y"
												) {
													e.preventDefault();
													document.execCommand(
														"redo",
														false,
													);
												}
											}}
										/>
									</S.EditorWrapper>
									<S.Preview>
										<S.PreviewHeader>미리보기</S.PreviewHeader>
										<S.PreviewContent>
											<ProblemPreview
												{...getFullDescription()}
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
										value={formData.inputFormat}
										onChange={handleInputChange}
										rows={4}
										placeholder="입력 형식을 설명하세요"
									/>
								</S.FormSection>
								<S.FormSection>
									<S.Label>출력 형식</S.Label>
									<S.Textarea
										name="outputFormat"
										value={formData.outputFormat}
										onChange={handleInputChange}
										rows={4}
										placeholder="출력 형식을 설명하세요"
									/>
								</S.FormSection>
							</S.FormRow>

							<S.FormSection>
								<S.Label>예제 입출력</S.Label>
								{formData.sampleInputs.map((sample, idx) => (
									<S.SampleItem key={idx}>
										<S.SampleItemHeader>
											<span>예제 #{idx + 1}</span>
											{formData.sampleInputs.length >
												1 && (
												<S.SampleRemove
													type="button"
													onClick={() =>
														removeSampleInput(idx)
													}
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
														handleSampleInputChange(
															idx,
															"input",
															e.target.value,
														)}
													rows={3}
													placeholder="예제 입력"
												/>
											</div>
											<div>
												<S.SampleLabel>출력</S.SampleLabel>
												<S.Textarea
													value={sample.output}
													onChange={(e) =>
														handleSampleInputChange(
															idx,
															"output",
															e.target.value,
														)}
													rows={3}
													placeholder="예제 출력"
												/>
											</div>
										</S.SampleGrid>
									</S.SampleItem>
								))}
								<S.AddSampleButton
									type="button"
									onClick={addSampleInput}
								>
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
										onChange={handleTestcaseAdd}
									/>
									<S.FileLabelInline htmlFor="testcaseInput">
										파일 선택
									</S.FileLabelInline>
									<S.HelpText>
										테스트케이스 입력(.in) 및 출력(.ans) 파일
									</S.HelpText>
								</S.FileUploadWrapper>
								<S.TestcaseList>
									{formData.testcases.map((file, idx) => (
										<S.TestcaseItem key={idx}>
											<span>{file.name}</span>
											<S.TestcaseRemove
												type="button"
												onClick={() =>
													handleTestcaseRemove(idx)
												}
											>
												×
											</S.TestcaseRemove>
										</S.TestcaseItem>
									))}
								</S.TestcaseList>

								{parsedTestCases.length > 0 && (
									<S.ParsedTestcasesSection>
										<S.ParsedTestcasesToggle
											type="button"
											onClick={() =>
												setShowParsedTestCases(
													!showParsedTestCases,
												)
											}
										>
											<S.ParsedTestcasesToggleIcon>
												{showParsedTestCases
													? "▼"
													: "▶"}
											</S.ParsedTestcasesToggleIcon>
											<span>
												ZIP 파일에서 발견된 테스트케이스 (
												{parsedTestCases.length}개)
											</span>
										</S.ParsedTestcasesToggle>
										{showParsedTestCases && (
											<S.ParsedTestcases>
												{parsedTestCases.map(
													(testCase, idx) => (
														<S.ParsedTestcaseItem
															key={idx}
														>
															<S.ParsedTestcaseHeader>
																<span>
																	<strong>
																		{testCase.name}
																	</strong>{" "}
																	(
																	{testCase.type ===
																	"sample"
																		? "샘플"
																		: "비밀"}
																	)
																</span>
															</S.ParsedTestcaseHeader>
															<S.ParsedTestcaseContent>
																<div>
																	<strong>
																		입력:
																	</strong>
																	<pre>
																		{testCase.input ||
																			"(없음)"}
																	</pre>
																</div>
																<div>
																	<strong>
																		출력:
																	</strong>
																	<pre>
																		{testCase.output ||
																			"(없음)"}
																	</pre>
																</div>
															</S.ParsedTestcaseContent>
														</S.ParsedTestcaseItem>
													),
												)}
												<S.HelpText>
													이 테스트케이스들은 ZIP
													파일에 포함되어 있습니다.
													문제 생성 시 자동으로
													포함됩니다.
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
								onClick={() => navigate("/tutor/problems")}
								disabled={loading}
							>
								취소
							</S.CancelButton>
							<S.SubmitButton type="submit" disabled={loading}>
								{loading ? "생성 중..." : "문제 생성"}
							</S.SubmitButton>
						</S.Actions>
					</S.Step>
				</S.Form>
			</S.Container>
		</TutorLayout>
	);
};

export default ProblemCreate;
