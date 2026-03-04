import type { ProblemCreateRequest, TestCaseDto } from "../ProblemCreate/types";

/** 백엔드 BulkParseItemResult */
export interface BulkParseItemResult {
	filename: string;
	success: boolean;
	parseResult?: ProblemFileParseResult;
	validationErrors?: string[];
}

/** 백엔드 ProblemFileParseResult */
export interface ProblemFileParseResult {
	title?: string;
	description?: string;
	inputFormat?: string;
	outputFormat?: string;
	sampleInputs?: { input?: string; output?: string }[];
	timeLimit?: number;
	memoryLimit?: number;
	testcases?: { name?: string; input?: string; output?: string; type?: string }[];
}

/** 편집 중인 문제 (parseResult → ProblemCreateRequest 변환용) */
export interface EditableProblem extends ProblemCreateRequest {
	_index: number;
	_filename: string;
}
