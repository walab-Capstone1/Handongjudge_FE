import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: #f8fafc;
`;

export const Content = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

export const HeaderLeft = styled.div`
  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
  }
`;

export const QuizCount = styled.span`
  color: #64748b;
  font-size: 0.875rem;
  margin-left: 1rem;
`;

export const HeaderRight = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export const StatusFilter = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const CreateButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5568d3;
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
`;

export const TableContainer = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f1f5f9;
  }

  th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.875rem;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #cbd5e1;
  }

  td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    color: #475569;
  }

  tbody tr {
    &:hover {
      background: #f8fafc;
    }

    &.clickable {
      cursor: pointer;
    }
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;

    th,
    td {
      padding: 0.75rem;
    }
  }
`;

export const QuizTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
`;

export const QuizDescription = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StatusBadge = styled.span<{
	$status?: "active" | "waiting" | "ended";
}>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  ${(props) => {
		switch (props.$status) {
			case "active":
				return `
          background: #dcfce7;
          color: #166534;
        `;
			case "waiting":
				return `
          background: #fef3c7;
          color: #92400e;
        `;
			case "ended":
				return `
          background: #f1f5f9;
          color: #475569;
        `;
			default:
				return `
          background: #f3f4f6;
          color: #6b7280;
        `;
		}
	}}
`;

export const QuizActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const EditButton = styled.button`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #e0e7ff;
  color: #4338ca;

  &:hover {
    background: #c7d2fe;
  }
`;

export const DeleteButton = styled.button`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #fee2e2;
  color: #dc2626;

  &:hover {
    background: #fecaca;
  }
`;

// Modal styles
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
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div<{ $large?: boolean }>`
  background: white;
  border-radius: ${(props) => (props.$large ? "12px" : "8px")};
  width: 90%;
  max-width: ${(props) => (props.$large ? "800px" : "600px")};
  max-height: ${(props) => (props.$large ? "85vh" : "90vh")};
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
  background: #f9fafb;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
      sans-serif;
  }
`;

export const ModalClose = styled.button`
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #374151;
    transform: rotate(90deg);
  }
`;

export const ModalBody = styled.div`
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1e293b;
    font-size: 0.875rem;
  }

  input[type="text"],
  input[type="datetime-local"],
  textarea {
    width: 100%;
    padding: 0.625rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #1e293b;
    transition: border-color 0.2s;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  textarea {
    resize: vertical;
    font-family: inherit;
  }
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
`;

export const CancelButton = styled.button`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;

  &:hover {
    background: #e5e7eb;
  }
`;

export const SubmitButton = styled.button`
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;

  &:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

// Problem selection modal
export const ProblemSelectModal = styled.div`
  /* Additional specialized styles for problem selection */
`;

export const ProblemsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

export const ProblemItem = styled.div<{
	$selected?: boolean;
	$disabled?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  background: ${(props) => (props.$selected ? "#f0f4ff" : props.$disabled ? "#f9fafb" : "white")};
  border-color: ${(props) => (props.$selected ? "#667eea" : "#e5e7eb")};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover {
    background: ${(props) => (props.$disabled ? "#f9fafb" : props.$selected ? "#f0f4ff" : "#f8fafc")};
    border-color: ${(props) => (props.$disabled ? "#e5e7eb" : "#667eea")};
  }
`;

export const ProblemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
`;

export const ProblemTitle = styled.div`
  font-weight: 500;
  color: #1e293b;
  font-size: 0.95rem;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
    sans-serif;
`;

// Detail view styles
export const DetailWrapper = styled.div`
  padding: 0;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e1e8ed;
`;

export const BackButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e5e7eb;
    transform: translateX(-2px);
  }
`;

export const DetailTitle = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  color: #1a202c;
  font-weight: 700;
`;

export const DetailContent = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

export const Sidebar = styled.div`
  flex: 0 0 200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1rem 0;
  height: fit-content;
  position: sticky;
  top: 2rem;

  @media (max-width: 1024px) {
    flex: 0 0 auto;
    position: static;
  }
`;

export const TabList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 1024px) {
    flex-direction: row;
    overflow-x: auto;
  }
`;

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: ${(props) => (props.$active ? "#f0f4ff" : "none")};
  text-align: left;
  font-size: 0.95rem;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  color: ${(props) => (props.$active ? "#000000" : "#6b7280")};
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid ${(props) => (props.$active ? "#667eea" : "transparent")};

  &:hover {
    background: #f8f9fa;
    color: #1a202c;
  }

  @media (max-width: 1024px) {
    border-left: none;
    border-bottom: 3px solid ${(props) => (props.$active ? "#667eea" : "transparent")};
    white-space: nowrap;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  min-height: 600px;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

/* List view - page header (no SectionNavigation) */
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

export const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
`;

/* Quiz info section (detail main tab) */
export const QuizInfoSection = styled.div`
  padding-bottom: 2rem;
  border-bottom: 2px solid #e1e8ed;
`;

export const QuizInfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

export const QuizInfoTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 700;
  color: #000000;
  margin: 0;
`;

export const QuizControlButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

export const QuizControlBtn = styled.button<{
	$variant?: "start" | "stop" | "end";
}>`
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  color: #667eea;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${(p) =>
		p.$variant === "stop" &&
		`
    border-color: #f59e0b;
    color: #f59e0b;
    &:hover:not(:disabled) { background: #fffbeb; border-color: #d97706; color: #d97706; }
  `}
  ${(p) =>
		p.$variant === "end" &&
		`
    border-color: #ef4444;
    color: #ef4444;
    &:hover:not(:disabled) { background: #fef2f2; border-color: #dc2626; color: #dc2626; }
  `}
  ${(p) =>
		(!p.$variant || p.$variant === "start") &&
		`
    &:hover:not(:disabled) { background: #f0f4ff; border-color: #5568d3; color: #5568d3; }
  `}
