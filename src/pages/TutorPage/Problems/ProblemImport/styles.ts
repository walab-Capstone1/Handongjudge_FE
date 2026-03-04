import styled from "styled-components";

export const Container = styled.div`
	padding: 0;
`;

export const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1.5rem;
`;

export const PageTitle = styled.h1`
	font-size: 1.5rem;
	font-weight: 700;
	color: #1e293b;
	margin: 0;
`;

export const BackButton = styled.button`
	padding: 0.75rem 1.25rem;
	background: #f1f5f9;
	border: 2px solid #e2e8f0;
	color: #475569;
	border-radius: 8px;
	font-weight: 500;
	cursor: pointer;
	font-size: 0.95rem;
	transition: all 0.2s ease;

	&:hover {
		background: #e2e8f0;
	}
`;

export const Layout = styled.div`
	display: grid;
	grid-template-columns: 1fr 320px;
	gap: 1.5rem;
	min-height: 500px;

	@media (max-width: 900px) {
		grid-template-columns: 1fr;
	}
`;

export const MainPanel = styled.div`
	background: white;
	border-radius: 12px;
	padding: 1.5rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
`;

export const Sidebar = styled.div`
	background: white;
	border-radius: 12px;
	padding: 1rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	border: 1px solid #e5e7eb;
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

export const FileSelectButton = styled.button`
	width: 100%;
	padding: 1rem 1.5rem;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	font-size: 0.95rem;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export const ProblemList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	max-height: 400px;
	overflow-y: auto;
`;

export const ProblemListItem = styled.div<{ $selected?: boolean }>`
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	border-radius: 8px;
	cursor: pointer;
	background: ${(p) => (p.$selected ? "#eef2ff" : "#f8fafc")};
	border: 1px solid ${(p) => (p.$selected ? "#667eea" : "#e2e8f0")};

	&:hover {
		background: #f1f5f9;
	}
`;

export const ListCheckbox = styled.input`
	width: 18px;
	height: 18px;
	cursor: pointer;
`;

export const ListTitle = styled.span`
	font-weight: 500;
	color: #1e293b;
	font-size: 0.9rem;
`;

export const ApproveAllButton = styled.button`
	padding: 0.5rem 1rem;
	background: #f1f5f9;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	font-size: 0.85rem;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background: #e2e8f0;
	}
`;

export const UploadButton = styled.button`
	width: 100%;
	padding: 0.75rem 1.25rem;
	background: #059669;
	color: white;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	font-size: 0.95rem;
	transition: opacity 0.2s;
	margin-top: 0.5rem;

	&:hover:not(:disabled) {
		opacity: 0.9;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

export const FormSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-bottom: 1rem;
`;

export const Label = styled.label`
	font-weight: 500;
	color: #334155;
	font-size: 0.9rem;
`;

export const Input = styled.input`
	padding: 0.6rem 0.9rem;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	font-size: 0.95rem;

	&:focus {
		outline: none;
		border-color: #667eea;
	}
`;

export const Textarea = styled.textarea`
	padding: 0.75rem 1rem;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	font-family: inherit;
	font-size: 0.9rem;
	line-height: 1.5;
	resize: vertical;
	min-height: 120px;

	&:focus {
		outline: none;
		border-color: #667eea;
	}
`;

export const Select = styled.select`
	padding: 0.6rem 0.9rem;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	font-size: 0.95rem;
	background: white;

	&:focus {
		outline: none;
		border-color: #667eea;
	}
`;

export const FormRow = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
`;

export const ApproveButton = styled.button`
	padding: 0.6rem 1.2rem;
	background: #667eea;
	color: white;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
	font-size: 0.9rem;
	margin-right: 0.5rem;

	&:hover {
		opacity: 0.9;
	}
`;

export const ErrorMessage = styled.div`
	background: #fee2e2;
	color: #dc2626;
	padding: 1rem 1.5rem;
	border-radius: 8px;
	margin-bottom: 1rem;
	border: 1px solid #fecaca;
`;

export const EmptyState = styled.div`
	text-align: center;
	padding: 2rem;
	color: #64748b;
	font-size: 0.95rem;
`;

export const ModalOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
`;

export const ModalContent = styled.div`
	background: white;
	border-radius: 12px;
	padding: 1.5rem 2rem;
	min-width: 320px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

export const ModalTitle = styled.h3<{ $success?: boolean }>`
	margin: 0 0 1rem 0;
	font-size: 1.1rem;
	color: ${(p) => (p.$success ? "#059669" : "#dc2626")};
`;

export const ModalMessage = styled.p`
	margin: 0 0 1.25rem 0;
	color: #475569;
	font-size: 0.95rem;
	line-height: 1.5;
`;

export const ModalButton = styled.button`
	padding: 0.6rem 1.25rem;
	background: #667eea;
	color: white;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
	font-size: 0.9rem;

	&:hover {
		opacity: 0.9;
	}
`;

/** 미리보기 패널 컨테이너 (접었다 펼 수 있음) */
export const PreviewDrawerWrapper = styled.div`
	position: relative;
	display: flex;
	min-height: 0;
	width: 100%;
`;

/** 문제 설명 옆 펼치기 버튼 */
export const PreviewDrawerToggle = styled.button`
	padding: 0.4rem 0.8rem;
	background: #667eea;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.85rem;
	font-weight: 500;
	transition: background 0.2s;

	&:hover {
		background: #5568d3;
	}
`;

export const PreviewDrawer = styled.div<{ $expanded: boolean }>`
	width: ${(p) => (p.$expanded ? "420px" : "0")};
	min-width: 0;
	overflow: hidden;
	transition: width 0.25s ease;
	border-left: ${(p) => (p.$expanded ? "1px solid #e2e8f0" : "none")};
	margin-left: ${(p) => (p.$expanded ? "1rem" : "0")};
	display: flex;
	flex-direction: column;
	background: #f8fafc;
	border-radius: 0 8px 8px 0;
`;

export const PreviewDrawerInner = styled.div`
	width: 420px;
	min-width: 420px;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
`;

export const PreviewDrawerHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1rem;
	background: #f1f5f9;
	border-bottom: 1px solid #e2e8f0;
	flex-shrink: 0;
`;

export const PreviewDrawerClose = styled.button`
	padding: 0.35rem 0.6rem;
	background: #e2e8f0;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	font-size: 0.85rem;
	color: #475569;
	transition: all 0.2s;

	&:hover {
		background: #cbd5e1;
		color: #334155;
	}
`;
