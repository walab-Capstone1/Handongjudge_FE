export interface Student {
	userId: number;
	name: string;
	email: string;
	/** 학번 (회원가입 시 입력, API: studentId) */
	studentId?: string;
	teamId?: string;
	sectionId: number;
	sectionName?: string;
	sectionNumber?: string;
	courseTitle?: string;
	assignmentCompletionRate?: number;
	progress?: number;
	joinedAt?: string;
	lastLoginAt?: string;
	status?: "ACTIVE" | "INACTIVE";
	role?: string;
}

export interface SectionInfo {
	sectionId: number;
	courseTitle: string;
	sectionNumber: string;
	enrollmentCode?: string;
}

export interface Assignment {
	assignmentId: number;
	assignmentTitle: string;
	description?: string;
	progressRate: number;
	solvedProblems: number;
	totalProblems: number;
}

export interface ProblemStatus {
	problemId: number;
	problemTitle: string;
	status: "ACCEPTED" | "SUBMITTED" | "NOT_SUBMITTED";
	submissionCount: number;
}

export type SortField = "name" | "email" | "joinedAt";
export type SortDirection = "asc" | "desc";
export type RoleFilter = "ALL" | "STUDENT" | "TUTOR" | "ADMIN";
