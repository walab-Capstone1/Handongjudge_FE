import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Split from "react-split";
import apiService from "../services/APIService";
import LoadingSpinner from "../components/LoadingSpinner";
import ProblemDescription from "../components/ProblemDescription";
import CodeEditor from "../components/CodeEditor";
import ExecutionResult from "../components/ExecutionResult";
import DraggablePanel from "../components/DraggablePanel";
import QuizTimer from "../components/QuizTimer";
import indexedDBManager from "../utils/IndexedDBManager";
import "../pages/AssignmentPage/ProblemSolvePage.css";

const CodingQuizSolvePage = () => {
  const { sectionId, quizId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State management
  const [language, setLanguage] = useState("c");
  const [theme, setTheme] = useState("light");
  const [code, setCode] = useState(getDefaultCode("c"));
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
  const [quizInfo, setQuizInfo] = useState({
    title: "Loading...",
    description: "",
    startTime: null,
    endTime: null,
    status: "WAITING",
    problems: [] // 코딩 테스트에 포함된 문제 목록
  });
  const [problems, setProblems] = useState([]); // 코딩 테스트의 모든 문제
  const [selectedProblemId, setSelectedProblemId] = useState(null); // 현재 선택된 문제 ID
  const [isLoading, setIsLoading] = useState(true);
  const [horizontalSizes, setHorizontalSizes] = useState([40, 60]);
  const [verticalSizes, setVerticalSizes] = useState([70, 30]);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // 패널 레이아웃 상태
  const [panelLayout, setPanelLayout] = useState({
    left: 'description',
    topRight: 'editor', 
    bottomRight: 'result'
  });

  // 세션 관련 상태
  const [sessionId, setSessionId] = useState(null);
  const [sessionSaveStatus, setSessionSaveStatus] = useState('idle');
  const [codeLoadSource, setCodeLoadSource] = useState(null);
  const [sessionCleared, setSessionCleared] = useState(false);

  // Load quiz and problem information
  useEffect(() => {
    const loadAllInfo = async () => {
      if (!quizId || !sectionId) {
        return;
      }

      try {
        setIsLoading(true);
        console.log('퀴즈 정보 로드 시작:', { quizId, sectionId });
        
        // API 호출
        const [quizInfoRes, sectionInfoRes, problemsRes] = await Promise.all([
          apiService.getQuizInfo(sectionId, quizId),
          apiService.getSectionInfo(sectionId),
          apiService.getQuizProblems(sectionId, quizId)
        ]);
        
        const quizData = quizInfoRes.data || quizInfoRes;
        const sectionData = sectionInfoRes.data || sectionInfoRes;
        const problemsData = problemsRes.data || problemsRes;
        
        // LocalDateTime을 Date로 변환
        const quizInfoData = {
          ...quizData,
          startTime: new Date(quizData.startTime),
          endTime: new Date(quizData.endTime)
        };
        
        // 문제 목록 변환
        const problemsList = problemsData.map(p => ({
          id: p.problemId,
          title: p.title,
          order: p.problemOrder
        }));
        
        // URL 파라미터에서 problemId를 받거나 첫 번째 문제를 기본으로 선택
        const urlProblemId = searchParams.get('problemId');
        const defaultProblemId = urlProblemId ? parseInt(urlProblemId) : (problemsList[0]?.id || null);
        
        if (!defaultProblemId) {
          throw new Error('문제를 찾을 수 없습니다');
        }
        
        const problemInfo = await apiService.getProblemInfo(defaultProblemId);
        const problemData = problemInfo.data || problemInfo;
        
        setQuizInfo(quizInfoData);
        setProblems(problemsList);
        setSectionInfo(sectionData);
        setCurrentProblem(problemData);
        setSelectedProblemId(defaultProblemId);
      } catch (error) {
        console.error('정보 로드 실패:', error);
        setCurrentProblem({ 
          title: "오류", 
          description: "퀴즈를 불러오는데 실패했습니다." 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllInfo();
  }, [quizId, sectionId, searchParams]);

  // IndexedDB 세션 초기화
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await indexedDBManager.init();
        const currentSessionId = indexedDBManager.getSessionId();
        setSessionId(currentSessionId);
      } catch (error) {
        console.error('IndexedDB 초기화 실패:', error);
      }
    };

    initializeSession();
  }, []);

  // 시간 초과 처리
  const handleTimeUp = () => {
    setIsTimeUp(true);
    alert('퀴즈 시간이 종료되었습니다. 자동으로 제출됩니다.');
    // TODO: 자동 제출 로직 추가
  };

  // 페이지 로드 시 코드 불러오기
  useEffect(() => {
    const loadCode = async () => {
      if (!selectedProblemId || !sectionId || !language || !sessionId) return;
      
      try {
        const sessionCode = await loadFromSession();
        
        if (sessionCode && sessionCode.trim() !== '' && sessionCode !== getDefaultCode(language)) {
          setCode(sessionCode);
          setCodeLoadSource('session');
          return;
        }
        
        setCode(getDefaultCode(language));
        setCodeLoadSource('default');
      } catch (error) {
        console.log('코드 불러오기 실패:', error.message);
        setCode(getDefaultCode(language));
        setCodeLoadSource('default');
      }
    };

    loadCode();
  }, [selectedProblemId, sectionId, language, sessionId]);

  // 자동 저장 (10초마다)
  useEffect(() => {
    if (!sessionId || isTimeUp) return;

    const autoSaveInterval = setInterval(() => {
      saveToSession();
    }, 10000); // 10초마다 저장

    return () => clearInterval(autoSaveInterval);
  }, [code, language, sessionId, isTimeUp]);

  // 문제 변경 핸들러
  const handleProblemChange = async (problemId) => {
    if (problemId === selectedProblemId) return;
    
    try {
      setSelectedProblemId(problemId);
      
      // 새 문제 정보 로드
      const problemInfo = await apiService.getProblemInfo(problemId);
      const problemData = problemInfo.data || problemInfo;
      setCurrentProblem(problemData);
      
      // 새 문제의 코드 로드
      try {
        const savedData = await indexedDBManager.getSessionCode(problemId, sectionId, language);
        const sessionCode = savedData ? savedData.code : null;
        if (sessionCode && sessionCode.trim() !== '' && sessionCode !== getDefaultCode(language)) {
          setCode(sessionCode);
          setCodeLoadSource('session');
        } else {
          setCode(getDefaultCode(language));
          setCodeLoadSource('default');
        }
      } catch (error) {
        console.log('세션 코드 불러오기 실패:', error);
        setCode(getDefaultCode(language));
        setCodeLoadSource('default');
      }
      
      setSubmissionResult(null);
    } catch (error) {
      console.error('문제 변경 실패:', error);
    }
  };

  // Helper functions
  const saveToSession = async () => {
    if (!sessionId || !code || code === getDefaultCode(language) || !selectedProblemId) {
      return;
    }

    try {
      setSessionSaveStatus('saving');
      await indexedDBManager.saveSessionCode(selectedProblemId, sectionId, language, code);
      setSessionSaveStatus('saved');
      setTimeout(() => setSessionSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('세션 저장 실패:', error);
      setSessionSaveStatus('error');
      setTimeout(() => setSessionSaveStatus('idle'), 2000);
    }
  };

  const loadFromSession = async () => {
    if (!sessionId || !selectedProblemId) return null;

    try {
      const savedData = await indexedDBManager.getSessionCode(selectedProblemId, sectionId, language);
      return savedData ? savedData.code : null;
    } catch (error) {
      console.error('세션 코드 불러오기 실패:', error);
      return null;
    }
  };

  const clearSessionAfterSubmission = async () => {
    if (!sessionId || !selectedProblemId) return;

    try {
      await indexedDBManager.deleteSessionCode(selectedProblemId, sectionId, language);
      setCodeLoadSource('backend');
      setSessionCleared(true);
      setTimeout(() => setSessionCleared(false), 3000);
    } catch (error) {
      console.warn('세션 데이터 정리 실패:', error);
    }
  };

  // 패널 이동 처리
  const handlePanelMove = (draggedPanelId, targetPanelId) => {
    if (draggedPanelId === targetPanelId) {
      return;
    }
    
    setPanelLayout(currentLayout => {
      let draggedPos = null;
      let targetPos = null;
      
      if (currentLayout.left === draggedPanelId) draggedPos = 'left';
      else if (currentLayout.topRight === draggedPanelId) draggedPos = 'topRight';
      else if (currentLayout.bottomRight === draggedPanelId) draggedPos = 'bottomRight';
      
      if (currentLayout.left === targetPanelId) targetPos = 'left';
      else if (currentLayout.topRight === targetPanelId) targetPos = 'topRight';
      else if (currentLayout.bottomRight === targetPanelId) targetPos = 'bottomRight';
      
      if (draggedPos && targetPos) {
        const newLayout = { ...currentLayout };
        newLayout[draggedPos] = targetPanelId;
        newLayout[targetPos] = draggedPanelId;
        return newLayout;
      }
      
      return currentLayout;
    });
  };
  
  // 패널 컴포넌트 렌더링
  const renderPanel = (panelType, showDragHandle = true) => {
    const panels = {
      description: (
        <ProblemDescription 
          currentProblem={currentProblem}
          problemDescription={problemDescription}
        />
      ),
      editor: (
        <CodeEditor
          language={language}
          code={code}
          theme={theme}
          assignmentInfo={quizInfo}
          isSubmitting={isSubmitting || isTimeUp}
          onCodeChange={(value) => setCode(value)}
          onSubmit={handleSubmit}
          onSubmitWithOutput={handleSubmitWithOutput}
          sessionSaveStatus={sessionSaveStatus}
          onSessionSave={saveToSession}
          codeLoadSource={codeLoadSource}
          sessionCleared={sessionCleared}
        />
      ),
      result: (
        <ExecutionResult
          submissionResult={submissionResult}
          isSubmitting={isSubmitting}
        />
      )
    };
    
    const titles = {
      description: '문제 설명',
      editor: '코드 에디터',
      result: '실행 결과'
    };
    
    return (
      <DraggablePanel
        id={panelType}
        type={panelType}
        title={titles[panelType]}
        onMove={handlePanelMove}
        showDragHandle={showDragHandle}
      >
        {panels[panelType]}
      </DraggablePanel>
    );
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
      case "c":
        return "#include <stdio.h>\n\nint main() {\n    // 여기에 코드를 작성하세요\n    return 0;\n}";
      default:
        return "// 여기에 코드를 작성하세요\n";
    }
  }

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

    if (isTimeUp) {
      alert('시간이 종료되어 제출할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const submissionResponse = await apiService.submitCode(sectionId, selectedProblemId, code, language);
      
      if (submissionResponse) {
        const { result, submissionId, submittedAt, language: submittedLanguage } = submissionResponse;
        
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
          type: 'judge'
        });

        await clearSessionAfterSubmission();
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

    if (isTimeUp) {
      alert('시간이 종료되어 테스트할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const submissionResponse = await apiService.submitCodeAndGetOutput(sectionId, selectedProblemId, code, language);
      
      if (submissionResponse) {
        const { result, submissionId, submittedAt, language: submittedLanguage, outputList } = submissionResponse;
        
        const resultMapping = {
          'correct': { status: 'success', message: '정답 (Accepted)', color: '#28a745' },
          'wrong-answer': { status: 'error', message: '오답 (Wrong Answer)', color: '#dc3545' },
          'timelimit': { status: 'error', message: '시간 초과 (Time Limit Exceeded)', color: '#ffc107' },
          'memory-limit': { status: 'error', message: '메모리 초과 (Memory Limit Exceeded)', color: '#fd7e14' },
          'run-error': { status: 'error', message: '런타임 에러 (Runtime Error)', color: '#e83e8c' },
          'compiler-error': { status: 'error', message: '컴파일 에러 (Compilation Error)', color: '#6f42c1' },
          'AC': { status: 'success', message: '정답 (Accepted)', color: '#28a745' },
          'WA': { status: 'error', message: '오답 (Wrong Answer)', color: '#dc3545' },
          'TLE': { status: 'error', message: '시간 초과 (Time Limit Exceeded)', color: '#ffc107' },
          'MLE': { status: 'error', message: '메모리 초과 (Memory Limit Exceeded)', color: '#fd7e14' },
          'RE': { status: 'error', message: '런타임 에러 (Runtime Error)', color: '#e83e8c' },
          'CE': { status: 'error', message: '컴파일 에러 (Compilation Error)', color: '#6f42c1' },
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
          outputList: outputList,
          type: 'output'
        });

        await clearSessionAfterSubmission();
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
    setHorizontalSizes(sizes);
  };

  const handleVerticalDragEnd = (sizes) => {
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
    <DndProvider backend={HTML5Backend}>
    <div className={`problem-solve-page ${theme}`}>
      {/* Header with Timer */}
      <div className="problem-solve-header quiz-header">
        <div className="breadcrumb">
          <span 
            className="breadcrumb-link"
            onClick={() => navigate(`/sections/${sectionId}/coding-quiz`)}
          >
            코딩 테스트
          </span>
          <span> › </span>
          <strong>{quizInfo.title}</strong>
        </div>
        <div className="header-right">
          {problems.length > 1 && (
            <div className="problem-selector-header">
              {problems.map((problem, index) => (
                <button
                  key={problem.id}
                  className={`problem-selector-btn ${selectedProblemId === problem.id ? 'active' : ''}`}
                  onClick={() => handleProblemChange(problem.id)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
          <QuizTimer 
            endTime={quizInfo.endTime} 
            onTimeUp={handleTimeUp}
          />
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
              disabled={isTimeUp}
            >
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
            </select>
          </div>
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
            {/* Left Panel */}
            {renderPanel(panelLayout.left, true)}

            {/* Right Split */}
          <Split
            sizes={verticalSizes}
            direction="vertical"
            minSize={100}
            gutterSize={20}
            gutterStyle={renderGutter("vertical")}
            onDragEnd={handleVerticalDragEnd}
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
              {/* Top Right Panel */}
              {renderPanel(panelLayout.topRight, true)}

              {/* Bottom Right Panel */}
              {renderPanel(panelLayout.bottomRight, true)}
            </Split>
          </Split>
        </div>
      </div>
    </DndProvider>
  );
};

export default CodingQuizSolvePage;

