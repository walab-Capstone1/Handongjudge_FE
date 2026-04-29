// CourseDashboard 타입 정의

export interface SectionInfo {
	sectionId: number;
	courseId: string;
	courseTitle: string;
	sectionNumber?: string | null;
	instructorName?: string;
	active?: boolean;
	/** 수업 한 줄 소개 (백엔드에서 내려주는 경우) */
	description?: string | null;
}

/** 대시보드 코딩 테스트 요약용 */
export interface SectionQuiz {
	id: number;
	title: string;
	startTime: string;
	endTime: string;
	status?: "WAITING" | "ACTIVE" | "ENDED";
}

export interface CourseCardData {
	id: number;
	sectionId: number;
	title: string;
	subtitle: string;
	batch: string;
	courseName: string;
	status: StatusItem[];
	instructor: string;
	color: string;
	courseId: string;
	active: boolean;
	enrollmentCode?: string;
	_role?: string;
	_isAdmin?: boolean;
}

export interface StatusItem {
	type: "assignment" | "announcement" | "notification";
	text: string;
	color: string;
	notificationId?: number;
	assignmentId?: number;
	noticeId?: number;
	questionId?: number;
	notificationType?: string;
}

export interface Notice {
	id: number;
	sectionId: number;
	sectionName: string;
	title: string;
	createdAt: string;
	isNew?: boolean;
	date?: string;
}

export interface Assignment {
	id: number;
	sectionId: number;
	sectionName: string;
	title: string;
	endDate: string;
	/** 문제 제출 진행 (과제 페이지와 동일 표시용, 다가오는 마감에서만 채움) */
	submittedProblems?: number;
	totalProblems?: number;
}

/** 대시보드 좌측 '학습 진행' 카드용 집계 */
export interface StudyProgressSummary {
	loading: boolean;
	error: boolean;
	/** 마감일이 아직 지나지 않은 과제 개수 */
	assignmentUpcomingCount: number;
	/** 마감 전 과제들에서 제출 처리된 문제 수 (과제 목록과 동일 기준) */
	assignmentSolvedProblems: number;
	assignmentTotalProblems: number;
	/** 이 수업의 코딩 테스트 개수 */
	quizCount: number;
	/** 전체 퀴즈에서 채점 결과가 AC인 문제 수 합 */
	quizSolvedProblems: number;
	quizTotalProblems: number;
}

export interface Notification {
	id: number;
	sectionId: number;
	sectionName: string;
	type: string;
	message: string;
	createdAt: string;
	isRead: boolean;
	assignmentId?: number;
	assignmentTitle?: string;
	noticeId?: number;
	noticeTitle?: string;
	questionId?: number;
}

export interface TransformedNotification {
	id: number;
	title: string;
	date: string;
	isNew: boolean;
	type: string;
	link: string | null;
	sectionName: string;
	sectionId: number;
}

export interface SectionNewItems {
	[sectionId: number]: {
		newAssignment: {
			id: number;
			assignmentId: number;
			title: string;
		} | null;
		newNotice: {
			id: number;
			noticeId: number;
			title: string;
		} | null;
		newNotification: {
			id: number;
			questionId: number;
			type: string;
			title: string;
		} | null;
	};
}

export type CardColor = "purple" | "orange" | "red" | "blue" | "green";
