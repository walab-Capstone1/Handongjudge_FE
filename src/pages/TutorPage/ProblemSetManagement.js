import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./ProblemSetManagement.css";

const ProblemSetManagement = () => {
  const navigate = useNavigate();
  const [problemSets, setProblemSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProblemSets();
  }, []);

  const fetchProblemSets = async () => {
    try {
      setLoading(true);
      const response = await APIService.getProblemSets();
      setProblemSets(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error('문제집 목록 조회 실패:', error);
      setProblemSets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async () => {
    if (!newSetTitle.trim()) {
      alert('문제집 제목을 입력해주세요.');
      return;
    }

    try {
      setIsCreating(true);
      await APIService.createProblemSet({
        title: newSetTitle.trim(),
        description: newSetDescription.trim() || null,
        tags: '[]' // 기본값: 빈 태그 배열
      });
      setShowCreateModal(false);
      setNewSetTitle('');
      setNewSetDescription('');
      fetchProblemSets();
    } catch (error) {
      console.error('문제집 생성 실패:', error);
      alert('문제집 생성에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSet = async (problemSet) => {
    if (!window.confirm(`정말로 "${problemSet.title}" 문제집을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await APIService.deleteProblemSet(problemSet.id);
      fetchProblemSets();
    } catch (error) {
      console.error('문제집 삭제 실패:', error);
      alert('문제집 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const filteredSets = problemSets.filter(set => 
    set.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <TutorLayout>
        <LoadingSpinner message="문제집 목록을 불러오는 중..." />
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="problem-set-management">
        <div className="problem-set-management-title-header">
          <button
            className="problem-set-management-btn-back-to-list"
            onClick={() => navigate('/tutor/problems')}
            title="문제 관리 페이지로 돌아가기"
          >
            ← 문제 관리
          </button>
          <div className="problem-set-management-title-left">
            <h1 className="problem-set-management-title">문제집 관리</h1>
            <div className="problem-set-management-title-stats">
              <span className="problem-set-management-stat-badge">총 {problemSets.length}개 문제집</span>
              <span className="problem-set-management-stat-badge">표시 {filteredSets.length}개</span>
            </div>
          </div>
          <div className="problem-set-management-title-right">
            <button 
              className="problem-set-management-btn-create"
              onClick={() => setShowCreateModal(true)}
            >
              + 새 문제집 만들기
            </button>
          </div>
        </div>

        <div className="problem-set-management-filters-section">
          <div className="problem-set-management-search-box">
            <input
              type="text"
              placeholder="문제집명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="problem-set-management-search-input"
            />
          </div>
        </div>

        <div className="problem-set-management-table-container">
          {filteredSets.length > 0 ? (
            <table className="problem-set-management-table">
              <thead>
                <tr>
                  <th className="problem-set-management-title-cell">문제집 제목</th>
                  <th className="problem-set-management-meta-cell">문제 수</th>
                  <th className="problem-set-management-meta-cell">생성일</th>
                  <th className="problem-set-management-actions-cell">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredSets.map((set) => (
                  <tr key={set.id}>
                    <td className="problem-set-management-title-cell">
                      <div 
                        className="problem-set-management-title-wrapper"
                        onClick={() => navigate(`/tutor/problems/sets/${set.id}/edit`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="problem-set-management-title-content">
                          <span className="problem-set-management-title-text">{set.title}</span>
                          {set.description && (
                            <p className="problem-set-management-description">{set.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="problem-set-management-meta-cell">
                      {set.problemCount || 0}개
                    </td>
                    <td className="problem-set-management-meta-cell">
                      {formatDate(set.createdAt)}
                    </td>
                    <td className="problem-set-management-actions-cell">
                      <div className="problem-set-management-actions-inline">
                        <button 
                          className="problem-set-management-btn-action problem-set-management-btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSet(set);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              title="등록된 문제집이 없습니다"
              message="새로운 문제집을 만들어보세요"
              actionLabel="새 문제집 만들기"
              onAction={() => setShowCreateModal(true)}
            />
          )}
        </div>

        {/* 문제집 생성 모달 */}
        {showCreateModal && (
          <div 
            className="problem-set-management-modal-overlay" 
            onClick={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setNewSetTitle('');
                setNewSetDescription('');
              }
            }}
          >
            <div 
              className="problem-set-management-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-set-management-modal-header">
                <h2>새 문제집 만들기</h2>
                <button 
                  className="problem-set-management-modal-close"
                  onClick={() => {
                    if (!isCreating) {
                      setShowCreateModal(false);
                      setNewSetTitle('');
                      setNewSetDescription('');
                    }
                  }}
                  disabled={isCreating}
                >
                  ×
                </button>
              </div>
              <div className="problem-set-management-modal-body">
                <div className="problem-set-management-form-group">
                  <label htmlFor="set-title">문제집 제목 *</label>
                  <input
                    id="set-title"
                    type="text"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    className="problem-set-management-form-input"
                    placeholder="문제집 제목을 입력하세요"
                    disabled={isCreating}
                  />
                </div>
                <div className="problem-set-management-form-group">
                  <label htmlFor="set-description">설명 (선택)</label>
                  <textarea
                    id="set-description"
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    className="problem-set-management-form-textarea"
                    placeholder="문제집에 대한 설명을 입력하세요"
                    rows="4"
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="problem-set-management-modal-footer">
                <button 
                  className="problem-set-management-btn-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSetTitle('');
                    setNewSetDescription('');
                  }}
                  disabled={isCreating}
                >
                  취소
                </button>
                <button 
                  className="problem-set-management-btn-submit"
                  onClick={handleCreateSet}
                  disabled={isCreating || !newSetTitle.trim()}
                >
                  {isCreating ? '생성 중...' : '생성'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default ProblemSetManagement;

