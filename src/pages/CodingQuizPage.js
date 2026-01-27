import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { sidebarCollapsedState } from '../recoil/atoms';
import CourseSidebar from '../components/CourseSidebar';
import CourseHeader from '../components/CourseHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizTimer from '../components/QuizTimer';
import APIService from '../services/APIService';
import './CodingQuizPage.css';

const CodingQuizPage = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(sidebarCollapsedState);
  
  const [loading, setLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizProblems, setQuizProblems] = useState([]);

  useEffect(() => {
    fetchData();
  }, [sectionId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 섹션 정보 조회
      const sectionData = await APIService.getSectionInfo(sectionId);
      setSectionInfo(sectionData?.data || sectionData);

      // 코딩 테스트 목록 API 호출
      const quizzesResponse = await APIService.getQuizzesBySection(sectionId);
      const quizzesData = quizzesResponse.data || quizzesResponse;
      
      // LocalDateTime을 Date로 변환
      const quizzes = quizzesData.map(quiz => ({
        ...quiz,
        startTime: new Date(quiz.startTime),
        endTime: new Date(quiz.endTime)
      }));
      
      setQuizzes(quizzes);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const handleQuizClick = async (quiz) => {
    // 진행 중이거나 종료된 코딩 테스트만 클릭 가능
    if (quiz.status === 'WAITING') {
      return;
    }

    try {
      // 코딩 테스트 문제 목록 API 호출
      const problemsResponse = await APIService.getQuizProblems(sectionId, quiz.id);
      const problemsData = problemsResponse.data || problemsResponse;
      
      // DTO를 프론트엔드 형식으로 변환
      const problems = problemsData.map(p => ({
        id: p.problemId,
        title: p.title,
        order: p.problemOrder
      }));
      
      setSelectedQuiz(quiz);
      setQuizProblems(problems);
    } catch (err) {
      console.error('문제 목록 조회 실패:', err);
    }
  };

  const handleProblemSelect = (problemId) => {
    if (selectedQuiz) {
      navigate(`/sections/${sectionId}/coding-quiz/${selectedQuiz.id}?problemId=${problemId}`);
      setSelectedQuiz(null);
      setQuizProblems([]);
    }
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
    setQuizProblems([]);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="status-badge active">진행중</span>;
      case 'WAITING':
        return <span className="status-badge waiting">대기중</span>;
      case 'ENDED':
        return <span className="status-badge ended">종료</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
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
      <div className="coding-quiz-container">
        <CourseSidebar 
          sectionId={sectionId} 
          currentMenu="coding-quiz"
          isCollapsed={isSidebarCollapsed}
        />
        <div className="coding-quiz-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const activeQuizzes = quizzes.filter(q => q.status === 'ACTIVE');
  const waitingQuizzes = quizzes.filter(q => q.status === 'WAITING');
  const endedQuizzes = quizzes.filter(q => q.status === 'ENDED');

  return (
    <div className={`coding-quiz-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <CourseSidebar 
        sectionId={sectionId} 
        currentMenu="coding-quiz"
        isCollapsed={isSidebarCollapsed}
      />
      <div className="coding-quiz-content">
        <CourseHeader 
          courseName={sectionInfo?.courseTitle || '코딩 테스트'}
          onToggleSidebar={handleToggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <div className="coding-quiz-body">
          {!selectedQuiz ? (
            <>
              <div className="quiz-header">
                <h1>코딩 테스트</h1>
                <p>실시간 코딩 문제를 풀어보세요</p>
              </div>

              {/* 진행 중인 퀴즈 */}
          {activeQuizzes.length > 0 && (
            <div className="quiz-section">
              <h2 className="coding-quiz-section-title">진행 중인 퀴즈</h2>
              <div className="quiz-list">
                {activeQuizzes.map(quiz => (
                  <div 
                    key={quiz.id} 
                    className="quiz-card active"
                    onClick={() => handleQuizClick(quiz)}
                  >
                    <div className="quiz-card-header">
                      <h3>{quiz.title}</h3>
                      {getStatusBadge(quiz.status)}
                    </div>
                    <div className="quiz-card-content">
                      <p className="quiz-description">{quiz.description}</p>
                      <div className="quiz-info">
                        <span className="start-time">
                          시작: {formatDateTime(quiz.startTime)}
                        </span>
                        <span className="end-time">
                          종료: {formatDateTime(quiz.endTime)}
                        </span>
                        <span className="problem-count">
                          문제 수: {quiz.problemCount || 0}개
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 대기 중인 퀴즈 */}
          {waitingQuizzes.length > 0 && (
            <div className="quiz-section">
              <h2 className="coding-quiz-section-title">예정된 퀴즈</h2>
              <div className="quiz-list">
                {waitingQuizzes.map(quiz => (
                  <div 
                    key={quiz.id} 
                    className="quiz-card waiting"
                  >
                    <div className="quiz-card-header">
                      <h3>{quiz.title}</h3>
                      {getStatusBadge(quiz.status)}
                    </div>
                    <div className="quiz-card-content">
                      <p className="quiz-description">{quiz.description}</p>
                      <div className="quiz-info">
                        <span className="start-time">
                          시작: {formatDateTime(quiz.startTime)}
                        </span>
                        <span className="end-time">
                          종료: {formatDateTime(quiz.endTime)}
                        </span>
                        <span className="problem-count">
                          문제 수: {quiz.problemCount || 0}개
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 종료된 퀴즈 */}
          {endedQuizzes.length > 0 && (
            <div className="quiz-section">
              <h2 className="coding-quiz-section-title">종료된 퀴즈</h2>
              <div className="quiz-list">
                {endedQuizzes.map(quiz => (
                  <div 
                    key={quiz.id} 
                    className="quiz-card ended"
                    onClick={() => handleQuizClick(quiz)}
                  >
                    <div className="quiz-card-header">
                      <h3>{quiz.title}</h3>
                      {getStatusBadge(quiz.status)}
                    </div>
                    <div className="quiz-card-content">
                      <p className="quiz-description">{quiz.description}</p>
                      <div className="quiz-info">
                        <span className="start-time">
                          시작: {formatDateTime(quiz.startTime)}
                        </span>
                        <span className="end-time">
                          종료: {formatDateTime(quiz.endTime)}
                        </span>
                        <span className="problem-count">
                          문제 수: {quiz.problemCount || 0}개
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 퀴즈가 없는 경우 */}
          {quizzes.length === 0 && (
            <div className="empty-state">
              <p>아직 등록된 코딩테스트가 없습니다.</p>
            </div>
          )}
            </>
          ) : (
            <div className="quiz-problems-section">
              <div className="problems-header">
                <div className="problems-header-left">
                  <button className="back-button" onClick={handleBackToList}>
                    ← 목록으로
                  </button>
                  <h2>{selectedQuiz.title}</h2>
                </div>
                {selectedQuiz.status === 'ACTIVE' && (
                  <div className="problems-header-timer">
                    <QuizTimer 
                      endTime={selectedQuiz.endTime} 
                      onTimeUp={() => {}}
                    />
                  </div>
                )}
              </div>
              <p className="problems-description">{selectedQuiz.description}</p>
              <div className="problems-quiz-info">
                <span className="start-time">
                  시작: {formatDateTime(selectedQuiz.startTime)}
                </span>
                <span className="end-time">
                  종료: {formatDateTime(selectedQuiz.endTime)}
                </span>
                <span className="problem-count">
                  문제 수: {selectedQuiz.problemCount || quizProblems.length || 0}개
                </span>
              </div>
              <div className="problems-list">
                {quizProblems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className="problem-item"
                    onClick={() => handleProblemSelect(problem.id)}
                  >
                    <div className="problem-item-title">{problem.title}</div>
                    <div className="problem-item-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodingQuizPage;

