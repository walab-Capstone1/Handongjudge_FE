import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
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
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState(getDefaultCode("cpp"));
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({
    title: "Loading...",
    description: "Loading..."
  });
  const [sectionInfo, setSectionInfo] = useState({
    courseTitle: "Loading...",
    sectionNumber: 0,
    instructorName: "Loading..."
  });
  const [assignmentInfo, setAssignmentInfo] = useState({
    title: "Loading...",
    assignmentNumber: "",
    dueDate: null,
    endDate: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [horizontalSizes, setHorizontalSizes] = useState([40, 60]);
  const [verticalSizes, setVerticalSizes] = useState([70, 30]);

  // Load problem, section, assignment information
  useEffect(() => {
    const loadAllInfo = async () => {
      if (!problemId || !sectionId || !assignmentId) {
        return;
      }

      try {
        setIsLoading(true);
        console.log('정보 로드 시작:', { problemId, sectionId, assignmentId });
        
        // 병렬로 모든 정보 조회
        const [problemInfo, sectionInfoRes, assignmentInfoRes] = await Promise.all([
          apiService.getProblemInfo(problemId),
          apiService.getSectionInfo(sectionId),
          apiService.getAssignmentInfo(sectionId, assignmentId)
        ]);
        
        console.log('문제 정보 로드 성공:', problemInfo);
        console.log('섹션 정보 로드 성공:', sectionInfoRes);
        console.log('과제 정보 로드 성공:', assignmentInfoRes);
        
        const problemData = problemInfo.data || problemInfo;
        const sectionData = sectionInfoRes.data || sectionInfoRes;
        const assignmentData = assignmentInfoRes.data || assignmentInfoRes;
        
        console.log('🔍 문제 데이터 상세:', problemData);
        console.log('🔍 timeLimit 값:', problemData.timeLimit);
        console.log('🔍 memoryLimit 값:', problemData.memoryLimit);
        
        console.log('🔍 섹션 데이터 상세:', sectionData);
        console.log('🔍 과제 데이터 상세:', assignmentData);
        console.log('🔍 과제 마감일 확인:', assignmentData.dueDate);
        
        const problemWithLimits = {
          ...problemData
        };
        setCurrentProblem(problemWithLimits);
        setSectionInfo(sectionData);
        setAssignmentInfo(assignmentData);
      } catch (error) {
        console.error('정보 로드 실패:', error);
        setCurrentProblem({ 
          title: "오류", 
          description: "문제를 불러오는데 실패했습니다." 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllInfo();
  }, [problemId, sectionId, assignmentId]);

  // Helper functions
  // 마감일 체크 함수 제거 - 항상 제출 가능하도록 변경

  const getTestcaseResultText = (result) => {
    const resultTexts = {
      'correct': '정답',
      'wrong-answer': '오답',
      'timelimit': '시간 초과',
      'memory-limit': '메모리 초과',
      'run-error': '런타임 에러',
      'compiler-error': '컴파일 에러',
      'presentation-error': '출력 형식 오류',
      'no-output': '출력 없음',
      null: '미실행'
    };
    return resultTexts[result] || '알 수 없음';
  };

  const formatMemory = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

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
          code: code,
          type: 'judge' // 채점 결과임을 표시
        });
      } else {
        throw new Error('제출 응답을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('코드 제출 실패:', error);
      setSubmissionResult({
        status: 'error',
        message: error.message || '코드 제출에 실패했습니다.',
        resultInfo: { status: 'error', message: '제출 실패', color: '#dc3545' },
        type: 'judge'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithOutput = async () => {
    if (!code.trim()) {
      alert('코드를 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      console.log('코드 제출 및 아웃풋 요청 시작:', { sectionId, problemId, language });
      
      const submissionResponse = await apiService.submitCodeAndGetOutput(sectionId, problemId, code, language);
      console.log('코드 제출 및 아웃풋 응답:', submissionResponse);
      
      if (submissionResponse) {
        const { result, submissionId, submittedAt, language: submittedLanguage, outputList } = submissionResponse;
        
        // Result mapping
        const resultMapping = {
          'correct': { status: 'success', message: '정답 (Accepted)', color: '#28a745' },
          'wrong-answer': { status: 'error', message: '오답 (Wrong Answer)', color: '#dc3545' },
          'timelimit': { status: 'error', message: '시간 초과 (Time Limit Exceeded)', color: '#ffc107' },
          'memory-limit': { status: 'error', message: '메모리 초과 (Memory Limit Exceeded)', color: '#fd7e14' },
          'run-error': { status: 'error', message: '런타임 에러 (Runtime Error)', color: '#e83e8c' },
          'compiler-error': { status: 'error', message: '컴파일 에러 (Compilation Error)', color: '#6f42c1' },
          'presentation-error': { status: 'error', message: '출력 형식 오류 (Presentation Error)', color: '#17a2b8' },
          'no-output': { status: 'error', message: '출력 없음 (No Output)', color: '#6c757d' },
          // 기존 형식도 지원
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
          code: code,
          outputList: outputList, // outputList 정보 저장
          type: 'output' // 아웃풋 결과임을 표시
        });
      } else {
        throw new Error('제출 응답을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('코드 제출 및 아웃풋 요청 실패:', error);
      
      setSubmissionResult({
        status: 'error',
        message: error.message || '코드 제출에 실패했습니다.',
        resultInfo: { status: 'error', message: '제출 실패', color: '#dc3545' },
        type: 'output',
        outputList: null
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
      backgroundColor: theme === "dark" ? "#2d3748" : "#cbd5e0",
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
            {sectionInfo.courseTitle}
          </span>
          <span> › </span>
          <span 
            className="breadcrumb-link"
            onClick={() => navigate(`/sections/${sectionId}/assignments`)}
          >
            {sectionInfo.sectionNumber}분반
          </span>
          <span> › </span>
          <span 
            className="breadcrumb-link"
            onClick={() => navigate(`/sections/${sectionId}/assignments/${assignmentId}/detail`)}
          >
            {assignmentInfo.title}
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
          gutterSize={20}
          gutterStyle={renderGutter("horizontal")}
          onDragEnd={handleHorizontalDragEnd}
          style={{ display: "flex", width: "100%" }}
        >
          {/* Description Area */}
          <div className="description-area">
            <div className="description-header">
              <span>문제 설명</span>
              
              {/* Problem Limits in Header */}
              {(currentProblem.timeLimit || currentProblem.memoryLimit) && (
                <div className="problem-limits-header">
                  {currentProblem.timeLimit && (
                    <span className="limit-badge-header time-limit">
                      시간 제한: {currentProblem.timeLimit}초
                    </span>
                  )}
                  {currentProblem.memoryLimit && (
                    <span className="limit-badge-header memory-limit">
                      메모리 제한: {currentProblem.memoryLimit}MB
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div 
              className="description-content"
              dangerouslySetInnerHTML={{ __html: currentProblem.description || problemDescription }}
            />
          </div>

          {/* Editor and Result Split */}
          <Split
            sizes={verticalSizes}
            direction="vertical"
            minSize={100}
            gutterSize={20}
            gutterStyle={renderGutter("vertical")}
            onDragEnd={handleVerticalDragEnd}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Editor Area */}
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
                    className="submit-button-inline"
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "제출 중..." : "제출하기"}
                  </button>
                  <button 
                    className="submit-button-inline submit-with-output"
                    onClick={handleSubmitWithOutput} 
                    disabled={isSubmitting}
                    title="테스트케이스별 상세 결과를 확인할 수 있습니다"
                  >
                    {isSubmitting ? "제출 중..." : "테스트하기"}
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
              <div className="result-header">
                {submissionResult?.type === 'output' ? '실행 결과' : '채점 결과'}
              </div>
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

                    {/* 테스트케이스 상세 결과 표시 */}
                    {submissionResult.type === 'output' && submissionResult.outputList && (
                      <div className="testcases-section">
                        <div className="testcases-header">
                          <strong>테스트케이스별 결과:</strong>
                        </div>
                        <div className="testcases-list">
                          {submissionResult.outputList.map((testcase, index) => (
                            <div key={testcase.id || index} className={`testcase-item ${testcase.result ? testcase.result : 'not-run'}`}>
                              <div className="testcase-header">
                                <span className="testcase-number">테스트케이스 #{testcase.testcase_rank}</span>
                                <span className={`testcase-result ${testcase.result || 'not-run'}`}>
                                  {getTestcaseResultText(testcase.result)}
                                </span>
                              </div>
                              
                              {testcase.result && (
                                <div className="testcase-details">
                                  <div className="testcase-stats">
                                    <span className="stat-item">
                                      <strong>실행시간:</strong> {testcase.runtime}ms
                                    </span>
                                    <span className="stat-item">
                                      <strong>메모리:</strong> {formatMemory(testcase.memory_used)}
                                    </span>
                                  </div>
                                  
                                  {testcase.testcase_input && (
                                    <div className="testcase-input">
                                      <div className="input-label">테스트 입력:</div>
                                      <div className="input-content">
                                        <pre>{testcase.testcase_input}</pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testcase.expected_output && (
                                    <div className="testcase-expected">
                                      <div className="expected-label">기대 출력:</div>
                                      <div className="expected-content">
                                        <pre>{testcase.expected_output}</pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testcase.output && (
                                    <div className="testcase-output">
                                      <div className="output-label">실제 출력:</div>
                                      <div className="output-content">
                                        <pre>{testcase.output}</pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testcase.output_error && (
                                    <div className="testcase-error">
                                      <div className="error-label">실행 에러:</div>
                                      <div className="error-content">
                                        <pre>{testcase.output_error}</pre>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {testcase.output_diff && (
                                    <div className="testcase-diff">
                                      <div className="diff-label">차이점:</div>
                                      <div className="diff-content">
                                        <pre>{testcase.output_diff}</pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* 최대 실행시간은 outputList에 없으므로 제거하거나 다른 방법으로 처리 */}
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


    </div>
  );
};

export default ProblemSolvePage;
