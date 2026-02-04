export interface AssignmentFormData {
	title: string;
	description: string;
	assignmentNumber: string;
	startDate: string;
	endDate: string;
}

export interface SectionInfo {
	sectionId: number;
	courseTitle: string;
	sectionNumber: string;
	enrollmentCode?: string;
}

export interface AssignmentDetail {
	id: number;
	title: string;
	description?: string;
	assignmentNumber?: string;
	startDate?: string;
	endDate?: string;
	deadline?: string;
	sectionId?: number;
}
