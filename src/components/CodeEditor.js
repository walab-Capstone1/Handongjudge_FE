import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import './CodeEditor.css';

const CodeEditor = ({
  language,
  code,
  theme,
  assignmentInfo,
  isSubmitting,
  onCodeChange,
  onSubmit,
  onSubmitWithOutput
}) => {
  const getLanguageExtension = (lang) => {
    switch (lang) {
      case "javascript":
        return [javascript()];
      case "python":
        return [python()];
      case "java":
        return [java()];
      case "cpp":
        return [cpp()];
      default:
        return [javascript()];
    }
  };

  // Custom dark theme for CodeMirror
  const customDarkTheme = EditorView.theme({
    "&": {
      color: "#ffffff !important",
      backgroundColor: "#000000 !important"
    },
    ".cm-content": {
      caretColor: "#ffffff !important",
      color: "#ffffff !important"
    },
    ".cm-line": {
      color: "#ffffff !important"
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#ffffff"
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#0066cc"
    },
    ".cm-activeLine": {
      backgroundColor: "#1a1a1a"
    },
    ".cm-gutters": {
      backgroundColor: "#000000",
      color: "#ffffff",
      border: "none"
    },
    ".cm-lineNumbers .cm-gutterElement": {
      color: "#ffffff"
    },
    ".cm-foldGutter .cm-gutterElement": {
      color: "#ffffff"
    },
    ".cm-tooltip": {
      backgroundColor: "#000000",
      color: "#ffffff",
      border: "1px solid #333"
    },
    // Syntax highlighting colors (all white)
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
    ".cm-formatting-header-6": { color: "#ffffff !important" }
  }, { dark: true });

  return (
    <div className="editor-wrapper">
      <div className="editor-header">
        <span>solution.{language === "javascript" ? "js" : language}</span>
        <div className="editor-header-right">
          {/* Assignment Due Date Info */}
          {(assignmentInfo.dueDate || assignmentInfo.endDate) && (
            <div className="due-date-info-inline">
              <span className="due-date-icon">⏰</span>
              <span className="due-date-text">
                마감: {new Date(assignmentInfo.dueDate || assignmentInfo.endDate).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          <button 
            className="submit-button-inline submit-with-output"
            onClick={onSubmitWithOutput} 
            disabled={isSubmitting}
            title="테스트케이스별 상세 결과를 확인할 수 있습니다"
          >
            {isSubmitting ? "제출 중..." : "출력과 함께 제출"}
          </button>
          <button 
            className="submit-button-inline"
            onClick={onSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "제출 중..." : "제출하기"}
          </button>
        </div>
      </div>
      <div className="editor-scroll-area">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[
            ...getLanguageExtension(language),
            theme === "dark" ? customDarkTheme : []
          ]}
          theme={theme}
          onChange={onCodeChange}
          style={{
            backgroundColor: theme === "dark" ? "#000000" : "#ffffff",
            height: "100%",
            color: theme === "dark" ? "#ffffff" : "#000000"
          }}
          options={{
            theme: theme,
            lineNumbers: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
