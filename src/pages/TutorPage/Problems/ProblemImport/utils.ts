import type {
	ProblemFileParseResult,
	EditableProblem,
} from "./types";
import type { ProblemCreateRequest, TestCaseDto } from "../ProblemCreate/types";

export function toProblemCreateRequest(
	pr: ProblemFileParseResult,
	index: number,
	filename: string,
): EditableProblem {
	const testcases: TestCaseDto[] = (pr.testcases ?? []).map((tc) => ({
		name: tc.name ?? "1",
		input: tc.input ?? "",
		output: tc.output ?? "",
		type: (tc.type === "sample" ? "sample" : "secret") as "sample" | "secret",
	}));

	const sampleInputs = pr.sampleInputs ?? [];
	const sampleInputsJson = JSON.stringify(
		sampleInputs.map((s) => ({ input: s.input ?? "", output: s.output ?? "" })),
	);

	return {
		_index: index,
		_filename: filename,
		title: pr.title ?? "",
		description: pr.description ?? "",
		inputFormat: pr.inputFormat ?? "",
		outputFormat: pr.outputFormat ?? "",
		tags: "[]",
		difficulty: "1",
		timeLimit: String(pr.timeLimit ?? 1),
		memoryLimit: String(pr.memoryLimit ?? 256),
		sampleInputs: sampleInputsJson,
		testcases,
	};
}
