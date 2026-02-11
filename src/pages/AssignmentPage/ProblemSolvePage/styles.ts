import styled from "styled-components";

export const PageWrapper = styled.div<{ $theme: "light" | "dark" }>`
	height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: #161b22;
	color: #eff5f2;

	${(p) =>
		p.$theme === "light" &&
		`
		background-color: #ffffff;
		color: #000000;
	`}

	/* Scrollbar */
	& * {
		scrollbar-width: thin;
		scrollbar-color: #555 #1e1e1e;
	}
	&.light * {
		scrollbar-width: thin;
		scrollbar-color: #d1d5db #f8f9fa;
	}
	& *::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}
	& *::-webkit-scrollbar-track {
		background: #1e1e1e;
	}
	& *::-webkit-scrollbar-thumb {
		background-color: #444;
		border-radius: 10px;
	}
	&.light *::-webkit-scrollbar-track {
		background: #f8f9fa;
	}
	&.light *::-webkit-scrollbar-thumb {
		background-color: #d1d5db;
		border-radius: 10px;
	}
	&.light *::-webkit-scrollbar-thumb:hover {
		background-color: #9ca3af;
	}

	/* Gutter (react-split) */
	& .gutter {
		position: relative;
		transition: background-color 0.2s ease;
		z-index: 10;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		padding: 8px 0;
		background-color: #2d3748;
	}
	& .gutter.gutter-horizontal {
		padding: 0 8px;
	}
	& .gutter:hover {
		background-color: #718096 !important;
	}
	& .gutter:active {
		background-color: #718096 !important;
	}
	&.light .gutter {
		background-color: #cbd5e0 !important;
	}
	&.light .gutter:hover,
	&.light .gutter:active {
		background-color: #9aa0a6 !important;
	}
	& .gutter::after {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #151028;
		border-radius: 1px;
		opacity: 0.7;
		transition: opacity 0.2s ease;
		pointer-events: none;
	}
	&.light .gutter::after {
		background-color: #ffffff;
	}
	& .gutter:hover::after {
		opacity: 1;
	}
	& .gutter.gutter-horizontal::after {
		width: 4px;
		height: 40px;
	}
	& .gutter.gutter-vertical::after {
		width: 40px;
		height: 4px;
	}
	& .gutter.gutter-horizontal {
		cursor: col-resize !important;
		border-left: 1px solid #30363d;
		border-right: 1px solid #30363d;
	}
	&.light .gutter.gutter-horizontal {
		border-left: 1px solid #e1e4e8;
		border-right: 1px solid #e1e4e8;
	}
	& .gutter.gutter-vertical {
		cursor: row-resize !important;
		border-top: 1px solid #30363d;
		border-bottom: 1px solid #30363d;
	}
	&.light .gutter.gutter-vertical {
		border-top: 1px solid #e1e4e8;
		border-bottom: 1px solid #e1e4e8;
	}
`;

export const LoadingContainer = styled.div<{ $theme: "light" | "dark" }>`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: ${(p) => (p.$theme === "light" ? "#ffffff" : "#161b22")};
`;

export const Header = styled.div<{ $theme: "light" | "dark" }>`
	padding: 12px 24px;
	border-bottom: 1px solid ${(p) => (p.$theme === "light" ? "#e1e4e8" : "#30363d")};
	background-color: ${(p) => (p.$theme === "light" ? "#ffffff" : "#161b22")};
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Breadcrumb = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const BreadcrumbLink = styled.button`
	color: #58a6ff;
	cursor: pointer;
	text-decoration: none;
	background: none;
	border: none;
	font: inherit;
	padding: 0;

	.problem-solve-page.light & {
		color: #0969da;
	}
	&:hover {
		text-decoration: underline;
	}
`;

export const BreadcrumbCurrent = styled.strong<{ $theme: "light" | "dark" }>`
	color: ${(p) => (p.$theme === "light" ? "#000000" : "#eff5f2")};
`;

export const Controls = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

export const ThemeButton = styled.button<{
	$active?: boolean;
	$theme: "light" | "dark";
}>`
	padding: 4px 10px;
	margin-right: 4px;
	background-color: ${(p) => (p.$theme === "light" ? "#f6f8fa" : "#21262d")};
	color: ${(p) => (p.$theme === "light" ? "#24292e" : "#c9d1d9")};
	border: 1px solid ${(p) => (p.$theme === "light" ? "#e1e4e8" : "#30363d")};
	border-radius: 4px;
	cursor: pointer;

	${(p) =>
		p.$active &&
		`
		background-color: #2f81f7;
		color: #ffffff;
		border-color: #2f81f7;
	`}
`;

export const LanguageSelect = styled.select<{ $theme: "light" | "dark" }>`
	padding: 4px 10px;
	border-radius: 4px;
	background-color: ${(p) => (p.$theme === "light" ? "#ffffff" : "#21262d")};
	color: ${(p) => (p.$theme === "light" ? "#000000" : "#c9d1d9")};
	border: 1px solid ${(p) => (p.$theme === "light" ? "#e1e4e8" : "#30363d")};
`;

export const MainSplit = styled.div`
	flex: 1;
	display: flex;
	overflow: hidden;
	min-height: 0;
`;

export const SaveModal = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 10000;
	animation: fadeIn 0.2s ease-in-out;

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
`;

export const SaveModalContent = styled.div`
	background-color: #4a5568;
	color: white;
	padding: 20px 40px;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	display: flex;
	align-items: center;
	gap: 12px;
	font-weight: 600;
	font-size: 16px;

	.problem-solve-page.light & {
		background-color: #718096;
	}
`;

export const SaveModalIcon = styled.span`
	font-size: 24px;
`;

export const SaveModalText = styled.span`
	font-size: 16px;
`;
