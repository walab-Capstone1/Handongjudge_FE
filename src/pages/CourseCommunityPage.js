import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import CourseHeader from '../components/CourseHeader';
import APIService from '../services/APIService';
import { useRecoilValue, useRecoilState } from 'recoil';
import { authState, sidebarCollapsedState } from '../recoil/atoms';
import './CourseCommunityPage.css';

const CourseCommunityPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, RESOLVED
  const [assignmentFilter, setAssignmentFilter] = useState('ALL'); // ALL, assignmentId
  const [problemFilter, setProblemFilter] = useState('ALL'); // ALL, problemId
  const [assignments, setAssignments] = useState([]);
  const [problems, setProblems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchAssignments();
  }, [sectionId]);

  useEffect(() => {
    fetchData();
  }, [sectionId, filter, assignmentFilter, problemFilter, currentPage]);

  useEffect(() => {
    if (assignmentFilter !== 'ALL') {
      fetchProblemsForAssignment(assignmentFilter);
    } else {
      setProblems([]);
      setProblemFilter('ALL');
    }
  }, [assignmentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 섹션 정보 조회
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData);

      // 질문 목록 조회
      const params = new URLSearchParams({
        sectionId: sectionId,
        page: currentPage,
        size: 20
      });
      
      if (filter !== 'ALL') {
        params.append('status', filter);
      }

      // 클라이언트 사이드 필터링 (백엔드 API가 필터를 지원하지 않는 경우)
      // 실제로는 백엔드 API에 assignmentId, problemId 파라미터를 추가하는 것이 좋음

      const response = await fetch(
        `http://localhost:8080/api/community/questions?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('질문 목록 조회 실패');

      const data = await response.json();
      setQuestions(data.data.content || []);
      setTotalPages(data.data.totalPages || 0);

      // 통계 계산 (간단히 표시용)
      const allQuestionsResponse = await fetch(
        `http://localhost:8080/api/community/questions?sectionId=${sectionId}&page=0&size=1`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        }
      );
      const allData = await allQuestionsResponse.json();
      setStats({
        total: allData.data.totalElements || 0,
        pending: 0, // 실제로는 별도 API 호출 필요
        resolved: 0
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching community data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchData();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        sectionId: sectionId,
        keyword: searchKeyword,
        page: currentPage,
        size: 20
      });

      const response = await fetch(
        `http://localhost:8080/api/community/questions/search?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          }
        }
      );

      if (!response.ok) throw new Error('검색 실패');

      const data = await response.json();
      let filteredQuestions = data.data.content || [];

      // 과제 필터링
      if (assignmentFilter !== 'ALL') {
        filteredQuestions = filteredQuestions.filter(q => 
          q.assignmentId && q.assignmentId.toString() === assignmentFilter
        );
      }

      // 문제 필터링
      if (problemFilter !== 'ALL') {
        filteredQuestions = filteredQuestions.filter(q => 
          q.problemId && q.problemId.toString() === problemFilter
        );
      }

      setQuestions(filteredQuestions);
      setTotalPages(data.data.totalPages || 0);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/sections/${sectionId}/community/${questionId}`);
  };

  const handleCreateQuestion = () => {
    navigate(`/sections/${sectionId}/community/new`);
  };

  const fetchAssignments = async () => {
    try {
      const assignmentsData = await APIService.getAssignmentsBySection(sectionId);
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchProblemsForAssignment = async (assignmentId) => {
    try {
      const response = await APIService.getAssignmentProblems(sectionId, assignmentId);
      setProblems(response.problems || []);
    } catch (err) {
      console.error('Error fetching problems:', err);
      setProblems([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (loading && questions.length === 0) {
    return (
      <div className={`course-community-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          currentMenu="community"
          isCollapsed={isSidebarCollapsed}
        />
        <div className="community-content">
          <CourseHeader 
            courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '로딩 중...'}
            onToggleSidebar={handleToggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <div className="community-body">
            <div className="loading">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`course-community-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <CourseSidebar 
          sectionId={sectionId} 
          currentMenu="community"
          isCollapsed={isSidebarCollapsed}
        />
        <div className="community-content">
          <CourseHeader 
            courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '오류'}
            onToggleSidebar={handleToggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <div className="community-body">
            <div className="error">오류: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`course-community-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        currentMenu="community"
        isCollapsed={isSidebarCollapsed}
      />
      <div className="community-content">
        <CourseHeader 
          courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '커뮤니티'}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="community-body">
          {/* 헤더 섹션 */}
          <div className="community-header">
            <div className="community-title">
              <h1>질의응답</h1>
              <p>궁금한 점을 질문하고 서로 도와주세요</p>
            </div>
            <button className="create-question-btn" onClick={handleCreateQuestion}>
              <span>+ 질문하기</span>
            </button>
          </div>

          {/* 통계 바 */}
          <div className="community-stats-bar">
            <div 
              className={`stat-filter ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              <span className="stat-label">전체</span>
              <span className="stat-count">{stats.total}</span>
            </div>
            <div 
              className={`stat-filter ${filter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setFilter('PENDING')}
            >
              <span className="stat-label">미해결</span>
              <span className="stat-count">{questions.filter(q => q.status === 'PENDING').length}</span>
            </div>
            <div 
              className={`stat-filter ${filter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setFilter('RESOLVED')}
            >
              <span className="stat-label">해결됨</span>
              <span className="stat-count">{questions.filter(q => q.status === 'RESOLVED').length}</span>
            </div>
          </div>

          {/* 필터 바 */}
          <div className="community-filter-bar">
            <div className="filter-group">
              <label className="filter-label">과제</label>
              <select
                className="filter-select"
                value={assignmentFilter}
                onChange={(e) => {
                  setAssignmentFilter(e.target.value);
                  setProblemFilter('ALL');
                  setCurrentPage(0);
                }}
              >
                <option value="ALL">전체</option>
                {assignments.map(assignment => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>

            {assignmentFilter !== 'ALL' && problems.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">문제</label>
                <select
                  className="filter-select"
                  value={problemFilter}
                  onChange={(e) => {
                    setProblemFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                >
                  <option value="ALL">전체</option>
                  {problems.map(problem => (
                    <option key={problem.id} value={problem.id}>
                      {problem.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(assignmentFilter !== 'ALL' || problemFilter !== 'ALL') && (
              <button
                className="filter-clear-btn"
                onClick={() => {
                  setAssignmentFilter('ALL');
                  setProblemFilter('ALL');
                  setProblems([]);
                  setCurrentPage(0);
                }}
              >
                필터 초기화
              </button>
            )}
          </div>

          {/* 검색 바 */}
          <div className="community-search-bar">
            <input
              type="text"
              placeholder="질문 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}>검색</button>
          </div>

          {/* 질문 목록 */}
          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="empty-state">
                <p>아직 질문이 없습니다.</p>
                <p>첫 번째 질문을 작성해보세요!</p>
              </div>
            ) : (
              questions.map(question => (
                <div 
                  key={question.id} 
                  className="question-card"
                  onClick={() => handleQuestionClick(question.id)}
                >
                  <div className="question-main">
                    <div className="question-header">
                      {question.isPinned && (
                        <span className="pin-badge">고정</span>
                      )}
                      <span className={`status-badge ${question.status.toLowerCase()}`}>
                        {question.status === 'RESOLVED' ? '해결됨' : '미해결'}
                      </span>
                      {question.isAnonymous && (
                        <span className="anonymous-badge">익명</span>
                      )}
                    </div>
                    
                    <h3 className="question-title">{question.title}</h3>
                    
                    <div className="question-meta">
                      <span className="author">{question.authorDisplayName}</span>
                      <span className="separator">·</span>
                      <span className="date">{formatDate(question.createdAt)}</span>
                      {question.assignmentTitle && (
                        <>
                          <span className="separator">·</span>
                          <span className="tag">{question.assignmentTitle}</span>
                        </>
                      )}
                      {question.problemTitle && (
                        <>
                          <span className="separator">·</span>
                          <span className="tag">{question.problemTitle}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="question-stats">
                    <span className="stat">
                      <span className="label">조회</span>
                      <span className="value">{question.viewCount}</span>
                    </span>
                    <span className="stat">
                      <span className="label">댓글</span>
                      <span className="value">{question.commentCount}</span>
                    </span>
                    <span className="stat">
                      <span className="label">추천</span>
                      <span className="value">{question.likeCount}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                이전
              </button>
              <span className="page-info">
                {currentPage + 1} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCommunityPage;

