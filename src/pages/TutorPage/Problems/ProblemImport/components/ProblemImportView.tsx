import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import TutorLayout from "../../../../../layouts/TutorLayout";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "../styles";
import * as PCS from "../../ProblemCreate/styles";
import ProblemPreview from "../../ProblemCreate/components/ProblemPreview";
import type { useProblemImport } from "../hooks/useProblemImport";
import type { EditableProblem } from "../types";
import type { TestCaseDto } from "../../ProblemCreate/types";

type HookReturn = ReturnType<typeof useProblemImport>;

function parseSampleInputs(json: string | undefined): { input: string; output: string }[] {
	try {
		const arr = json ? JSON.parse(json) : [];
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

function parseTags(json: string | undefined): string[] {
	try {
		const arr = json ? JSON.parse(json) : [];
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

export default function ProblemImportView(d: HookReturn) {
	return (
		<TutorLayout>
			{d.isUploading &&
				createPortal(
					<div
						style={{
							position: "fixed",
							inset: 0,
							backgroundColor: "rgba(0,0,0,0.5)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							zIndex: 99999,
							pointerEvents: "auto",
						}}
					>
						<div
							style={{
								background: "white",
								padding: "2rem",
								borderRadius: "12px",
								boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
							}}
						>
							<LoadingSpinner message="문제 업로드 중..." />
						</div>
					</div>,
					document.body,
				)}

			<S.Container>
				<S.PageHeader>
					<S.PageTitle>문제 가져오기</S.PageTitle>
					<S.BackButton type="button" onClick={d.goBack}>
						← 뒤로
					</S.BackButton>
				</S.PageHeader>

				{d.parseError && <S.ErrorMessage>{d.parseError}</S.ErrorMessage>}

				<S.Layout>
					<S.MainPanel>
						{d.editableProblems.length === 0 ? (
							<S.EmptyState>
								{d.isParsing
									? "ZIP 파일을 파싱하는 중..."
									: "오른쪽에서 ZIP 파일을 선택해 주세요."}
							</S.EmptyState>
						) : !d.selectedProblem ? (
							<S.EmptyState>문제를 선택해 주세요.</S.EmptyState>
						) : (
							<EditForm
								problem={d.selectedProblem}
								onUpdate={(updates) =>
									d.updateProblem(d.selectedIndex, updates)
								}
								onApprove={() => d.toggleApproved(d.selectedIndex)}
								isApproved={d.approvedSet.has(d.selectedIndex)}
							/>
						)}
					</S.MainPanel>

					<S.Sidebar>
						<input
							ref={d.fileInputRef}
							type="file"
							accept=".zip"
							onChange={d.handleFileChange}
							style={{ display: "none" }}
						/>
						<S.FileSelectButton
							type="button"
							onClick={d.selectFile}
							disabled={d.isParsing}
						>
							{d.isParsing ? "파싱 중..." : "ZIP 파일 선택"}
						</S.FileSelectButton>
						{d.zipFile && !d.isParsing && (
							<div style={{ fontSize: "0.85rem", color: "#64748b" }}>
								{d.zipFile.name}
							</div>
						)}

						{d.editableProblems.length > 0 && (
							<>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
									}}
								>
									<span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
										문제 목록
									</span>
									<S.ApproveAllButton
										type="button"
										onClick={d.approveAll}
									>
										전체 승인
									</S.ApproveAllButton>
								</div>
								<S.ProblemList>
									{d.editableProblems.map((p, i) => (
										<S.ProblemListItem
											key={p._index}
											$selected={d.selectedIndex === i}
											onClick={() => d.setSelectedIndex(i)}
										>
											<S.ListCheckbox
												type="checkbox"
												checked={d.approvedSet.has(i)}
												onChange={(e) => {
													e.stopPropagation();
													d.toggleApproved(i);
												}}
											/>
											<S.ListTitle>{p.title || p._filename}</S.ListTitle>
										</S.ProblemListItem>
									))}
								</S.ProblemList>
								<S.UploadButton
									type="button"
									onClick={d.uploadApproved}
									disabled={d.approvedSet.size === 0}
								>
									승인된 문제 업로드 ({d.approvedSet.size}개)
								</S.UploadButton>
							</>
						)}
					</S.Sidebar>
				</S.Layout>
			</S.Container>

			{d.uploadResultModal &&
				createPortal(
					<S.ModalOverlay onClick={() => d.closeResultModal()}>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalTitle $success={d.uploadResultModal.success}>
								{d.uploadResultModal.success ? "업로드 완료" : "업로드 실패"}
							</S.ModalTitle>
							<S.ModalMessage>{d.uploadResultModal.message}</S.ModalMessage>
							<S.ModalButton onClick={() => d.closeResultModal()}>
								확인
							</S.ModalButton>
						</S.ModalContent>
					</S.ModalOverlay>,
					document.body,
				)}
		</TutorLayout>
	);
}

function EditForm({
	problem,
	onUpdate,
	onApprove,
	isApproved,
}: {
	problem: import("../types").EditableProblem;
	onUpdate: (updates: Partial<import("../types").EditableProblem>) => void;
	onApprove: () => void;
	isApproved: boolean;
}) {
	const tags = parseTags(problem.tags);
	const samples = parseSampleInputs(problem.sampleInputs);
	const testcases = problem.testcases ?? [];

	const [currentTag, setCurrentTag] = useState("");
	const [previewMode, setPreviewMode] = useState<"descriptionOnly" | "full">("full");
	const [previewExpanded, setPreviewExpanded] = useState(true);
	const descriptionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = descriptionRef.current;
		if (el && el.innerText !== (problem.description ?? "")) {
			el.innerText = problem.description ?? "";
		}
	}, [problem._index]);

	const syncDescription = useCallback(
		(plain: string) => {
			onUpdate({ description: plain });
		},
		[onUpdate],
	);

	const insertMarkdownText = useCallback(
		(text: string) => {
			const el = descriptionRef.current;
			if (!el) return;
			el.focus();
			document.execCommand("insertText", false, text);
			const plain = el.innerText || el.textContent || "";
			syncDescription(plain);
		},
		[syncDescription],
	);

	const wrapWithMarkdown = useCallback(
		(syntax: string) => {
			const el = descriptionRef.current;
			if (!el) return;
			el.focus();
			const selection = window.getSelection();
			if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
				const selectedText = selection.getRangeAt(0).toString();
				document.execCommand("insertText", false, `${syntax}${selectedText}${syntax}`);
			} else {
				document.execCommand("insertText", false, `${syntax}${syntax}`);
			}
			const plain = el.innerText || el.textContent || "";
			syncDescription(plain);
		},
		[syncDescription],
	);

	const insertMarkdownHeading = useCallback(
		(headingValue: string) => {
			const el = descriptionRef.current;
			if (!el) return;
			el.focus();
			const levelMap: Record<string, string> = {
				h1: "# ",
				h2: "## ",
				h3: "### ",
				h4: "#### ",
				h5: "##### ",
				h6: "###### ",
				p: "",
			};
			const prefix = levelMap[headingValue] ?? "";
			if (prefix) {
				document.execCommand("insertText", false, prefix);
			}
			const plain = el.innerText || el.textContent || "";
			syncDescription(plain);
		},
		[syncDescription],
	);

	const getPreviewProps = useCallback(() => {
		const desc = problem.description ?? "";
		const normalized = desc.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
		const match = normalized.match(/(\n|^)\s*##\s*입력\s*형식\s*[\n\r]/);
		const mainOnly =
			match && match.index != null ? normalized.slice(0, match.index).trim() : desc;
		if (previewMode === "descriptionOnly") {
			return {
				title: problem.title ?? "",
				description: mainOnly,
				inputFormat: "",
				outputFormat: "",
				sampleInputs: [] as { input: string; output: string }[],
			};
		}
		return {
			title: problem.title ?? "",
			description: mainOnly,
			inputFormat: problem.inputFormat ?? "",
			outputFormat: problem.outputFormat ?? "",
			sampleInputs: samples,
		};
	}, [problem, previewMode, samples]);

	const handleTagAdd = useCallback(() => {
		const t = currentTag.trim();
		if (!t) return;
		const next = [...tags, t];
		onUpdate({ tags: JSON.stringify(next) });
		setCurrentTag("");
	}, [currentTag, tags, onUpdate]);

	const handleTagRemove = useCallback(
		(tag: string) => {
			onUpdate({ tags: JSON.stringify(tags.filter((x) => x !== tag)) });
		},
		[tags, onUpdate],
	);

	const handleTagKeyPress = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleTagAdd();
			}
		},
		[handleTagAdd],
	);

	const addSampleInput = useCallback(() => {
		onUpdate({ sampleInputs: JSON.stringify([...samples, { input: "", output: "" }]) });
	}, [samples, onUpdate]);

	const removeSampleInput = useCallback(
		(idx: number) => {
			onUpdate({
				sampleInputs: JSON.stringify(samples.filter((_, i) => i !== idx)),
			});
		},
		[samples, onUpdate],
	);

	const handleSampleInputChange = useCallback(
		(idx: number, field: "input" | "output", value: string) => {
			const next = [...samples];
			next[idx] = { ...next[idx], [field]: value };
			onUpdate({ sampleInputs: JSON.stringify(next) });
		},
		[samples, onUpdate],
	);

	const updateTestCase = useCallback(
		(idx: number, updates: Partial<TestCaseDto>) => {
			const next = testcases.map((tc, i) =>
				i === idx ? { ...tc, ...updates } : tc,
			);
			onUpdate({ testcases: next });
		},
		[testcases, onUpdate],
	);

	const removeTestCase = useCallback(
		(idx: number) => {
			onUpdate({ testcases: testcases.filter((_, i) => i !== idx) });
		},
		[testcases, onUpdate],
	);

	const addTestCase = useCallback(() => {
		onUpdate({
			testcases: [
				...testcases,
				{ name: "1", input: "", output: "", type: "secret" },
			],
		});
	}, [testcases, onUpdate]);

	return (
		<S.PreviewDrawerWrapper>
			<div style={{ flex: 1, minWidth: 0, position: "relative" }}>
				<PCS.FormGrid style={{ minWidth: 0 }}>
				{/* 문제 제목, 난이도, 태그 */}
			<PCS.FormSection>
				<PCS.Label>문제 제목</PCS.Label>
				<PCS.Input
					type="text"
					value={problem.title}
					onChange={(e) => onUpdate({ title: e.target.value })}
					placeholder="문제 제목을 입력하세요"
				/>
			</PCS.FormSection>

			<PCS.FormRow>
				<PCS.FormSection>
					<PCS.Label>난이도</PCS.Label>
					<PCS.Select
						value={problem.difficulty ?? "1"}
						onChange={(e) => onUpdate({ difficulty: e.target.value })}
					>
						<option value="1">Level 1</option>
						<option value="2">Level 2</option>
						<option value="3">Level 3</option>
					</PCS.Select>
				</PCS.FormSection>
				<PCS.FormSection>
					<PCS.Label>태그</PCS.Label>
					<PCS.TagInputWrapper>
						<PCS.Input
							type="text"
							value={currentTag}
							onChange={(e) => setCurrentTag(e.target.value)}
							onKeyDown={handleTagKeyPress}
							placeholder="태그 입력 후 Enter"
						/>
						<PCS.TagAddButton type="button" onClick={handleTagAdd}>
							추가
						</PCS.TagAddButton>
					</PCS.TagInputWrapper>
					<PCS.Tags>
						{tags.map((tag, idx) => (
							<PCS.Tag key={idx}>
								{tag}
								<PCS.TagRemove
									type="button"
									onClick={() => handleTagRemove(tag)}
								>
									×
								</PCS.TagRemove>
							</PCS.Tag>
						))}
					</PCS.Tags>
				</PCS.FormSection>
			</PCS.FormRow>

			{/* 시간 제한, 메모리 제한 */}
			<PCS.FormRow>
				<PCS.FormSection>
					<PCS.Label>시간 제한 (초)</PCS.Label>
					<PCS.Input
						type="number"
						value={problem.timeLimit ?? ""}
						onChange={(e) => onUpdate({ timeLimit: e.target.value })}
						min={0}
						step={0.1}
						placeholder="예: 2.0"
					/>
				</PCS.FormSection>
				<PCS.FormSection>
					<PCS.Label>메모리 제한 (MB)</PCS.Label>
					<PCS.Input
						type="number"
						value={problem.memoryLimit ?? ""}
						onChange={(e) => onUpdate({ memoryLimit: e.target.value })}
						min={0}
						placeholder="예: 256"
					/>
				</PCS.FormSection>
			</PCS.FormRow>

			<PCS.FormSection>
				<PCS.Label
					htmlFor={`import-strict-ws-${problem._index}`}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						cursor: "pointer",
					}}
				>
					<input
						id={`import-strict-ws-${problem._index}`}
						type="checkbox"
						checked={Boolean(problem.strictWhitespaceGrading)}
						onChange={(e) =>
							onUpdate({ strictWhitespaceGrading: e.target.checked })
						}
					/>
					공백·출력 형식 엄격 채점 (별찍기 등)
				</PCS.Label>
				<PCS.HelpText style={{ marginTop: 4 }}>
					Domjudge problem.yaml에 space_change_sensitive를 넣습니다. 문제마다 다르게 설정할 수
					있습니다.
				</PCS.HelpText>
			</PCS.FormSection>

			{/* 문제 설명 */}
			<PCS.FormSection as={PCS.DescriptionSection}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "0.75rem",
						marginBottom: "0.5rem",
					}}
				>
					<PCS.Label>문제 설명</PCS.Label>
					{!previewExpanded && (
						<S.PreviewDrawerToggle
							type="button"
							onClick={() => setPreviewExpanded(true)}
							title="미리보기 펼치기"
						>
							▶ 미리보기
						</S.PreviewDrawerToggle>
					)}
				</div>
				<div
					style={{
						border: "2px solid #e2e8f0",
						borderRadius: 8,
						overflow: "hidden",
					}}
				>
					<PCS.EditorWrapper>
						<PCS.EditorToolbar>
							<PCS.HeadingSelect
								onChange={(e) => {
									const v = e.target.value;
									if (v) {
										insertMarkdownHeading(v);
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
							</PCS.HeadingSelect>
							<PCS.HeadingSelect
								onChange={(e) => {
									const size = e.target.value;
									if (!size) return;
									const el = descriptionRef.current;
									if (!el) {
										e.target.value = "";
										return;
									}
									el.focus();
									const openTag = `<span style="font-size: ${size}">`;
									const closeTag = `</span>`;
									const sel = window.getSelection();
									if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
										const selectedText = sel.getRangeAt(0).toString();
										document.execCommand(
											"insertText",
											false,
											`${openTag}${selectedText}${closeTag}`,
										);
									} else {
										document.execCommand("insertText", false, `${openTag}${closeTag}`);
									}
									const plain = el.innerText || el.textContent || "";
									syncDescription(plain);
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
							</PCS.HeadingSelect>
							<PCS.ToolbarDivider />
							<PCS.ToolbarButton
								type="button"
								onClick={() => wrapWithMarkdown("**")}
								title="Bold (**텍스트**)"
							>
								<strong>B</strong>
							</PCS.ToolbarButton>
							<PCS.ToolbarButton
								type="button"
								onClick={() => wrapWithMarkdown("*")}
								title="Italic (*텍스트*)"
							>
								<em>I</em>
							</PCS.ToolbarButton>
							<PCS.ToolbarButton
								type="button"
								onClick={() => wrapWithMarkdown("`")}
								title="인라인 코드 (`코드`)"
							>
								{"</>"}
							</PCS.ToolbarButton>
							<PCS.ToolbarDivider />
							<PCS.ToolbarButton
								type="button"
								onClick={() => insertMarkdownText("\n- ")}
								title="글머리 기호 목록"
							>
								•
							</PCS.ToolbarButton>
							<PCS.ToolbarButton
								type="button"
								onClick={() => insertMarkdownText("\n1. ")}
								title="번호 매기기 목록"
							>
								1.
							</PCS.ToolbarButton>
							<PCS.ToolbarDivider />
							<PCS.ToolbarButton
								type="button"
								onClick={() => insertMarkdownText("\n> ")}
								title="인용문 (> 텍스트)"
							>
								"
							</PCS.ToolbarButton>
							<PCS.ToolbarButton
								type="button"
								onClick={() => insertMarkdownText("\n```\n코드\n```\n")}
								title="코드 블록"
							>
								&lt;&gt;
							</PCS.ToolbarButton>
							<PCS.ToolbarButton
								type="button"
								onClick={() => insertMarkdownText("\n---\n")}
								title="구분선"
							>
								—
							</PCS.ToolbarButton>
						</PCS.EditorToolbar>
						<PCS.TextEditor
							ref={descriptionRef}
							contentEditable
							suppressContentEditableWarning
							data-placeholder="마크다운으로 문제 설명을 입력하세요 (예: # 제목, **굵게**, \`\`\`코드\`\`\`)"
							onPaste={(e) => {
								e.preventDefault();
								const paste = e.clipboardData?.getData("text") ?? "";
								const selection = window.getSelection();
								if (!selection?.rangeCount) return;
								const range = selection.getRangeAt(0);
								range.deleteContents();
								range.insertNode(document.createTextNode(paste));
								range.collapse(false);
								selection.removeAllRanges();
								selection.addRange(range);
								const plain =
									descriptionRef.current?.innerText ||
									descriptionRef.current?.textContent ||
									"";
								syncDescription(plain);
							}}
							onInput={(e) => {
								const plain =
									e.currentTarget?.innerText || e.currentTarget?.textContent || "";
								syncDescription(plain);
							}}
							onBlur={(e) => {
								const plain =
									e.currentTarget?.innerText || e.currentTarget?.textContent || "";
								syncDescription(plain);
							}}
							onKeyDown={(e) => {
								if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
									e.preventDefault();
									document.execCommand("undo", false);
								}
								if (
									(e.ctrlKey || e.metaKey) &&
									(e.key === "y" || (e.key === "z" && e.shiftKey))
								) {
									e.preventDefault();
									document.execCommand("redo", false);
								}
							}}
						/>
					</PCS.EditorWrapper>
				</div>
			</PCS.FormSection>

			{/* 입력/출력 형식 */}
			<PCS.FormRow>
				<PCS.FormSection>
					<PCS.Label>입력 형식</PCS.Label>
					<PCS.Textarea
						value={problem.inputFormat ?? ""}
						onChange={(e) => onUpdate({ inputFormat: e.target.value })}
						rows={4}
						placeholder="입력 형식을 설명하세요"
					/>
				</PCS.FormSection>
				<PCS.FormSection>
					<PCS.Label>출력 형식</PCS.Label>
					<PCS.Textarea
						value={problem.outputFormat ?? ""}
						onChange={(e) => onUpdate({ outputFormat: e.target.value })}
						rows={4}
						placeholder="출력 형식을 설명하세요"
					/>
				</PCS.FormSection>
			</PCS.FormRow>

			{/* 예제 입출력 (추가/삭제 포함) */}
			<PCS.FormSection>
				<PCS.Label>예제 입출력</PCS.Label>
				{samples.map((sample, idx) => (
					<PCS.SampleItem key={idx}>
						<PCS.SampleItemHeader>
							<span>예제 #{idx + 1}</span>
							{samples.length > 1 && (
								<PCS.SampleRemove
									type="button"
									onClick={() => removeSampleInput(idx)}
								>
									삭제
								</PCS.SampleRemove>
							)}
						</PCS.SampleItemHeader>
						<PCS.SampleGrid>
							<div>
								<PCS.SampleLabel>입력</PCS.SampleLabel>
								<PCS.Textarea
									value={sample.input}
									onChange={(e) =>
										handleSampleInputChange(idx, "input", e.target.value)
									}
									rows={3}
									placeholder="예제 입력"
								/>
							</div>
							<div>
								<PCS.SampleLabel>출력</PCS.SampleLabel>
								<PCS.Textarea
									value={sample.output}
									onChange={(e) =>
										handleSampleInputChange(idx, "output", e.target.value)
									}
									rows={3}
									placeholder="예제 출력"
								/>
							</div>
						</PCS.SampleGrid>
					</PCS.SampleItem>
				))}
				<PCS.AddSampleButton type="button" onClick={addSampleInput}>
					+ 예제 추가
				</PCS.AddSampleButton>
			</PCS.FormSection>

			{/* 테스트케이스 (이름, 타입, 입력, 출력 편집, 삭제) */}
			<PCS.FormSection>
				<PCS.Label>테스트케이스</PCS.Label>
				{testcases.length > 0 ? (
					<PCS.ParsedTestcasesSection>
						<PCS.ParsedTestcases>
							{testcases.map((tc, idx) => (
								<PCS.ParsedTestcaseItem key={idx}>
									<PCS.ParsedTestcaseHeader>
										<span>
											<PCS.Input
												type="text"
												value={tc.name}
												onChange={(e) =>
													updateTestCase(idx, { name: e.target.value })
												}
												placeholder="이름"
												style={{
													width: "120px",
													padding: "0.35rem 0.5rem",
													fontSize: "0.9rem",
												}}
												onClick={(e) => e.stopPropagation()}
											/>
											<select
												value={tc.type ?? "secret"}
												onChange={(e) =>
													updateTestCase(idx, {
														type: e.target.value as "sample" | "secret",
													})
												}
												style={{
													marginLeft: 8,
													padding: "0.35rem 0.5rem",
													borderRadius: 4,
													border: "1px solid #cbd5e1",
													fontSize: "0.85rem",
												}}
											>
												<option value="sample">샘플</option>
												<option value="secret">비밀</option>
											</select>
										</span>
										<PCS.TestcaseRemove
											type="button"
											onClick={() => removeTestCase(idx)}
										>
											×
										</PCS.TestcaseRemove>
									</PCS.ParsedTestcaseHeader>
									<PCS.ParsedTestcaseContent>
										<div>
											<strong>입력:</strong>
											<PCS.Textarea
												value={tc.input ?? ""}
												onChange={(e) =>
													updateTestCase(idx, { input: e.target.value })
												}
												rows={3}
												placeholder="(없음)"
												style={{
													fontFamily: "monospace",
													fontSize: "0.85rem",
													marginTop: 4,
												}}
											/>
										</div>
										<div>
											<strong>출력:</strong>
											<PCS.Textarea
												value={tc.output ?? ""}
												onChange={(e) =>
													updateTestCase(idx, { output: e.target.value })
												}
												rows={3}
												placeholder="(없음)"
												style={{
													fontFamily: "monospace",
													fontSize: "0.85rem",
													marginTop: 4,
												}}
											/>
										</div>
									</PCS.ParsedTestcaseContent>
								</PCS.ParsedTestcaseItem>
							))}
						</PCS.ParsedTestcases>
						<PCS.AddSampleButton
							type="button"
							onClick={addTestCase}
							style={{ marginTop: "0.75rem" }}
						>
							+ 테스트케이스 추가
						</PCS.AddSampleButton>
					</PCS.ParsedTestcasesSection>
				) : (
					<>
						<div style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: 8 }}>
							테스트케이스가 없습니다. 추가해 주세요.
						</div>
						<PCS.AddSampleButton type="button" onClick={addTestCase}>
							+ 테스트케이스 추가
						</PCS.AddSampleButton>
					</>
				)}
			</PCS.FormSection>

			{/* 승인 버튼 */}
			<div style={{ marginTop: "1rem" }}>
				<S.ApproveButton type="button" onClick={onApprove}>
					{isApproved ? "승인 취소" : "승인 ✓"}
				</S.ApproveButton>
			</div>
				</PCS.FormGrid>
			</div>

			{/* 미리보기 패널 (접었다 펼 수 있음) */}
			<S.PreviewDrawer $expanded={previewExpanded}>
				<S.PreviewDrawerInner>
					<S.PreviewDrawerHeader>
						<span style={{ fontWeight: 600, fontSize: "0.9rem" }}>미리보기</span>
						<S.PreviewDrawerClose
							type="button"
							onClick={() => setPreviewExpanded(false)}
							title="미리보기 접기"
						>
							접기 ◀
						</S.PreviewDrawerClose>
					</S.PreviewDrawerHeader>
					<PCS.PreviewHeader style={{ padding: "0.5rem 1rem" }}>
						<PCS.PreviewModeToggle>
							<PCS.PreviewModeButton
								type="button"
								$active={previewMode === "descriptionOnly"}
								onClick={() => setPreviewMode("descriptionOnly")}
							>
								문제 설명만
							</PCS.PreviewModeButton>
							<PCS.PreviewModeButton
								type="button"
								$active={previewMode === "full"}
								onClick={() => setPreviewMode("full")}
							>
								전체
							</PCS.PreviewModeButton>
						</PCS.PreviewModeToggle>
					</PCS.PreviewHeader>
					<PCS.PreviewContent
						style={{ flex: 1, overflowY: "auto", padding: "0 1rem 1rem" }}
					>
						<ProblemPreview
							{...getPreviewProps()}
							descriptionOnly={previewMode === "descriptionOnly"}
						/>
					</PCS.PreviewContent>
				</S.PreviewDrawerInner>
			</S.PreviewDrawer>
		</S.PreviewDrawerWrapper>
	);
}
