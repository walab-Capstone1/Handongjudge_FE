import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../recoil/atoms";
import CourseSidebar from "../components/CourseSidebar";
import CourseHeader from "../components/CourseHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import APIService from "../services/APIService";
import "./CourseAssignmentsPage.css";

const CourseAssignmentsPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [activeMenu, setActiveMenu] = useState("과제");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 데이터 상태
  const [sectionInfo, setSectionInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [expandedAssignmentIds, setExpandedAssignmentIds] = useState([]);

  useEffect(() => {
    if (sectionId && auth.user) {
      fetchAssignmentsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId, auth.user]);

  const fetchAssignmentsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 섹션 정보 조회
      const sectionResponse = await APIService.getSectionInfo(sectionId);
      const sectionData = sectionResponse.data || sectionResponse;
      console.log('섹션 정보:', sectionData);
      setSectionInfo(sectionData);

      // 과제 목록 조회
      const assignmentsResponse = await APIService.getAssignmentsBySection(sectionId);
      const assignmentsList = assignmentsResponse.data || assignmentsResponse;

      // 각 과제에 대한 진도율과 문제 정보 계산
      const assignmentsWithProgress = await Promise.all(
        assignmentsList.map(async (assignment) => {
          try {
            const problemsResponse = await APIService.getAssignmentProblems(sectionId, assignment.id);
            const problemsList = problemsResponse.data || problemsResponse;

            let problemsStatus = [];
            try {
              const statusResponse = await APIService.getStudentAssignmentProblemsStatus(
                auth.user.id,
                sectionId,
                assignment.id
              );
              problemsStatus = statusResponse.data || statusResponse;
            } catch (statusErr) {
              console.warn(`과제 ${assignment.id} 상태 조회 실패:`, statusErr);
            }

            // 문제 목록과 상태 결합
            const problems = problemsList.map(problem => {
              const status = problemsStatus.find(s => s.problemId === problem.id);
              const isSubmitted = status && (status.status === 'SUBMITTED' || status.status === 'COMPLETED');
              return {
                id: problem.id,
                title: problem.title,
                description: problem.description,
                submitted: isSubmitted,
                status: status ? status.status : 'NOT_SUBMITTED'
              };
            });

            const totalProblems = problems.length;
            const submittedProblems = problems.filter(p => p.submitted).length;
            const progress = totalProblems > 0 ? Math.round((submittedProblems / totalProblems) * 100) : 0;
            const dDay = calculateDDay(assignment.endDate);

            return {
              ...assignment,
              progress,
              dDay,
              totalProblems,
              submittedProblems,
              problems
            };
          } catch (err) {
            console.error(`과제 ${assignment.id} 정보 조회 실패:`, err);
            return {
              ...assignment,
              progress: 0,
              dDay: calculateDDay(assignment.endDate),
              totalProblems: 0,
              submittedProblems: 0,
              problems: []
            };
          }
        })
      );

      setAssignments(assignmentsWithProgress);

    } catch (err) {
      console.error("과제 데이터 조회 실패:", err);
      setError(err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAssignment = (assignmentId) => {
    if (expandedAssignmentIds.includes(assignmentId)) {
      setExpandedAssignmentIds(expandedAssignmentIds.filter(id => id !== assignmentId));
    } else {
      setExpandedAssignmentIds([...expandedAssignmentIds, assignmentId]);
    }
  };

  const calculateDDay = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const handleMenuClick = (menuId) => {
    switch (menuId) {
      case "dashboard":
        navigate(`/sections/${sectionId}/dashboard`);
        break;
      case "assignment":
        // 현재 페이지
        break;
      case "notice":
        navigate(`/sections/${sectionId}?tab=notices`);
        break;
      case "notification":
        // 알림 페이지로 이동
        break;
      default:
        break;
    }
  };

  const handleProblemClick = (assignmentId, problemId) => {
    navigate(`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problemId}`);
  };

  if (loading) {
    return (
      <div className="course-assignments-container">
        <CourseSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        <div className="course-assignments-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-assignments-container">
        <CourseSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
        <div className="course-assignments-content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchAssignmentsData}>다시 시도</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-assignments-container">
      <CourseSidebar activeMenu={activeMenu} onMenuClick={handleMenuClick} />
      
      <div className="course-assignments-content">
        <CourseHeader
          courseName={
            sectionInfo?.courseTitle 
              ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber || ''}분반`
              : sectionInfo?.courseName || "강의"
          }
        />

        <div className="assignments-body">
          <div className="assignments-header">
            <h2 className="assignments-title">과제</h2>
            <span className="assignments-summary">
              과제 {assignments.length} · 문제 {assignments.reduce((sum, a) => sum + a.totalProblems, 0)}
            </span>
          </div>

          <div className="assignments-accordion">
            {assignments.length > 0 ? (
              assignments.map((assignment, index) => (
                <div key={assignment.id} className="accordion-item">
                  <div 
                    className={`accordion-header ${expandedAssignmentIds.includes(assignment.id) ? 'expanded' : ''}`}
                    onClick={() => toggleAssignment(assignment.id)}
                  >
                    <div className="accordion-header-left">
                      <span className="accordion-arrow">{expandedAssignmentIds.includes(assignment.id) ? '▼' : '▶'}</span>
                      <span className="accordion-number">{String(index + 1).padStart(2, '0')}</span>
                      <h3 className="accordion-title">{assignment.title}</h3>
                      {assignment.dDay !== null && (
                        <span className={`accordion-dday ${assignment.dDay < 0 ? 'expired' : ''}`}>
                          {assignment.dDay < 0 ? `D+${Math.abs(assignment.dDay)}` : `D-${assignment.dDay}`}
                        </span>
                      )}
                    </div>
                    <div className="accordion-header-right">
                      <span className="accordion-deadline">
                        [마감일 | {formatDate(assignment.endDate)} 23:59 까지 제출]
                      </span>
                      <div className="progress-info">
                        <div className="mini-progress-bar">
                          <div 
                            className="mini-progress-fill"
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                        <span className="accordion-progress">{assignment.submittedProblems}/{assignment.totalProblems}</span>
                      </div>
                    </div>
                  </div>

                  {expandedAssignmentIds.includes(assignment.id) && (
                    <div className="accordion-content">
                      <div className="accordion-description">
                        <p>{assignment.description || `${assignment.title}을 시작합니다.`}</p>
                      </div>

                      <div className="accordion-problems-section">
                        <h4 className="problems-subtitle">문제</h4>
                        {assignment.problems && assignment.problems.length > 0 ? (
                          <div className="accordion-problems-list">
                            {assignment.problems.map((problem, pIndex) => (
                              <div
                                key={problem.id}
                                className="accordion-problem-item"
                                onClick={() => handleProblemClick(assignment.id, problem.id)}
                              >
                                <span className="problem-title">{problem.title}</span>
                                <span className={`problem-badge ${problem.submitted ? 'submitted' : 'not-submitted'}`}>
                                  {problem.submitted ? '제출' : '미제출'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-problems-message">
                            <p>등록된 문제가 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-assignments-message">
                <p>등록된 과제가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAssignmentsPage;

