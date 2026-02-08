import type { RefObject, Dispatch, SetStateAction } from "react";
import { FaPalette, FaHighlighter } from "react-icons/fa";
import ProblemPreview from "../ProblemPreview";
import type {
	ProblemListFormData,
	ProblemListEditFormHandlers,
} from "../types";

export interface DescriptionEditorSectionProps {
	descriptionRef: RefObject<HTMLDivElement | null>;
	formData: ProblemListFormData;
	setFormData: Dispatch<SetStateAction<ProblemListFormData>>;
	handlers: Pick<
		ProblemListEditFormHandlers,
		"applyFormat" | "insertText" | "getFullDescription"
	>;
}

/**
 * 편집 폼 - 문제 설명 에디터 (툴바 + contentEditable + 미리보기)
 */
export default function DescriptionEditorSection({
	descriptionRef,
	formData,
	setFormData,
	handlers,
}: DescriptionEditorSectionProps) {
	const { applyFormat, insertText, getFullDescription } = handlers;

	return (
		<div className="problem-create-form-section problem-create-description-section">
			<span
				className="problem-create-label"
				id="problem-list-modal-description-label"
			>
				문제 설명 *
			</span>
			<div
				className="problem-create-description-editor"
				aria-labelledby="problem-list-modal-description-label"
			>
				<div className="problem-create-editor-wrapper">
					<div className="problem-create-editor-toolbar">
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
						<div className="problem-create-toolbar-divider" />
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
						<div className="problem-create-toolbar-divider" />
						<button
							type="button"
							onClick={() => applyFormat("formatBlock", "blockquote")}
							title="Quote"
						>
							&quot;
						</button>
						<button
							type="button"
							onClick={() => insertText("```\n코드\n```")}
							title="Code Block"
						>
							&lt;&gt;
						</button>
						<div className="problem-create-toolbar-divider" />
						<div className="problem-create-color-wrapper">
							<label
								htmlFor="problem-list-modal-textColorPicker"
								className="problem-create-color-label"
								title="텍스트 색상"
							>
								<FaPalette />
							</label>
							<input
								type="color"
								id="problem-list-modal-textColorPicker"
								onChange={(e) => applyFormat("foreColor", e.target.value)}
								className="problem-create-color-picker"
							/>
						</div>
						<div className="problem-create-color-wrapper">
							<label
								htmlFor="problem-list-modal-bgColorPicker"
								className="problem-create-color-label"
								title="배경 색상"
							>
								<FaHighlighter />
							</label>
							<input
								type="color"
								id="problem-list-modal-bgColorPicker"
								onChange={(e) => applyFormat("backColor", e.target.value)}
								className="problem-create-color-picker"
							/>
						</div>
					</div>
					<div
						ref={descriptionRef}
						contentEditable
						className="problem-create-text-editor"
						onInput={(e) => {
							const htmlContent = e.currentTarget?.innerHTML ?? "";
							const textContent =
								e.currentTarget?.textContent ??
								e.currentTarget?.innerText ??
								"";
							setFormData((prev) => ({
								...prev,
								description: htmlContent,
								descriptionText: textContent,
							}));
						}}
						suppressContentEditableWarning
						data-placeholder="문제 설명을 입력하세요"
					/>
				</div>
				<div className="problem-create-preview">
					<div className="problem-create-preview-header">미리보기</div>
					<div className="problem-create-preview-content">
						<ProblemPreview {...getFullDescription()} />
					</div>
				</div>
			</div>
		</div>
	);
}
