import { atom } from 'recoil';

// 인증 상태 atom
export const authState = atom({
  key: 'authState',
  default: {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
  },
});

// 온보딩 상태 atom
export const onboardingState = atom({
  key: 'onboardingState',
  default: {
    currentStep: 0,
    isCompleted: false,
    userPreferences: {},
  },
});

// UI 상태 atom
export const uiState = atom({
  key: 'uiState',
  default: {
    sidebarOpen: false,
    theme: 'light',
    language: 'ko',
  },
});