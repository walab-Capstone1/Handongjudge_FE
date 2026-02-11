import type { IconType } from "react-icons";

export interface Section {
	sectionId: number;
	courseTitle: string;
	sectionNumber: string;
	year: number;
	semester:
		| "SPRING"
		| "SUMMER"
		| "FALL"
		| "WINTER"
		| "CAMP"
		| "SPECIAL"
		| "IRREGULAR";
	instructor: string;
	enrollmentCode?: string;
	_role?: "ADMIN" | "TUTOR";
	_isAdmin?: boolean;
}

export interface MenuItem {
	path: string;
	label: string;
	icon: IconType;
	subItems: MenuItem[];
	isBackLink?: boolean;
}

export interface ExpandedMenus {
	[key: string]: boolean;
}
