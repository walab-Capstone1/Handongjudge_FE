export interface Submission {
	id: number;
	problemId: number;
	problemTitle: string;
	result: string;
	language: string;
	submittedAt: string;
	code?: string;
	sectionId?: number;
	assignmentId?: number;
}

export interface EnrolledSection {
	sectionId: number;
	courseTitle: string;
	sectionNumber: string;
	enrollmentCode: string;
}

export type TabType = "submissions" | "sections";
