import styled from "styled-components";

export const Container = styled.div`
	padding: 0;
`;

export const TitleHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.5rem 1.5rem;
	background: #667eea;
	color: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
	margin-bottom: 1.5rem;
	flex-wrap: wrap;
	gap: 1rem;
`;

export const TitleLeft = styled.div`
	display: flex;
	align-items: center;
	gap: 1.5rem;
	flex: 1;
	min-width: 0;
`;

export const Title = styled.h1`
	font-size: 1.875rem;
	font-weight: 700;
	color: white;
	margin: 0;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const TitleStats = styled.div`
	display: flex;
	gap: 0.75rem;
	align-items: center;
`;

export const StatBadge = styled.span`
	background: rgba(255, 255, 255, 0.2);
	color: white;
	padding: 0.5rem 1rem;
	border-radius: 8px;
	font-size: 0.875rem;
	font-weight: 600;
	border: 1px solid rgba(255, 255, 255, 0.3);
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	backdrop-filter: blur(10px);
`;

export const CreateButton = styled.button`
	background: white;
	color: #667eea;
	border: 2px solid #667eea;
	border-radius: 10px;
	padding: 0.875rem 1.75rem;
	font-size: 0.95rem;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.3s ease;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	white-space: nowrap;

	&:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}
`;

export const FiltersSection = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1.25rem 1.5rem;
	background: white;
	border-radius: 12px;
	border: 1px solid #e5e7eb;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	margin-bottom: 1.5rem;
	flex-wrap: wrap;
`;

export const SearchBox = styled.div`
	position: relative;
	flex: 1;
	min-width: 250px;
	max-width: 400px;
`;

export const SearchInput = styled.input`
	width: 100%;
	padding: 0.75rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	font-size: 0.9rem;
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
`;

export const TableContainer = styled.div`
	background: white;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
`;

export const Table = styled.table`
	width: 100%;
	border-collapse: separate;
	border-spacing: 0;
	table-layout: fixed;
`;

export const Th = styled.th<{ $alignRight?: boolean }>`
	padding: 1rem 1.5rem;
	text-align: left;
	font-weight: 700;
	font-size: 0.875rem;
	color: #1e293b;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	border-bottom: 2px solid #cbd5e1;
	background: #f1f5f9;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	white-space: nowrap;
	text-align: ${(p) => (p.$alignRight ? "right" : "left")};
	width: ${(p) => (p.$alignRight ? "90px" : "auto")};

	&:last-child {
		width: 100px;
	}
`;

export const Td = styled.td<{ $alignRight?: boolean }>`
	padding: 0.875rem 1.5rem;
	border-bottom: 1px solid #e5e7eb;
	color: #64748b;
	font-size: 0.8125rem;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	vertical-align: middle;
	text-align: ${(p) => (p.$alignRight ? "right" : "left")};
`;

export const TitleWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
	transition: all 0.2s ease;
	padding: 0.25rem 0;
	cursor: pointer;

	&:hover {
		opacity: 0.9;
	}
`;

export const TitleContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	flex: 1;
`;

export const TitleText = styled.span`
	font-weight: 600;
	color: #1e293b;
	font-size: 0.875rem;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	transition: color 0.2s ease;
	line-height: 1.5;

	${TitleWrapper}:hover & {
		color: #667eea;
	}
`;

export const Description = styled.p`
	font-size: 0.8125rem;
	color: #64748b;
	margin: 0;
	line-height: 1.4;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	margin-top: 0.25rem;
`;

export const ActionsCell = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.375rem;
`;

export const ActionButton = styled.button`
	padding: 0.5rem 0.75rem;
	border: none;
	border-radius: 6px;
	font-size: 0.75rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	background: #f3f4f6;
	color: #6b7280;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;

	&:hover:not(:disabled) {
		background-color: #e5e7eb;
	color: #374151;
		transform: translateY(-1px);
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	&.delete {
		color: #6b7280;
		background: #f3f4f6;
	}

	&.delete:hover:not(:disabled) {
		background-color: #fee2e2;
		color: #ef4444;
	}
`;

export const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	width: 100vw;
	height: 100vh;
	max-width: 100vw;
	max-height: 100vh;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
	padding: 2rem;
	overflow: auto;
	box-sizing: border-box;
	margin: 0;
`;

export const ModalContent = styled.div<{ $wide?: boolean }>`
	background: white;
	border-radius: 16px;
	width: 90%;
	max-width: 600px;
	max-height: 90vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	margin: auto;
	position: relative;

	${(p) =>
		p.$wide &&
		`
		max-width: 45vw;
		width: 45vw;
		min-width: 800px;
	`}
