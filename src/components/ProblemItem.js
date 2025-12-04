import React from "react";
import { Link, useLocation } from "react-router-dom";
import { removeCopyLabel } from "../utils/problemUtils";
import "./ProblemItem.css";

const ProblemItem = ({ problem, assignmentId, submissionStats, userSubmissionStatus }) => {
  const location = useLocation();

  // URL에서 sectionId 추출
  const urlParts = location.pathname.split('/');
  const sectionIndex = urlParts.indexOf('sections');
  const sectionId = sectionIndex !== -1 ? urlParts[sectionIndex + 1] : null;

  // 이 문제의 제출 현황 계산 (정답을 맞춘 학생 수 기준)
  const getSubmissionStatus = () => {
    if (!submissionStats || !submissionStats.problemStats) {
      return "0명 완료";
    }
    
    const problemStat = submissionStats.problemStats.find(
      stat => stat.problemId === problem.id
    );
    
    if (problemStat) {
      // 정답을 맞춘 학생 수를 표시 (AssignmentStudentProgress와 동일한 기준)
      return `${problemStat.correctSubmissions || 0}/${problemStat.totalStudents}명 완료`;
    }
    
    return `0/${submissionStats.totalStudents || 0}명 완료`;
  };

  // 사용자의 이 문제 제출 상태 확인
  const getUserSubmissionStatus = () => {
    if (!userSubmissionStatus || !userSubmissionStatus.problemStatuses) {
      return null;
    }
    
    const problemStatus = userSubmissionStatus.problemStatuses.find(
      status => status.problemId === problem.id
    );
    
    return problemStatus;
  };

  const userStatus = getUserSubmissionStatus();

  return (
    <Link 
      to={`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problem.id}`} 
      className="problem-item-link"
    >
      <div className="problem-item">
        <div className="problem-info">
          <h3 className="problem-title">{removeCopyLabel(problem.title)}</h3>
          <div className="problem-meta">
            <span className="problem-level">{problem.level || "Level 1"}</span>
            <span className="problem-completed">{getSubmissionStatus()}</span>
          </div>
          
          {/* Problem Limits */}
          {(problem.timeLimit || problem.memoryLimit) && (
            <div className="problem-limits">
              {problem.timeLimit && (
                <span className="limit-badge time-limit">
                  시간 제한: {problem.timeLimit}초
                </span>
              )}
              {problem.memoryLimit && (
                <span className="limit-badge memory-limit">
                  메모리 제한: {problem.memoryLimit}MB
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="problem-icons">
          {userStatus && (
            <div className={`submission-status ${userStatus.hasCorrectSubmission ? 'correct' : userStatus.hasSubmitted ? 'submitted' : 'not-submitted'}`}>
              {userStatus.hasCorrectSubmission ? '정답' : userStatus.hasSubmitted ? '제출함' : '미제출'}
            </div>
          )}
          
          {problem.tags && problem.tags.map((tag, index) => (
            <div key={index} className="tag-icon"></div>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ProblemItem; 