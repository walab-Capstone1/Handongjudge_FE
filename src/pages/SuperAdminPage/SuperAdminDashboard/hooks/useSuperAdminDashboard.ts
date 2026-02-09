import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import APIService from "../../../../services/APIService";
import type { AdminStats } from "../types";

export function useSuperAdminDashboard() {
	const navigate = useNavigate();
	const [stats, setStats] = useState<AdminStats>({
		totalUsers: 0,
		totalSections: 0,
		totalAssignments: 0,
		totalProblems: 0,
		totalSystemNotices: 0,
		totalSystemGuides: 0,
	});
	const [loading, setLoading] = useState(true);

	const fetchStats = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getSuperAdminStats();
			const statsData = response?.data?.data || response?.data || response;
			if (statsData) {
				setStats({
					totalUsers: statsData.totalUsers || 0,
					totalSections: statsData.totalSections || 0,
					totalAssignments: statsData.totalAssignments || 0,
					totalProblems: statsData.totalProblems || 0,
					totalSystemNotices: statsData.totalSystemNotices || 0,
					totalSystemGuides: statsData.totalSystemGuides || 0,
				});
			}
		} catch (error) {
			console.error("통계 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return { navigate, stats, loading };
}

export type SuperAdminDashboardHookReturn = ReturnType<
	typeof useSuperAdminDashboard
>;
