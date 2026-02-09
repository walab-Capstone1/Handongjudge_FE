import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from "react";

export interface ProblemFormData {
	title: string;
	descriptionFile: File | null;
	zipFile: File | null;
}

export interface BulkProblemItem {
	title: string;
	descriptionFile: File | null;
	zipFile: File | null;
}

export interface BulkProblemData {
	problems: BulkProblemItem[];
}

export interface ProblemSelectModalProps {
	isOpen: boolean;
	selectedAssignment: { id: number; title?: string; sectionId?: number } | null;
	filteredProblems: { id: number; title?: string; createdAt?: string }[];
	selectedProblemIds: number[];
	problemSearchTerm: string;
	onClose: () => void;
	onProblemToggle: (problemId: number) => void;
	onSelectAll: () => void;
	onSearchChange: (value: string) => void;
	onSelectProblems: (problemIds: number[]) => void;
	onCopyProblem: () => void;
	onCreateNew: () => void;
	onProblemDetail: (problemId: number) => void | Promise<void>;
}

export interface ProblemCreateModalProps {
	isOpen: boolean;
	formData: ProblemFormData;
	onClose: () => void;
	onSubmit: (e: FormEvent) => void;
	onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface BulkProblemCreateModalProps {
	isOpen: boolean;
	bulkProblemData: BulkProblemData;
	onClose: () => void;
	onSubmit: (e: FormEvent) => void;
	onInputChange: (index: number, field: string, value: string) => void;
	onFileChange: (index: number, field: string, file: File | null) => void;
	onAddRow: () => void;
	onRemoveRow: (index: number) => void;
}

export interface ProblemDetailModalProps {
	isOpen: boolean;
	problemDetail: {
		title?: string;
		description?: string;
		timeLimit?: number;
		memoryLimit?: number;
	} | null;
	onClose: () => void;
}

export interface ProblemStatItem {
	problemId: number;
	correctSubmissions?: number;
	totalStudents?: number;
}

export interface SubmissionStatsMap {
	[key: number]: {
		submittedStudents?: number;
		totalStudents?: number;
		problemStats?: ProblemStatItem[];
	};
}

/** ProblemListModal 폼 데이터 */
export interface ProblemListFormData {
	title: string;
	description: string;
	descriptionText: string;
	inputFormat: string;
	outputFormat: string;
	tags: string[];
	difficulty: string;
	timeLimit: string;
	memoryLimit: string;
	sampleInputs: { input: string; output: string }[];
	testcases: ProblemListTestcaseItem[];
}

/** 테스트케이스 항목 (폼/파싱) */
export interface ProblemListTestcaseItem {
	name?: string;
	input?: string;
	output?: string;
	type?: "sample" | "secret";
	file?: File;
	isNew?: boolean;
}

/** 검증 실패 테스트케이스 */
export interface IncompleteTestCaseItem {
	name: string;
	missing: string;
}

export interface ProblemListModalProps {
	isOpen: boolean;
	selectedAssignment: {
		id: number;
		title?: string;
		problems?: { id: number; title?: string; difficulty?: string | number }[];
	} | null;
	submissionStats: SubmissionStatsMap;
	searchTerm: string;
	onClose: () => void;
	onAddProblem: (assignment: { id: number; title?: string }) => void;
	onRemoveProblem: (assignmentId: number, problemId: number) => void;
	onProblemDetail?: (problemId: number) => void | Promise<void>;
	onProblemViewDetail?: (problemId: number) => void | Promise<void>;
	onSearchChange: (value: string) => void;
	onProblemUpdated?: () => void;
	/** 수정 클릭 시 전체 문제 수정 페이지로 이동할 때 사용 (과제 관리에서 진입 시) */
	onEditProblemNavigate?: (problemId: number) => void;
}

/** 목록 모드에서 보여줄 문제 타입 */
export interface ProblemListItem {
	id: number;
	title?: string;
	difficulty?: string | number;
}

/** ProblemListEditView props */
export interface ProblemListEditViewProps {
	title: string;
	error: string | null;
	loading: boolean;
	onCancel: () => void;
	children: ReactNode;
}

/** ProblemListView props */
export interface ProblemListViewProps {
	selectedAssignment: {
		id: number;
		title?: string;
		problems?: ProblemListItem[];
	};
	submissionStats: SubmissionStatsMap;
	searchTerm: string;
	filteredProblems: ProblemListItem[];
	onClose: () => void;
	onAddProblem: (assignment: { id: number; title?: string }) => void;
	onRemoveProblem: (assignmentId: number, problemId: number) => void;
	onProblemDetail?: (problemId: number) => void | Promise<void>;
	onProblemViewDetail?: (problemId: number) => void | Promise<void>;
	onSearchChange: (value: string) => void;
	onEditProblem: (problemId: number) => void;
}

/** 편집 폼 공통 핸들러 (ProblemListEditForm 하위에서 사용) */
export interface ProblemListEditFormHandlers {
	handleInputChange: (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => void;
	handleTagAdd: () => void;
	handleTagKeyPress: (e: KeyboardEvent) => void;
	handleTagRemove: (tag: string) => void;
	handleSampleInputChange: (
		index: number,
		field: "input" | "output",
		value: string,
	) => void;
	addSampleInput: () => void;
	removeSampleInput: (index: number) => void;
	handleTestcaseAdd: (e: ChangeEvent<HTMLInputElement>) => void;
	handleTestcaseRemove: (index: number) => void;
	handleTestcaseChange: (index: number, field: string, value: string) => void;
	handleZipFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
	applyFormat: (command: string, value?: string | null) => void;
	insertText: (text: string) => void;
	getFullDescription: () => {
		title: string;
		description: string;
		inputFormat: string;
		outputFormat: string;
		sampleInputs: { input: string; output: string }[];
	};
}
