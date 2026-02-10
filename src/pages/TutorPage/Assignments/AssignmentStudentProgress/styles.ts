import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 300px; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const StudentProgressContainer = styled.div`
	padding: 0;
	max-width: 100%;
	margin: 0 auto;
`;

export const AssignmentProgressContainer = styled.div`
	padding: 2rem;
	max-width: 100%;
	margin: 0 auto;
`;

export const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 2rem;
	padding: 1.75rem 2rem;
	background: #667eea;
	color: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
`;

export const PageHeaderDetail = styled(PageHeader)`
	/* 상세 페이지 전용 - 동일 스타일, 별도 네이밍 */
`;

export const HeaderLeft = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	flex: 1;
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

export const BackButtonDetail = styled.button`
	background: rgba(255, 255, 255, 0.2);
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.3);
	padding: 0.75rem 1.25rem;
	border-radius: 8px;
	font-size: 0.95rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	backdrop-filter: blur(10px);

	&:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateX(-2px);
	}
`;

export const PageTitle = styled.h1`
	margin: 0;
	font-size: 1.875rem;
	color: white;
	font-weight: 700;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const PageTitleDetail = styled(PageTitle)``;

export const PageSubtitle = styled.p`
	margin: 0.5rem 0 0 0;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 400;
`;

export const PageSubtitleDetail = styled(PageSubtitle)``;

export const ProblemsSummary = styled.div`
	margin-bottom: 2rem;
`;

export const SummaryHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
`;

export const SummaryTitle = styled.h3`
	font-size: 1.3rem;
	font-weight: 700;
	color: #1a202c;
	margin: 0;
`;

export const TotalStudentsLabel = styled.span`
	font-size: 1rem;
	color: #667eea;
	font-weight: 600;
	background: #f0f4ff;
	padding: 0.5rem 1rem;
	border-radius: 8px;
`;

export const ProblemsList = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
`;

export const ProblemStatCard = styled.div<{ $expanded?: boolean }>`
	background: white;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	transition: all 0.3s ease;
	overflow: hidden;
	min-width: 0;
	${(p) =>
		p.$expanded &&
		`
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
    grid-column: span 2;
  `}
`;

export const ProblemStatHeader = styled.div<{
	$clickable?: boolean;
	$expanded?: boolean;
}>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	padding: 1rem;
	transition: all 0.3s ease;
	${(p) => p.$clickable && "cursor: pointer;"}
	${(p) => p.$clickable && "&:hover { background: #f8f9fa; }"}
	${(p) => p.$expanded && "background: #f0f4ff;"}
`;

export const ProblemNumber = styled.span`
	background: #667eea;
	color: white;
	padding: 0.3rem 0.6rem;
	border-radius: 6px;
	font-size: 0.8rem;
	font-weight: 700;
	flex-shrink: 0;
`;

export const ProblemTitle = styled.span`
	font-size: 0.9rem;
	font-weight: 600;
	color: #1a202c;
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const HeaderRight = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	flex-shrink: 0;
`;

export const ProblemSummary = styled.span`
	font-size: 0.85rem;
	color: #6b7280;
	font-weight: 500;
	white-space: nowrap;
`;

export const ToggleIcon = styled.span<{ $expanded?: boolean }>`
	font-size: 0.7rem;
	color: #667eea;
	transition: transform 0.3s ease;
	display: inline-block;
	${(p) => p.$expanded && "transform: rotate(180deg);"}
`;

export const ProblemStatDetails = styled.div`
	padding: 0 1rem 1rem 1rem;
	animation: ${slideDown} 0.3s ease;
`;

export const ProblemStatInfo = styled.div`
	display: flex;
	gap: 1rem;
	margin-bottom: 0.75rem;
`;

export const ProblemStatItem = styled.div<{ $variant?: "solved" | "unsolved" }>`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
	.admin-stat-value {
		font-size: 1.2rem;
		font-weight: 700;
		color: #1a202c;
		${(p) => p.$variant === "solved" && "color: #10b981;"}
		${(p) => p.$variant === "unsolved" && "color: #ef4444;"}
	}
`;

export const StatLabel = styled.span`
	font-size: 0.7rem;
	color: #6b7280;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.3px;
`;

export const StatRow = styled.div`
	display: flex;
	align-items: baseline;
	gap: 0.5rem;
`;

export const StatValue = styled.span``;
export const StatPercent = styled.span`
	font-size: 0.75rem;
	color: #6b7280;
	font-weight: 600;
`;

export const ProblemStatBar = styled.div`
	width: 100%;
	height: 6px;
	background: #f3f4f6;
	border-radius: 3px;
	overflow: hidden;
`;

export const ProblemStatFill = styled.div<{ $width: number }>`
	height: 100%;
	width: ${(p) => p.$width}%;
	background: #10b981;
	transition: width 0.3s ease;
`;

export const FiltersSection = styled.div`
	display: flex;
	gap: 1.5rem;
	margin-bottom: 2rem;
	align-items: center;
	flex-wrap: wrap;
`;

export const SearchBox = styled.div`
	position: relative;
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
	box-sizing: border-box;

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
	flex: 0 0 auto;
	padding-left: 2rem;
