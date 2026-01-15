import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
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
      // TODO: 백엔드 API 연동
      // const response = await APIService.getProblemSets();
      // setProblemSets(response.data || []);
      setProblemSets([]); // 임시로 빈 배열
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
      // TODO: 백엔드 API 연동
      // await APIService.createProblemSet({
      //   title: newSetTitle,
      //   description: newSetDescription
      // });
      alert('문제집 생성 기능은 백엔드 API 연동 후 구현됩니다.');
      setShowCreateModal(false);
      setNewSetTitle('');
      setNewSetDescription('');
      fetchProblemSets();
    } catch (error) {
      console.error('문제집 생성 실패:', error);
      alert('문제집 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredSets = problemSets.filter(set => 
    set.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <TutorLayout>
        <div className="tutor-loading-container">
          <div className="tutor-loading-spinner"></div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="problem-set-management">
        <div className="tutor-page-header">
          <h1 className="tutor-page-title">문제집 관리</h1>
          <div className="tutor-header-actions">
            <button 
              className="tutor-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              새 문제집 만들기
            </button>
          </div>
        </div>

        <div className="tutor-filters-section">
          <div className="tutor-search-box">
            <input
              type="text"
              placeholder="문제집명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tutor-search-input"
            />
          </div>
        </div>

        <div className="tutor-problems-table-container">
          {filteredSets.length > 0 ? (
            <table className="tutor-problems-table">
              <thead>
                <tr>
                  <th className="tutor-problem-title-cell">문제집 제목</th>
                  <th className="tutor-problem-meta-cell">문제 수</th>
                  <th className="tutor-problem-meta-cell">생성일</th>
                  <th className="tutor-problem-actions-cell">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredSets.map((set) => (
                  <tr key={set.id}>
                    <td className="tutor-problem-title-cell">
                      <div>
                        <span className="tutor-problem-title">{set.title}</span>
                        {set.description && (
                          <p className="tutor-problem-description">{set.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="tutor-problem-meta-cell">
                      {set.problemCount || 0}개
                    </td>
                    <td className="tutor-problem-meta-cell">
                      {set.createdAt ? new Date(set.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="tutor-problem-actions-cell">
                      <div className="tutor-problem-actions-inline">
                        <button 
                          className="tutor-btn-table-action tutor-btn-edit"
                          onClick={() => alert('문제집 편집 기능은 구현 예정입니다.')}
                        >
                          편집
                        </button>
                        <button 
                          className="tutor-btn-table-action tutor-btn-delete"
                          onClick={() => alert('문제집 삭제 기능은 구현 예정입니다.')}
                          style={{ marginLeft: '8px' }}
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
            <div className="tutor-table-empty">
              <p>등록된 문제집이 없습니다.</p>
              <button 
                className="tutor-btn-primary"
                onClick={() => setShowCreateModal(true)}
                style={{ marginTop: '16px' }}
              >
                첫 문제집 만들기
              </button>
            </div>
          )}
        </div>

        {/* 문제집 생성 모달 */}
        {showCreateModal && (
          <div 
            className="tutor-modal-overlay" 
            onClick={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setNewSetTitle('');
                setNewSetDescription('');
              }
            }}
          >
            <div 
              className="tutor-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tutor-modal-header">
                <h2>새 문제집 만들기</h2>
                <button 
                  className="tutor-modal-close"
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
              <div className="tutor-modal-body">
                <div className="tutor-form-group">
                  <label htmlFor="set-title">문제집 제목 *</label>
                  <input
                    id="set-title"
                    type="text"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    className="tutor-form-input"
                    placeholder="문제집 제목을 입력하세요"
                    disabled={isCreating}
                  />
                </div>
                <div className="tutor-form-group">
                  <label htmlFor="set-description">설명 (선택)</label>
                  <textarea
                    id="set-description"
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    className="tutor-form-textarea"
                    placeholder="문제집에 대한 설명을 입력하세요"
                    rows="4"
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="tutor-modal-footer">
                <button 
                  className="tutor-btn-secondary"
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
                  className="tutor-btn-primary"
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

