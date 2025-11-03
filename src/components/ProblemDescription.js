import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ProblemDescription.css';

const ProblemDescription = ({ 
  currentProblem, 
  problemDescription 
}) => {
  // 문제 설명이 HTML인지 마크다운인지 판단
  const description = currentProblem.description || problemDescription;
  const isMarkdown = description && (
    description.includes('# ') || 
    description.includes('## ') || 
    description.includes('```') ||
    description.includes('**') ||
    description.includes('* ') ||
    !description.includes('<')
  );

  return (
    <div className="description-area">
      <div className="description-header">
        <span>문제 설명</span>
        
        {/* Problem Limits in Header */}
        {(currentProblem.timeLimit || currentProblem.memoryLimit) && (
          <div className="problem-limits-header">
            {currentProblem.timeLimit && (
              <span className="limit-badge-header time-limit">
                시간 제한: {currentProblem.timeLimit}초
              </span>
            )}
            {currentProblem.memoryLimit && (
              <span className="limit-badge-header memory-limit">
                메모리 제한: {currentProblem.memoryLimit}MB
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="description-content">
        {isMarkdown ? (
          <ReactMarkdown
            components={{
              // 코드 블록 스타일링
              code({node, inline, className, children, ...props}) {
                return inline ? (
                  <code className="inline-code" {...props}>
                    {children}
                  </code>
                ) : (
                  <pre className="code-block">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                );
              },
              // 테이블 스타일링
              table({children, ...props}) {
                return (
                  <div className="table-wrapper">
                    <table {...props}>{children}</table>
                  </div>
                );
              }
            }}
          >
            {description}
          </ReactMarkdown>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: description }} />
        )}
      </div>
    </div>
  );
};

export default ProblemDescription;
