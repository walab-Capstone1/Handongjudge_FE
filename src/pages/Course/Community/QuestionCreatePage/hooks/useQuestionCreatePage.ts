import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { SectionInfo, Assignment, QuestionFormData } from "../types";

const initialFormData: QuestionFormData = {
	title: "",
	content: "",
	isAnonymous: false,
	anonymousUseNickname: true,
	isPublic: true,
	assignmentId: "",
	problemId: "",
};

export function useQuestionCreatePage() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [loading, setLoading] = useState(false);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [assignmentsWithProblems, setAssignmentsWithProblems] = useState<
		Assignment[]
	>([]);
	const [formData, setFormData] = useState<QuestionFormData>(initialFormData);

	const fetchInitialData = useCallback(async () => {
		if (!sectionId) return;
		try {
			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(sectionData?.data ?? sectionData);

			const assignmentsData =
				await APIService.getAssignmentsBySection(sectionId);
			const list = Array.isArray(assignmentsData)
				? assignmentsData
				: (assignmentsData?.data ?? assignmentsData ?? []);

			const withProblems = await Promise.all(
				list.map(async (assignment: Assignment) => {
					try {
						const problemsData = await APIService.getAssignmentProblems(
							sectionId,
							assignment.id,
						);
						const problems =
							problemsData?.problems ??
							problemsData?.data ??
							(Array.isArray(problemsData) ? problemsData : []);
						return { ...assignment, problems };
					} catch (err) {
						console.error(`과제 ${assignment.id}의 문제 조회 실패:`, err);
						return { ...assignment, problems: [] };
					}
				}),
			);
			setAssignmentsWithProblems(withProblems);
		} catch (err) {
			console.error("Error fetching initial data:", err);
		}
	}, [sectionId]);

	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	const getSelectValue = useCallback((): string => {
		if (formData.assignmentId && formData.problemId) {
			return `assignment-${formData.assignmentId}-problem-${formData.problemId}`;
		}
		if (formData.assignmentId) {
			return `assignment-${formData.assignmentId}`;
		}
		return "";
	}, [formData.assignmentId, formData.problemId]);

	const handleSelectChange = useCallback((value: string) => {
		if (!value) {
			setFormData((prev) => ({
				...prev,
				assignmentId: "",
				problemId: "",
			}));
			return;
		}
		if (value.startsWith("assignment-") && value.includes("-problem-")) {
			const parts = value.split("-problem-");
			const assignmentId = parts[0].replace("assignment-", "");
			const problemId = parts[1] ?? "";
			setFormData((prev) => ({
				...prev,
				assignmentId,
				problemId,
			}));
		} else if (value.startsWith("assignment-")) {
			const assignmentId = value.replace("assignment-", "");
			setFormData((prev) => ({
				...prev,
				assignmentId,
				problemId: "",
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				assignmentId: "",
				problemId: "",
			}));
		}
	}, []);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!sectionId) return;
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
			try {
				setLoading(true);
				const requestData: Record<string, unknown> = {
					sectionId: Number.parseInt(sectionId, 10),
					title: formData.title,
					content: formData.content,
					isAnonymous: formData.isAnonymous,
					isPublic: formData.isPublic,
				};
				if (formData.isAnonymous) {
					requestData.anonymousUseNickname = formData.anonymousUseNickname;
				}
				if (formData.assignmentId) {
					requestData.assignmentId = Number.parseInt(formData.assignmentId, 10);
				}
				if (formData.problemId) {
					requestData.problemId = Number.parseInt(formData.problemId, 10);
				}
				const data = await APIService.request("/community/questions", {
					method: "POST",
					body: JSON.stringify(requestData),
				});
				const questionId = data?.data?.id ?? data?.id;
				if (questionId != null) {
					alert("질문이 작성되었습니다!");
					navigate(`/sections/${sectionId}/community/${questionId}`);
				} else {
					throw new Error("질문 작성 실패");
				}
			} catch (err) {
				console.error("Error creating question:", err);
				alert("질문 작성 중 오류가 발생했습니다");
			} finally {
				setLoading(false);
			}
		},
		[sectionId, formData, navigate],
	);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	return {
		sectionId,
		navigate,
		loading,
		isSidebarCollapsed,
		sectionInfo,
		assignmentsWithProblems,
		formData,
		setFormData,
		getSelectValue,
		handleSelectChange,
		handleSubmit,
		handleToggleSidebar,
	};
}

export type QuestionCreatePageHookReturn = ReturnType<
	typeof useQuestionCreatePage
>;
