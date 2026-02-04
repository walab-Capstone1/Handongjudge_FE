export interface SystemNotice {
	id: number;
	title: string;
	content: string;
	isActive: boolean;
	createdAt: string;
	updatedAt?: string;
}

export interface CreateSystemNoticeData {
	title: string;
	content: string;
	isActive: boolean;
}
