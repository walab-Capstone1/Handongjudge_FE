export interface SystemNotice {
	id: string | number;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
}

export interface SystemGuide {
	id: string | number;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	active: boolean;
}

export type TabType = "lectures" | "management" | "system";
