// 전역 타입 정의

export interface User {
	id: string;
	name: string;
	email: string;
	role: "student" | "tutor" | "admin" | "superadmin";
	studentId?: string;
}

export interface Course {
	id: string;
	name: string;
	description: string;
	semester: string;
	year: number;
}

export interface Assignment {
	id: string;
	title: string;
	description: string;
	dueDate: string;
	courseId: string;
	problems: Problem[];
}

export interface Problem {
	id: string;
	title: string;
	description: string;
	difficulty: "easy" | "medium" | "hard";
	testCases?: TestCase[];
}

export interface TestCase {
	id: string;
	input: string;
	expectedOutput: string;
}

export interface Submission {
	id: string;
	userId: string;
	problemId: string;
	code: string;
	language: string;
	status: "pending" | "accepted" | "rejected" | "error";
	submittedAt: string;
}

export interface Notice {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	author: User;
}

// API Response 타입
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

// 페이지네이션
export interface Pagination {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: Pagination;
}
