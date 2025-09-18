import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './ExecutionResult.css';

const ExecutionResult = ({
  submissionResult,
  isSubmitting
}) => {
  const [selectedTestcase, setSelectedTestcase] = useState(null);

  const getTestcaseResultText = (result) => {
    const resultTexts = {
      'correct': '정답',
      'wrong-answer': '오답',
      'timelimit': '시간 초과',
      'memory-limit': '메모리 초과',
      'run-error': '런타임 에러',
      'compiler-error': '컴파일 에러',
      'presentation-error': '출력 형식 오류',
      'no-output': '출력 없음',
      null: '미실행'
    };
    return resultTexts[result] || '알 수 없음';
  };

  const formatMemory = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // 테스트케이스 요약 정보 계산
  const getTestcaseSummary = (outputList) => {
    if (!outputList || outputList.length === 0) return { passed: 0, total: 0 };
    
    const passed = outputList.filter(testcase => testcase.result === 'correct').length;
    const total = outputList.length;
    
    return { passed, total };
  };

  return (
    <div className="result-area">
      <div className="result-header">
        {submissionResult?.type === 'output' ? '실행 결과' : '채점 결과'}
      </div>
      <div>
        {isSubmitting ? (
          <div className="result-loading">
            <LoadingSpinner />
            <span>제출 중...</span>
          </div>
        ) : submissionResult ? (
          <>
            <div 
              className={`result-summary ${submissionResult.resultInfo.status === 'error' ? 'error' : ''}`}
              style={{ color: submissionResult.resultInfo.color }}
            >
              <strong>{submissionResult.resultInfo.message}</strong>
              <br />
              제출 ID: {submissionResult.submissionId} | 
              언어: {submissionResult.language} | 
              제출 시간: {new Date(submissionResult.submittedAt).toLocaleString('ko-KR')}
            </div>
            
            {submissionResult.status === 'error' && (
              <div className="error-message">
                <strong>오류:</strong> {submissionResult.message}
              </div>
            )}

            {/* 테스트케이스 상세 결과 표시 */}
            {submissionResult.type === 'output' && submissionResult.outputList && (() => {
              const { passed, total } = getTestcaseSummary(submissionResult.outputList);
              return (
                <div className="testcases-section">
                  <div className="testcases-header">
                    <strong>테스트케이스 결과: {passed}/{total}</strong>
                  </div>
                  
                  {/* 테스트케이스 버튼들 */}
                  <div className="testcase-buttons">
                    {submissionResult.outputList.map((testcase, index) => (
                      <button
                        key={testcase.id || index}
                        className={`testcase-button ${testcase.result || 'not-run'} ${
                          selectedTestcase === index ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedTestcase(index)}
                      >
                        #{testcase.testcase_rank}
                      </button>
                    ))}
                  </div>
                  
                  {/* 선택된 테스트케이스 상세 정보 */}
                  {selectedTestcase !== null && submissionResult.outputList[selectedTestcase] && (() => {
                    const testcase = submissionResult.outputList[selectedTestcase];
                    return (
                      <div className="selected-testcase">
                        <div className="testcase-info-header">
                          <span className="testcase-number">테스트케이스 #{testcase.testcase_rank}</span>
                          <span className={`testcase-result ${testcase.result || 'not-run'}`}>
                            {getTestcaseResultText(testcase.result)}
                          </span>
                        </div>
                        
                        {testcase.result && (
                          <div className="testcase-details">
                            <div className="testcase-stats">
                              <span className="stat-item">
                                <strong>실행시간:</strong> {testcase.runtime}ms
                              </span>
                              <span className="stat-item">
                                <strong>메모리:</strong> {formatMemory(testcase.memory_used)}
                              </span>
                            </div>
                            
                            {testcase.testcase_input && (
                              <div className="testcase-input">
                                <div className="input-label">테스트 입력:</div>
                                <div className="input-content">
                                  <pre>{testcase.testcase_input}</pre>
                                </div>
                              </div>
                            )}
                            
                            {testcase.expected_output && (
                              <div className="testcase-expected">
                                <div className="expected-label">기대 출력:</div>
                                <div className="expected-content">
                                  <pre>{testcase.expected_output}</pre>
                                </div>
                              </div>
                            )}
                            
                            {testcase.output && (
                              <div className="testcase-output">
                                <div className="output-label">실제 출력:</div>
                                <div className="output-content">
                                  <pre>{testcase.output}</pre>
                                </div>
                              </div>
                            )}
                            
                            {testcase.output_error && (
                              <div className="testcase-error">
                                <div className="error-label">실행 에러:</div>
                                <div className="error-content">
                                  <pre>{testcase.output_error}</pre>
                                </div>
                              </div>
                            )}
                            
                            {testcase.output_diff && (
                              <div className="testcase-diff">
                                <div className="diff-label">차이점:</div>
                                <div className="diff-content">
                                  <pre>{testcase.output_diff}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </>
        ) : (
          <div style={{ opacity: 0.6 }}>제출 후 결과가 여기에 표시됩니다.</div>
        )}
      </div>
    </div>
  );
};

export default ExecutionResult;
