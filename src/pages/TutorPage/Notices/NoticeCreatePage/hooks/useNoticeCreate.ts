import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { NoticeFormData, SectionInfo } from "../types";

export function useNoticeCreate() {
	const { sectionId } = useParams<{ sectionId?: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [formData, setFormData] = useState<NoticeFormData>({
		title: "",
		content: "",
		sectionId: sectionId || "",
	});
	const [mounted, setMounted] = useState(false);

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

	useEffect(() => {
		fetchSectionInfo();
		if (sectionId) {
			setFormData((prev) => ({ ...prev, sectionId }));
		}
		setMounted(true);
	}, [sectionId, fetchSectionInfo]);

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
				setLoading(true);
				await APIService.createNotice(formData);
				alert("공지사항이 생성되었습니다.");
				if (sectionId) {
					navigate(`/tutor/notices/section/${sectionId}`);
				} else {
					navigate("/tutor/notices");
				}
			} catch (error) {
				console.error("공지사항 생성 실패:", error);
				alert("공지사항 생성에 실패했습니다.");
			} finally {
				setLoading(false);
			}
		},
		[formData, sectionId, navigate],
	);

	const handleBack = useCallback(() => {
		if (sectionId) {
			navigate(`/tutor/notices/section/${sectionId}`);
		} else {
			navigate("/tutor/notices");
		}
	}, [sectionId, navigate]);

	return {
		loading,
		currentSection,
		formData,
		setFormData,
		mounted,
		handleSubmit,
		handleBack,
	};
}