`;

export const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.75rem 2rem;
	border-bottom: 1px solid #e5e7eb;
	background: #f9fafb;
	color: #1e293b;

	h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1e293b;
		font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
			Roboto, sans-serif;
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
	line-height: 1;

	&:hover:not(:disabled) {
		background: #e5e7eb;
		color: #374151;
		transform: rotate(90deg);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export const ModalBody = styled.div`
	padding: 2rem;
	overflow-y: auto;
	flex: 1;
`;

export const ModalFooter = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
	padding: 1.5rem 2rem;
	border-top: 1px solid #e5e7eb;
`;

export const FormGroup = styled.div`
	margin-bottom: 1.5rem;
`;

export const Label = styled.label`
	display: block;
	margin-bottom: 0.625rem;
	font-weight: 600;
	color: #374151;
	font-size: 0.95rem;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
`;

export const Input = styled.input`
	width: 100%;
	padding: 0.875rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	font-size: 0.95rem;
	transition: all 0.2s ease;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	box-sizing: border-box;

	&:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
`;

export const Textarea = styled.textarea`
	width: 100%;
	padding: 0.875rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	font-size: 0.95rem;
	transition: all 0.2s ease;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	resize: vertical;
	box-sizing: border-box;

	&:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
`;

export const CancelButton = styled.button`
	padding: 0.875rem 1.75rem;
	border-radius: 8px;
	font-size: 0.95rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	border: none;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	background: #f3f4f6;
	color: #6b7280;

	&:hover:not(:disabled) {
		background: #e5e7eb;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	background: #667eea;
	color: white;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

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

/* 문제 선택 모달 전용 */
export const ProblemFilterSection = styled.div`
	margin-bottom: 1.5rem;
`;

export const ProblemSearchInput = styled.input`
	width: 100%;
	padding: 0.75rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	font-size: 0.9rem;
	transition: all 0.2s ease;
	background: white;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	box-sizing: border-box;

	&:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}
`;

export const ProblemModalActions = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid #e5e7eb;
	gap: 1rem;
	flex-wrap: wrap;
`;

export const SelectAllButton = styled.button`
	background: #f3f4f6;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	padding: 0.5rem 1rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	color: #6b7280;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;

	&:hover {
		background: #e5e7eb;
		color: #374151;
	}
`;

export const SelectedCount = styled.span`
	font-size: 0.875rem;
	color: #667eea;
	font-weight: 600;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
`;

export const FilterCount = styled.span`
	font-size: 0.875rem;
	color: #94a3b8;
	font-weight: 500;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	margin-left: auto;
`;

export const ProblemList = styled.div`
	max-height: 400px;
	overflow-y: auto;
	margin-bottom: 1rem;
`;

export const ProblemItem = styled.div<{ $selected?: boolean }>`
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	margin-bottom: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	background: white;
	border-color: ${(p) => (p.$selected ? "#667eea" : "#e5e7eb")};
	background: ${(p) => (p.$selected ? "#f0f4ff" : "white")};

	&:hover {
		background: #f8fafc;
		border-color: #667eea;
	}

	input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		accent-color: #667eea;
		flex-shrink: 0;
	}
`;

export const ProblemItemInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	flex: 1;
	min-width: 0;
`;

export const ProblemItemTitleRow = styled.div`
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex-wrap: wrap;
`;

export const ProblemIdBadge = styled.span`
	background: #f3f4f6;
	color: #6b7280;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.75rem;
	font-weight: 600;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	flex-shrink: 0;
`;

export const ProblemItemTitle = styled.span`
	font-weight: 500;
	color: #1e293b;
	font-size: 0.95rem;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	flex: 1;
	min-width: 0;
`;

export const ProblemItemMeta = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-wrap: wrap;
`;

export const DifficultyBadge = styled.span<{ $bg: string; $color: string }>`
	display: inline-block;
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	font-size: 0.75rem;
	font-weight: 600;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
	background-color: ${(p) => p.$bg};
	color: ${(p) => p.$color};
`;

export const ProblemListEmpty = styled.div`
	text-align: center;
	padding: 3rem 1rem;
	color: #94a3b8;
	font-size: 0.95rem;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
`;

export const PaginationRow = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	padding-top: 1rem;
	border-top: 1px solid #e5e7eb;
`;

export const PaginationBtn = styled.button`
	background: #f3f4f6;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	padding: 0.5rem 1rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	color: #6b7280;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;

	&:hover:not(:disabled) {
		background: #e5e7eb;
		color: #374151;
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

export const PaginationInfo = styled.span`
	font-size: 0.875rem;
	color: #6b7280;
	font-weight: 600;
	font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, Roboto,
		sans-serif;
`;
