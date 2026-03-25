export type ProblemStatus = "ACCEPTED" | "SUBMITTED" | "NOT_SUBMITTED";

export interface Problem {
	id: number;
	title: string;
	description?: string;
	submitted: boolean;
	status: ProblemStatus;
	/** 제출 시 마감일 이전 여부 (미제출이면 undefined) */
	isOnTime?: boolean;
	/** 제출 시각 ISO 문자열 (미제출이면 undefined) */
	submittedAt?: string;
	/** 지각 제출 시 마감 대비 늦은 분 수 (제시간/미제출이면 undefined) */
	minutesLate?: number;
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
