export interface Notice {
	id: string | number;
	title: string;
	content: string;
	sectionId: number;
	sectionName: string;
	instructorName?: string;
	createdAt: string;
	active: boolean;
	isNew?: boolean;
}

export interface Section {
	sectionId: number;
	courseTitle: string;
	enrollmentCode?: string;
}
