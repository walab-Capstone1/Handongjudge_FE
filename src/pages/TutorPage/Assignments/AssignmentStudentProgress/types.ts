export interface Assignment {
	id: number;
	title: string;
	description?: string;
	deadline?: string;
	endDate?: string;
	problemCount?: number;
	problems?: Problem[];
	stats?: SubmissionStats;
}

export interface SubmissionStats {
	submittedStudents?: number;
	totalStudents?: number;
	[key: string]: unknown;
}

export interface StudentProgress {
	userId: number;
	studentName: string;
	studentId: string;
	sectionId: number;
	solvedProblems?: number[];
	assignmentCompletedAt?: string;
	problemSubmissionTimes?: Record<number, string>;
	totalProblems?: number;
	progressRate?: number;
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

export type FilterStatus = "ALL" | "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";
