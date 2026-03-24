export interface CodingTest {
	id: number;
	title: string;
	description?: string;
	startTime: Date | string;
	endTime: Date | string;
	duration?: number;
	problemCount?: number;
	problemIds?: number[];
	sectionId?: number;
	status?: "ACTIVE" | "WAITING" | "PAUSED" | "ENDED";
	createdAt?: string;
}

export interface CreateCodingTestData {
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	problemIds: number[];
}

export interface QuizProblem {
	id: number;
	problemId?: number;
	title: string;
	description?: string;
	order?: number;
	points?: number;
}

export interface ProblemSubmissionStat {
	problemId: number;
	problemTitle: string;
	problemOrder?: number;
	submittedStudents?: number;
	correctSubmissions?: number;
	correctRate?: number;
}

export interface ProblemOption {
	id: number;
	title: string;
	description?: string;
	difficulty?: string;
}

export interface SubmissionStudent {
	userId: number;
	studentId: string;
	studentName: string;
	solvedProblems: number[];
	problemSubmissionTimes?: Record<number, string>;
}

export interface QuizSubmissionRecord {
	submissionId: number;
	userId: number;
	studentId: string;
	studentName: string;
	problemId: number;
	problemTitle: string;
	submittedAt: string;
	result: string;
	language: string;
}

export interface SectionInfo {
	sectionId: number;
	courseTitle?: string;
	sectionNumber?: string;
	enrollmentCode?: string | null;
}

export interface QuizDetail {
	title: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	status?: string;
	active?: boolean;
}
