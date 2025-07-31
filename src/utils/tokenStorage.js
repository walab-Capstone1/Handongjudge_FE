// 토큰 저장소 유틸리티
class TokenStorage {
  constructor() {
    this.ACCESS_TOKEN_KEY = 'accessToken';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
  }

  // Access Token 저장 (메모리 + localStorage)
  setAccessToken(token) {
    if (token) {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      // 민감한 정보는 메모리에만 저장
      this._accessToken = token;
    }
  }

  // Refresh Token 저장 (httpOnly 쿠키 권장, 여기서는 localStorage)
  setRefreshToken(token) {
    if (token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
      this._refreshToken = token;
    }
  }

  // Access Token 조회
  getAccessToken() {
    if (!this._accessToken) {
      this._accessToken = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return this._accessToken;
  }

  // Refresh Token 조회
  getRefreshToken() {
    if (!this._refreshToken) {
      this._refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return this._refreshToken;
  }

  // 모든 토큰 제거
  clearTokens() {
    this._accessToken = null;
    this._refreshToken = null;
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // 토큰 존재 여부 확인
  hasTokens() {
    return !!(this.getAccessToken() || this.getRefreshToken());
  }

  // Access Token만 존재하는지 확인
  hasAccessToken() {
    return !!this.getAccessToken();
  }

  // Refresh Token만 존재하는지 확인
  hasRefreshToken() {
    return !!this.getRefreshToken();
  }
}

export default new TokenStorage(); 