import type React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import {
	bracketMatching,
	foldGutter,
	HighlightStyle,
	syntaxHighlighting,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import * as S from "./styles";

/** 구두점·연산자 구분이 잘 되도록 한쪽은 회색·한쪽은 청록 톤 */
const READABLE_MONO_FONT =
	'ui-monospace, SFMono-Regular, "SF Mono", Menlo, "Cascadia Mono", "Segoe UI Mono", Consolas, "Liberation Mono", monospace';

const readableDarkHighlight = HighlightStyle.define([
	{ tag: tags.keyword, color: "#c678dd" },
	{ tag: tags.atom, color: "#d19a66" },
	{ tag: tags.bool, color: "#d19a66" },
	{ tag: tags.literal, color: "#56b6c2" },
	{ tag: tags.number, color: "#d19a66" },
	{ tag: tags.comment, color: "#7f848e", fontStyle: "italic" },
	{ tag: tags.lineComment, color: "#7f848e", fontStyle: "italic" },
	{ tag: tags.blockComment, color: "#7f848e", fontStyle: "italic" },
	{ tag: tags.docComment, color: "#7f848e", fontStyle: "italic" },
	{ tag: tags.string, color: "#98c379" },
	{ tag: tags.character, color: "#98c379" },
	{ tag: tags.regexp, color: "#56b6c2" },
	{ tag: tags.tagName, color: "#e06c75" },
	{ tag: tags.attributeName, color: "#d19a66" },
	{ tag: tags.attributeValue, color: "#98c379" },
	{ tag: tags.annotation, color: "#e5c07b" },
	{ tag: tags.variableName, color: "#e06c75" },
	{ tag: tags.propertyName, color: "#e06c75" },
	{ tag: tags.labelName, color: "#e06c75" },
	{ tag: tags.function(tags.variableName), color: "#61afef" },
	{ tag: tags.typeName, color: "#e5c07b" },
	{ tag: tags.namespace, color: "#e5c07b" },
	{ tag: tags.className, color: "#e5c07b" },
	{ tag: tags.macroName, color: "#61afef" },
	{ tag: tags.operator, color: "#56b6c2" },
	{ tag: tags.operatorKeyword, color: "#c678dd" },
	{ tag: tags.bracket, color: "#abb2bf" },
	{ tag: tags.brace, color: "#abb2bf" },
	{ tag: tags.paren, color: "#abb2bf" },
	{ tag: tags.squareBracket, color: "#abb2bf" },
	{ tag: tags.angleBracket, color: "#abb2bf" },
	{ tag: tags.punctuation, color: "#d4d4d8" },
	{ tag: tags.separator, color: "#d4d4d8" },
	{ tag: tags.meta, color: "#abb2bf" },
	{ tag: tags.invalid, color: "#f44747" },
]);

const readableLightHighlight = HighlightStyle.define([
	{ tag: tags.keyword, color: "#a626a4" },
	{ tag: tags.atom, color: "#986801" },
	{ tag: tags.bool, color: "#986801" },
	{ tag: tags.literal, color: "#0184bc" },
	{ tag: tags.number, color: "#986801" },
	{ tag: tags.comment, color: "#a0a1a7", fontStyle: "italic" },
	{ tag: tags.lineComment, color: "#a0a1a7", fontStyle: "italic" },
	{ tag: tags.blockComment, color: "#a0a1a7", fontStyle: "italic" },
	{ tag: tags.docComment, color: "#a0a1a7", fontStyle: "italic" },
	{ tag: tags.string, color: "#50a14f" },
	{ tag: tags.character, color: "#50a14f" },
	{ tag: tags.regexp, color: "#0184bc" },
	{ tag: tags.variableName, color: "#e45649" },
	{ tag: tags.propertyName, color: "#e45649" },
	{ tag: tags.labelName, color: "#e45649" },
	{ tag: tags.function(tags.variableName), color: "#4078f2" },
	{ tag: tags.typeName, color: "#c18401" },
	{ tag: tags.namespace, color: "#c18401" },
	{ tag: tags.className, color: "#c18401" },
	{ tag: tags.operator, color: "#0184bc" },
	{ tag: tags.operatorKeyword, color: "#a626a4" },
	{ tag: tags.bracket, color: "#383a42" },
	{ tag: tags.brace, color: "#383a42" },
	{ tag: tags.paren, color: "#383a42" },
	{ tag: tags.squareBracket, color: "#383a42" },
	{ tag: tags.angleBracket, color: "#383a42" },
	{ tag: tags.punctuation, color: "#24292f" },
	{ tag: tags.separator, color: "#24292f" },
	{ tag: tags.meta, color: "#696c77" },
]);

const editorChromeTheme = EditorView.theme({
	".cm-editor": {
		fontSize: "14px",
		lineHeight: "1.55",
		fontFamily: READABLE_MONO_FONT,
		fontFeatureSettings: '"liga" 0',
	},
	".cm-content": {
		fontFamily: READABLE_MONO_FONT,
	},
});

interface AssignmentInfo {
	dueDate?: string;
	endDate?: string;
}

interface CodeEditorProps {
	language: string;
	code: string;
	theme: "light" | "dark";
	assignmentInfo: any;
	isSubmitting: boolean;
	onCodeChange: (value: string) => void;
	onSubmit: () => void;
	onSubmitWithOutput: () => void;
	sessionSaveStatus?: "idle" | "saving" | "saved" | "error";
	onSessionSave?: (showModal?: boolean) => void;
	onBackendSave?: (showModal?: boolean) => void;
	saveMode?: "session" | "backend";
	codeLoadSource?: string | null;
	sessionCleared?: boolean;
	isEditLocked?: boolean;
	isSaveLocked?: boolean;
	showSaveWarning?: boolean;
	isDeadlinePassed?: boolean;
	isAssignmentActive?: boolean;
	userRole?: string | null;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
	language,
	code,
	theme,
	assignmentInfo,
	isSubmitting,
	onCodeChange,
	onSubmit,
	onSubmitWithOutput,
	sessionSaveStatus = "idle",
	onSessionSave,
	onBackendSave,
	saveMode = "session",
	codeLoadSource = null,
	sessionCleared = false,
	isEditLocked = false,
	isSaveLocked = false,
	showSaveWarning = false,
	isDeadlinePassed = false,
	isAssignmentActive = true,
	userRole = null,
}) => {
	// 관리자/튜터는 비활성화된 과제도 제출 가능; 마감일 지나면 지각 제출 가능(버튼 비활성화 안 함)
	const isManager = userRole === "ADMIN" || userRole === "TUTOR";
	const isSubmitDisabled = isSubmitting || (!isAssignmentActive && !isManager);
	const isActionLocked = isSubmitDisabled || isSaveLocked;
	const disabledReason =
		!isAssignmentActive && !isManager ? "과제가 비활성화되었습니다" : "";
	const lockReason =
		isSaveLocked && !disabledReason
			? "시험이 종료되어 수정/제출할 수 없습니다."
			: disabledReason;
	const getBaseExtensions = () => [
		bracketMatching(),
		foldGutter(),
		lintGutter(),
		autocompletion({
			activateOnTyping: true,
			maxRenderedOptions: 10,
		}),
		keymap.of([indentWithTab, ...completionKeymap]),
	];

	const createLinter = (lang: string) => {
		return linter((view): Diagnostic[] => {
			try {
				const diagnostics: Diagnostic[] = [];
				const doc = view.state.doc;
				const code = doc.toString();
				const docLength = doc.length;

				if (!code || docLength === 0) return diagnostics;

				if (
					lang === "javascript" ||
					lang === "java" ||
					lang === "cpp" ||
					lang === "c"
				) {
					const brackets: Array<{ char: string; pos: number }> = [];
					const bracketPairs: { [key: string]: string } = {
						"(": ")",
						"[": "]",
						"{": "}",
					};
					const openBrackets = Object.keys(bracketPairs);
					const closeBrackets = Object.values(bracketPairs);

					let inString = false;
					let inSingleLineComment = false;
					let inMultiLineComment = false;
					let stringChar = "";

					for (let i = 0; i < code.length; i++) {
						const char = code[i];
						const nextChar = i + 1 < code.length ? code[i + 1] : "";
						const prevChar = i > 0 ? code[i - 1] : "";

						if (!inSingleLineComment && !inMultiLineComment) {
							if ((char === '"' || char === "'") && prevChar !== "\\") {
								if (!inString) {
									inString = true;
									stringChar = char;
								} else if (char === stringChar) {
									inString = false;
									stringChar = "";
								}
								continue;
							}
						}

						if (!inString) {
							if (char === "/" && nextChar === "/" && !inMultiLineComment) {
								inSingleLineComment = true;
								continue;
							} else if (
								char === "/" &&
								nextChar === "*" &&
								!inSingleLineComment
							) {
								inMultiLineComment = true;
								i++;
								continue;
							} else if (
								char === "*" &&
								nextChar === "/" &&
								inMultiLineComment
							) {
								inMultiLineComment = false;
								i++;
								continue;
							} else if (char === "\n") {
								inSingleLineComment = false;
							}
						}

						if (!inString && !inSingleLineComment && !inMultiLineComment) {
							if (openBrackets.includes(char)) {
								brackets.push({ char, pos: i });
							} else if (closeBrackets.includes(char)) {
								const lastOpen = brackets[brackets.length - 1];

								if (!lastOpen) {
									diagnostics.push({
										from: i,
										to: i + 1,
										severity: "error",
										message: `매칭되는 여는 괄호가 없습니다: '${char}'`,
									});
								} else if (bracketPairs[lastOpen.char] === char) {
									brackets.pop();
								} else {
									diagnostics.push({
										from: i,
										to: i + 1,
										severity: "error",
										message: `괄호 타입이 맞지 않습니다. '${lastOpen.char}'에 대응되는 '${bracketPairs[lastOpen.char]}'가 필요합니다`,
									});
								}
							}
						}
					}

					brackets.forEach((bracket) => {
						diagnostics.push({
							from: bracket.pos,
							to: bracket.pos + 1,
							severity: "error",
							message: `매칭되는 닫는 괄호가 없습니다: '${bracket.char}'`,
						});
					});
				}

				for (let lineNumber = 1; lineNumber <= doc.lines; lineNumber++) {
					try {
						const line = doc.line(lineNumber);
						const lineText = line.text;
						const lineStart = line.from;
						const lineEnd = line.to;

						if (
							lang === "javascript" ||
							lang === "java" ||
							lang === "cpp" ||
							lang === "c"
						) {
							if (
								lineText.trim().length > 0 &&
								!lineText.trim().endsWith(";") &&
								!lineText.trim().endsWith("{") &&
								!lineText.trim().endsWith("}") &&
								!lineText.trim().startsWith("//") &&
								!lineText.trim().startsWith("/*") &&
								!lineText.trim().startsWith("*") &&
								!lineText.includes("if") &&
								!lineText.includes("for") &&
								!lineText.includes("while") &&
								!lineText.includes("else") &&
								!lineText.includes("#include")
							) {
								const from = Math.max(lineEnd - 1, lineStart);
								const to = lineEnd;
								if (from < to && from >= 0 && to <= docLength) {
									diagnostics.push({
										from,
										to,
										severity: "info",
										message: "세미콜론이 누락될 수 있습니다",
									});
								}
							}
						}
					} catch (lineError) {
						continue;
					}
				}

				return diagnostics;
			} catch (error) {
				console.warn("Lint error:", error);
				return [];
			}
		});
	};

	const getLanguageExtension = (lang: string) => {
		const baseExtensions = getBaseExtensions();
		const linterExtension = createLinter(lang);

		switch (lang) {
			case "javascript":
				return [javascript(), ...baseExtensions, linterExtension];
			case "python":
				return [python(), ...baseExtensions];
			case "java":
				return [java(), ...baseExtensions, linterExtension];
			case "cpp":
				return [cpp(), ...baseExtensions, linterExtension];
			case "c":
				return [cpp(), ...baseExtensions, linterExtension];
			default:
				return [javascript(), ...baseExtensions, linterExtension];
		}
	};

	const darkChromeTheme = EditorView.theme(
		{
			"&": {
				backgroundColor: "#0d1117",
			},
			".cm-scroller": {
				backgroundColor: "#0d1117",
			},
			"&.cm-focused .cm-cursor": {
				borderLeftColor: "#e6edf3",
			},
			"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
				{
					backgroundColor: "#264f78",
				},
			".cm-activeLine": {
				backgroundColor: "#161b22",
			},
			".cm-gutters": {
				backgroundColor: "#0d1117",
				color: "#6e7681",
				border: "none",
				borderRight: "1px solid #30363d",
			},
			".cm-lineNumbers .cm-gutterElement": {
				color: "#6e7681",
			},
			".cm-foldGutter .cm-gutterElement": {
				color: "#6e7681",
			},
			".cm-lintGutter .cm-gutterElement": {
				color: "#6e7681",
			},
			".cm-tooltip": {
				backgroundColor: "#161b22",
				color: "#e6edf3",
				border: "1px solid #30363d",
			},
			".cm-lintPoint": {
				position: "relative",
			},
			".cm-lintPoint:after": {
				content: "",
				position: "absolute",
				bottom: "-2px",
				left: "0",
				right: "0",
				height: "2px",
				background: "red",
			},
			".cm-diagnostic": {
				backgroundColor: "rgba(255, 0, 0, 0.2)",
				border: "1px solid red",
			},
			".cm-diagnostic-info": {
				backgroundColor: "rgba(255, 255, 0, 0.2)",
				border: "1px solid yellow",
			},
		},
		{ dark: true },
	);

	const lightChromeTheme = EditorView.theme({
		"&": {
			backgroundColor: "#ffffff",
		},
		".cm-scroller": {
			backgroundColor: "#ffffff",
		},
		".cm-gutters": {
			backgroundColor: "#f6f8fa",
			color: "#656d76",
			border: "none",
			borderRight: "1px solid #d0d7de",
		},
		".cm-lineNumbers .cm-gutterElement": {
			color: "#656d76",
		},
		".cm-activeLine": {
			backgroundColor: "#f6f8fa",
		},
	});

	return (
		<S.EditorWrapper>
			<S.EditorHeader>
				<S.EditorHeaderLeft>
					<span>
						solution.
						{language === "javascript"
							? "js"
							: language === "python"
								? "py"
								: language === "cpp"
									? "cpp"
									: language}
					</span>
					<S.SessionSaveStatus>
						{codeLoadSource && codeLoadSource !== "default" && (
							<S.LoadSource $source={codeLoadSource}>
								{codeLoadSource === "session" && "📁 세션에서 복원"}
								{codeLoadSource === "backend" && "☁️ 제출 기록에서 복원"}
							</S.LoadSource>
						)}

						{sessionCleared && (
							<S.SaveStatus $status="cleared">
								🗑️ 제출 완료 - 세션 정리됨
							</S.SaveStatus>
						)}
						{!sessionCleared && sessionSaveStatus === "saving" && (
							<S.SaveStatus $status="saving">
								💾 {saveMode === "backend" ? "저장 중..." : "세션 저장 중..."}
							</S.SaveStatus>
						)}
						{!sessionCleared && sessionSaveStatus === "saved" && (
							<S.SaveStatus $status="saved">
								{saveMode === "backend" ? "저장됨" : "세션 저장됨"}
							</S.SaveStatus>
						)}
						{!sessionCleared && sessionSaveStatus === "error" && (
							<S.SaveStatus $status="error">
								⚠️ {saveMode === "backend" ? "저장 실패" : "세션 저장 실패"}
							</S.SaveStatus>
						)}

					</S.SessionSaveStatus>
				</S.EditorHeaderLeft>
				<S.EditorHeaderRight>
					{(assignmentInfo.dueDate || assignmentInfo.endDate) && (
						<S.DueDateInfo>
							<S.DueDateIcon>⏰</S.DueDateIcon>
							<S.DueDateText>
								마감:{" "}
								{new Date(
									assignmentInfo.dueDate || assignmentInfo.endDate!,
								).toLocaleDateString("ko-KR", {
									month: "short",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</S.DueDateText>
						</S.DueDateInfo>
					)}
					{showSaveWarning && (
						<S.SaveWarning>5분 미만 남음: 저장 후 제출을 확인하세요</S.SaveWarning>
					)}
					{showSaveWarning ? (
						<S.BlinkingSaveButton
							$variant="save"
							onClick={() =>
								saveMode === "backend" ? onBackendSave?.(true) : onSessionSave?.(true)
							}
							disabled={isActionLocked}
							title={lockReason || (saveMode === "backend" ? "백엔드에 저장합니다" : "세션에 저장합니다 (Ctrl+S)")}
						>
							저장하기
						</S.BlinkingSaveButton>
					) : (
						<S.SubmitButton
							$variant="save"
							onClick={() =>
								saveMode === "backend" ? onBackendSave?.(true) : onSessionSave?.(true)
							}
							disabled={isActionLocked}
							title={lockReason || (saveMode === "backend" ? "백엔드에 저장합니다" : "세션에 저장합니다 (Ctrl+S)")}
						>
							저장하기
						</S.SubmitButton>
					)}
					{!showSaveWarning && (
						<S.SaveReminder>저장 후 반드시 제출하세요</S.SaveReminder>
					)}
					<S.SubmitButton
						$variant="test"
						onClick={onSubmitWithOutput}
						disabled={isActionLocked}
						title={
							lockReason ||
							"테스트케이스별 상세 결과를 확인할 수 있습니다"
						}
					>
						{isSubmitting ? "제출 중..." : "테스트하기"}
					</S.SubmitButton>
					<S.SubmitButton
						onClick={onSubmit}
						disabled={isActionLocked}
						title={lockReason || "코드를 제출합니다"}
					>
						{isSubmitting ? "제출 중..." : "제출하기"}
					</S.SubmitButton>
				</S.EditorHeaderRight>
			</S.EditorHeader>
			<S.EditorScrollArea>
				<CodeMirror
					value={code}
					height="100%"
					extensions={[
						...getLanguageExtension(language),
						editorChromeTheme,
						theme === "dark" ? darkChromeTheme : lightChromeTheme,
						syntaxHighlighting(
							theme === "dark"
								? readableDarkHighlight
								: readableLightHighlight,
						),
					]}
					theme={theme === "dark" ? "dark" : "light"}
					onChange={onCodeChange}
					editable={!isEditLocked}
					style={{
						backgroundColor: theme === "dark" ? "#0d1117" : "#ffffff",
						height: "100%",
					}}
				/>
			</S.EditorScrollArea>
		</S.EditorWrapper>
	);
};

export default CodeEditor;
