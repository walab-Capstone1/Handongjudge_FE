import React from 'react';
import { removeCopyLabel } from '../../utils/problemUtils';
import { getDifficultyColor } from '../../utils/assignmentUtils';
import AssignmentPagination from '../Pagination/AssignmentPagination';

/**
 * 과제 테이블 뷰 컴포넌트 (분반별 페이지용)
 * @param {Array} paginatedAssignments - 페이지네이션된 과제 목록
 * @param {Object} submissionStats - 제출 통계
 * @param {number} openMoreMenu - 열린 더보기 메뉴 ID
 * @param {Function} onToggleMoreMenu - 더보기 메뉴 토글 핸들러
 * @param {Function} onProblemListManage - 문제 목록 관리 핸들러
 * @param {Function} onAddProblem - 문제 추가 핸들러
 * @param {Function} onEdit - 수정 핸들러
 * @param {Function} onToggleActive - 활성화 토글 핸들러
 * @param {Function} onDelete - 삭제 핸들러
 * @param {Object} paginationProps - 페이지네이션 props
 */
const AssignmentTableView = ({
  paginatedAssignments,
  submissionStats,
  openMoreMenu,
  onToggleMoreMenu,
  onProblemListManage,
  onAddProblem,
  onEdit,
  onToggleActive,
  onDelete,
  paginationProps
}) => {
  return (
    <div className="tutor-assignments-table-container">
      <table className="tutor-assignments-table">
        <thead>
          <tr>
            <th className="tutor-assignment-title-cell">과제 제목</th>
            <th className="tutor-assignment-due-date-cell">마감일</th>
            <th className="tutor-assignment-problem-count-cell">문제 수</th>
            <th className="tutor-assignment-submission-cell">제출 현황</th>
            <th className="tutor-assignment-actions-cell">관리</th>
          </tr>
        </thead>
        <tbody>
          {paginationProps.totalItems === 0 ? (
            <tr>
              <td colSpan="5" className="tutor-table-empty">
                과제가 없습니다.
              </td>
            </tr>
          ) : (
            paginatedAssignments.map((assignment) => (
              <tr key={assignment.id} className={assignment.active === false ? 'tutor-disabled' : ''}>
                <td className="tutor-assignment-title-cell">
                  <div>
                    <div className="tutor-assignment-title">{assignment.title}</div>
                    {assignment.description && (
                      <div className="tutor-assignment-description">{assignment.description}</div>
                    )}
                  </div>
                </td>
                <td className="tutor-assignment-due-date-cell">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '미설정'}
                </td>
                <td className="tutor-assignment-problem-count-cell">{assignment.problemCount || 0}개</td>
                <td className="tutor-assignment-submission-cell">
                  {submissionStats[assignment.id] ? 
                    `${submissionStats[assignment.id].submittedStudents}/${submissionStats[assignment.id].totalStudents}` 
                    : `0/${assignment.totalStudents || 0}`}
                </td>
                <td className="tutor-assignment-actions-cell">
                  <div className="tutor-assignment-actions-inline">
                    <div className="tutor-assignment-primary-actions">
                      <button 
                        className="tutor-btn-table-action"
                        onClick={() => onProblemListManage(assignment)}
                        title="문제 목록 관리"
                      >
                        목록
                      </button>
                      <button 
                        className="tutor-btn-table-action"
                        onClick={() => onAddProblem(assignment)}
                        title="문제 추가"
                      >
                        추가
                      </button>
                      <button 
                        className="tutor-btn-table-action tutor-btn-edit"
                        onClick={() => onEdit(assignment)}
                        title="수정"
                      >
                        수정
                      </button>
                    </div>
                    <div className="tutor-assignment-secondary-actions">
                      <div className="tutor-secondary-actions-layer">
                        <button 
                          className="tutor-btn-table-action tutor-btn-secondary-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(assignment.sectionId, assignment.id, assignment.active);
                          }}
                          title={assignment.active ? '비활성화' : '활성화'}
                        >
                          {assignment.active ? '비활성화' : '활성화'}
                        </button>
                        <button 
                          className="tutor-btn-table-action tutor-btn-secondary-action tutor-btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(assignment.id);
                          }}
                          title="삭제"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <AssignmentPagination {...paginationProps} />
    </div>
  );
};

export default AssignmentTableView;

