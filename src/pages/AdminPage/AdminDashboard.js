import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
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
    sectionNumber: '',
    year: new Date().getFullYear(),
    semester: 'SPRING'
  });
  const [copyFormData, setCopyFormData] = useState({
    sourceSectionId: '',
    sectionNumber: '',
    year: new Date().getFullYear(),
    semester: 'SPRING'
  });

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
        description: ''
      });

      // 2단계: Section 생성 (DomJudge Contest 자동 생성)
      const sectionResponse = await APIService.createSection({
        courseId: courseResponse.id,
        instructorId: instructorId,
        sectionNumber: parseInt(formData.sectionNumber),
        year: parseInt(formData.year),
        semester: formData.semester
      });

      alert('수업이 성공적으로 생성되었습니다!');
      setShowCreateModal(false);
      setFormData({
        courseTitle: '',
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

  const handleCopySection = async () => {
    try {
      if (!copyFormData.sourceSectionId) {
        alert('복사할 수업을 선택해주세요.');
        return;
      }

      if (!copyFormData.sectionNumber) {
        alert('새 분반 번호를 입력해주세요.');
        return;
      }

      const response = await APIService.copySection(
        parseInt(copyFormData.sourceSectionId),
        parseInt(copyFormData.sectionNumber),
        parseInt(copyFormData.year),
        copyFormData.semester
      );

      if (response.success) {
        alert('수업이 성공적으로 복사되었습니다!');
        setShowCopyModal(false);
        setCopyFormData({
          sourceSectionId: '',
          sectionNumber: '',
          year: new Date().getFullYear(),
          semester: 'SPRING'
        });
        
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
      default: return '1학기';
    }
  };

  // 년도 필터링
  const years = ['ALL', ...new Set(sections.map(s => s.year).filter(Boolean))].sort((a, b) => {
    if (a === 'ALL') return -1;
    if (b === 'ALL') return 1;
    return b - a;
  });

  // 학기 필터링 (1학기, 여름학기, 2학기, 겨울학기)
  const semesters = [
    { value: 'ALL', label: '전체' },
    { value: 'SPRING', label: '1학기' },
    { value: 'SUMMER', label: '여름학기' },
    { value: 'FALL', label: '2학기' },
    { value: 'WINTER', label: '겨울학기' }
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
          <div className="loading-spinner"></div>
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
        <div className="filter-section">
          <div className="filter-left">
            <div className="filter-group">
              <label className="filter-label">년도</label>
              <select 
                className="filter-select"
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
            <div className="filter-group">
              <label className="filter-label">학기</label>
              <select 
                className="filter-select"
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
            <div className="filter-stats">
              <span className="filter-count">총 {filteredSections.length}개 수업</span>
            </div>
          </div>
          <div className="filter-right">
            <button 
              className="btn-copy-section"
              onClick={() => setShowCopyModal(true)}
            >
              수업 가져오기
            </button>
            <button 
              className="btn-create-section"
              onClick={() => setShowCreateModal(true)}
            >
              새 수업 만들기
            </button>
          </div>
        </div>

        <div className="sections-grid">
          {filteredSections.map((section) => (
            <div 
              key={section.sectionId} 
              className={`section-card clickable ${section.active === false ? 'disabled' : ''}`}
              onClick={() => handleSectionClick(section)}
            >
              <div className="section-header">
                <div className="section-title-area">
                  <div className="title-and-badge">
                    <h3 className="section-title">{section.courseTitle}</h3>
                    <span className="section-badge">{section.sectionNumber}분반</span>
                  </div>
                  <span className="year-badge">
                    {section.year || '2024'}년 {getSemesterLabel(section.semester)}
                  </span>
                </div>
              </div>

              <div className="section-info-grid">
                <div className="info-row">
                  <span className="info-label">담당교수</span>
                  <span className="info-value">{section.instructorName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">수강인원</span>
                  <span className="info-value">{section.studentCount || 0}명</span>
                </div>
                <div className="info-row">
                  <span className="info-label">과제</span>
                  <span className="info-value">{section.assignmentCount || 0}개</span>
                </div>
                <div className="info-row">
                  <span className="info-label">공지사항</span>
                  <span className="info-value">{section.noticeCount || 0}개</span>
                </div>
              </div>

              <div className="section-footer">
                <button 
                  className={`btn-toggle-active ${section.active !== false ? 'active' : 'inactive'}`}
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
            <div className="no-sections">
              <div className="no-sections-message">
                <p>해당 조건에 맞는 수업이 없습니다.</p>
              </div>
            </div>
          )}
          {sections.length === 0 && (
            <div className="no-sections">
              <div className="no-sections-message">
                <p>담당하고 있는 분반이 없습니다.</p>
              </div>
            </div>
          )}
        </div>

        {/* 수업 생성 모달 */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>새 수업 만들기</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>강의 제목</label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({...formData, courseTitle: e.target.value})}
                    className="form-input"
                    placeholder="예: 자료구조"
                  />
                </div>

                <div className="form-group">
                  <label>분반 번호</label>
                  <input
                    type="number"
                    value={formData.sectionNumber}
                    onChange={(e) => setFormData({...formData, sectionNumber: e.target.value})}
                    className="form-input"
                    placeholder="예: 1"
                    min="1"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>년도</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="form-group">
                    <label>학기</label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      className="form-select"
                    >
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button 
                  className="btn-submit"
                  onClick={handleCreateSection}
                  disabled={!formData.courseTitle || !formData.sectionNumber}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 수업 가져오기 모달 */}
        {showCopyModal && (
          <div className="modal-overlay" onClick={() => setShowCopyModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>수업 가져오기</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCopyModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>복사할 수업 선택</label>
                  <select
                    value={copyFormData.sourceSectionId}
                    onChange={(e) => setCopyFormData({...copyFormData, sourceSectionId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">수업을 선택하세요</option>
                    {sections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.courseTitle} - {section.sectionNumber}분반 ({section.year || '2024'}년 {getSemesterLabel(section.semester)})
                      </option>
                    ))}
                  </select>
                  <p className="form-hint">기존 수업의 과제, 문제, 공지사항이 모두 복사됩니다.</p>
                </div>

                <div className="form-group">
                  <label>새 분반 번호</label>
                  <input
                    type="number"
                    value={copyFormData.sectionNumber}
                    onChange={(e) => setCopyFormData({...copyFormData, sectionNumber: e.target.value})}
                    className="form-input"
                    placeholder="예: 2"
                    min="1"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>년도</label>
                    <input
                      type="number"
                      value={copyFormData.year}
                      onChange={(e) => setCopyFormData({...copyFormData, year: e.target.value})}
                      className="form-input"
                      placeholder="2025"
                      min="2020"
                      max="2099"
                    />
                  </div>

                  <div className="form-group">
                    <label>학기</label>
                    <select
                      value={copyFormData.semester}
                      onChange={(e) => setCopyFormData({...copyFormData, semester: e.target.value})}
                      className="form-select"
                    >
                      <option value="SPRING">1학기</option>
                      <option value="SUMMER">여름학기</option>
                      <option value="FALL">2학기</option>
                      <option value="WINTER">겨울학기</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowCopyModal(false)}
                >
                  취소
                </button>
                <button 
                  className="btn-submit"
                  onClick={handleCopySection}
                  disabled={!copyFormData.sourceSectionId || !copyFormData.sectionNumber}
                >
                  가져오기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;