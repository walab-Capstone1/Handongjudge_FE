import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import "./UserManagement.css";

const UserManagement = () => {
  const { sectionId } = useParams(); // URL에서 분반 고유 ID 가져오기
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  // 모달 관련 상태 제거됨
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');
  
  // 학생 상세보기 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [assignmentProblemsDetail, setAssignmentProblemsDetail] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // 실제 API로 교수 담당 학생들 조회
      const studentsResponse = await APIService.getInstructorStudents();
      const studentsData = studentsResponse?.data || [];
      
      // 분반 정보도 함께 가져오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
      }
      
      setStudents(studentsData);
      setSections(sectionsData);
      setLoading(false);
    } catch (error) {
      setStudents([]);
      setSections([]);
      setLoading(false);
    }
  };

  // 모달 관련 함수들 제거됨

  const handleStatusToggle = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMessage = newStatus === 'ACTIVE' 
      ? '이 학생을 활성화하시겠습니까?'
      : '이 학생을 비활성화하시겠습니까?\n\n비활성화된 학생은 수업에 접근할 수 없습니다.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await APIService.toggleUserStatus(studentId, newStatus);
      alert(`학생 상태가 ${newStatus === 'ACTIVE' ? '활성화' : '비활성화'}되었습니다.`);
      await fetchStudents(); // 목록 새로고침
    } catch (error) {
      console.error('학생 상태 변경 실패:', error);
      alert('학생 상태 변경에 실패했습니다. ' + (error.message || ''));
    }
  };
  
  // 학생 상세보기 모달 열기
  const handleStudentDetailView = async (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
    
    try {
      // 백엔드 API로 학생의 과제 진도율 가져오기
      const response = await APIService.getStudentAssignmentsProgress(student.userId, student.sectionId);
      const progressData = response.data || response;
      
      setStudentAssignments(progressData || []);
    } catch (error) {
      console.error('학생 과제 정보 조회 실패:', error);
      setStudentAssignments([]);
    }
  };
  
  // 과제 상세보기 토글 (문제 목록 표시)
  const handleToggleAssignmentDetail = async (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
      return;
    }
    
    setExpandedAssignment(assignmentId);
    
    // 이미 로드된 경우 스킵
    if (assignmentProblemsDetail[assignmentId]) {
      return;
    }
    
    try {
      // 백엔드 API로 학생의 과제별 문제 상태 가져오기
      const response = await APIService.getStudentAssignmentProblemsStatus(
        selectedStudent.userId, 
        selectedStudent.sectionId,
        assignmentId
      );
      const problemsData = response.data || response;
      
      setAssignmentProblemsDetail(prev => ({
        ...prev,
        [assignmentId]: problemsData || []
      }));
    } catch (error) {
      console.error('과제 문제 상태 조회 실패:', error);
      setAssignmentProblemsDetail(prev => ({
        ...prev,
        [assignmentId]: []
      }));
    }
  };
  
  // 모달 닫기
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedStudent(null);
    setStudentAssignments([]);
    setExpandedAssignment(null);
    setAssignmentProblemsDetail({});
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.teamId && student.teamId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSection = filterSection === 'ALL' || student.sectionName.includes(filterSection);
    return matchesSearch && matchesSection;
  });

  // 고유한 섹션 목록 추출
  const uniqueSections = [...new Set(students.map(student => student.sectionName))].filter(Boolean);

  const getRoleColor = (role) => {
    switch (role) {
      case 'PROFESSOR': return '#667eea';
      case 'STUDENT': return '#00b894';
      case 'ADMIN': return '#e17055';
      default: return '#636e72';
    }
  };

  const getStatusColor = (status) => {
    return status === 'ACTIVE' ? '#00b894' : '#e17055';
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <AdminLayout selectedSection={currentSection}>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
          <p>학생 데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedSection={currentSection}>
      {/* 분반별 페이지인 경우 통합 네비게이션 표시 */}
      {sectionId && currentSection && (
        <SectionNavigation 
          sectionId={sectionId}
          sectionName={`${currentSection.courseTitle} - ${currentSection.sectionNumber}분반`}
          enrollmentCode={currentSection.enrollmentCode}
        />
      )}
      
      {/* 전체 페이지인 경우 기존 헤더 유지 */}
      {!sectionId && (
        <div className="user-management">
          <div className="admin-page-header">
            <div className="admin-header-left">
              <h1 className="admin-page-title">학생 관리</h1>
              <div className="admin-search-box">
                <input
                  type="text"
                  placeholder="이름, 이메일, 팀ID로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-search-input"
                />
              </div>
            </div>
            <div className="admin-header-right">
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="section-filter"
              >
                <option value="ALL">모든 수업</option>
                {uniqueSections.map((section, index) => (
                  <option key={index} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div className="user-management">

        <div className="admin-users-table-container">
          <table className="admin-users-table">
            <thead>
                                  <tr>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>과목</th>
                      <th>분반</th>
                      <th>전체 과제 진도율</th>
                      <th>작업</th>
                    </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.userId}>
                  <td className="user-name">
                    <div className="user-avatar">
                      {student.name.charAt(0)}
                    </div>
                    {student.name}
                  </td>
                  <td>{student.email}</td>
                  <td>{student.courseTitle}</td>
                  <td>
                    <span className="section-badge">
                      {student.sectionNumber}분반
                    </span>
                  </td>
                  <td className="admin-progress-cell">
                    <div className="admin-progress-info">
                      <div className="admin-progress-bar-container">
                        <div 
                          className="admin-progress-bar-fill" 
                          style={{ width: `${student.assignmentCompletionRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="admin-progress-text">
                        {student.assignmentCompletionRate ? `${student.assignmentCompletionRate.toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-action-buttons">
                      <button 
                        className="admin-btn-detail-view"
                        onClick={() => handleStudentDetailView(student)}
                        title="상세 보기"
                      >
                        상세 보기
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                              {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="admin-no-data">
                      <div className="admin-no-data-message">
                        <span className="admin-no-data-icon"></span>
                        <div>
                          {students.length === 0 ? (
                            <>
                              <p><strong>담당하고 있는 학생이 없습니다</strong></p>
                              <p>현재 어떤 분반도 담당하고 있지 않거나, 담당 분반에 등록된 학생이 없습니다.</p>
                            </>
                          ) : (
                            <>
                              <p><strong>검색 조건에 맞는 학생이 없습니다</strong></p>
                              <p>다른 검색어나 필터 조건을 사용해보세요.</p>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* 학생 상세보기 모달 */}
        {showDetailModal && selectedStudent && (
          <div className="admin-modal-overlay" onClick={handleCloseDetailModal}>
            <div className="student-detail-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>과제별 진도율</h2>
                <button className="admin-modal-close-btn" onClick={handleCloseDetailModal}>✕</button>
              </div>
              
              <div className="admin-modal-body">
                <div className="admin-assignments-progress-section">
                  {studentAssignments.length === 0 ? (
                    <p className="admin-no-assignments">등록된 과제가 없습니다.</p>
                  ) : (
                    <div className="admin-assignments-list-horizontal">
                      {studentAssignments.map((assignment) => (
                        <div key={assignment.assignmentId} className="assignment-progress-card-wide">
                          <div className="assignment-progress-header">
                            <div className="assignment-title-section">
                              <h4>{assignment.assignmentTitle}</h4>
                              {assignment.description && (
                                <p className="assignment-description">{assignment.description}</p>
                              )}
                            </div>
                            <span className="admin-progress-badge">{assignment.progressRate || 0}%</span>
                          </div>
                          <div className="assignment-progress-body">
                            <div className="admin-progress-stats">
                              <span>완료: {assignment.solvedProblems || 0} / {assignment.totalProblems || 0} 문제</span>
                            </div>
                            <div className="admin-progress-bar-container">
                              <div 
                                className="admin-progress-bar-fill" 
                                style={{ width: `${assignment.progressRate || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <button 
                            className="admin-btn-toggle-detail"
                            onClick={() => handleToggleAssignmentDetail(assignment.assignmentId)}
                          >
                            {expandedAssignment === assignment.assignmentId ? '상세보기 닫기 ▲' : '상세보기 ▼'}
                          </button>
                          
                          {/* 문제별 상태 상세보기 */}
                          {expandedAssignment === assignment.assignmentId && (
                            <div className="admin-problems-detail-section">
                              {assignmentProblemsDetail[assignment.assignmentId]?.length > 0 ? (
                                <div className="admin-problems-grid">
                                  {assignmentProblemsDetail[assignment.assignmentId].map((problem) => (
                                    <div key={problem.problemId} className={`admin-problem-status-card ${problem.status}`}>
                                      <div className="admin-problem-info">
                                        <span className="admin-problem-title">{problem.problemTitle}</span>
                                        <span className={`status-badge ${problem.status}`}>
                                          {problem.status === 'ACCEPTED' ? '✓ 완료' : 
                                           problem.status === 'SUBMITTED' ? '⋯ 제출함' : 
                                           '○ 미제출'}
                                        </span>
                                      </div>
                                      {problem.submissionCount > 0 && (
                                        <div className="admin-submission-count">
                                          제출 횟수: {problem.submissionCount}회
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="admin-no-problems">문제 정보를 불러오는 중...</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default UserManagement;
