import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { linter, lintGutter } from "@codemirror/lint";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { bracketMatching, foldGutter } from "@codemirror/language";
import './CodeEditor.css';

const CodeEditor = ({
  language,
  code,
  theme,
  assignmentInfo,
  isSubmitting,
  onCodeChange,
  onSubmit,
  onSubmitWithOutput,
  sessionSaveStatus = 'idle',
  onSessionSave,
  codeLoadSource = null,
  sessionCleared = false
}) => {
  // 기본 에디터 확장 기능들
  const getBaseExtensions = () => [
    bracketMatching(),
    foldGutter(),
    lintGutter(),
    autocompletion({
      activateOnTyping: true,
      maxRenderedOptions: 10
    }),
    keymap.of([
      indentWithTab,
      ...completionKeymap
    ])
  ];

  // 간단한 문법 검사기
  const createLinter = (lang) => {
    return linter((view) => {
      try {
        const diagnostics = [];
        const doc = view.state.doc;
        const code = doc.toString();
        const docLength = doc.length;
        
        if (!code || docLength === 0) return diagnostics;
        
        // 전체 문서에서 괄호 매칭 검사 (문자열/주석 제외)
        if (lang === 'javascript' || lang === 'java' || lang === 'cpp' || lang === 'c') {
          const brackets = [];
          const bracketPairs = { '(': ')', '[': ']', '{': '}' };
          const openBrackets = Object.keys(bracketPairs);
          const closeBrackets = Object.values(bracketPairs);
          
          let inString = false;
          let inSingleLineComment = false;
          let inMultiLineComment = false;
          let stringChar = '';
          
          for (let i = 0; i < code.length; i++) {
            const char = code[i];
            const nextChar = i + 1 < code.length ? code[i + 1] : '';
            const prevChar = i > 0 ? code[i - 1] : '';
            
            // 문자열 처리
            if (!inSingleLineComment && !inMultiLineComment) {
              if ((char === '"' || char === "'") && prevChar !== '\\') {
                if (!inString) {
                  inString = true;
                  stringChar = char;
                } else if (char === stringChar) {
                  inString = false;
                  stringChar = '';
                }
                continue;
              }
            }
            
            // 주석 처리
            if (!inString) {
              if (char === '/' && nextChar === '/' && !inMultiLineComment) {
                inSingleLineComment = true;
                continue;
              } else if (char === '/' && nextChar === '*' && !inSingleLineComment) {
                inMultiLineComment = true;
                i++; // '*' 건너뛰기
                continue;
              } else if (char === '*' && nextChar === '/' && inMultiLineComment) {
                inMultiLineComment = false;
                i++; // '/' 건너뛰기
                continue;
              } else if (char === '\n') {
                inSingleLineComment = false;
              }
            }
            
            // 문자열이나 주석 내부가 아닐 때만 괄호 검사
            if (!inString && !inSingleLineComment && !inMultiLineComment) {
              if (openBrackets.includes(char)) {
                brackets.push({ char, pos: i });
              } else if (closeBrackets.includes(char)) {
                const lastOpen = brackets[brackets.length - 1];
                
                if (!lastOpen) {
                  diagnostics.push({
                    from: i,
                    to: i + 1,
                    severity: 'error',
                    message: `매칭되는 여는 괄호가 없습니다: '${char}'`
                  });
                } else if (bracketPairs[lastOpen.char] === char) {
                  brackets.pop();
                } else {
                  diagnostics.push({
                    from: i,
                    to: i + 1,
                    severity: 'error',
                    message: `괄호 타입이 맞지 않습니다. '${lastOpen.char}'에 대응되는 '${bracketPairs[lastOpen.char]}'가 필요합니다`
                  });
                }
              }
            }
          }
          
          // 매칭되지 않은 여는 괄호들
          brackets.forEach(bracket => {
            diagnostics.push({
              from: bracket.pos,
              to: bracket.pos + 1,
              severity: 'error',
              message: `매칭되는 닫는 괄호가 없습니다: '${bracket.char}'`
            });
          });
        }
        
        // CodeMirror의 줄별 접근 방식 사용 (세미콜론 검사용)
        for (let lineNumber = 1; lineNumber <= doc.lines; lineNumber++) {
          try {
            const line = doc.line(lineNumber);
            const lineText = line.text;
            const lineStart = line.from;
            const lineEnd = line.to;
            
            // 기본적인 문법 오류 검사
            if (lang === 'javascript' || lang === 'java' || lang === 'cpp' || lang === 'c') {
              // 줄별 괄호 매칭은 제거 (전체 문서에서 확인하는 것이 더 정확)
              
              // 세미콜론 누락 검사 (간단한 경우만)
              if (lineText.trim().length > 0 && 
                  !lineText.trim().endsWith(';') && 
                  !lineText.trim().endsWith('{') && 
                  !lineText.trim().endsWith('}') &&
                  !lineText.trim().startsWith('//') &&
                  !lineText.trim().startsWith('/*') &&
                  !lineText.trim().startsWith('*') &&
                  !lineText.includes('if') &&
                  !lineText.includes('for') &&
                  !lineText.includes('while') &&
                  !lineText.includes('else') &&
                  !lineText.includes('#include')) {
                
                const from = Math.max(lineEnd - 1, lineStart);
                const to = lineEnd;
                if (from < to && from >= 0 && to <= docLength) {
                  diagnostics.push({
                    from,
                    to,
                    severity: 'info',
                    message: '세미콜론이 누락될 수 있습니다'
                  });
                }
              }
            }
          } catch (lineError) {
            // 개별 줄 처리 에러는 무시하고 계속
            continue;
          }
        }
        
        return diagnostics;
      } catch (error) {
        // 전체 lint 에러 시 빈 배열 반환
        console.warn('Lint error:', error);
        return [];
      }
    });
  };

  const getLanguageExtension = (lang) => {
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
        return [cpp(), ...baseExtensions, linterExtension]; // C also uses cpp extension
      default:
        return [javascript(), ...baseExtensions, linterExtension];
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
    ".cm-lintGutter .cm-gutterElement": {
      color: "#ffffff"
    },
    ".cm-tooltip": {
      backgroundColor: "#000000",
      color: "#ffffff",
      border: "1px solid #333"
    },
    ".cm-lintPoint": {
      position: "relative"
    },
    ".cm-lintPoint:after": {
      content: "",
      position: "absolute",
      bottom: "-2px",
      left: "0",
      right: "0",
      height: "2px",
      background: "red"
    },
    ".cm-diagnostic": {
      backgroundColor: "rgba(255, 0, 0, 0.2)",
      border: "1px solid red"
    },
    ".cm-diagnostic-info": {
      backgroundColor: "rgba(255, 255, 0, 0.2)",
      border: "1px solid yellow"
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
        <div className="editor-header-left">
          <span>solution.{language === "javascript" ? "js" : language === "python" ? "py" : language === "cpp" ? "cpp" : language}</span>
          <div className="session-save-status">
            {/* 코드 로드 소스 표시 */}
            {codeLoadSource && codeLoadSource !== 'default' && (
              <span className={`load-source ${codeLoadSource}`}>
                {codeLoadSource === 'session' && '📁 세션에서 복원'}
                {codeLoadSource === 'backend' && '☁️ 제출 기록에서 복원'}
              </span>
            )}
            
            {/* 세션 저장 상태 표시 */}
            {sessionCleared && (
              <span className="save-status cleared">🗑️ 제출 완료 - 세션 정리됨</span>
            )}
            {!sessionCleared && sessionSaveStatus === 'saving' && (
              <span className="save-status saving">💾 세션 저장 중...</span>
            )}
            {!sessionCleared && sessionSaveStatus === 'saved' && (
              <span className="save-status saved">✅ 세션 저장됨</span>
            )}
            {!sessionCleared && sessionSaveStatus === 'error' && (
              <span className="save-status error">⚠️ 세션 저장 실패</span>
            )}
            
            <span className="shortcut-hint">Ctrl+S로 세션 저장</span>
          </div>
        </div>
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
            {isSubmitting ? "제출 중..." : "테스트하기"}
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
