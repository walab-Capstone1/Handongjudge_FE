export type ProblemStatus = "ACCEPTED" | "SUBMITTED" | "NOT_SUBMITTED";

export interface Problem {
	id: number;
	title: string;
	description?: string;
	submitted: boolean;
	status: ProblemStatus;
	/** 제출 시 마감일 이전 여부 (미제출이면 undefined) */
	isOnTime?: boolean;
}

export interface Assignment {
	id: number;
	title: string;
	description?: string;
	endDate: string;
	progress: number;
	dDay: number | null;
	totalProblems: number;
	submittedProblems: number;
	problems: Problem[];
	active?: boolean;
}

export interface SectionInfo {
	id: number;
	courseTitle?: string;
	courseName?: string;
}
