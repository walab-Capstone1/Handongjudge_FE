export interface Question {
	id: number;
	title: string;
	content?: string;
	authorName?: string;
	authorDisplayName?: string;
	createdAt: string;
	status: "PENDING" | "RESOLVED";
	isPinned?: boolean;
	isAnonymous?: boolean;
	isPublic?: boolean;
	/** 목록 API: 현재 사용자 작성 여부 */
	isAuthor?: boolean;
	/** 교수/TA만 수신 */
	authorRealNameForStaff?: string;
	authorId?: number;
	viewCount: number;
	commentCount: number;
	likeCount: number;
	assignmentId?: number;
	problemId?: number;
	assignmentTitle?: string;
	problemTitle?: string;
}

export interface SectionInfo {
	id: number;
	sectionId?: number;
	courseTitle?: string;
	courseName?: string;
	instructorId?: number;
	isCurrentUserSectionStaff?: boolean;
}

export interface Stats {
	total: number;
	pending: number;
	resolved: number;
}

export type FilterStatus = "ALL" | "PENDING" | "RESOLVED";

export interface Assignment {
	id: number;
	title: string;
}

export interface Problem {
	id: number;
	problemId?: number;
	title?: string;
	problemTitle?: string;
}
