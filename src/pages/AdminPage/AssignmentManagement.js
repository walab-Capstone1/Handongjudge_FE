import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import "./AssignmentManagement.css";

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sectionId: '',
    startDate: '',
    endDate: '',
    assignmentNumber: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchSections();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // 1. 먼저 dashboard에서 분반 정보 가져오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      
      // 2. 각 분반의 과제들을 개별적으로 조회하고 문제 수도 함께 조회
      let allAssignments = [];
      for (const section of sectionsData) {
        try {
          const sectionAssignments = await APIService.getAssignmentsBySection(section.sectionId);
          
          // 각 과제의 문제 수 조회
          const assignmentsWithDetails = await Promise.all(
            (sectionAssignments || []).map(async (assignment) => {
              try {
                const problems = await APIService.getAssignmentProblems(section.sectionId, assignment.id);
                return {
                  ...assignment,
                  sectionName: section.courseTitle,
                  sectionId: section.sectionId,
                  problemCount: problems?.length || 0,
                  problems: problems || [],
                  // API 응답에서 endDate를 dueDate로 매핑
                  dueDate: assignment.endDate,
                  // 임시 제출 통계 (실제로는 별도 API 필요)
                  submissionCount: 0,
                  totalStudents: 25 // 임시값
                };
              } catch (error) {

                return {
                  ...assignment,
                  sectionName: section.courseTitle,
                  sectionId: section.sectionId,
                  problemCount: 0,
                  problems: [],
                  dueDate: assignment.endDate,
                  submissionCount: 0,
                  totalStudents: 25
                };
              }
            })
          );
          
          allAssignments = [...allAssignments, ...assignmentsWithDetails];
        } catch (error) {
          // 분반 과제 조회 실패 시 무시
        }
      }
      
      setAssignments(allAssignments);
      setLoading(false);
    } catch (error) {
      setAssignments([]);
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    // fetchAssignments에서 이미 처리됨
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      sectionId: '',
      startDate: '',
      endDate: '',
      assignmentNumber: ''
    });
  };

  const handleAddAssignment = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 백엔드 API 호출 (구현 예정)
      console.log('과제 생성 요청:', formData);
      alert('과제가 성공적으로 생성되었습니다. (백엔드 API 구현 필요)');
      handleCloseModal();
      fetchAssignments(); // 목록 새로고침
    } catch (error) {
      alert('과제 생성에 실패했습니다.');
    }
  };

  const handleEdit = (assignment) => {
    console.log('과제 수정:', assignment);
    alert('과제 수정 기능은 구현 예정입니다.');
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('정말로 이 과제를 삭제하시겠습니까?')) {
      try {
        console.log('과제 삭제:', assignmentId);
        alert('과제 삭제 기능은 구현 예정입니다.');
      } catch (error) {
        alert('과제 삭제에 실패했습니다.');
      }
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#ff4d4f';
      default: return '#666';
    }
  };

  const getSubmissionRate = (submitted, total) => {
    return total > 0 ? Math.round((submitted / total) * 100) : 0;
  };

  // 필터링된 과제 목록
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'ALL' || assignment.sectionName.includes(filterSection);
    return matchesSearch && matchesSection;
  });

  // 고유한 섹션 목록 추출
  const uniqueSections = [...new Set(assignments.map(assignment => assignment.sectionName))].filter(Boolean);

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>과제 데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="assignment-management">
        <div className="page-header">
          <h1 className="page-title">과제 관리</h1>
          <div className="header-actions">
            <div className="header-stats">
              <span className="stat-badge">총 {assignments.length}개</span>
              <span className="stat-badge active">{uniqueSections.length}개 분반</span>
            </div>
            <button 
              className="btn-primary"
              onClick={handleAddAssignment}
            >
              <span>➕</span>
              새 과제 만들기
            </button>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="과제명, 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="section-filter"
          >
            <option value="ALL">모든 분반</option>
            {uniqueSections.map((section, index) => (
              <option key={index} value={section}>{section}</option>
            ))}
          </select>
        </div>

        <div className="assignments-list">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="assignment-card">
              <div className="assignment-header">
                <div className="assignment-info">
                  <h3 className="assignment-title">{assignment.title}</h3>
                  <p className="assignment-course">{assignment.sectionName}</p>
                </div>
                <div className="assignment-actions">
                  <button 
                    className="btn-icon-small edit"
                    onClick={() => handleEdit(assignment)}
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon-small delete"
                    onClick={() => handleDelete(assignment.id)}
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="assignment-description">{assignment.description}</p>
              
              <div className="assignment-stats">
                <div className="stat-item">
                  <span className="stat-label">마감일:</span>
                  <span className="stat-value due-date">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ko-KR') : '미설정'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">문제 수:</span>
                  <span className="stat-value">{assignment.problemCount || 0}개</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">제출률:</span>
                  <span className="stat-value submission-rate">
                    {assignment.submissionCount || 0}/{assignment.totalStudents || 0} 
                    ({getSubmissionRate(assignment.submissionCount || 0, assignment.totalStudents || 0)}%)
                  </span>
                </div>
              </div>

              <div className="problems-section">
                <h4 className="problems-title">문제 목록 ({assignment.problemCount || 0}개)</h4>
                <div className="problems-list">
                  {assignment.problems && assignment.problems.length > 0 ? (
                    assignment.problems.map((problem, index) => (
                      <div key={problem.id || index} className="problem-item">
                        <span className="problem-number">{index + 1}.</span>
                        <span className="problem-title">{problem.title}</span>
                        {problem.difficulty && (
                          <span 
                            className="problem-difficulty"
                            style={{ color: getDifficultyColor(problem.difficulty) }}
                          >
                            [{problem.difficulty}]
                          </span>
                        )}
                        {problem.domjudgeProblemId && (
                          <span className="problem-id">ID: {problem.domjudgeProblemId}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-problems">등록된 문제가 없습니다.</p>
                  )}
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${getSubmissionRate(assignment.submissionCount, assignment.totalStudents)}%` 
                  }}
                ></div>
              </div>
            </div>
          ))}
          {filteredAssignments.length === 0 && (
            <div className="no-assignments">
              <div className="no-assignments-message">
                <span className="no-assignments-icon">📝</span>
                <p>
                  {searchTerm || filterSection !== 'ALL' 
                    ? '검색 조건에 맞는 과제가 없습니다.' 
                    : '아직 생성된 과제가 없습니다.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 과제 추가 모달 */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>새 과제 만들기</h2>
                <button 
                  className="modal-close"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="assignment-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">과제명 *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="과제명을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="assignmentNumber">과제 번호</label>
                    <input
                      type="text"
                      id="assignmentNumber"
                      name="assignmentNumber"
                      value={formData.assignmentNumber}
                      onChange={handleInputChange}
                      placeholder="예: HW1, Assignment1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="sectionId">분반 선택 *</label>
                  <select
                    id="sectionId"
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">분반을 선택하세요</option>
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.courseTitle} (분반 {section.sectionId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">과제 설명</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="과제에 대한 상세 설명을 입력하세요"
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">시작일</label>
                    <input
                      type="datetime-local"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="endDate">마감일</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                  >
                    과제 생성
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AssignmentManagement;
