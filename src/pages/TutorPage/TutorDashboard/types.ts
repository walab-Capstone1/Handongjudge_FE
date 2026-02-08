export interface Course {
	id: number;
	title: string;
	description?: string;
	semester?: string;
	year?: number;
	sections?: Section[];
	createdAt?: string;
}

export interface Section {
	id: number;
	sectionNumber: string;
	courseId: number;
	courseTitle?: string;
	enrollmentCode?: string;
	maxStudents?: number;
	currentStudents?: number;
}

export interface CreateCourseData {
	title: string;
	description?: string;
	semester: string;
	year: number;
}

export interface CreateSectionData {
	courseId: number;
	sectionNumber: string;
	maxStudents?: number;
}
