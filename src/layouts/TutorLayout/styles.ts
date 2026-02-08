import styled, { keyframes, css } from "styled-components";

const tooltipFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const TutorLayoutContainer = styled.div<{ $sidebarCollapsed: boolean }>`
  min-height: 100vh;
  background-color: #fafbfc;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
    sans-serif;
`;

export const NavigationWrapper = styled.div`
  position: relative;
  z-index: 1000;
`;

export const Sidebar = styled.aside<{ $collapsed: boolean }>`
  width: ${(props) => (props.$collapsed ? "60px" : "280px")};
  background: white;
  color: #374151;
  padding: 0;
  border-right: 1px solid #e5e7eb;
  position: fixed;
  left: 0;
  top: 65px;
  height: calc(100vh - 65px);
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 999;

  @media (max-width: 1024px) {
    position: fixed;
    left: 0;
    top: 65px;
    height: calc(100vh - 65px);
    z-index: 100;
    transform: ${(props) => (props.$collapsed ? "translateX(-100%)" : "translateX(0)")};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export const SidebarNav = styled.nav<{ $collapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: ${(props) => (props.$collapsed ? "0" : "0")};
  overflow: hidden;
  min-height: 0;
`;

export const SidebarScrollable = styled.div<{ $collapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: ${(props) => (props.$collapsed ? "0 0.5rem 1.5rem 0.5rem" : "0 1.5rem 1.5rem 1.5rem")};
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
`;

export const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  padding: ${(props) => (props.$collapsed ? "1rem 0.5rem 0 0.5rem" : "1rem 1.5rem 0 1.5rem")};
  margin: ${(props) => (props.$collapsed ? "0 0 0.5rem 0" : "0 -1.5rem 0.5rem -1.5rem")};
  border-bottom: none;
  display: flex;
  align-items: ${(props) => (props.$collapsed ? "center" : "flex-end")};
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
  gap: 0.75rem;
  flex-shrink: 0;
  background: white !important;
  position: relative;
`;

export const SidebarTitle = styled.h2<{ $collapsed: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: #6b7280;
  letter-spacing: 0;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  white-space: nowrap;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  flex: 1;
  position: ${(props) => (props.$collapsed ? "absolute" : "relative")};
  height: ${(props) => (props.$collapsed ? 0 : "auto")};
  padding: ${(props) => (props.$collapsed ? 0 : "inherit")};
`;

export const SidebarToggleBtn = styled.button<{ $collapsed: boolean }>`
  background: transparent;
  border: none;
  border-radius: 6px;
  width: ${(props) => (props.$collapsed ? "100%" : "2rem")};
  height: 2.5rem;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.9rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  font-weight: 600;
  align-self: ${(props) => (props.$collapsed ? "center" : "flex-end")};
  margin-bottom: 0;
  margin: ${(props) => (props.$collapsed ? "0 auto" : "0")};
  padding: ${(props) => (props.$collapsed ? "0.625rem 0" : "0")};
  position: relative;

  &:hover {
    background: transparent;
    color: #374151;
  }

  svg {
    transition: transform 0.3s ease;
  }
`;

export const SidebarSection = styled.div<{ $collapsed?: boolean }>`
  margin-bottom: ${(props) => (props.$collapsed ? "0.25rem" : "0.25rem")};
  transition: margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  padding: ${(props) => (props.$collapsed ? "0" : "0.25rem 0")};
  margin-left: ${(props) => (props.$collapsed ? "0" : "inherit")};
  margin-right: ${(props) => (props.$collapsed ? "0" : "inherit")};
  min-width: 0;
`;

export const SidebarSectionTitle = styled.div<{ $collapsed: boolean }>`
  font-size: 0.7rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  margin-bottom: 0.125rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  flex-shrink: 0;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  height: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
  margin: ${(props) => (props.$collapsed ? 0 : "0.125rem 0")};
  padding: ${(props) => (props.$collapsed ? 0 : "0.25rem 0.75rem")};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const SidebarDivider = styled.div<{ $collapsed?: boolean }>`
  height: 1px;
  background: #e5e7eb;
  margin: ${(props) => (props.$collapsed ? "0.25rem 0" : "0.375rem 0")};
  flex-shrink: 0;
`;

export const SidebarMenuGroup = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  max-width: ${(props) => (props.$collapsed ? "60px" : "100%")};
  margin: ${(props) => (props.$collapsed ? "0" : "inherit")};
  padding: ${(props) => (props.$collapsed ? "0" : "inherit")};
  min-width: 0;
`;

export const SidebarItem = styled.div<{
	$active: boolean;
	$collapsed: boolean;
	$isBackLink?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${(props) => (props.$collapsed ? "0.625rem 0" : "0.5rem 0.75rem")};
  color: ${(props) => {
		if (props.$active) return "white";
		if (props.$isBackLink) return "#667eea";
		return "#6b7280";
	}};
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 0.9rem;
  position: relative;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  min-height: 2.25rem;
  box-sizing: border-box;
  flex-shrink: 0;
  justify-content: ${(props) => (props.$collapsed ? "center" : "space-between")};
  width: ${(props) => (props.$collapsed ? "100%" : "auto")};
  max-width: ${(props) => (props.$collapsed ? "100%" : "none")};
  min-width: ${(props) => (props.$collapsed ? "auto" : "inherit")};
  margin: ${(props) => (props.$collapsed ? "0" : "inherit")};
  height: ${(props) => (props.$collapsed ? "auto" : "inherit")};
  min-height: ${(props) => (props.$collapsed ? "2.5rem" : "2.25rem")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#667eea" : "#f3f4f6")};
    color: ${(props) => {
			if (props.$active) return "white";
			if (props.$isBackLink) return "#5568d3";
			return "#667eea";
		}};
  }

  ${(props) =>
		props.$active &&
		css`
      background: #667eea;
      color: white;
      font-weight: 600;
    `}

  ${(props) =>
		props.$collapsed &&
		css`
      &:hover::after {
        content: attr(data-tooltip);
        position: absolute;
        left: 100%;
        margin-left: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: #1e293b;
        color: white;
        border-radius: 6px;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        pointer-events: none;
        font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
          sans-serif;
        animation: ${tooltipFadeIn} 0.2s ease;
      }
    `}
`;

export const SidebarIcon = styled.div<{
	$collapsed: boolean;
	$active?: boolean;
}>`
  font-size: 1rem;
  flex-shrink: 0;
  width: ${(props) => (props.$collapsed ? "auto" : "1.2rem")};
  min-width: ${(props) => (props.$collapsed ? "auto" : "1.2rem")};
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: ${(props) => (props.$collapsed ? "0 auto" : "0")};
`;

export const SidebarLabel = styled.span<{ $collapsed: boolean }>`
  font-size: 0.95rem;
  white-space: nowrap;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  flex: ${(props) => (props.$collapsed ? "0 0 0" : "1")};
  line-height: 1.5;
  min-width: 0;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  height: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
  margin: ${(props) => (props.$collapsed ? 0 : "inherit")};
  padding: ${(props) => (props.$collapsed ? 0 : "inherit")};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const SidebarArrow = styled.span<{
	$expanded: boolean;
	$collapsed?: boolean;
}>`
  margin-left: auto;
  font-size: 0.7rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: ${(props) => (props.$collapsed ? "none" : "flex")};
  align-items: center;
  color: inherit;
  flex-shrink: 0;
  transform: ${(props) => (props.$expanded ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const SidebarSubmenu = styled.div<{
	$expanded: boolean;
	$collapsed?: boolean;
}>`
  display: ${(props) => (props.$collapsed ? "none" : "grid")};
  grid-template-rows: ${(props) => (props.$expanded ? "1fr" : "0fr")};
  margin-left: 0.75rem;
  padding-left: 0.375rem;
  margin-top: 0.05rem;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;

  > * {
    min-height: 0;
    overflow: hidden;
  }
`;

export const SidebarSubmenuCollapsed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  padding-left: 0.5rem;
  border-left: 2px solid #e5e7eb;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: -2px;
    top: -0.5rem;
    width: 2px;
    height: 0.5rem;
    background: #e5e7eb;
  }
`;

export const SidebarSubItem = styled.div<{ $active: boolean }>`
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  padding-left: 0.75rem;
  margin-top: 0.05rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;

  ${(props) =>
		props.$active &&
		css`
      background: #e0e7ff;
      color: #667eea;
      font-weight: 600;
      margin-top: 0.1rem;
    `}

  .sidebar-sub-icon {
    font-size: 0.85rem;
    flex-shrink: 0;
    width: 1rem;
    min-width: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => (props.$active ? "#667eea" : "#9ca3af")};
  }
`;

export const SidebarSubItemCollapsed = styled.div<{ $active: boolean }>`
  justify-content: center;
  padding: 0.5rem 0;
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: auto;
  margin: 0;
  height: auto;
  min-height: 2rem;
  box-sizing: border-box;
  background: ${(props) => (props.$active ? "#667eea" : "#f9fafb")};
  border-radius: 4px;
  opacity: ${(props) => (props.$active ? 1 : 0.9)};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  color: ${(props) => (props.$active ? "white" : "inherit")};

  &::before {
    content: "";
    position: absolute;
    left: -0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: ${(props) => (props.$active ? "white" : "#667eea")};
    border-radius: 50%;
    border: 2px solid ${(props) => (props.$active ? "#667eea" : "white")};
    box-shadow: 0 0 0 1px ${(props) => (props.$active ? "#667eea" : "#e5e7eb")};
  }

  &:hover {
    background: ${(props) => (props.$active ? "#667eea" : "#f3f4f6")};
    opacity: 1;
    transform: translateX(2px);
  }

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 100%;
    margin-left: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: #1e293b;
    color: white;
    border-radius: 6px;
    font-size: 0.875rem;
    white-space: nowrap;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
    ${css`animation: ${tooltipFadeIn} 0.2s ease;`}
  }

  .sidebar-icon {
    margin: 0 auto;
    width: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: auto;
    flex-shrink: 0;
    font-size: 0.9rem;
    color: ${(props) => (props.$active ? "white" : "#6b7280")};
    transition: color 0.2s ease;
  }

  &:hover .sidebar-icon {
    color: ${(props) => (props.$active ? "white" : "#667eea")};
  }
`;

export const SectionCard = styled.div<{ $collapsed: boolean }>`
  padding: ${(props) => (props.$collapsed ? "0" : "0")};
  margin-bottom: ${(props) => (props.$collapsed ? "0.5rem" : "0.25rem")};
  flex-shrink: 0;
  margin-left: ${(props) => (props.$collapsed ? "0" : "inherit")};
  margin-right: ${(props) => (props.$collapsed ? "0" : "inherit")};
`;

export const SectionCardContent = styled.div<{ $empty?: boolean }>`
  background: #f8f9ff;
  border: 1px solid #e0e7ff;
  border-radius: 8px;
  padding: ${(props) => (props.$empty ? "0.75rem 0.75rem" : "0.5rem 0.75rem")};
  transition: all 0.2s ease;
  text-align: ${(props) => (props.$empty ? "center" : "left")};

  &:hover {
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
`;

export const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: nowrap;
`;

export const SectionCardTitle = styled.h3<{ $collapsed: boolean }>`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  height: ${(props) => (props.$collapsed ? 0 : "auto")};
  margin: ${(props) => (props.$collapsed ? 0 : "inherit")};
  padding: ${(props) => (props.$collapsed ? 0 : "inherit")};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const SectionCardBadge = styled.span<{ $collapsed: boolean }>`
  display: inline-flex;
  align-items: center;
  background: #e0e7ff;
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 1.3;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  height: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
  margin: ${(props) => (props.$collapsed ? 0 : "inherit")};
  padding: ${(props) => (props.$collapsed ? 0 : "0.2rem 0.6rem")};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const SectionCardActions = styled.div<{ $collapsed: boolean }>`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0;
  flex-direction: ${(props) => (props.$collapsed ? "column" : "row")};
  gap: ${(props) => (props.$collapsed ? "0.5rem" : "0.5rem")};
  width: ${(props) => (props.$collapsed ? "100%" : "auto")};
`;

export const SectionChangeBtn = styled.button<{ $collapsed: boolean }>`
  flex: 1;
  padding: ${(props) => (props.$collapsed ? "0.625rem 0" : "0.35rem 0.5rem")};
  background: white;
  border: 1px solid #667eea;
  border-radius: 6px;
  color: #667eea;
  font-size: ${(props) => (props.$collapsed ? "0" : "0.8rem")};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1.2;
  width: ${(props) => (props.$collapsed ? "100%" : "auto")};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${(props) => (props.$collapsed ? "auto" : "inherit")};
  height: ${(props) => (props.$collapsed ? "2.5rem" : "auto")};

  &:hover {
    background: #667eea;
    color: white;
  }

  svg {
    font-size: ${(props) => (props.$collapsed ? "1rem" : "0")};
  }
`;

export const SectionClearBtn = styled.button<{ $collapsed: boolean }>`
  padding: 0.35rem;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 6px;
  color: #ef4444;
  font-size: 0.85rem;
  cursor: pointer;
  display: ${(props) => (props.$collapsed ? "none" : "flex")};
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

export const SectionCardEmptyText = styled.div<{ $collapsed: boolean }>`
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.4rem;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  height: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
  margin: ${(props) => (props.$collapsed ? 0 : "0 0 0.4rem 0")};
  padding: ${(props) => (props.$collapsed ? 0 : "inherit")};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const SidebarSectionMenuWrapper = styled.div<{ $visible: boolean }>`
  display: grid;
  grid-template-rows: ${(props) => (props.$visible ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  flex-shrink: 0;

  > * {
    min-height: 0;
    overflow: hidden;
  }
`;

export const SidebarSettingsMenu = styled.div<{ $collapsed: boolean }>`
  padding: ${(props) => (props.$collapsed ? "0.75rem 0.5rem 0.5rem 0.5rem" : "0.75rem 1.5rem 0.5rem 1.5rem")};
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: white;
`;

export const Main = styled.main<{ $sidebarCollapsed: boolean }>`
  position: fixed;
  top: 65px;
  left: ${(props) => (props.$sidebarCollapsed ? "60px" : "280px")};
  right: 0;
  bottom: 0;
  overflow: hidden;
  background: #fafbfc;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${(props) => (props.$sidebarCollapsed ? "calc(100% - 60px)" : "calc(100% - 280px)")};

  @media (max-width: 1024px) {
    left: 0;
    width: 100%;
  }
`;

export const Content = styled.div`
  background: transparent;
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

// 모달 스타일
export const SectionModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  ${css`animation: ${fadeIn} 0.2s ease;`}
`;

export const SectionModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  ${css`animation: ${slideUp} 0.3s ease;`}

  @media (max-width: 768px) {
    width: 95%;
    max-width: none;
  }
`;

export const SectionModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #374151;
  }
`;

export const SectionModalClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
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
    background: #f3f4f6;
    color: #374151;
  }
`;

export const SectionModalBody = styled.div`
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
`;

export const SectionModalFilters = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

export const SectionModalFilterSelect = styled.select`
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    background: #f8f9fa;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const SectionModalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
`;

export const SectionModalItem = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid ${(props) => (props.$selected ? "#667eea" : "#e5e7eb")};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$selected ? "#f0f4ff" : "white")};

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
    transform: translateX(4px);
  }
`;

export const SectionModalItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SectionModalItemTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SectionModalItemSubtitle = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
`;

export const SectionModalCheck = styled.span`
  color: #667eea;
  font-size: 1.2rem;
  font-weight: 700;
  margin-left: 1rem;
  flex-shrink: 0;
`;

export const SectionModalEmpty = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.9rem;
`;
