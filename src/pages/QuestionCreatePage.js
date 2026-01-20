import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseSidebar from '../components/CourseSidebar';
import CourseHeader from '../components/CourseHeader';
import APIService from '../services/APIService';
import { useRecoilState } from 'recoil';
import { sidebarCollapsedState } from '../recoil/atoms';
import './QuestionCreatePage.css';

const QuestionCreatePage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [problems, setProblems] = useState([]);
  const [assignmentsWithProblems, setAssignmentsWithProblems] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isAnonymous: false,
    isPublic: true,
    assignmentId: '',
    problemId: ''
  });

  const [nickname, setNickname] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, [sectionId]);

  useEffect(() => {
    if (formData.isAnonymous && !nickname) {
      fetchNickname();
    }
  }, [formData.isAnonymous]);

  useEffect(() => {
    if (formData.assignmentId) {
      fetchProblemsForAssignment(formData.assignmentId);
    }
  }, [formData.assignmentId]);

  const fetchInitialData = async () => {
    try {
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData);

      const assignmentsData = await APIService.getAssignmentsBySection(sectionId);
      setAssignments(assignmentsData || []);
      
      // 각 과제의 문제 목록도 함께 가져오기
      const assignmentsWithProblemsData = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          try {
            const problemsData = await APIService.getAssignmentProblems(sectionId, assignment.id);
            return {
              ...assignment,
              problems: problemsData?.data || problemsData || []
            };
          } catch (error) {
            console.error(`과제 ${assignment.id}의 문제 조회 실패:`, error);
            return {
              ...assignment,
              problems: []
            };
          }
        })
      );
      setAssignmentsWithProblems(assignmentsWithProblemsData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const fetchNickname = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/community/nicknames?sectionId=${sectionId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      const data = await response.json();
      if (data.success && data.data.nickname) {
        setNickname(data.data.nickname);
      } else {
        setShowNicknameModal(true);
      }
    } catch (err) {
      console.error('Error fetching nickname:', err);
      setShowNicknameModal(true);
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

  const handleNicknameSubmit = async () => {
    if (!nicknameInput.trim()) {
      setNicknameError('별명을 입력해주세요');
      return;
    }

    if (nicknameInput.length < 2 || nicknameInput.length > 50) {
      setNicknameError('별명은 2-50자 사이여야 합니다');
      return;
    }

    try {
      // 중복 확인
      const checkResponse = await fetch(
        `http://localhost:8080/api/community/nicknames/check?sectionId=${sectionId}&nickname=${encodeURIComponent(nicknameInput)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      const checkData = await checkResponse.json();
      
      if (!checkData.data.isAvailable) {
        setNicknameError('이미 사용 중인 별명입니다');
        return;
      }

      // 별명 설정
      const response = await fetch(
        'http://localhost:8080/api/community/nicknames',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sectionId: parseInt(sectionId),
            nickname: nicknameInput
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setNickname(data.data.nickname);
        setShowNicknameModal(false);
        setNicknameError('');
      }
    } catch (err) {
      console.error('Error setting nickname:', err);
      setNicknameError('별명 설정 중 오류가 발생했습니다');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요');
      return;
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요');
      return;
    }

    if (formData.isAnonymous && !nickname) {
      alert('익명으로 질문하려면 별명을 설정해주세요');
      setShowNicknameModal(true);
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        sectionId: parseInt(sectionId),
        title: formData.title,
        content: formData.content,
        isAnonymous: formData.isAnonymous,
        isPublic: formData.isPublic
      };

      if (formData.assignmentId) {
        requestData.assignmentId = parseInt(formData.assignmentId);
      }

      if (formData.problemId) {
        requestData.problemId = parseInt(formData.problemId);
      }

      const response = await fetch(
        'http://localhost:8080/api/community/questions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        }
      );

      if (!response.ok) throw new Error('질문 작성 실패');

      const data = await response.json();
      
      alert('질문이 작성되었습니다!');
      navigate(`/sections/${sectionId}/community/${data.data.id}`);
    } catch (err) {
      console.error('Error creating question:', err);
      alert('질문 작성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className={`question-create-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        currentMenu="community"
        isCollapsed={isSidebarCollapsed}
      />
      <div className="question-create-content">
        <CourseHeader 
          courseName={sectionInfo ? `[${sectionInfo.courseTitle}] ${sectionInfo.sectionNumber}분반` : '질문 작성'}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="question-create-body">
          <div className="question-create-header">
            <h1>질문 작성</h1>
            <p>궁금한 점을 자유롭게 질문해주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="question-form">
            {/* 제목 */}
            <div className="form-group">
              <label className="form-label">
                제목 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="질문 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
              />
              <span className="char-count">{formData.title.length}/200</span>
            </div>

            {/* 관련 과제/문제 선택 (통합 드롭다운) */}
            <div className="form-group">
              <label className="form-label">관련 과제/문제 (선택)</label>
              <select
                className="form-select"
                value={formData.assignmentId && formData.problemId ? `assignment-${formData.assignmentId}-problem-${formData.problemId}` : 
                       formData.assignmentId ? `assignment-${formData.assignmentId}` : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith('assignment-') && value.includes('-problem-')) {
                    // 문제 선택
                    const parts = value.split('-problem-');
                    const assignmentId = parts[0].replace('assignment-', '');
                    const problemId = parts[1];
                    setFormData({ 
                      ...formData, 
                      assignmentId: assignmentId,
                      problemId: problemId
                    });
                  } else if (value.startsWith('assignment-')) {
                    // 과제만 선택
                    const assignmentId = value.replace('assignment-', '');
                    setFormData({ 
                      ...formData, 
                      assignmentId: assignmentId,
                      problemId: '' 
                    });
                  } else {
                    // 선택 없음
                    setFormData({ 
                      ...formData, 
                      assignmentId: '',
                      problemId: '' 
                    });
                  }
                }}
              >
                <option value="">과제/문제를 선택하세요</option>
                {assignmentsWithProblems.map(assignment => (
                  <React.Fragment key={assignment.id}>
                    <option 
                      value={`assignment-${assignment.id}`}
                      style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}
                    >
                      📁 {assignment.title}
                    </option>
                    {assignment.problems && assignment.problems.length > 0 && assignment.problems.map(problem => (
                      <option 
                        key={problem.id} 
                        value={`assignment-${assignment.id}-problem-${problem.id}`}
                        style={{ paddingLeft: '24px' }}
                      >
                        &nbsp;&nbsp;└ {problem.title}
                      </option>
                    ))}
                  </React.Fragment>
                ))}
              </select>
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label className="form-label">
                내용 <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="질문 내용을 자세히 작성해주세요&#10;&#10;예시:&#10;1. 무엇을 구현하려고 했나요?&#10;2. 어떤 문제가 발생했나요?&#10;3. 어떤 시도를 해보셨나요?"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
              />
            </div>

            {/* 옵션 */}
            <div className="form-options">
              <div className="option-group">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  />
                  <span>익명으로 질문하기</span>
                  {formData.isAnonymous && nickname && (
                    <span className="nickname-display">
                      (별명: {nickname})
                    </span>
                  )}
                </label>
                <p className="option-description">
                  익명으로 질문하면 이름 대신 별명이 표시됩니다
                </p>
              </div>

              <div className="option-group">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={!formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: !e.target.checked })}
                  />
                  <span>비공개 질문 (교수만 볼 수 있음)</span>
                </label>
                <p className="option-description">
                  비공개로 설정하면 교수님만 질문을 볼 수 있습니다
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(`/sections/${sectionId}/community`)}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? '작성 중...' : '질문 작성'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 별명 설정 모달 */}
      {showNicknameModal && (
        <div className="modal-overlay" onClick={() => setShowNicknameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>별명 설정</h2>
            <p>익명으로 질문하려면 별명을 설정해주세요</p>
            
            <div className="modal-form-group">
              <input
                type="text"
                placeholder="별명 입력 (2-50자)"
                value={nicknameInput}
                onChange={(e) => {
                  setNicknameInput(e.target.value);
                  setNicknameError('');
                }}
                maxLength={50}
              />
              {nicknameError && (
                <p className="error-message">{nicknameError}</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => {
                  setShowNicknameModal(false);
                  setFormData({ ...formData, isAnonymous: false });
                }}
              >
                취소
              </button>
              <button
                className="btn-modal-submit"
                onClick={handleNicknameSubmit}
              >
                설정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCreatePage;

