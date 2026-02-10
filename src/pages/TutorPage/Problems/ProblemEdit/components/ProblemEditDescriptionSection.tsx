import type React from "react";
import type { RefObject } from "react";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import ProblemPreview from "../ProblemPreview";
import * as S from "../styles";
import type { ProblemEditHookReturn } from "../hooks/useProblemEdit";

type ProblemEditDescriptionSectionProps = Pick<
	ProblemEditHookReturn,
	| "formData"
	| "setFormData"
	| "enableFullEdit"
	| "getFullDescription"
	| "applyFormat"
	| "insertTextAtCursor"
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
	applyFormat,
	insertTextAtCursor,
}) => (
	<S.DescriptionSection>
		<S.Label htmlFor="problem-edit-description">
			문제 설명 {enableFullEdit ? "*" : ""}
		</S.Label>
		{!enableFullEdit && (
			<S.DescriptionEditor>
				<S.EditorWrapper
					id="problem-edit-description"
					style={{ background: "#f5f5f5" }}
				>
					{(() => {
						const desc =
							formData.description ||
							formData.descriptionText ||
							"(문제 설명 없음)";
						const isHtml =
							typeof desc === "string" &&
							desc !== "(문제 설명 없음)" &&
							/<[^>]+>/.test(desc);
						return isHtml ? (
							<div
								style={{
									padding: "12px",
									minHeight: "300px",
									overflow: "auto",
								}}
								dangerouslySetInnerHTML={{
									__html: formData.description || "",
								}}
							/>
						) : (
							<div
								style={{
									padding: "12px",
									minHeight: "300px",
									whiteSpace: "pre-wrap",
									color: "#666",
									overflow: "auto",
								}}
							>
								{formData.descriptionText ||
									formData.description ||
									"(문제 설명 없음)"}
							</div>
						);
					})()}
				</S.EditorWrapper>
				<S.Preview>
					<S.PreviewHeader>미리보기</S.PreviewHeader>
					<S.PreviewContent>
						<ProblemPreview {...getFullDescription()} />
					</S.PreviewContent>
				</S.Preview>
			</S.DescriptionEditor>
		)}
		{enableFullEdit && (
			<S.DescriptionEditor>
				<S.EditorWrapper>
					<S.EditorToolbar>
						<button
							type="button"
							onClick={() => applyFormat("bold")}
							title="Bold"
						>
							<strong>B</strong>
						</button>
						<button
							type="button"
							onClick={() => applyFormat("italic")}
							title="Italic"
						>
							<em>I</em>
						</button>
						<button
							type="button"
							onClick={() => applyFormat("underline")}
							title="Underline"
						>
							<u>U</u>
						</button>
						<S.ToolbarDivider />
						<button
							type="button"
							onClick={() => applyFormat("insertUnorderedList")}
							title="Bullet List"
						>
							•
						</button>
						<button
							type="button"
							onClick={() => applyFormat("insertOrderedList")}
							title="Numbered List"
						>
							1.
						</button>
						<S.ToolbarDivider />
						<button
							type="button"
							onClick={() => applyFormat("formatBlock", "blockquote")}
							title="Quote"
						>
							&quot;
						</button>
						<button
							type="button"
							onClick={() => insertTextAtCursor("```\n코드\n```")}
							title="Code Block"
						>
							&lt;&gt;
						</button>
						<S.ToolbarDivider />
						<S.ColorWrapper>
							<S.ColorLabel htmlFor="textColorPicker" title="텍스트 색상">
								<FaPalette />
							</S.ColorLabel>
							<S.ColorPicker
								type="color"
								id="textColorPicker"
								onChange={(e) => applyFormat("foreColor", e.target.value)}
							/>
						</S.ColorWrapper>
						<S.ColorWrapper>
							<S.ColorLabel htmlFor="bgColorPicker" title="배경 색상">
								<FaHighlighter />
							</S.ColorLabel>
							<S.ColorPicker
								type="color"
								id="bgColorPicker"
								onChange={(e) => applyFormat("backColor", e.target.value)}
							/>
						</S.ColorWrapper>
					</S.EditorToolbar>
					<S.TextEditor
						ref={descriptionRef}
						id="problem-edit-description"
						contentEditable
						role="textbox"
						tabIndex={0}
						data-placeholder="문제 설명을 입력하세요"
						onPaste={(e) => {
							e.preventDefault();
							const paste = (
								e.clipboardData ||
								(
									window as unknown as {
										clipboardData?: DataTransfer;
									}
								).clipboardData
							)?.getData("text");
							const selection = window.getSelection();
							if (!selection?.rangeCount) return;
							const range = selection.getRangeAt(0);
							range.deleteContents();
							const textNode = document.createTextNode(paste ?? "");
							range.insertNode(textNode);
							range.collapse(false);
							const htmlContent = descriptionRef.current?.innerHTML ?? "";
							const textContent =
								descriptionRef.current?.textContent ??
								descriptionRef.current?.innerText ??
								"";
							setFormData((prev) => ({
								...prev,
								description: htmlContent,
								descriptionText: textContent,
							}));
						}}
						onInput={() => {
							const htmlContent = descriptionRef.current?.innerHTML ?? "";
							const textContent =
								descriptionRef.current?.textContent ??
								descriptionRef.current?.innerText ??
								"";
							setFormData((prev) => ({
								...prev,
								description: htmlContent,
								descriptionText: textContent,
							}));
						}}
						onBlur={() => {
							const htmlContent = descriptionRef.current?.innerHTML ?? "";
							const textContent =
								descriptionRef.current?.textContent ??
								descriptionRef.current?.innerText ??
								"";
							setFormData((prev) => ({
								...prev,
								description: htmlContent,
								descriptionText: textContent,
							}));
						}}
						onKeyDown={(e) => {
							if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
								e.preventDefault();
								document.execCommand("undo", false);
							}
							if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
								e.preventDefault();
								document.execCommand("redo", false);
							}
							if ((e.ctrlKey || e.metaKey) && e.key === "y") {
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
