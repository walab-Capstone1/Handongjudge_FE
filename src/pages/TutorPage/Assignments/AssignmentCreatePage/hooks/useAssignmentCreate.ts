import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type { AssignmentFormData, SectionInfo } from "../types";

export function useAssignmentCreate() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [formData, setFormData] = useState<AssignmentFormData>({
		title: "",
		description: "",
		assignmentNumber: "",
		startDate: "",
		endDate: "",
	});

	const fetchSectionInfo = useCallback(async () => {
		if (!sectionId) return;
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			const currentSectionData = (sectionsData as SectionInfo[]).find(
				(section) => section.sectionId === Number.parseInt(sectionId, 10),
			);
			setCurrentSection(currentSectionData ?? null);
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	}, [sectionId]);

	useEffect(() => {
		if (sectionId) fetchSectionInfo();
	}, [sectionId, fetchSectionInfo]);

	const handleInputChange = useCallback(
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) => {
			const { name, value } = e.target;
			setFormData((prev) => ({ ...prev, [name]: value }));
		},
		[],
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!formData.title.trim()) {
				alert("과제명을 입력해주세요.");
				return;
			}
			if (!sectionId) {
				alert("수업 정보가 없습니다.");
				return;
			}
			try {
				setLoading(true);
				const assignmentData: Record<string, string> = {
					title: formData.title.trim(),
					description: formData.description.trim(),
					assignmentNumber: formData.assignmentNumber.trim(),
				};
				if (formData.startDate) {
					assignmentData.startDate = new Date(formData.startDate).toISOString();
				}
				if (formData.endDate) {
					assignmentData.endDate = new Date(formData.endDate).toISOString();
				}
				await APIService.createAssignment(
					Number.parseInt(sectionId, 10),
					assignmentData,
				);
				alert("과제가 생성되었습니다.");
				navigate(`/tutor/assignments/section/${sectionId}`);
			} catch (error) {
				console.error("과제 생성 실패:", error);
				alert("과제 생성에 실패했습니다.");
			} finally {
				setLoading(false);
			}
		},
		[formData, sectionId, navigate],
	);

	const handleBack = useCallback(() => {
		if (sectionId) {
			navigate(`/tutor/assignments/section/${sectionId}`);
		} else {
			navigate("/tutor/assignments");
		}
	}, [sectionId, navigate]);

	return {
		loading,
		currentSection,
		formData,
		setFormData,
		handleInputChange,
		handleSubmit,
		handleBack,
	};
}
