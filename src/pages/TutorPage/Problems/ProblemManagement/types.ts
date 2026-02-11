export interface Problem {
	id: number;
	title: string;
	description?: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
	createdAt?: string;
	tags?: string[] | string;
	isUsed?: boolean;
	assignmentCount?: number;
	problemSetCount?: number;
	quizCount?: number;
}

export interface Section {
	sectionId: number;
	courseTitle: string;
	year: number;
	semester: string;
	sectionNumber?: string;
}

export interface Assignment {
	id: number;
	title: string;
	assignmentNumber?: string;
}

export interface ProblemUsage {
	assignments?: Array<{
		assignmentId: number;
		sectionId: number;
		courseTitle: string;
		year: number;
		semester: string;
		sectionNumber?: string;
		assignmentTitle: string;
		assignmentNumber?: string;
		assignmentStartDate: string;
		assignmentEndDate: string;
	}>;
	problemSets?: Array<{
		problemSetId: number;
		problemSetTitle: string;
		description?: string;
		createdAt: string;
	}>;
	quizzes?: Array<{
		quizId: number;
		sectionId: number;
		courseTitle: string;
		year: number;
		semester: string;
		sectionNumber?: string;
		quizTitle: string;
		startTime: string;
		endTime: string;
	}>;
}

export type SortField = "id" | "title" | "difficulty" | "createdAt";
export type SortDirection = "asc" | "desc";
