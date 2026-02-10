export interface Notification {
	id: number;
	type: "notice" | "assignment" | "community" | "other";
	originalId: number;
	title: string;
	date: string;
	isNew: boolean;
	createdAt: string;
	link: string | null;
	notificationType: string;
}

export interface SectionInfo {
	id: number;
	courseTitle?: string;
	courseName?: string;
}

export interface Stats {
	total: number;
	unread: number;
	notices: number;
	assignments: number;
	community: number;
}
