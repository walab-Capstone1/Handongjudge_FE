export interface SignupFormData {
	email: string;
	password: string;
	passwordConfirm: string;
	name: string;
	studentId: string;
}

export interface FormErrors {
	email?: string;
	password?: string;
	passwordConfirm?: string;
	name?: string;
	studentId?: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
	studentId: string;
}
