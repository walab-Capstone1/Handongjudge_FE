import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SuperAdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem'
      }}>
        인증 확인 중...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // role이 SUPER_ADMIN이 아니면 접근 거부
  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#e74c3c', marginBottom: '1rem' }}>
          🚫 접근 권한이 없습니다
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#636e72', marginBottom: '2rem' }}>
          시스템 관리자 페이지는 시스템 관리자만 접근할 수 있습니다.
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '0.8rem 2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return children;
};

export default SuperAdminRoute;

