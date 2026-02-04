export interface Problem {
	id: number;
	title: string;
	description?: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
	createdAt?: string;
	tags?: string[];
}

export type SortField = "id" | "title" | "difficulty" | "createdAt";
export type SortDirection = "asc" | "desc";
