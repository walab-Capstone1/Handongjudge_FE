export interface SampleInput {
	input: string;
	output: string;
}

export interface ParsedTestcase {
	name?: string;
	type?: "sample" | "secret";
	input?: string;
	output?: string;
}

export interface ProblemFormData {
	title: string;
	description: string;
	descriptionText?: string;
	inputFormat: string;
	outputFormat: string;
	tags: string[];
	difficulty: string;
	timeLimit: string;
	memoryLimit: string;
	sampleInputs: SampleInput[];
	testcases: File[];
}