`;

export const FilterBtn = styled.button<{ $active?: boolean }>`
	padding: 0.75rem 1.5rem;
	border: 2px solid #e5e7eb;
	background: white;
	border-radius: 10px;
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	color: #6b7280;
	${(p) =>
		p.$active &&
		`
    background: #667eea;
    color: white;
    border-color: #667eea;
  `}
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

export const TableContainer = styled.div`
	overflow-x: auto;
`;

export const StudentsTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
`;

export const StudentsThead = styled.thead`
	background: #667eea;
	color: white;
`;

export const StudentsTh = styled.th`
	padding: 1rem 1.25rem;
	text-align: left;
	font-weight: 600;
	font-size: 0.95rem;
	white-space: nowrap;

	&:nth-child(1) {
		width: 15%;
	}
	&:nth-child(2) {
		width: 15%;
	}
	&:nth-child(3) {
		width: 12%;
	}
	&:nth-child(4) {
		width: 18%;
	}
	&:nth-child(5) {
		width: 35%;
	}
	&:nth-child(6) {
		width: 15%;
	}
`;

export const StudentsTbody = styled.tbody``;

export const StudentsTr = styled.tr`
	border-bottom: 1px solid #e5e7eb;
	transition: all 0.2s ease;
	&:hover {
		background: #f8f9fa;
	}
	&:last-child {
		border-bottom: none;
	}
`;

export const StudentsTd = styled.td`
	padding: 1.25rem;
	font-size: 0.95rem;
	color: #374151;
	vertical-align: middle;
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

export const StatusBadge = styled.span<{
	$status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
}>`
	display: inline-block;
	padding: 0.4rem 1rem;
	border-radius: 20px;
	font-size: 0.85rem;
	font-weight: 600;
	white-space: nowrap;
	${(p) => p.$status === "COMPLETED" && "background: #10b981; color: white;"}
	${(p) => p.$status === "IN_PROGRESS" && "background: #f59e0b; color: white;"}
	${(p) =>
		p.$status === "NOT_STARTED" && "background: #e5e7eb; color: #6b7280;"}
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
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 700;
	transition: all 0.2s ease;
	${(p) =>
		p.$solved
			? "background: #10b981; color: white; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); border: none;"
			: "background: #f3f4f6; color: #9ca3af; border: 2px solid #e5e7eb;"}
	${(p) => p.$clickable && "cursor: pointer;"}
	&:hover {
		transform: scale(${(p) => (p.$solved ? 1.1 : 1.05)});
	}
	${(p) =>
		p.$solved &&
		p.$clickable &&
		"&:hover { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5); }"}
`;

export const DetailButton = styled.button`
	margin-left: 0.75rem;
	padding: 0.4rem 0.8rem;
	background: #667eea;
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 0.8rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: #5568d3;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
	}
`;

export const CompletionTimeDisplay = styled.div<{ $completed?: boolean }>`
	font-weight: 600;
	color: ${(p) => (p.$completed ? "#10b981" : "#9ca3af")};
	font-size: 0.9rem;
	white-space: nowrap;
	font-family: "Courier New", monospace;
	${(p) => !p.$completed && "font-style: italic; font-weight: 500;"}
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

export const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 400px;
	gap: 1rem;
`;

export const LoadingSpinner = styled.div`
	width: 40px;
	height: 40px;
	border: 4px solid #f3f3f3;
	border-top: 4px solid #667eea;
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
`;

/* Modal */
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
	padding: 2rem;
	animation: ${fadeIn} 0.2s ease;
`;

export const ModalContent = styled.div`
	background: white;
	border-radius: 12px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	max-width: 800px;
	width: 100%;
	max-height: 90vh;
	overflow-y: auto;
	animation: ${slideUp} 0.3s ease;
`;

export const ModalDialog = styled.dialog`
	background: white;
	border-radius: 12px;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	max-width: 800px;
	width: 100%;
	max-height: 90vh;
	overflow-y: auto;
	animation: ${slideUp} 0.3s ease;
	border: none;
	padding: 0;
	&::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
`;

export const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
`;

export const ModalTitle = styled.h2`
	margin: 0;
	font-size: 1.5rem;
	color: #1e293b;
	font-weight: 700;
`;

export const ModalClose = styled.button`
	background: none;
	border: none;
	font-size: 1.5rem;
	color: #6b7280;
	cursor: pointer;
	padding: 0.5rem;
	line-height: 1;
	transition: color 0.2s ease;
	&:hover {
		color: #374151;
	}
`;

export const DetailModalBody = styled.div`
	padding: 1.5rem;
`;

export const StudentInfo = styled.div`
	margin-bottom: 2rem;
	padding-bottom: 1.5rem;
	border-bottom: 2px solid #e5e7eb;
	h3 {
		margin: 0 0 1rem 0;
		font-size: 1.3rem;
		color: #1a202c;
		font-weight: 700;
	}
`;

export const ProblemsDetailList = styled.div`
	margin-top: 1.5rem;
	h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #1a202c;
		font-weight: 700;
	}
`;

