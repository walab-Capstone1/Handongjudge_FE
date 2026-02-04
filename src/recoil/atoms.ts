import { atom } from "recoil";

interface User {
	id: number;
	name?: string;
	username?: string;
	email: string;
	role?: string;
	[key: string]: any;
}

interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	accessToken: string | null;
	loading: boolean;
	error: string | null;
}

interface OnboardingState {
	currentStep: number;
	isCompleted: boolean;
	userPreferences: { [key: string]: any };
}

export const authState = atom<AuthState>({
	key: "authState",
	default: {
		isAuthenticated: false,
		user: null,
		accessToken: null,
		loading: true,
		error: null,
	},
});

export const onboardingState = atom<OnboardingState>({
	key: "onboardingState",
	default: {
		currentStep: 0,
		isCompleted: false,
		userPreferences: {},
	},
});

export const sidebarCollapsedState = atom<boolean>({
	key: "sidebarCollapsedState",
	default: false,
});
