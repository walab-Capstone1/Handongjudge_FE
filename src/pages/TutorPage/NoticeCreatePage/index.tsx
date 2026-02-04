import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import TipTapEditor from "../../../components/TipTapEditor";
import APIService from "../../../services/APIService";
import * as S from "./styles";
import type { NoticeFormData, SectionInfo } from "./types";

const NoticeCreatePage: React.FC = () => {
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

	useEffect(() => {
		fetchSectionInfo();
		if (sectionId) {
			setFormData((prev) => ({ ...prev, sectionId: sectionId }));
		}
		setMounted(true);
	}, [sectionId]);

	const fetchSectionInfo = async () => {
		if (sectionId) {
			try {
				const dashboardResponse = await APIService.getInstructorDashboard();
				const sectionsData = dashboardResponse?.data || [];
				const currentSectionData = sectionsData.find(
					(section: any) => section.sectionId === Number.parseInt(sectionId),
				);
				setCurrentSection(currentSectionData);
			} catch (error) {
				console.error("분반 정보 조회 실패:", error);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
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
	};

	const handleBack = () => {
		if (sectionId) {
			navigate(`/tutor/notices/section/${sectionId}`);
		} else {
			navigate("/tutor/notices");
		}
	};

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Page>
				<S.Header>
					<S.BackButton onClick={handleBack}>← 뒤로가기</S.BackButton>
					<S.HeaderContent>
						<h1>새 공지사항 작성</h1>
						{currentSection && (
							<S.SectionInfo>{currentSection.courseTitle}</S.SectionInfo>
						)}
					</S.HeaderContent>
				</S.Header>

				<S.Body>
					<S.Form onSubmit={handleSubmit}>
						<S.FormGroup>
							<S.Label>
								제목 <span className="required">*</span>
							</S.Label>
							<S.Input
								type="text"
								placeholder="공지사항 제목을 입력하세요"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								maxLength={200}
							/>
							<S.CharCount>{formData.title.length}/200</S.CharCount>
						</S.FormGroup>

						<S.FormGroup>
							<S.Label>
								내용 <span className="required">*</span>
							</S.Label>
							{mounted && (
								<TipTapEditor
									content={formData.content || ""}
									onChange={(html) =>
										setFormData({ ...formData, content: html })
									}
									placeholder="공지사항 내용을 자세히 작성해주세요"
								/>
							)}
						</S.FormGroup>

						<S.FormActions>
							<S.CancelButton type="button" onClick={handleBack}>
								취소
							</S.CancelButton>
							<S.SubmitButton type="submit" disabled={loading}>
								{loading ? "작성 중..." : "작성 완료"}
							</S.SubmitButton>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default NoticeCreatePage;
