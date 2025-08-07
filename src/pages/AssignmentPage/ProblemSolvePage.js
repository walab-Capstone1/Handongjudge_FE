import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import ReactMarkdown from "react-markdown";
import styled, { createGlobalStyle } from "styled-components";
import apiService from "../../services/APIService";

const GlobalStyle = createGlobalStyle`
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ $theme }) =>
      $theme === "dark" ? "#555 #1e1e1e" : "#ccc #fff"};
  }

  *::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  *::-webkit-scrollbar-track {
    background: ${({ $theme }) => ($theme === "dark" ? "#1e1e1e" : "#f1f1f1")};
  }

  *::-webkit-scrollbar-thumb {
    background-color: ${({ $theme }) =>
      $theme === "dark" ? "#444" : "#bbb"};
    border-radius: 10px;
  }
`;

const ProblemSolvePage = () => {
  const { assignmentId,problemId } = useParams();
  //const {} = useParams();    
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("cpp");
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState(getDefaultCode("cpp"));
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({ 
    title: "로딩 중...", 
    description: "문제를 불러오는 중입니다." 
  });
  const [isLoading, setIsLoading] = useState(true);

  // 문제 정보 로드
  useEffect(() => {
    const loadProblemInfo = async () => {
      if (!problemId) {
        return;
      }

      try {
        setIsLoading(true);
        console.log('문제 정보 로드 시작:', { problemId });
        
        // getProblemInfo API 호출 (problemId만 전달)
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

  // DOMjudge 결과 코드를 한글로 변환
  const getResultText = (result) => {
    switch (result) {
      case 'AC':
        return '정답 (Accepted)';
      case 'WA':
        return '오답 (Wrong Answer)';
      case 'TLE':
        return '시간 초과 (Time Limit Exceeded)';
      case 'MLE':
        return '메모리 초과 (Memory Limit Exceeded)';
      case 'RE':
        return '런타임 에러 (Runtime Error)';
      case 'CE':
        return '컴파일 에러 (Compilation Error)';
      case 'PE':
        return '출력 형식 오류 (Presentation Error)';
      default:
        return result || '알 수 없는 결과';
    }
  };

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
      console.log('코드 제출 시작:', { assignmentId, problemId, language });
      
      // 1. 코드 제출 (assignmentId를 weekId로 사용)
      const submissionResponse = await apiService.submitCode(assignmentId, problemId, code, language);
      console.log('코드 제출 응답:', submissionResponse);
      
      // 백엔드에서 즉시 결과를 반환하므로 폴링이 필요 없음
      if (submissionResponse) {
        setSubmissionResult({
          status: 'completed',
          result: submissionResponse.result,
          submissionId: submissionResponse.submissionId,
          submittedAt: submissionResponse.submittedAt,
          language: submissionResponse.language
        });
      } else {
        throw new Error('제출 응답을 받지 못했습니다.');
      }
    } catch (error) {
      console.error('코드 제출 실패:', error);
      setSubmissionResult({
        status: 'error',
        message: error.message || '코드 제출에 실패했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const gutterStyle = () => ({
    backgroundColor: theme === "dark" ? "#2b2b2b" : "#e0e0e0",
    cursor: "col-resize",
  });

  const gutterVerticalStyle = () => ({
    backgroundColor: theme === "dark" ? "#2b2b2b" : "#e0e0e0",
    cursor: "row-resize",
  });

  const renderGutter = (direction) => {
    return () => ({
      ...direction === "horizontal" ? gutterStyle() : gutterVerticalStyle(),
      width: direction === "horizontal" ? "4px" : "100%",
      height: direction === "vertical" ? "4px" : "100%",
    });
  };

  return (
    <>
      <GlobalStyle $theme={theme} />
      <StyledPage $theme={theme}>
        <StyledHeader $theme={theme}>
          <div className="breadcrumb">
            <BreadcrumbLink onClick={() => navigate("/main")}>
              A Class
            </BreadcrumbLink>
            <span> › </span>
            <BreadcrumbLink onClick={() => navigate(`/assignments/${assignmentId}/detail`)}>
             과제 {assignmentId}
            </BreadcrumbLink>
            <span> › </span>
            <strong>{currentProblem.title}</strong>
          </div>
          <div className="controls">
            <ThemeButton onClick={() => setTheme("light")} $active={theme === "light"}>
              Light
            </ThemeButton>
            <ThemeButton onClick={() => setTheme("dark")} $active={theme === "dark"}>
              Dark
            </ThemeButton>
            <LanguageSelect value={language} onChange={(e) => handleLanguageChange(e.target.value)} $theme={theme}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </LanguageSelect>
          </div>
        </StyledHeader>

        <MainSplit>
          <Split
            sizes={[40, 60]}
            direction="horizontal"
            minSize={200}
            gutterSize={8}
            gutterStyle={renderGutter("horizontal")}
            style={{ display: "flex", width: "100%" }}
          >
            <StyledDescription $theme={theme}>
              {isLoading ? (
                <div style={{ opacity: 0.6 }}>문제를 불러오는 중...</div>
              ) : (
                <ReactMarkdown>{problemDescription}</ReactMarkdown>
              )}
            </StyledDescription>

            <Split
              sizes={[70, 30]}
              direction="vertical"
              minSize={100}
              gutterSize={8}
              gutterStyle={renderGutter("vertical")}
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <StyledEditorWrapper>
                <StyledEditorHeader>
                  solution.{language === "javascript" ? "js" : language}
                </StyledEditorHeader>
                <EditorScrollArea>
                  <CodeMirror
                    value={code}
                    height="100%"
                    extensions={getLanguageExtension(language)}
                    theme={theme}
                    onChange={(value) => setCode(value)}
                  />
                </EditorScrollArea>
              </StyledEditorWrapper>

              <StyledResultArea>
                <h4>채점 결과</h4>
                {isSubmitting ? (
                  <div style={{ opacity: 0.6 }}>코드를 채점하고 있습니다...</div>
                ) : submissionResult ? (
                  <>
                    {submissionResult.status === 'error' ? (
                      <StyledErrorMessage>
                        <strong>오류</strong>
                        <br />
                        {submissionResult.message}
                      </StyledErrorMessage>
                    ) : submissionResult.status === 'completed' ? (
                      <>
                        <StyledSummary $failed={submissionResult.result !== 'AC'}>
                          <strong>
                            {submissionResult.result === 'AC' ? '정답' : '오답'}
                          </strong>
                          <br />
                          제출 ID: {submissionResult.submissionId}
                          <br />
                          언어: {submissionResult.language}
                          <br />
                          제출 시간: {submissionResult.submittedAt ? new Date(submissionResult.submittedAt).toLocaleString() : 'N/A'}
                        </StyledSummary>
                        <StyledResultDetail $result={submissionResult.result}>
                          <div><strong>결과: {getResultText(submissionResult.result)}</strong></div>
                          {submissionResult.result !== 'AC' && (
                            <div>문제를 다시 확인해보세요.</div>
                          )}
                        </StyledResultDetail>
                      </>
                    ) : (
                      <div style={{ opacity: 0.6 }}>처리 중...</div>
                    )}
                  </>
                ) : (
                  <div style={{ opacity: 0.6 }}>제출 후 결과가 여기에 표시됩니다.</div>
                )}
              </StyledResultArea>
            </Split>
          </Split>
        </MainSplit>

        <StyledSubmitSection $theme={theme}>
          <StyledSubmitButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "제출 중..." : "제출하기"}
          </StyledSubmitButton>
        </StyledSubmitSection>
      </StyledPage>
    </>
  );
};

// styled-components 정의 (위에서 참조됨)
const StyledPage = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ $theme }) => ($theme === "dark" ? "#0d1117" : "#ffffff")};
  color: ${({ $theme }) => ($theme === "dark" ? "#c9d1d9" : "#000000")};
