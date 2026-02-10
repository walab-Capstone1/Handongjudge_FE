/**
 * 수업(Section) 관련 유틸리티
 */

import type {
	SectionInfo,
	CourseCardData,
	SectionNewItems,
	CardColor,
} from "../types";

export const getRandomColor = (id: number): CardColor => {
	const colors: CardColor[] = ["purple", "orange", "red", "blue", "green"];
	return colors[id % colors.length];
};

export const transformSectionData = (
	section: SectionInfo,
	sectionNewItems: SectionNewItems,
): CourseCardData => {
	// sectionNumber가 null이면 분반 표시하지 않음
	const batch = section.sectionNumber ? `${section.sectionNumber}분반` : "";
	const courseName = section.sectionNumber
		? `[${section.courseTitle}] ${section.sectionNumber}분반`
		: `[${section.courseTitle}]`;

	// 새로운 과제/공지사항/알림 배지 생성
	const status = [];
	const newItems = sectionNewItems[section.sectionId] || {
		newAssignment: null,
		newNotice: null,
		newNotification: null,
	};

	if (newItems.newAssignment) {
		status.push({
			type: "assignment" as const,
			text: "새로운 과제",
			color: "blue",
			notificationId: newItems.newAssignment.id,
			assignmentId: newItems.newAssignment.assignmentId,
		});
	}

	if (newItems.newNotice) {
		status.push({
			type: "announcement" as const,
			text: "새로운 공지사항",
			color: "green",
			notificationId: newItems.newNotice.id,
			noticeId: newItems.newNotice.noticeId,
		});
	}

	if (newItems.newNotification) {
		status.push({
			type: "notification" as const,
			text: "새로운 알림",
			color: "yellow",
			notificationId: newItems.newNotification.id,
			questionId: newItems.newNotification.questionId,
			notificationType: newItems.newNotification.type,
		});
	}

	return {
		id: section.sectionId,
		title: section.courseTitle,
		subtitle: `강의 ID: ${section.courseId}`,
		batch: batch,
		courseName: courseName,
		status: status,
		instructor: section.instructorName || "담당 교수",
		color: getRandomColor(section.sectionId),
		sectionId: section.sectionId,
		courseId: section.courseId,
		active: section.active !== false,
	};
};
