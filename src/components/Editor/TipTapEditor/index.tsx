import type React from "react";
import { useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { MdImage } from "react-icons/md";
import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";
import "./styles";
import type { TipTapEditorProps, CodeLanguageOption } from "./types";

const CODE_LANGUAGES: CodeLanguageOption[] = [
	{ value: "", label: "언어 선택" },
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "python", label: "Python" },
	{ value: "java", label: "Java" },
	{ value: "cpp", label: "C++" },
	{ value: "c", label: "C" },
	{ value: "csharp", label: "C#" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "json", label: "JSON" },
	{ value: "sql", label: "SQL" },
	{ value: "bash", label: "Bash" },
	{ value: "shell", label: "Shell" },
	{ value: "go", label: "Go" },
	{ value: "rust", label: "Rust" },
	{ value: "php", label: "PHP" },
	{ value: "ruby", label: "Ruby" },
	{ value: "swift", label: "Swift" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "markdown", label: "Markdown" },
	{ value: "yaml", label: "YAML" },
	{ value: "xml", label: "XML" },
];

const TipTapEditor: React.FC<TipTapEditorProps> = ({
	content,
	onChange,
	placeholder = "질문 내용을 자세히 작성해주세요...",
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				codeBlock: false,
				heading: false,
			}),
			TextStyle,
			FontSize,
			CodeBlock.extend({
				addAttributes() {
					return {
						...this.parent?.(),
						language: {
							default: null,
							parseHTML: (element) => element.getAttribute("data-language"),
							renderHTML: (attributes) => {
								if (!attributes.language) return {};
								return {
									"data-language": attributes.language,
								};
							},
						},
					};
				},
			}).configure({
				HTMLAttributes: { class: "code-block" },
			}),
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
			Placeholder.configure({ placeholder }),
		],
		content,
		onUpdate: ({ editor: ed }) => {
			onChange(ed.getHTML());
		},
		onCreate: ({ editor: ed }) => {
			setTimeout(() => {
				try {
					if (ed?.view?.dom) highlightCodeBlocks();
				} catch (err) {
					console.warn("에디터 초기화 중 하이라이팅 실패:", err);
				}
			}, 100);
		},
		editorProps: {
			attributes: { class: "tiptap-editor" },
		},
	});

	const handleFontSizeChange = (fontSize: string) => {
		if (!editor) return;
		if (fontSize === "") {
			editor.chain().focus().unsetFontSize().run();
		} else {
			editor.chain().focus().setFontSize(fontSize).run();
		}
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !editor) return;
		if (!file.type.startsWith("image/")) {
			alert("이미지 파일만 업로드 가능합니다.");
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const src = e.target?.result as string;
			if (src) editor.chain().focus().setImage({ src }).run();
		};
		reader.readAsDataURL(file);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const getCurrentFontSize = () => {
		if (!editor) return "";
		const attrs = editor.getAttributes("textStyle");
		return attrs.fontSize ?? "";
	};

	const getCurrentCodeBlockLanguage = () => {
		if (!editor) return "";
		const attrs = editor.getAttributes("codeBlock");
		return attrs.language ?? "";
	};

	const handleCodeBlockLanguageChange = (language: string) => {
		if (!editor) return;
		try {
			editor
				.chain()
				.focus()
				.updateAttributes("codeBlock", {
					language: language || null,
				})
				.run();
			setTimeout(() => {
				try {
					if (editor?.view?.dom) highlightCodeBlocks();
				} catch (err) {
					console.warn("언어 변경 후 하이라이팅 실패:", err);
				}
			}, 100);
		} catch (err) {
			console.warn("코드 블록 언어 변경 실패:", err);
		}
	};

	const highlightCodeBlocks = useCallback(() => {
		try {
			if (!editor?.view?.dom) return;
			const editorDom = editor.view.dom;
			const editorElement = editorDom.closest(".tiptap-editor-wrapper");
			if (!editorElement) return;
			const codeBlocks = editorElement.querySelectorAll("pre code");
			for (const block of codeBlocks) {
				const preElement = block.closest("pre");
				const language = preElement?.getAttribute("data-language") ?? "";
				block.className = block.className.replace(/hljs-[^\s]+/g, "").trim();
				if (language && hljs.getLanguage(language)) {
					try {
						const highlighted = hljs.highlight(block.textContent ?? "", {
							language,
						});
						block.innerHTML = highlighted.value;
						block.className = `hljs ${language} ${block.className}`.trim();
					} catch (err) {
						console.error("하이라이팅 실패:", err);
					}
				} else if (language) {
					try {
						const highlighted = hljs.highlightAuto(block.textContent ?? "");
						block.innerHTML = highlighted.value;
						block.className = `hljs ${block.className}`.trim();
					} catch (err) {
						console.error("하이라이팅 실패:", err);
					}
				}
			}
		} catch (err) {
			console.warn("코드 블록 하이라이팅 중 오류:", err);
		}
	}, [editor]);

	useEffect(() => {
		if (!editor) return;
		const handleUpdate = () => {
			setTimeout(() => {
				try {
					if (editor?.view?.dom) highlightCodeBlocks();
				} catch (err) {
					console.warn("하이라이팅 업데이트 중 오류:", err);
				}
			}, 10);
		};
		let retryCount = 0;
		const maxRetries = 20;
		const checkAndSetup = () => {
			try {
				if (editor?.view?.dom) {
					editor.on("update", handleUpdate);
					editor.on("selectionUpdate", handleUpdate);
					handleUpdate();
					return;
				}
				if (retryCount < maxRetries) {
					retryCount++;
					setTimeout(checkAndSetup, 50);
				}
			} catch (err) {
				console.warn("에디터 설정 중 오류:", err);
			}
		};
		const timeoutId = setTimeout(checkAndSetup, 100);
		return () => {
			clearTimeout(timeoutId);
			try {
				editor.off("update", handleUpdate);
				editor.off("selectionUpdate", handleUpdate);
			} catch {
				// ignore
			}
		};
	}, [editor, highlightCodeBlocks]);

	if (!editor) return null;

	const isCodeBlockActive = editor.isActive("codeBlock");

	return (
		<div className="tiptap-editor-wrapper">
			<div className="tiptap-toolbar">
				<select
					className="font-size-select"
					value={getCurrentFontSize()}
					onChange={(e) => handleFontSizeChange(e.target.value)}
					title="글자 크기"
					aria-label="글자 크기"
				>
					<option value="">글자 크기</option>
					{[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((n) => (
						<option key={n} value={n}>
							{n}px
						</option>
					))}
				</select>
				<div className="toolbar-divider" />
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive("bold") ? "is-active" : ""}
					title="굵게"
				>
					<strong>B</strong>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive("italic") ? "is-active" : ""}
					title="기울임"
				>
					<em>I</em>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={editor.isActive("code") ? "is-active" : ""}
					title="인라인 코드"
				>
					{"</>"}
				</button>
				<div className="toolbar-divider" />
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "is-active" : ""}
					title="글머리 기호"
				>
					•
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "is-active" : ""}
					title="번호 매기기"
				>
					1.
				</button>
				<div className="toolbar-divider" />
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					className={editor.isActive("codeBlock") ? "is-active" : ""}
					title="코드 블록"
				>
					{"<>"}
				</button>
				{isCodeBlockActive && (
					<select
						className="code-language-select"
						value={getCurrentCodeBlockLanguage()}
						onChange={(e) => handleCodeBlockLanguageChange(e.target.value)}
						title="언어 선택"
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						aria-label="코드 블록 언어"
					>
						{CODE_LANGUAGES.map((lang) => (
							<option key={lang.value} value={lang.value}>
								{lang.label}
							</option>
						))}
					</select>
				)}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={editor.isActive("blockquote") ? "is-active" : ""}
					title="인용"
				>
					"
				</button>
				<div className="toolbar-divider" />
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							fileInputRef.current?.click();
						}
					}}
					title="이미지 삽입"
					aria-label="이미지 삽입"
				>
					<MdImage size={18} />
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={handleImageUpload}
					aria-hidden
				/>
			</div>
			<EditorContent editor={editor} />
		</div>
	);
};

export default TipTapEditor;
