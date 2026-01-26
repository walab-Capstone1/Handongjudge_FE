import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { removeCopyLabel } from '../../utils/problemUtils';
import APIService from '../../services/APIService';
import '../../components/AssignmentModals/AssignmentModals.css';

/**
 * 문제 선택 모달 컴포넌트 (현재 수업의 문제들)
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {Object} selectedAssignment - 선택된 과제
 * @param {Array} filteredProblems - 필터링된 문제 목록
 * @param {Array} selectedProblemIds - 선택된 문제 ID 목록
 * @param {string} problemSearchTerm - 문제 검색어
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onProblemToggle - 문제 토글 핸들러
 * @param {Function} onSelectAll - 전체 선택 핸들러
 * @param {Function} onSearchChange - 검색어 변경 핸들러
 * @param {Function} onSelectProblems - 문제 선택 핸들러
 * @param {Function} onCopyProblem - 문제 복사 모달 열기 핸들러
 * @param {Function} onCreateNew - 새 문제 생성 모달 열기 핸들러
 * @param {Function} onProblemDetail - 문제 상세 조회 핸들러
 */
const ProblemSelectModal = ({
  isOpen,
  selectedAssignment,
  filteredProblems,
  selectedProblemIds,
  problemSearchTerm,
  onClose,
  onProblemToggle,
  onSelectAll,
  onSearchChange,
  onSelectProblems,
  onCopyProblem,
  onCreateNew,
  onProblemDetail
}) => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('problems'); // 'problems', 'problemSets', 'sections'
  const [problemSets, setProblemSets] = useState([]);
  const [selectedProblemSet, setSelectedProblemSet] = useState(null);
  const [problemSetProblems, setProblemSetProblems] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionAssignments, setSectionAssignments] = useState([]);
  const [selectedAssignmentForSection, setSelectedAssignmentForSection] = useState(null);
  const [sectionProblems, setSectionProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveMode('problems');
      setSelectedProblemSet(null);
      setProblemSetProblems([]);
      setSelectedSection(null);
      setSectionAssignments([]);
      setSelectedAssignmentForSection(null);
      setSectionProblems([]);
    }
  }, [isOpen]);

  // 문제집 목록 조회
  useEffect(() => {
    if (isOpen && activeMode === 'problemSets') {
      const fetchProblemSets = async () => {
        try {
          setLoading(true);
          const response = await APIService.getProblemSets();
          const sets = response.data || response || [];
          setProblemSets(Array.isArray(sets) ? sets : []);
        } catch (error) {
          console.error('문제집 목록 조회 실패:', error);
          setProblemSets([]);
        } finally {
          setLoading(false);
        }
      };
      fetchProblemSets();
    }
  }, [isOpen, activeMode]);

  // 선택한 문제집의 문제 조회
  useEffect(() => {
    if (selectedProblemSet) {
      const fetchProblemSetProblems = async () => {
        try {
          setLoading(true);
          const response = await APIService.getProblemSet(selectedProblemSet.id);
          const problems = response.problems || response.data?.problems || [];
          setProblemSetProblems(Array.isArray(problems) ? problems : []);
        } catch (error) {
          console.error('문제집 문제 조회 실패:', error);
          setProblemSetProblems([]);
        } finally {
          setLoading(false);
        }
      };
      fetchProblemSetProblems();
    }
  }, [selectedProblemSet]);

  // 교수가 관리하는 수업 목록 조회
  useEffect(() => {
    if (isOpen && activeMode === 'sections') {
      const fetchSections = async () => {
        try {
          setLoading(true);
          const response = await APIService.getInstructorDashboard();
          const sectionsData = response.data || response || [];
          // 현재 수업은 제외
          const filteredSections = Array.isArray(sectionsData) 
            ? sectionsData.filter(s => s.sectionId !== selectedAssignment?.sectionId)
            : [];
          setSections(filteredSections);
        } catch (error) {
          console.error('수업 목록 조회 실패:', error);
          setSections([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSections();
    }
  }, [isOpen, activeMode, selectedAssignment]);

  // 선택한 수업의 과제 목록 조회
  useEffect(() => {
    if (selectedSection) {
      const fetchSectionAssignments = async () => {
        try {
          setLoading(true);
          const sectionId = selectedSection.sectionId || selectedSection.id;
          const response = await APIService.getAssignmentsBySection(sectionId);
          const assignments = response.data || response || [];
          setSectionAssignments(Array.isArray(assignments) ? assignments : []);
        } catch (error) {
          console.error('과제 목록 조회 실패:', error);
          setSectionAssignments([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSectionAssignments();
    }
  }, [selectedSection]);

  // 선택한 과제의 문제 목록 조회
  useEffect(() => {
    if (selectedAssignmentForSection && selectedSection) {
      const fetchAssignmentProblems = async () => {
        try {
          setLoading(true);
          const sectionId = selectedSection.sectionId || selectedSection.id;
          const response = await APIService.getAssignmentProblems(sectionId, selectedAssignmentForSection.id);
          const problems = response.problems || response.data?.problems || response.data || response || [];
          setSectionProblems(Array.isArray(problems) ? problems : []);
        } catch (error) {
          console.error('과제 문제 조회 실패:', error);
          setSectionProblems([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAssignmentProblems();
    }
  }, [selectedAssignmentForSection, selectedSection]);

  if (!isOpen) return null;

  // 현재 모드에 따른 문제 목록 (검색어 필터링 포함)
  const getCurrentProblems = () => {
    let problems = [];
    if (activeMode === 'problems') {
      // filteredProblems는 이미 검색어로 필터링된 결과이므로 그대로 사용
      problems = filteredProblems;
    } else if (activeMode === 'problemSets') {
      problems = problemSetProblems;
    } else if (activeMode === 'sections') {
      problems = sectionProblems;
    }
    
    // 문제집/수업 모드에서만 검색어 필터링 적용 (내 문제 모드는 이미 filteredProblems에 필터링됨)
    if (activeMode !== 'problems' && problemSearchTerm) {
      const searchLower = problemSearchTerm.toLowerCase();
      return problems.filter(problem =>
        problem.title?.toLowerCase().includes(searchLower) ||
        problem.id?.toString().includes(searchLower)
      );
    }
    return problems;
  };

  const currentProblems = getCurrentProblems();
  const allSelected = selectedProblemIds.length === currentProblems.length && currentProblems.length > 0;
  
  const handleSelectAllCurrent = () => {
    const currentIds = currentProblems.map(p => p.id);
    const allCurrentlySelected = currentIds.length > 0 && currentIds.every(id => selectedProblemIds.includes(id));
    
    if (allCurrentlySelected) {
      // 전체 선택 해제
      currentIds.forEach(id => {
        if (selectedProblemIds.includes(id)) {
          onProblemToggle(id);
        }
      });
    } else {
      // 전체 선택
      currentIds.forEach(id => {
        if (!selectedProblemIds.includes(id)) {
          onProblemToggle(id);
        }
      });
    }
  };

  return createPortal(
    <div 
      className="tutor-modal-overlay tutor-modal-overlay-problem-select"
    >
      <div className="tutor-modal-content tutor-problem-modal tutor-problem-modal-large">
        <div className="tutor-modal-header">
          <h2>문제 추가 - {selectedAssignment?.title}</h2>
          <button 
            className="tutor-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="tutor-problem-modal-body">
          {/* 모드 선택 탭 */}
          <div className="tutor-problem-mode-tabs">
            <button
              className={`tutor-mode-tab ${activeMode === 'problems' ? 'active' : ''}`}
              onClick={() => setActiveMode('problems')}
            >
              내 문제
            </button>
            <button
              className={`tutor-mode-tab ${activeMode === 'problemSets' ? 'active' : ''}`}
              onClick={() => setActiveMode('problemSets')}
            >
              문제집에서 가져오기
            </button>
            <button
              className={`tutor-mode-tab ${activeMode === 'sections' ? 'active' : ''}`}
              onClick={() => setActiveMode('sections')}
            >
              수업에서 가져오기
            </button>
          </div>

          {/* 문제집 모드: 문제집 선택 */}
          {activeMode === 'problemSets' && !selectedProblemSet && (
            <div className="tutor-problem-set-selection">
              <h3>문제집 선택</h3>
              {loading ? (
                <div className="tutor-loading">로딩 중...</div>
              ) : problemSets.length > 0 ? (
                <div className="tutor-problem-sets-list">
                  {problemSets.map((set) => (
                    <div
                      key={set.id}
                      className="tutor-problem-set-item"
                      onClick={() => setSelectedProblemSet(set)}
                    >
                      <h4>{set.title}</h4>
                      {set.description && <p>{set.description}</p>}
                      {set.problemCount !== undefined && (
                        <span className="tutor-problem-count">{set.problemCount}개 문제</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tutor-no-available-problems">
                  <p>사용 가능한 문제집이 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* 수업 모드: 수업 및 과제 선택 */}
          {activeMode === 'sections' && (
            <div className="tutor-section-selection">
              {!selectedSection ? (
                <div>
                  <h3>수업 선택</h3>
                  {loading ? (
                    <div className="tutor-loading">로딩 중...</div>
                  ) : sections.length > 0 ? (
                    <div className="tutor-sections-list">
                      {sections.map((section) => (
                        <div
                          key={section.sectionId || section.id}
                          className="tutor-section-item"
                          onClick={() => setSelectedSection(section)}
                        >
                          <h4>{section.courseTitle || section.title} - {section.sectionNumber}</h4>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="tutor-no-available-problems">
                      <p>사용 가능한 수업이 없습니다.</p>
                    </div>
                  )}
                </div>
              ) : !selectedAssignmentForSection ? (
                <div>
                  <div className="tutor-section-header">
                    <button
                      className="tutor-btn-back"
                      onClick={() => {
                        setSelectedSection(null);
                        setSectionAssignments([]);
                      }}
                    >
                      ← 뒤로
                    </button>
                    <h3>{selectedSection.courseTitle || selectedSection.title} - {selectedSection.sectionNumber}</h3>
                  </div>
                  {loading ? (
                    <div className="tutor-loading">로딩 중...</div>
                  ) : sectionAssignments.length > 0 ? (
                    <div className="tutor-assignments-list">
                      {sectionAssignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="tutor-assignment-item"
                          onClick={() => setSelectedAssignmentForSection(assignment)}
                        >
                          <h4>{assignment.title}</h4>
                          {assignment.description && <p>{assignment.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="tutor-no-available-problems">
                      <p>과제가 없습니다.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="tutor-section-header">
                    <button
                      className="tutor-btn-back"
                      onClick={() => {
                        setSelectedAssignmentForSection(null);
                        setSectionProblems([]);
                      }}
                    >
                      ← 뒤로
                    </button>
                    <h3>{selectedAssignmentForSection.title}</h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 문제집 모드: 선택한 문제집의 문제 표시 */}
          {activeMode === 'problemSets' && selectedProblemSet && (
            <div>
              <div className="tutor-section-header">
                <button
                  className="tutor-btn-back"
                  onClick={() => {
                    setSelectedProblemSet(null);
                    setProblemSetProblems([]);
                  }}
                >
                  ← 뒤로
                </button>
                <h3>{selectedProblemSet.title}</h3>
              </div>
            </div>
          )}

          {/* 검색 및 문제 목록 */}
          {(activeMode === 'problems' || 
            (activeMode === 'problemSets' && selectedProblemSet) ||
            (activeMode === 'sections' && selectedAssignmentForSection)) && (
            <>
              <div className="tutor-problem-search-section">
                <input
                  type="text"
                  placeholder="문제명으로 검색..."
                  value={problemSearchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="tutor-search-input"
                />
              </div>

              {currentProblems.length > 0 && (
                <div className="tutor-problem-selection-header">
                  <label className="tutor-checkbox-label">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAllCurrent}
                    />
                    <span>전체 선택</span>
                  </label>
                  <span className="tutor-item-count">
                    {selectedProblemIds.length} / {currentProblems.length}개 선택됨
                  </span>
                </div>
              )}

              <div className="tutor-available-problems-grid">
                {loading ? (
                  <div className="tutor-loading">로딩 중...</div>
                ) : currentProblems.length > 0 ? (
                  currentProblems.map((problem) => (
                    <div key={problem.id} className="tutor-problem-card">
                      <div className="tutor-problem-card-header">
                        <input
                          type="checkbox"
                          checked={selectedProblemIds.includes(problem.id)}
                          onChange={() => onProblemToggle(problem.id)}
                          className="tutor-problem-checkbox"
                        />
                      </div>
                      <div className="tutor-problem-card-body">
                        <h4 className="tutor-problem-card-title">{removeCopyLabel(problem.title)}</h4>
                        <div className="tutor-problem-card-meta-row">
                          <span className="tutor-problem-card-date">
                            생성일: {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                          <button 
                            className="tutor-btn-view-detail-card"
                            onClick={() => onProblemDetail(problem.id)}
                          >
                            설명보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="tutor-no-available-problems">
                    <p>사용 가능한 문제가 없습니다.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="tutor-modal-footer">
          <div className="tutor-footer-actions">
            <button 
              type="button"
              className="tutor-btn-secondary"
              onClick={onClose}
            >
              취소
            </button>
            {selectedProblemIds.length > 0 && (
              <button 
                type="button"
                className="tutor-btn-primary"
                onClick={() => onSelectProblems(selectedProblemIds)}
              >
                선택한 문제 추가 ({selectedProblemIds.length}개)
              </button>
            )}
            <button 
              type="button"
              className="tutor-btn-create-new"
              onClick={() => {
                onClose();
                navigate('/tutor/problems/create');
              }}
            >
              새 문제 만들기
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProblemSelectModal;

