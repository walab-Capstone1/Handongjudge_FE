export interface SystemGuide {
	id: number;
	title: string;
	content: string;
	category: string;
	order: number;
	createdAt: string;
}

export interface CreateSystemGuideData {
	title: string;
	content: string;
	category: string;
	order: number;
}
