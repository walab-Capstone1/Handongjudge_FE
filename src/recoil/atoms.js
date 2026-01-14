import { atom } from 'recoil';

// 인증 상태 atom
export const authState = atom({
  key: 'authState',
  default: {
    isAuthenticated: false,
    user: null,
    accessToken: null,
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

// 사이드바 접기 상태 atom
export const sidebarCollapsedState = atom({
  key: 'sidebarCollapsedState',
  default: false,
});