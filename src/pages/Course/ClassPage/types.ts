export interface Section {
	sectionId: number;
	courseId: string;
	courseTitle: string;
	sectionNumber: number;
	instructorName: string;
	active: boolean;
	newNoticeCount: number;
	newAssignmentCount: number;
	createdAt: string;
}

export interface CourseCardData {
	id: number;
	title: string;
	subtitle: string;
	batch: string;
	courseName: string;
	status: StatusItem[];
	instructor: string;
	color: CardColor;
	sectionId: number;
	courseId: string;
	active: boolean;
	createdAt: string;
}

export interface StatusItem {
	type: string;
	text: string;
	color: string;
}

export type CardColor = "purple" | "orange" | "red" | "blue" | "green";

export type TabType = "all" | "in-progress" | "completed";

export type SortType = "recent" | "name";
