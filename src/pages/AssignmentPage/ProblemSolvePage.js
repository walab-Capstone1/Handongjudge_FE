import React, { useState } from "react";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import ReactMarkdown from "react-markdown";
import styled, { createGlobalStyle } from "styled-components";

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
  const [language, setLanguage] = useState("cpp");
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState(getDefaultCode("cpp"));
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(getDefaultCode(newLang));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setSubmissionResult({
        status: "completed",
        testCases: [
          {
            id: 1,
            status: "passed",
            input: "테스트케이스 1",
            output: "예상 출력",
            actual: "실제 출력",
            time: "2ms",
            memory: "15MB",
          },
          {
            id: 2,
            status: "passed",
            input: "테스트케이스 2",
            output: "예상 출력",
            actual: "실제 출력",
            time: "1ms",
            memory: "15MB",
          },
          {
            id: 3,
            status: "failed",
            input: "테스트케이스 3",
            output: "예상 출력",
            actual: "잘못된 출력",
            time: "3ms",
            memory: "15MB",
          },
        ],
        summary: {
          total: 3,
          passed: 2,
          failed: 1,
          totalTime: "6ms",
          totalMemory: "15MB",
        },
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const problemDescription = `
# N-Queens 문제

## 문제 설명
N×N 체스판에 N개의 퀸을 서로 공격할 수 없도록 배치하는 문제입니다.

## 제한사항
- 1 ≤ N ≤ 12
- 퀸은 가로, 세로, 대각선으로 이동할 수 있습니다.
- 서로 다른 퀸이 같은 행, 열, 대각선에 있으면 안 됩니다.

## 입출력 예시
\`\`\`
입력: N = 4
출력: 2
\`\`\`

## 힌트
- 백트래킹 알고리즘을 사용해보세요.
- 각 행에 하나씩 퀸을 배치하는 방식으로 접근해보세요.
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
            <span>A Class › Week 1 › </span>
            <strong>N Queens</strong>
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
              <ReactMarkdown>{problemDescription}</ReactMarkdown>
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
                {submissionResult ? (
                  <>
                    <StyledSummary $failed={submissionResult.summary.failed > 0}>
                      <strong>
                        {submissionResult.summary.passed}/{submissionResult.summary.total} 테스트케이스 통과
                      </strong>
                      <br />
                      총 실행시간: {submissionResult.summary.totalTime} | 메모리: {submissionResult.summary.totalMemory}
                    </StyledSummary>
                    {submissionResult.testCases.map((tc) => (
                      <StyledTestCase key={tc.id} $status={tc.status}>
                        <div><strong>테스트케이스 {tc.id}: {tc.status === "passed" ? "통과" : "실패"}</strong></div>
                        <div>입력: {tc.input}</div>
                        <div>예상 출력: {tc.output}</div>
                        <div>실제 출력: {tc.actual}</div>
                        <div>실행시간: {tc.time} | 메모리: {tc.memory}</div>
                      </StyledTestCase>
                    ))}
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
