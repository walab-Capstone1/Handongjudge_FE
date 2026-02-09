import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { NoticeFormData, SectionInfo } from "../types";

export function useNoticeEdit() {
	const { noticeId, sectionId } = useParams<{
		noticeId: string;
		sectionId?: string;
	}>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [formData, setFormData] = useState<NoticeFormData>({
		title: "",
		content: "",
		sectionId: sectionId || "",
	});
	const [editorReady, setEditorReady] = useState(false);

	const handleBack = useCallback(() => {
		if (sectionId) {
			navigate(`/tutor/notices/section/${sectionId}`);
		} else {
			navigate("/tutor/notices");
		}
	}, [sectionId, navigate]);

	const fetchSectionInfo = useCallback(async () => {
		if (!sectionId) return;
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			const currentSectionData = sectionsData.find(
				(section: { sectionId: number }) =>
					section.sectionId === Number.parseInt(sectionId, 10),
			);
			setCurrentSection(currentSectionData ?? null);
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	}, [sectionId]);

	const fetchNoticeData = useCallback(async () => {
		if (!noticeId) return;
		try {
			setLoading(true);
			const response = sectionId
				? await APIService.getSectionNotices(sectionId)
				: await APIService.getInstructorNotices();
			const noticesData = response?.data || response || [];
			const notice = noticesData.find(
				(n: { id: number }) => n.id === Number.parseInt(noticeId, 10),
			);
			if (notice) {
				setFormData({
					title: notice.title || "",
					content: notice.content || "",
					sectionId: notice.sectionId || sectionId || "",
				});
			} else {
				alert("공지사항을 찾을 수 없습니다.");
				handleBack();
			}
		} catch (error) {
			console.error("공지사항 조회 실패:", error);
			alert("공지사항을 불러오는데 실패했습니다.");
			handleBack();
		} finally {
			setLoading(false);
		}
	}, [noticeId, sectionId, handleBack]);

	useEffect(() => {
		fetchNoticeData();
		fetchSectionInfo();
	}, [fetchNoticeData, fetchSectionInfo]);

	useEffect(() => {
		if (formData.content !== undefined && !loading && !editorReady) {
			const timer = setTimeout(() => setEditorReady(true), 300);
			return () => clearTimeout(timer);
		}
	}, [formData.content, loading, editorReady]);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!formData.title.trim()) {
				alert("제목을 입력해주세요");
				return;
			}
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = formData.content;
			const textContent = tempDiv.textContent || tempDiv.innerText || "";
			if (!textContent.trim()) {
				alert("내용을 입력해주세요");
				return;
			}
			if (!formData.sectionId) {
				alert("수업 정보가 없습니다.");
				return;
			}
			try {
				setSaving(true);
				await APIService.updateNotice(noticeId!, formData);
				alert("공지사항이 수정되었습니다.");
				if (sectionId) {
					navigate(`/tutor/notices/section/${sectionId}`);
				} else {
					navigate("/tutor/notices");
				}
			} catch (error) {
				console.error("공지사항 수정 실패:", error);
				alert("공지사항 수정에 실패했습니다.");
			} finally {
				setSaving(false);
			}
		},
		[formData, noticeId, sectionId, navigate],
	);

	return {
		loading,
		saving,
		currentSection,
		formData,
		setFormData,
		editorReady,
		handleSubmit,
		handleBack,
	};
}
