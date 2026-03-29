import { useRecoilState } from 'recoil';
import { authState } from '../recoil/atoms';
import APIService from '../services/APIService';
import tokenManager from '../utils/tokenManager';
import { useEffect, useRef } from 'react';

export const useAuth = () => {
  const [auth, setAuth] = useRecoilState(authState);
  // 동일 훅이 여러 컴포넌트에서 동시에 마운트되어도 restoreAuth는 한 번만 실행
  const restored = useRef(false);

  // 토큰 만료/갱신 콜백 등록 (tokenManager 싱글턴에 세팅)
  useEffect(() => {
    tokenManager.setCallbacks(
      (tokens: any) => {
        setAuth(prev => ({
          ...prev,
          accessToken: tokens.accessToken,
        }));
      },
      () => {
        window.alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        setAuth({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          loading: false,
          error: null,
        });
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const encodedRedirect = encodeURIComponent(currentPath);
        const loginUrl = `/login?redirectTo=${encodedRedirect}`;
        if (window.location.pathname !== "/login") {
          window.location.href = loginUrl;
        }
      }
    );
  }, [setAuth]);

  // 페이지 최초 로드 시 인증 상태 복원
  // AuthInitializer(App.tsx)가 최상단에서 이 훅을 마운트하므로 한 번만 실행됨.
  // Header/Sidebar 등에서 추가로 useAuth()를 쓰더라도 restored ref로 중복 실행 방지.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const restoreAuthState = async () => {
      try {
        const restoredTokens = await tokenManager.restoreAuth();
        if (restoredTokens) {
          setAuth(prev => ({
            ...prev,
            isAuthenticated: true,
            accessToken: restoredTokens.accessToken,
            loading: false,
          }));

          try {
            const userInfo = await APIService.getUserInfo();
            setAuth(prev => ({ ...prev, user: userInfo }));
          } catch {
            // 사용자 정보 조회 실패해도 인증 상태는 유지
          }
        } else {
          setAuth(prev => ({ ...prev, isAuthenticated: false, loading: false }));
        }
      } catch {
        setAuth(prev => ({ ...prev, isAuthenticated: false, loading: false }));
      }
    };

    restoreAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await APIService.login(email, password);
      const { accessToken, refreshToken, user } = response.data || response;

      tokenManager.setAccessToken(accessToken);

      setAuth({
        isAuthenticated: true,
        user: user,
        accessToken: accessToken,
        loading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        loading: false,
        error: error.message || '로그인에 실패했습니다.',
      }));
      return { success: false, error };
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      
      await APIService.logout();
      
      tokenManager.clearTokens();
      
      setAuth({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      // 로그아웃 실패해도 로컬 상태는 초기화
      tokenManager.clearTokens();
      setAuth({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        loading: false,
        error: null,
      });
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
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '사용자 정보 조회에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 비밀번호 재설정 요청 함수
  const requestPasswordReset = async (email: string) => {
    try {
      return await APIService.requestPasswordReset(email);
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '비밀번호 재설정 요청에 실패했습니다.',
      }));
      throw error;
    }
  };

  // 비밀번호 재설정 함수
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      return await APIService.resetPassword(token, newPassword);
    } catch (error: any) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '비밀번호 재설정에 실패했습니다.',
      }));
      throw error;
    }
  };

  const restoreAuth = async () => {
    return tokenManager.restoreAuth();
  };

  // 에러 초기화 함수
  const clearError = () => {
    setAuth(prev => ({ ...prev, error: null }));
  };

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    accessToken: auth.accessToken,
    loading: auth.loading,
    error: auth.error,
    
    login,
    logout,
    getUserInfo,
    requestPasswordReset,
    resetPassword,
    restoreAuth,
    clearError,
  };
};
