/** 분반/섹션 정보 (대시보드 응답 등) */
export interface SectionInfo {
	sectionId: number;
	courseTitle?: string;
	sectionNumber?: string;
	enrollmentCode?: string;
	sectionInfo?: {
		courseTitle?: string;
		sectionNumber?: string;
	};
}

/** 과제 (getAssignmentsBySection) */
export interface AssignmentItem {
	id: number;
	title: string;
	/** 제출 마감 (API: endDate / dueDate / deadline 등) */
	dueDate?: string;
	endDate?: string;
	deadline?: string;
}

/** 퀴즈 (getQuizzesBySection, 코딩 테스트 등) */
export interface QuizItem {
	id: number;
	title: string;
	/** 제출 마감 (API: endTime 등) */
	endTime?: string;
}

/** 문제별 성적 (problemGrades 요소) */
export interface ProblemGrade {
	problemId: number;
	problemTitle?: string;
	points?: number;
	score?: number | null;
	submitted?: boolean;
	submittedAt?: string;
	isOnTime?: boolean;
}

/** 학생별 성적 (과제/퀴즈 성적 API) */
export interface StudentGradeRow {
	userId: number;
	studentName?: string;
	studentId?: string;
	totalScore?: number;
	totalPoints?: number;
	problemGrades?: ProblemGrade[];
}

/** 보기 모드 */
export type ViewMode = "assignment" | "quiz" | "course";

/** 수업 전체 보기 - 과제/퀴즈 아이템 */
export interface CourseGradeItem {
	type: "assignment" | "quiz";
	id: number;
	title: string;
	problems: { problemId: number; problemTitle?: string; points?: number }[];
	totalPoints: number;
	/** 제출 마감 (과제: endDate/dueDate, 퀴즈: endTime) */
	dueAt?: string;
}

/** 수업 전체 보기 - 학생별 과제/퀴즈 점수 */
export interface CourseStudentEntry {
	userId: number;
	studentName?: string;
	studentId?: string;
	assignments: Record<
		number,
		{
			totalScore: number;
			totalPoints: number;
			ratio: string;
			problems: Record<number, ProblemGrade>;
		}
	>;
	quizzes: Record<
		number,
		{
			totalScore: number;
			totalPoints: number;
			ratio: string;
			problems: Record<number, ProblemGrade>;
		}
	>;
}

/** 수업 전체 성적 응답 */
export interface CourseGradesData {
	items: CourseGradeItem[];
	students: CourseStudentEntry[];
}

/** 편집 중인 셀 (assignmentId: 과제 셀, quizId: 퀴즈 셀) */
export interface EditingGrade {
	userId: number;
	problemId: number;
	assignmentId?: number;
	quizId?: number;
}

/** 과제 문제 (getAssignmentProblems) */
export interface AssignmentProblemRow {
	id?: number;
	problemId?: number;
	title?: string;
	problemTitle?: string;
	points?: number;
	assignmentId?: number;
	assignmentTitle?: string;
}

/** 수업 전체 배점용 과제별 문제 목록 */
export interface AllAssignmentProblemsEntry {
	assignmentId: number;
	assignmentTitle: string;
	problems: AssignmentProblemRow[];
}

/** 수업 전체 배점용 퀴즈(코딩 테스트)별 문제 목록 */
export interface AllQuizProblemsEntry {
	quizId: number;
	quizTitle: string;
	problems: AssignmentProblemRow[];
}

/** 코드 조회 응답 */
export interface CodeResponse {
	code?: string;
	codeString?: string;
}
