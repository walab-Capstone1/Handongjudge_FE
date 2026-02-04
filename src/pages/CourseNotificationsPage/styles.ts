import styled from "styled-components";

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: block;
  min-height: 100vh;
  background: #ffffff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic",
    sans-serif;
`;

export const Content = styled.div<{ $isCollapsed: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${(props) => (props.$isCollapsed ? "70px" : "250px")};
  height: 100vh;
  overflow: hidden;
  transition: margin-left 0.3s ease;
`;

export const NotificationsBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 100px;
  padding-top: 93px;
  margin-top: 0;
  overflow-y: auto;
  height: calc(100vh - 61px);

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const NotificationsTitle = styled.h2`
  color: #000000;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
`;

export const NotificationsStatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const NotificationsStats = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 16px;
  }
`;

export const StatItem = styled.span`
  color: #333333;
  font-size: 14px;
  font-weight: 400;
  display: inline-block;
  padding: 0;
  margin: 0;
  background: none;
  border: none;
  cursor: default;
  user-select: none;
  position: relative;

  &::after {
    content: "";
    width: 1px;
    height: 14px;
    background: #d0d0d0;
    margin: 0 20px;
    display: inline-block;
    vertical-align: middle;
  }

  &:last-child::after {
    display: none;
  }
`;

export const SortButton = styled.button`
  background: transparent;
  color: #000000;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #667eea;
  }
`;

export const SortArrow = styled.span<{ $direction: "asc" | "desc" }>`
  font-size: 12px;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.$direction === "desc" ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const NotificationCard = styled.div<{
  $isNew: boolean;
  $type: "notice" | "assignment" | "community" | "other";
}>`
  display: flex;
  align-items: center;
  padding: 18px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  margin-bottom: 8px;
  background: ${(props) => {
    if (props.$isNew) {
      return props.$type === "assignment" ? "#000000" : "#B3BFF5";
    } else {
      return props.$type === "assignment" ? "#000000" : "#D9DFF9";
    }
  }};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  flex-wrap: nowrap;
  width: 100%;
  min-width: 0;
`;

export const NotificationTag = styled.span<{
  $isNew: boolean;
  $type: "notice" | "assignment" | "community" | "other";
}>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  border: 1px solid #667eea;
  white-space: nowrap;
  background: #667eea;
  color: #ffffff;
  order: 1;
  margin-right: 0;
`;

export const NotificationTitle = styled.span<{
  $isNew: boolean;
  $type: "notice" | "assignment" | "community" | "other";
}>`
  font-size: 14px;
  font-weight: ${(props) => (props.$isNew ? "600" : "500")};
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  order: 2;
  color: ${(props) => {
    if (props.$type === "assignment" && props.$isNew) return "#FFFFFF";
    if (props.$type === "assignment" && !props.$isNew) return "#FFFFFF";
    if (props.$type === "notice" && !props.$isNew) return "#667EEA";
    return "#000000";
  }};
`;

export const NotificationDate = styled.span<{
  $isNew: boolean;
  $type: "notice" | "assignment" | "community" | "other";
}>`
  color: ${(props) => {
    if (props.$type === "assignment") return "#CCCCCC";
    if (props.$type === "notice" && !props.$isNew) return "#667EEA";
    return "#666666";
  }};
  font-size: 13px;
  font-weight: 400;
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
  order: 3;
`;

export const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #868fb7;
  font-size: 16px;
`;

export const NoNotificationsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #868fb7;
  font-size: 16px;
`;
