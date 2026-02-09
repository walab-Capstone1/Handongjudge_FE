import { useState, useEffect, useCallback } from "react";
import APIService from "../../../../services/APIService";
import type { Course } from "../types";

export function useSuperAdminCourseManagement() {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchCourses = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllCourses();
			setCourses(response?.data || response || []);
		} catch (error) {
			console.error("강좌 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCourses();
	}, [fetchCourses]);

	return { courses, loading };
}

export type SuperAdminCourseManagementHookReturn = ReturnType<
	typeof useSuperAdminCourseManagement
>;
