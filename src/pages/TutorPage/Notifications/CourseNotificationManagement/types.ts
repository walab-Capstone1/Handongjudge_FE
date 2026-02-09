export interface Notification {
	id: number;
	type: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	sectionId?: number;
	sectionName?: string;
	assignmentId?: number;
	noticeId?: number;
}

export type NotificationFilterType =
	| "ALL"
	| "ASSIGNMENT"
	| "STUDENT"
	| "NOTICE";
export type NotificationReadFilter = "ALL" | "UNREAD" | "READ";
