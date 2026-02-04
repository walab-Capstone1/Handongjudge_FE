import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.8), 0 0 0 8px rgba(102, 126, 234, 0.2);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Container = styled.div`
  position: fixed;
  z-index: 1000;
  user-select: none;
  pointer-events: auto;
`;

export const IconButton = styled.button<{
	$hasUnread?: boolean;
	$dragging?: boolean;
}>`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  color: white;
  font-size: 1.5rem;
  touch-action: none;

  ${(props) => props.$hasUnread && `animation: ${pulse} 2s ease-in-out infinite;`}

  ${(props) =>
		props.$dragging &&
		`
    cursor: grabbing;
    transform: scale(1.1);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6);
    z-index: 1001;
  `}

  &:hover:not(.tutor-alarm-dragging) {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.5);
  }
`;

export const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  padding: 0 6px;
  animation: ${bounce} 1s ease-in-out infinite;
`;

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  animation: ${fadeIn} 0.2s ease;
`;

export const Panel = styled.div`
  position: fixed;
  width: 420px;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 200px);
  min-height: 300px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border: 2px solid #667eea;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideInUp} 0.3s ease;

  @media (max-width: 480px) {
    width: calc(100vw - 1rem);
    max-width: 420px;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
`;

export const PanelTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin: 0;
`;

export const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    color: white;
  }
`;

export const PanelBody = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #5568d3;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: visible;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
`;

export const Item = styled.div<{ $unread?: boolean }>`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: ${(props) => (props.$unread ? "#eff6ff" : "#f9fafb")};
  border: 1px solid ${(props) => (props.$unread ? "#3b82f6" : "#e5e7eb")};
  border-left: ${(props) => (props.$unread ? "4px solid #3b82f6" : "none")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${(props) => (props.$unread ? "#3b82f6" : "#667eea")};
    transform: ${(props) => (props.$unread ? "scaleY(1)" : "scaleY(0)")};
    transition: transform 0.2s ease;
  }

  &:hover {
    background: #f0f4ff;
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  }

  &:hover::before {
    transform: scaleY(1);
  }
`;

export const ItemIcon = styled.div`
  font-size: 0.9rem;
  color: #667eea;
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
`;

export const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ItemTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

export const ItemSection = styled.span`
  font-weight: 500;
  color: #667eea;
`;

export const ItemTime = styled.span`
  flex-shrink: 0;
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #9ca3af;
  font-size: 0.9rem;
`;
