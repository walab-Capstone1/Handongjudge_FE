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
