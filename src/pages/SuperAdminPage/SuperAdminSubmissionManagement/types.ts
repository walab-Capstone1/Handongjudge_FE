export interface Submission {
	id: number;
	userId: number;
	userName: string;
	problemId: number;
	problemTitle: string;
	language: string;
	result: string;
	submittedAt: string;
}

export type ResultFilter =
	| "ALL"
	| "ACCEPTED"
	| "WRONG_ANSWER"
	| "RUNTIME_ERROR"
	| "TIME_LIMIT"
	| "COMPILE_ERROR";
