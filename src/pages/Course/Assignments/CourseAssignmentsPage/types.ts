export interface Problem {
	id: number;
	title: string;
	description?: string;
	submitted: boolean;
	status: string;
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
