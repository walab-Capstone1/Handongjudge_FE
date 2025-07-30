import { decodeJWT, isTokenExpired, shouldRefreshToken } from '../utils/jwt';

class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.accessToken = null;
    this.refreshToken = null;
  }

  // 토큰 설정
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // 토큰 초기화
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  // HTTP 요청 헬퍼 함수
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 액세스 토큰이 있으면 헤더에 추가
    if (this.accessToken) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // 401 에러이고 리프레시 토큰이 있으면 토큰 갱신 시도
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // 토큰 갱신 성공 시 원래 요청 재시도
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, config);
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API 요청 오류:', error);
      throw new Error('네트워크 오류가 발생했습니다.');
    }
  }

  // 응답 처리
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // 일반 로그인
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  // 소셜 로그인
  async socialLogin(provider, token) {
    const response = await this.request('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({ provider, token }),
    });

    if (response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  // 토큰 갱신
  async refreshToken() {
    if (!this.refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      this.clearTokens();
      return false;
    }
  }

  // 로그아웃
  async logout() {
    try {
      if (this.accessToken) {
        await this.request('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      this.clearTokens();
    }
  }

  // 사용자 정보 조회
  async getUserInfo() {
    return await this.request('/auth/me');
  }

  // 인증 상태 확인
  async checkAuthStatus() {
    if (!this.accessToken) {
      return { isAuthenticated: false, user: null };
    }

    try {
      const user = await this.getUserInfo();
      return { isAuthenticated: true, user };
    } catch (error) {
      this.clearTokens();
      return { isAuthenticated: false, user: null };
    }
  }

  // 비밀번호 재설정 요청
  async requestPasswordReset(email) {
    return await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // 비밀번호 재설정
  async resetPassword(token, newPassword) {
    return await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // 토큰 유효성 검사
  isTokenValid() {
    if (!this.accessToken) return false;
    return !isTokenExpired(this.accessToken);
  }

  // 토큰 갱신 필요 여부 확인
  shouldRefresh() {
    if (!this.accessToken) return false;
    return shouldRefreshToken(this.accessToken);
  }

  // 현재 액세스 토큰 반환
  getAccessToken() {
    return this.accessToken;
  }

  // 현재 리프레시 토큰 반환
  getRefreshToken() {
    return this.refreshToken;
  }
}

export default new APIService();