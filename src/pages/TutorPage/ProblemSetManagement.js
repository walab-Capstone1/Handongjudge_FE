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
  const [currentPage, setCurrentPage] = useState(1);
  const PROBLEMS_PER_PAGE = 10;

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
      
      // 1. 문제집 생성 (problemIds 없이)
      const response = await APIService.createProblemSet({
        title: newSetTitle.trim(),
        description: newSetDescription.trim() || null,
        tags: '[]' // 기본값: 빈 태그 배열
      });
      
      // 2. 생성된 문제집 ID 가져오기
      const problemSetId = response?.data?.id || response?.id || response;
      
      // 3. 선택한 문제들을 개별적으로 추가
      if (finalProblemIds && finalProblemIds.length > 0) {
        for (let i = 0; i < finalProblemIds.length; i++) {
          try {
            await APIService.addProblemToSet(problemSetId, finalProblemIds[i], i);
          } catch (error) {
            console.error(`문제 ${finalProblemIds[i]} 추가 실패:`, error);
            // 개별 문제 추가 실패는 경고만 하고 계속 진행
          }
        }
      }
      
      setShowCreateModal(false);
      setShowProblemSelectModal(false);
      setCurrentStep(1);
      setNewSetTitle('');
      setNewSetDescription('');
      setSelectedProblemIds([]);
      setProblemSearchTerm('');
      setCurrentPage(1);
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
    const allSelected = filtered.length > 0 && 
      filtered.every(p => selectedProblemIds.includes(p.id));
    
    if (allSelected) {
      // 모든 문제 선택 해제
      const filteredIds = filtered.map(p => p.id);
      setSelectedProblemIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // 모든 문제 선택
      setSelectedProblemIds(prev => {
        const newIds = filtered.map(p => p.id);
        const combined = [...new Set([...prev, ...newIds])];
        return combined;
      });
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

  const getPaginatedProblems = () => {
    const filtered = getFilteredProblems();
    const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE);
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      '1': '쉬움',
      '2': '보통',
      '3': '어려움'
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      '1': '#10b981',
      '2': '#f59e0b',
      '3': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
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
                setCurrentPage(1);
              }
            }}
          >
            <div 
              className="problem-set-management-create-modal-content problem-set-management-create-modal-content-problem-select" 
              onClick={(e) => e.stopPropagation()}
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
                      setCurrentPage(1);
                    }
                  }}
                  disabled={isCreating}
                >
                  ×
                </button>
              </div>
              
              <div className="problem-set-management-create-modal-body">
                <div className="problem-set-management-create-modal-filter-section">
                  <div className="problem-set-management-create-modal-search">
                    <input
                      type="text"
                      placeholder="문제명 또는 ID로 검색..."
                      value={problemSearchTerm}
                      onChange={(e) => {
                        setProblemSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="problem-set-management-create-modal-search-input"
                    />
                  </div>
                </div>

                {getFilteredProblems().length > 0 ? (
                  <>
                    <div className="problem-set-management-create-modal-actions">
                      <button
                        className="problem-set-management-create-modal-select-all"
                        onClick={handleSelectAllProblems}
                      >
                        {getFilteredProblems().length > 0 &&
                         getFilteredProblems().every(p => selectedProblemIds.includes(p.id))
                          ? '전체 해제' : '전체 선택'}
                      </button>
                      <span className="problem-set-management-create-modal-selected-count">
                        {selectedProblemIds.length}개 선택됨
                      </span>
                      <span className="problem-set-management-create-modal-filter-count">
                        총 {getFilteredProblems().length}개 문제
                      </span>
                    </div>

                    <div className="problem-set-management-create-modal-problems-list">
                      {getPaginatedProblems().map((problem) => {
                        const isSelected = selectedProblemIds.includes(problem.id);
                        
                        return (
                          <div 
                            key={problem.id}
                            className={`problem-set-management-create-modal-problem-item ${
                              isSelected ? 'selected' : ''
                            }`}
                            onClick={() => handleProblemToggle(problem.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleProblemToggle(problem.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="problem-set-management-create-modal-problem-info">
                              <div className="problem-set-management-create-modal-problem-title-wrapper">
                                <span className="problem-set-management-create-modal-problem-id-badge">
                                  #{problem.id}
                                </span>
                                <span className="problem-set-management-create-modal-problem-title">
                                  {problem.title}
                                </span>
                              </div>
                              <div className="problem-set-management-create-modal-problem-meta">
                                <span 
                                  className="problem-set-management-create-modal-problem-difficulty"
                                  style={{ 
                                    backgroundColor: getDifficultyColor(problem.difficulty) + '20',
                                    color: getDifficultyColor(problem.difficulty)
                                  }}
                                >
                                  {getDifficultyLabel(problem.difficulty)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {getTotalPages() > 1 && (
                      <div className="problem-set-management-create-modal-pagination">
                        <button
                          className="problem-set-management-create-modal-pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          이전
                        </button>
                        <span className="problem-set-management-create-modal-pagination-info">
                          {currentPage} / {getTotalPages()}
                        </span>
                        <button
                          className="problem-set-management-create-modal-pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                          disabled={currentPage === getTotalPages()}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="problem-set-management-create-modal-empty">
                    {problemSearchTerm ? '검색 결과가 없습니다.' : '사용 가능한 문제가 없습니다.'}
                  </div>
                )}
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
                    setCurrentPage(1);
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