export const DetailTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-top: 0.75rem;
	thead {
		background: #f8f9fa;
	}
	th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.9rem;
		color: #374151;
		border-bottom: 2px solid #e5e7eb;
	}
	td {
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.95rem;
		color: #374151;
	}
	tbody tr:hover {
		background: #f8f9fa;
	}
	tbody tr:last-child td {
		border-bottom: none;
	}
`;

export const StatusBadgeDetail = styled.span<{ $completed?: boolean }>`
	display: inline-block;
	padding: 0.35rem 0.8rem;
	border-radius: 20px;
	font-size: 0.85rem;
	font-weight: 600;
	white-space: nowrap;
	${(p) =>
		p.$completed
			? "background: #10b981; color: white;"
			: "background: #e5e7eb; color: #6b7280;"}
`;

export const SubmissionTime = styled.span<{ $completed?: boolean }>`
	font-weight: 500;
	color: ${(p) => (p.$completed ? "#1a202c" : "#9ca3af")};
	font-family: "Courier New", monospace;
	font-size: 0.9rem;
	${(p) => !p.$completed && "font-style: italic;"}
`;

export const ModalActions = styled.div`
	padding: 1.5rem;
	border-top: 2px solid #e5e7eb;
	display: flex;
	justify-content: flex-end;
`;

export const SecondaryButton = styled.button`
	padding: 0.75rem 1.5rem;
	background: #f3f4f6;
	color: #374151;
	border: none;
	border-radius: 8px;
	font-size: 0.95rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	&:hover {
		background: #e5e7eb;
	}
`;

/* 코드 조회 모달 */
export const CodeModalContent = styled.div`
	background: white;
	border-radius: 16px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	max-width: 1000px;
	width: 100%;
	max-height: 90vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	animation: ${slideUp} 0.3s ease;
`;

export const CodeModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.75rem 2rem;
	border-bottom: 2px solid #e5e7eb;
	background: #667eea;
	color: white;
	border-radius: 16px 16px 0 0;

	h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
`;

export const CodeModalSubtitle = styled.p`
	margin: 0.5rem 0 0 0;
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 400;
`;

export const CodeModalBody = styled.div`
	padding: 2rem;
	max-height: calc(90vh - 200px);
	overflow-y: auto;
`;

export const CodeInfo = styled.div`
	margin-bottom: 1.5rem;
	padding: 1.25rem;
	background: #f9fafb;
	border-radius: 12px;
	border: 1px solid #e5e7eb;
`;

export const CodeInfoRow = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 0.75rem;
	&:last-child {
		margin-bottom: 0;
	}
`;

export const CodeLabel = styled.span`
	font-weight: 700;
	color: #374151;
	min-width: 100px;
	font-size: 0.95rem;
`;

export const CodeValue = styled.span<{ $accepted?: boolean }>`
	color: #1e293b;
	font-size: 0.95rem;
	flex: 1;
	${(p) =>
		p.$accepted &&
		"color: #10b981; font-weight: 700; padding: 0.25rem 0.75rem; background: #f0fdf4; border-radius: 6px; display: inline-block;"}
`;

export const CodeEditorContainer = styled.div`
	background: #1e293b;
	border-radius: 12px;
	padding: 1.5rem;
	overflow-x: auto;
	border: 1px solid #334155;
`;

export const CodeDisplay = styled.pre`
	margin: 0;
	padding: 0;
	background: transparent;
	color: #e2e8f0;
	font-family: "Courier New", Monaco, Consolas, monospace;
	font-size: 0.9rem;
	line-height: 1.6;
	white-space: pre;
	overflow-x: auto;

	code {
		display: block;
		color: inherit;
		font-family: inherit;
		background: transparent;
		padding: 0;
	}
`;

/* Assignments table (list view) */
export const AssignmentsTableContainer = styled.div`
	background: white;
	border-radius: 12px;
	overflow: visible;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const AssignmentsTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	thead {
		background: #f8fafc;
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
		background: #f1f5f9;
	}
	th:nth-child(n + 2) {
		text-align: right;
	}
	tbody tr {
		border-bottom: 1px solid #e2e8f0;
		transition: background 0.2s ease;
	}
	tbody tr:hover {
		background: #f8fafc;
	}
	tbody tr.admin-clickable {
		cursor: pointer;
	}
	tbody tr.admin-clickable:hover {
		background: #f1f5f9;
	}
	td {
		padding: 1.25rem 1.5rem;
		vertical-align: middle;
	}
`;

export const AssignmentTitleCell = styled.td`
	min-width: 300px;
	div:first-child {
		font-size: 1rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.25rem;
	}
`;

export const AssignmentDescription = styled.div`
	font-size: 0.875rem;
	color: #64748b;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

export const AssignmentMetaCell = styled.td`
	font-size: 0.95rem;
	color: #1e293b;
	font-weight: 600;
	white-space: nowrap;
	text-align: right;
`;

export const TableEmpty = styled.td`
	text-align: center;
	padding: 3rem 1.5rem;
	color: #94a3b8;
	font-size: 0.95rem;
`;
