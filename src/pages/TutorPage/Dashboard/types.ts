export interface Course {
	id: number;
	title: string;
	description?: string;
	semester?: string;
	year?: number;
	sections?: Section[];
	createdAt?: string;
}

export interface Section {
	id: number;
	sectionNumber: string;
	courseId: number;
	courseTitle?: string;
	enrollmentCode?: string;
	maxStudents?: number;
	currentStudents?: number;
}

/** 대시보드 목록용 섹션 (API getInstructorDashboard 응답) */
export interface DashboardSection {
	sectionId: number;
	courseTitle: string;
	year: number;
	semester: string;
	studentCount: number;
	noticeCount: number;
	active: boolean;
	createdAt: string;
	instructorName?: string;
}

export interface DashboardFormData {
	courseId: string;
	courseTitle: string;
	description: string;
	year: number | string;
	semester: string;
}

export interface DashboardCopyFormData {
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
	noticeEdits: Record<number, { title?: string; content?: string }>;
	assignmentEdits: Record<number, { title?: string; description?: string }>;
	problemEdits: Record<number, { title?: string }>;
}

export interface DashboardNotice {
	id: number;
	title: string;
	content: string;
	createdAt: string;
}

export interface DashboardProblem {
	id: number;
	title: string;
}

export interface DashboardAssignment {
	id: number;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	problems: DashboardProblem[];
}

export interface DashboardCourse {
	id: number;
	title: string;
}

export interface CreateCourseData {
	title: string;
	description?: string;
	semester: string;
	year: number;
}

export interface CreateSectionData {
	courseId: number;
	sectionNumber: string;
	maxStudents?: number;
}
