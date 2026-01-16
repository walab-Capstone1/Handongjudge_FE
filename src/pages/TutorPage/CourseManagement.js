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

  useEffect(() => {
    fetchSections();
    fetchAvailableCourses();
  }, []);

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
      </div>
    </TutorLayout>
  );
};

export default CourseManagement;