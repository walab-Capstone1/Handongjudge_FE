import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import "./AssignmentStudentProgress.css";

const AssignmentStudentProgress = () => {
  const { sectionId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, COMPLETED, IN_PROGRESS, NOT_STARTED
  const [currentSection, setCurrentSection] = useState(null);
  const [expandedProblems, setExpandedProblems] = useState(new Set());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchSectionInfo();
    fetchAssignmentDetail();
    fetchStudentProgress();
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

  const fetchAssignmentDetail = async () => {
    try {
      const response = await APIService.getAssignmentInfo(sectionId, assignmentId);
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
        return <span className="admin-status-badge admin-completed">완료</span>;
      case 'IN_PROGRESS':
        return <span className="admin-status-badge admin-in-progress">진행중</span>;
      case 'NOT_STARTED':
        return <span className="admin-status-badge admin-not-started">미시작</span>;
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

  if (loading) {
    return (
      <AdminLayout selectedSection={currentSection}>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
          <p>학생 진행 현황을 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedSection={currentSection}>
      <div className="student-progress-container">
        {/* 헤더 */}
        <div className="admin-page-header">
          <div className="admin-header-left">
            <button className="admin-btn-back" onClick={() => navigate(-1)}>
              ← 돌아가기
            </button>
            <div>
              <h1 className="admin-page-title">{assignment?.title}</h1>
              <p className="admin-page-subtitle">학생별 문제 풀이 현황</p>
            </div>
          </div>
        </div>

        {/* 문제별 통계 */}
        {problems.length > 0 && (
          <div className="admin-problems-summary">
            <div className="admin-summary-header">
              <h3 className="admin-summary-title">문제별 제출 현황</h3>
              <span className="admin-total-students-label">총 {studentProgress.length}명</span>
            </div>
            <div className="admin-problems-list">
              {problems.map((problem, index) => {
              const solvedCount = studentProgress.filter(student => 
                student.solvedProblems?.includes(problem.id)
              ).length;
              const totalStudents = studentProgress.length;
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
          {filteredStudents.length === 0 ? (
            <div className="admin-no-data">
              <p>조건에 맞는 학생이 없습니다.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-students-table">
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
                            <button 
                              className="admin-btn-detail"
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
                            <div className="admin-completion-time-display">
                              {new Date(student.assignmentCompletedAt).toLocaleString('ko-KR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          ) : (
                            <div className="admin-completion-time-display admin-not-completed">
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

        {/* 상세보기 모달 */}
        {showDetailModal && selectedStudent && (
          <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="admin-modal-content admin-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>제출 시간 상세</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="admin-detail-modal-content">
                <div className="student-info">
                  <h3>{selectedStudent.studentName} ({selectedStudent.studentId})</h3>
                </div>

                <div className="admin-problems-detail-list">
                  <h4>문제별 제출 시간</h4>
                  <table className="admin-detail-table">
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
                                <span className="admin-submission-time">
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
                                <span className="admin-submission-time admin-not-completed">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button 
                  className="admin-btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AssignmentStudentProgress;

