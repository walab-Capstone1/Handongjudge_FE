import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
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
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [problemUsage, setProblemUsage] = useState({ assignments: [], problemSets: [], quizzes: [] });
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [problemForUsage, setProblemForUsage] = useState(null);
  const [filterUsageStatus, setFilterUsageStatus] = useState('ALL'); // 'ALL', 'USED', 'UNUSED'
  const [filterDifficulty, setFilterDifficulty] = useState('ALL'); // 'ALL', '1', '2', '3', etc.
  const [filterCourse, setFilterCourse] = useState('ALL'); // 'ALL', sectionId
  const [filterAssignment, setFilterAssignment] = useState('ALL'); // 'ALL', assignmentId
  const [filterTag, setFilterTag] = useState('ALL'); // 'ALL', tagName
  const [sections, setSections] = useState([]); // 수업 목록
  const [assignments, setAssignments] = useState([]); // 과제 목록 (선택된 수업의)
  const [problemUsageMap, setProblemUsageMap] = useState({}); // 문제별 사용 현황 맵 { problemId: [{ sectionId, assignmentId, ... }] }
  const [loadingUsageData, setLoadingUsageData] = useState(false);
  const [availableTags, setAvailableTags] = useState([]); // 사용 가능한 태그 목록
  const [openMoreMenu, setOpenMoreMenu] = useState(null); // 더보기 메뉴 열림 상태

  useEffect(() => {
    fetchProblems();
    fetchSections();
  }, []);

  useEffect(() => {
    if (filterUsageStatus === 'USED' && problems.length > 0) {
      fetchProblemUsageData();
    } else {
      setProblemUsageMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUsageStatus, problems.length]);

  useEffect(() => {
    if (filterCourse !== 'ALL') {
      fetchAssignmentsForSection(filterCourse);
    } else {
      setAssignments([]);
      setFilterAssignment('ALL');
    }
  }, [filterCourse]);

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
      
      // 모든 문제에서 태그 추출하여 고유 태그 목록 생성
      const allTags = new Set();
      problemsData.forEach(problem => {
        if (problem.tags) {
          // tags가 배열인 경우
          if (Array.isArray(problem.tags)) {
            problem.tags.forEach(tag => {
              if (tag && tag.trim()) {
                allTags.add(tag.trim());
              }
            });
          } 
          // tags가 문자열인 경우 (JSON 문자열일 수 있음)
          else if (typeof problem.tags === 'string') {
            try {
              const parsedTags = JSON.parse(problem.tags);
              if (Array.isArray(parsedTags)) {
                parsedTags.forEach(tag => {
                  if (tag && tag.trim()) {
                    allTags.add(tag.trim());
                  }
                });
              } else if (parsedTags && parsedTags.trim()) {
                allTags.add(parsedTags.trim());
              }
            } catch (e) {
              // JSON 파싱 실패 시 일반 문자열로 처리
              if (problem.tags.trim()) {
                allTags.add(problem.tags.trim());
              }
            }
          }
        }
      });
      setAvailableTags(Array.from(allTags).sort());
    } catch (error) {
      console.error('문제 목록 조회 실패:', error);
      setProblems([]);
      setAvailableTags([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await APIService.getInstructorDashboard();
      const sectionsData = response?.data || response || [];
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
    } catch (error) {
      console.error('수업 목록 조회 실패:', error);
      setSections([]);
    }
  };

  const fetchAssignmentsForSection = async (sectionId) => {
    try {
      const response = await APIService.getAssignmentsBySection(sectionId);
      const assignmentsData = response?.data || response || [];
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      console.error('과제 목록 조회 실패:', error);
      setAssignments([]);
    }
  };

  const fetchProblemUsageData = async () => {
    if (problems.length === 0) return;
    
    try {
      setLoadingUsageData(true);
      const usageMap = {};
      
      // 사용 중인 문제들에 대해서만 사용 현황 조회
      const usedProblems = problems.filter(p => p.isUsed === true);
      
      await Promise.all(
        usedProblems.map(async (problem) => {
          try {
            const response = await APIService.getProblemAssignments(problem.id);
            const assignments = Array.isArray(response) ? response : (response?.data || []);
            usageMap[problem.id] = assignments;
          } catch (error) {
            console.error(`문제 ${problem.id} 사용 현황 조회 실패:`, error);
            usageMap[problem.id] = [];
          }
        })
      );
      
      setProblemUsageMap(usageMap);
    } catch (error) {
      console.error('문제 사용 현황 조회 실패:', error);
      setProblemUsageMap({});
    } finally {
      setLoadingUsageData(false);
    }
  };

  // 문제의 태그를 추출하는 헬퍼 함수
  const getProblemTags = (problem) => {
    if (!problem.tags) return [];
    
    // tags가 배열인 경우
    if (Array.isArray(problem.tags)) {
      return problem.tags.map(tag => tag && tag.trim()).filter(Boolean);
    }
    
    // tags가 문자열인 경우 (JSON 문자열일 수 있음)
    if (typeof problem.tags === 'string') {
      try {
        const parsedTags = JSON.parse(problem.tags);
        if (Array.isArray(parsedTags)) {
          return parsedTags.map(tag => tag && tag.trim()).filter(Boolean);
        } else if (parsedTags && parsedTags.trim()) {
          return [parsedTags.trim()];
        }
      } catch (e) {
        // JSON 파싱 실패 시 일반 문자열로 처리
        if (problem.tags.trim()) {
          return [problem.tags.trim()];
        }
      }
    }
    
    return [];
  };

  const filteredProblems = problems.filter(problem => {
    // 검색어 필터
    const matchesSearch = problem.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 사용 여부 필터
    let matchesUsage = true;
    if (filterUsageStatus === 'USED') {
      matchesUsage = problem.isUsed === true;
    } else if (filterUsageStatus === 'UNUSED') {
      matchesUsage = !problem.isUsed;
    }
    
    // 난이도 필터
    let matchesDifficulty = true;
    if (filterDifficulty !== 'ALL') {
      matchesDifficulty = problem.difficulty === filterDifficulty;
    }
    
    // 태그 필터
    let matchesTag = true;
    if (filterTag !== 'ALL') {
      const problemTags = getProblemTags(problem);
      matchesTag = problemTags.includes(filterTag);
    }
    
    // 수업/과제 필터 (사용 중인 문제에만 적용)
    let matchesCourseAndAssignment = true;
    if (filterUsageStatus === 'USED' && problem.isUsed === true) {
      const usageList = problemUsageMap[problem.id] || [];
      
      if (filterCourse !== 'ALL' || filterAssignment !== 'ALL') {
        matchesCourseAndAssignment = usageList.some(usage => {
          const matchesCourse = filterCourse === 'ALL' || usage.sectionId === parseInt(filterCourse);
          const matchesAssignment = filterAssignment === 'ALL' || usage.assignmentId === parseInt(filterAssignment);
          return matchesCourse && matchesAssignment;
        });
      }
    }
    
    return matchesSearch && matchesUsage && matchesDifficulty && matchesTag && matchesCourseAndAssignment;
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

  const handleUsageClick = async (problem) => {
    setProblemForUsage(problem);
    setShowUsageModal(true);
    setLoadingUsage(true);
    setProblemUsage([]);
    
    try {
      const response = await APIService.getProblemUsage(problem.id);
      const usage = response?.data || response || {};
      setProblemUsage(usage);
    } catch (error) {
      console.error('문제 사용 현황 조회 실패:', error);
      setAlertMessage('문제 사용 현황 조회에 실패했습니다. ' + (error.message || ''));
      setAlertType('error');
      setTimeout(() => setAlertMessage(null), 5000);
      setProblemUsage({});
    } finally {
      setLoadingUsage(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <TutorLayout>
        <LoadingSpinner message="문제 목록을 불러오는 중..." />
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="problem-management">
        {alertMessage && (
          <Alert 
            type={alertType} 
            message={alertMessage}
            onClose={() => setAlertMessage(null)}
          />
        )}
        <div className="problem-management-title-header">
          <div className="problem-management-title-left">
            <h1 className="problem-management-title">문제 관리</h1>
            <div className="problem-management-title-stats">
              <span className="problem-management-stat-badge">총 {problems.length}개 문제</span>
            </div>
          </div>
          <div className="problem-management-title-right">
            <button 
              className="problem-management-btn-create"
              onClick={() => navigate('/tutor/problems/create')}
            >
              + 새 문제 만들기
            </button>
          </div>
        </div>

        <div className="problem-management-filters-section">
          <div className="problem-management-search-box">
            <input
              type="text"
              placeholder="문제명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="problem-management-search-input"
            />
          </div>
          <div className="problem-management-filter-group">
            <select
              id="filter-usage"
              value={filterUsageStatus}
              onChange={(e) => {
                setFilterUsageStatus(e.target.value);
                if (e.target.value !== 'USED') {
                  setFilterCourse('ALL');
                  setFilterAssignment('ALL');
                }
              }}
              className="problem-management-filter-select"
            >
              <option value="ALL">전체 사용 여부</option>
              <option value="USED">사용 중</option>
              <option value="UNUSED">미사용</option>
            </select>
          </div>
          {filterUsageStatus === 'USED' && (
            <>
              <div className="problem-management-filter-group">
                <select
                  id="filter-course"
                  value={filterCourse}
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setFilterAssignment('ALL');
                  }}
                  className="problem-management-filter-select"
                  disabled={loadingUsageData}
                >
                  <option value="ALL">전체 수업</option>
                  {sections.map((section) => (
                    <option key={section.sectionId} value={section.sectionId}>
                      {section.courseTitle} ({section.year}년 {section.semester === 'SPRING' ? '1학기' : section.semester === 'SUMMER' ? '여름학기' : section.semester === 'FALL' ? '2학기' : '겨울학기'} {section.sectionNumber ? `- ${section.sectionNumber}분반` : ''})
                    </option>
                  ))}
                </select>
              </div>
              {filterCourse !== 'ALL' && (
                <div className="problem-management-filter-group">
                  <select
                    id="filter-assignment"
                    value={filterAssignment}
                    onChange={(e) => setFilterAssignment(e.target.value)}
                    className="problem-management-filter-select"
                    disabled={loadingUsageData}
                  >
                    <option value="ALL">전체 과제</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.assignmentNumber && `${assignment.assignmentNumber}. `}
                        {assignment.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <div className="problem-management-filter-group">
            <select
              id="filter-difficulty"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="problem-management-filter-select"
            >
              <option value="ALL">전체 난이도</option>
              <option value="1">1 (쉬움)</option>
              <option value="2">2 (보통)</option>
              <option value="3">3 (어려움)</option>
              <option value="4">4 (매우 어려움)</option>
              <option value="5">5 (극도 어려움)</option>
            </select>
          </div>
          {availableTags.length > 0 && (
            <div className="problem-management-filter-group">
              <select
                id="filter-tag"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="problem-management-filter-select"
              >
                <option value="ALL">전체 태그</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="problem-management-table-container">
          {filteredProblems.length > 0 ? (
            <table className="problem-management-table">
              <thead>
                <tr>
                  <th className="problem-management-id-cell">ID</th>
                  <th className="problem-management-title-cell">문제 제목</th>
                  <th className="problem-management-meta-cell">시간 제한</th>
                  <th className="problem-management-meta-cell">메모리 제한</th>
                  <th className="problem-management-meta-cell">생성일</th>
                  <th className="problem-management-actions-cell">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr key={problem.id}>
                    <td className="problem-management-id-cell">
                      <span className="problem-management-id-text">
                        #{problem.id}
                      </span>
                    </td>
                    <td className="problem-management-title-cell">
                      <div className="problem-management-title-wrapper">
                        <div className="problem-management-title-content">
                          <div className="problem-management-title-row">
                            <span 
                              className="problem-management-title-text problem-management-title-clickable"
                              onClick={() => {
                                setSelectedProblem(problem);
                                setShowProblemModal(true);
                              }}
                            >
                              {problem.title}
                            </span>
                            {problem.isUsed && (
                              <span 
                                className="problem-management-usage-badge"
                                title={`${problem.assignmentCount || 0}개 과제에서 사용 중`}
                              >
                                사용 중
                                {problem.assignmentCount > 0 && (
                                  <span className="problem-management-usage-count"> ({problem.assignmentCount})</span>
                                )}
                              </span>
                            )}
                          </div>
                          {/* 태그 표시 */}
                          {getProblemTags(problem).length > 0 && (
                            <div className="problem-management-tags">
                              {getProblemTags(problem).map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="problem-management-tag"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="problem-management-meta-cell">
                      {problem.timeLimit ? `${problem.timeLimit}초` : '-'}
                    </td>
                    <td className="problem-management-meta-cell">
                      {problem.memoryLimit ? `${problem.memoryLimit}MB` : '-'}
                    </td>
                    <td className="problem-management-meta-cell">
                      {formatDate(problem.createdAt)}
                    </td>
                    <td className="problem-management-actions-cell">
                      <div className="problem-management-actions-inline">
                        <div className="tutor-assignment-primary-actions">
                          <button 
                            className="tutor-btn-table-action tutor-btn-edit"
                            onClick={() => navigate(`/tutor/problems/${problem.id}/edit`)}
                          >
                            수정
                          </button>
                          <button 
                            className="tutor-btn-table-action tutor-btn-secondary-action"
                            onClick={() => handleCopyClick(problem)}
                          >
                            복사
                          </button>
                          {problem.isUsed && (
                            <button 
                              className="tutor-btn-table-action tutor-btn-secondary-action"
                              onClick={() => handleUsageClick(problem)}
                              title="사용 현황 보기"
                            >
                              사용 현황
                            </button>
                          )}
                        </div>
                        <div className="tutor-assignment-secondary-actions">
                          <div className="tutor-secondary-actions-layer">
                            <div className="tutor-more-menu">
                              <button 
                                className="tutor-btn-table-action tutor-btn-secondary-action tutor-btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMoreMenu(openMoreMenu === problem.id ? null : problem.id);
                                }}
                                title="더보기"
                              >
                                ⋯
                              </button>
                              {openMoreMenu === problem.id && (
                                <div className="tutor-more-dropdown">
                                  <button 
                                    className="tutor-btn-text-small tutor-delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(problem);
                                      setOpenMoreMenu(null);
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
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
            className="problem-management-modal-overlay" 
            onClick={() => {
              setShowProblemModal(false);
              setSelectedProblem(null);
            }}
          >
            <div 
              className="problem-management-modal-content problem-management-modal-content-large" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-management-modal-header">
                <h2>{selectedProblem.title}</h2>
                <button 
                  className="problem-management-modal-close"
                  onClick={() => {
                    setShowProblemModal(false);
                    setSelectedProblem(null);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="problem-management-modal-body">
                <div className="problem-management-description-content">
                  {/* 태그 표시 */}
                  {getProblemTags(selectedProblem).length > 0 && (
                    <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {getProblemTags(selectedProblem).map((tag, idx) => (
                        <span 
                          key={idx} 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.4rem 0.8rem',
                            background: '#eef2ff',
                            color: '#667eea',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
            className="problem-management-modal-overlay" 
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteModal(false);
                setProblemToDelete(null);
              }
            }}
          >
            <div 
              className="problem-management-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-management-modal-header">
                <h2>문제 삭제 확인</h2>
                <button 
                  className="problem-management-modal-close"
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
              <div className="problem-management-modal-body">
                <p>정말로 다음 문제를 삭제하시겠습니까?</p>
                <p style={{ fontWeight: 'bold', marginTop: '8px' }}>{problemToDelete.title}</p>
                <p style={{ color: '#e74c3c', marginTop: '16px', fontSize: '14px' }}>
                  ⚠️ 이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="problem-management-modal-footer">
                <button 
                  className="problem-management-btn-cancel"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProblemToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  취소
                </button>
                <button 
                  className="problem-management-btn-danger"
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
            className="problem-management-modal-overlay" 
            onClick={() => {
              if (!isCopying) {
                setShowCopyModal(false);
                setProblemToCopy(null);
                setCopyTitle('');
              }
            }}
          >
            <div 
              className="problem-management-modal-content" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-management-modal-header">
                <h2>문제 복사</h2>
                <button 
                  className="problem-management-modal-close"
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
              <div className="problem-management-modal-body">
                <p>다음 문제를 복사합니다:</p>
                <p style={{ fontWeight: 'bold', marginTop: '8px', marginBottom: '16px' }}>
                  {problemToCopy.title}
                </p>
                <div className="problem-management-form-group">
                  <label htmlFor="copy-title">새 문제 제목</label>
                  <input
                    id="copy-title"
                    type="text"
                    value={copyTitle}
                    onChange={(e) => setCopyTitle(e.target.value)}
                    className="problem-management-form-input"
                    placeholder="복사본 문제 제목을 입력하세요"
                    disabled={isCopying}
                  />
                </div>
              </div>
              <div className="problem-management-modal-footer">
                <button 
                  className="problem-management-btn-cancel"
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
                  className="problem-management-btn-submit"
                  onClick={handleCopyConfirm}
                  disabled={isCopying || !copyTitle.trim()}
                >
                  {isCopying ? '복사 중...' : '복사'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 사용 현황 모달 */}
        {showUsageModal && problemForUsage && (
          <div 
            className="problem-management-modal-overlay" 
            onClick={() => {
              if (!loadingUsage) {
                setShowUsageModal(false);
                setProblemForUsage(null);
                setProblemUsage([]);
              }
            }}
          >
            <div 
              className="problem-management-modal-content problem-management-modal-content-large" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="problem-management-modal-header">
                <h2>문제 사용 현황</h2>
                <button 
                  className="problem-management-modal-close"
                  onClick={() => {
                    if (!loadingUsage) {
                      setShowUsageModal(false);
                      setProblemForUsage(null);
                      setProblemUsage([]);
                    }
                  }}
                  disabled={loadingUsage}
                >
                  ×
                </button>
              </div>
              <div className="problem-management-modal-body">
                <p style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '16px' }}>
                  {problemForUsage.title}
                </p>
                
                {loadingUsage ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <LoadingSpinner message="사용 현황을 불러오는 중..." />
                  </div>
                ) : (!problemUsage.assignments || problemUsage.assignments.length === 0) && 
                    (!problemUsage.problemSets || problemUsage.problemSets.length === 0) && 
                    (!problemUsage.quizzes || problemUsage.quizzes.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>이 문제는 현재 어떤 곳에서도 사용되지 않습니다.</p>
                  </div>
                ) : (
                  <div>
                    {/* 과제 사용 현황 */}
                    {problemUsage.assignments && problemUsage.assignments.length > 0 && (
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                          과제 ({problemUsage.assignments.length}개)
                        </h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e1e8ed', backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>수업</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>과제</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>시작일</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>종료일</th>
                              </tr>
                            </thead>
                            <tbody>
                              {problemUsage.assignments.map((usage, index) => (
                                <tr 
                                  key={`assignment-${usage.assignmentId}`} 
                                  style={{ 
                                    borderBottom: '1px solid #e1e8ed',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                  onClick={() => {
                                    if (usage.sectionId && usage.assignmentId && problemForUsage?.id) {
                                      navigate(`/sections/${usage.sectionId}/assignments/${usage.assignmentId}/detail/problems/${problemForUsage.id}`);
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <td style={{ padding: '12px' }}>
                                    <div>
                                      <div style={{ fontWeight: '500' }}>{usage.courseTitle}</div>
                                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                        {usage.year}년 {usage.semester === 'SPRING' ? '1학기' : usage.semester === 'SUMMER' ? '여름학기' : usage.semester === 'FALL' ? '2학기' : '겨울학기'} {usage.sectionNumber ? `- ${usage.sectionNumber}분반` : ''}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    {usage.assignmentNumber && (
                                      <span style={{ color: '#666', marginRight: '8px' }}>
                                        {usage.assignmentNumber}
                                      </span>
                                    )}
                                    {usage.assignmentTitle}
                                  </td>
                                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                    {formatDateTime(usage.assignmentStartDate)}
                                  </td>
                                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                    {formatDateTime(usage.assignmentEndDate)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 문제집 사용 현황 */}
                    {problemUsage.problemSets && problemUsage.problemSets.length > 0 && (
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                          문제집 ({problemUsage.problemSets.length}개)
                        </h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e1e8ed', backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>문제집 제목</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>설명</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>생성일</th>
                              </tr>
                            </thead>
                            <tbody>
                              {problemUsage.problemSets.map((ps, index) => (
                                <tr 
                                  key={`problemset-${ps.problemSetId}`} 
                                  style={{ 
                                    borderBottom: '1px solid #e1e8ed',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                  onClick={() => {
                                    navigate(`/tutor/problems/sets/${ps.problemSetId}/edit`);
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <td style={{ padding: '12px', fontWeight: '500' }}>
                                    {ps.problemSetTitle}
                                  </td>
                                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                    {ps.description || '-'}
                                  </td>
                                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                    {formatDateTime(ps.createdAt)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 퀴즈 사용 현황 */}
                    {problemUsage.quizzes && problemUsage.quizzes.length > 0 && (
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                          퀴즈 ({problemUsage.quizzes.length}개)
                        </h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '2px solid #e1e8ed', backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>수업</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>퀴즈</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>시작일</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>종료일</th>
                              </tr>
                            </thead>
                            <tbody>
                              {problemUsage.quizzes.map((quiz, index) => (
                                <tr 
                                  key={`quiz-${quiz.quizId}`} 
                                  style={{ 
                                    borderBottom: '1px solid #e1e8ed',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                  }}
                                  onClick={() => {
                                    if (quiz.sectionId && quiz.quizId) {
                                      navigate(`/tutor/coding-tests/section/${quiz.sectionId}/${quiz.quizId}`);
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f7ff';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <td style={{ padding: '12px' }}>
                                    <div>
                                      <div style={{ fontWeight: '500' }}>{quiz.courseTitle}</div>
                                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                        {quiz.year}년 {quiz.semester === 'SPRING' ? '1학기' : quiz.semester === 'SUMMER' ? '여름학기' : quiz.semester === 'FALL' ? '2학기' : '겨울학기'} {quiz.sectionNumber ? `- ${quiz.sectionNumber}분반` : ''}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px', fontWeight: '500' }}>
                                    {quiz.quizTitle}
                                  </td>
                                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                    {formatDateTime(quiz.startTime)}
                                  </td>
                                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                                    {formatDateTime(quiz.endTime)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="problem-management-modal-footer">
                <button 
                  className="problem-management-btn-cancel"
                  onClick={() => {
                    setShowUsageModal(false);
                    setProblemForUsage(null);
                    setProblemUsage([]);
                  }}
                  disabled={loadingUsage}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

export default ProblemManagement;

