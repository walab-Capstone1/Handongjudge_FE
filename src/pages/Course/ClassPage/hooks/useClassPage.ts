import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import APIService from "../../../../services/APIService";
import type { Section, CourseCardData, TabType, SortType } from "../types";
import {
	transformSectionData,
	extractEnrollmentCode,
} from "../utils/sectionUtils";

export function useClassPage() {
	const { user, isAuthenticated } = useAuth();
	const [enrolledSections, setEnrolledSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<SortType>("recent");
	const [enrollmentCode, setEnrollmentCode] = useState("");
	const [enrollLoading, setEnrollLoading] = useState(false);
	const [showEnrollModal, setShowEnrollModal] = useState(false);

	const userName = user?.name || user?.username || user?.email || "사용자 이름";

	const fetchEnrolledSections = useCallback(async () => {
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);
			const response = await APIService.getUserEnrolledSections();
			setEnrolledSections(response.data || response);
		} catch (err: unknown) {
			console.error("수강 중인 section 조회 실패:", err);
			setError(
				err instanceof Error ? err.message : "수강 중인 강의를 불러오는데 실패했습니다.",
			);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		fetchEnrolledSections();
	}, [fetchEnrolledSections]);

	const handleStatusUpdate = useCallback(async () => {
		try {
			const response = await APIService.getUserEnrolledSections();
			setEnrolledSections(response.data || response);
		} catch (err) {
			console.error("대시보드 새로고침 실패:", err);
		}
	}, []);

	const getFilteredSections = useCallback((): CourseCardData[] => {
		let filtered = enrolledSections.map(transformSectionData);
		if (activeTab === "in-progress") {
			filtered = filtered.filter((section) => section.active !== false);
		} else if (activeTab === "completed") {
			filtered = filtered.filter((section) => section.active === false);
		}
		if (searchTerm) {
			filtered = filtered.filter(
				(section) =>
					section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					section.courseName.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}
		if (sortBy === "recent") {
			filtered.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
		} else if (sortBy === "name") {
			filtered.sort((a, b) => a.title.localeCompare(b.title));
		}
		return filtered;
	}, [enrolledSections, activeTab, searchTerm, sortBy]);

	const stats = useMemo(() => {
		const all = enrolledSections.length;
		const inProgress = enrolledSections.filter((s) => s.active !== false).length;
		const completed = enrolledSections.filter((s) => s.active === false).length;
		return { all, inProgress, completed };
	}, [enrolledSections]);

	const filteredSections = useMemo(
		() => getFilteredSections(),
		[getFilteredSections],
	);

	const handleEnrollByCode = useCallback(async () => {
		if (!enrollmentCode.trim()) {
			alert("참가 코드를 입력하세요.");
			return;
		}
		const code = extractEnrollmentCode(enrollmentCode);
		if (!code) {
			alert("유효한 참가 코드나 링크를 입력하세요.");
			return;
		}
		try {
			setEnrollLoading(true);
			const resp = await APIService.enrollByCode(code);
			if (resp && resp.success) {
				alert(`${resp.courseTitle} 수강 신청이 완료되었습니다!`);
				setEnrollmentCode("");
				const refreshed = await APIService.getUserEnrolledSections();
				setEnrolledSections(refreshed.data || refreshed);
			} else {
				alert(resp?.message || "수강 신청에 실패했습니다.");
			}
		} catch (e: unknown) {
			alert(e instanceof Error ? e.message : "수강 신청 중 오류가 발생했습니다.");
		} finally {
			setEnrollLoading(false);
		}
	}, [enrollmentCode]);

	return {
		userName,
		loading,
		error,
		activeTab,
		setActiveTab,
		searchTerm,
		setSearchTerm,
		sortBy,
		setSortBy,
		enrollmentCode,
		setEnrollmentCode,
		enrollLoading,
		showEnrollModal,
		setShowEnrollModal,
		stats,
		filteredSections,
		handleStatusUpdate,
		handleEnrollByCode,
	};
}

export type ClassPageHookReturn = ReturnType<typeof useClassPage>;
