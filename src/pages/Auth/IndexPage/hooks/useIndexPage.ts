import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import APIService from "../../../../services/APIService";
import type { SystemNotice, SystemGuide, TabType } from "../types";

export function useIndexPage() {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuth();
	const [activeTab, setActiveTab] = useState<TabType>("lectures");
	const [systemNotices, setSystemNotices] = useState<SystemNotice[]>([]);
	const [systemGuides, setSystemGuides] = useState<SystemGuide[]>([]);
	const [loading, setLoading] = useState(true);

	const userName = user?.name || user?.username || user?.email || "";
	const isSuperAdmin = user?.role === "SUPER_ADMIN";

	const fetchSystemData = useCallback(async () => {
		try {
			setLoading(true);
			const [noticesResponse, guidesResponse] = await Promise.all([
				APIService.getActiveSystemNotices().catch(() => []),
				APIService.getActiveSystemGuides().catch(() => []),
			]);

			setSystemNotices(
				Array.isArray(noticesResponse) ? noticesResponse.slice(0, 5) : [],
			);
			setSystemGuides(
				Array.isArray(guidesResponse) ? guidesResponse.slice(0, 5) : [],
			);
		} catch (error) {
			console.error("시스템 데이터 조회 실패:", error);
			setSystemNotices([]);
			setSystemGuides([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSystemData();
	}, [fetchSystemData]);

	const handleGoToClassroom = useCallback(() => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/courses" } });
			return;
		}
		navigate("/courses");
	}, [isAuthenticated, navigate]);

	const handleLecturesClick = useCallback(() => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/courses" } });
			return;
		}
		navigate("/courses");
	}, [isAuthenticated, navigate]);

	const handleManagementClick = useCallback(() => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/tutor" } });
			return;
		}
		navigate("/tutor");
	}, [isAuthenticated, navigate]);

	const handleSystemManagementClick = useCallback(() => {
		if (!isAuthenticated) {
			navigate("/login", { state: { redirectTo: "/super-admin" } });
			return;
		}
		if (isSuperAdmin) {
			navigate("/super-admin");
		} else {
			setActiveTab("system");
		}
	}, [isAuthenticated, isSuperAdmin, navigate]);

	return {
		navigate,
		user,
		isAuthenticated,
		activeTab,
		setActiveTab,
		systemNotices,
		systemGuides,
		loading,
		userName,
		isSuperAdmin,
		handleGoToClassroom,
		handleLecturesClick,
		handleManagementClick,
		handleSystemManagementClick,
	};
}

export type IndexPageHookReturn = ReturnType<typeof useIndexPage>;
