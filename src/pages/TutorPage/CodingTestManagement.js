import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import "./CodingTestManagement.css";
import "../AdminPage/AssignmentStudentProgress.css";
import "../AdminPage/AssignmentManagementList.css";
import "../AdminPage/AssignmentTable.css";

const CodingTestManagement = () => {
  const { sectionId, quizId } = useParams();
  const navigate = useNavigate();
  
  const [quizzes, setQuizzes] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedQuizDetail, setSelectedQuizDetail] = useState(null);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState("main");
  const [expandedProblems, setExpandedProblems] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problemIds: []
  });
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [problemSearchTerm, setProblemSearchTerm] = useState('');
  const [currentProblemPage, setCurrentProblemPage] = useState(1);
  const PROBLEMS_PER_PAGE = 10;
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);

  useEffect(() => {
    if (sectionId) {
      fetchQuizzes();
      fetchSections();
      fetchAvailableProblems();
    }
  }, [sectionId]);

  useEffect(() => {
    if (quizId && sectionId) {
      fetchQuizDetail();
      fetchQuizProblems();
      fetchSubmissions();
    } else {
      setSelectedQuizDetail(null);
      setProblems([]);
      setSubmissions([]);
      setActiveTab("main");
    }
  }, [quizId, sectionId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await APIService.getQuizzesBySection(sectionId);
      const quizzesData = response?.data || response || [];
      
      // LocalDateTime을 Date로 변환
      const formattedQuizzes = quizzesData.map(quiz => ({
        ...quiz,
        startTime: new Date(quiz.startTime),
        endTime: new Date(quiz.endTime)
      }));
      
      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error('코딩 테스트 조회 실패:', error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      }
    } catch (error) {
      console.error('분반 정보 조회 실패:', error);
      setSections([]);
    }
  };

  const fetchAvailableProblems = async () => {
    try {
      // 섹션의 모든 과제에서 문제들을 가져옴
      const assignments = await APIService.getAssignmentsBySection(sectionId);
      const assignmentsData = assignments?.data || assignments || [];
      
      const problemMap = new Map();
      
      for (const assignment of assignmentsData) {
        try {
          const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignment.id);
          const problems = problemsResponse?.data?.problems || problemsResponse?.problems || problemsResponse || [];
          
          if (Array.isArray(problems)) {
            problems.forEach(problem => {
              if (!problemMap.has(problem.id)) {
                problemMap.set(problem.id, {
                  id: problem.id,
                  title: problem.title,
                  description: problem.description
                });
              }
            });
          }
        } catch (error) {
          console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
        }
      }
      
      setAvailableProblems(Array.from(problemMap.values()));
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setAvailableProblems([]);
    }
  };

  const fetchAllProblems = async () => {
    try {
      const response = await APIService.getAllProblems();
      let problemsData = [];
      if (Array.isArray(response)) {
        problemsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        problemsData = response.data;
      } else if (response?.data && !Array.isArray(response.data)) {
        problemsData = [response.data];
      } else if (response && typeof response === 'object') {
        problemsData = Object.values(response);
      }
      setAllProblems(problemsData);
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setAllProblems([]);
    }
  };

  const getFilteredProblems = () => {
    let filtered = allProblems;
    if (problemSearchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(problemSearchTerm.toLowerCase()) ||
        p.id?.toString().includes(problemSearchTerm)
      );
    }
    return filtered;
  };

  const getPaginatedProblems = () => {
    const filtered = getFilteredProblems();
    const startIndex = (currentProblemPage - 1) * PROBLEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE);
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      '1': '쉬움',
      '2': '보통',
      '3': '어려움'
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      '1': '#10b981',
      '2': '#f59e0b',
      '3': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  const handleCreateQuiz = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      problemIds: []
    });
    setSelectedProblemIds([]);
    setShowCreateModal(true);
  };

  const handleEditQuiz = async (quiz) => {
    try {
      // 문제 목록 조회
      const problemsResponse = await APIService.getQuizProblems(sectionId, quiz.id);
      const problemsData = problemsResponse?.data || problemsResponse || [];
      const problemIds = problemsData.map(p => p.problemId);
      
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        startTime: quiz.startTime.toISOString().slice(0, 16),
        endTime: quiz.endTime.toISOString().slice(0, 16),
        problemIds: problemIds
      });
      setSelectedProblemIds(problemIds);
      setSelectedQuiz(quiz);
      setShowEditModal(true);
    } catch (error) {
      console.error('코딩 테스트 정보 조회 실패:', error);
      alert('코딩 테스트 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleDeleteQuiz = async (quizIdToDelete) => {
    if (window.confirm('정말로 이 코딩 테스트를 삭제하시겠습니까?')) {
      try {
        await APIService.deleteQuiz(sectionId, quizIdToDelete);
        fetchQuizzes();
        if (quizIdToDelete === quizId) {
          navigate(`/tutor/coding-tests/section/${sectionId}`);
        }
        alert('코딩 테스트가 삭제되었습니다.');
      } catch (error) {
        console.error('코딩 테스트 삭제 실패:', error);
        alert('코딩 테스트 삭제에 실패했습니다.');
      }
    }
  };

  const fetchQuizDetail = async () => {
    try {
      const response = await APIService.getQuizInfo(sectionId, quizId);
      const quizData = response?.data || response;
      setSelectedQuizDetail({
        ...quizData,
        startTime: new Date(quizData.startTime),
        endTime: new Date(quizData.endTime)
      });
    } catch (error) {
      console.error('코딩테스트 정보 조회 실패:', error);
      alert('코딩테스트 정보를 불러오는데 실패했습니다.');
    }
  };

  const fetchQuizProblems = async () => {
    try {
      const response = await APIService.getQuizProblems(sectionId, quizId);
      const problemsData = response?.data || response || [];
      setProblems(problemsData.map(p => ({
        id: p.problemId,
        title: p.title,
        description: p.description || '',
        order: p.problemOrder
      })));
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setProblems([]);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // 섹션의 학생 목록 조회
      const studentsResponse = await APIService.getSectionStudents(sectionId);
      const students = studentsResponse?.data || studentsResponse || [];
      
      // 각 학생별로 문제 풀이 현황 계산
      const submissionsData = students.map(student => {
        // TODO: 실제 제출 데이터는 백엔드 API에서 가져와야 함
        return {
          userId: student.id || student.userId,
          studentId: student.email || student.studentId,
          studentName: student.name || student.studentName,
          solvedProblems: [],
          problemSubmissionTimes: {}
        };
      });
      
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('제출 현황 조회 실패:', error);
      setSubmissions([]);
    }
  };

  const handleStart = async () => {
    // TODO: 코딩테스트 시작 API 호출
    alert('시작 기능은 백엔드 API 구현이 필요합니다.');
  };

  const handleStop = async () => {
    // TODO: 코딩테스트 정지 API 호출
    alert('정지 기능은 백엔드 API 구현이 필요합니다.');
  };

  const handleEnd = async () => {
    if (window.confirm('정말로 코딩테스트를 종료하시겠습니까?')) {
      // TODO: 코딩테스트 종료 API 호출
      alert('종료 기능은 백엔드 API 구현이 필요합니다.');
    }
  };

  const toggleProblem = (problemId) => {
    setExpandedProblems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(problemId)) {
        newSet.delete(problemId);
      } else {
        newSet.add(problemId);
      }
      return newSet;
    });
  };

  const handleSubmitCreate = async () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert('시작 시간과 종료 시간을 입력해주세요.');
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    if (selectedProblemIds.length === 0) {
      alert('최소 1개 이상의 문제를 선택해주세요.');
      return;
    }

    try {
      // 문제 복사본 생성 (퀴즈는 모두 고유 복사본으로 관리)
      const copiedProblemIds = [];
      for (const problemId of selectedProblemIds) {
        const newProblemId = await APIService.copyProblem(problemId);
        copiedProblemIds.push(newProblemId);
      }

      const quizData = {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problemIds: copiedProblemIds
      };
      
      await APIService.createQuiz(sectionId, quizData);
      setShowCreateModal(false);
      fetchQuizzes();
      alert('코딩 테스트가 생성되었습니다.');
    } catch (error) {
      console.error('코딩 테스트 생성 실패:', error);
      alert('코딩 테스트 생성에 실패했습니다.');
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      alert('시작 시간과 종료 시간을 입력해주세요.');
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    try {
      // 문제 복사본 생성 (퀴즈는 모두 고유 복사본으로 관리)
      const copiedProblemIds = [];
      for (const problemId of selectedProblemIds) {
        const newProblemId = await APIService.copyProblem(problemId);
        copiedProblemIds.push(newProblemId);
      }

      const quizData = {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        problemIds: copiedProblemIds
      };
      
      await APIService.updateQuiz(sectionId, selectedQuiz.id, quizData);
      setShowEditModal(false);
      setSelectedQuiz(null);
      fetchQuizzes();
      alert('코딩 테스트가 수정되었습니다.');
    } catch (error) {
      console.error('코딩 테스트 수정 실패:', error);
      alert('코딩 테스트 수정에 실패했습니다.');
    }
  };

  const handleProblemToggle = (problemId) => {
    setSelectedProblemIds(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  const handleSelectAllProblems = () => {
    const filtered = getFilteredProblems();
    const allSelected = filtered.length > 0 && 
      filtered.every(p => selectedProblemIds.includes(p.id));
    
    if (allSelected) {
      // 모든 문제 선택 해제
      const filteredIds = filtered.map(p => p.id);
      setSelectedProblemIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // 모든 문제 선택
      setSelectedProblemIds(prev => {
        const newIds = filtered.map(p => p.id);
        const combined = [...new Set([...prev, ...newIds])];
        return combined;
      });
    }
  };

  const handleAddProblemToQuiz = async (problemId) => {
    try {
      // 문제 복사본 생성 후 퀴즈에 추가 (퀴즈는 모두 고유 복사본으로 관리)
      const newProblemId = await APIService.copyProblem(problemId);
      
      // 퀴즈 수정 API를 통해 문제 추가 (기존 문제 + 새 문제)
      const currentProblemIds = problems.map(p => p.id);
      const updatedProblemIds = [...currentProblemIds, newProblemId];
      
      const quizData = {
        title: selectedQuizDetail.title,
        description: selectedQuizDetail.description || '',
        startTime: selectedQuizDetail.startTime.toISOString(),
        endTime: selectedQuizDetail.endTime.toISOString(),
        problemIds: updatedProblemIds
      };
      
      await APIService.updateQuiz(sectionId, quizId, quizData);
      fetchQuizProblems(); // 문제 목록 새로고침
      alert('문제가 추가되었습니다.');
    } catch (error) {
      console.error('문제 추가 실패:', error);
      alert('문제 추가에 실패했습니다.');
    }
  };

  const handleRemoveProblemFromQuiz = async (problemId) => {
    if (!window.confirm('정말로 이 문제를 코딩테스트에서 제거하시겠습니까?')) {
      return;
    }
    try {
      // TODO: 코딩테스트에서 문제 제거 API 호출
      // await APIService.removeProblemFromQuiz(quizId, problemId);
      alert('문제 제거 기능은 백엔드 API 구현이 필요합니다.');
      // fetchQuizProblems(); // 문제 목록 새로고침
    } catch (error) {
      console.error('문제 제거 실패:', error);
      alert('문제 제거에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-badge active">진행중</span>;
      case 'WAITING':
        return <span className="status-badge waiting">대기중</span>;
      case 'ENDED':
        return <span className="status-badge ended">종료</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || quiz.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (showProblemModal || showAddProblemModal) {
      fetchAllProblems();
    }
  }, [showProblemModal, showAddProblemModal]);

  // 상세 보기 모드
  if (quizId && selectedQuizDetail) {
    const tabs = [
      { id: "main", label: "메인" },
      { id: "problems", label: "대회 문제" },
      { id: "submissions", label: "제출 상세정보" }
    ];

    return (
      <TutorLayout>
        <div className="coding-test-management">
          <SectionNavigation 
            title="코딩 테스트 관리"
            sectionId={sectionId}
            sections={sections}
            currentSection={currentSection}
            showSearch={false}
          />
          
          <div className="coding-test-detail-wrapper">
            {/* 헤더 */}
            <div className="coding-test-detail-header">
              <button 
                className="coding-test-back-btn" 
                onClick={() => navigate(`/tutor/coding-tests/section/${sectionId}`)}
              >
                ← 목록으로
              </button>
              <h1 className="coding-test-detail-title">{selectedQuizDetail.title}</h1>
            </div>

            <div className="coding-test-detail-content">
              {/* 왼쪽 탭 메뉴 */}
              <div className="coding-test-sidebar">
                <nav className="coding-test-tabs">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      className={`coding-test-tab ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 오른쪽 콘텐츠 영역 */}
              <div className="coding-test-main-content">
                {activeTab === "main" && (
                  <div className="coding-test-main-tab">
                    <div className="quiz-info-section">
                      <div className="quiz-info-header">
                        <h2 className="quiz-info-title">코딩테스트 정보</h2>
                        <div className="quiz-control-buttons">
                          <button 
                            className="quiz-control-btn quiz-btn-start"
                            onClick={handleStart}
                            disabled={selectedQuizDetail.status === 'ACTIVE'}
                          >
                            시작
                          </button>
                          <button 
                            className="quiz-control-btn quiz-btn-stop"
                            onClick={handleStop}
                            disabled={selectedQuizDetail.status !== 'ACTIVE'}
                          >
                            정지
                          </button>
                          <button 
                            className="quiz-control-btn quiz-btn-end"
                            onClick={handleEnd}
                            disabled={selectedQuizDetail.status === 'ENDED'}
                          >
                            종료
                          </button>
                        </div>
                      </div>
                      <div className="quiz-info-grid">
                        <div className="info-item">
                          <label>제목</label>
                          <div className="info-value">{selectedQuizDetail.title}</div>
                        </div>
                        <div className="info-item">
                          <label>설명</label>
                          <div className="info-value">{selectedQuizDetail.description || '-'}</div>
                        </div>
                        <div className="info-item">
                          <label>시작 시간</label>
                          <div className="info-value">{formatDateTime(selectedQuizDetail.startTime)}</div>
                        </div>
                        <div className="info-item">
                          <label>종료 시간</label>
                          <div className="info-value">{formatDateTime(selectedQuizDetail.endTime)}</div>
                        </div>
                        <div className="info-item">
                          <label>상태</label>
                          <div className="info-value">{getStatusBadge(selectedQuizDetail.status)}</div>
                        </div>
                        <div className="info-item">
                          <label>문제 수</label>
                          <div className="info-value">{problems.length}개</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "problems" && (
                  <div className="coding-test-problems-tab">
                    <div className="problems-tab-header">
                      <h3 className="section-title">대회 문제</h3>
                      <div className="problems-tab-header-right">
                        <span className="problems-count">총 {problems.length}개</span>
                        <button 
                          className="problems-add-btn"
                          onClick={() => {
                            setShowAddProblemModal(true);
                            setSelectedProblemIds(problems.map(p => p.id));
                          }}
                        >
                          + 문제 추가
                        </button>
                      </div>
                    </div>
                    <div className="problems-list-container">
                      {problems.length === 0 ? (
                        <div className="admin-no-data">
                          <p>등록된 문제가 없습니다.</p>
                        </div>
                      ) : (
                        <div className="problems-table-container">
                          <table className="problems-table">
                            <thead>
                              <tr>
                                <th>문제 번호</th>
                                <th>제목</th>
                                <th>상태</th>
                                <th>제출수</th>
                                <th>정답률</th>
                                <th>관리</th>
                              </tr>
                            </thead>
                            <tbody>
                              {problems.map((problem, index) => {
                                const submissionCount = 0;
                                const correctRate = 0;
                                
                                return (
                                  <tr key={problem.id}>
                                    <td className="problem-number">{index + 1}</td>
                                    <td className="problem-title-cell">
                                      <div className="problem-title-main">{removeCopyLabel(problem.title)}</div>
                                      {problem.description && (
                                        <div className="problem-description-preview">
                                          {problem.description.length > 100 
                                            ? problem.description.substring(0, 100) + '...'
                                            : problem.description}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <span className="problem-status-badge">-</span>
                                    </td>
                                    <td>{submissionCount}회</td>
                                    <td>{correctRate}%</td>
                                    <td>
                                      <button
                                        className="problem-remove-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveProblemFromQuiz(problem.id);
                                        }}
                                      >
                                        제거
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "submissions" && (
                  <div className="coding-test-submissions-tab">
                    {/* 필터 */}
                    <div className="admin-filters-section">
                      <div className="admin-search-box">
                        <input
                          type="text"
                          className="admin-search-input"
                          placeholder="학생 이름 또는 학번 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="admin-status-filters">
                        <button 
                          className={`admin-filter-btn ${filterStatus === 'ALL' ? 'admin-active' : ''}`}
                          onClick={() => setFilterStatus('ALL')}
                        >
                          전체
                        </button>
                        <button 
                          className={`admin-filter-btn ${filterStatus === 'COMPLETED' ? 'admin-active' : ''}`}
                          onClick={() => setFilterStatus('COMPLETED')}
                        >
                          완료
                        </button>
                        <button 
                          className={`admin-filter-btn ${filterStatus === 'IN_PROGRESS' ? 'admin-active' : ''}`}
                          onClick={() => setFilterStatus('IN_PROGRESS')}
                        >
                          진행중
                        </button>
                        <button 
                          className={`admin-filter-btn ${filterStatus === 'NOT_STARTED' ? 'admin-active' : ''}`}
                          onClick={() => setFilterStatus('NOT_STARTED')}
                        >
                          미시작
                        </button>
                      </div>
                    </div>

                    {/* 학생 목록 */}
                    <div className="admin-students-list">
                      {(() => {
                        const getCompletionStatus = (student) => {
                          const totalProblems = problems.length;
                          const solvedProblems = student.solvedProblems?.length || 0;
                          
                          if (solvedProblems === 0) return 'NOT_STARTED';
                          if (solvedProblems === totalProblems) return 'COMPLETED';
                          return 'IN_PROGRESS';
                        };

                        const getStatusBadge = (status) => {
                          switch(status) {
                            case 'COMPLETED':
                              return <span className="admin-status-badge admin-completed">완료</span>;
                            case 'IN_PROGRESS':
                              return <span className="admin-status-badge admin-in-progress">진행중</span>;
                            case 'NOT_STARTED':
                              return <span className="admin-status-badge admin-not-started">미시작</span>;
                            default:
                              return null;
                          }
                        };

                        const getProgressPercentage = (student) => {
                          const totalProblems = problems.length;
                          const solvedProblems = student.solvedProblems?.length || 0;
                          return totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
                        };

                        const filteredStudents = submissions.filter(student => {
                          const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                               student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          const status = getCompletionStatus(student);
                          const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
                          
                          return matchesSearch && matchesStatus;
                        });

                        if (filteredStudents.length === 0) {
                          return (
                            <div className="admin-no-data">
                              <p>조건에 맞는 학생이 없습니다.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="admin-table-container">
                            <table className="admin-students-table">
                              <thead>
                                <tr>
                                  <th>학번</th>
                                  <th>이름</th>
                                  <th>진행 상태</th>
                                  <th>완료율</th>
                                  <th>문제별 풀이 현황</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredStudents.map((student) => {
                                  const status = getCompletionStatus(student);
                                  const percentage = getProgressPercentage(student);
                                  
                                  return (
                                    <tr key={student.userId}>
                                      <td className="student-id">{student.studentId}</td>
                                      <td className="student-name">{student.studentName}</td>
                                      <td>{getStatusBadge(status)}</td>
                                      <td>
                                        <div className="admin-progress-cell">
                                          <div className="admin-mini-progress-bar">
                                            <div 
                                              className="admin-mini-progress-fill"
                                              style={{ width: `${percentage}%` }}
                                            ></div>
                                          </div>
                                          <span className="admin-progress-text">
                                            {student.solvedProblems?.length || 0}/{problems.length}
                                          </span>
                                        </div>
                                      </td>
                                      <td>
                                        <div className="admin-problems-status">
                                          {problems.map((problem, index) => {
                                            const isSolved = student.solvedProblems?.includes(problem.id);
                                            return (
                                              <div 
                                                key={problem.id}
                                                className={`admin-problem-badge ${isSolved ? 'solved' : 'unsolved'} ${isSolved ? 'clickable' : ''}`}
                                                title={`${removeCopyLabel(problem.title)} - ${isSolved ? '완료 (클릭하여 문제 보기)' : '미완료'}`}
                                                onClick={() => {
                                                  if (isSolved) {
                                                    navigate(`/sections/${sectionId}/coding-quiz/${quizId}?problemId=${problem.id}`);
                                                  }
                                                }}
                                                style={isSolved ? { cursor: 'pointer' } : {}}
                                              >
                                                {index + 1}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 문제 추가 모달 (대회 문제 탭용) */}
          {showAddProblemModal && (
            <div 
              className="coding-test-problem-select-modal-overlay" 
              onClick={() => {
                setShowAddProblemModal(false);
                setProblemSearchTerm('');
                setCurrentProblemPage(1);
              }}
            >
              <div 
                className="coding-test-problem-select-modal-content" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="coding-test-problem-select-modal-header">
                  <h2>문제 추가 - {selectedQuizDetail?.title}</h2>
                  <button 
                    className="coding-test-problem-select-modal-close"
                    onClick={() => {
                      setShowAddProblemModal(false);
                      setProblemSearchTerm('');
                      setCurrentProblemPage(1);
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div className="coding-test-problem-select-modal-body">
                  <div className="coding-test-problem-select-modal-filter-section">
                    <div className="coding-test-problem-select-modal-search">
                      <input
                        type="text"
                        placeholder="문제명 또는 ID로 검색..."
                        value={problemSearchTerm}
                        onChange={(e) => {
                          setProblemSearchTerm(e.target.value);
                          setCurrentProblemPage(1);
                        }}
                        className="coding-test-problem-select-modal-search-input"
                      />
                    </div>
                  </div>

                  {getFilteredProblems().length > 0 ? (
                    <>
                      <div className="coding-test-problem-select-modal-actions">
                        <button
                          className="coding-test-problem-select-modal-select-all"
                          onClick={handleSelectAllProblems}
                        >
                          {getFilteredProblems().length > 0 &&
                           getFilteredProblems().every(p => selectedProblemIds.includes(p.id))
                            ? '전체 해제' : '전체 선택'}
                        </button>
                        <span className="coding-test-problem-select-modal-selected-count">
                          {selectedProblemIds.length}개 선택됨
                        </span>
                        <span className="coding-test-problem-select-modal-filter-count">
                          총 {getFilteredProblems().length}개 문제
                        </span>
                      </div>

                      <div className="coding-test-problem-select-modal-problems-list">
                        {getPaginatedProblems().map((problem) => {
                          const isSelected = selectedProblemIds.includes(problem.id);
                          const isAlreadyAdded = problems.some(p => p.id === problem.id);
                          
                          return (
                            <div 
                              key={problem.id}
                              className={`coding-test-problem-select-modal-problem-item ${
                                isSelected && !isAlreadyAdded ? 'selected' : ''
                              } ${isAlreadyAdded ? 'already-added' : ''}`}
                              onClick={() => !isAlreadyAdded && handleProblemToggle(problem.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected && !isAlreadyAdded}
                                onChange={() => !isAlreadyAdded && handleProblemToggle(problem.id)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={isAlreadyAdded}
                              />
                              <div className="coding-test-problem-select-modal-problem-info">
                                <div className="coding-test-problem-select-modal-problem-title-wrapper">
                                  <span className="coding-test-problem-select-modal-problem-id-badge">
                                    #{problem.id}
                                  </span>
                                  <span className="coding-test-problem-select-modal-problem-title">
                                    {problem.title}
                                  </span>
                                  {isAlreadyAdded && (
                                    <span className="coding-test-problem-select-modal-already-added-badge">
                                      이미 추가됨
                                    </span>
                                  )}
                                </div>
                                <div className="coding-test-problem-select-modal-problem-meta">
                                  {problem.difficulty && (
                                    <span 
                                      className="coding-test-problem-select-modal-problem-difficulty"
                                      style={{ 
                                        backgroundColor: getDifficultyColor(problem.difficulty) + '20',
                                        color: getDifficultyColor(problem.difficulty)
                                      }}
                                    >
                                      {getDifficultyLabel(problem.difficulty)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {getTotalPages() > 1 && (
                        <div className="coding-test-problem-select-modal-pagination">
                          <button
                            className="coding-test-problem-select-modal-pagination-btn"
                            onClick={() => setCurrentProblemPage(prev => Math.max(1, prev - 1))}
                            disabled={currentProblemPage === 1}
                          >
                            이전
                          </button>
                          <span className="coding-test-problem-select-modal-pagination-info">
                            {currentProblemPage} / {getTotalPages()}
                          </span>
                          <button
                            className="coding-test-problem-select-modal-pagination-btn"
                            onClick={() => setCurrentProblemPage(prev => Math.min(getTotalPages(), prev + 1))}
                            disabled={currentProblemPage === getTotalPages()}
                          >
                            다음
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="coding-test-problem-select-modal-empty">
                      {problemSearchTerm ? '검색 결과가 없습니다.' : '사용 가능한 문제가 없습니다.'}
                    </div>
                  )}
                </div>

                <div className="coding-test-problem-select-modal-footer">
                  <button 
                    className="coding-test-problem-select-modal-btn-cancel"
                    onClick={() => {
                      setShowAddProblemModal(false);
                      setProblemSearchTerm('');
                      setCurrentProblemPage(1);
                    }}
                  >
                    취소
                  </button>
                  <button 
                    className="coding-test-problem-select-modal-btn-submit"
                    onClick={async () => {
                      const newProblemIds = selectedProblemIds.filter(id => 
                        !problems.some(p => p.id === id)
                      );
                      if (newProblemIds.length === 0) {
                        alert('추가할 문제를 선택해주세요.');
                        return;
                      }
                      try {
                        // 문제 복사본 생성 후 퀴즈에 추가 (퀴즈는 모두 고유 복사본으로 관리)
                        const copiedProblemIds = [];
                        for (const problemId of newProblemIds) {
                          const newProblemId = await APIService.copyProblem(problemId);
                          copiedProblemIds.push(newProblemId);
                        }
                        
                        // 퀴즈 수정 API를 통해 문제 추가 (기존 문제 + 새 문제)
                        const currentProblemIds = problems.map(p => p.id);
                        const updatedProblemIds = [...currentProblemIds, ...copiedProblemIds];
                        
                        const quizData = {
                          title: selectedQuizDetail.title,
                          description: selectedQuizDetail.description || '',
                          startTime: selectedQuizDetail.startTime.toISOString(),
                          endTime: selectedQuizDetail.endTime.toISOString(),
                          problemIds: updatedProblemIds
                        };
                        
                        await APIService.updateQuiz(sectionId, quizId, quizData);
                        setShowAddProblemModal(false);
                        setProblemSearchTerm('');
                        setCurrentProblemPage(1);
                        fetchQuizProblems();
                        alert(`${newProblemIds.length}개의 문제가 추가되었습니다.`);
                      } catch (error) {
                        console.error('문제 추가 실패:', error);
                        alert('문제 추가에 실패했습니다.');
                      }
                    }}
                  >
                    추가 ({selectedProblemIds.filter(id => !problems.some(p => p.id === id)).length}개)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </TutorLayout>
    );
  }

  // 목록 보기 모드
  return (
    <TutorLayout>
      <div className="coding-test-management">
        <SectionNavigation 
          title="코딩 테스트 관리"
          sectionId={sectionId}
          sections={sections}
          currentSection={currentSection}
          showSearch={true}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="coding-test-content">
          <div className="coding-test-header">
            <div className="coding-test-header-left">
              <h2>코딩 테스트 목록</h2>
              <span className="quiz-count">
                전체 {quizzes.length}개 / 표시 {filteredQuizzes.length}개
              </span>
            </div>
            <div className="coding-test-header-right">
              <select 
                className="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">전체</option>
                <option value="WAITING">대기중</option>
                <option value="ACTIVE">진행중</option>
                <option value="ENDED">종료</option>
              </select>
              <button 
                className="btn-create-quiz"
                onClick={handleCreateQuiz}
              >
                + 새 코딩 테스트 만들기
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>로딩 중...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="empty-state">
              <p>등록된 코딩 테스트가 없습니다.</p>
            </div>
          ) : (
            <div className="quiz-table-container">
              <table className="coding-test-table">
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>설명</th>
                    <th>시작 시간</th>
                    <th>종료 시간</th>
                    <th>문제 수</th>
                    <th>상태</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map(quiz => (
                    <tr 
                      key={quiz.id}
                      className="quiz-row-clickable"
                      onClick={() => {
                        navigate(`/tutor/coding-tests/section/${sectionId}/${quiz.id}`);
                      }}
                    >
                      <td className="quiz-title">{quiz.title}</td>
                      <td className="quiz-description">{quiz.description || '-'}</td>
                      <td>{formatDateTime(quiz.startTime)}</td>
                      <td>{formatDateTime(quiz.endTime)}</td>
                      <td>{quiz.problemCount || 0}개</td>
                      <td>{getStatusBadge(quiz.status)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="quiz-actions">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditQuiz(quiz)}
                          >
                            수정
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 생성 모달 */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>새 코딩 테스트 만들기</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>제목 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="코딩 테스트 제목을 입력하세요"
                  />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="코딩 테스트 설명을 입력하세요"
                    rows="4"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>시작 시간 *</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>종료 시간 *</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>문제 선택 *</label>
                  <div className="problem-select-section">
                    <button
                      type="button"
                      className="btn-select-problems"
                      onClick={() => setShowProblemModal(true)}
                    >
                      문제 선택 ({selectedProblemIds.length}개 선택됨)
                    </button>
                    {selectedProblemIds.length > 0 && (
                      <span className="selected-count">
                        {selectedProblemIds.length}개의 문제가 선택되었습니다.
                      </span>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    취소
                  </button>
                  <button 
                    className="btn-submit"
                    onClick={handleSubmitCreate}
                  >
                    생성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 수정 모달 */}
        {showEditModal && selectedQuiz && (
          <div className="modal-overlay" onClick={() => {
            setShowEditModal(false);
            setSelectedQuiz(null);
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>코딩 테스트 수정</h2>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedQuiz(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>제목 *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="코딩 테스트 제목을 입력하세요"
                  />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="코딩 테스트 설명을 입력하세요"
                    rows="4"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>시작 시간 *</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>종료 시간 *</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>문제 선택 *</label>
                  <div className="problem-select-section">
                    <button
                      type="button"
                      className="btn-select-problems"
                      onClick={() => setShowProblemModal(true)}
                    >
                      문제 선택 ({selectedProblemIds.length}개 선택됨)
                    </button>
                    {selectedProblemIds.length > 0 && (
                      <span className="selected-count">
                        {selectedProblemIds.length}개의 문제가 선택되었습니다.
                      </span>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedQuiz(null);
                    }}
                  >
                    취소
                  </button>
                  <button 
                    className="btn-submit"
                    onClick={handleSubmitEdit}
                  >
                    수정
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 문제 선택 모달 (생성/수정용) */}
        {showProblemModal && (
          <div 
            className="coding-test-problem-select-modal-overlay" 
            onClick={() => {
              setShowProblemModal(false);
              setProblemSearchTerm('');
              setCurrentProblemPage(1);
            }}
          >
            <div 
              className="coding-test-problem-select-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="coding-test-problem-select-modal-header">
                <h2>문제 선택</h2>
                <button 
                  className="coding-test-problem-select-modal-close"
                  onClick={() => {
                    setShowProblemModal(false);
                    setProblemSearchTerm('');
                    setCurrentProblemPage(1);
                  }}
                >
                  ×
                </button>
              </div>
              
              <div className="coding-test-problem-select-modal-body">
                <div className="coding-test-problem-select-modal-filter-section">
                  <div className="coding-test-problem-select-modal-search">
                  <input
                    type="text"
                      placeholder="문제명 또는 ID로 검색..."
                    value={problemSearchTerm}
                      onChange={(e) => {
                        setProblemSearchTerm(e.target.value);
                        setCurrentProblemPage(1);
                      }}
                      className="coding-test-problem-select-modal-search-input"
                    />
                  </div>
                </div>

                {getFilteredProblems().length > 0 ? (
                  <>
                    <div className="coding-test-problem-select-modal-actions">
                  <button
                        className="coding-test-problem-select-modal-select-all"
                    onClick={handleSelectAllProblems}
                  >
                        {getFilteredProblems().length > 0 &&
                         getFilteredProblems().every(p => selectedProblemIds.includes(p.id))
                          ? '전체 해제' : '전체 선택'}
                  </button>
                      <span className="coding-test-problem-select-modal-selected-count">
                        {selectedProblemIds.length}개 선택됨
                      </span>
                      <span className="coding-test-problem-select-modal-filter-count">
                        총 {getFilteredProblems().length}개 문제
                      </span>
                </div>

                    <div className="coding-test-problem-select-modal-problems-list">
                      {getPaginatedProblems().map((problem) => {
                        const isSelected = selectedProblemIds.includes(problem.id);
                        
                        return (
                      <div
                        key={problem.id}
                            className={`coding-test-problem-select-modal-problem-item ${
                              isSelected ? 'selected' : ''
                            }`}
                        onClick={() => handleProblemToggle(problem.id)}
                      >
                        <input
                          type="checkbox"
                              checked={isSelected}
                          onChange={() => handleProblemToggle(problem.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="coding-test-problem-select-modal-problem-info">
                              <div className="coding-test-problem-select-modal-problem-title-wrapper">
                                <span className="coding-test-problem-select-modal-problem-id-badge">
                                  #{problem.id}
                                </span>
                                <span className="coding-test-problem-select-modal-problem-title">
                                  {problem.title}
                                </span>
                      </div>
                              <div className="coding-test-problem-select-modal-problem-meta">
                                {problem.difficulty && (
                                  <span 
                                    className="coding-test-problem-select-modal-problem-difficulty"
                                    style={{ 
                                      backgroundColor: getDifficultyColor(problem.difficulty) + '20',
                                      color: getDifficultyColor(problem.difficulty)
                                    }}
                                  >
                                    {getDifficultyLabel(problem.difficulty)}
                                  </span>
                  )}
                </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {getTotalPages() > 1 && (
                      <div className="coding-test-problem-select-modal-pagination">
                  <button 
                          className="coding-test-problem-select-modal-pagination-btn"
                          onClick={() => setCurrentProblemPage(prev => Math.max(1, prev - 1))}
                          disabled={currentProblemPage === 1}
                        >
                          이전
                        </button>
                        <span className="coding-test-problem-select-modal-pagination-info">
                          {currentProblemPage} / {getTotalPages()}
                        </span>
                        <button
                          className="coding-test-problem-select-modal-pagination-btn"
                          onClick={() => setCurrentProblemPage(prev => Math.min(getTotalPages(), prev + 1))}
                          disabled={currentProblemPage === getTotalPages()}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="coding-test-problem-select-modal-empty">
                    {problemSearchTerm ? '검색 결과가 없습니다.' : '사용 가능한 문제가 없습니다.'}
                  </div>
                )}
              </div>

              <div className="coding-test-problem-select-modal-footer">
                <button 
                  className="coding-test-problem-select-modal-btn-cancel"
                  onClick={() => {
                    setShowProblemModal(false);
                    setProblemSearchTerm('');
                    setCurrentProblemPage(1);
                  }}
                  >
                    닫기
                  </button>
                  <button 
                  className="coding-test-problem-select-modal-btn-submit"
                    onClick={() => setShowProblemModal(false)}
                  >
                    확인 ({selectedProblemIds.length}개 선택됨)
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default CodingTestManagement;

