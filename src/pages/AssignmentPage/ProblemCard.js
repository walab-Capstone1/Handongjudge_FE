import React from "react";

const ProblemCard = ({ title, timeLimit, memoryLimit, onClick }) => (
  <div style={{
    border: '1px solid #eee', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8, 
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }} 
  onClick={onClick}
  onMouseEnter={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
  onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
  >
    <h4 style={{margin: '0 0 8px 0', color: '#333'}}>{title}</h4>
    {(timeLimit || memoryLimit) && (
      <div style={{
        display: 'flex', 
        gap: '12px', 
        fontSize: '12px', 
        color: '#666',
        marginTop: '8px'
      }}>
        {timeLimit && (
          <span style={{
            background: 'rgba(88, 166, 255, 0.1)',
            color: '#0969da',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            시간 제한: {timeLimit}초
          </span>
        )}
        {memoryLimit && (
          <span style={{
            background: 'rgba(255, 107, 107, 0.1)',
            color: '#d63384',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            메모리 제한: {memoryLimit}MB
          </span>
        )}
      </div>
    )}
  </div>
);

export default ProblemCard; 