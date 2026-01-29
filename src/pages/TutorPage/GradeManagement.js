import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import SectionNavigation from "../../components/SectionNavigation";
import APIService from "../../services/APIService";
import { FaFileExport, FaChartBar, FaEdit, FaCode, FaClock, FaCheckCircle, FaTimesCircle, FaDownload } from "react-icons/fa";
import "./GradeManagement.css";

const GradeManagement = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  // 상태 관리
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGrade, setEditingGrade] = useState(null); // { userId, problemId }
  const [gradeInputs, setGradeInputs] = useState({}); // { `${userId}-${problemId}`: score }
  const [comments, setComments] = useState({}); // { `${userId}-${problemId}`: comment }
  const [viewMode, setViewMode] = useState('course'); // 'assignment' | 'course'
  const [courseGrades, setCourseGrades] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);
  
  // 모달 상태
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  useEffect(() => {
    if (selectedAssignment && sectionId) {
      fetchGrades();
    }
  }, [selectedAssignment, sectionId]);

  useEffect(() => {
    if (viewMode === 'course' && sectionId && assignments.length > 0) {
      fetchCourseGrades();
    }
  }, [viewMode, sectionId, assignments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 분반 정보 조회
      const dashboardResponse = await APIService.getInstructorDashboard();
      const sectionsData = dashboardResponse?.data || dashboardResponse || [];
      setSections(sectionsData);
      
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
          
          // 첫 번째 과제를 기본 선택
          if (assignmentsData.length > 0 && !selectedAssignment) {
            setSelectedAssignment(assignmentsData[0]);
          }
        } catch (error) {
          console.error('과제 목록 조회 실패:', error);
          setAssignments([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
      setSections([]);
      setAssignments([]);
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedAssignment || !sectionId) return;
    
    try {
      setLoading(true);
      const response = await APIService.getAssignmentGrades(sectionId, selectedAssignment.id);
      const gradesData = response?.data || response || [];
      setGrades(gradesData);
      
      // 기존 점수와 코멘트를 입력 상태로 초기화
      const initialInputs = {};
      const initialComments = {};
      gradesData.forEach(student => {
        student.problemGrades?.forEach(problem => {
          const key = `${student.userId}-${problem.problemId}`;
          if (problem.score !== null && problem.score !== undefined) {
            initialInputs[key] = problem.score;
          }
          // 코멘트는 백엔드에서 제공하지 않을 수 있으므로 나중에 추가
        });
      });
      setGradeInputs(initialInputs);
      setComments(initialComments);
      
      setLoading(false);
    } catch (error) {
      console.error('성적 조회 실패:', error);
      setGrades([]);
      setLoading(false);
    }
  };

  const fetchCourseGrades = async () => {
    if (!sectionId || !assignments.length) return;

    try {
      setCourseLoading(true);

      const gradeResults = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            const response = await APIService.getAssignmentGrades(sectionId, assignment.id);
            const gradesData = response?.data || response || [];
            return { assignment, grades: gradesData };
          } catch (error) {
            console.error('수업 전체 성적 조회 중 과제별 조회 실패:', assignment.id, error);
            return { assignment, grades: [] };
          }
        })
      );

      const studentMap = new Map();
      const courseAssignments = [];

      gradeResults.forEach(({ assignment, grades: assignmentGrades }) => {
        if (!assignmentGrades.length || !assignmentGrades[0]?.problemGrades) {
          return;
        }

        const problems = assignmentGrades[0].problemGrades.map((problem) => ({
          problemId: problem.problemId,
          problemTitle: problem.problemTitle,
          points: problem.points,
        }));

        const totalPoints =
          assignmentGrades[0].totalPoints ||
          problems.reduce((sum, p) => sum + (p.points || 0), 0);

        courseAssignments.push({
          assignmentId: assignment.id,
          title: assignment.title,
          problems,
          totalPoints,
        });

        assignmentGrades.forEach((student) => {
          if (!studentMap.has(student.userId)) {
            studentMap.set(student.userId, {
              userId: student.userId,
              studentName: student.studentName,
              studentId: student.studentId,
              assignments: {},
            });
          }

          const studentEntry = studentMap.get(student.userId);
          const problemsMap = {};

          student.problemGrades?.forEach((pg) => {
            problemsMap[pg.problemId] = pg;
          });

          const totalScore = student.totalScore || 0;
          const assignmentTotalPoints = student.totalPoints || totalPoints || 0;
          const ratio =
            assignmentTotalPoints > 0
              ? ((totalScore / assignmentTotalPoints) * 100).toFixed(1)
              : '0.0';

          studentEntry.assignments[assignment.id] = {
            totalScore,
            totalPoints: assignmentTotalPoints,
            ratio,
            problems: problemsMap,
          };
        });
      });

      setCourseGrades({
        assignments: courseAssignments,
        students: Array.from(studentMap.values()),
      });
    } catch (error) {
      console.error('수업 전체 성적 조회 실패:', error);
      setCourseGrades(null);
    } finally {
      setCourseLoading(false);
    }
  };

  const handleSaveGrade = async (userId, problemId, score, comment) => {
    if (!selectedAssignment || !sectionId) return;
    
    try {
      const gradeData = {
        userId: userId,
        problemId: problemId,
        score: score !== null && score !== '' ? parseInt(score) : null,
        comment: comment || null
      };
      
      await APIService.saveGrade(sectionId, selectedAssignment.id, gradeData);
      
      // 성적 목록 새로고침
      await fetchGrades();
      
      // 편집 상태 해제
      setEditingGrade(null);
      
      alert('성적이 저장되었습니다.');
    } catch (error) {
      console.error('성적 저장 실패:', error);
      alert(error.message || '성적 저장에 실패했습니다.');
    }
  };

  const handleViewCode = async (userId, problemId) => {
    if (!selectedAssignment || !sectionId) return;
    
    try {
      const codeResponse = await APIService.getStudentAcceptedCode(
        sectionId,
        selectedAssignment.id,
        userId,
        problemId
      );
      setSelectedCode(codeResponse);
      setShowCodeModal(true);
    } catch (error) {
      console.error('코드 조회 실패:', error);
      alert('코드를 불러올 수 없습니다.');
    }
  };

  // CSV 내보내기
  const handleExportCSV = () => {
    if (!selectedAssignment || grades.length === 0) {
      alert('내보낼 성적 데이터가 없습니다.');
      return;
    }

    // CSV 헤더 생성
    const headers = ['학생명', '학번'];
    if (grades[0]?.problemGrades) {
      grades[0].problemGrades.forEach(problem => {
        headers.push(`${problem.problemTitle} (${problem.points}점)`);
      });
    }
    headers.push('총점', '비율(%)');

    // CSV 데이터 생성
    const rows = [headers.join(',')];
    
    filteredGrades.forEach(student => {
      const row = [
        `"${student.studentName || ''}"`,
        `"${student.studentId || ''}"`
      ];
      
      student.problemGrades?.forEach(problem => {
        const score = problem.score !== null && problem.score !== undefined 
          ? problem.score 
          : '';
        row.push(score);
      });
      
      const totalScore = student.totalScore || 0;
      const totalPoints = student.totalPoints || 0;
      const ratio = totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
      
      row.push(totalScore, ratio);
      rows.push(row.join(','));
    });

    // CSV 파일 생성 및 다운로드
    const csvContent = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedAssignment.title}_성적_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 일괄 점수 입력
  const [bulkInputs, setBulkInputs] = useState({}); // { problemId: score }
  const [bulkSaving, setBulkSaving] = useState(false);

  const handleBulkSave = async () => {
    if (!selectedAssignment || !sectionId || Object.keys(bulkInputs).length === 0) {
      alert('입력할 점수가 없습니다.');
      return;
    }

    try {
      setBulkSaving(true);
      
      // 일괄 입력 데이터 구성
      const bulkData = {
        grades: []
      };

      // 각 학생별로 각 문제에 대해 점수 입력
      filteredGrades.forEach(student => {
        student.problemGrades?.forEach(problem => {
          const problemId = problem.problemId;
          if (bulkInputs[problemId] !== undefined && bulkInputs[problemId] !== '') {
            bulkData.grades.push({
              userId: student.userId,
              problemId: problemId,
              score: parseInt(bulkInputs[problemId])
            });
          }
        });
      });

      if (bulkData.grades.length === 0) {
        alert('입력할 점수가 없습니다.');
        setBulkSaving(false);
        return;
      }

      await APIService.saveBulkGrades(sectionId, selectedAssignment.id, bulkData);
      
      // 성적 목록 새로고침
      await fetchGrades();
      
      // 일괄 입력 모달 닫기 및 입력값 초기화
      setShowBulkModal(false);
      setBulkInputs({});
      
      alert(`${bulkData.grades.length}개의 성적이 저장되었습니다.`);
    } catch (error) {
      console.error('일괄 성적 저장 실패:', error);
      alert(error.message || '일괄 성적 저장에 실패했습니다.');
    } finally {
      setBulkSaving(false);
    }
  };

  // 통계 계산
  const stats = useMemo(() => {
    if (!grades.length || !grades[0]?.problemGrades) {
      return null;
    }

    const problemStats = grades[0].problemGrades.map(problem => {
      const scores = grades
        .map(student => {
          const pg = student.problemGrades?.find(p => p.problemId === problem.problemId);
          return pg?.score !== null && pg?.score !== undefined ? pg.score : null;
        })
        .filter(score => score !== null);
      
      const validScores = scores.filter(s => s !== null);
      const avg = validScores.length > 0 
        ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
        : 0;
      const max = validScores.length > 0 ? Math.max(...validScores) : 0;
      const min = validScores.length > 0 ? Math.min(...validScores) : 0;
      
      return {
        problemId: problem.problemId,
        problemTitle: problem.problemTitle,
        points: problem.points,
        avg: parseFloat(avg),
        max,
        min,
        submittedCount: grades.filter(student => {
          const pg = student.problemGrades?.find(p => p.problemId === problem.problemId);
          return pg?.submitted || false;
        }).length,
        totalCount: grades.length
      };
    });

    // 전체 통계
    const totalScores = grades.map(s => s.totalScore || 0);
    const totalPoints = grades[0]?.totalPoints || 0;
    const overallAvg = totalScores.length > 0 
      ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(1)
      : 0;
    const overallMax = totalScores.length > 0 ? Math.max(...totalScores) : 0;
    const overallMin = totalScores.length > 0 ? Math.min(...totalScores) : 0;

    return {
      problemStats,
      overall: {
        avg: parseFloat(overallAvg),
        max: overallMax,
        min: overallMin,
        totalPoints,
        totalStudents: grades.length
      }
    };
  }, [grades]);

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredCourseStudents = courseGrades
    ? courseGrades.students.filter((student) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          student.studentName?.toLowerCase().includes(lowerSearch) ||
          student.studentId?.toLowerCase().includes(lowerSearch)
        );
      })
    : [];

  if (loading && !grades.length) {
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
          title="성적 관리"
          showSearch={false}
        />
      )}
      
      <div className="grade-management">
        {/* 헤더 섹션 */}
        <div className="grade-page-header">
          <div className="grade-header-left">
            <div className="grade-search-box">
              <input
                type="text"
                className="tutor-search-input"
                placeholder="이름, 학번으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {sectionId && assignments.length > 0 && viewMode === 'assignment' && (
              <div className="grade-filter-group">
                <label className="grade-filter-label" htmlFor="grade-assignment-select">
                  과제 선택
                </label>
                <select
                  id="grade-assignment-select"
                  value={selectedAssignment?.id || ''}
                  onChange={(e) => {
                    const assignment = assignments.find(a => a.id === parseInt(e.target.value));
                    setSelectedAssignment(assignment);
                    setViewMode('assignment');
                  }}
                  className="grade-assignment-select"
                >
                  <option value="">전체 과제</option>
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grade-header-right">
            <div className="grade-view-mode-tabs">
              <button
                type="button"
                className={`grade-tab-button ${viewMode === 'assignment' ? 'active' : ''}`}
                onClick={() => setViewMode('assignment')}
              >
                과제별 보기
              </button>
              <button
                type="button"
                className={`grade-tab-button ${viewMode === 'course' ? 'active' : ''}`}
                onClick={() => setViewMode('course')}
              >
                수업 전체 보기
              </button>
            </div>
            {selectedAssignment && (
              <>
                <button
                  className="grade-btn-secondary"
                  onClick={() => setShowBulkModal(true)}
                >
                  <FaEdit /> 일괄 입력
                </button>
                <button
                  className="grade-btn-secondary"
                  onClick={() => setShowStatsModal(true)}
                >
                  <FaChartBar /> 통계
                </button>
                <button
                  className="grade-btn-primary"
                  onClick={handleExportCSV}
                >
                  <FaFileExport /> 내보내기
                </button>
              </>
            )}
          </div>
        </div>

        {/* 성적 테이블 */}
        {viewMode === 'course' ? (
          <div className="grade-table-container grade-course-table-container">
            {courseLoading ? (
              <div className="grade-loading-container">
                <div className="grade-loading-spinner"></div>
                <p>수업 전체 성적 데이터를 불러오는 중...</p>
              </div>
            ) : courseGrades && courseGrades.assignments.length > 0 && filteredCourseStudents.length > 0 ? (
              <table className="grade-table grade-course-table">
                <thead>
                  <tr>
                    <th rowSpan="2">학생</th>
                    <th rowSpan="2">학번</th>
                    {courseGrades.assignments.map((assignment) => (
                      <th
                        key={assignment.assignmentId}
                        className="grade-course-assignment-header"
                        colSpan={assignment.problems.length + 1}
                      >
                        {assignment.title}
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {courseGrades.assignments.map((assignment) => (
                      <React.Fragment key={`${assignment.assignmentId}-problems`}>
                        {assignment.problems.map((problem) => (
                          <th
                            key={`${assignment.assignmentId}-${problem.problemId}`}
                            className="grade-problem-header grade-course-problem-header"
                          >
                            <div className="grade-problem-title">{problem.problemTitle}</div>
                            <div className="grade-problem-points">({problem.points}점)</div>
                          </th>
                        ))}
                        <th
                          key={`${assignment.assignmentId}-total`}
                          className="grade-course-assignment-total-header"
                        >
                          총점
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourseStudents.map((student) => (
                    <tr key={student.userId}>
                      <td className="grade-student-name">{student.studentName}</td>
                      <td className="grade-student-id">{student.studentId}</td>
                      {courseGrades.assignments.map((assignment) => {
                        const assignmentData = student.assignments[assignment.assignmentId];
                        return (
                          <React.Fragment key={`${student.userId}-${assignment.assignmentId}`}>
                            {assignment.problems.map((problem) => {
                              const problemGrade =
                                assignmentData?.problems?.[problem.problemId];
                              const score =
                                problemGrade && problemGrade.score !== null && problemGrade.score !== undefined
                                  ? problemGrade.score
                                  : null;
                              return (
                                <td
                                  key={`${student.userId}-${assignment.assignmentId}-${problem.problemId}`}
                                  className="grade-problem-cell grade-course-problem-cell"
                                >
                                  {score !== null ? `${score} / ${problem.points}` : '-'}
                                </td>
                              );
                            })}
                            <td className="grade-total-cell grade-course-assignment-total-cell">
                              {assignmentData ? (
                                <strong>
                                  {assignmentData.totalScore} / {assignmentData.totalPoints}
                                </strong>
                              ) : (
                                '-'
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grade-no-data">
                <p>수업 전체 성적 데이터가 없습니다.</p>
              </div>
            )}
          </div>
        ) : selectedAssignment && grades.length > 0 ? (
          <div className="grade-table-container">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>학생</th>
                  <th>학번</th>
                  {grades[0]?.problemGrades?.map(problem => (
                    <th key={problem.problemId} className="grade-problem-header">
                      <div className="grade-problem-title">{problem.problemTitle}</div>
                      <div className="grade-problem-points">({problem.points}점)</div>
                    </th>
                  ))}
                  <th>총점</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((student) => {
                  const totalScore = student.totalScore || 0;
                  const totalPoints = student.totalPoints || 0;
                  const ratio = totalPoints > 0 ? ((totalScore / totalPoints) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={student.userId}>
                      <td className="grade-student-name">{student.studentName}</td>
                      <td className="grade-student-id">{student.studentId}</td>
                      {student.problemGrades?.map((problem) => {
                        const key = `${student.userId}-${problem.problemId}`;
                        const isEditing = editingGrade?.userId === student.userId && 
                                         editingGrade?.problemId === problem.problemId;
                        const currentScore = gradeInputs[key] !== undefined 
                          ? gradeInputs[key] 
                          : (problem.score !== null && problem.score !== undefined ? problem.score : '');
                        const currentComment = comments[key] || '';
                        
                        return (
                          <td key={problem.problemId} className="grade-problem-cell">
                            {isEditing ? (
                              <div className="grade-edit-form">
                                <input
                                  type="number"
                                  min="0"
                                  max={problem.points}
                                  value={currentScore}
                                  onChange={(e) => {
                                    const value = e.target.value === '' ? '' : parseInt(e.target.value);
                                    setGradeInputs(prev => ({
                                      ...prev,
                                      [key]: value
                                    }));
                                  }}
                                  className="grade-score-input"
                                  placeholder="점수"
                                />
                                <div className="grade-edit-actions">
                                  <button
                                    className="grade-btn-save"
                                    onClick={() => handleSaveGrade(
                                      student.userId,
                                      problem.problemId,
                                      currentScore,
                                      currentComment
                                    )}
                                  >
                                    저장
                                  </button>
                                  <button
                                    className="grade-btn-cancel"
                                    onClick={() => {
                                      setEditingGrade(null);
                                      // 입력값 초기화
                                      setGradeInputs(prev => {
                                        const newInputs = { ...prev };
                                        delete newInputs[key];
                                        return newInputs;
                                      });
                                    }}
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grade-score-display">
                                <div className="grade-score-value">
                                  {problem.score !== null && problem.score !== undefined 
                                    ? `${problem.score} / ${problem.points}` 
                                    : '-'}
                                </div>
                                <div className="grade-score-actions">
                                  <button
                                    className="grade-btn-edit"
                                    onClick={() => {
                                      setEditingGrade({ userId: student.userId, problemId: problem.problemId });
                                      setGradeInputs(prev => ({
                                        ...prev,
                                        [key]: problem.score !== null && problem.score !== undefined 
                                          ? problem.score 
                                          : ''
                                      }));
                                    }}
                                    title="점수 입력/수정"
                                  >
                                    <FaEdit />
                                  </button>
                                  {problem.submitted && (
                                    <button
                                      className="grade-btn-code"
                                      onClick={() => handleViewCode(student.userId, problem.problemId)}
                                      title="코드 조회"
                                    >
                                      <FaCode />
                                    </button>
                                  )}
                                </div>
                                {problem.submitted && (
                                  <div className="grade-submission-info">
                                    <span className={`grade-submission-status ${problem.isOnTime ? 'on-time' : 'late'}`}>
                                      {problem.isOnTime ? (
                                        <>
                                          <FaCheckCircle /> 제시간
                                        </>
                                      ) : (
                                        <>
                                          <FaTimesCircle /> 지연
                                        </>
                                      )}
                                    </span>
                                    {problem.submittedAt && (
                                      <span className="grade-submission-time">
                                        <FaClock /> {new Date(problem.submittedAt).toLocaleString('ko-KR')}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="grade-total-cell">
                        <strong>{totalScore} / {totalPoints}</strong>
                      </td>
                      <td className="grade-ratio-cell">
                        <strong>{ratio}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : selectedAssignment ? (
          <div className="grade-no-data">
            <p>등록된 성적이 없습니다.</p>
          </div>
        ) : (
          <div className="grade-no-data">
            <p>과제를 선택하여 성적을 확인하세요.</p>
          </div>
        )}

        {/* 코드 조회 모달 */}
        {showCodeModal && selectedCode && (
          <div className="grade-modal-overlay" onClick={() => setShowCodeModal(false)}>
            <div className="grade-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>제출 코드</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => setShowCodeModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                <pre className="grade-code-display">
                  <code>{selectedCode.code || selectedCode.codeString || '코드를 불러올 수 없습니다.'}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 일괄 입력 모달 */}
        {showBulkModal && selectedAssignment && grades.length > 0 && (
          <div className="grade-modal-overlay" onClick={() => {
            setShowBulkModal(false);
            setBulkInputs({});
          }}>
            <div className="grade-modal-content grade-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>일괄 점수 입력</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkInputs({});
                  }}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                <div className="grade-bulk-info">
                  <p>문제별로 모든 학생에게 동일한 점수를 일괄 입력할 수 있습니다.</p>
                </div>
                <div className="grade-bulk-inputs">
                  {grades[0]?.problemGrades?.map(problem => (
                    <div key={problem.problemId} className="grade-bulk-input-row">
                      <label className="grade-bulk-label">
                        {problem.problemTitle} (배점: {problem.points}점)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={problem.points}
                        value={bulkInputs[problem.problemId] || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? '' : parseInt(e.target.value);
                          setBulkInputs(prev => ({
                            ...prev,
                            [problem.problemId]: value
                          }));
                        }}
                        className="grade-bulk-input"
                        placeholder="점수 입력"
                      />
                    </div>
                  ))}
                </div>
                <div className="grade-modal-actions">
                  <button
                    className="grade-btn-cancel"
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkInputs({});
                    }}
                  >
                    취소
                  </button>
                  <button
                    className="grade-btn-submit"
                    onClick={handleBulkSave}
                    disabled={bulkSaving || Object.keys(bulkInputs).length === 0}
                  >
                    {bulkSaving ? '저장 중...' : '일괄 저장'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통계 모달 */}
        {showStatsModal && stats && (
          <div className="grade-modal-overlay" onClick={() => setShowStatsModal(false)}>
            <div className="grade-modal-content grade-modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="grade-modal-header">
                <h2>성적 통계</h2>
                <button
                  className="grade-modal-close"
                  onClick={() => setShowStatsModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="grade-modal-body">
                {/* 전체 통계 */}
                <div className="grade-stats-section">
                  <h3 className="grade-stats-title">전체 통계</h3>
                  <div className="grade-stats-grid">
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">평균 점수</div>
                      <div className="grade-stat-value">{stats.overall.avg} / {stats.overall.totalPoints}</div>
                    </div>
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">최고 점수</div>
                      <div className="grade-stat-value">{stats.overall.max} / {stats.overall.totalPoints}</div>
                    </div>
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">최저 점수</div>
                      <div className="grade-stat-value">{stats.overall.min} / {stats.overall.totalPoints}</div>
                    </div>
                    <div className="grade-stat-card">
                      <div className="grade-stat-label">학생 수</div>
                      <div className="grade-stat-value">{stats.overall.totalStudents}명</div>
                    </div>
                  </div>
                </div>

                {/* 문제별 통계 */}
                <div className="grade-stats-section">
                  <h3 className="grade-stats-title">문제별 통계</h3>
                  <div className="grade-problem-stats-table">
                    <table className="grade-stats-table">
                      <thead>
                        <tr>
                          <th>문제</th>
                          <th>배점</th>
                          <th>평균</th>
                          <th>최고</th>
                          <th>최저</th>
                          <th>제출률</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.problemStats.map(stat => {
                          const submissionRate = stat.totalCount > 0 
                            ? ((stat.submittedCount / stat.totalCount) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={stat.problemId}>
                              <td className="grade-stat-problem-title">{stat.problemTitle}</td>
                              <td>{stat.points}점</td>
                              <td>{stat.avg.toFixed(1)}</td>
                              <td>{stat.max}</td>
                              <td>{stat.min}</td>
                              <td>
                                <div className="grade-submission-rate">
                                  <span>{submissionRate}%</span>
                                  <div className="grade-progress-bar">
                                    <div 
                                      className="grade-progress-fill"
                                      style={{ width: `${submissionRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default GradeManagement;
