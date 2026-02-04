export interface Course {
	id: number;
	title: string;
	description?: string;
	semester?: string;
	year?: number;
	instructorName?: string;
	sectionCount?: number;
}
