import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import ReactMarkdown from "react-markdown";
import { EditorView } from "@codemirror/view";
import apiService from "../../services/APIService";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./ProblemSolvePage.css";

const ProblemSolvePage = () => {
  const { assignmentId, problemId, sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [language, setLanguage] = useState("cpp");
  const [theme, setTheme] = useState("dark");
  const [code, setCode] = useState(getDefaultCode("cpp"));
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({
    title: "Loading...",
    description: "Loading..."
  });
  const [isLoading, setIsLoading] = useState(true);
  const [horizontalSizes, setHorizontalSizes] = useState([40, 60]);
  const [verticalSizes, setVerticalSizes] = useState([70, 30]);

  // Load problem information
  useEffect(() => {
    const loadProblemInfo = async () => {
      if (!problemId) {
        return;
      }

      try {
        setIsLoading(true);
        console.log('문제 정보 로드 시작:', { problemId });
        
        const problemInfo = await apiService.getProblemInfo(problemId);
        console.log('문제 정보 로드 성공:', problemInfo);
        
        setCurrentProblem(problemInfo.data || problemInfo);
      } catch (error) {
        console.error('문제 정보 로드 실패:', error);
        setCurrentProblem({ 
          title: "오류", 
          description: "문제를 불러오는데 실패했습니다." 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProblemInfo();
  }, [problemId]);

  // Helper functions
  function getDefaultCode(lang) {
    switch (lang) {
      case "javascript":
        return "function solution() {\n  // 여기에 코드를 작성하세요\n  return;\n}";
      case "python":
        return "def solution():\n    # 여기에 코드를 작성하세요\n    return";
      case "java":
        return "public class Solution {\n    public static void main(String[] args) {\n        // 여기에 코드를 작성하세요\n    }\n}";
      case "cpp":
        return "#include <iostream>\nusing namespace std;\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}";
      default:
        return "// 여기에 코드를 작성하세요\n";
    }
  }

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

  // Event handlers
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert('코드를 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      console.log('코드 제출 시작:', { sectionId, problemId, language });
      
      const submissionResponse = await apiService.submitCode(sectionId, problemId, code, language);
      console.log('코드 제출 응답:', submissionResponse);
      
      if (submissionResponse) {
        const { result, submissionId, submittedAt, language: submittedLanguage } = submissionResponse;
        
        // Result mapping
        const resultMapping = {
          'AC': { status: 'success', message: '정답 (Accepted)', color: '#28a745' },
          'WA': { status: 'error', message: '오답 (Wrong Answer)', color: '#dc3545' },
          'TLE': { status: 'error', message: '시간 초과 (Time Limit Exceeded)', color: '#ffc107' },
          'MLE': { status: 'error', message: '메모리 초과 (Memory Limit Exceeded)', color: '#fd7e14' },
          'RE': { status: 'error', message: '런타임 에러 (Runtime Error)', color: '#e83e8c' },
          'CE': { status: 'error', message: '컴파일 에러 (Compilation Error)', color: '#6f42c1' },
          'PE': { status: 'error', message: '출력 형식 오류 (Presentation Error)', color: '#17a2b8' },
          'NO': { status: 'error', message: '출력 없음 (No Output)', color: '#6c757d' }
        };

        const resultInfo = resultMapping[result] || { 
          status: 'unknown', 
          message: `알 수 없는 결과: ${result}`, 
          color: '#6c757d' 
        };

        setSubmissionResult({
          status: 'completed',
          result: result,
          resultInfo: resultInfo,
          submissionId: submissionId,
          submittedAt: submittedAt,
          language: submittedLanguage,
          code: code
        });
      } else {
        throw new Error('제출 응답을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('코드 제출 실패:', error);
      setSubmissionResult({
        status: 'error',
        message: error.message || '코드 제출에 실패했습니다.',
        resultInfo: { status: 'error', message: '제출 실패', color: '#dc3545' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHorizontalDragEnd = (sizes) => {
    console.log('Horizontal split sizes changed:', sizes);
    setHorizontalSizes(sizes);
  };

  const handleVerticalDragEnd = (sizes) => {
    console.log('Vertical split sizes changed:', sizes);
    setVerticalSizes(sizes);
  };

  const renderGutter = (direction) => {
    return () => ({
      backgroundColor: theme === "dark" ? "#139F59" : "#0969da",
    });
  };

  // Problem description
  const problemDescription = currentProblem.description || `
# ${currentProblem.title}

## 문제 설명
이 문제는 ${currentProblem.title}에 대한 설명입니다.

## 제한사항
- 문제에 대한 제한사항을 확인하세요.

## 입출력 예시
\`\`\`
입력: 예시 입력
출력: 예시 출력
\`\`\`

## 힌트
- 문제 해결을 위한 힌트를 참고하세요.
`;

  // Loading state
  if (isLoading) {
    return (
      <div className={`problem-solve-page ${theme}`}>
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={`problem-solve-page ${theme}`}>
      {/* Header */}
      <div className="problem-solve-header">
        <div className="breadcrumb">
          <span 
            className="breadcrumb-link"
            onClick={() => navigate("/main")}
          >
            A Class
          </span>
          <span> › </span>
          <span 
            className="breadcrumb-link"
            onClick={() => navigate(`/sections/${sectionId}/assignments`)}
          >
            섹션 {sectionId}
          </span>
          <span> › </span>
          <span 
            className="breadcrumb-link"
            onClick={() => navigate(`/sections/${sectionId}/assignments/${assignmentId}/detail`)}
          >
            과제 {assignmentId}
          </span>
          <span> › </span>
          <strong>{currentProblem.title}</strong>
        </div>
        <div className="controls">
          <button 
            className={`theme-button ${theme === "light" ? "active" : ""}`}
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button 
            className={`theme-button ${theme === "dark" ? "active" : ""}`}
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
          <select 
            className="language-select"
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      </div>

      {/* Main Split */}
      <div className="main-split">
        <Split
          sizes={horizontalSizes}
          direction="horizontal"
          minSize={200}
          gutterSize={12}
          gutterStyle={renderGutter("horizontal")}
          onDragEnd={handleHorizontalDragEnd}
          style={{ display: "flex", width: "100%" }}
        >
          {/* Description Area */}
          <div className="description-area">
            <div className="description-header">문제 설명</div>
            <div>
              <ReactMarkdown>{problemDescription}</ReactMarkdown>
            </div>
          </div>

          {/* Editor and Result Split */}
          <Split
            sizes={verticalSizes}
            direction="vertical"
            minSize={100}
            gutterSize={12}
            gutterStyle={renderGutter("vertical")}
            onDragEnd={handleVerticalDragEnd}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Editor Area */}
            <div className="editor-wrapper">
              <div className="editor-header">
                solution.{language === "javascript" ? "js" : language}
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
                  onChange={(value) => setCode(value)}
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

            {/* Result Area */}
            <div className="result-area">
              <div className="result-header">채점 결과</div>
              <div>
                {isSubmitting ? (
                  <div className="result-loading">
                    <LoadingSpinner />
                    <span>제출 중...</span>
                  </div>
                ) : submissionResult ? (
                  <>
                    <div 
                      className={`result-summary ${submissionResult.resultInfo.status === 'error' ? 'error' : ''}`}
                      style={{ color: submissionResult.resultInfo.color }}
                    >
                      <strong>{submissionResult.resultInfo.message}</strong>
                      <br />
                      제출 ID: {submissionResult.submissionId} | 
                      언어: {submissionResult.language} | 
                      제출 시간: {new Date(submissionResult.submittedAt).toLocaleString('ko-KR')}
                    </div>
                    
                    {submissionResult.status === 'error' && (
                      <div className="error-message">
                        <strong>오류:</strong> {submissionResult.message}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ opacity: 0.6 }}>제출 후 결과가 여기에 표시됩니다.</div>
                )}
              </div>
            </div>
          </Split>
        </Split>
      </div>

      {/* Submit Section */}
      <div className="submit-section">
        <button 
          className="submit-button"
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </div>
  );
};

export default ProblemSolvePage;
