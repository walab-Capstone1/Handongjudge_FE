import type { Section, CourseCardData, StatusItem, CardColor } from "../types";

/**
 * section 데이터를 기반으로 상태 정보 생성
 */
export const generateStatus = (section: Section): StatusItem[] => {
	const status: StatusItem[] = [];

	if (section.newNoticeCount > 0) {
		status.push({ type: "announcement", text: `새로운 공지`, color: "green" });
	}

	if (section.newAssignmentCount > 0) {
		status.push({ type: "assignment", text: `새로운 과제`, color: "blue" });
	}

	return status;
};

/**
 * section ID를 기반으로 일관된 색상 생성
 */
export const getRandomColor = (id: number): CardColor => {
	const colors: CardColor[] = ["purple", "orange", "red", "blue", "green"];
	return colors[id % colors.length];
};

/**
 * API 응답 데이터를 CourseCard 컴포넌트에 맞는 형태로 변환
 */
export const transformSectionData = (section: Section): CourseCardData => {
	return {
		id: section.sectionId,
		title: section.courseTitle,
		subtitle: `강의 ID: ${section.courseId}`,
		batch: `${section.sectionNumber}분반`,
		courseName: `[${section.courseTitle}] ${section.sectionNumber}분반`,
		status: generateStatus(section),
		instructor: section.instructorName,
		color: getRandomColor(section.sectionId),
		sectionId: section.sectionId,
		courseId: section.courseId,
		active: section.active,
		createdAt: section.createdAt || new Date().toISOString(),
	};
};

/**
 * 참가 코드 추출 (URL 또는 코드)
 */
export const extractEnrollmentCode = (input: string): string => {
	const trimmed = input.trim();
	const urlPattern = /\/enroll\/([^\/\s?#]+)/;
	const urlMatch = trimmed.match(urlPattern);
	if (urlMatch) {
		return urlMatch[1];
	}

	try {
		const url = new URL(trimmed);
		const pathMatch = url.pathname.match(/\/enroll\/([^\/\s?#]+)/);
		if (pathMatch) {
			return pathMatch[1];
		}
	} catch (e) {
		// URL이 아닌 경우 그대로 사용
	}

	return trimmed;
};

/**
 * 관리 중인 수업 API 응답을 CourseCardData로 변환
 */
export function transformManagingSection(section: {
	sectionId: number;
	sectionInfo?: {
		courseTitle?: string;
		sectionNumber?: string | number;
		instructorName?: string;
		active?: boolean;
		courseId?: string;
	};
}): CourseCardData {
	return {
		id: section.sectionId,
		sectionId: section.sectionId,
		title: section.sectionInfo?.courseTitle ?? "",
		subtitle: `${section.sectionInfo?.sectionNumber ?? ""}분반`,
		batch: `${section.sectionInfo?.sectionNumber ?? ""}분반`,
		courseName: `[${section.sectionInfo?.courseTitle ?? ""}]`,
		status: [],
		instructor: section.sectionInfo?.instructorName ?? "",
		color: getRandomColor(section.sectionId),
		active: section.sectionInfo?.active !== false,
		createdAt: new Date().toISOString(),
		courseId: section.sectionInfo?.courseId ?? "",
	};
}
