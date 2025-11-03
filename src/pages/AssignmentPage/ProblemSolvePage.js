import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Split from "react-split";
import apiService from "../../services/APIService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProblemDescription from "../../components/ProblemDescription";
import CodeEditor from "../../components/CodeEditor";
import ExecutionResult from "../../components/ExecutionResult";
import DraggablePanel from "../../components/DraggablePanel";
import indexedDBManager from "../../utils/IndexedDBManager";
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
  
  // 패널 레이아웃 상태
  const [panelLayout, setPanelLayout] = useState({
    left: 'description',
    topRight: 'editor', 
    bottomRight: 'result'
  });

  // 세션 관련 상태
  const [sessionId, setSessionId] = useState(null);
  const [sessionSaveStatus, setSessionSaveStatus] = useState('idle'); // 'idle', 'saved', 'error'
  const [codeLoadSource, setCodeLoadSource] = useState(null); // 'session', 'backend', 'default'
  const [sessionCleared, setSessionCleared] = useState(false); // 제출 후 세션 정리 완료 표시


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

  // IndexedDB 세션 초기화
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await indexedDBManager.init();
        const currentSessionId = indexedDBManager.getSessionId();
        setSessionId(currentSessionId);
        console.log('세션 초기화 완료:', currentSessionId);
        
        // 오래된 데이터 정리 (백그라운드에서 실행)
        indexedDBManager.cleanupOldData().catch(err => 
          console.warn('오래된 데이터 정리 실패:', err)
        );
      } catch (error) {
        console.error('IndexedDB 초기화 실패:', error);
      }
    };

    initializeSession();
  }, []);

  // 페이지 언로드 시 세션 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 세션 데이터 정리는 선택사항 (개발 중에는 유지하는 것이 좋을 수 있음)
      // indexedDBManager.clearCurrentSession();
      console.log('페이지 언로드 - 세션 유지');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 페이지가 숨겨질 때 (탭 전환 등)
        console.log('페이지 숨김');
      } else {
        // 페이지가 다시 보일 때
        console.log('페이지 표시');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Ctrl+S 단축키 이벤트
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+S 또는 Cmd+S (macOS)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // 브라우저 기본 저장 동작 방지
        saveToSession();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, sessionId, problemId, sectionId, language]); // 의존성 배열에 필요한 값들 추가

  // 페이지 로드 시 코드 불러오기 (IndexedDB 우선, 그 다음 백엔드)
  useEffect(() => {
    const loadCode = async () => {
      if (!problemId || !sectionId || !language || !sessionId) return;
      
      try {
        // 1단계: IndexedDB에서 세션 코드 확인
        console.log('1단계: IndexedDB 세션 코드 확인 중...');
        const sessionCode = await loadFromSession();
        
        if (sessionCode && sessionCode.trim() !== '' && sessionCode !== getDefaultCode(language)) {
          setCode(sessionCode);
          setCodeLoadSource('session');
          console.log('✅ 세션 코드 복원됨:', sessionCode.substring(0, 50) + '...');
          return;
        }
        
        // 2단계: 백엔드에서 마지막 제출 코드 조회
        console.log('2단계: 백엔드 마지막 제출 코드 조회 중...');
        const response = await apiService.loadProgress(problemId, sectionId, language);
        
        // 응답에서 코드 추출
        const backendCode = response?.codeString || response?.code || response;
        
        if (backendCode && typeof backendCode === 'string' && backendCode.trim() !== '' && backendCode !== getDefaultCode(language)) {
          setCode(backendCode);
          setCodeLoadSource('backend');
          console.log('✅ 백엔드 제출 코드 복원됨:', backendCode.substring(0, 50) + '...');
          return;
        }
        
        // 3단계: 둘 다 없으면 기본 코드 사용
        console.log('3단계: 기본 코드 사용');
        setCode(getDefaultCode(language));
        setCodeLoadSource('default');
        
      } catch (error) {
        console.log('코드 불러오기 실패:', error.message);
        // 에러 발생 시 기본 코드 설정
        setCode(getDefaultCode(language));
        setCodeLoadSource('default');
      }
    };

    loadCode();
  }, [problemId, sectionId, language, sessionId]); // sessionId 의존성 추가


  // Helper functions
  
  // 세션에 코드 저장
  const saveToSession = async () => {
    if (!sessionId || !code || code === getDefaultCode(language)) {
      return;
    }

    try {
      setSessionSaveStatus('saving');
      await indexedDBManager.saveSessionCode(problemId, sectionId, language, code);
      setSessionSaveStatus('saved');
      console.log('세션에 코드 저장 완료');
      
      // 2초 후 상태 초기화
      setTimeout(() => setSessionSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('세션 저장 실패:', error);
      setSessionSaveStatus('error');
      setTimeout(() => setSessionSaveStatus('idle'), 2000);
    }
  };

  // 세션에서 코드 불러오기
  const loadFromSession = async () => {
    if (!sessionId) return null;

    try {
      const savedData = await indexedDBManager.getSessionCode(problemId, sectionId, language);
      return savedData ? savedData.code : null;
    } catch (error) {
      console.error('세션 코드 불러오기 실패:', error);
      return null;
    }
  };

  // 제출 후 세션 정리
  const clearSessionAfterSubmission = async () => {
    if (!sessionId) return;

    try {
      await indexedDBManager.deleteSessionCode(problemId, sectionId, language);
      console.log('✅ 제출 후 세션 데이터 정리 완료');
      
      // 코드 로드 소스를 backend로 변경하여 다음 로드 시 백엔드에서 가져오도록 함
      setCodeLoadSource('backend');
      
      // 세션 정리 완료 메시지 표시
      setSessionCleared(true);
      setTimeout(() => setSessionCleared(false), 3000); // 3초 후 메시지 숨김
      
    } catch (error) {
      console.warn('세션 데이터 정리 실패:', error);
    }
  };

  // 패널 이동 처리
  const handlePanelMove = (draggedPanelId, targetPanelId) => {
    console.log(`드래그한 창: ${draggedPanelId}, 바꾸려는 창: ${targetPanelId}`);
    
    // 같은 패널이면 무시
    if (draggedPanelId === targetPanelId) {
      return;
    }
    
    setPanelLayout(currentLayout => {
      // 1. 드래그된 패널의 현재 위치 찾기
      let draggedPos = null;
      let targetPos = null;
      
      if (currentLayout.left === draggedPanelId) draggedPos = 'left';
      else if (currentLayout.topRight === draggedPanelId) draggedPos = 'topRight';
      else if (currentLayout.bottomRight === draggedPanelId) draggedPos = 'bottomRight';
      
      // 2. 타겟 패널의 현재 위치 찾기
      if (currentLayout.left === targetPanelId) targetPos = 'left';
      else if (currentLayout.topRight === targetPanelId) targetPos = 'topRight';
      else if (currentLayout.bottomRight === targetPanelId) targetPos = 'bottomRight';
      
      // 3. 둘 다 찾았으면 교환
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
          assignmentInfo={assignmentInfo}
          isSubmitting={isSubmitting}
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

        // 제출 성공 시 세션 데이터 정리
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

        // 제출 성공 시 세션 데이터 정리
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
    <DndProvider backend={HTML5Backend}>
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
            <option value="c">C</option>
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

export default ProblemSolvePage;
