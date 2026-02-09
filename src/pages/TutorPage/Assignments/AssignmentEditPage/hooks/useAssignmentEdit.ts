import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type {
	AssignmentFormData,
	AssignmentDetail,
	SectionInfo,
} from "../types";

function toDatetimeLocal(isoOrDate: string | undefined): string {
	if (!isoOrDate) return "";
	const d = new Date(isoOrDate);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 16);
}

export function useAssignmentEdit() {
	const { sectionId, assignmentId } = useParams<{
		sectionId: string;
		assignmentId: string;
	}>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
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
				(s) => s.sectionId === Number.parseInt(sectionId, 10),
			);
			setCurrentSection(currentSectionData ?? null);
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	}, [sectionId]);

	const fetchAssignment = useCallback(async () => {
		if (!sectionId || !assignmentId) return;
		try {
			setLoading(true);
			const data = await APIService.getAssignmentInfoBySection(
				Number.parseInt(sectionId, 10),
				Number.parseInt(assignmentId, 10),
			);
			const assignment: AssignmentDetail = data?.data ?? data;
			const endDate = assignment.endDate ?? assignment.deadline ?? "";
			setFormData({
				title: assignment.title ?? "",
				description: assignment.description ?? "",
				assignmentNumber: assignment.assignmentNumber ?? "",
				startDate: toDatetimeLocal(assignment.startDate),
				endDate: toDatetimeLocal(endDate),
			});
		} catch (error) {
			console.error("과제 조회 실패:", error);
			alert("과제 정보를 불러오는데 실패했습니다.");
			if (sectionId) navigate(`/tutor/assignments/section/${sectionId}`);
			else navigate("/tutor/assignments");
		} finally {
			setLoading(false);
		}
	}, [sectionId, assignmentId, navigate]);

	useEffect(() => {
		if (sectionId && assignmentId) {
			fetchSectionInfo();
			fetchAssignment();
		}
	}, [sectionId, assignmentId, fetchSectionInfo, fetchAssignment]);

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
			if (!sectionId || !assignmentId) {
				alert("수업 또는 과제 정보가 없습니다.");
				return;
			}
			try {
				setSubmitting(true);
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
				await APIService.updateAssignment(
					Number.parseInt(sectionId, 10),
					Number.parseInt(assignmentId, 10),
					assignmentData,
				);
				alert("과제가 수정되었습니다.");
				navigate(`/tutor/assignments/section/${sectionId}`);
			} catch (error) {
				console.error("과제 수정 실패:", error);
				alert("과제 수정에 실패했습니다.");
			} finally {
				setSubmitting(false);
			}
		},
		[formData, sectionId, assignmentId, navigate],
	);

	const handleBack = useCallback(() => {
		if (sectionId) navigate(`/tutor/assignments/section/${sectionId}`);
		else navigate("/tutor/assignments");
	}, [sectionId, navigate]);

	return {
		loading,
		submitting,
		currentSection,
		formData,
		handleInputChange,
		handleSubmit,
		handleBack,
	};
}
