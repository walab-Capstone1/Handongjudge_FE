import tokenManager from '../utils/tokenManager';

class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
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
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // 401 에러이고 리프레시 토큰이 있으면 토큰 갱신 시도
      if (response.status === 401 && tokenManager.getRefreshToken()) {
        try {
          await tokenManager.refreshToken();
          // 토큰 갱신 성공 시 원래 요청 재시도
          const newAccessToken = tokenManager.getAccessToken();
          if (newAccessToken) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            const retryResponse = await fetch(url, config);
            return this.handleResponse(retryResponse);
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 원래 에러 반환
          console.error('토큰 갱신 실패:', refreshError);
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

    // 토큰 저장
    if (response.accessToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  // 소셜 로그인
  async socialLogin(provider, token) {
    const response = await this.request('/auth/social-login', {
      method: 'POST',
      body: JSON.stringify({ provider, token }),
    });

    // 토큰 저장 (소셜 로그인의 경우 refresh token이 없을 수 있음)
    if (response.accessToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  // 토큰 갱신 (TokenManager로 위임)
  async refreshToken() {
    return await tokenManager.refreshToken();
  }

  // 로그아웃
  async logout() {
    try {
      const accessToken = tokenManager.getAccessToken();
      if (accessToken) {
        await this.request('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      tokenManager.clearTokens();
    }
  }

  // 사용자 정보 조회
  async getUserInfo() {
    const response = await this.request('/user/me');
    return response.data; // UserController에서 data 필드로 반환
  }

  // 인증 상태 확인
  async checkAuthStatus() {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) {
      return { isAuthenticated: false, user: null };
    }

    try {
      const user = await this.getUserInfo();
      return { isAuthenticated: true, user };
    } catch (error) {
      tokenManager.clearTokens();
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
    return tokenManager.isTokenValid();
  }

  // 토큰 갱신 필요 여부 확인
  shouldRefresh() {
    return tokenManager.shouldRefresh();
  }

  // 현재 액세스 토큰 반환
  getAccessToken() {
    return tokenManager.getAccessToken();
  }

  // 현재 리프레시 토큰 반환
  getRefreshToken() {
    return tokenManager.getRefreshToken();
  }
}

const apiService = new APIService();
export default apiService;