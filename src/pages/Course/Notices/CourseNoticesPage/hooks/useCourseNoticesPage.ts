import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { Notice, SectionInfo } from "../types";

export function useCourseNoticesPage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [activeMenu] = useState("공지사항");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [notices, setNotices] = useState<Notice[]>([]);
	const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

	const fetchNoticesData = useCallback(async () => {
		if (!sectionId) return;

		try {
			setLoading(true);
			setError(null);

			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);

			const noticesResponse = await APIService.getSectionNotices(sectionId);
			const noticesList = noticesResponse.data || noticesResponse;

			const sortedNotices = [...noticesList].sort((a: Notice, b: Notice) => {
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});

			setNotices(sortedNotices);
		} catch (err: unknown) {
			console.error("공지사항 데이터 조회 실패:", err);
			setError(
				err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	useEffect(() => {
		if (sectionId && auth.user) {
			fetchNoticesData();
		}
	}, [sectionId, auth.user, fetchNoticesData]);

	const handleSortToggle = useCallback(() => {
		const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
		setSortOrder(newSortOrder);
		setNotices((prev) => {
			const sorted = [...prev].sort((a, b) => {
				const dateA = new Date(a.createdAt).getTime();
				const dateB = new Date(b.createdAt).getTime();
				return newSortOrder === "desc" ? dateB - dateA : dateA - dateB;
			});
			return sorted;
		});
	}, [sortOrder]);

	const formatDate = useCallback((dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
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
					break;
				case "notification":
					break;
				default:
					break;
			}
		},
		[navigate, sectionId],
	);

	const handleNoticeClick = useCallback(
		async (notice: Notice) => {
			if (notice.isNew) {
				try {
					await APIService.markNoticeAsRead(notice.id);
					setNotices((prev) =>
						prev.map((n) =>
							n.id === notice.id ? { ...n, isNew: false } : n,
						),
					);
				} catch (err) {
					console.error("공지사항 읽음 처리 실패:", err);
				}
			}
			navigate(`/sections/${sectionId}/course-notices/${notice.id}`);
		},
		[navigate, sectionId],
	);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	const newNoticesCount = notices.filter((n) => n.isNew).length;
	const totalNoticesCount = notices.length;

	return {
		sectionId,
		activeMenu,
		loading,
		error,
		isSidebarCollapsed,
		sectionInfo,
		notices,
		sortOrder,
		newNoticesCount,
		totalNoticesCount,
		fetchNoticesData,
		handleSortToggle,
		formatDate,
		handleMenuClick,
		handleNoticeClick,
		handleToggleSidebar,
	};
}

export type CourseNoticesPageHookReturn = ReturnType<typeof useCourseNoticesPage>;
