export interface Problem {
	id: number;
	title: string;
	description: string;
	order: number;
}

export interface QuizInfo {
	title: string;
	description: string;
	startTime: Date | null;
	endTime: Date | null;
	status: string;
	problems: Problem[];
}

export interface SectionInfo {
	courseTitle: string;
	sectionNumber: number;
	instructorName: string;
}

export interface CurrentProblem {
	title: string;
	description: string;
	[key: string]: any;
}

export interface PanelLayout {
	left: string;
	topRight: string;
	bottomRight: string;
}

export interface ResultInfo {
	status: string;
	message: string;
	color: string;
}

export interface SubmissionResult {
	status: string;
	result?: string;
	resultInfo: ResultInfo;
	submissionId?: number;
	submittedAt?: string;
	language?: string;
	code?: string;
	type: string;
	message?: string;
	outputList?: any;
}
