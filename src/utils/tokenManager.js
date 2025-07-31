import { decodeJWT, isTokenExpired, shouldRefreshToken } from './jwt';
import tokenStorage from './tokenStorage';

class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.refreshTimeout = null;
    this.onTokenRefresh = null;
    this.onTokenExpired = null;
  }

  // 토큰 갱신 콜백 설정
  setCallbacks(onTokenRefresh, onTokenExpired) {
    this.onTokenRefresh = onTokenRefresh;
    this.onTokenExpired = onTokenExpired;
  }

  // 토큰 설정
  setTokens(accessToken, refreshToken) {
    if (accessToken) {
      tokenStorage.setAccessToken(accessToken);
    }
    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken);
    }
    
    // 토큰 갱신 스케줄링
    this.scheduleTokenRefresh();
  }

  // 토큰 제거
  clearTokens() {
    tokenStorage.clearTokens();
    this.clearRefreshTimeout();
    this.refreshPromise = null;
  }

  // 현재 Access Token 반환
  getAccessToken() {
    return tokenStorage.getAccessToken();
  }

  // 현재 Refresh Token 반환
  getRefreshToken() {
    return tokenStorage.getRefreshToken();
  }

  // 토큰 유효성 검사
  isTokenValid() {
    const token = this.getAccessToken();
    return token && !isTokenExpired(token);
  }

  // 토큰 갱신 필요 여부 확인
  shouldRefresh() {
    const token = this.getAccessToken();
    return token && shouldRefreshToken(token);
  }

  // 토큰 갱신 스케줄링
  scheduleTokenRefresh() {
    this.clearRefreshTimeout();
    
    const token = this.getAccessToken();
    if (!token) return;

    const expirationTime = this.getTokenExpirationTime(token);
    if (expirationTime <= 0) return;

    // 만료 5분 전에 갱신
    const refreshTime = Math.max(0, expirationTime - 300) * 1000;
    
    this.refreshTimeout = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  // 토큰 만료 시간까지 남은 시간 (초)
  getTokenExpirationTime(token) {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  }

  // 토큰 갱신 (중복 요청 방지)
  async refreshToken() {
    // 이미 갱신 중이면 기존 Promise 반환
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.handleTokenExpired();
      return;
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  // 실제 토큰 갱신 수행
  async performTokenRefresh(refreshToken) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        
        if (this.onTokenRefresh) {
          this.onTokenRefresh(data);
        }
        
        return data;
      } else {
        throw new Error('토큰 갱신 실패');
      }
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      this.handleTokenExpired();
      throw error;
    }
  }

  // 토큰 만료 처리
  handleTokenExpired() {
    this.clearTokens();
    if (this.onTokenExpired) {
      this.onTokenExpired();
    }
  }

  // 갱신 타임아웃 제거
  clearRefreshTimeout() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  // 토큰 복원 (앱 시작 시)
  async restoreTokens() {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    console.log('토큰 복원 시도:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isAccessTokenValid: accessToken ? this.isTokenValid() : false
    });
    
    // 토큰이 전혀 없는 경우
    if (!accessToken && !refreshToken) {
      console.log('토큰이 전혀 없음');
      return null;
    }
    
    if (accessToken && this.isTokenValid()) {
      console.log('Access Token이 유효함, 스케줄링 설정');
      this.scheduleTokenRefresh();
      return { accessToken, refreshToken };
    } else if (refreshToken) {
      // Access Token이 만료되었지만 Refresh Token이 있으면 갱신 시도
      console.log('Access Token이 만료됨, Refresh Token으로 갱신 시도');
      try {
        const result = await this.refreshToken();
        console.log('토큰 갱신 성공');
        return result;
      } catch (error) {
        console.error('토큰 복원 중 갱신 실패:', error);
        // 토큰 갱신 실패 시 토큰 제거
        this.clearTokens();
        return null;
      }
    }
    
    console.log('토큰이 유효하지 않음');
    // 유효하지 않은 토큰 제거
    this.clearTokens();
    return null;
  }
}

export default new TokenManager(); 