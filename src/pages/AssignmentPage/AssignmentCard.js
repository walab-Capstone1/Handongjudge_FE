import React from "react";

const AssignmentCard = ({ title, onClick }) => (
  <div style={{border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12, cursor: 'pointer'}} onClick={onClick}>
    <h3>{title}</h3>
    {/* TODO: 추가 정보 표시 */}
  </div>
);

export default AssignmentCard; 