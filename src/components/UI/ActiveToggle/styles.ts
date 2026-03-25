import styled from "styled-components";

export const ToggleTrack = styled.button<{ $active: boolean }>`
	display: inline-flex;
	align-items: center;
	justify-content: space-between;
	min-width: 72px;
	height: 32px;
	padding: 0 6px;
	margin-right: 6px;
	border: 1px solid rgba(0, 0, 0, 0.15);
	border-radius: 6px;
	background-color: ${(p) => (p.$active ? "#22c55e" : "#ef4444")};
	color: white;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.2s;
	/* 트랙이 살짝 들어간 느낌 → 노브가 올라와 보이게 */
	box-shadow:
		inset 0 2px 4px rgba(0, 0, 0, 0.15),
		0 1px 2px rgba(0, 0, 0, 0.08);

	&:focus {
		outline: 2px solid ${(p) => (p.$active ? "#22c55e" : "#ef4444")};
		outline-offset: 2px;
	}
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export const ToggleKnob = styled.span<{ $active: boolean }>`
	width: 24px;
	height: 24px;
	border-radius: 4px;
	background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
	border: 1px solid rgba(255, 255, 255, 0.9);
	flex-shrink: 0;
	order: ${(p) => (p.$active ? 2 : 0)};
	transition: box-shadow 0.2s;
	/* 입체감: 위쪽 하이라이트 + 아래쪽 그림자 */
	box-shadow:
		0 2px 4px rgba(0, 0, 0, 0.25),
		0 1px 0 rgba(255, 255, 255, 0.4) inset;
`;

export const ToggleLabel = styled.span`
	order: 1;
	user-select: none;
	white-space: nowrap;
	padding: 0 4px;
`;
