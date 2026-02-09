export interface SectionInfo {
	id?: number;
	sectionId?: number;
	courseTitle?: string;
	courseName?: string;
}

export interface Assignment {
	id: number;
	title: string;
	problems?: Problem[];
}

export interface Problem {
	id: number;
	problemId?: number;
	title?: string;
	problemTitle?: string;
}

export interface QuestionFormData {
	title: string;
	content: string;
	isAnonymous: boolean;
	isPublic: boolean;
	assignmentId: string;
	problemId: string;
}
