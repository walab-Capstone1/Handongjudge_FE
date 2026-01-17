import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../layouts/TutorLayout";
import APIService from "../../services/APIService";
import LoadingSpinner from "../../components/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import "./ProblemView.css";

const ProblemView = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await APIService.getProblemInfo(problemId);
      const data = response?.data || response;
      
      // sampleInputs가 JSON 문자열인 경우 파싱
      if (data.sampleInputs && typeof data.sampleInputs === 'string') {
        try {
          data.sampleInputs = JSON.parse(data.sampleInputs);
        } catch (e) {
          console.warn('sampleInputs 파싱 실패:', e);
          data.sampleInputs = [];
        }
      }
      
      setProblem(data);
    } catch (error) {
      console.error('문제 조회 실패:', error);
      setError('문제를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      '1': '쉬움',
      '2': '보통',
      '3': '어려움',
      '4': '매우 어려움',
      '5': '극도 어려움'
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      '1': '#10b981',
      '2': '#f59e0b',
      '3': '#ef4444',
      '4': '#dc2626',
      '5': '#991b1b'
    };
    return colors[difficulty] || '#6b7280';
  };

  if (loading) {
    return (
      <TutorLayout>
        <LoadingSpinner message="문제 정보를 불러오는 중..." />
      </TutorLayout>
    );
  }

  if (error || !problem) {
    return (
      <TutorLayout>
        <div className="problem-view">
          <div className="problem-view-error">
            <h2>문제를 찾을 수 없습니다</h2>
            <p>{error || '존재하지 않거나 접근 권한이 없는 문제입니다.'}</p>
            <button 
              className="problem-view-btn-back"
              onClick={() => navigate(-1)}
            >
              돌아가기
            </button>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="problem-view">
        <div className="problem-view-header">
          <button
            className="problem-view-btn-back-to-list"
            onClick={() => navigate('/tutor/problems')}
            title="문제 관리 페이지로 돌아가기"
          >
            ← 문제 관리
          </button>
          <div className="problem-view-header-info">
            <h1 className="problem-view-title">{problem.title}</h1>
            <div className="problem-view-meta">
              <span className="problem-view-id">ID: #{problem.id}</span>
              {problem.difficulty && (
                <span 
                  className="problem-view-difficulty"
                  style={{ 
                    backgroundColor: getDifficultyColor(problem.difficulty) + '20',
                    color: getDifficultyColor(problem.difficulty)
                  }}
                >
                  난이도: {getDifficultyLabel(problem.difficulty)}
                </span>
              )}
              {problem.timeLimit && (
                <span className="problem-view-limit">
                  시간 제한: {problem.timeLimit}초
                </span>
              )}
              {problem.memoryLimit && (
                <span className="problem-view-limit">
                  메모리 제한: {problem.memoryLimit}MB
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="problem-view-content">
          {problem.description && (
            <div className="problem-view-section">
              <h2 className="problem-view-section-title">문제 설명</h2>
              <div className="problem-view-description">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="problem-view-h1" {...props} />,
                    h2: ({node, ...props}) => <h2 className="problem-view-h2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="problem-view-h3" {...props} />,
                    code: ({node, inline, className, children, ...props}) => {
                      return inline ? (
                        <code className="problem-view-inline-code" {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre className="problem-view-code-block">
                          <code {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    p: ({node, ...props}) => <p className="problem-view-paragraph" {...props} />,
                    hr: ({node, ...props}) => <hr className="problem-view-hr" {...props} />,
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {problem.inputFormat && (
            <div className="problem-view-section">
              <h2 className="problem-view-section-title">입력 형식</h2>
              <div className="problem-view-format">
                {problem.inputFormat.split('\n').map((line, idx) => (
                  <p key={idx} className="problem-view-format-line">{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          )}

          {problem.outputFormat && (
            <div className="problem-view-section">
              <h2 className="problem-view-section-title">출력 형식</h2>
              <div className="problem-view-format">
                {problem.outputFormat.split('\n').map((line, idx) => (
                  <p key={idx} className="problem-view-format-line">{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          )}

          {problem.sampleInputs && Array.isArray(problem.sampleInputs) && problem.sampleInputs.length > 0 && (
            <div className="problem-view-section">
              <h2 className="problem-view-section-title">예제</h2>
              {problem.sampleInputs.map((sample, idx) => {
                if (!sample.input && !sample.output) return null;
                return (
                  <div key={idx} className="problem-view-example">
                    <h3 className="problem-view-example-title">예제 입력 {idx + 1}</h3>
                    <pre className="problem-view-code-block">
                      <code>{sample.input || ''}</code>
                    </pre>
                    <h3 className="problem-view-example-title">예제 출력 {idx + 1}</h3>
                    <pre className="problem-view-code-block">
                      <code>{sample.output || ''}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
};

export default ProblemView;

