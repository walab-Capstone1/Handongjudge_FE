import styled, { keyframes } from "styled-components";

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Container = styled.div<{ $isCollapsed: boolean }>`
  display: block;
  min-height: 100vh;
  background: #ffffff;
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

export const AssignmentsBody = styled.div`
  flex: 1;
  padding: 32px 48px;
  padding-top: 93px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
  height: calc(100vh - 61px);

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export const AssignmentsHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
`;

export const SortSelect = styled.select`
  margin-left: auto;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const AssignmentsTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #000000;
  margin: 0 0 8px 0;
  width: 100%;
`;

export const AssignmentsSummary = styled.span`
  font-size: 14px;
  color: #666666;
`;

export const AssignmentsAccordion = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const AccordionItem = styled.div<{ $inactive?: boolean }>`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${(props) => (props.$inactive ? 0.6 : 1)};

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

export const AccordionHeader = styled.div<{ $expanded: boolean; $inactive?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  background: ${(props) => {
    if (props.$inactive) return "#F5F5F5";
    return props.$expanded ? "#E8ECFF" : "#F8F9FF";
  }};
  transition: background-color 0.2s ease;
  border-bottom: ${(props) => (props.$expanded ? "1px solid #D0D5F0" : "none")};

  &:hover {
    background: ${(props) => (props.$inactive ? "#F5F5F5" : "#edf0ff")};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const AccordionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const AccordionArrow = styled.span`
  font-size: 12px;
  color: #667eea;
  transition: transform 0.3s ease;
  width: 16px;
  flex-shrink: 0;
`;

export const AccordionNumber = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
  min-width: 30px;
  flex-shrink: 0;
`;

export const AccordionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  flex-shrink: 0;
`;

export const InactiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #d1d5db;
  color: #6b7280;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  min-width: 60px;
  flex-shrink: 0;
  margin-left: 8px;
`;

export const AccordionDDay = styled.span<{ $expired: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.$expired ? "#FF6B6B" : "#667EEA")};
  color: #ffffff;
  font-size: 11px;
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  min-width: 50px;
  flex-shrink: 0;
`;

export const AccordionHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  margin-left: auto;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

export const AccordionDeadline = styled.span`
  font-size: 12px;
  color: #666666;
  flex-shrink: 0;
  margin-right: 24px;
`;

export const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const MiniProgressBar = styled.div`
  width: 100px;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
`;

export const MiniProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: #667eea;
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const AccordionProgress = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  min-width: 50px;
  text-align: right;
  flex-shrink: 0;
`;

export const AccordionContent = styled.div`
  padding: 24px;
  background: #ffffff;
  animation: ${slideDown} 0.3s ease;
`;

export const AccordionDescription = styled.div`
  padding: 16px 20px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 24px;

  p {
    font-size: 14px;
    color: #666666;
    margin: 0;
    line-height: 1.6;
  }
`;

export const AccordionProblemsSection = styled.div`
  margin-top: 24px;
`;

export const ProblemsSectionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
`;

export const ProblemsSubtitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: #000000;
  margin: 0;
`;

export const ProblemSortRow = styled.div`
  display: flex;
  align-items: center;
`;

export const ProblemSortSelect = styled.select`
  padding: 6px 12px;
  font-size: 13px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  color: #333;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export type ProblemBadgeType = "correct" | "correctLate" | "wrong" | "wrongLate" | "notSubmitted";

const badgeStyles: Record<
  ProblemBadgeType,
  { bg: string; color: string }
> = {
  correct: { bg: "#22C55E", color: "#FFFFFF" },
  correctLate: { bg: "#EAB308", color: "#FFFFFF" },
  wrong: { bg: "#EF4444", color: "#FFFFFF" },
  wrongLate: { bg: "#F97316", color: "#FFFFFF" },
  notSubmitted: { bg: "#E5E7EB", color: "#6B7280" },
};

export const BadgeLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const BadgeLegendItem = styled.span<{ $badgeType: ProblemBadgeType }>`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 10px;
  background: ${(p) => badgeStyles[p.$badgeType].bg};
  color: ${(p) => badgeStyles[p.$badgeType].color};
`;

export const AccordionProblemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AccordionProblemItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #edf0ff;
    border-color: #667eea;
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const ProblemTitle = styled.span`
  font-size: 14px;
  color: #000000;
  font-weight: 500;
  flex: 1;
`;

export const ProblemStatusBlock = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

export const ProblemBadge = styled.span<{ $badgeType: ProblemBadgeType }>`
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 14px;
  background: ${(p) => badgeStyles[p.$badgeType].bg};
  color: ${(p) => badgeStyles[p.$badgeType].color};
`;

export const ProblemSubmissionMeta = styled.div`
  font-size: 12px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const LateMinutes = styled.span`
  color: #c2410c;
  font-weight: 600;
`;

export const NoAssignmentsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #999999;

  p {
    font-size: 16px;
    margin: 0;
  }
`;

export const NoProblemsMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #999999;

  p {
    font-size: 16px;
    margin: 0;
  }
`;

export const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    color: #ff6b6b;
    font-size: 16px;
    margin-bottom: 20px;
  }

  button {
    background: #667eea;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #5568d3;
    }
  }
`;
