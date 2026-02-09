export interface CodingTest {
	id: number;
	title: string;
	description?: string;
	startTime: string;
	endTime: string;
	duration?: number;
	problemIds?: number[];
	problems?: Problem[];
	participants?: Participant[];
}

export interface Problem {
	id: number;
	title: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
}

export interface Participant {
	userId: number;
	userName: string;
	studentId?: string;
	score?: number;
	submissions?: number;
	status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}
