import styled from "styled-components";

export const Panel = styled.div<{ $dragging?: boolean }>`
  position: relative;
  height: 100%;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: ${(props) => (props.$dragging ? 1000 : 1)};

  &:hover {
    border-color: rgba(88, 166, 255, 0.3);
  }

  ${(props) =>
		props.$dragging &&
		`
    border-color: rgba(88, 166, 255, 0.9);
    box-shadow: 0 12px 32px rgba(88, 166, 255, 0.6);
    transform: rotate(2deg) scale(1.05);
    border-width: 3px;
  `}

  .problem-solve-page.light &:hover {
    border-color: rgba(9, 105, 218, 0.3);
  }

  .problem-solve-page.light & {
    ${(props) =>
			props.$dragging &&
			`
      border-color: rgba(9, 105, 218, 0.9);
      box-shadow: 0 12px 32px rgba(9, 105, 218, 0.4);
      border-width: 3px;
    `}
  }
`;

export const DragHandle = styled.div<{ $dragging?: boolean }>`
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  padding: 6px 10px;
  border-radius: 6px;
  z-index: 10;
  opacity: 0;
  transition: all 0.2s ease;
  cursor: ${(props) => (props.$dragging ? "grabbing" : "grab")};
  border: 1px solid rgba(88, 166, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  pointer-events: auto;

  ${Panel}:hover & {
    opacity: 1;
    transform: translate(-50%, -52%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  ${(props) =>
		props.$dragging &&
		`
    opacity: 1;
    background: rgba(88, 166, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -54%);
    box-shadow: 0 6px 16px rgba(88, 166, 255, 0.5);
  `}

  &:active {
    cursor: grabbing;
  }

  .problem-solve-page.light & {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(9, 105, 218, 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    ${(props) =>
			props.$dragging &&
			`
      background: rgba(9, 105, 218, 0.9);
      border-color: rgba(255, 255, 255, 0.8);
      color: white;
    `}
  }
`;

export const DragIcon = styled.span`
  color: #58a6ff;
  font-size: 12px;
  font-weight: bold;
  transform: rotate(90deg);
  line-height: 1;

  .problem-solve-page.light & {
    color: #0969da;
  }

  ${DragHandle}[data-dragging="true"] & {
    color: white;
  }
`;

export const PanelTitle = styled.span`
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;

  .problem-solve-page.light & {
    color: #24292e;
  }

  ${DragHandle}[data-dragging="true"] & {
    color: white;
  }
`;

export const DropIndicator = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(88, 166, 255, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 1001;

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(88, 166, 255, 0.9);
  }
`;

export const PanelContent = styled.div`
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
