import styled, { keyframes, css } from "styled-components";

const slideDownFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Sidebar = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  background: #000000;
  width: ${(props) => (props.$collapsed ? "70px" : "250px")};
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  flex-shrink: 0;
  overflow-y: hidden;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue",
    "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  transition: width 0.3s ease;
`;

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 20px;
  gap: 12px;
  margin-bottom: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 61px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color 0.2s ease;

  ${Sidebar}[class*="collapsed"] & {
    justify-content: center;
    padding: 20px 0;
  }

  &:hover {
    background-color: rgba(102, 126, 234, 0.15);
  }
`;

export const SidebarLogo = styled.img`
  width: 27px;
  height: 27px;
  object-fit: contain;
`;

export const SidebarTitle = styled.span`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  line-height: 21px;
`;

export const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  padding-top: 37px;
`;

export const MenuItem = styled.div<{
	$active?: boolean;
	$isSubMenu?: boolean;
	$isAdmin?: boolean;
	$collapsed?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${(props) => (props.$collapsed ? "9px 0" : "9px 20px")};
  cursor: pointer;
  transition: background-color 0.2s ease;
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};

  ${(props) =>
		props.$isSubMenu &&
		css`
			opacity: 0;
			transform: translateY(-10px);
			animation: ${slideDownFadeIn} 0.4s ease-out forwards;
		`}

  &:hover {
    background-color: rgba(102, 126, 234, 0.2);
  }

  ${(props) =>
		props.$active &&
		`
    background: #667EEA;
    border-radius: 5px;
    margin: 0 ${props.$collapsed ? "10px" : "14px"};
    padding: 9px ${props.$collapsed ? "0" : "20px"};
    justify-content: ${props.$collapsed ? "center" : "flex-start"};
  `}

  .menu-icon {
    color: ${(props) => (props.$isAdmin && !props.$active ? "#ff4444" : "#FFFFFF")};
    font-size: 20px;
    flex-shrink: 0;
  }

  ${(props) =>
		props.$isAdmin &&
		!props.$active &&
		`
    &:hover .menu-icon {
      color: #ff6666;
    }
  `}
`;

export const MenuText = styled.span`
  color: #ffffff;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s ease;

  ${Sidebar}[class*="collapsed"] & {
    display: none;
  }

  ${MenuItem}.admin-menu-item & {
    color: #ff4444;
  }

  ${MenuItem}.admin-menu-item:hover & {
    color: #ff6666;
  }

  ${MenuItem}.admin-menu-item.active & {
    color: #ffffff;
  }
`;

export const SidebarLogout = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${(props) => (props.$collapsed ? "24px 0" : "24px 20px")};
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};

  &:hover {
    background-color: rgba(102, 126, 234, 0.2);
  }

  .menu-icon {
    color: #ffffff;
    font-size: 20px;
    flex-shrink: 0;
  }
`;

export const CourseListSidebar = styled.div<{
	$show?: boolean;
	$collapsed?: boolean;
}>`
  position: fixed;
  top: 0;
  left: ${(props) => (props.$collapsed ? "70px" : "250px")};
  width: 250px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #868fb7;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transform: translateX(${(props) => (props.$show ? "0" : "-100%")});
  transition: transform 0.3s ease-in-out, left 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
`;

export const CourseListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  height: 61px;
  box-sizing: border-box;
`;

export const CourseListTitle = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #000000;
`;

export const CourseListClose = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  svg {
    font-size: 24px;
    color: #666666;
  }
`;

export const CourseListContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d0d0d0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const CourseListLoading = styled.div`
  text-align: center;
  padding: 20px;
  color: #666666;
`;

export const CourseListItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(102, 126, 234, 0.1);
    border-color: #667eea;
  }

  ${(props) =>
		props.$active &&
		`
    background-color: #667EEA;
    border-color: #667EEA;
  `}
`;

export const CourseListItemTitle = styled.div<{ $active?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => (props.$active ? "#FFFFFF" : "#000000")};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  ${CourseListItem}.active & {
    color: #ffffff;
  }
`;

export const CourseListItemSection = styled.div<{ $active?: boolean }>`
  font-size: 12px;
  color: ${(props) => (props.$active ? "#FFFFFF" : "#666666")};

  ${CourseListItem}.active & {
    color: #ffffff;
  }
`;
