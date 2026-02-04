export interface SectionInfo {
	id?: number;
	sectionId?: number;
	courseTitle?: string;
	courseName?: string;
	sectionNumber?: string;
}

export interface EditFormData {
	title: string;
	content: string;
	isPublic: boolean;
}
