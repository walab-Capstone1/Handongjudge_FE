// 토큰 매니저
// Access Token은 localStorage에 저장, Refresh Token은 httpOnly 쿠키에서 처리

class TokenManager {
  constructor() {
    this.accessToken = this.getStoredAccessToken();
    this.onTokenRefresh = null;
    this.onTokenExpired = null;
  }

  // 콜백 설정
  setCallbacks(onTokenRefresh, onTokenExpired) {
    this.onTokenRefresh = onTokenRefresh;
    this.onTokenExpired = onTokenExpired;
  }

  // localStorage에서 토큰 가져오기
  getStoredAccessToken() {
    try {
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('localStorage 접근 오류:', error);
      return null;
    }
  }

  // localStorage에 토큰 저장
  setStoredAccessToken(token) {
    try {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('localStorage 저장 오류:', error);
    }
  }

  // Access Token 설정 (localStorage에 저장)
  setAccessToken(token) {
    this.accessToken = token;
    this.setStoredAccessToken(token);
  }

  // Access Token 반환
  getAccessToken() {
    return this.accessToken;
  }

  // 토큰 제거
  clearTokens() {
    this.accessToken = null;
    this.setStoredAccessToken(null);
  }

  // 토큰 유효성 검사
  isTokenValid() {
    return this.accessToken && !this.isTokenExpired(this.accessToken);
  }

  // 토큰 만료 확인
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = this.decodeJWT(token);
      if (!payload || !payload.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // JWT 디코딩
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  // 토큰 갱신 (Refresh Token은 쿠키에서 자동으로 전송됨)
  async refreshToken() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://hj.walab.info/api'}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // 쿠키 포함
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        
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

  // 인증 상태 복원
  async restoreAuth() {
    const token = this.getStoredAccessToken();
    if (token && !this.isTokenExpired(token)) {
      this.accessToken = token;
      return { accessToken: token };
    }
    return null;
  }
}

export default new TokenManager(); 