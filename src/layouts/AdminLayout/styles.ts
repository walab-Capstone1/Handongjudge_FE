import styled, { css } from "styled-components";

export const AdminLayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #fafbfc;
`;

export const AdminContainer = styled.div`
  display: flex;
  max-width: none;
  margin: 0;
  padding: 0;
  min-height: calc(100vh - 80px);
  background: transparent;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

export const Sidebar = styled.aside<{ $collapsed: boolean }>`
  width: ${(props) => (props.$collapsed ? "60px" : "280px")};
  background: white;
  color: #374151;
  padding: ${(props) => (props.$collapsed ? "2rem 0.5rem" : "2rem 0 2rem 2rem")};
  border-right: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  height: calc(100vh - 80px);
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow: hidden;

  @media (max-width: 1024px) {
    width: 100%;
    height: auto;
    position: static;
    padding: 2rem 1rem;
  }
`;

export const SidebarHeader = styled.div`
  padding: 0 2rem 1.5rem 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const SidebarToggleBtn = styled.button<{ $collapsed: boolean }>`
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  width: ${(props) => (props.$collapsed ? "100%" : "2rem")};
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-size: 1rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-weight: 600;
  margin: ${(props) => (props.$collapsed ? "0.5rem 0" : "0")};

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

export const SidebarTitle = styled.h2<{ $collapsed: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #374151;
  letter-spacing: -0.025em;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
`;

export const SidebarNav = styled.nav<{ $collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-right: ${(props) => (props.$collapsed ? "0.5rem" : "1.5rem")};

  @media (max-width: 1024px) {
    flex-direction: row;
    overflow-x: auto;
    padding: 0 1rem 1rem 1rem;
  }
`;

export const SidebarItem = styled.div<{
	$active: boolean;
	$collapsed: boolean;
}>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.$collapsed ? "0.875rem 0.5rem" : "0.875rem 1rem")};
  color: ${(props) => (props.$active ? "white" : "#6b7280")};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  justify-content: ${(props) => (props.$collapsed ? "center" : "space-between")};

  &:hover {
    background-color: ${(props) => (props.$active ? "#667eea" : "#f3f4f6")};
    color: ${(props) => (props.$active ? "white" : "#667eea")};
  }

  ${(props) =>
		props.$active &&
		css`
      background: #667eea;
      color: white;
      font-weight: 600;
    `}

  @media (max-width: 1024px) {
    min-width: max-content;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
`;

export const SidebarLabel = styled.span<{ $collapsed: boolean }>`
  font-size: 0.95rem;
  white-space: nowrap;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
`;

export const SidebarMenuGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SidebarDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
`;

export const SidebarSectionSelector = styled.div`
  margin-top: 0.5rem;
`;

export const SidebarSectionFilters = styled.div<{ $collapsed: boolean }>`
  display: ${(props) => (props.$collapsed ? "none" : "flex")};
  gap: 0.5rem;
  margin: 0.75rem 0;
  padding: 0 1rem;
`;

export const SidebarFilterSelect = styled.select`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.85rem;
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
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

export const SidebarSectionHeader = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? "center" : "space-between")};
  padding: ${(props) => (props.$collapsed ? "0.875rem 0.5rem" : "0.875rem 1rem")};
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
  user-select: none;

  &:hover {
    background-color: #f3f4f6;
    color: #667eea;
  }
`;

export const SidebarArrow = styled.span<{
	$expanded: boolean;
	$collapsed: boolean;
}>`
  margin-left: auto;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$expanded ? "rotate(180deg)" : "rotate(0deg)")};
  display: ${(props) => (props.$collapsed ? "none" : "inline")};
`;

export const SidebarSectionList = styled.div<{
	$expanded: boolean;
	$collapsed: boolean;
}>`
  margin: 0.5rem 0;
  display: ${(props) => (props.$collapsed ? "none !important" : "grid")};
  grid-template-rows: ${(props) => (props.$expanded ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;

  > * {
    min-height: 0;
    overflow: hidden;
  }
`;

export const SidebarSectionItem = styled.div<{
	$active: boolean;
	$collapsed: boolean;
}>`
  padding: ${(props) => (props.$collapsed ? "0.75rem 0.5rem" : "0.75rem 1rem")};
  margin: 0.25rem 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  &:hover {
    background-color: #f3f4f6;
  }

  ${(props) =>
		props.$active &&
		css`
      background: #667eea;
      color: white;

      .section-item-title {
        color: white;
      }

      .section-item-subtitle {
        color: rgba(255, 255, 255, 0.9);
      }
    `}
`;

export const SectionItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SectionItemTitle = styled.div<{ $collapsed: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
`;

export const SectionItemSubtitle = styled.div<{ $collapsed: boolean }>`
  font-size: 0.75rem;
  color: #6b7280;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : "auto")};
  overflow: ${(props) => (props.$collapsed ? "hidden" : "visible")};
`;

export const SidebarSectionSubmenu = styled.div<{
	$expanded: boolean;
	$collapsed: boolean;
}>`
  margin-top: 0.5rem;
  margin-left: 1rem;
  padding-left: 1rem;
  display: ${(props) => (props.$collapsed ? "none !important" : "grid")};
  grid-template-rows: ${(props) => (props.$expanded ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;

  > * {
    min-height: 0;
    overflow: hidden;
  }
`;

export const SidebarSubItem = styled.div<{ $active: boolean }>`
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  padding-left: 2rem;
  margin-top: 0.15rem;

  ${(props) =>
		props.$active &&
		css`
      background: #e0e7ff;
      color: #667eea;
      font-weight: 600;
      margin-top: 0.25rem;
    `}
`;

export const SidebarSubmenu = styled.div<{
	$expanded: boolean;
	$collapsed: boolean;
}>`
  display: ${(props) => (props.$collapsed ? "none !important" : "grid")};
  grid-template-rows: ${(props) => (props.$expanded ? "1fr" : "0fr")};
  margin-left: 1rem;
  padding-left: 0.5rem;
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;

  > * {
    min-height: 0;
    overflow: hidden;
  }
`;

export const SidebarSubmenuNested = styled.div<{ $expanded: boolean }>`
  margin-left: 1.5rem;
  display: grid;
  grid-template-rows: ${(props) => (props.$expanded ? "1fr" : "0fr")};
  transition: grid-template-rows 0.3s ease;
  overflow: hidden;

  > * {
    min-height: 0;
    overflow: hidden;
  }
`;

export const SidebarSubItemNested = styled.div<{ $active: boolean }>`
  padding: 0.55rem 1rem;
  padding-left: 2.5rem !important;
  font-size: 0.8rem;

  ${(props) =>
		props.$active &&
		css`
      background: #eef2ff;
      color: #667eea;
      font-weight: 600;
      margin-top: 0.2rem;
    `}
`;

export const Main = styled.main`
  flex: 1;
  overflow-y: auto;
  background: #fafbfc;
`;

export const Content = styled.div`
  background: transparent;
  padding: 2rem;
  min-height: calc(100vh - 200px);

  @media (max-width: 1024px) {
    padding: 1.5rem;
    min-height: auto;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;
