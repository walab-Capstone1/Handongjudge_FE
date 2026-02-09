/**
 * 알림 관련 유틸리티
 */

import type { Notification, TransformedNotification } from "../types";
import { formatDate } from "./dateUtils";

export const transformNotification = (
	notif: Notification,
): TransformedNotification => {
	let title = "";
	let link: string | null = null;

	switch (notif.type) {
		case "NOTICE_CREATED":
			title = `새 공지사항: ${notif.noticeTitle || "공지사항"}`;
			link = notif.noticeId
				? `/sections/${notif.sectionId}/course-notices/${notif.noticeId}`
				: null;
			break;
		case "ASSIGNMENT_CREATED":
			title = `새 과제: ${notif.assignmentTitle || "과제"}`;
			link = notif.assignmentId
				? `/sections/${notif.sectionId}/course-assignments?assignmentId=${notif.assignmentId}`
				: null;
			break;
		case "QUESTION_COMMENT":
			title = notif.message || "내 질문에 댓글이 달렸습니다";
			link = notif.questionId
				? `/sections/${notif.sectionId}/community/${notif.questionId}`
				: null;
			break;
		case "COMMENT_ACCEPTED":
			title = notif.message || "내 댓글이 채택되었습니다";
			link = notif.questionId
				? `/sections/${notif.sectionId}/community/${notif.questionId}`
				: null;
			break;
		case "QUESTION_LIKED":
		case "COMMENT_LIKED":
			title = notif.message || "추천을 받았습니다";
			link = notif.questionId
				? `/sections/${notif.sectionId}/community/${notif.questionId}`
				: null;
			break;
		default:
			title = notif.message || "새 알림";
			break;
	}

	return {
		id: notif.id,
		title: title,
		date: formatDate(notif.createdAt),
		isNew: !notif.isRead,
		type: notif.type,
		link: link,
		sectionName: notif.sectionName,
	};
};
