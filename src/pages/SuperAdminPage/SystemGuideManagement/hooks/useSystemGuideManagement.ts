import { useState, useEffect, useCallback } from "react";
import APIService from "../../../../services/APIService";
import type { SystemGuide } from "../types";

export function useSystemGuideManagement() {
	const [guides, setGuides] = useState<SystemGuide[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchGuides = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSystemGuides();
			setGuides(response?.data || response || []);
		} catch (error) {
			console.error("시스템 가이드 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchGuides();
	}, [fetchGuides]);

	const handleDelete = useCallback(
		async (guideId: number) => {
			if (!window.confirm("정말로 삭제하시겠습니까?")) return;
			try {
				await APIService.deleteSystemGuide(guideId);
				alert("삭제되었습니다.");
				fetchGuides();
			} catch (error) {
				console.error("삭제 실패:", error);
				alert("삭제에 실패했습니다.");
			}
		},
		[fetchGuides],
	);

	return { guides, loading, handleDelete };
}

export type SystemGuideManagementHookReturn = ReturnType<
	typeof useSystemGuideManagement
>;
