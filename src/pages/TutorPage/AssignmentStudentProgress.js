import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import "./AssignmentStudentProgress.css";


const AssignmentStudentProgress = () => {
  const { sectionId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, COMPLETED, IN_PROGRESS, NOT_STARTED
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedProblems, setExpandedProblems] = useState(new Set());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submissionStats, setSubmissionStats] = useState({});
  const [progressSearchTerm, setProgressSearchTerm] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCodeData, setSelectedCodeData] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    fetchSectionInfo();
    fetchAssignments();
    if (assignmentId) {
      fetchAssignmentDetail();
      fetchStudentProgress();
    }
  }, [assignmentId, sectionId]);

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

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const sectionAssignments = await APIService.getAssignmentsBySection(parseInt(sectionId));
      
      // 각 과제의 문제 수와 제출 통계 조회
      const assignmentsWithDetails = await Promise.all(
        (sectionAssignments || []).map(async (assignment) => {
          try {
            const problems = await APIService.getAssignmentProblems(parseInt(sectionId), assignment.id);
            const stats = await APIService.getAssignmentSubmissionStats(assignment.id, parseInt(sectionId));
            return {
              ...assignment,
              problemCount: problems?.length || 0,
              problems: problems || [],
              stats: stats || {}
            };
          } catch (error) {
            console.error(`과제 ${assignment.id} 정보 조회 실패:`, error);
            return {
              ...assignment,
              problemCount: 0,
              problems: [],
              stats: {}
            };
          }
        })
      );
      
      setAssignments(assignmentsWithDetails);
      
      // 제출 통계 저장
      const stats = {};
      assignmentsWithDetails.forEach(assignment => {
        if (assignment.stats) {
          stats[assignment.id] = assignment.stats;
        }
      });
      setSubmissionStats(stats);
    } catch (error) {
      console.error('과제 목록 조회 실패:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetail = async () => {
    if (!assignmentId) return;
    try {
      const response = await APIService.getAssignmentInfoBySection(sectionId, assignmentId);
      setAssignment(response);
      
      // 문제 목록 조회
      const problemsData = await APIService.getAssignmentProblems(sectionId, assignmentId);
      setProblems(problemsData || []);
    } catch (error) {
      console.error('과제 정보 조회 실패:', error);
      alert('과제 정보를 불러오는데 실패했습니다.');
    }
  };

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      // 새로운 API 호출 - 학생별 문제 풀이 현황
      const response = await APIService.getAssignmentStudentProgress(assignmentId, sectionId);
      setStudentProgress(response || []);
    } catch (error) {
      console.error('학생 진행 현황 조회 실패:', error);
      alert('학생 진행 현황을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
        return <span className="tutor-status-badge tutor-completed">완료</span>;
      case 'IN_PROGRESS':
        return <span className="tutor-status-badge tutor-in-progress">진행중</span>;
      case 'NOT_STARTED':
        return <span className="tutor-status-badge tutor-not-started">미시작</span>;
      default:
        return null;
    }
  };

  const filteredStudents = studentProgress.filter(student => {
    // 검색 필터
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 상태 필터
    const status = getCompletionStatus(student);
    const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getProgressPercentage = (student) => {
    const totalProblems = problems.length;
    const solvedProblems = student.solvedProblems?.length || 0;
    return totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
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

  const handleBadgeClick = async (student, problem) => {
    const isSolved = student.solvedProblems?.includes(problem.id);
    if (!isSolved) return;

    try {
      setLoadingCode(true);
      setSelectedCodeData({
        student: student,
        problem: problem
      });
      const codeData = await APIService.getStudentAcceptedCode(
        parseInt(sectionId),
        parseInt(assignmentId),
        student.userId,
        problem.id
      );
      setSelectedCodeData(prev => ({
        ...prev,
        codeData: codeData
      }));
      setShowCodeModal(true);
    } catch (error) {
      alert('코드를 불러오는데 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLoadingCode(false);
    }
  };

  if (loading) {
    return (
      <TutorLayout selectedSection={currentSection}>
        <div className="tutor-loading-container">
          <div className="tutor-loading-spinner"></div>
          <p>학생 진행 현황을 불러오는 중...</p>
        </div>
      </TutorLayout>
    );
  }

  // assignmentId가 있으면 상세 보기, 없으면 리스트 보기
  if (assignmentId) {
    // 상세 보기 (기존 코드)
    return (
      <TutorLayout selectedSection={currentSection}>
        <div className="student-progress-container">
          {/* 헤더 */}
          <div className="tutor-page-header">
            <div className="tutor-header-left">
              <button className="tutor-btn-back" onClick={() => navigate(`/tutor/assignments/section/${sectionId}/progress`)}>
                ← 돌아가기
              </button>
              <div>
                <h1 className="tutor-page-title">{assignment?.title}</h1>
                <p className="tutor-page-subtitle">학생별 문제 풀이 현황</p>
              </div>
            </div>
          </div>

        {/* 문제별 통계 */}
        {problems.length > 0 && (
          <div className="tutor-problems-summary">
            <div className="tutor-summary-header">
              <h3 className="tutor-summary-title">문제별 제출 현황</h3>
              <span className="tutor-total-students-label">총 {studentProgress.length}명</span>
            </div>
            <div className="tutor-problems-list">
              {problems.map((problem, index) => {
              const solvedCount = studentProgress.filter(student => 
                student.solvedProblems?.includes(problem.id)
              ).length;
              const totalStudents = studentProgress.length;
              const percentage = totalStudents > 0 ? Math.round((solvedCount / totalStudents) * 100) : 0;
              const unsolvedCount = totalStudents - solvedCount;
              const isExpanded = expandedProblems.has(problem.id);
              
              return (
                <div key={problem.id} className={`tutor-problem-stat-card ${isExpanded ? 'expanded' : ''}`}>
                  <div 
                    className="tutor-problem-stat-header tutor-clickable"
                    onClick={() => toggleProblem(problem.id)}
                  >
                    <div className="tutor-header-left">
                      <span className="tutor-problem-number">문제 {index + 1}</span>
                      <span className="tutor-problem-title">{removeCopyLabel(problem.title)}</span>
                    </div>
                    <div className="tutor-header-right">
                      <span className="tutor-problem-summary">
                        {solvedCount}/{totalStudents}명 완료 ({percentage}%)
                      </span>
                      <span className={`tutor-toggle-icon ${isExpanded ? 'tutor-expanded' : ''}`}>▼</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="tutor-problem-stat-details">
                      <div className="tutor-problem-stat-info">
                        <div className="tutor-problem-stat-item tutor-solved">
                          <span className="tutor-stat-label">완료</span>
                          <div className="tutor-stat-row">
                            <span className="tutor-stat-value">{solvedCount}명</span>
                            <span className="tutor-stat-percent">{percentage}%</span>
                          </div>
                        </div>
                        <div className="tutor-problem-stat-item tutor-unsolved">
                          <span className="tutor-stat-label">미완료</span>
                          <div className="tutor-stat-row">
                            <span className="tutor-stat-value">{unsolvedCount}명</span>
                            <span className="tutor-stat-percent">{100 - percentage}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="tutor-problem-stat-bar">
                        <div 
                          className="tutor-problem-stat-fill tutor-solved-fill"
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
        <div className="tutor-filters-section">
          <div className="tutor-search-box">
            <input
              type="text"
              className="tutor-search-input"
              placeholder="학생 이름 또는 학번 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tutor-status-filters">
            <button 
              className={`tutor-filter-btn ${filterStatus === 'ALL' ? 'tutor-active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              전체
            </button>
            <button 
              className={`tutor-filter-btn ${filterStatus === 'COMPLETED' ? 'tutor-active' : ''}`}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              완료
            </button>
            <button 
              className={`tutor-filter-btn ${filterStatus === 'IN_PROGRESS' ? 'tutor-active' : ''}`}
              onClick={() => setFilterStatus('IN_PROGRESS')}
            >
              진행중
            </button>
            <button 
              className={`tutor-filter-btn ${filterStatus === 'NOT_STARTED' ? 'tutor-active' : ''}`}
              onClick={() => setFilterStatus('NOT_STARTED')}
            >
              미시작
            </button>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="tutor-students-list">
          {filteredStudents.length === 0 ? (
            <div className="tutor-no-data">
              <p>조건에 맞는 학생이 없습니다.</p>
            </div>
          ) : (
            <div className="tutor-table-container">
              <table className="tutor-students-table">
                <thead>
                  <tr>
                    <th>학번</th>
                    <th>이름</th>
                    <th>진행 상태</th>
                    <th>완료율</th>
                    <th>문제별 풀이 현황</th>
                    <th>과제 완료 시간</th>
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
                          <div className="tutor-progress-cell">
                            <div className="tutor-mini-progress-bar">
                              <div 
                                className="tutor-mini-progress-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="tutor-progress-text">
                              {student.solvedProblems?.length || 0}/{problems.length}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="tutor-problems-status">
                            {problems.map((problem, index) => {
                              const isSolved = student.solvedProblems?.includes(problem.id);
                              return (
                                <div 
                                  key={problem.id}
                                  className={`tutor-problem-badge ${isSolved ? 'solved' : 'unsolved'} ${isSolved ? 'tutor-badge-clickable' : ''}`}
                                  title={`${removeCopyLabel(problem.title)} - ${isSolved ? '완료 (클릭하여 코드 조회)' : '미완료'}`}
                                  onClick={() => isSolved && handleBadgeClick(student, problem)}
                                >
                                  {index + 1}
                                </div>
                              );
                            })}
                            <button 
                              className="tutor-btn-detail"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDetailModal(true);
                              }}
                              title="상세보기"
                            >
                              상세보기
                            </button>
                          </div>
                        </td>
                        <td className="assignment-completion-time-cell">
                          {student.assignmentCompletedAt ? (
                            <div className="tutor-completion-time-display">
                              {new Date(student.assignmentCompletedAt).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <div className="tutor-completion-time-display tutor-not-completed">
                              미완료
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 코드 조회 모달 */}
        {showCodeModal && selectedCodeData && (
          <div className="tutor-modal-overlay" onClick={() => setShowCodeModal(false)}>
            <div className="tutor-modal-content tutor-code-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <div>
                  <h2>제출 코드 조회</h2>
                  {selectedCodeData.problem && (
                    <p className="tutor-modal-subtitle">
                      {removeCopyLabel(selectedCodeData.problem.title)}
                    </p>
                  )}
                </div>
                <button 
                  className="tutor-modal-close"
                  onClick={() => setShowCodeModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="tutor-code-modal-content">
                {loadingCode ? (
                  <div className="tutor-loading-container">
                    <div className="tutor-loading-spinner"></div>
                    <p>코드를 불러오는 중...</p>
                  </div>
                ) : selectedCodeData.codeData ? (
                  <>
                    <div className="tutor-code-info">
                      <div className="tutor-code-info-row">
                        <span className="tutor-code-label">학생:</span>
                        <span className="tutor-code-value">{selectedCodeData.codeData.studentName} ({selectedCodeData.codeData.studentId})</span>
                      </div>
                      <div className="tutor-code-info-row">
                        <span className="tutor-code-label">문제:</span>
                        <span className="tutor-code-value">{removeCopyLabel(selectedCodeData.codeData.problemTitle)}</span>
                      </div>
                      <div className="tutor-code-info-row">
                        <span className="tutor-code-label">언어:</span>
                        <span className="tutor-code-value">{selectedCodeData.codeData.language}</span>
                      </div>
                      <div className="tutor-code-info-row">
                        <span className="tutor-code-label">제출 시간:</span>
                        <span className="tutor-code-value">
                          {new Date(selectedCodeData.codeData.submittedAt).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="tutor-code-info-row">
                        <span className="tutor-code-label">결과:</span>
                        <span className="tutor-code-value tutor-result-accepted">정답 (AC)</span>
                      </div>
                    </div>
                    <div className="tutor-code-editor-container">
                      <pre className="tutor-code-display">
                        <code>{selectedCodeData.codeData.code}</code>
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="tutor-no-data">
                    <p>코드 데이터를 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>

              <div className="tutor-modal-actions">
                <button 
                  className="tutor-btn-secondary"
                  onClick={() => setShowCodeModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 상세보기 모달 */}
        {showDetailModal && selectedStudent && (
          <div className="tutor-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="tutor-modal-content tutor-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <h2>제출 시간 상세</h2>
                <button 
                  className="tutor-modal-close"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="tutor-detail-modal-content">
                <div className="student-info">
                  <h3>{selectedStudent.studentName} ({selectedStudent.studentId})</h3>
                </div>

                <div className="tutor-problems-detail-list">
                  <h4>문제별 제출 시간</h4>
                  <table className="tutor-detail-table">
                    <thead>
                      <tr>
                        <th>문제 번호</th>
                        <th>문제 제목</th>
                        <th>상태</th>
                        <th>제출 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problems.map((problem, index) => {
                        const isSolved = selectedStudent.solvedProblems?.includes(problem.id);
                        const submissionTime = selectedStudent.problemSubmissionTimes?.[problem.id];
                        
                        return (
                          <tr key={problem.id}>
                            <td>{index + 1}</td>
                            <td>{removeCopyLabel(problem.title)}</td>
                            <td>
                              <span className={`status-badge-detail ${isSolved ? 'completed' : 'not-completed'}`}>
                                {isSolved ? '완료' : '미완료'}
                              </span>
                            </td>
                            <td>
                              {submissionTime ? (
                                <span className="tutor-submission-time">
                                  {new Date(submissionTime).toLocaleString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })}
                                </span>
                              ) : (
                                <span className="tutor-submission-time tutor-not-completed">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="tutor-modal-actions">
                <button 
                  className="tutor-btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </TutorLayout>
    );
  }

  // 리스트 보기
  const filteredProgressAssignments = assignments.filter(assignment => {
    return assignment.title.toLowerCase().includes(progressSearchTerm.toLowerCase()) ||
           (assignment.description && assignment.description.toLowerCase().includes(progressSearchTerm.toLowerCase()));
  });

  return (
    <TutorLayout selectedSection={currentSection}>
      <div className="assignment-progress-container">
        <div className="tutor-page-header">
          <h1 className="tutor-page-title">과제별 풀이 현황</h1>
        </div>

        <div className="tutor-filters-section">
          <div className="tutor-search-box">
            <input
              type="text"
              placeholder="과제명으로 검색..."
              value={progressSearchTerm}
              onChange={(e) => setProgressSearchTerm(e.target.value)}
              className="tutor-search-input"
            />
          </div>
        </div>

        {loading ? (
          <div className="tutor-loading-container">
            <div className="tutor-loading-spinner"></div>
            <p>과제 목록을 불러오는 중...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="tutor-no-data">
            <p>등록된 과제가 없습니다.</p>
          </div>
        ) : (
          <div className="tutor-assignments-table-container">
            <table className="tutor-assignments-table">
              <thead>
                <tr>
                  <th>과제 제목</th>
                  <th>마감일</th>
                  <th>문제 수</th>
                  <th>제출 현황</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgressAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="tutor-table-empty">
                      검색 조건에 맞는 과제가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredProgressAssignments.map((assignment) => (
                    <tr 
                      key={assignment.id} 
                      className="tutor-clickable"
                      onClick={() => navigate(`/tutor/assignments/section/${sectionId}/progress/${assignment.id}`)}
                    >
                      <td className="tutor-assignment-title-cell">
                        <div>
                          <div className="tutor-assignment-title">{assignment.title}</div>
                          {assignment.description && (
                            <div className="tutor-assignment-description">{assignment.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="tutor-assignment-meta-cell">
                        {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '미설정'}
                      </td>
                      <td className="tutor-assignment-meta-cell">{assignment.problemCount || 0}개</td>
                      <td className="tutor-assignment-meta-cell">
                        {submissionStats[assignment.id] ? 
                          `${submissionStats[assignment.id].submittedStudents || 0}/${submissionStats[assignment.id].totalStudents || 0}` 
                          : `0/0`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default AssignmentStudentProgress;

