import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { Notice, SectionInfo } from "../types";

export function useCourseNoticeDetailPage() {
	const { sectionId, noticeId } = useParams<{
		sectionId: string;
		noticeId: string;
	}>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [activeMenu] = useState("공지사항");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [notice, setNotice] = useState<Notice | null>(null);
	const [allNotices, setAllNotices] = useState<Notice[]>([]);

	const fetchNoticeDetail = useCallback(async () => {
		if (!sectionId || !noticeId) return;
		try {
			setLoading(true);
			setError(null);
			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);
			const noticesResponse = await APIService.getSectionNotices(sectionId);
			const noticesList = noticesResponse.data || noticesResponse;
			setAllNotices(noticesList);
			const currentNotice = noticesList.find(
				(n: Notice) => n.id === Number.parseInt(noticeId, 10),
			);
			if (!currentNotice) {
				setError("공지사항을 찾을 수 없습니다.");
				return;
			}
			setNotice(currentNotice);
			if (currentNotice.isNew) {
				try {
					await APIService.markNoticeAsRead(currentNotice.id);
				} catch (readErr) {
					console.error("공지사항 읽음 처리 실패:", readErr);
				}
			}
		} catch (err: unknown) {
			console.error("공지사항 상세 조회 실패:", err);
			setError(
				err instanceof Error
					? err.message
					: "공지사항을 불러오는데 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	}, [sectionId, noticeId]);

	useEffect(() => {
		if (sectionId && noticeId && auth.user) {
			fetchNoticeDetail();
		}
	}, [sectionId, noticeId, auth.user, fetchNoticeDetail]);

	const formatDate = useCallback((dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
	}, []);

	const handleMenuClick = useCallback(
		(menuId: string) => {
			switch (menuId) {
				case "dashboard":
					navigate(`/sections/${sectionId}/dashboard`);
					break;
				case "assignment":
					navigate(`/sections/${sectionId}/course-assignments`);
					break;
				case "notice":
					navigate(`/sections/${sectionId}/course-notices`);
					break;
				default:
					break;
			}
		},
		[navigate, sectionId],
	);

	const goToList = useCallback(() => {
		navigate(`/sections/${sectionId}/course-notices`);
	}, [navigate, sectionId]);

	const goToPrevNotice = useCallback(() => {
		if (!noticeId) return;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId, 10),
		);
		if (currentIndex > 0) {
			navigate(
				`/sections/${sectionId}/course-notices/${allNotices[currentIndex - 1].id}`,
			);
		}
	}, [noticeId, allNotices, navigate, sectionId]);

	const goToNextNotice = useCallback(() => {
		if (!noticeId) return;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId, 10),
		);
		if (currentIndex < allNotices.length - 1) {
			navigate(
				`/sections/${sectionId}/course-notices/${allNotices[currentIndex + 1].id}`,
			);
		}
	}, [noticeId, allNotices, navigate, sectionId]);

	const hasPrevNotice = useCallback((): boolean => {
		if (!noticeId) return false;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId, 10),
		);
		return currentIndex > 0;
	}, [noticeId, allNotices]);

	const hasNextNotice = useCallback((): boolean => {
		if (!noticeId) return false;
		const currentIndex = allNotices.findIndex(
			(n) => n.id === Number.parseInt(noticeId, 10),
		);
		return currentIndex < allNotices.length - 1;
	}, [noticeId, allNotices]);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	return {
		sectionId,
		noticeId,
		activeMenu,
		loading,
		error,
		isSidebarCollapsed,
		sectionInfo,
		notice,
		formatDate,
		handleMenuClick,
		goToList,
		goToPrevNotice,
		goToNextNotice,
		hasPrevNotice,
		hasNextNotice,
		handleToggleSidebar,
	};
}

export type CourseNoticeDetailPageHookReturn = ReturnType<
	typeof useCourseNoticeDetailPage
>;
