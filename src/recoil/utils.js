import { selector } from 'recoil';
import { authState, onboardingState, uiState } from './atoms';

// 인증 관련 selectors
export const isLoggedInSelector = selector({
  key: 'isLoggedInSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.isAuthenticated && auth.accessToken;
  },
});

export const userSelector = selector({
  key: 'userSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.user;
  },
});

export const authLoadingSelector = selector({
  key: 'authLoadingSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.loading;
  },
});

export const authErrorSelector = selector({
  key: 'authErrorSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.error;
  },
});

export const accessTokenSelector = selector({
  key: 'accessTokenSelector',
  get: ({ get }) => {
    const auth = get(authState);
    return auth.accessToken;
  },
});

// 온보딩 관련 selectors
export const onboardingStepSelector = selector({
  key: 'onboardingStepSelector',
  get: ({ get }) => {
    const onboarding = get(onboardingState);
    return onboarding.currentStep;
  },
});

export const onboardingCompletedSelector = selector({
  key: 'onboardingCompletedSelector',
  get: ({ get }) => {
    const onboarding = get(onboardingState);
    return onboarding.isCompleted;
  },
});

// UI 관련 selectors
export const sidebarOpenSelector = selector({
  key: 'sidebarOpenSelector',
  get: ({ get }) => {
    const ui = get(uiState);
    return ui.sidebarOpen;
  },
});

export const themeSelector = selector({
  key: 'themeSelector',
  get: ({ get }) => {
    const ui = get(uiState);
    return ui.theme;
  },
});