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
	/** judging: 채점 중, completed: 채점 완료, error: 오류 */
	status: "judging" | "completed" | "error";
	result?: string;
	resultInfo: ResultInfo;
	/** Phase 2: DB 기본 키 (폴링 식별자) */
	submissionDbId?: number;
	submissionId?: number | string;
	submittedAt?: string;
	language?: string;
	code?: string;
	type: string;
	message?: string;
	outputList?: any;
	// 퀴즈 scoring 필드
	passedCount?: number;
	totalCount?: number;
	points?: number;
	score?: number;
}

export interface ProblemWorkStatus {
	problemId: number;
	submitted: boolean;
	result?: string | null;
	saved: boolean;
}
