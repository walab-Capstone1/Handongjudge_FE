import type React from "react";
import type { RefObject } from "react";
import ReactMarkdown from "react-markdown";
import ProblemPreview from "../ProblemPreview";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditDescriptionSectionProps = Pick<
	ProblemEditHookReturn,
	| "formData"
	| "setFormData"
	| "enableFullEdit"
	| "getFullDescription"
	| "insertMarkdownText"
	| "wrapWithMarkdown"
	| "insertMarkdownHeading"
> & {
	descriptionRef: RefObject<HTMLDivElement | null>;
};

const ProblemEditDescriptionSection: React.FC<
	ProblemEditDescriptionSectionProps
> = ({
	descriptionRef,
	formData,
	setFormData,
	enableFullEdit,
	getFullDescription,
	insertMarkdownText,
	wrapWithMarkdown,
	insertMarkdownHeading,
}) => (
	<S.DescriptionSection>
		<S.Label htmlFor="problem-edit-description">
			문제 설명 {enableFullEdit ? "*" : ""}
		</S.Label>

		{/* 읽기 전용 모드: 마크다운 렌더링 */}
		{!enableFullEdit && (
			<S.DescriptionEditor>
				<S.EditorWrapper
					id="problem-edit-description"
					style={{ background: "#f5f5f5" }}
				>
					<div
						style={{
							padding: "12px",
							minHeight: "300px",
							overflow: "auto",
						}}
					>
						<ReactMarkdown>
							{formData.description || formData.descriptionText || "(문제 설명 없음)"}
						</ReactMarkdown>
					</div>
				</S.EditorWrapper>
				<S.Preview>
					<S.PreviewHeader>미리보기</S.PreviewHeader>
					<S.PreviewContent>
						<ProblemPreview {...getFullDescription()} />
					</S.PreviewContent>
				</S.Preview>
			</S.DescriptionEditor>
		)}

		{/* 편집 모드: 마크다운 에디터 */}
		{enableFullEdit && (
			<S.DescriptionEditor>
				<S.EditorWrapper>
					<S.EditorToolbar>
				<S.Select
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
				</S.Select>
				<S.Select
					onChange={(e) => {
						const size = e.target.value;
						if (!size) return;
						const el = descriptionRef.current;
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
						setFormData((prev) => ({ ...prev, description: plain, descriptionText: plain }));
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
				</S.Select>
					<S.ToolbarDivider />
						<button
							type="button"
							onClick={() => wrapWithMarkdown("**")}
							title="Bold (**텍스트**)"
						>
							<strong>B</strong>
						</button>
						<button
							type="button"
							onClick={() => wrapWithMarkdown("*")}
							title="Italic (*텍스트*)"
						>
							<em>I</em>
						</button>
						<button
							type="button"
							onClick={() => wrapWithMarkdown("`")}
							title="인라인 코드 (`코드`)"
						>
							{"</>"}
						</button>
						<S.ToolbarDivider />
						<button
							type="button"
							onClick={() => insertMarkdownText("\n- ")}
							title="글머리 기호 목록"
						>
							•
						</button>
						<button
							type="button"
							onClick={() => insertMarkdownText("\n1. ")}
							title="번호 매기기 목록"
						>
							1.
						</button>
						<S.ToolbarDivider />
						<button
							type="button"
							onClick={() => insertMarkdownText("\n> ")}
							title="인용문"
						>
							&quot;
						</button>
						<button
							type="button"
							onClick={() => insertMarkdownText("\n```\n코드\n```\n")}
							title="코드 블록"
						>
							&lt;&gt;
						</button>
						<button
							type="button"
							onClick={() => insertMarkdownText("\n---\n")}
							title="구분선"
						>
							—
						</button>
					</S.EditorToolbar>
					<S.TextEditor
						ref={descriptionRef}
						id="problem-edit-description"
						contentEditable
						role="textbox"
						tabIndex={0}
						data-placeholder="마크다운으로 문제 설명을 입력하세요 (예: # 제목, **굵게**, ```코드```)"
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
							setFormData((prev) => ({
								...prev,
								description: plain,
								descriptionText: plain,
							}));
						}}
						onInput={() => {
							const plain =
								descriptionRef.current?.innerText ||
								descriptionRef.current?.textContent ||
								"";
							setFormData((prev) => ({
								...prev,
								description: plain,
								descriptionText: plain,
							}));
						}}
						onBlur={() => {
							const plain =
								descriptionRef.current?.innerText ||
								descriptionRef.current?.textContent ||
								"";
							setFormData((prev) => ({
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
						suppressContentEditableWarning
					/>
				</S.EditorWrapper>
				<S.Preview>
					<S.PreviewHeader>미리보기</S.PreviewHeader>
					<S.PreviewContent>
						<ProblemPreview {...getFullDescription()} />
					</S.PreviewContent>
				</S.Preview>
			</S.DescriptionEditor>
		)}
	</S.DescriptionSection>
);

export default ProblemEditDescriptionSection;
