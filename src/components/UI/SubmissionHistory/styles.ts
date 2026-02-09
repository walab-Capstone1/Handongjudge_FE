import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  height: 600px;
  border: 1px solid #ddd;
  background-color: white;
  position: relative;
`;

export const Sidebar = styled.div`
  width: 250px;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

export const SidebarTitle = styled.h3`
  padding: 15px;
  margin: 0;
  border-bottom: 1px solid #ddd;
  font-size: 16px;
`;

export const SubmissionList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const SubmissionItem = styled.div<{ $active?: boolean }>`
  padding: 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${(props) => (props.$active ? "#e3f2fd" : "transparent")};
  border-left: ${(props) => (props.$active ? "4px solid #2196f3" : "none")};

  &:hover {
    background-color: #e9ecef;
  }
`;

export const SubmissionTime = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

export const SubmissionResult = styled.div<{ $success?: boolean }>`
  font-weight: bold;
  font-size: 14px;
  color: ${(props) => (props.$success ? "#28a745" : "#dc3545")};
`;

export const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const HeaderStats = styled.div`
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 20px;
  background-color: #fff;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StatLabel = styled.span`
  font-size: 12px;
  color: #666;
`;

export const StatValue = styled.span<{ $success?: boolean }>`
  font-weight: bold;
  font-size: 16px;
  color: ${(props) => (props.$success !== undefined ? (props.$success ? "#28a745" : "#dc3545") : "inherit")};
`;

export const CodeViewer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 15px;
  background-color: #f8f9fa;

  pre {
    margin: 0;
    font-family: "Consolas", "Monaco", monospace;
    font-size: 14px;
  }
`;

export const NoSelection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #000;
  }
`;
