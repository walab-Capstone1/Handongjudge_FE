export interface ProblemSet {
	id: number;
	title: string;
	description?: string;
	problems?: Problem[];
}

export interface Problem {
	id: number;
	title: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
}

export type FilterType = "all" | "available" | "added";
export type AlertType = "success" | "error" | "info";
