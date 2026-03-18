export interface ProblemSet {
	id: number;
	title: string;
	description?: string;
	tags?: string;
	problems?: Problem[];
}

export interface Problem {
	id: number;
	title: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
	createdAt?: string;
}

export type FilterType = "all" | "available" | "added";
export type AlertType = "success" | "error" | "info";
