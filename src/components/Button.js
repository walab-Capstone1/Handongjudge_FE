import React from "react";

const Button = ({ children, ...props }) => (
  <button style={{padding: '8px 16px', borderRadius: 4, border: 'none', background: '#1976d2', color: '#fff', cursor: 'pointer'}} {...props}>
    {children}
  </button>
);

export default Button; 