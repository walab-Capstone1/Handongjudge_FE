import { useState, useEffect, useCallback, useMemo } from "react";
import APIService from "../../../../services/APIService";
import type { Submission, ResultFilter } from "../types";

export function useSuperAdminSubmissionManagement() {
	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [resultFilter, setResultFilter] = useState<ResultFilter>("ALL");

	const fetchSubmissions = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSubmissionsForSuperAdmin();
			setSubmissions(response?.data?.content || response || []);
		} catch (error) {
			console.error("제출 내역 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSubmissions();
	}, [fetchSubmissions]);

	const getResultColor = useCallback((result: string): string => {
		const colors: Record<string, string> = {
			ACCEPTED: "#10b981",
			WRONG_ANSWER: "#ef4444",
			RUNTIME_ERROR: "#f59e0b",
			TIME_LIMIT: "#8b5cf6",
			COMPILE_ERROR: "#6b7280",
		};
		return colors[result] || "#6b7280";
	}, []);

	const filteredSubmissions = useMemo(
		() =>
			submissions.filter(
				(s) => resultFilter === "ALL" || s.result === resultFilter,
			),
		[submissions, resultFilter],
	);

	return {
		loading,
		resultFilter,
		setResultFilter,
		filteredSubmissions,
		getResultColor,
	};
}

export type SuperAdminSubmissionManagementHookReturn = ReturnType<
	typeof useSuperAdminSubmissionManagement
>;
