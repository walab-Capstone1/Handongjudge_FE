import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import "./CourseManagement.css";

const CourseManagement = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    sectionNumber: '',
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
      const response = await APIService.createSection({
        courseId: parseInt(formData.courseId),
        instructorId: await APIService.getCurrentUserId(), // 현재 로그인한 사용자 ID
        sectionNumber: parseInt(formData.sectionNumber),
        year: parseInt(formData.year),
        semester: formData.semester
      });

      alert('수업이 성공적으로 생성되었습니다!');
      setShowCreateModal(false);
      setFormData({
        courseId: '',
        sectionNumber: '',
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

  const filteredSections = sections.filter(section =>
    section.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="course-management">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>수업 정보를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="course-management">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">수업 관리</h1>
            <div className="search-box">
              <input
                type="text"
                placeholder="수업명, 교수명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="header-right">
            <button 
              className="btn-create-section"
              onClick={() => setShowCreateModal(true)}
            >
              + 새 수업 만들기
            </button>
            <div className="header-stats">
              <span className="stat-badge">총 {sections.length}개 분반</span>
            </div>
          </div>
        </div>

        <div className="sections-grid">
          {filteredSections.map((section) => (
            <div key={section.sectionId} className="section-card">
              <div className="section-header">
                <h3 className="section-title">{section.courseTitle}</h3>
                <span className="section-badge">{section.sectionNumber}분반</span>
              </div>

              <div className="section-info-grid">
                <div className="info-row">
                  <span className="info-label">담당교수</span>
                  <span className="info-value">{section.instructorName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">공지 수</span>
                  <span className="info-value">{section.noticeCount || 0}개</span>
                </div>
                <div className="info-row">
                  <span className="info-label">학생 관리</span>
                  <span className="info-value">{section.studentCount || 0}명</span>
                </div>
                <div className="info-row">
                  <span className="info-label">상태</span>
                  <span className={`info-value ${section.active !== false ? 'status-active' : 'status-inactive'}`}>
                    {section.active !== false ? '활성' : '비활성'}
                  </span>
                </div>
              </div>

              <div className="section-actions">
                <button 
                  className={`btn-toggle-active ${section.active !== false ? 'active' : 'inactive'}`}
                  onClick={() => handleToggleActive(section.sectionId, section.active !== false)}
                  title={section.active !== false ? '비활성화하기' : '활성화하기'}
                >
                  {section.active !== false ? '✓ 활성' : '✕ 비활성'}
                </button>
                <button 
                  className="btn-action"
                  onClick={() => navigate(`/admin/notices/section/${section.sectionId}`)}
                >
                  공지사항
                </button>
                <button 
                  className="btn-action"
                  onClick={() => navigate(`/admin/users/section/${section.sectionId}`)}
                >
                  학생 관리
                </button>
                <button 
                  className="btn-action"
                  onClick={() => navigate(`/admin/grades/section/${section.sectionId}`)}
                >
                  성적 관리
                </button>
                <button 
                  className="btn-action primary"
                  onClick={() => navigate(`/admin/assignments/section/${section.sectionId}`)}
                >
                  과제 관리
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSections.length === 0 && (
          <div className="no-sections">
            <p>
              {searchTerm 
                ? '검색 조건에 맞는 수업이 없습니다.' 
                : '담당하고 있는 수업이 없습니다.'
              }
            </p>
          </div>
        )}

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
                  <label>강의 선택</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">강의를 선택하세요</option>
                    {availableCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
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
                  disabled={!formData.courseId || !formData.sectionNumber}
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

export default CourseManagement;