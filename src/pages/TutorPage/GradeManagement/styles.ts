import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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
