import React from 'react';
import { removeCopyLabel } from '../../utils/problemUtils';
import APIService from '../../services/APIService';
import '../../components/AssignmentModals/AssignmentModals.css';

/**
 * 문제 목록 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} selectedAssignment - 선택된 과제
 * @param {Object} submissionStats - 제출 통계
 * @param {string} searchTerm - 검색어
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onAddProblem - 문제 추가 핸들러
 * @param {Function} onRemoveProblem - 문제 제거 핸들러
 * @param {Function} onProblemDetail - 문제 상세 조회 핸들러
 * @param {Function} onSearchChange - 검색어 변경 핸들러
 */
const ProblemListModal = ({
  isOpen,
  selectedAssignment,
  submissionStats,
  searchTerm,
  onClose,
  onAddProblem,
  onRemoveProblem,
  onProblemDetail,
  onSearchChange
}) => {
  if (!isOpen || !selectedAssignment) return null;

  const filteredProblems = selectedAssignment.problems?.filter(problem => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      problem.id?.toString().includes(searchLower) ||
      problem.title?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="tutor-modal-overlay" onClick={onClose}>
      <div className="tutor-modal-content tutor-modal-content-extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="tutor-modal-header">
          <h2>문제 목록 관리 - {selectedAssignment.title}</h2>
          <button 
            className="tutor-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="tutor-modal-body">
          {/* 문제 검색 */}
          <div className="tutor-filters-section">
            <div className="tutor-search-box">
              <input
                type="text"
                placeholder="문제 ID, 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="tutor-search-input"
              />
            </div>
          </div>

          {selectedAssignment.problems && selectedAssignment.problems.length > 0 ? (
            filteredProblems.length > 0 ? (
              <div className="tutor-problems-table-container">
                <table className="tutor-problems-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>제목</th>
                      <th>난이도</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((problem, index) => {
                      const problemStat = submissionStats[selectedAssignment.id]?.problemStats?.find(
                        stat => stat.problemId === problem.id
                      );
                      
                      return (
                        <tr key={problem.id || index}>
                          <td>{problem.id}</td>
                          <td className="tutor-problem-title-cell">
                            <button
                              className="tutor-btn-link"
                              onClick={() => onProblemDetail(problem.id)}
                            >
                              {removeCopyLabel(problem.title)}
                            </button>
                          </td>
                          <td>{problem.difficulty || 'N/A'}</td>
                          <td>
                            {problemStat 
                              ? `${problemStat.solvedCount}/${problemStat.totalStudents}명 완료` 
                              : '0/0명'}
                          </td>
                          <td>
                            <button
                              className="tutor-btn-table-action"
                              onClick={() => onProblemDetail(problem.id)}
                            >
                              수정
                            </button>
                            <button
                              className="tutor-btn-table-action tutor-btn-delete"
                              onClick={() => onRemoveProblem(selectedAssignment.id, problem.id)}
                            >
                              제거
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="tutor-no-problems">
                <p>검색 조건에 맞는 문제가 없습니다.</p>
              </div>
            )
          ) : (
            <div className="tutor-no-problems">
              <p>등록된 문제가 없습니다.</p>
              <button 
                className="tutor-btn-primary"
                onClick={() => {
                  onClose();
                  onAddProblem(selectedAssignment);
                }}
              >
                첫 번째 문제 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemListModal;

