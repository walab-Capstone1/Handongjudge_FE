export interface Problem {
	id?: number;
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

export interface ResultInfo {
	status: string;
	message: string;
	color: string;
}

/** 제출 결과 UI 상태 (ExecutionResult 등에서 사용) */
export interface SubmissionResultState {
	status: "completed" | "error";
	result?: string;
	resultInfo?: ResultInfo;
	submissionId?: number;
	submittedAt?: string;
	language?: string;
	code?: string;
	outputList?: Array<{
		id?: number;
		testcase_rank: number;
		result: string | null;
		runtime?: number;
		memory_used?: number;
		testcase_input?: string;
		expected_output?: string;
		output?: string;
		output_error?: string;
		output_diff?: string;
	}>;
	type?: "judge" | "output";
	message?: string;
}

export interface SubmissionResult {
	id: number;
	result: string;
	message?: string;
	passedTests?: number;
	totalTests?: number;
}
