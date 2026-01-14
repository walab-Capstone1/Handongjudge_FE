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
        }));
      },
      // 토큰 만료 시
      () => {
        setAuth({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          loading: false,
          error: null,
        });
      }
    );
  }, [setAuth]);

  // 인증 상태 복원
  useEffect(() => {
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
          
          // 사용자 정보도 함께 가져오기
          try {
            const userInfo = await APIService.getUserInfo();
            setAuth(prev => ({
              ...prev,
              user: userInfo,
            }));
          } catch (userError) {
            // 사용자 정보 조회 실패해도 인증 상태는 유지
          }
        } else {
          setAuth(prev => ({
            ...prev,
            isAuthenticated: false,
            loading: false,
          }));
        }
      } catch (error) {
        setAuth(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
        }));
      }
    };

    restoreAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 앱 초기화 시 한 번만 실행

  // 로그인 함수
  const login = async (email, password) => {
    try {
      setAuth(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await APIService.login(email, password);

      setAuth({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
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



  // 로그아웃 함수
  const logout = async () => {
    try {
      setAuth(prev => ({ ...prev, loading: true }));
      
      await APIService.logout();
      
      setAuth({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      // 로그아웃 실패해도 로컬 상태는 초기화
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
    } catch (error) {
      setAuth(prev => ({
        ...prev,
        error: error.message || '사용자 정보 조회에 실패했습니다.',
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

  // 인증 상태 복원 함수 (더 이상 사용하지 않음 - 토큰은 메모리에만 저장)
  const restoreAuth = async () => {
    return null;
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
    logout,
    getUserInfo,
    requestPasswordReset,
    resetPassword,
    restoreAuth,
    clearError,
  };
};