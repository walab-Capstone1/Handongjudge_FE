export interface SampleInput {
	input: string;
	output: string;
}

/** 백엔드 ProblemCreateRequest DTO와 매칭 */
export interface TestCaseDto {
	name: string;
	input: string;
	output: string;
	type: "sample" | "secret";
}

/** 백엔드 ProblemCreateRequest DTO */
export interface ProblemCreateRequest {
	title: string;
	description: string;
	inputFormat?: string;
	outputFormat?: string;
	tags?: string;
	difficulty?: string;
	timeLimit?: string;
	memoryLimit?: string;
	sampleInputs?: string;
	testcases: TestCaseDto[];
	/** Domjudge 공백 엄격 채점 */
	strictWhitespaceGrading?: boolean;
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
	strictWhitespaceGrading?: boolean;
}
