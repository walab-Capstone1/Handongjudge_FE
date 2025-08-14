import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import "./UserManagement.css";

const UserManagement = () => {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  // 모달 관련 상태 제거됨
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');

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
    try {
      // TODO: 실제 상태 변경 API 호출
      console.log('학생 상태 변경:', studentId, newStatus);
      await fetchStudents();
    } catch (error) {
      console.error('학생 상태 변경 실패:', error);
    }
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
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>학생 데이터를 불러오는 중...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="user-management">
        <div className="page-header">
          <h1 className="page-title">학생 관리</h1>
          <div className="header-stats">
            <span className="stat-badge">총 {students.length}명</span>
            <span className="stat-badge active">활성 {students.filter(s => s.status !== 'INACTIVE').length}명</span>
          </div>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="이름, 이메일, 팀ID로 검색..."
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

        <div className="users-table-container">
          <table className="users-table">
            <thead>
                                  <tr>
                      <th>이름</th>
                      <th>이메일</th>
                      <th>팀ID</th>
                      <th>분반</th>
                      <th>과목</th>
                      <th>등록일</th>
                      <th>최근 로그인</th>
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
                  <td>{student.teamId || '-'}</td>
                  <td>
                    <span className="section-badge">
                      {student.sectionNumber || student.sectionId}분반
                    </span>
                  </td>
                  <td>{student.courseTitle}</td>
                  <td className="enrolled-date">
                    {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="last-login">
                    {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon-small view"
                        onClick={() => console.log('학생 상세 보기:', student.userId)}
                        title="상세 보기"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn-icon-small message"
                        onClick={() => console.log('메시지 보내기:', student.userId)}
                        title="메시지"
                      >
                        💬
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
                              {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="8" className="no-data">
                      <div className="no-data-message">
                        <span className="no-data-icon">👨‍🎓</span>
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

      </div>
    </AdminLayout>
  );
};

export default UserManagement;
