import React from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import '../../components/AssignmentModals/AssignmentModals.css';

/**
 * 문제 상세 모달 컴포넌트
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} problemDetail - 문제 상세 정보
 * @param {Function} onClose - 모달 닫기 핸들러
 */
const ProblemDetailModal = ({ isOpen, problemDetail, onClose }) => {
  if (!isOpen || !problemDetail) return null;

  const description = problemDetail.description || '';
  const isMarkdown = description.includes('# ') || 
    description.includes('## ') || 
    description.includes('```') ||
    description.includes('**') ||
    !description.includes('<');

  return createPortal(
    <div 
      className="tutor-modal-overlay tutor-modal-overlay-detail" 
      onClick={onClose}
    >
      <div className="tutor-modal-content tutor-large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tutor-modal-header">
          <h2>문제 상세 - {problemDetail.title}</h2>
          <button 
            className="tutor-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="tutor-modal-body">
          <div className="tutor-problem-detail-content">
            <div className="tutor-detail-meta">
              {problemDetail.timeLimit && (
                <span>시간 제한: {problemDetail.timeLimit}초</span>
              )}
              {problemDetail.memoryLimit && (
                <span>메모리 제한: {problemDetail.memoryLimit}MB</span>
              )}
            </div>
            <div className="tutor-detail-body tutor-problem-description">
              {description ? (
                isMarkdown ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: description }} />
                )
              ) : (
                <p>문제 설명이 없습니다.</p>
              )}
            </div>
          </div>
          
          <div className="tutor-modal-actions">
            <button 
              className="tutor-btn-secondary"
              onClick={onClose}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProblemDetailModal;

