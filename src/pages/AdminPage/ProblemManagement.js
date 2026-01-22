import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import ReactMarkdown from "react-markdown";
import Alert from "../../components/Alert";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import "./ProblemManagement.css";

const ProblemManagement = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [problemToCopy, setProblemToCopy] = useState(null);
  const [copyTitle, setCopyTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllProblems();
      
      // 응답 형식에 따라 데이터 추출
      let problemsData = [];
      if (Array.isArray(response)) {
        // 배열로 직접 반환된 경우
        problemsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        // { data: [...] } 형식
        problemsData = response.data;
      } else if (response?.data && !Array.isArray(response.data)) {
        // { data: {...} } 형식 (단일 객체)
        problemsData = [response.data];
      } else if (response && typeof response === 'object') {
        // 객체인 경우 배열로 변환 시도
        problemsData = Object.values(response);
      }
      
      setProblems(problemsData);
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleDeleteClick = (problem) => {
    setProblemToDelete(problem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!problemToDelete) return;
    
    try {
      setIsDeleting(true);
      await APIService.deleteProblem(problemToDelete.id);
      setAlertMessage('문제가 성공적으로 삭제되었습니다.');
      setAlertType('success');
      setShowDeleteModal(false);
      setProblemToDelete(null);
      fetchProblems(); // 목록 새로고침
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('문제 삭제 실패:', error);
      setAlertMessage('문제 삭제에 실패했습니다. ' + (error.message || ''));
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyClick = (problem) => {
    setProblemToCopy(problem);
    setCopyTitle(`${problem.title} (복사본)`);
    setShowCopyModal(true);
  };

  const handleCopyConfirm = async () => {
    if (!problemToCopy) return;
    
    try {
      setIsCopying(true);
      const response = await APIService.copyProblem(problemToCopy.id, copyTitle);
      setAlertMessage('문제가 성공적으로 복사되었습니다.');
      setAlertType('success');
      setShowCopyModal(false);
      setProblemToCopy(null);
      setCopyTitle('');
      fetchProblems(); // 목록 새로고침
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error('문제 복사 실패:', error);
      setAlertMessage('문제 복사에 실패했습니다. ' + (error.message || ''));
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 5000);
    } finally {
      setIsCopying(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="문제 목록을 불러오는 중..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="problem-management">
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
          />
        )}
        <div className="admin-page-header">
          <h1 className="admin-page-title">문제 관리</h1>
          <div className="admin-header-actions">
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/tutor/problems/create')}
            >
              새 문제 만들기
            </button>
          </div>
        </div>

        <div className="admin-filters-section">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="문제명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>

        <div className="admin-problems-table-container">
          {filteredProblems.length > 0 ? (
            <table className="admin-problems-table">
              <thead>
                <tr>
                  <th className="admin-problem-title-cell">문제 제목</th>
                  <th className="admin-problem-meta-cell">시간 제한</th>
                  <th className="admin-problem-meta-cell">메모리 제한</th>
                  <th className="admin-problem-meta-cell">생성일</th>
                  <th className="admin-problem-actions-cell">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr key={problem.id}>
                    <td className="admin-problem-title-cell">
                      <div className="admin-problem-title-wrapper">
                        <span 
                          className="admin-problem-title admin-problem-title-clickable"
                          onClick={() => {
                            setSelectedProblem(problem);
                            setShowProblemModal(true);
                          }}
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {problem.title}
                        </span>
                      </div>
                    </td>
                    <td className="admin-problem-meta-cell">
                      {problem.timeLimit ? `${problem.timeLimit}초` : '-'}
                    </td>
                    <td className="admin-problem-meta-cell">
                      {problem.memoryLimit ? `${problem.memoryLimit}MB` : '-'}
                    </td>
                    <td className="admin-problem-meta-cell">
                      {formatDate(problem.createdAt)}
                    </td>
                    <td className="admin-problem-actions-cell">
                      <div className="admin-problem-actions-inline">
                        <button 
                          className="admin-btn-table-action admin-btn-edit"
                          onClick={() => navigate(`/tutor/problems/${problem.id}/edit`)}
                        >
                          수정
                        </button>
                        <button 
                          className="admin-btn-table-action admin-btn-copy"
                          onClick={() => handleCopyClick(problem)}
                          style={{ marginLeft: '8px' }}
                        >
                          복사
                        </button>
                        <button 
                          className="admin-btn-table-action admin-btn-delete"
                          onClick={() => handleDeleteClick(problem)}
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
            <EmptyState
              title="등록된 문제가 없습니다"
              message="새로운 문제를 만들어보세요"
              actionLabel="새 문제 만들기"
              onAction={() => navigate('/tutor/problems/create')}
            />
          )}
        </div>

        {/* 문제 설명 모달 */}
        {showProblemModal && selectedProblem && (
          <div 
            className="admin-modal-overlay" 
            onClick={() => {
              setShowProblemModal(false);
              setSelectedProblem(null);
            }}
          >
            <div 
              className="admin-modal-content admin-modal-content-large" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2>{selectedProblem.title}</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    setShowProblemModal(false);
                    setSelectedProblem(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="problem-description-modal-content">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => (
                        <h1 className="problem-description-h1" {...props} />
                      ),
                      h2: ({node, ...props}) => (
                        <h2 className="problem-description-h2" {...props} />
                      ),
                      h3: ({node, ...props}) => (
                        <h3 className="problem-description-h3" {...props} />
                      ),
                      code: ({node, inline, className, children, ...props}) => {
                        return inline ? (
                          <code className="problem-description-inline-code" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="problem-description-code-block">
                            <code {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      p: ({node, ...props}) => (
                        <p className="problem-description-paragraph" {...props} />
                      ),
                    }}
                  >
                    {selectedProblem.description || '*문제 설명이 없습니다.*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteModal && problemToDelete && (
          <div 
            className="admin-modal-overlay" 
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteModal(false);
                setProblemToDelete(null);
              }
            }}
          >
            <div 
              className="admin-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2>문제 삭제 확인</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    if (!isDeleting) {
                      setShowDeleteModal(false);
                      setProblemToDelete(null);
                    }
                  }}
                  disabled={isDeleting}
                >
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <p>정말로 다음 문제를 삭제하시겠습니까?</p>
                <p style={{ fontWeight: 'bold', marginTop: '8px' }}>{problemToDelete.title}</p>
                <p style={{ color: '#e74c3c', marginTop: '16px', fontSize: '14px' }}>
                  ⚠️ 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button 
                  className="admin-btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProblemToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  취소
                </button>
                <button 
                  className="admin-btn-danger"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 복사 모달 */}
        {showCopyModal && problemToCopy && (
          <div 
            className="admin-modal-overlay" 
            onClick={() => {
              if (!isCopying) {
                setShowCopyModal(false);
                setProblemToCopy(null);
                setCopyTitle('');
              }
            }}
          >
            <div 
              className="admin-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h2>문제 복사</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    if (!isCopying) {
                      setShowCopyModal(false);
                      setProblemToCopy(null);
                      setCopyTitle('');
                    }
                  }}
                  disabled={isCopying}
                >
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <p>다음 문제를 복사합니다:</p>
                <p style={{ fontWeight: 'bold', marginTop: '8px', marginBottom: '16px' }}>
                  {problemToCopy.title}
                </p>
                <div className="admin-form-group">
                  <label htmlFor="copy-title">새 문제 제목</label>
                  <input
                    id="copy-title"
                    type="text"
                    value={copyTitle}
                    onChange={(e) => setCopyTitle(e.target.value)}
                    className="admin-form-input"
                    placeholder="복사본 문제 제목을 입력하세요"
                    disabled={isCopying}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  className="admin-btn-secondary"
                  onClick={() => {
                    setShowCopyModal(false);
                    setProblemToCopy(null);
                    setCopyTitle('');
                  }}
                  disabled={isCopying}
                >
                  취소
                </button>
                <button 
                  className="admin-btn-primary"
                  onClick={handleCopyConfirm}
                  disabled={isCopying || !copyTitle.trim()}
                >
                  {isCopying ? '복사 중...' : '복사'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProblemManagement;

