import { useState, useEffect, useCallback } from "react";
import APIService from "../../../../services/APIService";
import type { SystemNotice, CreateSystemNoticeData } from "../types";

export function useSystemNoticeManagement() {
	const [notices, setNotices] = useState<SystemNotice[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState<CreateSystemNoticeData>({
		title: "",
		content: "",
		isActive: true,
	});

	const fetchNotices = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSystemNotices();
			setNotices(response?.data || response || []);
		} catch (error) {
			console.error("시스템 공지 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNotices();
	}, [fetchNotices]);

	const handleCreate = useCallback(async () => {
		if (!formData.title.trim()) {
			alert("제목을 입력하세요.");
			return;
		}
		try {
			await APIService.createSystemNotice(formData);
			alert("시스템 공지가 생성되었습니다.");
			setShowModal(false);
			setFormData({ title: "", content: "", isActive: true });
			fetchNotices();
		} catch (error) {
			console.error("시스템 공지 생성 실패:", error);
			alert("생성에 실패했습니다.");
		}
	}, [formData, fetchNotices]);

	const handleDelete = useCallback(
		async (noticeId: number) => {
			if (!window.confirm("정말로 삭제하시겠습니까?")) return;
			try {
				await APIService.deleteSystemNotice(noticeId);
				alert("삭제되었습니다.");
				fetchNotices();
			} catch (error) {
				console.error("삭제 실패:", error);
				alert("삭제에 실패했습니다.");
			}
		},
		[fetchNotices],
	);

	const toggleActive = useCallback(
		async (noticeId: number, currentStatus: boolean) => {
			try {
				await APIService.updateSystemNotice(noticeId, {
					isActive: !currentStatus,
				});
				fetchNotices();
			} catch (error) {
				console.error("상태 변경 실패:", error);
			}
		},
		[fetchNotices],
	);

	return {
		notices,
		loading,
		showModal,
		setShowModal,
		formData,
		setFormData,
		handleCreate,
		handleDelete,
		toggleActive,
	};
}

export type SystemNoticeManagementHookReturn = ReturnType<
	typeof useSystemNoticeManagement
>;
