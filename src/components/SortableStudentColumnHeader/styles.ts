import styled from "styled-components";

export const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	width: 100%;
	min-width: 0;
	box-sizing: border-box;
`;

export const Label = styled.span`
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: left;
`;

export const ArrowSlot = styled.span<{ $dim?: boolean }>`
	flex: 0 0 1.35em;
	width: 1.35em;
	text-align: center;
	font-size: 0.72rem;
	line-height: 1;
	opacity: ${(p) => (p.$dim ? 0.4 : 1)};
	font-weight: 700;
`;
