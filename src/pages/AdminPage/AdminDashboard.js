import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import { removeCopyLabel } from "../../utils/problemUtils";
import ReactMarkdown from "react-markdown";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [formData, setFormData] = useState({
    courseTitle: '',
    description: '',
    sectionNumber: '',
    year: new Date().getFullYear(),
    semester: 'SPRING'
  });
  const [copyFormData, setCopyFormData] = useState({
    sourceSectionId: '',
    courseTitle: '',
    description: '',
    year: new Date().getFullYear(),
    semester: 'SPRING',
    copyNotices: true,
    copyAssignments: true,
    selectedNoticeIds: [],
    selectedAssignmentIds: [],
    assignmentProblems: {} // { assignmentId: [problemIds] }
  });
  const [sourceNotices, setSourceNotices] = useState([]);
  const [sourceAssignments, setSourceAssignments] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [copyStep, setCopyStep] = useState(1); // 1: 기본정보, 2: 공지사항, 3: 과제/문제
  const [selectedNoticeDetail, setSelectedNoticeDetail] = useState(null);
  const [selectedProblemDetail, setSelectedProblemDetail] = useState(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
        setLoading(false);
      } catch (error) {
        setSections([]);
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const handleSectionClick = (section) => {
    // 관리자 페이지에서는 비활성화된 수업도 접근 가능
    // 수업 카드를 클릭하면 해당 수업의 과제 관리 페이지로 이동
    navigate(`/admin/assignments/section/${section.sectionId}`, { state: { section } });
  };

  const handleCopyEnrollmentLink = (enrollmentCode, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (enrollmentCode) {
      const enrollmentLink = `${window.location.origin}/enroll/${enrollmentCode}`;
      navigator.clipboard.writeText(enrollmentLink).then(() => {
        alert('수업 참가 링크가 복사되었습니다!');
      }).catch((err) => {
        console.error('복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
    }
  };

  const handleToggleActive = async (sectionId, currentActive, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    try {
      const newActiveStatus = !currentActive;
      console.log('활성화 상태 변경 시도:', { sectionId, currentActive, newActiveStatus });
      const response = await APIService.toggleSectionActive(sectionId, newActiveStatus);
      console.log('API 응답:', response);
      alert(newActiveStatus ? '수업이 활성화되었습니다.' : '수업이 비활성화되었습니다.');
      
      // 수업 목록 다시 불러오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const dashboardData = dashboardResponse?.data || [];
      setSections(dashboardData);
    } catch (error) {
      console.error('수업 상태 변경 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`수업 상태 변경에 실패했습니다.\n${error.message || '네트워크 오류가 발생했습니다.'}`);
    }
  };

  const handleCreateSection = async () => {
    try {
      const instructorId = await APIService.getCurrentUserId();

      // 1단계: Course 생성
      const courseResponse = await APIService.createCourse({
        title: formData.courseTitle,
        description: formData.description || ''
      });

      // 2단계: Section 생성 (DomJudge Contest 자동 생성)
      // sectionNumber는 null로 전달 (표시용이므로 불필요)
      const sectionResponse = await APIService.createSection({
        courseId: courseResponse.id,
        instructorId: instructorId,
        sectionNumber: null,
        year: parseInt(formData.year),
        semester: formData.semester
      });

      alert('수업이 성공적으로 생성되었습니다!');
      setShowCreateModal(false);
      setFormData({
        courseTitle: '',
        description: '',
        sectionNumber: '',
        year: new Date().getFullYear(),
        semester: 'SPRING'
      });
      
      // 수업 목록 다시 불러오기
      const dashboardResponse = await APIService.getInstructorDashboard();
      const dashboardData = dashboardResponse?.data || [];
      setSections(dashboardData);
    } catch (error) {
      console.error('수업 생성 실패:', error);
      alert(error.message || '수업 생성에 실패했습니다.');
    }
  };

  // 수업 선택 시 공지사항 및 과제 목록 불러오기
  const handleSourceSectionChange = async (sectionId) => {
    setCopyFormData({...copyFormData, sourceSectionId: sectionId, selectedNoticeIds: [], selectedAssignmentIds: [], assignmentProblems: {}});
    setExpandedAssignments({});
    
    if (sectionId) {
      try {
        // 공지사항 조회
        setLoadingNotices(true);
        const notices = await APIService.getSectionNotices(sectionId);
        const noticesData = notices?.data || notices || [];
        setSourceNotices(noticesData);

        // 과제 조회
        setLoadingAssignments(true);
        const assignments = await APIService.getAssignmentsBySection(sectionId);
        const assignmentsData = assignments?.data || assignments || [];
        
        // 각 과제의 문제 목록 조회
        const assignmentsWithProblems = await Promise.all(
          assignmentsData.map(async (assignment) => {
            try {
              const problems = await APIService.getAssignmentProblems(sectionId, assignment.id);
              return {
                ...assignment,
                problems: problems || []
              };
            } catch (error) {
              console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
              return { ...assignment, problems: [] };
            }
          })
        );
        
        setSourceAssignments(assignmentsWithProblems);

        // 기본적으로 모든 공지사항 및 과제 선택
        const initialAssignmentProblems = {};
        assignmentsWithProblems.forEach(assignment => {
          initialAssignmentProblems[assignment.id] = assignment.problems.map(p => p.id);
        });

        setCopyFormData(prev => ({
          ...prev,
          sourceSectionId: sectionId,
          selectedNoticeIds: noticesData.map(n => n.id),
          selectedAssignmentIds: assignmentsWithProblems.map(a => a.id),
          assignmentProblems: initialAssignmentProblems
        }));
      } catch (error) {
        console.error('데이터 조회 실패:', error);
        setSourceNotices([]);
        setSourceAssignments([]);
      } finally {
        setLoadingNotices(false);
        setLoadingAssignments(false);
      }
    } else {
      setSourceNotices([]);
      setSourceAssignments([]);
    }
  };

  const handleNoticeToggle = (noticeId) => {
    setCopyFormData(prev => {
      const isSelected = prev.selectedNoticeIds.includes(noticeId);
      return {
        ...prev,
        selectedNoticeIds: isSelected
          ? prev.selectedNoticeIds.filter(id => id !== noticeId)
          : [...prev.selectedNoticeIds, noticeId]
      };
    });
  };

  const handleSelectAllNotices = () => {
    if (copyFormData.selectedNoticeIds.length === sourceNotices.length) {
      // 모두 선택 해제
      setCopyFormData(prev => ({...prev, selectedNoticeIds: []}));
    } else {
      // 모두 선택
      setCopyFormData(prev => ({...prev, selectedNoticeIds: sourceNotices.map(n => n.id)}));
    }
  };

  // 과제 선택/해제
  const handleAssignmentToggle = (assignmentId) => {
    setCopyFormData(prev => {
      const isSelected = prev.selectedAssignmentIds.includes(assignmentId);
      if (isSelected) {
        // 과제 선택 해제 시 해당 과제의 문제도 모두 해제
        const newAssignmentProblems = {...prev.assignmentProblems};
        delete newAssignmentProblems[assignmentId];
        return {
          ...prev,
          selectedAssignmentIds: prev.selectedAssignmentIds.filter(id => id !== assignmentId),
          assignmentProblems: newAssignmentProblems
        };
      } else {
        // 과제 선택 시 해당 과제의 모든 문제 선택
        const assignment = sourceAssignments.find(a => a.id === assignmentId);
        return {
          ...prev,
          selectedAssignmentIds: [...prev.selectedAssignmentIds, assignmentId],
          assignmentProblems: {
            ...prev.assignmentProblems,
            [assignmentId]: assignment?.problems.map(p => p.id) || []
          }
        };
      }
    });
  };

  // 모든 과제 선택/해제
  const handleSelectAllAssignments = () => {
    if (copyFormData.selectedAssignmentIds.length === sourceAssignments.length) {
      // 모두 선택 해제
      setCopyFormData(prev => ({...prev, selectedAssignmentIds: [], assignmentProblems: {}}));
    } else {
      // 모두 선택
      const allAssignmentProblems = {};
      sourceAssignments.forEach(assignment => {
        allAssignmentProblems[assignment.id] = assignment.problems.map(p => p.id);
      });
      setCopyFormData(prev => ({
        ...prev,
        selectedAssignmentIds: sourceAssignments.map(a => a.id),
        assignmentProblems: allAssignmentProblems
      }));
    }
  };

  // 과제 펼치기/접기
  const toggleAssignmentExpand = (assignmentId) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  // 과제의 문제 선택/해제
  const handleProblemToggle = (assignmentId, problemId) => {
    setCopyFormData(prev => {
      const currentProblems = prev.assignmentProblems[assignmentId] || [];
      const isSelected = currentProblems.includes(problemId);
      
      return {
        ...prev,
        assignmentProblems: {
          ...prev.assignmentProblems,
          [assignmentId]: isSelected
            ? currentProblems.filter(id => id !== problemId)
            : [...currentProblems, problemId]
        }
      };
    });
  };

  // 과제의 모든 문제 선택/해제
  const handleSelectAllProblems = (assignmentId) => {
    const assignment = sourceAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const currentProblems = copyFormData.assignmentProblems[assignmentId] || [];
    const allProblems = assignment.problems.map(p => p.id);

    setCopyFormData(prev => ({
      ...prev,
      assignmentProblems: {
        ...prev.assignmentProblems,
        [assignmentId]: currentProblems.length === allProblems.length ? [] : allProblems
      }
    }));
  };

  const handleCopySection = async () => {
    try {
      if (!copyFormData.sourceSectionId) {
        alert('복사할 수업을 선택해주세요.');
        return;
      }

      if (!copyFormData.courseTitle) {
        alert('새 수업 제목을 입력해주세요.');
        return;
      }

      // sectionNumber는 null로 전달 (표시용이므로 불필요)
      const response = await APIService.copySection(
        parseInt(copyFormData.sourceSectionId),
        null,
        parseInt(copyFormData.year),
        copyFormData.semester,
        copyFormData.courseTitle,
        copyFormData.description || '',
        copyFormData.copyNotices,
        copyFormData.copyAssignments,
        copyFormData.copyNotices ? copyFormData.selectedNoticeIds : [],
        copyFormData.copyAssignments ? copyFormData.selectedAssignmentIds : [],
        copyFormData.copyAssignments ? copyFormData.assignmentProblems : {}
      );

      if (response.success) {
        alert('수업이 성공적으로 복사되었습니다!');
        setShowCopyModal(false);
        setCopyStep(1);
        setCopyFormData({
          sourceSectionId: '',
          courseTitle: '',
          description: '',
          year: new Date().getFullYear(),
          semester: 'SPRING',
          copyNotices: true,
          copyAssignments: true,
          selectedNoticeIds: [],
          selectedAssignmentIds: [],
          assignmentProblems: {}
        });
        setSourceNotices([]);
        setSourceAssignments([]);
        setExpandedAssignments({});
        
        // 수업 목록 다시 불러오기
        const dashboardResponse = await APIService.getInstructorDashboard();
        const dashboardData = dashboardResponse?.data || [];
        setSections(dashboardData);
      } else {
        alert(response.message || '수업 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('수업 복사 실패:', error);
      alert(error.message || '수업 복사에 실패했습니다.');
    }
  };

  // 학기 표시 헬퍼 함수
  const getSemesterLabel = (semester) => {
    switch(semester) {
      case 'SPRING': return '1학기';
      case 'SUMMER': return '여름학기';
      case 'FALL': return '2학기';
      case 'WINTER': return '겨울학기';
      case 'CAMP': return '캠프';
      case 'SPECIAL': return '특강';
      case 'IRREGULAR': return '비정규 세션';
      default: return semester || '1학기';
    }
  };

  // 년도 필터링
  const years = ['ALL', ...new Set(sections.map(s => s.year).filter(Boolean))].sort((a, b) => {
    if (a === 'ALL') return -1;
    if (b === 'ALL') return 1;
    return b - a;
  });

  // 학기 필터링 (1학기, 여름학기, 2학기, 겨울학기, 캠프, 특강, 비정규 세션)
  const semesters = [
    { value: 'ALL', label: '전체' },
    { value: 'SPRING', label: '1학기' },
    { value: 'SUMMER', label: '여름학기' },
    { value: 'FALL', label: '2학기' },
    { value: 'WINTER', label: '겨울학기' },
    { value: 'CAMP', label: '캠프' },
    { value: 'SPECIAL', label: '특강' },
    { value: 'IRREGULAR', label: '비정규 세션' }
  ];

  // 필터링된 수업 목록
  const filteredSections = sections.filter(section => {
    const matchesYear = selectedYear === 'ALL' || section.year === parseInt(selectedYear);
    const matchesSemester = selectedSemester === 'ALL' || section.semester === selectedSemester;
    return matchesYear && matchesSemester;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="admin-loading-spinner"></div>
          <p>분반 정보를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">담당 분반 목록</h1>
          <p className="dashboard-subtitle">
            분반을 클릭하면 해당 수업의 관리 페이지로 이동합니다.
          </p>
        </div>

        {/* 필터 섹션 */}
        <div className="admin-filter-section">
          <div className="admin-filter-left">
            <div className="admin-filter-group">
              <label className="admin-filter-label">년도</label>
              <select 
                className="admin-filter-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'ALL' ? '전체' : `${year}년`}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-filter-group">
              <label className="admin-filter-label">학기</label>
              <select 
                className="admin-filter-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                {semesters.map(semester => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-filter-stats">
              <span className="admin-filter-count">총 {filteredSections.length}개 수업</span>
            </div>
          </div>
          <div className="admin-filter-right">
            <button 
              className="admin-btn-copy-section"
              onClick={() => setShowCopyModal(true)}
            >
              수업 가져오기
            </button>
            <button 
              className="admin-btn-create-section"
              onClick={() => setShowCreateModal(true)}
            >
              새 수업 만들기
            </button>
          </div>
        </div>

        <div className="admin-sections-grid">
          {filteredSections.map((section) => (
            <div 
              key={section.sectionId} 
              className={`section-card admin-clickable ${section.active === false ? 'admin-disabled' : ''}`}
              onClick={() => handleSectionClick(section)}
            >
              <div className="section-header">
                <div className="section-title-area">
                  <div className="admin-title-and-badge">
                    <h3 className="section-title">{section.courseTitle}</h3>
                  </div>
                  <span className="admin-year-badge">
                    {section.year || '2024'}년 {getSemesterLabel(section.semester)}
                  </span>
                </div>
              </div>

              <div className="section-info-grid">
                <div className="admin-info-row">
                  <span className="admin-info-label">담당교수</span>
                  <span className="admin-info-value">{section.instructorName}</span>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">수강인원</span>
                  <span className="admin-info-value">{section.studentCount || 0}명</span>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">과제</span>
                  <span className="admin-info-value">{section.assignmentCount || 0}개</span>
                </div>
                <div className="admin-info-row">
                  <span className="admin-info-label">공지사항</span>
                  <span className="admin-info-value">{section.noticeCount || 0}개</span>
                </div>
              </div>

              <div className="section-footer">
                <button 
                  className={`admin-btn-toggle-active ${section.active !== false ? 'admin-active' : 'admin-inactive'}`}
                  onClick={(e) => handleToggleActive(section.sectionId, section.active !== false, e)}
                  title={section.active !== false ? '비활성화하기' : '활성화하기'}
                >
                  {section.active !== false ? '활성' : '비활성'}
                </button>
                <span className="section-hint">클릭하여 관리하기</span>
                {section.enrollmentCode && (
                  <button
                    className="section-copy-link-btn"
                    onClick={(e) => handleCopyEnrollmentLink(section.enrollmentCode, e)}
                    title="수업 참가 링크 복사"
                  >
                    🔗
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredSections.length === 0 && sections.length > 0 && (
            <div className="admin-no-sections">
              <div className="admin-no-sections-message">
                <p>해당 조건에 맞는 수업이 없습니다.</p>
              </div>
            </div>
          )}
          {sections.length === 0 && (
            <div className="admin-no-sections">
              <div className="admin-no-sections-message">
                <p>담당하고 있는 분반이 없습니다.</p>
              </div>
            </div>
          )}
        </div>

        {/* 수업 생성 모달 */}
        {showCreateModal && (
          <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>새 수업 만들기</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>강의 제목</label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({...formData, courseTitle: e.target.value})}
                    className="admin-form-input"
                    placeholder="예: 자바프로그래밍"
                  />
                </div>

                <div className="admin-form-group">
                  <label>수업 설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="admin-form-input"
                    placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
                    rows="3"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>년도</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="admin-form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>구분</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      className="admin-form-select"
                    >
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                      <option value="CAMP">캠프</option>
                      <option value="SPECIAL">특강</option>
                      <option value="IRREGULAR">비정규 세션</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  className="admin-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button 
                  className="admin-btn-submit"
                  onClick={handleCreateSection}
                  disabled={!formData.courseTitle}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수업 가져오기 모달 */}
        {showCopyModal && (
          <div className="admin-modal-overlay" onClick={() => {
            setShowCopyModal(false);
            setCopyStep(1);
            setSelectedNoticeDetail(null);
            setSelectedProblemDetail(null);
          }}>
            <div className={`admin-modal-content ${copyStep === 1 ? '' : 'admin-modal-content-large'}`} onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>수업 가져오기</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyStep(1);
                    setSelectedNoticeDetail(null);
                    setSelectedProblemDetail(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className={copyStep === 1 ? "admin-modal-body" : "admin-modal-body admin-modal-body-large"}>
                {/* 1단계: 기본 정보 */}
                {copyStep === 1 && (
                  <div className="admin-step-content">
                    <h3 className="admin-step-title">1단계: 기본 정보 입력</h3>
                    
                <div className="admin-form-group">
                      <label>복사할 수업 선택 *</label>
                  <select
                    value={copyFormData.sourceSectionId}
                        onChange={(e) => handleSourceSectionChange(e.target.value)}
                    className="admin-form-select"
                  >
                    <option value="">수업을 선택하세요</option>
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                            {section.courseTitle} ({section.year || '2024'}년 {getSemesterLabel(section.semester)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                      <label>새 수업 제목 *</label>
                  <input
                        type="text"
                        value={copyFormData.courseTitle}
                        onChange={(e) => setCopyFormData({...copyFormData, courseTitle: e.target.value})}
                    className="admin-form-input"
                        placeholder="예: 자바프로그래밍"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>수업 설명</label>
                      <textarea
                        value={copyFormData.description}
                        onChange={(e) => setCopyFormData({...copyFormData, description: e.target.value})}
                        className="admin-form-input"
                        placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
                        rows="4"
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                        <label>년도 *</label>
                    <input
                      type="number"
                      value={copyFormData.year}
                      onChange={(e) => setCopyFormData({...copyFormData, year: e.target.value})}
                      className="admin-form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="admin-form-group">
                        <label>구분 *</label>
                    <select
                      value={copyFormData.semester}
                      onChange={(e) => setCopyFormData({...copyFormData, semester: e.target.value})}
                      className="admin-form-select"
                    >
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                          <option value="CAMP">캠프</option>
                          <option value="SPECIAL">특강</option>
                          <option value="IRREGULAR">비정규 세션</option>
                    </select>
                  </div>
                </div>
              </div>
                )}

                {/* 2단계: 공지사항 선택 */}
                {copyStep === 2 && (
                  <div className="admin-step-content">
                    <h3 className="admin-step-title">2단계: 공지사항 선택</h3>
                    <p className="admin-step-description">가져올 공지사항을 선택하세요. 건너뛰면 공지사항을 가져오지 않습니다.</p>
                    
                    {loadingNotices ? (
                      <div className="admin-loading-items">공지사항을 불러오는 중...</div>
                    ) : sourceNotices.length === 0 ? (
                      <div className="admin-no-items">가져올 공지사항이 없습니다.</div>
                    ) : (
                      <div className="admin-selection-box-large">
                        <div className="admin-selection-header">
                          <label className="admin-checkbox-label">
                            <input
                              type="checkbox"
                              checked={copyFormData.selectedNoticeIds.length === sourceNotices.length && sourceNotices.length > 0}
                              onChange={handleSelectAllNotices}
                            />
                            <span>전체 선택</span>
                          </label>
                          <span className="admin-item-count">
                            {copyFormData.selectedNoticeIds.length} / {sourceNotices.length}개 선택됨
                          </span>
                        </div>
                        
                        <div className="admin-item-list-large">
                          {sourceNotices.map((notice) => (
                            <div key={notice.id} className="admin-list-item-large">
                              <label className="admin-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={copyFormData.selectedNoticeIds.includes(notice.id)}
                                  onChange={() => handleNoticeToggle(notice.id)}
                                />
                                <div className="admin-item-info">
                                  <span className="admin-item-title-large">{notice.title}</span>
                                  <span className="admin-item-meta">
                                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                              </label>
                              <button
                                className="admin-btn-view-detail"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNoticeDetail(notice);
                                }}
                              >
                                상세보기
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3단계: 과제 및 문제 선택 */}
                {copyStep === 3 && (
                  <div className="admin-step-content">
                    <h3 className="admin-step-title">3단계: 과제 및 문제 선택</h3>
                    <p className="admin-step-description">가져올 과제와 문제를 선택하세요. 과제를 클릭하면 해당 과제의 문제 목록을 볼 수 있습니다.</p>
                    
                    {loadingAssignments ? (
                      <div className="admin-loading-items">과제를 불러오는 중...</div>
                    ) : sourceAssignments.length === 0 ? (
                      <div className="admin-no-items">가져올 과제가 없습니다.</div>
                    ) : (
                      <div className="admin-selection-box-large">
                        <div className="admin-selection-header">
                          <label className="admin-checkbox-label">
                            <input
                              type="checkbox"
                              checked={copyFormData.selectedAssignmentIds.length === sourceAssignments.length && sourceAssignments.length > 0}
                              onChange={handleSelectAllAssignments}
                            />
                            <span>전체 선택</span>
                          </label>
                          <span className="admin-item-count">
                            {copyFormData.selectedAssignmentIds.length} / {sourceAssignments.length}개 과제 선택됨
                          </span>
                        </div>
                        
                        <div className="assignment-list-large">
                          {sourceAssignments.map((assignment) => {
                            const isAssignmentSelected = copyFormData.selectedAssignmentIds.includes(assignment.id);
                            const selectedProblems = copyFormData.assignmentProblems[assignment.id] || [];
                            const isExpanded = expandedAssignments[assignment.id];
                            
                            return (
                              <div key={assignment.id} className={`assignment-item-large ${isExpanded ? 'admin-expanded' : ''}`}>
                                <div className="assignment-item-header-large">
                                  <label className="admin-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={isAssignmentSelected}
                                      onChange={() => handleAssignmentToggle(assignment.id)}
                                    />
                                    <div className="assignment-info-large">
                                      <span className="assignment-title-large">{assignment.title}</span>
                                      <span className="assignment-meta">
                                        {assignment.problems?.length || 0}개 문제
                                        {assignment.endDate && ` · 마감: ${new Date(assignment.endDate).toLocaleDateString('ko-KR')}`}
                                      </span>
                                    </div>
                                  </label>
                                  {assignment.problems && assignment.problems.length > 0 && (
                                    <button
                                      className="admin-btn-expand-assignment-large"
                                      onClick={() => toggleAssignmentExpand(assignment.id)}
                                      disabled={!isAssignmentSelected}
                                    >
                                      {isExpanded ? '접기 ▲' : '문제 보기 ▼'}
                                    </button>
                                  )}
                                </div>
                                
                                {isExpanded && isAssignmentSelected && assignment.problems && assignment.problems.length > 0 && (
                                  <div className="admin-problem-selection-box-large">
                                    <div className="admin-problem-selection-header-large">
                                      <label className="admin-checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={selectedProblems.length === assignment.problems.length}
                                          onChange={() => handleSelectAllProblems(assignment.id)}
                                        />
                                        <span>문제 전체 선택</span>
                                      </label>
                                      <span className="admin-item-count">
                                        {selectedProblems.length} / {assignment.problems.length}개
                                      </span>
                                    </div>
                                    <div className="admin-problem-list-large">
                                      {assignment.problems.map((problem, index) => (
                                        <div key={problem.id} className="admin-problem-item-large">
                                          <div className="admin-problem-item-large-header">
                                            <input
                                              type="checkbox"
                                              checked={selectedProblems.includes(problem.id)}
                                              onChange={() => handleProblemToggle(assignment.id, problem.id)}
                                              className="admin-problem-checkbox"
                                            />
                                          </div>
                                          <div className="admin-problem-item-large-body">
                                            <div className="admin-problem-title-row">
                                              <h4 className="admin-problem-title-large">
                                                <span className="admin-problem-number-large">{index + 1}.</span>
                                                {removeCopyLabel(problem.title)}
                                              </h4>
                                              <button
                                                className="admin-btn-view-detail-card"
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  try {
                                                    const problemInfo = await APIService.getProblemInfo(problem.id);
                                                    setSelectedProblemDetail(problemInfo.data || problemInfo);
                                                  } catch (error) {
                                                    console.error('문제 정보 조회 실패:', error);
                                                    alert('문제 정보를 불러오는데 실패했습니다.');
                                                  }
                                                }}
                                              >
                                                설명보기
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4단계: 최종 확인 */}
                {copyStep === 4 && (
                  <div className="admin-step-content">
                    <h3 className="admin-step-title">4단계: 최종 확인</h3>
                    <p className="admin-step-description">선택하신 내용을 확인하고 수업을 생성하세요.</p>
                    
                    <div className="admin-summary-section">
                      <div className="admin-summary-item">
                        <h4 className="admin-summary-label">수업 정보</h4>
                        <div className="admin-summary-content">
                          <div className="admin-summary-row">
                            <span className="admin-summary-key">제목:</span>
                            <span className="admin-summary-value">{copyFormData.courseTitle}</span>
                          </div>
                          {copyFormData.description && (
                            <div className="admin-summary-row">
                              <span className="admin-summary-key">설명:</span>
                              <span className="admin-summary-value">{copyFormData.description}</span>
                            </div>
                          )}
                          <div className="admin-summary-row">
                            <span className="admin-summary-key">년도:</span>
                            <span className="admin-summary-value">{copyFormData.year}년</span>
                          </div>
                          <div className="admin-summary-row">
                            <span className="admin-summary-key">구분:</span>
                            <span className="admin-summary-value">{getSemesterLabel(copyFormData.semester)}</span>
                          </div>
                        </div>
                      </div>

                      {copyFormData.copyNotices ? (
                        <div className="admin-summary-item">
                          <h4 className="admin-summary-label">공지사항</h4>
                          <div className="admin-summary-content">
                            <div className="admin-summary-row">
                              <span className="admin-summary-key">가져올 공지사항:</span>
                              <span className="admin-summary-value">
                                {copyFormData.selectedNoticeIds.length}개 선택됨
                              </span>
                            </div>
                            {copyFormData.selectedNoticeIds.length > 0 && (
                              <div className="admin-summary-list">
                                {sourceNotices
                                  .filter(n => copyFormData.selectedNoticeIds.includes(n.id))
                                  .map(notice => (
                                    <div key={notice.id} className="admin-summary-list-item">
                                      • {notice.title}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="admin-summary-item">
                          <h4 className="admin-summary-label">공지사항</h4>
                          <div className="admin-summary-content">
                            <span className="admin-summary-skipped">건너뛰기</span>
                          </div>
                        </div>
                      )}

                      {copyFormData.copyAssignments ? (
                        <div className="admin-summary-item">
                          <h4 className="admin-summary-label">과제 및 문제</h4>
                          <div className="admin-summary-content">
                            <div className="admin-summary-row">
                              <span className="admin-summary-key">가져올 과제:</span>
                              <span className="admin-summary-value">
                                {copyFormData.selectedAssignmentIds.length}개 선택됨
                              </span>
                            </div>
                            {copyFormData.selectedAssignmentIds.length > 0 && (
                              <div className="admin-summary-list">
                                {sourceAssignments
                                  .filter(a => copyFormData.selectedAssignmentIds.includes(a.id))
                                  .map(assignment => {
                                    const selectedProblems = copyFormData.assignmentProblems[assignment.id] || [];
                                    return (
                                      <div key={assignment.id} className="admin-summary-list-item">
                                        <div className="admin-summary-assignment">
                                          • {assignment.title} ({selectedProblems.length}개 문제)
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="admin-summary-item">
                          <h4 className="admin-summary-label">과제 및 문제</h4>
                          <div className="admin-summary-content">
                            <span className="admin-summary-skipped">건너뛰기</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>


              <div className="admin-modal-footer">
                {/* 1단계 버튼 */}
                {copyStep === 1 && (
                  <>
                <button 
                  className="admin-btn-cancel"
                      onClick={() => {
                        setShowCopyModal(false);
                        setCopyStep(1);
                      }}
                >
                  취소
                </button>
                    <button 
                      className="admin-btn-next"
                      onClick={() => setCopyStep(2)}
                      disabled={!copyFormData.sourceSectionId || !copyFormData.courseTitle}
                    >
                      다음
                    </button>
                  </>
                )}

                {/* 2단계 버튼 */}
                {copyStep === 2 && (
                  <>
                    <button 
                      className="admin-btn-prev"
                      onClick={() => setCopyStep(1)}
                    >
                      이전
                    </button>
                    <button 
                      className="admin-btn-skip"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyNotices: false, selectedNoticeIds: []}));
                        setCopyStep(3);
                      }}
                    >
                      건너뛰기
                    </button>
                    <button 
                      className="admin-btn-next"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyNotices: true}));
                        setCopyStep(3);
                      }}
                      disabled={copyFormData.selectedNoticeIds.length === 0}
                    >
                      다음 ({copyFormData.selectedNoticeIds.length}개 선택)
                    </button>
                  </>
                )}

                {/* 3단계 버튼 */}
                {copyStep === 3 && (
                  <>
                    <button 
                      className="admin-btn-prev"
                      onClick={() => setCopyStep(2)}
                    >
                      이전
                    </button>
                    <button 
                      className="admin-btn-skip"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyAssignments: false, selectedAssignmentIds: [], assignmentProblems: {}}));
                        setCopyStep(4);
                      }}
                    >
                      건너뛰기
                    </button>
                    <button 
                      className="admin-btn-next"
                      onClick={() => {
                        setCopyFormData(prev => ({...prev, copyAssignments: true}));
                        setCopyStep(4);
                      }}
                      disabled={copyFormData.selectedAssignmentIds.length === 0}
                    >
                      다음 ({copyFormData.selectedAssignmentIds.length}개 과제)
                    </button>
                  </>
                )}

                {/* 4단계: 최종 확인 */}
                {copyStep === 4 && (
                  <>
                    <button 
                      className="admin-btn-prev"
                      onClick={() => setCopyStep(3)}
                    >
                      이전
                    </button>
                <button 
                  className="admin-btn-submit"
                  onClick={handleCopySection}
                >
                      수업 만들기
                </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 상세보기 패널 */}
        {(selectedNoticeDetail || selectedProblemDetail) && (
          <>
            <div className="admin-detail-overlay" onClick={() => {
              setSelectedNoticeDetail(null);
              setSelectedProblemDetail(null);
            }}></div>
            <div className="admin-detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="admin-detail-panel-header">
                <h3>{selectedNoticeDetail ? '공지사항 상세' : '문제 설명'}</h3>
                <button
                  className="admin-btn-close-detail"
                  onClick={() => {
                    setSelectedNoticeDetail(null);
                    setSelectedProblemDetail(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="admin-detail-panel-content">
                {selectedNoticeDetail && (
                  <div className="notice-detail-content">
                    <h4 className="admin-detail-title">{selectedNoticeDetail.title}</h4>
                    <div className="admin-detail-meta">
                      작성일: {new Date(selectedNoticeDetail.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                    <div className="admin-detail-body">
                      {selectedNoticeDetail.content}
                    </div>
                  </div>
                )}
                {selectedProblemDetail && (
                  <div className="admin-problem-detail-content">
                    <h4 className="admin-detail-title">{selectedProblemDetail.title}</h4>
                    <div className="admin-detail-meta">
                      {selectedProblemDetail.timeLimit && (
                        <span>시간 제한: {selectedProblemDetail.timeLimit}초</span>
                      )}
                      {selectedProblemDetail.memoryLimit && (
                        <span>메모리 제한: {selectedProblemDetail.memoryLimit}MB</span>
                      )}
                    </div>
                    <div className="admin-detail-body admin-problem-description">
                      {selectedProblemDetail.description ? (
                        (() => {
                          const description = selectedProblemDetail.description;
                          const isMarkdown = description.includes('# ') || 
                            description.includes('## ') || 
                            description.includes('```') ||
                            description.includes('**') ||
                            !description.includes('<');
                          
                          return isMarkdown ? (
                            <ReactMarkdown
                              components={{
                                code({node, inline, className, children, ...props}) {
                                  return inline ? (
                                    <code className="admin-inline-code" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="admin-code-block">
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </pre>
                                  );
                                }
                              }}
                            >
                              {description}
                            </ReactMarkdown>
                          ) : (
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                          );
                        })()
                      ) : (
                        <p>설명이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;