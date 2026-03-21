export interface Section {
	sectionId: number;
	courseId: number;
	courseTitle: string;
	sectionNumber: number;
	instructorName?: string;
	studentCount?: number;
	assignmentCount?: number;
	noticeCount?: number;
	year?: number;
	semester?: string;
	active?: boolean;
}

export interface SectionStudent {
	userId: number;
	name: string;
	email: string;
	studentId?: string;
	role?: string;
}

export interface SectionAssignment {
	id: number;
	title: string;
	assignmentNumber?: string;
}

export interface AssignmentProblem {
	id: number;
	title: string;
}
