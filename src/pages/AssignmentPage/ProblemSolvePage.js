import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import ReactMarkdown from "react-markdown";
import styled, { createGlobalStyle } from "styled-components";
import { EditorView } from "@codemirror/view";

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

  .gutter {
    position: relative;
    transition: background-color 0.2s ease;
    z-index: 10;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  .gutter:hover {
    background-color: ${({ $theme }) => 
      $theme === "dark" ? "#1aad6b" : "#1f6feb"} !important;
  }

  .gutter::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${({ $theme }) => ($theme === "dark" ? "#151028" : "#ffffff")};
    border-radius: 1px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .gutter:hover::after {
    opacity: 1;
  }

  .gutter.gutter-horizontal::after {
    width: 2px;
    height: 20px;
  }

  .gutter.gutter-vertical::after {
    width: 20px;
    height: 2px;
  }

  .gutter.gutter-horizontal {
    cursor: col-resize !important;
    border-left: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
    border-right: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  }

  .gutter.gutter-vertical {
    cursor: row-resize !important;
    border-top: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
    border-bottom: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  }

  .gutter:active {
    background-color: ${({ $theme }) => 
      $theme === "dark" ? "#1aad6b" : "#1f6feb"} !important;
  }
`;

const ProblemSolvePage = () => {
  const { week, problemId } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("cpp");
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState(getDefaultCode("cpp"));
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [horizontalSizes, setHorizontalSizes] = useState([40, 60]);
  const [verticalSizes, setVerticalSizes] = useState([70, 30]);

  // 문제 데이터 (실제로는 API에서 가져올 데이터)
  const problemData = {
    "1": {
      "1": { title: "완주하지 못한 선수", description: "완주하지 못한 선수 문제 설명..." },
      "2": { title: "N Queens", description: "N-Queens 문제 설명..." },
      "3": { title: "전화번호 목록", description: "전화번호 목록 문제 설명..." }
    },
    "2": {
      "1": { title: "의상", description: "의상 문제 설명..." },
      "2": { title: "베스트앨범", description: "베스트앨범 문제 설명..." }
    }
  };

  const currentProblem = problemData[week]?.[problemId] || { 
    title: "알 수 없는 문제", 
    description: "문제를 찾을 수 없습니다." 
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

  // 커스텀 다크 테마 생성 (고대비)
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
    // 구문 강조 색상 (모두 하얀색)
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

  const renderGutter = (direction) => {
    return () => ({
      backgroundColor: theme === "dark" ? "#139F59" : "#0969da",
    });
  };

  const handleHorizontalDragEnd = (sizes) => {
    console.log('Horizontal split sizes changed:', sizes);
    setHorizontalSizes(sizes);
  };

  const handleVerticalDragEnd = (sizes) => {
    console.log('Vertical split sizes changed:', sizes);
    setVerticalSizes(sizes);
  };



  return (
    <>
      <GlobalStyle $theme={theme} />
      <StyledPage $theme={theme}>
        <StyledHeader $theme={theme}>
          <div className="breadcrumb">
            <BreadcrumbLink onClick={() => navigate("/assignments")}>
              A Class
            </BreadcrumbLink>
            <span> › </span>
            <BreadcrumbLink onClick={() => navigate(`/assignments/${week}/detail`)}>
             {week}
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
            sizes={horizontalSizes}
            direction="horizontal"
            minSize={200}
            gutterSize={12}
            gutterStyle={renderGutter("horizontal")}
            onDragEnd={handleHorizontalDragEnd}
            style={{ display: "flex", width: "100%" }}
          >
            <StyledDescription $theme={theme}>
              <StyledDescriptionHeader $theme={theme}>문제 설명</StyledDescriptionHeader>
              <div>
                <ReactMarkdown>{problemDescription}</ReactMarkdown>
              </div>
            </StyledDescription>

            <Split
              sizes={verticalSizes}
              direction="vertical"
              minSize={100}
              gutterSize={12}
              gutterStyle={renderGutter("vertical")}
              onDragEnd={handleVerticalDragEnd}
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <StyledEditorWrapper $theme={theme}>
                <StyledEditorHeader $theme={theme}>
                  solution.{language === "javascript" ? "js" : language}
                </StyledEditorHeader>
                <EditorScrollArea $theme={theme}>
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
                </EditorScrollArea>
              </StyledEditorWrapper>

              <StyledResultArea $theme={theme}>
                <StyledResultHeader $theme={theme}>채점 결과</StyledResultHeader>
                <div>
                  {submissionResult ? (
                    <>
                      <StyledSummary $failed={submissionResult.summary.failed > 0} $theme={theme}>
                        <strong>
                          {submissionResult.summary.passed}/{submissionResult.summary.total} 테스트케이스 통과
                        </strong>
                        <br />
                        총 실행시간: {submissionResult.summary.totalTime} | 메모리: {submissionResult.summary.totalMemory}
                      </StyledSummary>
                      {submissionResult.testCases.map((tc) => (
                        <StyledTestCase key={tc.id} $status={tc.status} $theme={theme}>
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
                </div>
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
  background-color: ${({ $theme }) => ($theme === "dark" ? "#161b22" : "#ffffff")};
  color: ${({ $theme }) => ($theme === "dark" ? "#EFF5F2" : "#000000")};
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
  padding: 0 0 24px 0;
  overflow: auto;
  background: ${({ $theme }) => 
    $theme === "dark" 
      ? "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" 
      : "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
  };
  border-right: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  box-shadow: ${({ $theme }) => $theme === "dark" ? "inset 0 0 10px rgba(0,0,0,0.3)" : "inset 0 0 10px rgba(0,0,0,0.05)"};
  
  > div {
    padding: 0 24px;
  }
`;

const StyledEditorWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ $theme }) => 
    $theme === "dark" 
      ? "#000000" 
      : "#ffffff"
  };
  border-bottom: 1px solid ${({ $theme }) => ($theme === "dark" ? "#15181C" : "#e1e4e8")};
