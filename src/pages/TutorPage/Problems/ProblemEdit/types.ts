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

export interface TestcaseItem {
	name?: string;
	input?: string;
	output?: string;
	type?: "sample" | "secret";
	isNew?: boolean;
	file?: File;
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
	testcases: TestcaseItem[];
}

export interface ProblemPreviewProps {
	title: string;
	description: string;
	inputFormat: string;
	outputFormat: string;
	sampleInputs: SampleInput[];
	/** true면 미리보기에 본문만 표시(입력/출력/예제는 폼에서만 보이게) */
	descriptionOnly?: boolean;
}
