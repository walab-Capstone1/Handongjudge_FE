export interface NoticeFormData {
	title: string;
	content: string;
	sectionId: string;
}

export interface SectionInfo {
	sectionId: number;
	courseTitle: string;
	sectionNumber?: string;
	courseId?: string;
}
