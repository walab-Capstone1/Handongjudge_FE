import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import * as S from "./styles";
import type { AssignmentFormData, SectionInfo } from "./types";

const AssignmentCreatePage: React.FC = () => {
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

	useEffect(() => {
		if (sectionId) {
			fetchSectionInfo();
		}
	}, [sectionId]);

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
				Number.parseInt(sectionId),
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
	};

	const handleBack = () => {
		if (sectionId) {
			navigate(`/tutor/assignments/section/${sectionId}`);
		} else {
			navigate("/tutor/assignments");
		}
	};

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Page>
				<S.Header>
					<S.BackButton type="button" onClick={handleBack}>
						← 뒤로가기
					</S.BackButton>
					<S.HeaderContent>
						<h1>새 과제 만들기</h1>
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
							<S.SubmitButton type="submit" disabled={loading}>
								{loading ? "생성 중..." : "과제 생성"}
							</S.SubmitButton>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default AssignmentCreatePage;
