import React from 'react';
import '../../components/AssignmentModals/AssignmentModals.css';

/**
 * 독립적인 새 문제 생성 모달 컴포넌트 (문제만 생성, 과제에 추가하지 않음)
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} formData - 폼 데이터
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onSubmit - 제출 핸들러
 * @param {Function} onInputChange - 입력 변경 핸들러
 */
const StandaloneProblemCreateModal = ({
  isOpen,
  formData,
  onClose,
  onSubmit,
  onInputChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="tutor-modal-overlay">
      <div className="tutor-modal-content">
        <div className="tutor-modal-header">
          <h2>새 문제 만들기</h2>
          <button 
            className="tutor-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="tutor-problem-form">
          <div className="tutor-form-group">
            <label htmlFor="standaloneProblemTitle">문제 제목 *</label>
            <input
              type="text"
              id="standaloneProblemTitle"
              name="title"
              value={formData.title}
              onChange={onInputChange}
              placeholder="문제 제목을 입력하세요"
              required
            />
          </div>

          <div className="tutor-info-box">
            <p><strong>📄 문제 설명 파일 우선순위:</strong></p>
            <p>1. 별도 업로드 파일 (최우선) - .md, .txt, .tex 지원</p>
            <p>2. ZIP 파일 내 problem_statement 폴더의 파일 (.tex → .md → .txt 순)</p>
            <p>3. 파일이 없으면 빈 설명으로 생성됩니다.</p>
          </div>

          <div className="tutor-form-group">
            <label htmlFor="standaloneDescriptionFile">문제 설명 파일 <span className="tutor-optional">(선택사항)</span></label>
            <input
              type="file"
              id="standaloneDescriptionFile"
              name="descriptionFile"
              onChange={onInputChange}
              accept=".md,.txt,.tex"
              className="tutor-file-input"
            />
            <small className="tutor-file-help">
              마크다운(.md), 텍스트(.txt), LaTeX(.tex) 형식의 문제 설명 파일을 업로드하세요.
              <br/>이 파일이 있으면 ZIP 파일 내부 설명보다 우선 적용됩니다.
              {formData.descriptionFile && (
                <span className="tutor-file-selected">선택됨: {formData.descriptionFile.name}</span>
              )}
            </small>
          </div>

          <div className="tutor-form-group">
            <label htmlFor="standaloneZipFile">문제 파일 (.zip) *</label>
            <input
              type="file"
              id="standaloneZipFile"
              name="zipFile"
              onChange={onInputChange}
              accept=".zip"
              className="tutor-file-input"
              required
            />
            <small className="tutor-file-help">
              테스트 케이스와 정답이 포함된 ZIP 파일을 업로드하세요. (최대 50MB)
              <br/>ZIP 내부에 problem_statement 폴더가 있으면 자동으로 설명을 추출합니다.
              {formData.zipFile && (
                <span className="tutor-file-selected">선택됨: {formData.zipFile.name} ({(formData.zipFile.size / 1024 / 1024).toFixed(2)}MB)</span>
              )}
            </small>
          </div>

          <div className="tutor-info-box">
            <p><strong>💡 안내:</strong></p>
            <p>• 이 기능은 문제만 생성합니다</p>
            <p>• 생성 후 원하는 과제에서 "문제 추가" 버튼으로 추가할 수 있습니다</p>
            <p>• 여러 과제에 동일한 문제를 재사용할 수 있습니다</p>
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
              문제 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StandaloneProblemCreateModal;

