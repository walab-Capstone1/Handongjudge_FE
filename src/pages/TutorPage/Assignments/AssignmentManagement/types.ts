export interface Assignment {
	id: number;
	title: string;
	description?: string;
	deadline?: string;
	dueDate?: string;
	sectionId: number;
	problemIds?: number[];
	problems?: Problem[];
	createdAt?: string;
	active?: boolean;
	sectionName?: string;
	problemCount?: number;
	totalStudents?: number;
}

export interface Problem {
	id: number;
	title: string;
	difficulty?: string;
}

export interface SectionInfo {
	sectionId: number;
	courseTitle: string;
	sectionNumber: string;
	enrollmentCode?: string;
}

export interface CreateAssignmentData {
	title: string;
	description?: string;
	deadline: string;
	sectionId: number;
	problemIds: number[];
}

export interface AssignmentFormData {
	title: string;
	description: string;
	sectionId: string;
	startDate: string;
	dueDate: string;
	assignmentNumber: string;
}

export interface SectionForModal {
	sectionId: number;
	courseTitle: string;
	sectionName: string;
}

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
