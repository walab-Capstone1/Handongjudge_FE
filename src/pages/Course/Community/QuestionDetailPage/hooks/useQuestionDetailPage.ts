import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../../../../recoil/atoms";
import APIService from "../../../../../services/APIService";
import type { Question, Comment, SectionInfo } from "../types";

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function useQuestionDetailPage() {
	const { sectionId, questionId } = useParams<{
		sectionId: string;
		questionId: string;
	}>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState<Question | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [commentContent, setCommentContent] = useState("");
	const [commentAnonymous, setCommentAnonymous] = useState(false);
	const [submittingComment, setSubmittingComment] = useState(false);

	const fetchQuestionDetail = useCallback(async () => {
		if (!questionId) return;
		try {
			setLoading(true);
			const data = await APIService.getQuestionDetail(questionId);
			const q = data?.data ?? data;
			setQuestion(q);
			if (sectionId) {
				const sectionData = await APIService.getSectionInfo(sectionId);
				const s = sectionData?.data ?? sectionData;
				setSectionInfo(s);
			}
		} catch (err) {
			console.error("Error fetching question:", err);
			alert("질문을 불러오는 중 오류가 발생했습니다");
		} finally {
			setLoading(false);
		}
	}, [questionId, sectionId]);

	const fetchComments = useCallback(async () => {
		if (!questionId) return;
		try {
			const data = await APIService.getComments(questionId);
			const list = data?.data ?? (Array.isArray(data) ? data : []);
			setComments(list);
		} catch (err) {
			console.error("Error fetching comments:", err);
		}
	}, [questionId]);

	useEffect(() => {
		fetchQuestionDetail();
	}, [fetchQuestionDetail]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	const handleLikeQuestion = useCallback(async () => {
		if (!questionId) return;
		try {
			await APIService.likeQuestion(questionId);
			fetchQuestionDetail();
		} catch (err) {
			console.error("Error liking question:", err);
			alert("추천 중 오류가 발생했습니다");
		}
	}, [questionId, fetchQuestionDetail]);

	const handleLikeComment = useCallback(
		async (commentId: number) => {
			try {
				await APIService.likeComment(commentId);
				fetchComments();
			} catch (err) {
				console.error("Error liking comment:", err);
			}
		},
		[fetchComments],
	);

	const handleSubmitComment = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!questionId) return;
			const tempDiv = document.createElement("div");
			tempDiv.innerHTML = commentContent;
			const text = tempDiv.textContent || tempDiv.innerText || "";
			if (!text.trim()) {
				alert("댓글 내용을 입력해주세요");
				return;
			}
			try {
				setSubmittingComment(true);
				await APIService.createComment(
					questionId,
					commentContent,
					commentAnonymous,
				);
				setCommentContent("");
				setCommentAnonymous(false);
				fetchComments();
				fetchQuestionDetail();
			} catch (err) {
				console.error("Error submitting comment:", err);
				alert("댓글 작성 중 오류가 발생했습니다");
			} finally {
				setSubmittingComment(false);
			}
		},
		[
			questionId,
			commentContent,
			commentAnonymous,
			fetchComments,
			fetchQuestionDetail,
		],
	);

	const handleDeleteComment = useCallback(
		async (commentId: number) => {
			if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
			try {
				await APIService.deleteComment(commentId);
				alert("댓글이 삭제되었습니다");
				fetchComments();
				fetchQuestionDetail();
			} catch (err) {
				console.error("Error deleting comment:", err);
				alert("댓글 삭제 중 오류가 발생했습니다");
			}
		},
		[fetchComments, fetchQuestionDetail],
	);

	const isSectionStaff = Boolean(
		sectionInfo?.isCurrentUserSectionStaff ||
			auth?.user?.role === "ADMIN" ||
			auth?.user?.role === "SUPER_ADMIN" ||
			(auth?.user?.id &&
				sectionInfo &&
				(auth.user.id === sectionInfo.instructorId ||
					auth.user.id === sectionInfo.instructor?.id)),
	);

	const handleResolveQuestion = useCallback(async () => {
		if (!questionId) return;
		try {
			await APIService.resolveQuestion(questionId);
			fetchQuestionDetail();
		} catch (err) {
			console.error("Error resolving question:", err);
			alert("상태 변경 중 오류가 발생했습니다");
		}
	}, [questionId, fetchQuestionDetail]);

	const handleDeleteQuestion = useCallback(async () => {
		if (!questionId || !sectionId) return;
		if (!window.confirm("정말 이 질문을 삭제하시겠습니까?")) return;
		try {
			await APIService.deleteQuestion(questionId);
			alert("질문이 삭제되었습니다");
			navigate(`/sections/${sectionId}/community`);
		} catch (err) {
			console.error("Error deleting question:", err);
			alert("삭제 중 오류가 발생했습니다");
		}
	}, [questionId, sectionId, navigate]);

	const handleToggleSidebar = useCallback(() => {
		setIsSidebarCollapsed((prev) => !prev);
	}, [setIsSidebarCollapsed]);

	return {
		sectionId,
		questionId,
		navigate,
		loading,
		question,
		comments,
		sectionInfo,
		commentContent,
		setCommentContent,
		commentAnonymous,
		setCommentAnonymous,
		submittingComment,
		isSidebarCollapsed,
		isSectionStaff,
		handleLikeQuestion,
		handleLikeComment,
		handleSubmitComment,
		handleDeleteComment,
		handleResolveQuestion,
		handleDeleteQuestion,
		handleToggleSidebar,
	};
}

export type QuestionDetailPageHookReturn = ReturnType<
	typeof useQuestionDetailPage
>;
