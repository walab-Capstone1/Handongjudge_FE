import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { SectionInfo, EditFormData } from "../types";

const initialFormData: EditFormData = {
	title: "",
	content: "",
	isPublic: true,
};

export function useQuestionEditPage() {
	const { sectionId, questionId } = useParams<{
		sectionId: string;
		questionId: string;
	}>();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
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

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
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
		},
		[questionId, sectionId, formData, navigate],
	);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	return {
		sectionId,
		questionId,
		navigate,
		loading,
		submitting,
		isSidebarCollapsed,
		sectionInfo,
		formData,
		setFormData,
		handleSubmit,
		handleToggleSidebar,
	};
}

export type QuestionEditPageHookReturn = ReturnType<typeof useQuestionEditPage>;
