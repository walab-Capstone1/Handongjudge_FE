import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import "./GradeManagement.css";

const GradeManagement = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 학생 목록 조회
      const studentsResponse = await APIService.getInstructorStudents();
      const studentsData = studentsResponse?.data || [];
      
      // 분반 정보 조회
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || [];
      
      // 현재 분반 정보 설정
      if (sectionId) {
        const currentSectionData = sectionsData.find(section => 
          section.sectionId === parseInt(sectionId)
        );
        setCurrentSection(currentSectionData);
        
        // 해당 분반의 과제 목록 조회
        try {
          const assignmentsResponse = await APIService.getAssignmentsBySection(sectionId);
          const assignmentsData = assignmentsResponse?.data || assignmentsResponse || [];
          setAssignments(assignmentsData);
        } catch (error) {
          console.error('과제 목록 조회 실패:', error);
          setAssignments([]);
        }
      }
      
      setStudents(studentsData);
      setSections(sectionsData);
      setLoading(false);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      setStudents([]);
      setSections([]);
      setAssignments([]);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = filterSection === 'ALL' || 
                          (sectionId && student.sectionId === parseInt(sectionId));
    return matchesSearch && matchesSection;
  });

  // 고유한 섹션 목록 추출
  const uniqueSections = [...new Set(students.map(student => student.sectionName))].filter(Boolean);

  if (loading) {
    return (
      <TutorLayout selectedSection={currentSection}>
        <div className="grade-management">
          <div className="grade-loading-container">
            <div className="grade-loading-spinner"></div>
            <p>성적 데이터를 불러오는 중...</p>
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
      
      <div className="grade-management">
        {/* 헤더 섹션 */}
        {!sectionId && (
          <div className="grade-management-header">
            <div className="grade-header-left">
              <h1 className="grade-page-title">성적 관리</h1>
              <div className="grade-search-box">
                <input
                  type="text"
                  placeholder="이름, 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="grade-search-input"
                />
              </div>
            </div>
            <div className="grade-header-right">
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="grade-section-filter"
              >
                <option value="ALL">모든 수업</option>
                {uniqueSections.map((section, index) => (
                  <option key={index} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 성적 테이블 */}
        <div className="grade-table-container">
          {sectionId && assignments.length > 0 ? (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  {assignments.map(assignment => (
                    <th key={assignment.id || assignment.assignmentId}>
                      {assignment.title}
                    </th>
                  ))}
                  <th>총점</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  // 학생의 과제별 점수 계산 (실제 API 연동 필요)
                  const assignmentScores = assignments.map(assignment => {
                    // TODO: 실제 API로 학생의 과제 점수 조회
                    return 0; // 임시값
                  });
                  const totalScore = assignmentScores.reduce((sum, score) => sum + score, 0);
                  
                  return (
                    <tr key={student.userId}>
                      <td className="grade-student-name">
                        <div className="grade-student-avatar">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </td>
                      <td>{student.email}</td>
                      {assignmentScores.map((score, index) => (
                        <td key={index} className="grade-score-cell">
                          {score > 0 ? score : '-'}
                        </td>
                      ))}
                      <td className="grade-total-cell">
                        <strong>{totalScore}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="grade-no-data">
              <p>
                {sectionId 
                  ? '등록된 과제가 없습니다.' 
                  : filteredStudents.length === 0
                  ? '검색 조건에 맞는 학생이 없습니다.'
                  : '수업을 선택하여 성적을 확인하세요.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
};

export default GradeManagement;

