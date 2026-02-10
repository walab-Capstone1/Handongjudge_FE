import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { Notice, Section } from "../types";
import { getUniqueSections } from "../utils/sectionUtils";

export function useNoticeManagement() {
	const { sectionId } = useParams<{ sectionId?: string }>();
	const navigate = useNavigate();

	const [notices, setNotices] = useState<Notice[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [currentSection, setCurrentSection] = useState<Section | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSection, setFilterSection] = useState("ALL");
	const [openMoreMenu, setOpenMoreMenu] = useState<string | number | null>(
		null,
	);

	const fetchNotices = useCallback(async () => {
		try {
			setLoading(true);
			let response;
			if (sectionId) {
				response = await APIService.getSectionNotices(sectionId);
			} else {
				response = await APIService.getInstructorNotices();
			}
			const noticesData = response?.data || response || [];
			setNotices(noticesData);
		} catch (error) {
			console.error("공지사항 조회 실패:", error);
			setNotices([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	const fetchSections = useCallback(async () => {
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			setSections(sectionsData);
			if (sectionId) {
				const currentSectionData = sectionsData.find(
					(section: Section) =>
						section.sectionId === Number.parseInt(sectionId, 10),
				);
				setCurrentSection(currentSectionData || null);
			}
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
			setSections([]);
		}
	}, [sectionId]);

	useEffect(() => {
		fetchNotices();
		fetchSections();
	}, [fetchNotices, fetchSections]);

	const handleCreateNotice = useCallback(() => {
		if (sectionId) {
			navigate(`/tutor/notices/section/${sectionId}/create`);
		} else {
			navigate("/tutor/notices/create");
		}
	}, [sectionId, navigate]);

	const handleEditNotice = useCallback(
		(notice: Notice) => {
			const noticeSectionId = sectionId || notice.sectionId;
			if (noticeSectionId) {
				navigate(`/tutor/notices/section/${noticeSectionId}/${notice.id}/edit`);
			} else {
				navigate(`/tutor/notices/${notice.id}/edit`);
			}
		},
		[sectionId, navigate],
	);

	const handleDeleteNotice = useCallback(
		async (noticeId: string | number) => {
			if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) return;
			try {
				await APIService.deleteNotice(noticeId);
				await fetchNotices();
				alert("공지사항이 삭제되었습니다.");
			} catch (error) {
				console.error("공지사항 삭제 실패:", error);
				alert("공지사항 삭제에 실패했습니다.");
			}
		},
		[fetchNotices],
	);

	const handleToggleActive = useCallback(
		async (noticeId: string | number, currentActive: boolean) => {
			try {
				await APIService.toggleNoticeActive(noticeId, !currentActive);
				await fetchNotices();
			} catch (error) {
				console.error("공지사항 활성화 상태 변경 실패:", error);
				alert("공지사항 활성화 상태 변경에 실패했습니다.");
			}
		},
		[fetchNotices],
	);

	const handleCopyEnrollmentLink = useCallback(() => {
		if (currentSection?.enrollmentCode) {
			const enrollmentLink = `${window.location.origin}/enroll/${currentSection.enrollmentCode}`;
			navigator.clipboard
				.writeText(enrollmentLink)
				.then(() => alert("수업 참가 링크가 복사되었습니다!"))
				.catch((err) => {
					console.error("복사 실패:", err);
					alert("링크 복사에 실패했습니다.");
				});
		}
	}, [currentSection?.enrollmentCode]);

	const filteredNotices = notices.filter((notice) => {
		const matchesSearch =
			notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
			notice.sectionName.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesSection =
			filterSection === "ALL" || notice.sectionId.toString() === filterSection;
		return matchesSearch && matchesSection;
	});

	const uniqueSections = getUniqueSections(notices);

	return {
		sectionId,
		notices,
		sections,
		currentSection,
		loading,
		searchTerm,
		setSearchTerm,
		filterSection,
		setFilterSection,
		openMoreMenu,
		setOpenMoreMenu,
		filteredNotices,
		uniqueSections,
		handleCreateNotice,
		handleEditNotice,
		handleDeleteNotice,
		handleToggleActive,
		handleCopyEnrollmentLink,
	};
}
