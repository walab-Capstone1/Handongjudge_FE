export const RESULT_MAPPING_JUDGE: Record<
	string,
	{ status: string; message: string; color: string }
> = {
	AC: { status: "success", message: "정답 (Accepted)", color: "#28a745" },
	WA: { status: "error", message: "오답 (Wrong Answer)", color: "#dc3545" },
	TLE: {
		status: "error",
		message: "시간 초과 (Time Limit Exceeded)",
		color: "#ffc107",
	},
	MLE: {
		status: "error",
		message: "메모리 초과 (Memory Limit Exceeded)",
		color: "#fd7e14",
	},
	RE: {
		status: "error",
		message: "런타임 에러 (Runtime Error)",
		color: "#e83e8c",
	},
	CE: {
		status: "error",
		message: "컴파일 에러 (Compilation Error)",
		color: "#6f42c1",
	},
	PE: {
		status: "error",
		message: "출력 형식 오류 (Presentation Error)",
		color: "#17a2b8",
	},
	NO: { status: "error", message: "출력 없음 (No Output)", color: "#6c757d" },
};

export const RESULT_MAPPING_OUTPUT: Record<
	string,
	{ status: string; message: string; color: string }
> = {
	correct: { status: "success", message: "정답 (Accepted)", color: "#28a745" },
	"wrong-answer": {
		status: "error",
		message: "오답 (Wrong Answer)",
		color: "#dc3545",
	},
	timelimit: {
		status: "error",
		message: "시간 초과 (Time Limit Exceeded)",
		color: "#ffc107",
	},
	"memory-limit": {
		status: "error",
		message: "메모리 초과 (Memory Limit Exceeded)",
		color: "#fd7e14",
	},
	"run-error": {
		status: "error",
		message: "런타임 에러 (Runtime Error)",
		color: "#e83e8c",
	},
	"compiler-error": {
		status: "error",
		message: "컴파일 에러 (Compilation Error)",
		color: "#6f42c1",
	},
	"presentation-error": {
		status: "error",
		message: "출력 형식 오류 (Presentation Error)",
		color: "#17a2b8",
	},
	"no-output": {
		status: "error",
		message: "출력 없음 (No Output)",
		color: "#6c757d",
	},
	...RESULT_MAPPING_JUDGE,
};
