import { useRecoilState } from 'recoil';
import { authState } from '../recoil/atoms';
import APIService from '../services/APIService';
import tokenManager from '../utils/tokenManager';
import { useEffect } from 'react';

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);

  // 토큰 갱신 콜백 설정
  useEffect(() => {
    tokenManager.setCallbacks(
      // 토큰 갱신 성공 시
      (tokens) => {
        setAuth(prev => ({
          ...prev,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }));
      },
      // 토큰 만료 시
      () => {
        setAuth({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
          error: null,
        });
      }
    );
  }, [setAuth]);

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
      
      // 토큰 제거
      tokenManager.clearTokens();
      
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
      tokenManager.clearTokens();
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
      const response = await tokenManager.refreshToken();
      
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

  // 인증 상태 복원 함수 (앱 시작 시)
  const restoreAuth = async () => {
    try {
      console.log('인증 상태 복원 시작');
      setAuth(prev => ({ ...prev, loading: true }));
      
      const tokens = await tokenManager.restoreTokens();
      console.log('토큰 복원 결과:', tokens ? '성공' : '실패');
      
      if (tokens) {
        // 토큰이 유효하면 사용자 정보 조회
        console.log('사용자 정보 조회 시작');
        try {
          const userInfo = await APIService.getUserInfo();
          console.log('사용자 정보 조회 성공:', userInfo);
          
          setAuth({
            isAuthenticated: true,
            user: userInfo,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            loading: false,
            error: null,
          });
        } catch (userError) {
          console.error('사용자 정보 조회 실패:', userError);
          // 사용자 정보 조회 실패 시 토큰 제거
          tokenManager.clearTokens();
          setAuth({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            loading: false,
            error: null,
          });
        }
      } else {
        console.log('토큰이 없거나 유효하지 않음');
        setAuth({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('인증 상태 복원 실패:', error);
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
    restoreAuth,
    clearError,
  };
};