export interface AdminStats {
	totalUsers: number;
	totalSections: number;
	totalAssignments: number;
	totalProblems: number;
	totalSystemNotices: number;
	totalSystemGuides: number;
}

export interface QuickAction {
	title: string;
	icon: React.ReactNode;
	path: string;
	description: string;
}
