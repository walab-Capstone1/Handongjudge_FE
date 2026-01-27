import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import "./CodingTestDetail.css";
import "../AdminPage/AssignmentStudentProgress.css";
import "../AdminPage/AssignmentManagementList.css";
import "../AdminPage/AssignmentTable.css";

const CodingTestDetail = () => {
  const { sectionId, quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [problems, setProblems] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [activeTab, setActiveTab] = useState("main"); // main, problems, submissions
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedProblems, setExpandedProblems] = useState(new Set());

  useEffect(() => {
    fetchSectionInfo();
    fetchQuizDetail();
    fetchQuizProblems();
    fetchSubmissions();
  }, [sectionId, quizId]);

  const fetchSectionInfo = async () => {
    try {
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      }
    } catch (error) {
      console.error('분반 정보 조회 실패:', error);
    }
  };

  const fetchQuizDetail = async () => {
    try {
      const response = await APIService.getQuizInfo(sectionId, quizId);
      const quizData = response?.data || response;
      setQuiz({
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
      setLoading(true);
      // 섹션의 학생 목록 조회
      const studentsResponse = await APIService.getSectionStudents(sectionId);
      const students = studentsResponse?.data || studentsResponse || [];
      
      // 각 학생별로 문제 풀이 현황 계산
      const submissionsData = students.map(student => {
        // TODO: 실제 제출 데이터는 백엔드 API에서 가져와야 함
        // 현재는 빈 데이터로 표시
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
    } finally {
      setLoading(false);
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

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <AdminLayout selectedSection={currentSection}>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
          <p>코딩테스트 정보를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!quiz) {
    return (
      <AdminLayout selectedSection={currentSection}>
        <div className="admin-no-data">
          <p>코딩테스트를 찾을 수 없습니다.</p>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: "main", label: "메인" },
    { id: "problems", label: "대회 문제" },
    { id: "submissions", label: "제출 상세정보" }
  ];

  return (
    <AdminLayout selectedSection={currentSection}>
      <div className="coding-test-detail-container">
        {/* 헤더 */}
        <div className="admin-page-header">
          <div className="admin-header-left">
            <button 
              className="admin-btn-back" 
              onClick={() => navigate(`/tutor/coding-tests/section/${sectionId}`)}
            >
              ← 돌아가기
            </button>
            <div>
              <h1 className="admin-page-title">{quiz.title}</h1>
              <p className="admin-page-subtitle">코딩테스트 관리</p>
            </div>
          </div>
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
                  <h2 className="section-title">코딩테스트 정보</h2>
                  <div className="quiz-info-grid">
                    <div className="info-item">
                      <label>제목</label>
                      <div className="info-value">{quiz.title}</div>
                    </div>
                    <div className="info-item">
                      <label>설명</label>
                      <div className="info-value">{quiz.description || '-'}</div>
                    </div>
                    <div className="info-item">
                      <label>시작 시간</label>
                      <div className="info-value">{formatDateTime(quiz.startTime)}</div>
                    </div>
                    <div className="info-item">
                      <label>종료 시간</label>
                      <div className="info-value">{formatDateTime(quiz.endTime)}</div>
                    </div>
                    <div className="info-item">
                      <label>상태</label>
                      <div className="info-value">{getStatusBadge(quiz.status)}</div>
                    </div>
                    <div className="info-item">
                      <label>문제 수</label>
                      <div className="info-value">{problems.length}개</div>
                    </div>
                  </div>
                </div>

                <div className="quiz-actions-section">
                  <h2 className="section-title">대회 제어</h2>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-start"
                      onClick={handleStart}
                      disabled={quiz.status === 'ACTIVE'}
                    >
                      시작
                    </button>
                    <button 
                      className="btn-action btn-stop"
                      onClick={handleStop}
                      disabled={quiz.status !== 'ACTIVE'}
                    >
                      정지
                    </button>
                    <button 
                      className="btn-action btn-end"
                      onClick={handleEnd}
                      disabled={quiz.status === 'ENDED'}
                    >
                      종료
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "problems" && (
              <div className="coding-test-problems-tab">
                <div className="problems-tab-header">
                  <h3 className="section-title">대회 문제</h3>
                  <span className="problems-count">총 {problems.length}개</span>
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
                          </tr>
                        </thead>
                        <tbody>
                          {problems.map((problem, index) => {
                            // TODO: 실제 제출 통계는 백엔드 API에서 가져와야 함
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
                {/* 문제별 통계 */}
                {problems.length > 0 && (
                  <div className="admin-problems-summary">
                    <div className="admin-summary-header">
                      <h3 className="admin-summary-title">문제별 제출 현황</h3>
                      <span className="admin-total-students-label">총 {submissions.length}명</span>
                    </div>
                    <div className="admin-problems-list">
                      {problems.map((problem, index) => {
                        const solvedCount = submissions.filter(student => 
                          student.solvedProblems?.includes(problem.id)
                        ).length;
                        const totalStudents = submissions.length;
                        const percentage = totalStudents > 0 ? Math.round((solvedCount / totalStudents) * 100) : 0;
                        const unsolvedCount = totalStudents - solvedCount;
                        const isExpanded = expandedProblems.has(problem.id);
                        
                        return (
                          <div key={problem.id} className={`admin-problem-stat-card ${isExpanded ? 'expanded' : ''}`}>
                            <div 
                              className="admin-problem-stat-header admin-clickable"
                              onClick={() => toggleProblem(problem.id)}
                            >
                              <div className="admin-header-left">
                                <span className="admin-problem-number">문제 {index + 1}</span>
                                <span className="admin-problem-title">{removeCopyLabel(problem.title)}</span>
                              </div>
                              <div className="admin-header-right">
                                <span className="admin-problem-summary">
                                  {solvedCount}/{totalStudents}명 완료 ({percentage}%)
                                </span>
                                <span className={`admin-toggle-icon ${isExpanded ? 'admin-expanded' : ''}`}>▼</span>
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="admin-problem-stat-details">
                                <div className="admin-problem-stat-info">
                                  <div className="admin-problem-stat-item admin-solved">
                                    <span className="admin-stat-label">완료</span>
                                    <div className="admin-stat-row">
                                      <span className="admin-stat-value">{solvedCount}명</span>
                                      <span className="admin-stat-percent">{percentage}%</span>
                                    </div>
                                  </div>
                                  <div className="admin-problem-stat-item admin-unsolved">
                                    <span className="admin-stat-label">미완료</span>
                                    <div className="admin-stat-row">
                                      <span className="admin-stat-value">{unsolvedCount}명</span>
                                      <span className="admin-stat-percent">{100 - percentage}%</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="admin-problem-stat-bar">
                                  <div 
                                    className="admin-problem-stat-fill admin-solved-fill"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                                            className={`admin-problem-badge ${isSolved ? 'solved' : 'unsolved'}`}
                                            title={`${removeCopyLabel(problem.title)} - ${isSolved ? '완료' : '미완료'}`}
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
    </AdminLayout>
  );
};

export default CodingTestDetail;

