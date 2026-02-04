import type { ChangeEvent, FormEvent } from "react";

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

export interface SubmissionStatsMap {
	[key: number]: {
		submittedStudents?: number;
		totalStudents?: number;
		problemStats?: unknown[];
	};
}

export interface ProblemListModalProps {
	isOpen: boolean;
	selectedAssignment: Record<string, unknown> | null;
	submissionStats: SubmissionStatsMap;
	searchTerm: string;
	onClose: () => void;
	onAddProblem: (assignment: Record<string, unknown>) => void;
	onRemoveProblem: (assignmentId: number, problemId: number) => void;
	onProblemDetail: (problemId: number) => void | Promise<void>;
	onProblemViewDetail: (problemId: number) => void | Promise<void>;
	onSearchChange: (value: string) => void;
	onProblemUpdated?: () => void;
}
