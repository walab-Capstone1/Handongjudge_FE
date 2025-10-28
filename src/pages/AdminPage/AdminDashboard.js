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
  const [formData, setFormData] = useState({
    courseTitle: '',
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
    // 수업 카드를 클릭하면 해당 수업의 과제 관리 페이지로 이동
    navigate(`/admin/assignments/section/${section.sectionId}`, { state: { section } });
  };

  const handleCreateSection = async () => {
    try {
      const response = await APIService.createSectionWithCourse({
        courseTitle: formData.courseTitle,
        instructorId: await APIService.getCurrentUserId(),
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
              className="btn-create-section"
              onClick={() => setShowCreateModal(true)}
            >
              + 새 수업 만들기
            </button>
          </div>
        </div>

        <div className="sections-grid">
          {filteredSections.map((section) => (
            <div 
              key={section.sectionId} 
              className="section-card clickable"
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
                <span className="section-hint">클릭하여 관리하기</span>
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
                <span className="no-sections-icon">📚</span>
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;