`;

const StyledHeader = styled.div`
  padding: 12px 24px;
  border-bottom: 1px solid #30363d;
  background-color: ${({ $theme }) => ($theme === "dark" ? "#161b22" : "#ffffff")};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BreadcrumbLink = styled.span`
  color: ${({ $theme }) => ($theme === "dark" ? "#58a6ff" : "#0969da")};
  cursor: pointer;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ThemeButton = styled.button`
  padding: 4px 10px;
  margin-right: 4px;
  background-color: ${({ $active }) => ($active ? "#2f81f7" : "#21262d")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#c9d1d9")};
  border: 1px solid #30363d;
  border-radius: 4px;
  cursor: pointer;
`;

const LanguageSelect = styled.select`
  padding: 4px 10px;
  border-radius: 4px;
  background-color: ${({ $theme }) => ($theme === "dark" ? "#21262d" : "#ffffff")};
  color: ${({ $theme }) => ($theme === "dark" ? "#c9d1d9" : "#000000")};
  border: 1px solid #30363d;
`;

const MainSplit = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
`;

const StyledDescription = styled.div`
  padding: 24px;
  overflow: auto;
`;

const StyledEditorWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledEditorHeader = styled.div`
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: bold;
  padding-left: 8px;
  padding-top: 8px;
  color: ${({ $theme }) => ($theme === "dark" ? "#8b949e" : "#333")};
`;

const EditorScrollArea = styled.div`
  flex: 1;
  overflow: auto;
`;

const StyledResultArea = styled.div`
  padding: 8px 16px;
  overflow: auto;
`;

const StyledSummary = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 4px;
  background-color: ${({ $failed }) => ($failed ? "#f8d7da" : "#d4edda")};
  color: ${({ $failed }) => ($failed ? "#721c24" : "#155724")};
`;

const StyledTestCase = styled.div`
  margin-bottom: 8px;
  padding: 8px;
  background-color: ${({ $status }) => ($status === "passed" ? "#e6ffed" : "#ffeef0")};
  border-radius: 4px;
  font-size: 13px;
`;

const StyledResultDetail = styled.div`
  margin-top: 8px;
  padding: 12px;
  border-radius: 4px;
  background-color: ${({ $result }) => {
    switch ($result) {
      case 'AC':
        return '#d4edda';
      case 'WA':
      case 'TLE':
      case 'MLE':
      case 'RE':
      case 'CE':
      case 'PE':
        return '#f8d7da';
      default:
        return '#fff3cd';
    }
  }};
  color: ${({ $result }) => {
    switch ($result) {
      case 'AC':
        return '#155724';
      case 'WA':
      case 'TLE':
      case 'MLE':
      case 'RE':
      case 'CE':
      case 'PE':
        return '#721c24';
      default:
        return '#856404';
    }
  }};
  font-size: 13px;
`;

const StyledErrorMessage = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
`;

const StyledSubmitSection = styled.div`
  border-top: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  background-color: ${({ $theme }) => ($theme === "dark" ? "#161b22" : "#f6f8fa")};
  padding: 8px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const StyledSubmitButton = styled.button`
  padding: 10px 20px;
  background-color: #2f81f7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  
  &:hover {
    background-color: #1f6feb;
  }
`;

export default ProblemSolvePage;
