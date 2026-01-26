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
              onClick={() => {
                setCurrentStep(1);
                setShowCreateModal(true);
                setShowProblemSelectModal(false);
              }}
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

        {/* 문제집 생성 모달 - 기본 정보 */}
        {showCreateModal && currentStep === 1 && (
          <div 
            className="admin-modal-overlay" 
            onClick={() => {
              if (!isCreating) {
                setShowCreateModal(false);
                setNewSetTitle('');
                setNewSetDescription('');
                setCurrentStep(1);
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
                      setCurrentStep(1);
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
                    setCurrentStep(1);
                  }}
                  disabled={isCreating}
                >
                  취소
                </button>
                <button 
                  className="admin-btn-primary"
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
            className="admin-modal-overlay" 
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
              className="admin-modal-content admin-problem-modal admin-problem-modal-large" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2>문제 선택 - {newSetTitle}</h2>
                <button 
                  className="admin-modal-close"
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
              
              <div className="admin-problem-modal-body">
                <div className="admin-problem-search-section">
                  <input
                    type="text"
                    placeholder="문제명 또는 ID로 검색..."
                    value={problemSearchTerm}
                    onChange={(e) => setProblemSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                {filteredProblems.length > 0 && (
                  <div className="admin-problem-selection-header">
                    <label className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedProblemIds.length === filteredProblems.length && filteredProblems.length > 0}
                        onChange={handleSelectAllProblems}
                      />
                      <span>전체 선택</span>
                    </label>
                    <span className="admin-item-count">
                      {selectedProblemIds.length} / {filteredProblems.length}개 선택됨
                    </span>
                  </div>
                )}

                <div className="admin-available-problems-grid">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                      <div key={problem.id} className="admin-problem-card">
                        <div className="admin-problem-card-header">
                          <input
                            type="checkbox"
                            checked={selectedProblemIds.includes(problem.id)}
                            onChange={() => handleProblemToggle(problem.id)}
                            className="admin-problem-checkbox"
                          />
                        </div>
                        <div className="admin-problem-card-body">
                          <h4 className="admin-problem-card-title">{problem.title}</h4>
                          <div className="admin-problem-card-meta-row">
                            <span className="admin-problem-card-date">
                              ID: #{problem.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="admin-no-available-problems">
                      <p>{problemSearchTerm ? '검색 결과가 없습니다.' : '사용 가능한 문제가 없습니다.'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-modal-footer">
                <div className="admin-footer-actions">
                  <button 
                    type="button"
                    className="admin-btn-secondary"
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
                    type="button"
                    className="admin-btn-secondary"
                    onClick={handleSkipProblemSelect}
                    disabled={isCreating}
                  >
                    건너뛰기
                  </button>
                  <button 
                    type="button"
                    className="admin-btn-secondary"
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
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => handleCreateSetWithProblems()}
                    disabled={isCreating}
                  >
                    {isCreating ? '생성 중...' : `생성${selectedProblemIds.length > 0 ? ` (${selectedProblemIds.length}개 문제)` : ''}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProblemSetManagement;

