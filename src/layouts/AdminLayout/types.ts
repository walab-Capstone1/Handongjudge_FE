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
	instructor?: string;
}

export interface MenuItem {
	path: string;
	label: string;
	subItems: MenuItem[];
}

export interface ExpandedMenus {
	[key: string]: boolean;
}

export interface ExpandedSections {
	[key: number]: boolean;
}

export interface BreadcrumbItem {
	label: string;
	path: string;
}
