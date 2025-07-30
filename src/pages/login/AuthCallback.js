import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styled from "styled-components";

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, socialLogin, loading, error } = useAuth();
  const [status, setStatus] = useState("처리 중...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { type, email, password, provider } = location.state || {};

        if (!type) {
          setStatus("잘못된 접근입니다.");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        if (type === "login") {
          setStatus("로그인 중...");
          await login(email, password);
          setStatus("로그인 성공! 메인 페이지로 이동합니다.");
          setTimeout(() => navigate("/"), 1500);
        } else if (type === "social") {
          setStatus(`${provider} 로그인 중...`);
          
          // URL 파라미터에서 토큰 추출 (실제 구현에서는 OAuth 콜백 처리)
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get("token") || urlParams.get("code");
          
          if (!token) {
            setStatus("인증 토큰을 찾을 수 없습니다.");
            setTimeout(() => navigate("/"), 2000);
            return;
          }

          await socialLogin(provider, token);
          setStatus("소셜 로그인 성공! 메인 페이지로 이동합니다.");
          setTimeout(() => navigate("/"), 1500);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus(`로그인 실패: ${error.message}`);
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleAuth();
  }, [location.state, login, socialLogin, navigate]);

  return (
    <CallbackContainer>
      <CallbackCard>
        <LoadingSpinner />
        <StatusText>{status}</StatusText>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </CallbackCard>
    </CallbackContainer>
  );
};

// Styled Components
const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const CallbackCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 60px 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const StatusText = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-top: 10px;
`;

export default AuthCallback;