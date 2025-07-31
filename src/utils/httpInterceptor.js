import tokenManager from './tokenManager';

// HTTP 인터셉터 클래스
class HttpInterceptor {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    this.pendingRequests = new Map();
  }

  // 요청 인터셉터
  async interceptRequest(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Access Token 추가
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return { url, config };
  }

  // 응답 인터셉터
  async interceptResponse(response, originalRequest) {
    if (response.status === 401) {
      return await this.handleUnauthorized(originalRequest);
    }
    return response;
  }

  // 401 에러 처리
  async handleUnauthorized(originalRequest) {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      // Refresh Token이 없으면 로그아웃
      tokenManager.handleTokenExpired();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    // 중복 토큰 갱신 요청 방지
    const requestKey = `${originalRequest.url}-${JSON.stringify(originalRequest.config)}`;
    
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const refreshPromise = this.performTokenRefresh(originalRequest);
    this.pendingRequests.set(requestKey, refreshPromise);

    try {
      const result = await refreshPromise;
      this.pendingRequests.delete(requestKey);
      return result;
    } catch (error) {
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }

  // 토큰 갱신 후 원래 요청 재시도
  async performTokenRefresh(originalRequest) {
    try {
      await tokenManager.refreshToken();
      
      // 새로운 Access Token으로 원래 요청 재시도
      const newAccessToken = tokenManager.getAccessToken();
      if (!newAccessToken) {
        throw new Error('토큰 갱신 실패');
      }

      const { url, config } = await this.interceptRequest(
        originalRequest.url,
        originalRequest.config
      );

      const retryResponse = await fetch(url, config);
      
      if (!retryResponse.ok) {
        throw new Error(`요청 재시도 실패: ${retryResponse.status}`);
      }

      return retryResponse;
    } catch (error) {
      console.error('토큰 갱신 및 요청 재시도 실패:', error);
      tokenManager.handleTokenExpired();
      throw error;
    }
  }

  // HTTP 요청 래퍼
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // 요청 인터셉터 적용
    const { config } = await this.interceptRequest(url, options);
    
    try {
      const response = await fetch(url, config);
      
      // 응답 인터셉터 적용
      const processedResponse = await this.interceptResponse(response, { url, config });
      
      return this.handleResponse(processedResponse);
    } catch (error) {
      console.error('HTTP 요청 오류:', error);
      throw error;
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
}

export default new HttpInterceptor(); 