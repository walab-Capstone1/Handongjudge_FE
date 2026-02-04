// CourseDashboard 타입 정의

export interface SectionInfo {
	sectionId: number;
	courseId: string;
	courseTitle: string;
	sectionNumber?: string | null;
	instructorName?: string;
	active?: boolean;
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
