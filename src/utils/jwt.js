// JWT 토큰 관리 유틸리티

// JWT 토큰 디코딩 (페이로드만)
export const decodeJWT = (token) => {
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
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

// JWT 토큰 만료 확인
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

// JWT 토큰 유효성 검사
export const isValidToken = (token) => {
  if (!token) return false;
  
  const decoded = decodeJWT(token);
  if (!decoded) return false;
  
  return !isTokenExpired(token);
};

// 토큰에서 사용자 정보 추출
export const getUserFromToken = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  
  return {
    id: decoded.sub || decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
    // 기타 필요한 사용자 정보
  };
};

// 토큰 만료 시간까지 남은 시간 (초)
export const getTokenExpirationTime = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
};

// 토큰 갱신이 필요한지 확인 (만료 5분 전)
export const shouldRefreshToken = (token) => {
  const expirationTime = getTokenExpirationTime(token);
  return expirationTime > 0 && expirationTime < 300; // 5분 = 300초
};