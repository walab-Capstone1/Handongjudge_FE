import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import APIService from '../services/APIService';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [hasManagingSections, setHasManagingSections] = useState(false);
  const [checking, setChecking] = useState(true);

  // 관리 중인 수업이 있는지 확인
  useEffect(() => {
    const checkManagingSections = async () => {
      if (!isAuthenticated || loading) {
        setChecking(false);
        return;
      }

      // SUPER_ADMIN은 항상 접근 가능
      if (user?.role === 'SUPER_ADMIN') {
        setHasManagingSections(true);
        setChecking(false);
        return;
      }

      try {
        const response = await APIService.getManagingSections();
        setHasManagingSections((response?.data || []).length > 0);
      } catch (error) {
        console.error('관리 중인 수업 확인 실패:', error);
        setHasManagingSections(false);
      } finally {
        setChecking(false);
      }
    };

    checkManagingSections();
  }, [isAuthenticated, loading, user?.role]);

  if (loading || checking) {
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

  // 관리 중인 수업이 없으면 접근 거부
  if (!hasManagingSections) {
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
          관리 중인 수업이 없어 관리 페이지에 접근할 수 없습니다.
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

export default AdminRoute;
