import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import TipTapEditor from "../../../components/TipTapEditor";
import APIService from "../../../services/APIService";
import * as S from "../NoticeCreatePage/styles"; // 동일한 스타일 재사용
import type { NoticeFormData, SectionInfo } from "./types";

const NoticeEditPage: React.FC = () => {
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

	useEffect(() => {
		fetchNoticeData();
		fetchSectionInfo();
	}, [noticeId, sectionId]);

	useEffect(() => {
		if (formData.content !== undefined && !loading && !editorReady) {
			const timer = setTimeout(() => {
				setEditorReady(true);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [formData.content, loading, editorReady]);

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

	const fetchNoticeData = async () => {
		try {
			setLoading(true);
			const response = sectionId
				? await APIService.getSectionNotices(sectionId)
				: await APIService.getInstructorNotices();

			const noticesData = response?.data || response || [];
			const notice = noticesData.find(
				(n: any) => n.id === Number.parseInt(noticeId!),
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
	};

	const handleBack = () => {
		if (sectionId) {
			navigate(`/tutor/notices/section/${sectionId}`);
		} else {
			navigate("/tutor/notices");
		}
	};

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<div style={{ padding: "2rem", textAlign: "center" }}>
					<p>공지사항을 불러오는 중...</p>
				</div>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Page>
				<S.Header>
					<S.BackButton onClick={handleBack}>← 뒤로가기</S.BackButton>
					<S.HeaderContent>
						<h1>공지사항 수정</h1>
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
							{editorReady ? (
								<TipTapEditor
									content={formData.content || ""}
									onChange={(html) =>
										setFormData({ ...formData, content: html })
									}
									placeholder="공지사항 내용을 자세히 작성해주세요"
								/>
							) : (
								<div
									style={{
										minHeight: "200px",
										padding: "1rem",
										border: "1px solid #e5e7eb",
										borderRadius: "8px",
										background: "#f9fafb",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#64748b",
									}}
								>
									로딩 중...
								</div>
							)}
						</S.FormGroup>

						<S.FormActions>
							<S.CancelButton type="button" onClick={handleBack}>
								취소
							</S.CancelButton>
							<S.SubmitButton type="submit" disabled={saving}>
								{saving ? "수정 중..." : "수정 완료"}
							</S.SubmitButton>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Page>
		</TutorLayout>
	);
};

export default NoticeEditPage;
