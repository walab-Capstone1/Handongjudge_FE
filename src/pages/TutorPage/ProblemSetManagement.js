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
  const [showProblemSelectModal, setShowProblemSelectModal] = useState(false);
  const [allProblems, setAllProblems] = useState([]);
  const [problemSearchTerm, setProblemSearchTerm] = useState('');
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: 기본정보, 2: 문제선택

  useEffect(() => {
    fetchProblemSets();
    if (showProblemSelectModal) {
      fetchAllProblems();
    }
  }, [showProblemSelectModal]);

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

  const fetchAllProblems = async () => {
    try {
      const response = await APIService.getAllProblems();
      let problemsData = [];
      if (Array.isArray(response)) {
        problemsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        problemsData = response.data;
      } else if (response?.data && !Array.isArray(response.data)) {
        problemsData = [response.data];
      } else if (response && typeof response === 'object') {
        problemsData = Object.values(response);
      }
      setAllProblems(problemsData);
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setAllProblems([]);
    }
  };

  const handleNextToProblemSelect = () => {
    if (!newSetTitle.trim()) {
      alert('문제집 제목을 입력해주세요.');
      return;
    }
    setShowCreateModal(false); // 첫 번째 모달 닫기
    setCurrentStep(2);
    setShowProblemSelectModal(true); // 두 번째 모달 열기
    fetchAllProblems();
  };

  const handleSkipProblemSelect = async () => {
    await handleCreateSetWithProblems([]);
  };

  const handleCreateSetWithProblems = async (problemIds = null) => {
    const finalProblemIds = problemIds !== null ? problemIds : selectedProblemIds;

    try {
      setIsCreating(true);
      await APIService.createProblemSet({
        title: newSetTitle.trim(),
        description: newSetDescription.trim() || null,
        tags: '[]', // 기본값: 빈 태그 배열
        problemIds: finalProblemIds
      });
      setShowCreateModal(false);
      setShowProblemSelectModal(false);
      setCurrentStep(1);
      setNewSetTitle('');
      setNewSetDescription('');
      setSelectedProblemIds([]);
      setProblemSearchTerm('');
      fetchProblemSets();
    } catch (error) {
      console.error('문제집 생성 실패:', error);
      alert('문제집 생성에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateSet = async () => {
    if (!newSetTitle.trim()) {
      alert('문제집 제목을 입력해주세요.');
      return;
    }

    // 문제 선택 단계로 이동
    handleNextToProblemSelect();
  };

  const handleProblemToggle = (problemId) => {
    setSelectedProblemIds(prev => {
      if (prev.includes(problemId)) {
        return prev.filter(id => id !== problemId);
      } else {
        return [...prev, problemId];
      }
    });
  };

  const handleSelectAllProblems = () => {
    const filtered = getFilteredProblems();
    if (selectedProblemIds.length === filtered.length && filtered.length > 0) {
      setSelectedProblemIds([]);
    } else {
      setSelectedProblemIds(filtered.map(p => p.id));
    }
  };

  const getFilteredProblems = () => {
    let filtered = allProblems;
    if (problemSearchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(problemSearchTerm.toLowerCase()) ||
        p.id?.toString().includes(problemSearchTerm)
      );
    }
    return filtered;
  };

  const filteredProblems = getFilteredProblems();

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
              onClick={() => {
                setCurrentStep(1);
                setShowCreateModal(true);
                setShowProblemSelectModal(false);
              }}
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

        {/* 문제집 생성 모달 - 기본 정보 */}
        {showCreateModal && currentStep === 1 && (
          <div 
            className="problem-set-management-create-modal-overlay" 
            onClick={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setNewSetTitle('');
                setNewSetDescription('');
              }
            }}
          >
            <div 
              className="problem-set-management-create-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-set-management-create-modal-header">
                <h2>새 문제집 만들기</h2>
                <button 
                  className="problem-set-management-create-modal-close"
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
              <div className="problem-set-management-create-modal-body">
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
              <div className="problem-set-management-create-modal-footer">
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
                  onClick={handleNextToProblemSelect}
                  disabled={isCreating || !newSetTitle.trim()}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 문제 선택 모달 */}
        {showProblemSelectModal && currentStep === 2 && (
          <div 
            className="problem-set-management-create-modal-overlay" 
            onClick={() => {
              if (!isCreating) {
                setShowProblemSelectModal(false);
                setCurrentStep(1);
                setSelectedProblemIds([]);
                setProblemSearchTerm('');
              }
            }}
          >
            <div 
              className="problem-set-management-create-modal-content" 
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '95vw', width: '95vw', minWidth: '800px' }}
            >
              <div className="problem-set-management-create-modal-header">
                <h2>문제 선택 - {newSetTitle}</h2>
                <button 
                  className="problem-set-management-create-modal-close"
                  onClick={() => {
                    if (!isCreating) {
                      setShowProblemSelectModal(false);
                      setCurrentStep(1);
                      setSelectedProblemIds([]);
                      setProblemSearchTerm('');
                    }
                  }}
                  disabled={isCreating}
                >
                  ×
                </button>
              </div>
              
              <div className="problem-set-management-create-modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="문제명 또는 ID로 검색..."
                    value={problemSearchTerm}
                    onChange={(e) => setProblemSearchTerm(e.target.value)}
                    className="problem-set-management-search-input"
                    style={{ width: '100%', maxWidth: '500px' }}
                  />
                </div>

                {filteredProblems.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedProblemIds.length === filteredProblems.length && filteredProblems.length > 0}
                        onChange={handleSelectAllProblems}
                      />
                      <span>전체 선택</span>
                    </label>
                    <span>
                      {selectedProblemIds.length} / {filteredProblems.length}개 선택됨
                    </span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                      <div key={problem.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedProblemIds.includes(problem.id)}
                          onChange={() => handleProblemToggle(problem.id)}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{problem.title}</h4>
                          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>ID: #{problem.id}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      <p>{problemSearchTerm ? '검색 결과가 없습니다.' : '사용 가능한 문제가 없습니다.'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="problem-set-management-create-modal-footer">
                <button 
                  className="problem-set-management-btn-cancel"
                  onClick={() => {
                    setShowProblemSelectModal(false);
                    setCurrentStep(1);
                    setShowCreateModal(true);
                  }}
                  disabled={isCreating}
                >
                  이전
                </button>
                <button 
                  className="problem-set-management-btn-cancel"
                  onClick={handleSkipProblemSelect}
                  disabled={isCreating}
                >
                  건너뛰기
                </button>
                <button 
                  className="problem-set-management-btn-cancel"
                  onClick={() => {
                    setShowProblemSelectModal(false);
                    setCurrentStep(1);
                    setSelectedProblemIds([]);
                    setProblemSearchTerm('');
                  }}
                  disabled={isCreating}
                >
                  취소
                </button>
                <button 
                  className="problem-set-management-btn-submit"
                  onClick={() => handleCreateSetWithProblems()}
                  disabled={isCreating}
                >
                  {isCreating ? '생성 중...' : `생성${selectedProblemIds.length > 0 ? ` (${selectedProblemIds.length}개 문제)` : ''}`}
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

