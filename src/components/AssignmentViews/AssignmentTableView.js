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
            <th>과제 제목</th>
            <th>마감일</th>
            <th>문제 수</th>
            <th>제출 현황</th>
            <th>관리</th>
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
                <td className="tutor-assignment-meta-cell">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }) : '미설정'}
                </td>
                <td className="tutor-assignment-meta-cell">{assignment.problemCount || 0}개</td>
                <td className="tutor-assignment-meta-cell">
                  {submissionStats[assignment.id] ? 
                    `${submissionStats[assignment.id].submittedStudents}/${submissionStats[assignment.id].totalStudents}` 
                    : `0/${assignment.totalStudents || 0}`}
                </td>
                <td className="tutor-assignment-actions-cell">
                  <div className="tutor-assignment-actions-inline">
                    <button 
                      className="tutor-btn-table-action"
                      onClick={() => onProblemListManage(assignment)}
                    >
                      문제 목록 관리
                    </button>
                    <button 
                      className="tutor-btn-table-action"
                      onClick={() => onAddProblem(assignment)}
                    >
                      문제 추가
                    </button>
                    <button 
                      className="tutor-btn-table-action tutor-btn-edit"
                      onClick={() => onEdit(assignment)}
                    >
                      수정
                    </button>
                    <div className="tutor-more-menu">
                      <button 
                        className="tutor-btn-table-action tutor-btn-more"
                        title="더보기"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMoreMenu(assignment.id);
                        }}
                      >
                        ⋯
                      </button>
                      {openMoreMenu === assignment.id && (
                        <div className="tutor-more-dropdown">
                          <button 
                            className="tutor-btn-text-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleActive(assignment.sectionId, assignment.id, assignment.active);
                              onToggleMoreMenu(null);
                            }}
                          >
                            {assignment.active ? '비활성화' : '활성화'}
                          </button>
                          <button 
                            className="tutor-btn-text-small tutor-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(assignment.id);
                              onToggleMoreMenu(null);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      )}
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

