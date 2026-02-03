import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import AssignmentPagination from "../../components/Pagination/AssignmentPagination";
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
  const [filterRole, setFilterRole] = useState('ALL'); // 'ALL', 'STUDENT', 'TUTOR', 'ADMIN'
  const [userRoles, setUserRoles] = useState({}); // { userId: 'STUDENT' | 'TUTOR' | 'ADMIN' }
  const [currentUserRole, setCurrentUserRole] = useState(null); // 현재 사용자의 역할 (ADMIN인지 확인용)
  
  // 정렬 관련 상태
  const [sortField, setSortField] = useState('name'); // 'name', 'email', 'progress', 'joinedAt'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'
  
  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const STUDENTS_PER_PAGE = 10;
  
  // 학생 상세보기 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAssignments, setStudentAssignments] = useState([]);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [assignmentProblemsDetail, setAssignmentProblemsDetail] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [sectionId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // 분반 정보 가져오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const parsedSectionId = parseInt(sectionId);
        if (isNaN(parsedSectionId)) {
          console.error('잘못된 sectionId:', sectionId);
          setLoading(false);
          return;
        }
        
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parsedSectionId
        );
        setCurrentSection(currentSectionData);
        
        // 특정 분반의 학생 목록 조회
        try {
          const studentsResponse = await APIService.getSectionStudents(parsedSectionId);
          const studentsData = studentsResponse?.data || studentsResponse || [];
          setStudents(studentsData);
          
          // 현재 사용자의 역할 확인
          try {
            const roleResponse = await APIService.getMyRoleInSection(parsedSectionId);
            setCurrentUserRole(roleResponse?.role || null);
          } catch (error) {
            console.error('역할 조회 실패:', error);
          }
          
          // 모든 사용자의 역할 정보 가져오기
          await fetchUserRoles(parsedSectionId, studentsData);
        } catch (error) {
          console.error('분반 학생 목록 조회 실패:', error);
          setStudents([]);
        }
      } else {
        // 전체 교수 담당 학생들 조회
        const studentsResponse = await APIService.getInstructorStudents();
        const studentsData = studentsResponse?.data || [];
        setStudents(studentsData);
      }
      
      setSections(sectionsData);
      setLoading(false);
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
      setStudents([]);
      setSections([]);
      setLoading(false);
    }
  };

  // 사용자들의 역할 정보 가져오기
  const fetchUserRoles = async (sectionId, studentsData) => {
    if (!sectionId) return;
    
    try {
      // 모든 수업별 역할 목록 가져오기
      const rolesResponse = await APIService.getAllSectionRoles();
      const allRoles = rolesResponse?.data || [];
      
      // 현재 수업의 역할만 필터링
      const sectionRoles = allRoles.filter(role => role.sectionId === parseInt(sectionId));
      
      // 역할 정보를 맵으로 변환 { userId: 'STUDENT' | 'TUTOR' | 'ADMIN' }
      const rolesMap = {};
      sectionRoles.forEach(role => {
        rolesMap[role.userId] = role.role;
      });
      
      setUserRoles(rolesMap);
    } catch (error) {
      console.error('역할 정보 조회 실패:', error);
      setUserRoles({});
    }
  };

  // 튜터 추가 핸들러
  const handleAddTutor = async (userId) => {
    if (!sectionId) {
      alert('수업을 선택해주세요.');
      return;
    }
    
    if (!window.confirm('이 사용자를 튜터로 추가하시겠습니까?')) {
      return;
    }
    
    try {
      await APIService.addTutorToSection(sectionId, userId);
      alert('튜터가 추가되었습니다.');
      await fetchStudents(); // 목록 새로고침
    } catch (error) {
      console.error('튜터 추가 실패:', error);
      alert('튜터 추가에 실패했습니다: ' + (error.message || ''));
    }
  };

  // 튜터 제거 핸들러
  const handleRemoveTutor = async (userId) => {
    if (!sectionId) {
      alert('수업을 선택해주세요.');
      return;
    }
    
    if (!window.confirm('이 사용자의 튜터 권한을 제거하시겠습니까?')) {
      return;
    }
    
    try {
      await APIService.removeTutorFromSection(sectionId, userId);
      alert('튜터가 제거되었습니다.');
      await fetchStudents(); // 목록 새로고침
    } catch (error) {
      console.error('튜터 제거 실패:', error);
      alert('튜터 제거에 실패했습니다: ' + (error.message || ''));
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

  // 필터링
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.teamId && student.teamId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSection = filterSection === 'ALL' || student.sectionName?.includes(filterSection);
    
    // 역할 필터링 (sectionId가 있을 때만)
    let matchesRole = true;
    if (sectionId && filterRole !== 'ALL') {
      const userRole = userRoles[student.userId];
      if (filterRole === 'STUDENT') {
        matchesRole = userRole === 'STUDENT' || !userRole; // 역할이 없으면 기본적으로 STUDENT
      } else if (filterRole === 'TUTOR') {
        matchesRole = userRole === 'TUTOR';
      } else if (filterRole === 'ADMIN') {
        matchesRole = userRole === 'ADMIN';
      }
    }
    
    return matchesSearch && matchesSection && matchesRole;
  });

  // 정렬 함수
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // 정렬 시 첫 페이지로
  };

  // 정렬된 학생 목록
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      case 'progress':
        aValue = a.assignmentCompletionRate || 0;
        bValue = b.assignmentCompletionRate || 0;
        break;
      case 'joinedAt':
        aValue = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
        bValue = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue, 'ko')
        : bValue.localeCompare(aValue, 'ko');
    } else {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  // 페이지네이션
  const totalPages = Math.ceil(sortedStudents.length / STUDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
  const endIndex = startIndex + STUDENTS_PER_PAGE;
  const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

  // 검색어나 필터 변경 시 첫 페이지로
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSection]);

  // 고유한 섹션 목록 추출
  const uniqueSections = [...new Set(students.map(student => student.sectionName))].filter(Boolean);

  // 정렬 아이콘 렌더링 함수
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="user-management-sort-icon">⇅</span>;
    }
    return sortDirection === 'asc' 
      ? <span className="user-management-sort-icon user-management-sort-asc">↑</span>
      : <span className="user-management-sort-icon user-management-sort-desc">↓</span>;
  };

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
      <TutorLayout selectedSection={currentSection}>
        <div className="user-management">
          <div className="user-management-loading-container">
            <div className="user-management-loading-spinner"></div>
            <p>학생 데이터를 불러오는 중...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout selectedSection={currentSection}>
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
          <div className="user-management-header">
            <div className="user-management-header-left">
              <h1 className="user-management-title">학생 관리</h1>
              <div className="user-management-search-box">
                <input
                  type="text"
                  placeholder="이름, 이메일, 팀ID로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="user-management-search-input"
                />
              </div>
            </div>
            <div className="user-management-header-right">
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="user-management-section-filter"
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

      {/* 분반별 페이지인 경우 검색 및 필터 */}
      {sectionId && (
        <div className="user-management">
          <div className="user-management-filters">
            <div className="user-management-search-box">
              <input
                type="text"
                placeholder="이름, 이메일, 팀ID로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="user-management-search-input"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="user-management-section-filter"
            >
              <option value="ALL">전체</option>
              <option value="STUDENT">수강생</option>
              <option value="TUTOR">튜터</option>
              <option value="ADMIN">관리자</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="user-management">
        <div className="user-management-table-container">
          <table className="user-management-table">
            <thead>
              <tr>
                <th 
                  className="user-management-th-sortable"
                  onClick={() => handleSort('name')}
                >
                  <div className="user-management-th-content">
                    이름
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="user-management-th-sortable"
                  onClick={() => handleSort('email')}
                >
                  <div className="user-management-th-content">
                    이메일
                    {getSortIcon('email')}
                  </div>
                </th>
                {!sectionId && <th>과목</th>}
                {!sectionId && <th>분반</th>}
                {sectionId && <th>역할</th>}
                <th 
                  className="user-management-th-sortable"
                  onClick={() => handleSort('progress')}
                >
                  <div className="user-management-th-content">
                    전체 과제 진도율
                    {getSortIcon('progress')}
                  </div>
                </th>
                <th style={{ textAlign: 'right' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => {
                const userRole = sectionId ? (userRoles[student.userId] || 'STUDENT') : null;
                const isAdmin = currentUserRole === 'ADMIN';
                const isTutor = userRole === 'TUTOR';
                const isStudent = userRole === 'STUDENT' || !userRole;
                
                return (
                  <tr key={student.userId}>
                    <td className="user-management-name-cell">
                      {student.name}
                    </td>
                    <td className="user-management-email-cell">{student.email}</td>
                    {!sectionId && <td className="user-management-course-cell">{student.courseTitle}</td>}
                    {!sectionId && (
                      <td className="user-management-section-cell">
                        <span className="user-management-section-badge">
                          {student.sectionNumber}분반
                        </span>
                      </td>
                    )}
                    {sectionId && (
                      <td>
                        <span 
                          className="user-management-section-badge"
                          style={{
                            backgroundColor: userRole === 'ADMIN' ? '#e17055' : 
                                           userRole === 'TUTOR' ? '#667eea' : 'transparent',
                            color: userRole === 'ADMIN' ? 'white' : 
                                  userRole === 'TUTOR' ? 'white' : '#2d3436',
                            padding: userRole ? '0.3rem 0.8rem' : '0',
                            borderRadius: userRole ? '16px' : '0',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {userRole === 'ADMIN' ? '관리자' : 
                           userRole === 'TUTOR' ? '튜터' : '수강생'}
                        </span>
                      </td>
                    )}
                    <td className="user-management-progress-cell">
                      <div className="user-management-progress-info">
                        <div className="user-management-progress-bar-container">
                          <div 
                            className="user-management-progress-bar-fill" 
                            style={{ width: `${student.assignmentCompletionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="user-management-progress-text">
                          {student.assignmentCompletionRate ? `${student.assignmentCompletionRate.toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                    </td>
                    <td className="user-management-actions-cell">
                      <div className="user-management-actions-inline">
                        <button 
                          className="user-management-btn-table-action"
                          onClick={() => handleStudentDetailView(student)}
                          title="상세 보기"
                        >
                          상세 보기
                        </button>
                        {sectionId && isAdmin && (
                          <>
                            {isStudent && (
                              <button 
                                className="user-management-btn-table-action"
                                onClick={() => handleAddTutor(student.userId)}
                                title="튜터로 추가"
                              >
                                튜터 추가
                              </button>
                            )}
                            {isTutor && (
                              <button 
                                className="user-management-btn-table-action user-management-btn-delete"
                                onClick={() => handleRemoveTutor(student.userId)}
                                title="튜터 권한 제거"
                              >
                                튜터 제거
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={sectionId ? 5 : 6} className="user-management-no-data">
                    <div className="user-management-no-data-message">
                      <span className="user-management-no-data-icon"></span>
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <AssignmentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={sortedStudents.length}
            onPageChange={setCurrentPage}
          />
        )}

        {/* 학생 상세보기 모달 */}
        {showDetailModal && selectedStudent && (
          <div className="user-management-modal-overlay" onClick={handleCloseDetailModal}>
            <div className="user-management-detail-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="user-management-modal-header">
                <h2>과제별 진도율</h2>
                <button className="user-management-modal-close-btn" onClick={handleCloseDetailModal}>✕</button>
              </div>
              
              <div className="user-management-modal-body">
                <div className="user-management-assignments-progress-section">
                  {studentAssignments.length === 0 ? (
                    <p className="user-management-no-assignments">등록된 과제가 없습니다.</p>
                  ) : (
                    <div className="user-management-assignments-list">
                      {studentAssignments.map((assignment) => (
                        <div key={assignment.assignmentId} className="user-management-assignment-card">
                          <div className="user-management-assignment-header">
                            <div className="user-management-assignment-title-section">
                              <h4>{assignment.assignmentTitle}</h4>
                              {assignment.description && (
                                <p className="user-management-assignment-description">{assignment.description}</p>
                              )}
                            </div>
                            <span className="user-management-progress-badge">{assignment.progressRate || 0}%</span>
                          </div>
                          <div className="user-management-assignment-body">
                            <div className="user-management-progress-stats">
                              <span>완료: {assignment.solvedProblems || 0} / {assignment.totalProblems || 0} 문제</span>
                            </div>
                            <div className="user-management-progress-bar-container">
                              <div 
                                className="user-management-progress-bar-fill" 
                                style={{ width: `${assignment.progressRate || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          <button 
                            className="user-management-btn-toggle-detail"
                            onClick={() => handleToggleAssignmentDetail(assignment.assignmentId)}
                          >
                            {expandedAssignment === assignment.assignmentId ? '상세보기 닫기 ▲' : '상세보기 ▼'}
                          </button>
                          
                          {/* 문제별 상태 상세보기 */}
                          {expandedAssignment === assignment.assignmentId && (
                            <div className="user-management-problems-detail-section">
                              {assignmentProblemsDetail[assignment.assignmentId]?.length > 0 ? (
                                <div className="user-management-problems-grid">
                                  {assignmentProblemsDetail[assignment.assignmentId].map((problem) => (
                                    <div key={problem.problemId} className={`user-management-problem-card user-management-problem-${problem.status}`}>
                                      <div className="user-management-problem-info">
                                        <span className="user-management-problem-title">{problem.problemTitle}</span>
                                        <span className={`user-management-status-badge user-management-status-${problem.status}`}>
                                          {problem.status === 'ACCEPTED' ? '✓ 완료' : 
                                           problem.status === 'SUBMITTED' ? '⋯ 제출함' : 
                                           '○ 미제출'}
                                        </span>
                                      </div>
                                      {problem.submissionCount > 0 && (
                                        <div className="user-management-submission-count">
                                          제출 횟수: {problem.submissionCount}회
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="user-management-no-problems">문제 정보를 불러오는 중...</p>
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
    </TutorLayout>
  );
};

export default UserManagement;
