import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import APIService from "../../services/APIService";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../recoil/atoms";
import * as S from "./styles";
import type { SectionInfo, EditFormData } from "./types";

const initialFormData: EditFormData = {
	title: "",
	content: "",
	isPublic: true,
};

const QuestionEditPage: React.FC = () => {
	const { sectionId, questionId } = useParams<{
		sectionId: string;
		questionId: string;
	}>();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [formData, setFormData] = useState<EditFormData>(initialFormData);

	const fetchQuestionData = useCallback(async () => {
		if (!sectionId || !questionId) return;
		try {
			setLoading(true);

			const sectionData = await APIService.getSectionInfo(sectionId);
			const s = sectionData?.data ?? sectionData;
			setSectionInfo(s);

			const data = await APIService.getQuestionDetail(questionId);
			const question = data?.data ?? data;

			if (!question?.isAuthor) {
				alert("수정 권한이 없습니다");
				navigate(`/sections/${sectionId}/community/${questionId}`);
				return;
			}

			setFormData({
				title: question.title ?? "",
				content: question.content ?? "",
				isPublic: question.isPublic !== false,
			});
		} catch (err) {
			console.error("Error fetching question:", err);
			alert("질문을 불러오는 중 오류가 발생했습니다");
			navigate(`/sections/${sectionId}/community/${questionId}`);
		} finally {
			setLoading(false);
		}
	}, [sectionId, questionId, navigate]);

	useEffect(() => {
		fetchQuestionData();
	}, [fetchQuestionData]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!questionId || !sectionId) return;

		if (!formData.title.trim()) {
			alert("제목을 입력해주세요");
			return;
		}

		if (!formData.content.trim()) {
			alert("내용을 입력해주세요");
			return;
		}

		try {
			setSubmitting(true);

			await APIService.request(`/community/questions/${questionId}`, {
				method: "PUT",
				body: JSON.stringify({
					title: formData.title,
					content: formData.content,
					isPublic: formData.isPublic,
				}),
			});

			alert("질문이 수정되었습니다!");
			navigate(`/sections/${sectionId}/community/${questionId}`);
		} catch (err) {
			console.error("Error updating question:", err);
			alert("질문 수정 중 오류가 발생했습니다");
		} finally {
			setSubmitting(false);
		}
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	const courseNameDisplay = sectionInfo
		? sectionInfo.sectionNumber
			? `[${sectionInfo.courseTitle ?? ""}] ${sectionInfo.sectionNumber}분반`
			: (sectionInfo.courseTitle ?? "질문 수정")
		: "로딩 중...";

	if (loading) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu="커뮤니티"
					isCollapsed={isSidebarCollapsed}
					onMenuClick={() => {}}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<CourseHeader
						courseName={courseNameDisplay}
						onToggleSidebar={handleToggleSidebar}
						isSidebarCollapsed={isSidebarCollapsed}
					/>
					<S.Body>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.Body>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu="커뮤니티"
				isCollapsed={isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={sectionInfo?.courseTitle ?? "질문 수정"}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>
				<S.Body>
					<S.PageHeader>
						<h1>질문 수정</h1>
						<p>질문 내용을 수정해주세요</p>
					</S.PageHeader>

					<S.Form onSubmit={handleSubmit}>
						<S.FormGroup>
							<S.FormLabel>
								제목 <S.Required>*</S.Required>
							</S.FormLabel>
							<S.FormInput
								type="text"
								placeholder="질문 제목을 입력하세요"
								value={formData.title}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								maxLength={200}
								aria-label="질문 제목"
							/>
							<S.CharCount>{formData.title.length}/200</S.CharCount>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel>
								내용 <S.Required>*</S.Required>
							</S.FormLabel>
							<S.FormTextarea
								placeholder="질문 내용을 자세히 작성해주세요"
								value={formData.content}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										content: e.target.value,
									}))
								}
								rows={15}
								aria-label="질문 내용"
							/>
						</S.FormGroup>

						<S.FormOptions>
							<S.OptionGroup>
								<S.OptionLabel>
									<input
										type="checkbox"
										checked={!formData.isPublic}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												isPublic: !e.target.checked,
											}))
										}
										aria-label="비공개 질문"
									/>
									<span>비공개 질문 (교수만 볼 수 있음)</span>
								</S.OptionLabel>
								<S.OptionDescription>
									비공개로 설정하면 교수님만 질문을 볼 수 있습니다
								</S.OptionDescription>
							</S.OptionGroup>
						</S.FormOptions>

						<S.FormActions>
							<S.BtnCancel
								type="button"
								onClick={() =>
									navigate(`/sections/${sectionId}/community/${questionId}`)
								}
							>
								취소
							</S.BtnCancel>
							<S.BtnSubmit type="submit" disabled={submitting}>
								{submitting ? "수정 중..." : "수정 완료"}
							</S.BtnSubmit>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Content>
		</S.Container>
	);
};

export default QuestionEditPage;
