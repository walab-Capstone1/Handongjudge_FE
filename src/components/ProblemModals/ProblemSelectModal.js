import React from 'react';
import { createPortal } from 'react-dom';
import { removeCopyLabel } from '../../utils/problemUtils';
import APIService from '../../services/APIService';
import '../../components/AssignmentModals/AssignmentModals.css';

/**
 * 문제 선택 모달 컴포넌트 (현재 수업의 문제들)
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} selectedAssignment - 선택된 과제
 * @param {Array} filteredProblems - 필터링된 문제 목록
 * @param {Array} selectedProblemIds - 선택된 문제 ID 목록
 * @param {string} problemSearchTerm - 문제 검색어
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onProblemToggle - 문제 토글 핸들러
 * @param {Function} onSelectAll - 전체 선택 핸들러
 * @param {Function} onSearchChange - 검색어 변경 핸들러
 * @param {Function} onSelectProblems - 문제 선택 핸들러
 * @param {Function} onCopyProblem - 문제 복사 모달 열기 핸들러
 * @param {Function} onCreateNew - 새 문제 생성 모달 열기 핸들러
 * @param {Function} onProblemDetail - 문제 상세 조회 핸들러
 */
const ProblemSelectModal = ({
  isOpen,
  selectedAssignment,
  filteredProblems,
  selectedProblemIds,
  problemSearchTerm,
  onClose,
  onProblemToggle,
  onSelectAll,
  onSearchChange,
  onSelectProblems,
  onCopyProblem,
  onCreateNew,
  onProblemDetail
}) => {
  if (!isOpen) return null;

  const allSelected = selectedProblemIds.length === filteredProblems.length && filteredProblems.length > 0;

  return createPortal(
    <div className="tutor-modal-overlay">
      <div className="tutor-modal-content tutor-problem-modal tutor-problem-modal-large">
        <div className="tutor-modal-header">
          <h2>문제 추가 - {selectedAssignment?.title}</h2>
          <button 
            className="tutor-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="tutor-problem-modal-body">
          <div className="tutor-problem-search-section">
            <input
              type="text"
              placeholder="문제명으로 검색..."
              value={problemSearchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="tutor-search-input"
            />
          </div>

          {filteredProblems.length > 0 && (
            <div className="tutor-problem-selection-header">
              <label className="tutor-checkbox-label">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                />
                <span>전체 선택</span>
              </label>
              <span className="tutor-item-count">
                {selectedProblemIds.length} / {filteredProblems.length}개 선택됨
              </span>
            </div>
          )}

          <div className="tutor-available-problems-grid">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => (
                <div key={problem.id} className="tutor-problem-card">
                  <div className="tutor-problem-card-header">
                    <input
                      type="checkbox"
                      checked={selectedProblemIds.includes(problem.id)}
                      onChange={() => onProblemToggle(problem.id)}
                      className="tutor-problem-checkbox"
                    />
                  </div>
                  <div className="tutor-problem-card-body">
                    <h4 className="tutor-problem-card-title">{removeCopyLabel(problem.title)}</h4>
                    <div className="tutor-problem-card-meta-row">
                      <span className="tutor-problem-card-date">
                        생성일: {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <button 
                        className="tutor-btn-view-detail-card"
                        onClick={() => onProblemDetail(problem.id)}
                      >
                        설명보기
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="tutor-no-available-problems">
                <p>사용 가능한 문제가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        <div className="tutor-modal-footer">
          <div className="tutor-problem-action-buttons">
            <button 
              type="button"
              className="tutor-btn-copy-problem"
              onClick={onCopyProblem}
            >
              기존 문제 가져오기
            </button>
            <button 
              type="button"
              className="tutor-btn-create-new"
              onClick={onCreateNew}
            >
              새 문제 만들기
            </button>
          </div>
          {filteredProblems.length > 0 && selectedProblemIds.length > 0 && (
            <div className="tutor-footer-actions">
              <button 
                type="button"
                className="tutor-btn-secondary"
                onClick={onClose}
              >
                취소
              </button>
              <button 
                type="button"
                className="tutor-btn-primary"
                onClick={() => onSelectProblems(selectedProblemIds)}
              >
                선택한 문제 추가 ({selectedProblemIds.length}개)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProblemSelectModal;

