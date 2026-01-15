import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import Header from "../../components/Header";
import ReactMarkdown from "react-markdown";
import "../AdminPage/ProblemManagement.css";

const SuperAdminProblemManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProblemModal, setShowProblemModal] = useState(false);

  const userName = user?.name || user?.username || user?.email || "시스템 관리자";

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
        problemsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        problemsData = response.data;
      } else if (response?.data && !Array.isArray(response.data)) {
        problemsData = [response.data];
      } else if (response && typeof response === 'object') {
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

  if (loading) {
    return (
      <div>
        <Header userName={userName} />
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header userName={userName} />
      <div className="problem-management" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="admin-page-header">
          <h1 className="admin-page-title">문제 관리 (시스템 관리자)</h1>
          <div className="admin-header-actions">
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/super-admin')}
              style={{ marginRight: '10px' }}
            >
              대시보드로
            </button>
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/admin/problems/create')}
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
                          onClick={() => navigate(`/admin/problems/${problem.id}/edit`)}
                        >
                          수정
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="admin-table-empty">
              <p>등록된 문제가 없습니다.</p>
            </div>
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
      </div>
    </div>
  );
};

export default SuperAdminProblemManagement;

