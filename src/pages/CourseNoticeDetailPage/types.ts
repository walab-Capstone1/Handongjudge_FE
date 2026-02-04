export interface Notice {
	id: number;
	title: string;
	content?: string;
	createdAt: string;
	instructorName?: string;
	isNew: boolean;
}

export interface SectionInfo {
	id: number;
	courseTitle?: string;
	courseName?: string;
	sectionNumber?: string;
}