`;

export const QuizInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const InfoLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const InfoValue = styled.div`
  font-size: 1rem;
  color: #1a202c;
  font-weight: 500;
`;

/* Problems tab */
export const ProblemsTabHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e1e8ed;
`;

export const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

export const ProblemsTabHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ProblemsCount = styled.span`
  font-size: 1rem;
  color: #667eea;
  font-weight: 600;
  background: #f0f4ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
`;

export const ProblemsAddBtn = styled.button`
  padding: 0.625rem 1.25rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5568d3;
  }
`;

export const ProblemsTableContainer = styled.div`
  overflow-x: auto;
`;

export const ProblemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;

  thead {
    background: #f8fafc;
  }

  th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.875rem;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #cbd5e1;
    background: #f1f5f9;
    white-space: nowrap;
  }

  td {
    padding: 1.25rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.95rem;
    color: #1a202c;
    vertical-align: middle;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }
`;

export const ProblemNumberCell = styled.td`
  font-weight: 700;
  color: #667eea;
  text-align: center;
  width: 80px;
`;

export const ProblemTitleCell = styled.td`
  max-width: 400px;
`;

export const ProblemTitleMain = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
`;

export const ProblemDescriptionPreview = styled.div`
  font-size: 0.875rem;
  color: #1a202c;
  line-height: 1.5;
  margin-top: 0.25rem;
`;

export const ProblemRemoveBtn = styled.button`
  padding: 0.375rem 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #fecaca;
  }
`;

/* Submissions tab */
export const FiltersSection = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const SearchBox = styled.div`
  flex: 1 1 300px;
  min-width: 250px;
  max-width: 400px;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const StatusFilters = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const FilterBtn = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: ${(p) => (p.$active ? "#667eea" : "white")};
  color: ${(p) => (p.$active ? "white" : "#6b7280")};
  border-color: ${(p) => (p.$active ? "#667eea" : "#e5e7eb")};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(p) => (p.$active ? "#5568d3" : "#f3f4f6")};
    border-color: ${(p) => (p.$active ? "#5568d3" : "#d1d5db")};
  }
`;

export const StudentsList = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

export const StudentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  thead {
    background: #f8fafc;
  }

  th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.875rem;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #cbd5e1;
    background: #f1f5f9;
    white-space: nowrap;
  }

  td {
    padding: 1.25rem;
    font-size: 0.95rem;
    color: #374151;
    vertical-align: middle;
  }

  tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.2s ease;
  }

  tbody tr:hover {
    background: #f8f9fa;
  }
`;

export const StudentId = styled.span`
  font-family: "Courier New", monospace;
  color: #6b7280;
  font-weight: 500;
`;

export const StudentName = styled.span`
  font-weight: 600;
  color: #1a202c;
`;

export const SubmissionsStatusBadge = styled.span<{
	$status?: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
}>`
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;

  ${(p) => {
		switch (p.$status) {
			case "COMPLETED":
				return "background: #10b981; color: white;";
			case "IN_PROGRESS":
				return "background: #f59e0b; color: white;";
			default:
				return "background: #e5e7eb; color: #6b7280;";
		}
	}}
`;

export const ProgressCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const MiniProgressBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  min-width: 80px;
`;

export const MiniProgressFill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${(p) => p.$width}%;
  background: #10b981;
  transition: width 0.3s ease;
  border-radius: 4px;
`;

export const ProgressText = styled.span`
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  min-width: 50px;
  text-align: right;
`;

export const ProblemsStatus = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

export const ProblemBadge = styled.span<{
	$solved?: boolean;
	$clickable?: boolean;
}>`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  transition: all 0.2s ease;
  background: ${(p) => (p.$solved ? "#10b981" : "#f3f4f6")};
  color: ${(p) => (p.$solved ? "white" : "#9ca3af")};
  border: ${(p) => (p.$solved ? "none" : "2px solid #e5e7eb")};

  &:hover {
    ${(p) => p.$clickable && p.$solved && "transform: scale(1.1); box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);"}
  }
`;

/* Problem select modal - form section */
export const ProblemSelectSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const BtnSelectProblems = styled.button`
  padding: 0.625rem 1rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    border-color: #94a3b8;
  }
`;

export const SelectedCount = styled.span`
  font-size: 0.875rem;
  color: #64748b;
`;

/* Problem select modal - modal specific */
export const ProblemSelectModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const ProblemSelectSelectAll = styled.button`
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

export const ProblemSelectSelectedCount = styled.span`
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
`;

export const ProblemSelectFilterCount = styled.span`
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
  margin-left: auto;
`;

export const ProblemSelectPagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

export const ProblemSelectPaginationBtn = styled.button`
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;

  &:hover:not(:disabled) {
    background: #e5e7eb;
    color: #374151;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ProblemIdBadge = styled.span`
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
`;

export const AlreadyAddedBadge = styled.span`
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
`;

export const ProblemDifficulty = styled.span<{ $color?: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(p) => (p.$color ? `${p.$color}20` : "#f3f4f6")};
  color: ${(p) => p.$color || "#6b7280"};
`;

export const NoData = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;

  p {
    margin: 0;
  }
`;

export const TableEmpty = styled.td`
  text-align: center;
  padding: 3rem 1.5rem;
  color: #94a3b8;
  font-size: 0.95rem;
`;

export const ClickableRow = styled.tr`
  cursor: pointer;
`;
