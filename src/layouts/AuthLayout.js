import React from "react";

const AuthLayout = ({ children }) => (
  <div style={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f7f7f7'}}>
    <div style={{width: '100%', maxWidth: 400, padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
      {children}
    </div>
  </div>
);

export default AuthLayout; 