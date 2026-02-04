import styled from "styled-components";

export const Container = styled.div<{ $collapsed?: boolean }>`
  position: fixed;
  top: 0;
  left: ${(props) => (props.$collapsed ? "70px" : "250px")};
  right: 0;
  height: 61px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  transition: left 0.3s ease;
`;

export const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

export const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #667eea;
  font-size: 24px;
  transition: all 0.2s ease;
  border-radius: 4px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

export const CourseName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

export const UserInfo = styled.span`
  color: #000000;
  font-size: 16px;
  font-weight: 500;
`;

export const UserRole = styled.span`
  color: #667eea;
  font-weight: 600;
`;
