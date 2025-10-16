import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
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

  useEffect(() => {
    fetchAssignmentDetail();
    fetchStudentProgress();
  }, [assignmentId, sectionId]);

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
        return <span className="status-badge completed">완료</span>;
      case 'IN_PROGRESS':
        return <span className="status-badge in-progress">진행중</span>;
      case 'NOT_STARTED':
        return <span className="status-badge not-started">미시작</span>;
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>학생 진행 현황을 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="student-progress-container">
        {/* 헤더 */}
        <div className="page-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate(-1)}>
              ← 돌아가기
            </button>
            <div>
              <h1 className="page-title">{assignment?.title}</h1>
              <p className="page-subtitle">학생별 문제 풀이 현황</p>
            </div>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="stats-summary">
          <div className="stat-card total">
            <div className="stat-info">
              <span className="stat-label">전체 학생</span>
              <span className="stat-value">{studentProgress.length}명</span>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-info">
              <span className="stat-label">완료</span>
              <span className="stat-value">
                {studentProgress.filter(s => getCompletionStatus(s) === 'COMPLETED').length}명
              </span>
            </div>
          </div>
          <div className="stat-card in-progress">
            <div className="stat-info">
              <span className="stat-label">진행중</span>
              <span className="stat-value">
                {studentProgress.filter(s => getCompletionStatus(s) === 'IN_PROGRESS').length}명
              </span>
            </div>
          </div>
          <div className="stat-card not-started">
            <div className="stat-info">
              <span className="stat-label">미시작</span>
              <span className="stat-value">
                {studentProgress.filter(s => getCompletionStatus(s) === 'NOT_STARTED').length}명
              </span>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="학생 이름 또는 학번 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="status-filters">
            <button 
              className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterStatus('ALL')}
            >
              전체
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              완료
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setFilterStatus('IN_PROGRESS')}
            >
              진행중
            </button>
            <button 
              className={`filter-btn ${filterStatus === 'NOT_STARTED' ? 'active' : ''}`}
              onClick={() => setFilterStatus('NOT_STARTED')}
            >
              미시작
            </button>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="students-list">
          {filteredStudents.length === 0 ? (
            <div className="no-data">
              <p>조건에 맞는 학생이 없습니다.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="students-table">
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
                          <div className="progress-cell">
                            <div className="mini-progress-bar">
                              <div 
                                className="mini-progress-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">
                              {student.solvedProblems?.length || 0}/{problems.length}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="problems-status">
                            {problems.map((problem, index) => {
                              const isSolved = student.solvedProblems?.includes(problem.id);
                              return (
                                <div 
                                  key={problem.id}
                                  className={`problem-badge ${isSolved ? 'solved' : 'unsolved'}`}
                                  title={`${problem.title} - ${isSolved ? '완료' : '미완료'}`}
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
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignmentStudentProgress;

