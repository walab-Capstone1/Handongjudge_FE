import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import Alert from "../../components/Alert";
import "./ProblemSetEdit.css";

const ProblemSetEdit = () => {
  const { problemSetId } = useParams();
  const navigate = useNavigate();
  const [problemSet, setProblemSet] = useState(null);
  const [problems, setProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);
  const PROBLEMS_PER_PAGE = 10;

  useEffect(() => {
    if (problemSetId) {
      fetchProblemSet();
      fetchAllProblems();
    }
  }, [problemSetId]);

  const fetchProblemSet = async () => {
    try {
      setLoading(true);
      const response = await APIService.getProblemSet(problemSetId);
      const data = response?.data || response;
      setProblemSet(data);
      setProblems(data.problems || []);
    } catch (error) {
      console.error('문제집 조회 실패:', error);
      setAlertMessage('문제집 조회에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 5000);
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
    }
  };

  const handleAddProblems = async () => {
    if (selectedProblemIds.length === 0) {
      setAlertMessage('추가할 문제를 선택해주세요.');
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    try {
      setIsAdding(true);
      // 이미 추가된 문제 필터링
      const existingProblemIds = problems.map(p => p.id);
      const newProblemIds = selectedProblemIds.filter(id => !existingProblemIds.includes(id));

      if (newProblemIds.length === 0) {
        setAlertMessage('선택한 문제가 이미 문제집에 포함되어 있습니다.');
        setAlertType('error');
        setTimeout(() => setAlertMessage(null), 3000);
        setIsAdding(false);
        return;
      }

      // 문제 추가
      for (const problemId of newProblemIds) {
        try {
          await APIService.addProblemToSet(problemSetId, problemId);
        } catch (error) {
          console.error(`문제 ${problemId} 추가 실패:`, error);
          // 개별 실패는 무시하고 계속 진행
        }
      }

      setAlertMessage(`${newProblemIds.length}개의 문제가 성공적으로 추가되었습니다.`);
      setAlertType('success');
      setShowAddModal(false);
      setSelectedProblemIds([]);
      fetchProblemSet(); // 문제집 정보 새로고침
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('문제 추가 실패:', error);
      setAlertMessage('문제 추가에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveProblem = async (problemId) => {
    if (!window.confirm('정말로 이 문제를 문제집에서 제거하시겠습니까?')) {
      return;
    }

    try {
      setIsRemoving(true);
      await APIService.removeProblemFromSet(problemSetId, problemId);
      setAlertMessage('문제가 성공적으로 제거되었습니다.');
      setAlertType('success');
      fetchProblemSet(); // 문제집 정보 새로고침
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('문제 제거 실패:', error);
      setAlertMessage('문제 제거에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setIsRemoving(false);
    }
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

  const handleSelectAll = () => {
    const availableProblems = getAvailableProblems();
    const allSelected = availableProblems.every(p => selectedProblemIds.includes(p.id));
    
    if (allSelected) {
      // 모든 문제 선택 해제
      setSelectedProblemIds([]);
    } else {
      // 모든 문제 선택
      setSelectedProblemIds(availableProblems.map(p => p.id));
    }
  };

  const getAvailableProblems = () => {
    const existingProblemIds = problems.map(p => p.id);
    return allProblems.filter(p => !existingProblemIds.includes(p.id));
  };

  const getFilteredAvailableProblems = () => {
    const available = getAvailableProblems();
    if (!searchTerm) return available;
    return available.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPaginatedProblems = () => {
    const filtered = getFilteredAvailableProblems();
    const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredAvailableProblems().length / PROBLEMS_PER_PAGE);
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

  if (loading) {
    return (
      <TutorLayout>
        <LoadingSpinner message="문제집 정보를 불러오는 중..." />
      </TutorLayout>
    );
  }

  if (!problemSet) {
    return (
      <TutorLayout>
        <div className="problem-set-edit">
          <EmptyState
            title="문제집을 찾을 수 없습니다"
            message="존재하지 않거나 접근 권한이 없는 문제집입니다."
            actionLabel="문제집 목록으로 돌아가기"
            onAction={() => navigate('/tutor/problems/sets')}
          />
        </div>
      </TutorLayout>
    );
  }

  const availableProblems = getAvailableProblems();
  const filteredAvailable = getFilteredAvailableProblems();
  const paginatedProblems = getPaginatedProblems();
  const totalPages = getTotalPages();
  const allSelected = availableProblems.length > 0 && 
    paginatedProblems.every(p => selectedProblemIds.includes(p.id));

  return (
    <TutorLayout>
      <div className="problem-set-edit">
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
          />
        )}

        <button
          className="problem-set-edit-btn-back-to-list"
          onClick={() => navigate('/tutor/problems/sets')}
          title="문제집 목록으로 돌아가기"
        >
          ← 문제집 목록
        </button>
        <div className="problem-set-edit-title-header">
          <div className="problem-set-edit-title-left">
            <div className="problem-set-edit-title-wrapper">
              <h1 className="problem-set-edit-title">{problemSet.title}</h1>
              {problemSet.description && (
                <p className="problem-set-edit-description">{problemSet.description}</p>
              )}
            </div>
            <div className="problem-set-edit-title-stats">
              <span className="problem-set-edit-stat-badge">총 {problems.length}개 문제</span>
              <span className="problem-set-edit-stat-badge">생성일: {formatDate(problemSet.createdAt)}</span>
            </div>
          </div>
          <div className="problem-set-edit-title-right">
            <button 
              className="problem-set-edit-btn-add"
              onClick={() => setShowAddModal(true)}
            >
              + 문제 추가
            </button>
          </div>
        </div>

        <div className="problem-set-edit-content">
          {problems.length > 0 ? (
            <div className="problem-set-edit-table-container">
              <table className="problem-set-edit-table">
                <thead>
                  <tr>
                    <th className="problem-set-edit-order-cell">순서</th>
                    <th className="problem-set-edit-id-cell">ID</th>
                    <th className="problem-set-edit-title-cell">문제 제목</th>
                    <th className="problem-set-edit-difficulty-cell">난이도</th>
                    <th className="problem-set-edit-actions-cell">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem, index) => (
                    <tr key={problem.id}>
                      <td className="problem-set-edit-order-cell">
                        {index + 1}
                      </td>
                      <td className="problem-set-edit-id-cell">
                        <span className="problem-set-edit-problem-id">#{problem.id}</span>
                      </td>
                      <td className="problem-set-edit-title-cell">
                        <span className="problem-set-edit-problem-title">{problem.title}</span>
                      </td>
                      <td className="problem-set-edit-difficulty-cell">
                        <span 
                          className="problem-set-edit-difficulty-badge"
                          style={{ 
                            backgroundColor: getDifficultyColor(problem.difficulty) + '20',
                            color: getDifficultyColor(problem.difficulty)
                          }}
                        >
                          {getDifficultyLabel(problem.difficulty)}
                        </span>
                      </td>
                      <td className="problem-set-edit-actions-cell">
                        <div className="problem-set-edit-actions-inline">
                          <button
                            className="problem-set-edit-btn-view"
                            onClick={() => navigate(`/tutor/problems/${problem.id}/view`, {
                              state: { problemSetId: problemSetId }
                            })}
                            title="문제 보기"
                          >
                            보기
                          </button>
                          <button
                            className="problem-set-edit-btn-remove"
                            onClick={() => handleRemoveProblem(problem.id)}
                            disabled={isRemoving}
                            title="문제 제거"
                          >
                            제거
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="등록된 문제가 없습니다"
              message="문제를 추가하여 문제집을 구성해보세요"
              actionLabel="문제 추가"
              onAction={() => setShowAddModal(true)}
            />
          )}
        </div>

        {/* 문제 추가 모달 */}
        {showAddModal && (
          <div 
            className="problem-set-edit-modal-overlay" 
            onClick={() => {
              if (!isAdding) {
                setShowAddModal(false);
                setSelectedProblemIds([]);
                setSearchTerm('');
                setCurrentPage(1);
              }
            }}
          >
            <div 
              className="problem-set-edit-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-set-edit-modal-header">
                <h2>문제 추가</h2>
                <button 
                  className="problem-set-edit-modal-close"
                  onClick={() => {
                    if (!isAdding) {
                      setShowAddModal(false);
                      setSelectedProblemIds([]);
                      setSearchTerm('');
                      setCurrentPage(1);
                    }
                  }}
                  disabled={isAdding}
                >
                  ×
                </button>
              </div>
              <div className="problem-set-edit-modal-body">
                <div className="problem-set-edit-modal-search">
                  <input
                    type="text"
                    placeholder="문제명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="problem-set-edit-modal-search-input"
                  />
                </div>

                {filteredAvailable.length > 0 ? (
                  <>
                    <div className="problem-set-edit-modal-actions">
                      <button
                        className="problem-set-edit-modal-select-all"
                        onClick={handleSelectAll}
                      >
                        {allSelected ? '전체 해제' : '전체 선택'}
                      </button>
                      <span className="problem-set-edit-modal-selected-count">
                        {selectedProblemIds.length}개 선택됨
                      </span>
                    </div>

                    <div className="problem-set-edit-modal-problems-list">
                      {paginatedProblems.map((problem) => (
                        <div 
                          key={problem.id}
                          className={`problem-set-edit-modal-problem-item ${
                            selectedProblemIds.includes(problem.id) ? 'selected' : ''
                          }`}
                          onClick={() => handleProblemToggle(problem.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProblemIds.includes(problem.id)}
                            onChange={() => handleProblemToggle(problem.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="problem-set-edit-modal-problem-info">
                            <span className="problem-set-edit-modal-problem-title">
                              {problem.title}
                            </span>
                            <span 
                              className="problem-set-edit-modal-problem-difficulty"
                              style={{ 
                                backgroundColor: getDifficultyColor(problem.difficulty) + '20',
                                color: getDifficultyColor(problem.difficulty)
                              }}
                            >
                              {getDifficultyLabel(problem.difficulty)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="problem-set-edit-modal-pagination">
                        <button
                          className="problem-set-edit-modal-pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          이전
                        </button>
                        <span className="problem-set-edit-modal-pagination-info">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          className="problem-set-edit-modal-pagination-btn"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="problem-set-edit-modal-empty">
                    {searchTerm ? '검색 결과가 없습니다.' : '추가할 수 있는 문제가 없습니다.'}
                  </div>
                )}
              </div>
              <div className="problem-set-edit-modal-footer">
                <button 
                  className="problem-set-edit-modal-btn-cancel"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProblemIds([]);
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  disabled={isAdding}
                >
                  취소
                </button>
                <button 
                  className="problem-set-edit-modal-btn-submit"
                  onClick={handleAddProblems}
                  disabled={isAdding || selectedProblemIds.length === 0}
                >
                  {isAdding ? '추가 중...' : `추가 (${selectedProblemIds.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default ProblemSetEdit;

