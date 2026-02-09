import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../../hooks/useAuth";
import type { Settings } from "../types";

export function useSettingsPage() {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [settings, setSettings] = useState<Settings>({
		profile: {
			name: user?.name || "",
			email: user?.email || "",
		},
		notifications: {
			emailNotifications: true,
			assignmentReminders: true,
			submissionAlerts: true,
		},
		preferences: {
			theme: "light",
			language: "ko",
		},
	});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		// TODO: 백엔드에서 설정 불러오기
	}, []);

	const handleSave = useCallback(async () => {
		try {
			setIsSaving(true);
			// TODO: 백엔드 API 연동
			alert("설정이 저장되었습니다.");
		} catch (error) {
			console.error("설정 저장 실패:", error);
			alert("설정 저장에 실패했습니다.");
		} finally {
			setIsSaving(false);
		}
	}, []);

	const handleChange = useCallback(
		<K extends keyof Settings>(
			section: K,
			key: keyof Settings[K],
			value: Settings[K][keyof Settings[K]],
		) => {
			setSettings((prev) => ({
				...prev,
				[section]: {
					...prev[section],
					[key]: value,
				},
			}));
		},
		[],
	);

	return { loading, settings, isSaving, handleSave, handleChange };
}
