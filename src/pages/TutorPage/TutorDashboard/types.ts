export interface Section {
	sectionId: number;
	courseTitle: string;
	instructorName?: string;
	year: number;
	semester: string;
	active: boolean;
	studentCount?: number;
	noticeCount?: number;
	sectionNumber?: string;
	createdAt?: string;
	enrollmentCode?: string;
}

export interface UpcomingDeadline {
	assignmentId: number;
	title: string;
	endDate: string;
	submissionRate: number;
	sectionId?: number;
	sectionName?: string;
}

export interface SectionStat {
	averageSubmissionRate: number;
	atRiskStudents: number;
	issues: number;
	upcomingDeadlines: UpcomingDeadline[];
	pendingGrading: number;
	totalAssignments: number;
	activeAssignments: number;
}

export interface FormData {
	courseTitle: string;
	description: string;
	sectionNumber: string;
	year: number | string;
	semester: string;
}

export interface CopyFormData {
	sourceSectionId: string;
	courseTitle: string;
	description: string;
	year: number | string;
	semester: string;
	copyNotices: boolean;
	copyAssignments: boolean;
	selectedNoticeIds: number[];
	selectedAssignmentIds: number[];
	assignmentProblems: Record<number, number[]>;
}

export interface Notice {
	id: number;
	title: string;
	content?: string;
	createdAt: string;
}

export interface Problem {
	id: number;
	title: string;
	description?: string;
	timeLimit?: number;
	memoryLimit?: number;
}

export interface Assignment {
	id: number;
	title: string;
	description?: string;
	endDate?: string;
	active?: boolean;
	problems: Problem[];
}
