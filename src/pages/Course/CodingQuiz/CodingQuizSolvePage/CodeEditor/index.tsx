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
import { bracketMatching, foldGutter } from "@codemirror/language";
import * as S from "./styles";

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
	onSessionSave?: () => void;
	codeLoadSource?: string | null;
	sessionCleared?: boolean;
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
	codeLoadSource = null,
	sessionCleared = false,
	isDeadlinePassed = false,
	isAssignmentActive = true,
	userRole = null,
}) => {
	// 관리자/튜터는 비활성화된 과제도 제출 가능
	const isManager = userRole === "ADMIN" || userRole === "TUTOR";
	const isSubmitDisabled = isSubmitting || isDeadlinePassed || (!isAssignmentActive && !isManager);
	const disabledReason = isDeadlinePassed
		? "과제 마감일이 지났습니다"
		: !isAssignmentActive && !isManager
			? "과제가 비활성화되었습니다"
			: "";
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

	const customDarkTheme = EditorView.theme(
		{
			"&": {
				color: "#ffffff !important",
				backgroundColor: "#000000 !important",
			},
			".cm-content": {
				caretColor: "#ffffff !important",
				color: "#ffffff !important",
			},
			".cm-line": {
				color: "#ffffff !important",
			},
			"&.cm-focused .cm-cursor": {
				borderLeftColor: "#ffffff",
			},
			"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
				{
					backgroundColor: "#0066cc",
				},
			".cm-activeLine": {
				backgroundColor: "#1a1a1a",
			},
			".cm-gutters": {
				backgroundColor: "#000000",
				color: "#ffffff",
				border: "none",
			},
			".cm-lineNumbers .cm-gutterElement": {
				color: "#ffffff",
			},
			".cm-foldGutter .cm-gutterElement": {
				color: "#ffffff",
			},
			".cm-lintGutter .cm-gutterElement": {
				color: "#ffffff",
			},
			".cm-tooltip": {
				backgroundColor: "#000000",
				color: "#ffffff",
				border: "1px solid #333",
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
			".cm-keyword": { color: "#ffffff !important" },
			".cm-operator": { color: "#ffffff !important" },
			".cm-variable": { color: "#ffffff !important" },
			".cm-variable-2": { color: "#ffffff !important" },
			".cm-variable-3": { color: "#ffffff !important" },
			".cm-property": { color: "#ffffff !important" },
			".cm-definition": { color: "#ffffff !important" },
			".cm-type": { color: "#ffffff !important" },
			".cm-string": { color: "#ffffff !important" },
			".cm-string-2": { color: "#ffffff !important" },
			".cm-number": { color: "#ffffff !important" },
			".cm-comment": { color: "#ffffff !important" },
			".cm-attribute": { color: "#ffffff !important" },
			".cm-meta": { color: "#ffffff !important" },
			".cm-builtin": { color: "#ffffff !important" },
			".cm-tag": { color: "#ffffff !important" },
			".cm-header": { color: "#ffffff !important" },
			".cm-hr": { color: "#ffffff !important" },
			".cm-link": { color: "#ffffff !important" },
			".cm-url": { color: "#ffffff !important" },
			".cm-formatting": { color: "#ffffff !important" },
			".cm-formatting-link": { color: "#ffffff !important" },
			".cm-formatting-list": { color: "#ffffff !important" },
			".cm-formatting-quote": { color: "#ffffff !important" },
			".cm-formatting-strong": { color: "#ffffff !important" },
			".cm-formatting-em": { color: "#ffffff !important" },
			".cm-formatting-header": { color: "#ffffff !important" },
			".cm-formatting-header-1": { color: "#ffffff !important" },
			".cm-formatting-header-2": { color: "#ffffff !important" },
			".cm-formatting-header-3": { color: "#ffffff !important" },
			".cm-formatting-header-4": { color: "#ffffff !important" },
			".cm-formatting-header-5": { color: "#ffffff !important" },
			".cm-formatting-header-6": { color: "#ffffff !important" },
		},
		{ dark: true },
	);

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
							<S.SaveStatus $status="saving">💾 세션 저장 중...</S.SaveStatus>
						)}
						{!sessionCleared && sessionSaveStatus === "saved" && (
							<S.SaveStatus $status="saved">✅ 세션 저장됨</S.SaveStatus>
						)}
						{!sessionCleared && sessionSaveStatus === "error" && (
							<S.SaveStatus $status="error">⚠️ 세션 저장 실패</S.SaveStatus>
						)}

						<S.ShortcutHint>Ctrl+S로 세션 저장</S.ShortcutHint>
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
					<S.SubmitButton
						$variant="test"
						onClick={onSubmitWithOutput}
						disabled={isSubmitDisabled}
						title={
							disabledReason ||
							"테스트케이스별 상세 결과를 확인할 수 있습니다"
						}
					>
						{isSubmitting ? "제출 중..." : "테스트하기"}
					</S.SubmitButton>
					<S.SubmitButton
						onClick={onSubmit}
						disabled={isSubmitDisabled}
						title={disabledReason || "코드를 제출합니다"}
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
						theme === "dark" ? customDarkTheme : [],
					]}
					theme={theme === "dark" ? "dark" : "light"}
					onChange={onCodeChange}
					style={{
						backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
						height: "100%",
						color: theme === "dark" ? "#ffffff" : "#000000",
					}}
				/>
			</S.EditorScrollArea>
		</S.EditorWrapper>
	);
};

export default CodeEditor;
