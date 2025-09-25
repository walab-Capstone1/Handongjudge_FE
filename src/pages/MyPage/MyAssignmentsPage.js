import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import APIService from "../../services/APIService";
import "./MyAssignmentsPage.css";

const MyAssignmentsPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [enrolledSections, setEnrolledSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions');
  
  // 코드 모달 상태
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 데이터 조회
      const [submissionsResponse, sectionsResponse] = await Promise.all([
        APIService.getRecentSubmissions(20), // 최근 20개 제출 기록
        APIService.getEnrolledSections()
      ]);

      console.log('제출 기록 응답:', submissionsResponse);
      console.log('수강 과목 응답:', sectionsResponse);

      setSubmissions(submissionsResponse.data || submissionsResponse);
      setEnrolledSections(sectionsResponse.data || sectionsResponse);

    } catch (err) {
      console.error('과제 페이지 데이터 조회 실패:', err);
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultBadgeClass = (result) => {
    switch (result) {
      case 'correct':
        return 'result-correct';
      case 'wrong-answer':
      case 'incorrect':
        return 'result-wrong';
      case 'compile-error':
        return 'result-error';
      case 'runtime-error':
        return 'result-error';
      case 'time-limit':
        return 'result-timeout';
      default:
        return 'result-unknown';
    }
  };

  const getResultText = (result) => {
    switch (result) {
      case 'correct':
        return '정답';
      case 'wrong-answer':
      case 'incorrect':
        return '오답';
      case 'compile-error':
        return '컴파일 에러';
      case 'runtime-error':
        return '런타임 에러';
      case 'time-limit':
        return '시간 초과';
      default:
        return result || '알 수 없음';
    }
  };

  // 코드 보기 모달 열기
  const openCodeModal = async (submission) => {
    setSelectedSubmission(submission);
    setShowCodeModal(true);
    setCodeLoading(true);
    
    try {
      // 실제 API 호출로 코드 조회
      const response = await APIService.getSubmissionCode(submission.id);
      const codeData = response.data || response;
      
      // 조회된 코드 데이터로 selectedSubmission 업데이트
      setSelectedSubmission({
        ...submission,
        code: codeData.code,
        executionTime: codeData.executionTime,
        memoryUsage: codeData.memoryUsage,
        compileMessage: codeData.compileMessage
      });
      
      setCodeLoading(false);
    } catch (err) {
      console.error('코드 조회 실패:', err);
      setError('코드를 불러오는데 실패했습니다.');
      setCodeLoading(false);
      // 에러가 발생해도 모달은 열어두고 에러 메시지 표시
    }
  };

  // 모달 닫기
  const closeCodeModal = () => {
    setShowCodeModal(false);
    setSelectedSubmission(null);
    setCodeLoading(false);
  };

  const handleSectionClick = (sectionId) => {
    navigate(`/sections/${sectionId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="my-assignments-page">
          <div className="loading-container">
            <LoadingSpinner />
            <p>과제 정보를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="my-assignments-page">
          <div className="error-container">
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
            <button onClick={fetchAssignmentData} className="retry-button">
              다시 시도
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="my-assignments-page">
        <div className="page-container">
          {/* 통합 헤더 */}
          <div className="mypage-header">
            <h1 className="mypage-title">마이페이지</h1>
            <div className="mypage-navigation">
              <Link to="/mypage/info" className="mypage-nav-link">
                내 정보
              </Link>
              <Link to="/mypage/assignments" className="mypage-nav-link active">
                내 과제
              </Link>
            </div>
          </div>

          {/* 컨텐츠 탭 */}
          <div className="content-tabs">
            <button 
              className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              제출 기록
              {submissions.length > 0 && (
                <span className="tab-count">{submissions.length}</span>
              )}
            </button>
            <button 
              className={`tab-button ${activeTab === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveTab('sections')}
            >
              수강 과목
              {enrolledSections.length > 0 && (
                <span className="tab-count">{enrolledSections.length}</span>
              )}
            </button>
          </div>

          <div className="tab-content">
            {/* 제출 기록 탭 */}
            {activeTab === 'submissions' && (
              <div className="submissions-section">
                {submissions.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>제출 기록이 없습니다</h3>
                    <p>문제를 풀어보시면 여기에 제출 기록이 표시됩니다.</p>
                  </div>
                ) : (
                  <div className="submissions-list">
                    {submissions.map((submission) => (
                      <div 
                        key={submission.id} 
                        className="submission-item"
                        onClick={() => openCodeModal(submission)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="submission-header">
                          <div className="submission-title">
                            <h3>{submission.problemTitle}</h3>
                            <span className="submission-section">{submission.sectionName}</span>
                          </div>
                          <div className="submission-meta">
                            <span className={`result-badge ${getResultBadgeClass(submission.result)}`}>
                              {getResultText(submission.result)}
                            </span>
                          </div>
                        </div>
                        <div className="submission-details">
                          <div className="submission-info">
                            <span className="submission-language">
                              <strong>언어:</strong> {submission.language}
                            </span>
                            <span className="submission-date">
                              <strong>제출일:</strong> {formatDate(submission.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 수강 과목 탭 */}
            {activeTab === 'sections' && (
              <div className="sections-section">
                {enrolledSections.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>수강 중인 과목이 없습니다</h3>
                    <p>과목을 등록하시면 여기에 표시됩니다.</p>
                  </div>
                ) : (
                  <div className="sections-grid">
                    {enrolledSections.map((section) => (
                      <div 
                        key={section.sectionId} 
                        className="section-card"
                        onClick={() => handleSectionClick(section.sectionId)}
                      >
                        <div className="section-card-header">
                          <h3 className="section-course-title">{section.courseTitle}</h3>
                          <span className="section-number">{section.sectionNumber}분반</span>
                        </div>
                        <div className="section-card-content">
                          <div className="section-instructor">
                            <strong>담당교수:</strong> {section.instructorName}
                          </div>
                          <div className="section-stats">
                            <div className="stat-row">
                              <span>과제: {section.assignmentCount || 0}개</span>
                              <span>완료: {section.completedAssignments || 0}개</span>
                            </div>
                            <div className="stat-row">
                              <span>공지: {section.noticeCount || 0}개</span>
                              {section.unreadNotices > 0 && (
                                <span className="unread-notice">
                                  미읽음: {section.unreadNotices}개
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="section-card-footer">
                          <span className="view-details">자세히 보기 →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 코드 보기 모달 */}
          {showCodeModal && selectedSubmission && (
            <div className="code-modal-overlay" onClick={closeCodeModal}>
              <div className="code-modal" onClick={(e) => e.stopPropagation()}>
                <div className="code-modal-header">
                  <div className="modal-title">
                    <h3>{selectedSubmission.problemTitle}</h3>
                    <div className="modal-subtitle">
                      <span>{selectedSubmission.sectionName}</span>
                      <span className={`result-badge ${getResultBadgeClass(selectedSubmission.result)}`}>
                        {getResultText(selectedSubmission.result)}
                      </span>
                    </div>
                  </div>
                  <button className="modal-close-btn" onClick={closeCodeModal}>
                    ✕
                  </button>
                </div>
                
                <div className="code-modal-body">
                <div className="code-info">
                  <div className="code-meta">
                    <span><strong>언어:</strong> {selectedSubmission.language}</span>
                    <span><strong>제출일:</strong> {formatDate(selectedSubmission.submittedAt)}</span>
                    {selectedSubmission.executionTime && (
                      <span><strong>실행시간:</strong> {selectedSubmission.executionTime}</span>
                    )}
                    {selectedSubmission.memoryUsage && (
                      <span><strong>메모리:</strong> {selectedSubmission.memoryUsage}</span>
                    )}
                  </div>
                </div>
                  
                  <div className="code-container">
                    {codeLoading ? (
                      <div className="code-loading">
                        <LoadingSpinner />
                        <p>코드를 불러오는 중...</p>
                      </div>
                    ) : (
                      {selectedSubmission.code ? (
                        <pre className="code-content">
                          <code>{selectedSubmission.code}</code>
                        </pre>
                      ) : (
                        <div className="code-error">
                          <p>코드를 불러올 수 없습니다.</p>
                          {selectedSubmission.compileMessage && (
                            <div className="compile-message">
                              <strong>컴파일 메시지:</strong>
                              <pre>{selectedSubmission.compileMessage}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyAssignmentsPage; 