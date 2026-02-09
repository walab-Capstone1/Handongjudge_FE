import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideInUp = keyframes`from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }`;

export const Container = styled.div`
  padding: 0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  background-color: white;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
`;

export const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 220px;
  max-width: 360px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: white;
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #e1e8ed !important;
    box-shadow: none !important;
    background: white !important;
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FilterLabel = styled.label`
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
`;

export const AssignmentSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

export const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
  white-space: nowrap;

  &:hover {
    background: #f8f9ff;
    border-color: #5568d3;
    color: #5568d3;
    transform: translateY(-2px);
  }
`;

export const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  position: relative;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;

  thead {
    background: #f8fafc;
  }

  th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.8125rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
      sans-serif;

    &:first-child {
      padding-left: calc(1rem - 3px);
      border-left: 3px solid transparent;
    }
  }

  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.2s ease;
    position: relative;
    overflow: visible;

    &:hover {
      background: #f8fafc;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  td {
    padding: 0.875rem 1rem;
    font-size: 0.875rem;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;

    &:first-child {
      padding-left: calc(1rem - 3px);
      border-left: 3px solid transparent;
    }
  }
`;

export const ProblemHeader = styled.th`
  text-align: center !important;
  min-width: 150px;
`;

export const CourseAssignmentHeader = styled.th`
  text-align: center !important;
  font-weight: 600;
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #475569;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  background: #f8fafc;

  &:first-of-type {
    border-left: none;
  }

  &:last-of-type {
    border-right: none;
  }
`;

export const CourseQuizHeader = styled(CourseAssignmentHeader)`
  background: #f0f9ff;
  border-color: #bae6fd;
`;

export const ItemTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

export const ItemTypeBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #0ea5e9;
  color: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CourseAssignmentTotalHeader = styled.th`
  text-align: center !important;
  min-width: 100px;
  background: #f1f5f9 !important;
  font-weight: 600;
`;

export const ProblemTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.875rem;
  color: #1e293b;
`;

export const ProblemPoints = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
`;

export const StudentRow = styled.tr<{ $highlight?: boolean }>`
  background: ${(props) => (props.$highlight ? "#fffbeb !important" : "inherit")};
  border-left: ${(props) => (props.$highlight ? "3px solid #f59e0b" : "3px solid transparent")};

  &:hover {
    background: ${(props) => (props.$highlight ? "#fef3c7 !important" : "#f8fafc")};
  }
`;

export const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const StudentAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
`;

export const StudentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
`;

export const StudentName = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StudentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StudentId = styled.span`
  font-family: monospace;
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  color: #475569;
`;

export const StudentEmail = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const GradeCell = styled.td<{ $type?: "assignment" | "quiz" }>`
  text-align: center !important;
  font-weight: 600;
  color: ${(props) => {
		if (props.$type === "quiz") return "#0891b2";
		if (props.$type === "assignment") return "#667eea";
		return "#1e293b";
	}};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: ${(props) => {
			if (props.$type === "quiz") return "#ecfeff";
			if (props.$type === "assignment") return "#f0f4ff";
			return "#f8fafc";
		}};
  }
`;

export const ScoreBadge = styled.span<{
	$status?: "high" | "medium" | "low" | "zero";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.2s ease;

  ${(props) => {
		switch (props.$status) {
			case "high":
				return `
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        `;
			case "medium":
				return `
          background: linear-gradient(135deg, #eab308, #ca8a04);
          color: white;
        `;
			case "low":
				return `
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
        `;
			case "zero":
				return `
          background: #f1f5f9;
          color: #94a3b8;
        `;
			default:
				return `
          background: #f1f5f9;
          color: #64748b;
        `;
		}
	}}
`;

export const TotalCell = styled.td<{ $highlight?: boolean }>`
  text-align: center !important;
  font-weight: 700;
  font-size: 1rem;
  color: #1e293b;
  background: ${(props) => (props.$highlight ? "#f0f9ff !important" : "#f8fafc !important")};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #94a3b8;
`;

export const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

export const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #475569;
  margin: 0 0 0.5rem 0;
`;

export const EmptyText = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
`;

export const EmptyButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

/* View mode tabs */
export const ViewModeTabs = styled.div`
  display: flex;
  gap: 0.25rem;
  background: #f1f5f9;
  padding: 0.15rem;
  border-radius: 8px;
  flex-shrink: 0;
  align-items: center;
`;

export const TabButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 0.4rem 0.8rem;
  background: ${(p) => (p.$active ? "white" : "transparent")};
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => (p.$active ? "#667eea" : "#64748b")};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1.2;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none")};

  &:hover {
    background: ${(p) => (p.$active ? "white" : "#e2e8f0")};
    color: ${(p) => (p.$active ? "#667eea" : "#475569")};
  }
`;

export const NoData = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  color: #64748b;
  font-size: 1rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  p {
    margin: 0;
  }
`;

/* Table cells - name/id */
export const TdStudentName = styled.td`
  font-weight: 600;
  color: #1e293b;
  min-width: 120px;
  font-size: 0.9375rem;
`;

export const TdStudentId = styled.td`
  color: #64748b;
  min-width: 100px;
  font-size: 0.875rem;
`;

export const TdProblemCell = styled.td`
  text-align: center;
  min-width: 180px;
  position: relative;
`;

export const ScoreDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

export const ScoreValue = styled.div`
  font-weight: 600;
  color: #667eea;
  font-size: 0.95rem;
`;

export const ScoreActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

export const BtnEdit = styled.button`
  padding: 0.4rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
    transform: translateY(-1px);
  }
