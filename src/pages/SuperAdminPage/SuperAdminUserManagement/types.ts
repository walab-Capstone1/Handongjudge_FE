export interface User {
	id: number;
	email?: string;
	name: string;
	studentId?: string;
	role: string;
	createdAt?: string;
}

export type RoleFilter = "ALL" | "USER" | "ADMIN" | "SUPER_ADMIN";
