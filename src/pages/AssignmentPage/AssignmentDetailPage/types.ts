export interface Assignment {
	id: number;
	title: string;
	description?: string;
	deadline: string;
	problems?: Problem[];
}

export interface Problem {
	id: number;
	title: string;
	difficulty?: string;
	isSolved?: boolean;
}
