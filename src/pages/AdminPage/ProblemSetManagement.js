import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
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
      <AdminLayout>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="problem-set-management">
        <div className="admin-page-header">
          <h1 className="admin-page-title">문제집 관리</h1>
          <div className="admin-header-actions">
            <button 
              className="admin-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              새 문제집 만들기
            </button>
          </div>
        </div>

        <div className="admin-filters-section">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="문제집명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>

        <div className="admin-problems-table-container">
          {filteredSets.length > 0 ? (
            <table className="admin-problems-table">
              <thead>
                <tr>
                  <th className="admin-problem-title-cell">문제집 제목</th>
                  <th className="admin-problem-meta-cell">문제 수</th>
                  <th className="admin-problem-meta-cell">생성일</th>
                  <th className="admin-problem-actions-cell">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredSets.map((set) => (
                  <tr key={set.id}>
                    <td className="admin-problem-title-cell">
                      <div>
                        <span className="admin-problem-title">{set.title}</span>
                        {set.description && (
                          <p className="admin-problem-description">{set.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="admin-problem-meta-cell">
                      {set.problemCount || 0}개
                    </td>
                    <td className="admin-problem-meta-cell">
                      {set.createdAt ? new Date(set.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="admin-problem-actions-cell">
                      <div className="admin-problem-actions-inline">
                        <button 
                          className="admin-btn-table-action admin-btn-edit"
                          onClick={() => alert('문제집 편집 기능은 구현 예정입니다.')}
                        >
                          편집
                        </button>
                        <button 
                          className="admin-btn-table-action admin-btn-delete"
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
            <div className="admin-table-empty">
              <p>등록된 문제집이 없습니다.</p>
              <button 
                className="admin-btn-primary"
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
            className="admin-modal-overlay" 
            onClick={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setNewSetTitle('');
                setNewSetDescription('');
              }
            }}
          >
            <div 
              className="admin-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2>새 문제집 만들기</h2>
                <button 
                  className="admin-modal-close"
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
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label htmlFor="set-title">문제집 제목 *</label>
                  <input
                    id="set-title"
                    type="text"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    className="admin-form-input"
                    placeholder="문제집 제목을 입력하세요"
                    disabled={isCreating}
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="set-description">설명 (선택)</label>
                  <textarea
                    id="set-description"
                    value={newSetDescription}
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    className="admin-form-textarea"
                    placeholder="문제집에 대한 설명을 입력하세요"
                    rows="4"
                    disabled={isCreating}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  className="admin-btn-secondary"
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
                  className="admin-btn-primary"
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
    </AdminLayout>
  );
};

export default ProblemSetManagement;

