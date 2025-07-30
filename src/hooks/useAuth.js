import { useRecoilState } from 'recoil';
import { authState } from '../recoil/atoms';
import APIService from '../services/APIService';

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  // 로그인 함수
  const login = async (email, password) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await APIService.login(email, password);
      
      setAuth({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message || '로그인에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 소셜 로그인 함수
  const socialLogin = async (provider, token) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await APIService.socialLogin(provider, token);
      
      setAuth({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        loading: false,
        error: null,
      });

      return response;
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message || '소셜 로그인에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      
      await APIService.logout();
      
      setAuth({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // 로그아웃 실패해도 로컬 상태는 초기화
      setAuth({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,
      });
    }
  };

  // 토큰 갱신 함수
  const refreshToken = async () => {
    try {
      const response = await APIService.refreshToken();
      
      setAuth(prev => ({
        ...prev,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }));

      return response;
    } catch (error) {
      // 토큰 갱신 실패 시 로그아웃
      await logout();
      throw error;
    }
  };

  // 사용자 정보 조회 함수
  const getUserInfo = async () => {
    try {
      const userInfo = await APIService.getUserInfo();
      
      setAuth(prev => ({
        ...prev,
        user: userInfo,
      }));

      return userInfo;
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '사용자 정보 조회에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 인증 상태 확인 함수
  const checkAuthStatus = async () => {
    try {
      const status = await APIService.checkAuthStatus();
      
      setAuth(prev => ({
        ...prev,
        isAuthenticated: status.isAuthenticated,
        user: status.user,
      }));

      return status;
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      throw error;
    }
  };

  // 비밀번호 재설정 요청 함수
  const requestPasswordReset = async (email) => {
    try {
      return await APIService.requestPasswordReset(email);
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '비밀번호 재설정 요청에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 비밀번호 재설정 함수
  const resetPassword = async (token, newPassword) => {
    try {
      return await APIService.resetPassword(token, newPassword);
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '비밀번호 재설정에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 에러 초기화 함수
  const clearError = () => {
    setAuth(prev => ({ ...prev, error: null }));
  };

  return {
    // 상태
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    accessToken: auth.accessToken,
    loading: auth.loading,
    error: auth.error,
    
    // 함수
    login,
    socialLogin,
    logout,
    refreshToken,
    getUserInfo,
    checkAuthStatus,
    requestPasswordReset,
    resetPassword,
    clearError,
  };
};