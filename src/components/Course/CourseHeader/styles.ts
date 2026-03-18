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
  position: relative;
`;

export const CourseNameButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin: 0 -10px 0 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  text-align: left;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.08);
  }
  &:hover .course-change-hint {
    opacity: 1;
  }
`;

export const CourseNameHint = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #667eea;
  opacity: 0.85;
  white-space: nowrap;
  transition: opacity 0.2s ease;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const CourseListDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 260px;
  max-width: 360px;
  max-height: 70vh;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const CourseListDropdownTitle = styled.div`
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #eee;
`;

export const CourseListDropdownContent = styled.div`
  overflow-y: auto;
  padding: 8px;
  max-height: 50vh;
`;

export const CourseListDropdownItem = styled.button<{ $active?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 4px;
  border: none;
  border-radius: 6px;
  background: ${(p) => (p.$active ? "#667eea" : "transparent")};
  color: ${(p) => (p.$active ? "#fff" : "#333")};
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${(p) => (p.$active ? "#5568d3" : "rgba(102, 126, 234, 0.1)")};
  }
`;

export const CourseListDropdownFooter = styled.div`
  padding: 10px 12px;
  border-top: 1px solid #eee;
`;

export const CourseListDropdownLink = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #667eea;
  border-radius: 6px;
  background: transparent;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: #667eea;
    color: #fff;
  }
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
`;

export const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 32px;
  min-height: 32px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #667eea;
  font-size: 1rem;
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
