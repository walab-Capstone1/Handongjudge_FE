// 테마 설정

export const colors = {
	// Primary colors
	primary: "#4A90E2",
	primaryDark: "#357ABD",
	primaryLight: "#6FA8E8",

	// Secondary colors
	secondary: "#50C878",
	secondaryDark: "#3DA55E",
	secondaryLight: "#6FD88E",

	// Neutral colors
	black: "#1a1a1a",
	darkGray: "#333333",
	gray: "#666666",
	lightGray: "#999999",
	lighterGray: "#CCCCCC",
	border: "#E0E0E0",
	background: "#F5F5F5",
	white: "#FFFFFF",

	// Status colors
	success: "#4CAF50",
	warning: "#FF9800",
	error: "#F44336",
	info: "#2196F3",

	// Text colors
	text: {
		primary: "#1a1a1a",
		secondary: "#666666",
		disabled: "#999999",
		white: "#FFFFFF",
	},
};

export const spacing = {
	xs: "4px",
	sm: "8px",
	md: "16px",
	lg: "24px",
	xl: "32px",
	xxl: "48px",
};

export const borderRadius = {
	sm: "4px",
	md: "8px",
	lg: "12px",
	xl: "16px",
	full: "9999px",
};

export const shadows = {
	sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
	md: "0 4px 6px rgba(0, 0, 0, 0.1)",
	lg: "0 10px 20px rgba(0, 0, 0, 0.1)",
	xl: "0 20px 40px rgba(0, 0, 0, 0.1)",
};

export const breakpoints = {
	mobile: "480px",
	tablet: "768px",
	desktop: "1024px",
	wide: "1280px",
};

export const theme = {
	colors,
	spacing,
	borderRadius,
	shadows,
	breakpoints,
};

export type Theme = typeof theme;
