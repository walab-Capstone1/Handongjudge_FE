import React from 'react';
import './AssignmentModals.css';

/**
 * 과제 추가 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} formData - 폼 데이터
 * @param {Array} sections - 분반 목록
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onSubmit - 제출 핸들러
 * @param {Function} onInputChange - 입력 변경 핸들러
 */
const AssignmentAddModal = ({
  isOpen,
  formData,
  sections,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="tutor-modal-overlay">
      <div className="tutor-modal-content">
        <div className="tutor-modal-header">
          <h2>새 과제 추가</h2>
          <button 
            className="tutor-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="assignment-form">
          <div className="tutor-form-row">
            <div className="tutor-form-group">
              <label htmlFor="title">과제명 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="과제명을 입력하세요"
                required
              />
            </div>
            
            <div className="tutor-form-group">
              <label htmlFor="assignmentNumber">과제 번호</label>
              <input
                type="text"
                id="assignmentNumber"
                name="assignmentNumber"
                value={formData.assignmentNumber}
                onChange={onInputChange}
                placeholder="예: HW1, Assignment1"
              />
            </div>
          </div>

          <div className="tutor-form-group">
            <label htmlFor="sectionId">분반 선택 *</label>
            <select
              id="sectionId"
              name="sectionId"
              value={formData.sectionId}
              onChange={onInputChange}
              required
            >
              <option value="">분반을 선택하세요</option>
              {sections.map((section) => (
                <option key={section.sectionId} value={section.sectionId}>
                  {section.courseTitle} (분반 {section.sectionNumber || section.sectionId})
                </option>
              ))}
            </select>
          </div>

          <div className="tutor-form-group">
            <label htmlFor="description">과제 설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="과제에 대한 상세 설명을 입력하세요"
              rows="4"
            />
          </div>

          <div className="tutor-form-row">
            <div className="tutor-form-group">
              <label htmlFor="startDate">시작일</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={onInputChange}
              />
            </div>
            
            <div className="tutor-form-group">
              <label htmlFor="endDate">마감일</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={onInputChange}
              />
            </div>
          </div>

          <div className="tutor-form-actions">
            <button 
              type="button" 
              className="tutor-btn-secondary"
              onClick={onClose}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="tutor-btn-primary"
            >
              과제 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentAddModal;

