import styled from "styled-components";

export const Backdrop = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
`;

export const Modal = styled.div`
	background-color: #161b22;
	border-radius: 8px;
	border: 1px solid #30363d;
	min-width: 400px;
	max-width: 600px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

	.problem-solve-page.light & {
		background-color: #ffffff;
		border: 1px solid #e1e4e8;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
`;

export const Header = styled.div`
	padding: 16px 20px;
	border-bottom: 1px solid #30363d;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.problem-solve-page.light & {
		border-bottom: 1px solid #e1e4e8;
	}
`;

export const Title = styled.h2`
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	color: #c9d1d9;

	.problem-solve-page.light & {
		color: #24292e;
	}
`;

export const CloseButton = styled.button`
	background: none;
	border: none;
	color: #8b949e;
	font-size: 24px;
	cursor: pointer;
	padding: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	transition: background-color 0.2s;

	&:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.problem-solve-page.light & {
		color: #57606a;
		&:hover {
			background-color: rgba(0, 0, 0, 0.05);
		}
	}
`;

export const Notice = styled.div`
	padding: 12px 20px;
	background-color: rgba(255, 193, 7, 0.1);
	border-bottom: 1px solid #30363d;
	color: #ffc107;
	font-size: 13px;
	font-weight: 500;

	.problem-solve-page.light & {
		background-color: rgba(255, 193, 7, 0.1);
		border-bottom: 1px solid #e1e4e8;
		color: #856404;
	}
`;

export const ProblemList = styled.div`
	padding: 12px;
	overflow-y: auto;
	max-height: 60vh;
`;

export const ProblemItem = styled.div<{ $active?: boolean }>`
	padding: 16px;
	margin-bottom: 8px;
	border-radius: 6px;
	border: 1px solid #30363d;
	background-color: #0d1117;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background-color: #161b22;
		border-color: #58a6ff;
	}

	${(p) =>
		p.$active &&
		`
		background-color: rgba(88, 166, 255, 0.15);
		border-color: #58a6ff;
	`}

	.problem-solve-page.light & {
		background-color: #f6f8fa;
		border: 1px solid #d0d7de;

		&:hover {
			background-color: #ffffff;
			border-color: #0969da;
		}

		${(p) =>
			p.$active &&
			`
			background-color: rgba(9, 105, 218, 0.1);
			border-color: #0969da;
		`}
	}
`;

export const ProblemNumber = styled.div`
	font-size: 12px;
	color: #8b949e;
	margin-bottom: 4px;
	font-weight: 500;

	.problem-solve-page.light & {
		color: #57606a;
	}
`;

export const ProblemTitle = styled.div`
	font-size: 14px;
	color: #c9d1d9;
	font-weight: 600;

	.problem-solve-page.light & {
		color: #24292e;
	}
`;

export const ProblemStatus = styled.div<{ $tone: "ok" | "bad" | "warn" | "idle" }>`
	margin-top: 8px;
	font-size: 12px;
	font-weight: 700;
	display: inline-flex;
	align-items: center;
	padding: 4px 9px;
	border-radius: 999px;
	border: 1px solid transparent;

	${(p) =>
		p.$tone === "ok" &&
		`
		color: #2da44e;
		background: rgba(45, 164, 78, 0.18);
		border-color: rgba(45, 164, 78, 0.35);
	`}
	${(p) =>
		p.$tone === "bad" &&
		`
		color: #ff6b6b;
		background: rgba(248, 81, 73, 0.2);
		border-color: rgba(248, 81, 73, 0.4);
	`}
	${(p) =>
		p.$tone === "warn" &&
		`
		color: #f2b233;
		background: rgba(210, 153, 34, 0.22);
		border-color: rgba(210, 153, 34, 0.45);
	`}
	${(p) =>
		p.$tone === "idle" &&
		`
		color: #9aa4af;
		background: rgba(139, 148, 158, 0.2);
		border-color: rgba(139, 148, 158, 0.35);
	`}

	.problem-solve-page.light & {
		${(p) =>
			p.$tone === "ok" &&
			`
			color: #1a7f37;
			background: rgba(26, 127, 55, 0.14);
			border-color: rgba(26, 127, 55, 0.28);
		`}
		${(p) =>
			p.$tone === "bad" &&
			`
			color: #cf222e;
			background: rgba(207, 34, 46, 0.12);
			border-color: rgba(207, 34, 46, 0.24);
		`}
		${(p) =>
			p.$tone === "warn" &&
			`
			color: #9a6700;
			background: rgba(154, 103, 0, 0.14);
			border-color: rgba(154, 103, 0, 0.3);
		`}
		${(p) =>
			p.$tone === "idle" &&
			`
			color: #57606a;
			background: rgba(87, 96, 106, 0.1);
			border-color: rgba(87, 96, 106, 0.2);
		`}
	}
`;