`;

export const BtnCode = styled.button`
  padding: 0.4rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background: #10b981;
    color: white;
    border-color: #10b981;
    transform: translateY(-1px);
  }
`;

export const SubmissionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  margin-top: 0.5rem;
`;

export const SubmissionStatus = styled.span<{ $onTime?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 600;
  color: ${(p) => (p.$onTime ? "#10b981" : "#ef4444")};
`;

export const SubmissionTime = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  font-size: 0.7rem;
`;

export const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

export const ScoreInput = styled.input`
  width: 80px;
  padding: 0.5rem;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 600;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  body.section-modal-open &:focus {
    outline: none !important;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }
`;

export const EditActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const BtnSave = styled.button`
  padding: 0.4rem 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

export const BtnCancel = styled.button`
  padding: 0.4rem 0.75rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover {
    background: #e5e7eb;
  }
`;

export const TdTotalCell = styled.td`
  text-align: center;
  font-weight: 600;
  color: #1e293b;
  min-width: 100px;
  font-size: 0.875rem;
`;

export const TdRatioCell = styled.td`
  text-align: center;
  font-weight: 600;
  color: #667eea;
  min-width: 80px;
  font-size: 0.875rem;
`;

export const CourseTableContainer = styled(TableContainer)`
  margin-top: 1.5rem;
`;

export const CourseTable = styled(Table)`
  width: 100%;
`;

export const TdCourseProblemCell = styled.td`
  background: transparent;
  text-align: center;
`;

export const TdCourseAssignmentTotalCell = styled.td`
  background: #f1f5f9;
  font-weight: 600;
  text-align: center;
`;

/* Modals */
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease;
  padding: 2rem;
  box-sizing: border-box;
`;

export const ModalContent = styled.div<{ $large?: boolean }>`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: ${(p) => (p.$large ? "1200px" : "800px")};
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideInUp} 0.3s ease;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const ModalClose = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 1.75rem;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
`;

export const ModalBody = styled.div`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
`;

export const CodeDisplay = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: "Courier New", monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;

  code {
    color: #e2e8f0;
    white-space: pre;
  }
`;

export const BulkInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;

  p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const BulkInputs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const BulkInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

export const BulkLabel = styled.div`
  flex: 1;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const BulkInput = styled.input`
  width: 120px;
  padding: 0.75rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
  font-weight: 600;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const PointsUnit = styled.span`
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
  min-width: 30px;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const AssignmentGroup = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const AssignmentGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
`;

export const AssignmentGroupTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const AssignmentGroupTotal = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const TotalPointsSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
`;

export const TotalPointsLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const TotalPointsValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export const BtnSubmit = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5568d3 0%, #6a3d8c 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const StatsSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const StatsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  text-align: center;
`;

export const StatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
`;

export const ProblemStatsTable = styled.div`
  overflow-x: auto;
`;

export const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;

  thead {
    background: #f8f9fa;
  }

  th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
    color: #1e293b;
    border-bottom: 2px solid #e5e7eb;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }

  tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background-color 0.2s ease;
  }

  tbody tr:hover {
    background-color: #f8f9ff;
  }

  td {
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
    color: #374151;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
  }
`;

export const StatProblemTitle = styled.span`
  font-weight: 600;
  color: #1e293b;
`;

export const SubmissionRate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span {
    min-width: 50px;
    font-weight: 600;
    color: #667eea;
  }
`;

export const ProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${(p) => p.$width}%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
`;
