import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styled from "styled-components";

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, socialLogin, error } = useAuth();
  const [status, setStatus] = useState("처리 중...");
  const hasProcessed = useRef(false); // 처리 완료 여부 추적

  useEffect(() => {
    // 이미 처리했다면 중복 실행 방지
    if (hasProcessed.current) return;

    const handleAuth = async () => {
      try {
        hasProcessed.current = true; // 처리 시작 표시

        // URL 파라미터에서 토큰 확인 (OAuth 콜백용)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");

        if (accessToken) {
          // OAuth 콜백으로 들어온 경우
          setStatus("소셜 로그인 처리 중...");
          console.log("Received access token:", accessToken);

          try {
            // 토큰을 직접 저장하고 인증 상태 설정
            const tokenManager = await import("../../utils/tokenManager");
            tokenManager.default.setAccessToken(accessToken);
            console.log("Access token saved to memory");

            // 사용자 정보 조회
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://hj.walab.info/api'}/user/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const userInfo = await response.json();
              console.log("소셜 로그인 성공:", userInfo);
              
              // 인증 상태 설정
              setStatus("소셜 로그인 성공! 메인 페이지로 이동합니다.");
              setTimeout(() => {
                navigate("/main");
              }, 1500);
            } else {
              const errorData = await response.json();
              throw new Error(errorData.message || "사용자 정보 조회 실패");
            }
          } catch (socialError) {
            console.error("Social login error:", socialError);
            setStatus(`소셜 로그인 실패: ${socialError.message}`);
            setTimeout(() => navigate("/"), 3000);
          }
          return;
        }

        // 기존 로직 (navigate state를 통한 일반 로그인)
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
          setTimeout(() => navigate("/main"), 1500);
        } else if (type === "social") {
          setStatus(`${provider} 로그인 중...`);

          // state를 통한 소셜 로그인의 경우 토큰이 있어야 함
          const { token } = location.state || {};
          if (!token) {
            throw new Error("소셜 로그인 토큰이 없습니다.");
          }

          await socialLogin(provider, token);
          setStatus("소셜 로그인 성공! 메인 페이지로 이동합니다.");
          setTimeout(() => navigate("/main"), 1500);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus(`로그인 실패: ${error.message}`);
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleAuth();
  }, [location.state, login, navigate, socialLogin]); // 필요한 의존성 추가

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