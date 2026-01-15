import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import APIService from "../../services/APIService";
import Header from "../../components/Header";
import "../AdminPage/ProblemManagement.css";

const SuperAdminSubmissionManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(50);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);

  const userName = user?.name || user?.username || user?.email || "시스템 관리자";

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await APIService.getAllSubmissionsForSuperAdmin(currentPage, pageSize);
      console.log('제출 목록 API 응답:', response);
      
      // 응답 구조 확인: response.data.data 또는 response.data
      const submissionsData = response?.data?.data || response?.data || response;
      const total = response?.data?.totalCount || response?.totalCount || 0;
      
      if (Array.isArray(submissionsData)) {
        setSubmissions(submissionsData);
        setTotalCount(total);
      } else {
        console.warn('제출 데이터가 배열이 아닙니다:', submissionsData);
        setSubmissions([]);
        setTotalCount(0);
      }
      setLoading(false);
    } catch (error) {
      console.error('제출 목록 조회 실패:', error);
      setSubmissions([]);
      setTotalCount(0);
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.problemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.sectionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.result?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getResultColor = (result) => {
    if (!result) return '#636e72';
    switch (result.toUpperCase()) {
      case 'AC':
      case 'ACCEPTED':
        return '#00b894';
      case 'WA':
      case 'WRONG_ANSWER':
        return '#e17055';
      case 'TLE':
      case 'TIME_LIMIT_EXCEEDED':
        return '#fdcb6e';
      case 'MLE':
      case 'MEMORY_LIMIT_EXCEEDED':
        return '#6c5ce7';
      case 'CE':
      case 'COMPILATION_ERROR':
        return '#a29bfe';
      default:
        return '#636e72';
    }
  };

  const getResultLabel = (result) => {
    if (!result) return '-';
    switch (result.toUpperCase()) {
      case 'AC':
      case 'ACCEPTED':
        return '정답';
      case 'WA':
      case 'WRONG_ANSWER':
        return '오답';
      case 'TLE':
      case 'TIME_LIMIT_EXCEEDED':
        return '시간 초과';
      case 'MLE':
      case 'MEMORY_LIMIT_EXCEEDED':
        return '메모리 초과';
      case 'CE':
      case 'COMPILATION_ERROR':
        return '컴파일 에러';
      default:
        return result;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && currentPage === 0) {
    return (
      <div>
        <Header userName={userName} />
        <div className="admin-loading-container" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="admin-loading-spinner"></div>
          <p>제출 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header userName={userName} />
      <div className="problem-management" style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="admin-page-header">
          <h1 className="admin-page-title">제출 레코드 관리 (시스템 관리자)</h1>
          <div className="admin-header-actions">
            <button 
              className="admin-btn-primary"
              onClick={() => navigate('/super-admin')}
              style={{ marginRight: '10px' }}
            >
              대시보드로
            </button>
          </div>
        </div>

        <div className="admin-filters-section">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="사용자명, 이메일, 문제명, 수업명, 결과로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <div style={{ marginTop: '10px', color: '#6b7280', fontSize: '14px' }}>
            총 {totalCount.toLocaleString()}건의 제출 기록
          </div>
        </div>

        <div className="admin-problems-table-container">
          {filteredSubmissions.length > 0 ? (
            <>
              <table className="admin-problems-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th style={{ width: '120px' }}>사용자</th>
                    <th style={{ width: '200px' }}>문제</th>
                    <th style={{ width: '200px' }}>수업</th>
                    <th style={{ width: '100px' }}>언어</th>
                    <th style={{ width: '100px' }}>결과</th>
                    <th style={{ width: '180px' }}>제출 시간</th>
                    <th style={{ width: '100px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.id}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '500' }}>{submission.userName || '-'}</span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            {submission.userEmail || '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span 
                          style={{ cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => navigate(`/admin/problems/${submission.problemId}/edit`)}
                        >
                          {submission.problemTitle || '-'}
                        </span>
                      </td>
                      <td>{submission.sectionName || '-'}</td>
                      <td>{submission.language || '-'}</td>
                      <td>
                        <span 
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: getResultColor(submission.result),
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {getResultLabel(submission.result)}
                        </span>
                      </td>
                      <td>{formatDate(submission.submittedAt)}</td>
                      <td>
                        <div className="admin-problem-actions-inline">
                          <button 
                            className="admin-btn-table-action admin-btn-edit"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowCodeModal(true);
                            }}
                          >
                            코드 보기
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '10px',
                  marginTop: '20px'
                }}>
                  <button
                    className="admin-btn-primary"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    style={{ padding: '8px 16px' }}
                  >
                    이전
                  </button>
                  <span style={{ padding: '0 20px' }}>
                    {currentPage + 1} / {totalPages} 페이지
                  </span>
                  <button
                    className="admin-btn-primary"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    style={{ padding: '8px 16px' }}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="admin-table-empty">
              <p>
                {searchTerm 
                  ? '검색 조건에 맞는 제출 기록이 없습니다.' 
                  : '등록된 제출 기록이 없습니다.'
                }
              </p>
            </div>
          )}
        </div>

        {/* 코드 보기 모달 */}
        {showCodeModal && selectedSubmission && (
          <div 
            className="admin-modal-overlay" 
            onClick={() => {
              setShowCodeModal(false);
              setSelectedSubmission(null);
            }}
          >
            <div 
              className="admin-modal-content admin-modal-content-large" 
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '900px' }}
            >
              <div className="admin-modal-header">
                <h2>제출 코드 - {selectedSubmission.problemTitle}</h2>
                <button 
                  className="admin-modal-close"
                  onClick={() => {
                    setShowCodeModal(false);
                    setSelectedSubmission(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div>
                      <strong>사용자:</strong> {selectedSubmission.userName} ({selectedSubmission.userEmail})
                    </div>
                    <div>
                      <strong>언어:</strong> {selectedSubmission.language}
                    </div>
                    <div>
                      <strong>결과:</strong> 
                      <span 
                        style={{
                          marginLeft: '8px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: getResultColor(selectedSubmission.result),
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {getResultLabel(selectedSubmission.result)}
                      </span>
                    </div>
                    <div>
                      <strong>제출 시간:</strong> {formatDate(selectedSubmission.submittedAt)}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  backgroundColor: '#1e1e1e', 
                  color: '#d4d4d4',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedSubmission.code || '코드가 없습니다.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSubmissionManagement;

