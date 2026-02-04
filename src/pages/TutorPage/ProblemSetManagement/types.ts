export interface ProblemSet {
	id: number;
	title: string;
	description?: string;
	problemCount?: number;
	problems?: Problem[];
	createdAt?: string;
	tags?: string;
}

export interface Problem {
	id: number;
	title: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
}

export interface CreateProblemSetData {
	title: string;
	description?: string | null;
	tags: string;
}