`;

const StyledEditorHeader = styled.div`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 16px;
  color: ${({ $theme }) => ($theme === "dark" ? "#58a6ff" : "#0969da")};
  background: ${({ $theme }) => 
    $theme === "dark" 
      ? "linear-gradient(90deg, rgba(88, 166, 255, 0.1) 0%, rgba(88, 166, 255, 0.05) 100%)" 
      : "linear-gradient(90deg, rgba(9, 105, 218, 0.1) 0%, rgba(9, 105, 218, 0.05) 100%)"
  };
  border-bottom: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  border-radius: 6px 6px 0 0;
`;

const EditorScrollArea = styled.div`
  flex: 1;
  overflow: auto;
  background-color: ${({ $theme }) => ($theme === "dark" ? "#000000" : "#ffffff")};
`;

const StyledResultArea = styled.div`
  padding: 0 0 8px 0;
  overflow: auto;
  background: ${({ $theme }) => 
    $theme === "dark" 
      ? "linear-gradient(135deg, #0d1117 0%, #161b22 100%)" 
      : "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)"
  };
  box-shadow: ${({ $theme }) => $theme === "dark" ? "inset 0 0 10px rgba(0,0,0,0.3)" : "inset 0 0 10px rgba(0,0,0,0.05)"};
  
  > div {
    padding: 0 16px;
  }
`;

const StyledSummary = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 4px;
  background-color: ${({ $failed, $theme }) => 
    $theme === "dark" 
      ? ($failed ? "#3d1a1a" : "#1a3d1a") 
      : ($failed ? "#f8d7da" : "#d4edda")
  };
  color: ${({ $failed, $theme }) => 
    $theme === "dark" 
      ? ($failed ? "#ff6b6b" : "#6bff6b") 
      : ($failed ? "#FF3D50" : "#155724")
  };
`;

const StyledTestCase = styled.div`
  margin-bottom: 8px;
  padding: 8px;
  background-color: ${({ $status, $theme }) => 
    $theme === "dark" 
      ? ($status === "passed" ? "#1a3d1a" : "#3d1a1a") 
      : ($status === "passed" ? "#e6ffed" : "#ffeef0")
  };
  border-radius: 4px;
  font-size: 13px;
  color: ${({ $theme }) => ($theme === "dark" ? "#2B2C2E" : "#24292e")};
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



const StyledResultHeader = styled.h4`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 16px;
  color: ${({ $theme }) => ($theme === "dark" ? "#58a6ff" : "#0969da")};
  background: ${({ $theme }) => 
    $theme === "dark" 
      ? "linear-gradient(90deg, rgba(88, 166, 255, 0.1) 0%, rgba(88, 166, 255, 0.05) 100%)" 
      : "linear-gradient(90deg, rgba(9, 105, 218, 0.1) 0%, rgba(9, 105, 218, 0.05) 100%)"
  };
  border-bottom: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  border-radius: 6px 6px 0 0;
`;

const StyledDescriptionHeader = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 16px;
  color: ${({ $theme }) => ($theme === "dark" ? "#58a6ff" : "#0969da")};
  background: ${({ $theme }) => 
    $theme === "dark" 
      ? "linear-gradient(90deg, rgba(88, 166, 255, 0.1) 0%, rgba(88, 166, 255, 0.05) 100%)" 
      : "linear-gradient(90deg, rgba(9, 105, 218, 0.1) 0%, rgba(9, 105, 218, 0.05) 100%)"
  };
  border-bottom: 1px solid ${({ $theme }) => ($theme === "dark" ? "#30363d" : "#e1e4e8")};
  border-radius: 6px 6px 0 0;
`;

export default ProblemSolvePage;
