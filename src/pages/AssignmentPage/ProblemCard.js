import React from "react";

const ProblemCard = ({ title, onClick }) => (
  <div style={{border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8, cursor: 'pointer'}} onClick={onClick}>
    <h4>{title}</h4>
    {/* TODO: 추가 정보 표시 */}
  </div>
);

export default ProblemCard; 