// 보안 관련 유틸리티

// XSS 방지를 위한 HTML 이스케이프
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// CSRF 토큰 생성
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// 토큰 보안 검증
export const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT 형식 검증 (header.payload.signature)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Base64 디코딩 가능 여부 확인
  try {
    parts.forEach(part => {
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (error) {
    return false;
  }
};

// 민감한 정보 마스킹
export const maskSensitiveData = (data, fields = ['password', 'token', 'secret']) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const masked = { ...data };
  
  fields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***';
    }
  });
  
  return masked;
};

// 안전한 로컬 스토리지 사용
export const safeStorage = {
  setItem: (key, value) => {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('로컬 스토리지 읽기 실패:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('로컬 스토리지 삭제 실패:', error);
    }
  }
};

// 세션 스토리지 래퍼
export const safeSessionStorage = {
  setItem: (key, value) => {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error('세션 스토리지 저장 실패:', error);
    }
  },
  
  getItem: (key) => {
    try {
      const value = sessionStorage.getItem(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('세션 스토리지 읽기 실패:', error);
      return null;
    }
  },
  
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('세션 스토리지 삭제 실패:', error);
    }
  }
}; 