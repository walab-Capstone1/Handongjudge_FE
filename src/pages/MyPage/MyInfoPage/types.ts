export interface UserProfile {
	id: number;
	email: string;
	name: string;
	studentId?: string;
	createdAt: string;
}

export interface UserStats {
	totalSubmissions: number;
	solvedProblems: number;
	totalProblems: number;
	successRate: number;
}

export interface GitHubStatus {
	isConnected: boolean;
	githubUsername?: string;
	githubProfileUrl?: string;
	autoCommitEnabled: boolean;
}
