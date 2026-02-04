export interface Problem {
	id: number;
	title: string;
	description?: string;
	inputFormat?: string;
	outputFormat?: string;
	difficulty?: string;
	timeLimit?: number;
	memoryLimit?: number;
	sampleInputs?: SampleInput[];
}

export interface SampleInput {
	input: string;
	output: string;
}

export interface SubmissionResult {
	id: number;
	result: string;
	message?: string;
	passedTests?: number;
	totalTests?: number;
}
