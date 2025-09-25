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

  // 자동저장 관련 상태
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

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

  // 자동저장 로직
  useEffect(() => {
    // 페이지 로드 시 로컬스토리지에서 코드 복원
    const savedCodeKey = `code_${problemId}_${language}`;
    const savedCode = localStorage.getItem(savedCodeKey);
    if (savedCode && savedCode !== getDefaultCode(language)) {
      setCode(savedCode);
      console.log('코드 복원됨:', savedCodeKey);
    }
  }, [problemId, language]);

  // 코드 변경 시 로컬스토리지에 자동저장
  useEffect(() => {
    if (code && code !== getDefaultCode(language)) {
      const savedCodeKey = `code_${problemId}_${language}`;
      localStorage.setItem(savedCodeKey, code);
      localStorage.setItem(`${savedCodeKey}_timestamp`, Date.now().toString());
      setAutoSaveStatus('saved');
      
      // 1초 후 상태 초기화
      const timer = setTimeout(() => {
        setAutoSaveStatus('idle');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [code, problemId, language]);

  // 주기적으로 DB에 저장 (3분마다)
  useEffect(() => {
    const saveToDatabase = async () => {
      if (!code || code === getDefaultCode(language) || isSaving) return;
      
      setIsSaving(true);
      setAutoSaveStatus('saving');
      
      try {
        // API 호출하여 DB에 저장
        await apiService.saveProgress(problemId, sectionId, language, code);
        setLastSavedTime(new Date());
        setAutoSaveStatus('saved');
        console.log('코드가 DB에 저장되었습니다');
      } catch (error) {
        console.error('DB 저장 실패:', error);
        setAutoSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    };

    const interval = setInterval(saveToDatabase, 3 * 60 * 1000); // 3분마다
    return () => clearInterval(interval);
  }, [code, problemId, sectionId, language, isSaving]);

  // Helper functions
  
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
          autoSaveStatus={autoSaveStatus}
          lastSavedTime={lastSavedTime}
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
