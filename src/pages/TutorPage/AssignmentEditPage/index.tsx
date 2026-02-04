import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "./styles";
import type {
	AssignmentFormData,
	AssignmentDetail,
	SectionInfo,
} from "./types";

function toDatetimeLocal(isoOrDate: string | undefined): string {
	if (!isoOrDate) return "";
	const d = new Date(isoOrDate);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 16);
}

const AssignmentEditPage: React.FC = () => {
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

	useEffect(() => {
		if (sectionId && assignmentId) {
			fetchSectionInfo();
			fetchAssignment();
		}
	}, [sectionId, assignmentId]);

	const fetchSectionInfo = async () => {
		if (!sectionId) return;
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			const currentSectionData = sectionsData.find(
				(section: SectionInfo) =>
					section.sectionId === Number.parseInt(sectionId),
			);
			setCurrentSection(currentSectionData || null);
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	};

	const fetchAssignment = async () => {
		if (!sectionId || !assignmentId) return;
		try {
			setLoading(true);
			const data = await APIService.getAssignmentInfoBySection(
				Number.parseInt(sectionId),
				Number.parseInt(assignmentId),
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
			if (sectionId) {
				navigate(`/tutor/assignments/section/${sectionId}`);
			} else {
				navigate("/tutor/assignments");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
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
				Number.parseInt(sectionId),
				Number.parseInt(assignmentId),
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
	};

	const handleBack = () => {
		if (sectionId) {
			navigate(`/tutor/assignments/section/${sectionId}`);
		} else {
			navigate("/tutor/assignments");
		}
	};

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<LoadingSpinner message="과제 정보를 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Page>
				<S.Header>
					<S.BackButton type="button" onClick={handleBack}>
						← 뒤로가기
					</S.BackButton>
					<S.HeaderContent>
						<h1>과제 수정</h1>
						{currentSection && (
							<S.SectionInfo>
								{currentSection.courseTitle} - {currentSection.sectionNumber}
								분반
							</S.SectionInfo>
						)}
					</S.HeaderContent>
				</S.Header>

				<S.Body>
					<S.Form onSubmit={handleSubmit}>
						<S.FormRow>
							<S.FormGroup>
								<S.Label htmlFor="title">
									과제명 <span className="required">*</span>
								</S.Label>
								<S.Input
									type="text"
									id="title"
									name="title"
									placeholder="과제명을 입력하세요"
									value={formData.title}
									onChange={handleInputChange}
									required
								/>
							</S.FormGroup>
							<S.FormGroup>
								<S.Label htmlFor="assignmentNumber">과제 번호</S.Label>
								<S.Input
									type="text"
									id="assignmentNumber"
									name="assignmentNumber"
									placeholder="예: HW1, Assignment1"
									value={formData.assignmentNumber}
									onChange={handleInputChange}
								/>
							</S.FormGroup>
						</S.FormRow>

						<S.FormGroup>
							<S.Label htmlFor="description">과제 설명</S.Label>
							<S.Textarea
								id="description"
								name="description"
								placeholder="과제에 대한 상세 설명을 입력하세요"
								rows={4}
								value={formData.description}
								onChange={handleInputChange}
							/>
						</S.FormGroup>

						<S.FormRow>
							<S.FormGroup>
								<S.Label htmlFor="startDate">시작일</S.Label>
								<S.Input
									type="datetime-local"
									id="startDate"
									name="startDate"
									value={formData.startDate}
									onChange={handleInputChange}
								/>
							</S.FormGroup>
							<S.FormGroup>
								<S.Label htmlFor="endDate">마감일</S.Label>
								<S.Input
									type="datetime-local"
									id="endDate"
									name="endDate"
									value={formData.endDate}
									onChange={handleInputChange}
								/>
							</S.FormGroup>
						</S.FormRow>

						<S.FormActions>
							<S.CancelButton type="button" onClick={handleBack}>
								취소
							</S.CancelButton>
							<S.SubmitButton type="submit" disabled={submitting}>
								{submitting ? "수정 중..." : "수정 완료"}
							</S.SubmitButton>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default AssignmentEditPage;
