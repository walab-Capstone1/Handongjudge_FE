export interface SectionInfo {
	id?: number;
	sectionId?: number;
	courseTitle?: string;
	courseName?: string;
	sectionNumber?: string;
	instructorId?: number;
	instructor?: { id: number };
	isCurrentUserSectionStaff?: boolean;
}

export interface Question {
	id: number;
	title: string;
	content: string;
	authorDisplayName?: string;
	authorId?: number | null;
	authorRealNameForStaff?: string;
	createdAt: string;
	viewCount: number;
	likeCount: number;
	commentCount?: number;
	status: "PENDING" | "RESOLVED";
	isPinned?: boolean;
	isAnonymous?: boolean;
	isPublic?: boolean;
	isAuthor?: boolean;
	isLikedByCurrentUser?: boolean;
	assignmentTitle?: string;
	problemTitle?: string;
}

export interface Comment {
	id: number;
	content: string;
	authorDisplayName?: string;
	authorId?: number | null;
	authorRealNameForStaff?: string;
	createdAt: string;
	likeCount: number;
	isAnonymous?: boolean;
	isAccepted?: boolean;
	isAuthor?: boolean;
	isInstructorAnswer?: boolean;
	isLikedByCurrentUser?: boolean;
}
