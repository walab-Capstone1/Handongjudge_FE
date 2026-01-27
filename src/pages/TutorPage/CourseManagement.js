import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import "./CourseManagement.css";

const CourseManagement = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    courseTitle: '',
    description: '',
    year: new Date().getFullYear(),
    semester: 'SPRING'
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCopyModal, setShowCopyModal] = useState(false);
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
    assignmentProblems: {}, // { assignmentId: [problemIds] }
    noticeEdits: {}, // { noticeId: { title, content } }
    assignmentEdits: {}, // { assignmentId: { title, description } }
    problemEdits: {} // { problemId: { title } }
  });
  const [sourceNotices, setSourceNotices] = useState([]);
  const [sourceAssignments, setSourceAssignments] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [copyStep, setCopyStep] = useState(1); // 1: 기본정보, 2: 공지사항, 3: 과제/문제, 4: 확인
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [viewingNoticeId, setViewingNoticeId] = useState(null); // 조회 중인 공지사항 ID
  const [openDropdownId, setOpenDropdownId] = useState(null); // 열려있는 드롭다운 ID

  useEffect(() => {
    fetchSections();
    fetchAvailableCourses();
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.tutor-course-card-dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdownId]);

  const fetchAvailableCourses = async () => {
    try {
      const courses = await APIService.getCourses();
      setAvailableCourses(courses || []);
    } catch (error) {
      console.error('강의 목록 조회 실패:', error);
      setAvailableCourses([]);
    }
  };

  const handleCreateSection = async () => {
    try {
      // Course 선택 방식이면 기존 Course 사용, 아니면 새 Course 생성
      let courseId;
      if (formData.courseId) {
        courseId = parseInt(formData.courseId);
      } else if (formData.courseTitle) {
        // 새 Course 생성
        const courseResponse = await APIService.createCourse({
          title: formData.courseTitle,
          description: formData.description || ''
        });
        courseId = courseResponse.id;
      } else {
        alert('강의를 선택하거나 새 강의 제목을 입력해주세요.');
        return;
      }

      const response = await APIService.createSection({
        courseId: courseId,
        instructorId: await APIService.getCurrentUserId(), // 현재 로그인한 사용자 ID
        sectionNumber: null, // 표시용이므로 null로 전달
        year: parseInt(formData.year),
        semester: formData.semester
      });

      alert('수업이 성공적으로 생성되었습니다!');
      setShowCreateModal(false);
      setFormData({
        courseId: '',
        courseTitle: '',
        description: '',
        year: new Date().getFullYear(),
        semester: 'SPRING'
      });
      fetchSections();
    } catch (error) {
      console.error('수업 생성 실패:', error);
      alert(error.message || '수업 생성에 실패했습니다.');
    }
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      setSections(sectionsData);
      setLoading(false);
    } catch (error) {
      setSections([]);
      setLoading(false);
    }
  };

  const handleToggleActive = async (sectionId, currentActive) => {
    try {
      const newActiveStatus = !currentActive;
      await APIService.toggleSectionActive(sectionId, newActiveStatus);
      alert(newActiveStatus ? '수업이 활성화되었습니다.' : '수업이 비활성화되었습니다.');
      fetchSections(); // 목록 새로고침
    } catch (error) {
      console.error('수업 상태 변경 실패:', error);
      alert(error.message || '수업 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteSection = async (sectionId, sectionTitle) => {
    if (!window.confirm(`정말로 분반 "${sectionTitle}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await APIService.deleteSection(sectionId);
      alert('분반이 삭제되었습니다.');
      fetchSections(); // 목록 새로고침
    } catch (error) {
      console.error('분반 삭제 실패:', error);
      alert(error.message || '분반 삭제에 실패했습니다.');
    }
  };

  const getSemesterLabel = (semester) => {
    switch(semester) {
      case 'SPRING': return '1학기';
      case 'SUMMER': return '여름학기';
      case 'FALL': return '2학기';
      case 'WINTER': return '겨울학기';
      case 'CAMP': return '캠프';
      case 'SPECIAL': return '특강';
      case 'IRREGULAR': return '비정규 세션';
      default: return semester || '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 수업 선택 시 공지사항 및 과제 목록 불러오기
  const handleSourceSectionChange = async (sectionId) => {
    setCopyFormData({...copyFormData, sourceSectionId: sectionId, selectedNoticeIds: [], selectedAssignmentIds: [], assignmentProblems: {}, noticeEdits: {}, assignmentEdits: {}, problemEdits: {}});
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

        // 초기에는 모든 항목이 비활성화 상태 (선택 안 됨)
        setCopyFormData(prev => ({
          ...prev,
          sourceSectionId: sectionId,
          selectedNoticeIds: [], // 초기에는 선택 안 됨
          selectedAssignmentIds: [], // 초기에는 선택 안 됨
          assignmentProblems: {} // 초기에는 문제도 선택 안 됨
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
      setCopyFormData(prev => ({...prev, selectedNoticeIds: []}));
    } else {
      setCopyFormData(prev => ({...prev, selectedNoticeIds: sourceNotices.map(n => n.id)}));
    }
  };

  // 공지사항 제목/내용 수정
  const handleNoticeEdit = (noticeId, field, value) => {
    setCopyFormData(prev => {
      const edits = prev.noticeEdits[noticeId] || {};
      return {
        ...prev,
        noticeEdits: {
          ...prev.noticeEdits,
          [noticeId]: { ...edits, [field]: value }
        }
      };
    });
  };

  // 과제 선택/해제
  const handleAssignmentToggle = (assignmentId) => {
    setCopyFormData(prev => {
      const isSelected = prev.selectedAssignmentIds.includes(assignmentId);
      if (isSelected) {
        const newAssignmentProblems = {...prev.assignmentProblems};
        delete newAssignmentProblems[assignmentId];
        return {
          ...prev,
          selectedAssignmentIds: prev.selectedAssignmentIds.filter(id => id !== assignmentId),
          assignmentProblems: newAssignmentProblems
        };
      } else {
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
      setCopyFormData(prev => ({...prev, selectedAssignmentIds: [], assignmentProblems: {}}));
    } else {
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

  // 과제 제목/내용 수정
  const handleAssignmentEdit = (assignmentId, field, value) => {
    setCopyFormData(prev => {
      const edits = prev.assignmentEdits[assignmentId] || {};
      return {
        ...prev,
        assignmentEdits: {
          ...prev.assignmentEdits,
          [assignmentId]: { ...edits, [field]: value }
        }
      };
    });
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

  // 문제 제목 수정
  const handleProblemEdit = (problemId, title) => {
    setCopyFormData(prev => ({
      ...prev,
      problemEdits: {
        ...prev.problemEdits,
        [problemId]: { title }
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
        copyFormData.copyAssignments ? copyFormData.assignmentProblems : {},
        copyFormData.noticeEdits,
        copyFormData.assignmentEdits,
        copyFormData.problemEdits
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
          assignmentProblems: {},
          noticeEdits: {},
          assignmentEdits: {},
          problemEdits: {}
        });
        setSourceNotices([]);
        setSourceAssignments([]);
        setExpandedAssignments({});
        setEditingNoticeId(null);
        setEditingAssignmentId(null);
        setEditingProblemId(null);
        fetchSections();
      } else {
        alert(response.message || '수업 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('수업 복사 실패:', error);
      alert(error.message || '수업 복사에 실패했습니다.');
    }
  };

  // 사용 가능한 년도 목록 추출
  const availableYears = [...new Set(sections.map(s => s.year).filter(Boolean))].sort((a, b) => b - a);

  const filteredSections = sections.filter(section => {
    // 검색어 필터
    const matchesSearch = !searchTerm || 
      section.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (section.instructorName && section.instructorName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // 년도 필터
    const matchesYear = filterYear === 'ALL' || section.year === parseInt(filterYear);
    
    // 학기 필터
    const matchesSemester = filterSemester === 'ALL' || section.semester === filterSemester;
    
    // 상태 필터
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && section.active !== false) ||
      (filterStatus === 'INACTIVE' && section.active === false);
    
    return matchesSearch && matchesYear && matchesSemester && matchesStatus;
  });

  if (loading) {
    return (
      <TutorLayout>
        <div className="course-management">
          <div className="tutor-loading-container">
            <div className="tutor-loading-spinner"></div>
            <p>수업 정보를 불러오는 중...</p>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
        <div className="course-management">
        {/* 타이틀 헤더 섹션 */}
        <div className="course-management-title-header">
          <div className="course-management-title-left">
            <h1 className="course-management-title">수업 관리</h1>
            <div className="course-management-title-stats">
              <span className="course-management-stat-badge">총 {sections.length}개 분반</span>
              <span className="course-management-stat-badge">표시 {filteredSections.length}개</span>
            </div>
          </div>
          <div className="course-management-title-right">
            <button 
              className="course-management-btn-copy"
              onClick={() => setShowCopyModal(true)}
            >
              기존 수업 복사
            </button>
            <button 
              className="course-management-btn-create"
              onClick={() => setShowCreateModal(true)}
            >
              + 새 수업 만들기
            </button>
          </div>
        </div>
        
        {/* 필터 섹션 */}
        <div className="course-management-filters-section">
          <div className="course-management-search-box">
            <input
              type="text"
              placeholder="수업명, 교수명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="course-management-search-input"
            />
          </div>
          
          <div className="course-management-filter-group">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="course-management-filter-select"
            >
              <option value="ALL">전체 년도</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>
          
          <div className="course-management-filter-group">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="course-management-filter-select"
            >
              <option value="ALL">전체 학기</option>
              <option value="SPRING">1학기</option>
              <option value="SUMMER">여름학기</option>
              <option value="FALL">2학기</option>
              <option value="WINTER">겨울학기</option>
              <option value="CAMP">캠프</option>
              <option value="SPECIAL">특강</option>
              <option value="IRREGULAR">비정규 세션</option>
            </select>
          </div>
          
          <div className="course-management-filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="course-management-filter-select"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>
        </div>

        <div className="tutor-sections-grid">
          {filteredSections.map((section) => (
            <div key={section.sectionId} className="tutor-course-section-card">
              {/* 헤더: 제목과 상태 배지 */}
              <div className="tutor-course-card-header">
                <h3 className="tutor-course-card-title">{section.courseTitle}</h3>
                <span className={`tutor-course-card-status-badge ${section.active !== false ? 'active' : 'inactive'}`}>
                  {section.active !== false ? '활성' : '비활성'}
                </span>
              </div>

              {/* 컴팩트한 통계 정보 및 메타 정보 */}
              <div className="tutor-course-card-stats-compact">
                <div className="tutor-course-card-stat-item">
                  <span className="tutor-course-card-stat-label">학생</span>
                  <span className="tutor-course-card-stat-value">{section.studentCount || 0}명</span>
                </div>
                <div className="tutor-course-card-stat-item">
                  <span className="tutor-course-card-stat-label">공지</span>
                  <span className="tutor-course-card-stat-value">{section.noticeCount || 0}개</span>
                </div>
                <div className="tutor-course-card-stat-item">
                  <span className="tutor-course-card-stat-label">학기</span>
                  <span className="tutor-course-card-stat-value">{section.year || new Date().getFullYear()}년 {getSemesterLabel(section.semester)}</span>
                </div>
                {section.createdAt && (
                  <div className="tutor-course-card-stat-item">
                    <span className="tutor-course-card-stat-label">생성일</span>
                    <span className="tutor-course-card-stat-value">{formatDate(section.createdAt)}</span>
                  </div>
                )}
              </div>

              {/* 컴팩트한 액션 버튼 영역 */}
              <div className="tutor-course-card-actions-compact">
                <button 
                  className={`tutor-course-card-btn-toggle-status ${section.active !== false ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(section.sectionId, section.active !== false)}
                  title={section.active !== false ? '비활성화하기' : '활성화하기'}
                >
                  {section.active !== false ? '활성' : '비활성'}
                </button>
                <div className="tutor-course-card-action-buttons-compact">
                  <button 
                    className="tutor-course-card-action-btn-compact"
                    onClick={() => navigate(`/tutor/notices/section/${section.sectionId}`)}
                    title="공지사항"
                  >
                    공지
                  </button>
                  <button 
                    className="tutor-course-card-action-btn-compact"
                    onClick={() => navigate(`/tutor/users/section/${section.sectionId}`)}
                    title="학생 관리"
                  >
                    학생
                  </button>
                  <button 
                    className="tutor-course-card-action-btn-compact"
                    onClick={() => navigate(`/tutor/grades/section/${section.sectionId}`)}
                    title="성적 관리"
                  >
                    성적
                  </button>
                  <button 
                    className="tutor-course-card-action-btn-compact primary"
                    onClick={() => navigate(`/tutor/assignments/section/${section.sectionId}`)}
                    title="과제 관리"
                  >
                    과제
                  </button>
                  <div className="tutor-course-card-dropdown-container">
                    <button 
                      className="tutor-course-card-action-btn-compact dropdown-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === section.sectionId ? null : section.sectionId);
                      }}
                      title="더보기"
                    >
                      ⋯
                    </button>
                    {openDropdownId === section.sectionId && (
                      <div className="tutor-course-card-dropdown-menu">
                        <button 
                          className="tutor-course-card-dropdown-item delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(null);
                            handleDeleteSection(section.sectionId, section.courseTitle);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="tutor-no-sections">
            <p>
              {searchTerm || filterYear !== 'ALL' || filterSemester !== 'ALL' || filterStatus !== 'ALL'
                ? '검색 조건에 맞는 수업이 없습니다.' 
                : '담당하고 있는 수업이 없습니다.'
              }
            </p>
          </div>
        )}

        {/* 수업 생성 모달 */}
        {showCreateModal && (
          <div className="tutor-modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="tutor-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <h2>새 수업 만들기</h2>
                <button 
                  className="tutor-modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="tutor-modal-body">
                <div className="tutor-form-group">
                  <label>강의 선택 또는 새 강의 제목 입력</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value, courseTitle: ''})}
                    className="tutor-form-select"
                  >
                    <option value="">새 강의 만들기</option>
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                {!formData.courseId && (
                  <>
                <div className="tutor-form-group">
                      <label>새 강의 제목</label>
                  <input
                        type="text"
                        value={formData.courseTitle}
                        onChange={(e) => setFormData({...formData, courseTitle: e.target.value})}
                        className="tutor-form-input"
                        placeholder="예: 자바프로그래밍"
                      />
                    </div>
                    <div className="tutor-form-group">
                      <label>수업 설명</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="tutor-form-input"
                        placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
                        rows="3"
                  />
                </div>
                  </>
                )}

                <div className="tutor-form-row">
                  <div className="tutor-form-group">
                    <label>년도</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="tutor-form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="tutor-form-group">
                    <label>구분</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      className="tutor-form-select"
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

              <div className="tutor-modal-footer">
                <button 
                  className="tutor-btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button 
                  className="tutor-btn-submit"
                  onClick={handleCreateSection}
                  disabled={!formData.courseId && !formData.courseTitle}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수업 복사 모달 */}
        {showCopyModal && (
          <div className="tutor-modal-overlay" onClick={() => {
            setShowCopyModal(false);
            setCopyStep(1);
            setEditingNoticeId(null);
            setEditingAssignmentId(null);
            setEditingProblemId(null);
          }}>
            <div className={`tutor-modal-content ${copyStep > 1 ? 'tutor-modal-content-large' : ''}`} onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <h2>기존 수업 복사</h2>
                <button 
                  className="tutor-modal-close"
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyStep(1);
                    setEditingNoticeId(null);
                    setEditingAssignmentId(null);
                    setEditingProblemId(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className={`tutor-modal-body ${copyStep > 1 ? 'tutor-modal-body-large' : ''}`}>
                {/* 1단계: 기본 정보 */}
                {copyStep === 1 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">1단계: 기본 정보 입력</h3>
                    
                    <div className="tutor-form-group">
                      <label>복사할 수업 선택 *</label>
                      <select
                        value={copyFormData.sourceSectionId}
                        onChange={(e) => handleSourceSectionChange(e.target.value)}
                        className="tutor-form-select"
                      >
                        <option value="">수업을 선택하세요</option>
                        {sections.map((section) => (
                          <option key={section.sectionId} value={section.sectionId}>
                            {section.courseTitle} ({section.year || '2024'}년 {getSemesterLabel(section.semester)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="tutor-form-group">
                      <label>새 수업 제목 *</label>
                      <input
                        type="text"
                        value={copyFormData.courseTitle}
                        onChange={(e) => setCopyFormData({...copyFormData, courseTitle: e.target.value})}
                        className="tutor-form-input"
                        placeholder="예: 자바프로그래밍"
                      />
                    </div>

                    <div className="tutor-form-group">
                      <label>수업 설명</label>
                      <textarea
                        value={copyFormData.description}
                        onChange={(e) => setCopyFormData({...copyFormData, description: e.target.value})}
                        className="tutor-form-input"
                        placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
                        rows="4"
                      />
                    </div>

                    <div className="tutor-form-row">
                      <div className="tutor-form-group">
                        <label>년도 *</label>
                        <input
                          type="number"
                          value={copyFormData.year}
                          onChange={(e) => setCopyFormData({...copyFormData, year: e.target.value})}
                          className="tutor-form-input"
                          placeholder="2025"
                          min="2020"
                          max="2099"
                        />
                      </div>

                      <div className="tutor-form-group">
                        <label>구분 *</label>
                        <select
                          value={copyFormData.semester}
                          onChange={(e) => setCopyFormData({...copyFormData, semester: e.target.value})}
                          className="tutor-form-select"
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

                    <div className="tutor-form-group">
                      <label className="tutor-checkbox-label tutor-checkbox-label-large">
                        <input
                          type="checkbox"
                          checked={copyFormData.copyNotices}
                          onChange={(e) => setCopyFormData({...copyFormData, copyNotices: e.target.checked})}
                        />
                        <div className="tutor-checkbox-content">
                          <span className="tutor-checkbox-title">공지사항 복사</span>
                          <span className="tutor-checkbox-description">복사할 공지사항을 선택할 수 있습니다</span>
                        </div>
                      </label>
                    </div>

                    <div className="tutor-form-group">
                      <label className="tutor-checkbox-label tutor-checkbox-label-large">
                        <input
                          type="checkbox"
                          checked={copyFormData.copyAssignments}
                          onChange={(e) => setCopyFormData({...copyFormData, copyAssignments: e.target.checked})}
                        />
                        <div className="tutor-checkbox-content">
                          <span className="tutor-checkbox-title">과제 및 문제 복사</span>
                          <span className="tutor-checkbox-description">복사할 과제와 문제를 선택할 수 있습니다</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* 2단계: 공지사항 선택 및 수정 */}
                {copyStep === 2 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">2단계: 공지사항 선택 및 수정</h3>
                    <p className="tutor-step-description">
                      가져올 공지사항을 선택하고 제목/내용을 수정할 수 있습니다. 
                      <strong className="tutor-step-highlight"> 선택하지 않은 공지사항은 복사되지 않습니다.</strong>
                    </p>
                    
                    {loadingNotices ? (
                      <div className="tutor-loading-items">공지사항을 불러오는 중...</div>
                    ) : sourceNotices.length === 0 ? (
                      <div className="tutor-no-items">가져올 공지사항이 없습니다.</div>
                    ) : (
                      <div className="tutor-selection-box-large">
                        <div className="tutor-selection-header">
                          <label className="tutor-checkbox-label">
                            <input
                              type="checkbox"
                              checked={copyFormData.selectedNoticeIds.length === sourceNotices.length && sourceNotices.length > 0}
                              onChange={handleSelectAllNotices}
                            />
                            <span>전체 선택</span>
                          </label>
                          <span className="tutor-item-count">
                            {copyFormData.selectedNoticeIds.length} / {sourceNotices.length}개 선택됨
                          </span>
                        </div>
                        
                        <div className="tutor-item-list-large tutor-item-list-compact">
                          {sourceNotices.map((notice) => {
                            const isSelected = copyFormData.selectedNoticeIds.includes(notice.id);
                            const isEditing = editingNoticeId === notice.id;
                            const editData = copyFormData.noticeEdits[notice.id] || {};
                            const displayTitle = editData.title || notice.title;
                            
                            return (
                              <div key={notice.id} className={`tutor-list-item-large ${isSelected ? 'selected' : ''}`}>
                                {isEditing ? (
                                  <div className="tutor-edit-form tutor-edit-form-inline">
                                    <input
                                      type="text"
                                      value={editData.title || notice.title}
                                      onChange={(e) => handleNoticeEdit(notice.id, 'title', e.target.value)}
                                      className="tutor-edit-input"
                                      placeholder="제목"
                                    />
                                    <textarea
                                      value={editData.content || notice.content}
                                      onChange={(e) => handleNoticeEdit(notice.id, 'content', e.target.value)}
                                      className="tutor-edit-textarea"
                                      placeholder="내용"
                                      rows="4"
                                    />
                                    <div className="tutor-edit-form-actions">
                                      <button
                                        className="tutor-btn-save-edit"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNoticeId(null);
                                        }}
                                      >
                                        저장
                                      </button>
                                      <button
                                        className="tutor-btn-cancel"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingNoticeId(null);
                                        }}
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <label className="tutor-checkbox-label tutor-checkbox-label-item">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleNoticeToggle(notice.id)}
                                      />
                                      <div className="tutor-item-info">
                                        <span className="tutor-item-title-large">{displayTitle}</span>
                                        <span className="tutor-item-meta">
                                          {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                                        </span>
                                      </div>
                                    </label>
                                    <button
                                      className="tutor-btn-view"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingNoticeId(notice.id);
                                      }}
                                      title="공지사항 내용 보기"
                                    >
                                      조회
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3단계: 과제 및 문제 선택 및 수정 */}
                {copyStep === 3 && (
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">3단계: 과제 및 문제 선택 및 수정</h3>
                    <p className="tutor-step-description">
                      가져올 과제와 문제를 선택하고 제목/내용을 수정할 수 있습니다. 
                      <strong className="tutor-step-highlight"> 선택하지 않은 과제나 문제는 복사되지 않습니다.</strong>
                    </p>
                    
                    {loadingAssignments ? (
                      <div className="tutor-loading-items">과제를 불러오는 중...</div>
                    ) : sourceAssignments.length === 0 ? (
                      <div className="tutor-no-items">가져올 과제가 없습니다.</div>
                    ) : (
                      <div className="tutor-selection-box-large">
                        <div className="tutor-selection-header">
                          <label className="tutor-checkbox-label">
                            <input
                              type="checkbox"
                              checked={copyFormData.selectedAssignmentIds.length === sourceAssignments.length && sourceAssignments.length > 0}
                              onChange={handleSelectAllAssignments}
                            />
                            <span>전체 선택</span>
                          </label>
                          <span className="tutor-item-count">
                            {copyFormData.selectedAssignmentIds.length} / {sourceAssignments.length}개 과제 선택됨
                          </span>
                        </div>
                        
                        <div className="tutor-assignment-list-large">
                          {sourceAssignments.map((assignment) => {
                            const isAssignmentSelected = copyFormData.selectedAssignmentIds.includes(assignment.id);
                            const selectedProblems = copyFormData.assignmentProblems[assignment.id] || [];
                            const isExpanded = expandedAssignments[assignment.id];
                            const isEditingAssignment = editingAssignmentId === assignment.id;
                            const assignmentEditData = copyFormData.assignmentEdits[assignment.id] || {};
                            const displayAssignmentTitle = assignmentEditData.title || assignment.title;
                            const displayAssignmentDesc = assignmentEditData.description || assignment.description;
                            
                            return (
                              <div key={assignment.id} className={`tutor-assignment-item-large ${isAssignmentSelected ? 'selected' : ''}`}>
                                <div className="tutor-assignment-header">
                                  <label className="tutor-checkbox-label">
                                    <input
                                      type="checkbox"
                                      checked={isAssignmentSelected}
                                      onChange={() => handleAssignmentToggle(assignment.id)}
                                    />
                                    <div className="tutor-assignment-info">
                                      {isEditingAssignment ? (
                                        <div className="tutor-edit-form">
                                          <input
                                            type="text"
                                            value={assignmentEditData.title || assignment.title}
                                            onChange={(e) => handleAssignmentEdit(assignment.id, 'title', e.target.value)}
                                            className="tutor-edit-input"
                                            placeholder="과제 제목"
                                          />
                                          <textarea
                                            value={assignmentEditData.description || assignment.description}
                                            onChange={(e) => handleAssignmentEdit(assignment.id, 'description', e.target.value)}
                                            className="tutor-edit-textarea"
                                            placeholder="과제 설명"
                                            rows="3"
                                          />
                                          <button
                                            className="tutor-btn-save-edit"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingAssignmentId(null);
                                            }}
                                          >
                                            저장
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <span className="tutor-assignment-title">{displayAssignmentTitle}</span>
                                          <span className="tutor-assignment-meta">
                                            {new Date(assignment.startDate).toLocaleDateString('ko-KR')} ~ {new Date(assignment.endDate).toLocaleDateString('ko-KR')}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </label>
                                  {!isEditingAssignment && (
                                    <div className="tutor-assignment-actions">
                                      <button
                                        className="tutor-btn-expand"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAssignmentExpand(assignment.id);
                                        }}
                                      >
                                        {isExpanded ? '접기' : '펼치기'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                                
                                {isExpanded && isAssignmentSelected && assignment.problems && assignment.problems.length > 0 && (
                                  <div className="tutor-problems-list">
                                    <div className="tutor-problems-header">
                                      <label className="tutor-checkbox-label">
                                        <input
                                          type="checkbox"
                                          checked={selectedProblems.length === assignment.problems.length}
                                          onChange={() => handleSelectAllProblems(assignment.id)}
                                        />
                                        <span>전체 문제 선택</span>
                                      </label>
                                      <span className="tutor-item-count">
                                        {selectedProblems.length} / {assignment.problems.length}개 선택됨
                                      </span>
                                    </div>
                                    {assignment.problems.map((problem) => {
                                      const isProblemSelected = selectedProblems.includes(problem.id);
                                      const isEditingProblem = editingProblemId === problem.id;
                                      const problemEditData = copyFormData.problemEdits[problem.id] || {};
                                      const displayProblemTitle = problemEditData.title || problem.title;
                                      
                                      return (
                                        <div key={problem.id} className={`tutor-problem-item ${isProblemSelected ? 'selected' : ''}`}>
                                          <label className="tutor-checkbox-label">
                                            <input
                                              type="checkbox"
                                              checked={isProblemSelected}
                                              onChange={() => handleProblemToggle(assignment.id, problem.id)}
                                            />
                                            <div className="tutor-problem-info">
                                              {isEditingProblem ? (
                                                <div className="tutor-edit-form">
                                                  <input
                                                    type="text"
                                                    value={problemEditData.title || problem.title}
                                                    onChange={(e) => handleProblemEdit(problem.id, e.target.value)}
                                                    className="tutor-edit-input"
                                                    placeholder="문제 제목"
                                                  />
                                                  <button
                                                    className="tutor-btn-save-edit"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingProblemId(null);
                                                    }}
                                                  >
                                                    저장
                                                  </button>
                                                </div>
                                              ) : (
                                                <span className="tutor-problem-title">{displayProblemTitle}</span>
                                              )}
                                            </div>
                                          </label>
                                        </div>
                                      );
                                    })}
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
                  <div className="tutor-step-content">
                    <h3 className="tutor-step-title">4단계: 최종 확인</h3>
                    <div className="tutor-summary-box">
                      <div className="tutor-summary-item">
                        <strong>새 수업 제목:</strong> {copyFormData.courseTitle}
                      </div>
                      <div className="tutor-summary-item">
                        <strong>년도/학기:</strong> {copyFormData.year}년 {getSemesterLabel(copyFormData.semester)}
                      </div>
                      {copyFormData.copyNotices && (
                        <div className="tutor-summary-item">
                          <strong>공지사항:</strong> {copyFormData.selectedNoticeIds.length}개 선택
                        </div>
                      )}
                      {copyFormData.copyAssignments && (
                        <div className="tutor-summary-item">
                          <strong>과제:</strong> {copyFormData.selectedAssignmentIds.length}개 선택
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="tutor-modal-footer">
                {copyStep > 1 && (
                  <button 
                    className="tutor-btn-cancel"
                    onClick={() => setCopyStep(copyStep - 1)}
                  >
                    이전
                  </button>
                )}
                <button 
                  className="tutor-btn-cancel"
                  onClick={() => {
                    setShowCopyModal(false);
                    setCopyStep(1);
                    setEditingNoticeId(null);
                    setEditingAssignmentId(null);
                    setEditingProblemId(null);
                  }}
                >
                  취소
                </button>
                {copyStep < 4 ? (
                  <button 
                    className="tutor-btn-submit"
                    onClick={() => {
                      if (copyStep === 1 && !copyFormData.sourceSectionId) {
                        alert('복사할 수업을 선택해주세요.');
                        return;
                      }
                      if (copyStep === 1 && !copyFormData.courseTitle) {
                        alert('새 수업 제목을 입력해주세요.');
                        return;
                      }
                      if (copyStep === 2 && copyFormData.copyNotices && copyFormData.selectedNoticeIds.length === 0) {
                        if (!window.confirm('공지사항을 선택하지 않았습니다. 계속하시겠습니까?')) {
                          return;
                        }
                      }
                      if (copyStep === 3 && copyFormData.copyAssignments && copyFormData.selectedAssignmentIds.length === 0) {
                        if (!window.confirm('과제를 선택하지 않았습니다. 계속하시겠습니까?')) {
                          return;
                        }
                      }
                      setCopyStep(copyStep + 1);
                    }}
                  >
                    다음
                  </button>
                ) : (
                  <button 
                    className="tutor-btn-submit"
                    onClick={handleCopySection}
                  >
                    복사하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 공지사항 조회 모달 */}
        {viewingNoticeId && (
          <div className="tutor-modal-overlay" onClick={() => setViewingNoticeId(null)}>
            <div className="tutor-modal-content tutor-modal-content-view" onClick={(e) => e.stopPropagation()}>
              <div className="tutor-modal-header">
                <h2>공지사항 내용</h2>
                <button 
                  className="tutor-modal-close"
                  onClick={() => setViewingNoticeId(null)}
                >
                  ×
                </button>
              </div>
              <div className="tutor-modal-body">
                {(() => {
                  const notice = sourceNotices.find(n => n.id === viewingNoticeId);
                  if (!notice) return <div>공지사항을 찾을 수 없습니다.</div>;
                  const editData = copyFormData.noticeEdits[notice.id] || {};
                  const displayTitle = editData.title || notice.title;
                  const displayContent = editData.content || notice.content;
                  
                  return (
                    <div className="tutor-notice-view">
                      <div className="tutor-notice-view-title">{displayTitle}</div>
                      <div className="tutor-notice-view-meta">
                        작성일: {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="tutor-notice-view-content">{displayContent}</div>
                      <div className="tutor-notice-view-actions">
                        <button
                          className="tutor-btn-edit"
                          onClick={() => {
                            setViewingNoticeId(null);
                            // 수정 모달을 위해 copyStep을 2로 유지하고 editingNoticeId 설정
                            setEditingNoticeId(notice.id);
                          }}
                        >
                          수정하기
                        </button>
                        <button
                          className="tutor-btn-cancel"
                          onClick={() => setViewingNoticeId(null)}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default CourseManagement;