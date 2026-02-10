import { useState, useEffect, useCallback, useMemo } from "react";
import APIService from "../../../../services/APIService";
import type { Problem } from "../types";

export function useSuperAdminProblemManagement() {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	const fetchProblems = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllProblems();
			setProblems(response?.data || response || []);
		} catch (error) {
			console.error("문제 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProblems();
	}, [fetchProblems]);

	const filteredProblems = useMemo(
		() =>
			problems.filter(
				(p) =>
					p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.id.toString().includes(searchTerm),
			),
		[problems, searchTerm],
	);

	return { loading, searchTerm, setSearchTerm, filteredProblems };
}

export type SuperAdminProblemManagementHookReturn = ReturnType<
	typeof useSuperAdminProblemManagement
>;
