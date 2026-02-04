import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../recoil/atoms";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { Question, Comment, SectionInfo } from "./types";

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

const QuestionDetailPage: React.FC = () => {
	const { sectionId, questionId } = useParams<{
		sectionId: string;
		questionId: string;
	}>();
	const navigate = useNavigate();
	const auth = useRecoilValue(authState);

	const [loading, setLoading] = useState(true);
	const [question, setQuestion] = useState<Question | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [commentContent, setCommentContent] = useState("");
	const [commentAnonymous, setCommentAnonymous] = useState(false);
	const [submittingComment, setSubmittingComment] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

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

	const handleLikeQuestion = async () => {
		if (!questionId) return;
		try {
			await APIService.likeQuestion(questionId);
			fetchQuestionDetail();
		} catch (err) {
			console.error("Error liking question:", err);
			alert("추천 중 오류가 발생했습니다");
		}
	};

	const handleLikeComment = async (commentId: number) => {
		try {
			await APIService.likeComment(commentId);
			fetchComments();
		} catch (err) {
			console.error("Error liking comment:", err);
		}
	};

	const handleSubmitComment = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!questionId) return;
		if (!commentContent.trim()) {
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
	};

	const handleAcceptComment = async (commentId: number) => {
		if (!window.confirm("이 댓글을 채택하시겠습니까?")) return;
		try {
			await APIService.acceptComment(commentId);
			alert("댓글이 채택되었습니다!");
			fetchComments();
			fetchQuestionDetail();
		} catch (err) {
			console.error("Error accepting comment:", err);
			alert("채택 중 오류가 발생했습니다");
		}
	};

	const handleUnacceptComment = async (commentId: number) => {
		if (!window.confirm("이 댓글의 채택을 해제하시겠습니까?")) return;
		try {
			await APIService.unacceptComment(commentId);
			alert("채택이 해제되었습니다!");
			fetchComments();
			fetchQuestionDetail();
		} catch (err) {
			console.error("Error unaccepting comment:", err);
			alert("채택 해제 중 오류가 발생했습니다");
		}
	};

	const handleDeleteComment = async (commentId: number) => {
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
	};

	const isInstructor =
		sectionInfo &&
		auth?.user?.id &&
		(auth.user.id === sectionInfo.instructorId ||
			auth.user.id === sectionInfo.instructor?.id ||
			auth.user.role === "ADMIN" ||
			auth.user.role === "SUPER_ADMIN");

	const canManageAccept = question && (question.isAuthor || isInstructor);

	const handleResolveQuestion = async () => {
		if (!questionId) return;
		try {
			await APIService.resolveQuestion(questionId);
			fetchQuestionDetail();
		} catch (err) {
			console.error("Error resolving question:", err);
			alert("상태 변경 중 오류가 발생했습니다");
		}
	};

	const handleDeleteQuestion = async () => {
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
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	const courseNameDisplay = sectionInfo
		? sectionInfo.sectionNumber
			? `[${sectionInfo.courseTitle ?? ""}] ${sectionInfo.sectionNumber}분반`
			: (sectionInfo.courseTitle ?? "질문 상세")
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

	if (!question) {
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
						<S.ErrorMessage>질문을 찾을 수 없습니다</S.ErrorMessage>
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
					courseName={sectionInfo?.courseTitle ?? "질문 상세"}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>
				<S.Body>
					<S.QuestionCard>
						<S.QuestionHeader>
							<S.QuestionBadges>
								{question.isPinned && <S.Badge $variant="pinned">고정</S.Badge>}
								<S.Badge
									$variant={
										question.status === "RESOLVED" ? "resolved" : "pending"
									}
								>
									{question.status === "RESOLVED" ? "해결됨" : "미해결"}
								</S.Badge>
								{question.isAnonymous && (
									<S.Badge $variant="anonymous">익명</S.Badge>
								)}
								{question.isPublic === false && (
									<S.Badge $variant="private">비공개</S.Badge>
								)}
							</S.QuestionBadges>

							<S.HeaderActions>
								<S.BtnBack
									type="button"
									onClick={() => navigate(`/sections/${sectionId}/community`)}
								>
									← 목록으로
								</S.BtnBack>
								{question.isAuthor && (
									<>
										<S.BtnEdit
											type="button"
											onClick={() =>
												navigate(
													`/sections/${sectionId}/community/${questionId}/edit`,
												)
											}
										>
											수정
										</S.BtnEdit>
										<S.BtnDelete type="button" onClick={handleDeleteQuestion}>
											삭제
										</S.BtnDelete>
										<S.BtnResolve type="button" onClick={handleResolveQuestion}>
											{question.status === "RESOLVED"
												? "미해결로 변경"
												: "해결됨으로 변경"}
										</S.BtnResolve>
									</>
								)}
							</S.HeaderActions>
						</S.QuestionHeader>

						<S.QuestionTitle>{question.title}</S.QuestionTitle>

						<S.QuestionMeta>
							<span className="author">
								{question.authorDisplayName ?? "익명"}
							</span>
							<span className="separator">·</span>
							<span className="date">{formatDate(question.createdAt)}</span>
							<span className="separator">·</span>
							<span className="views">조회 {question.viewCount ?? 0}</span>
							{question.assignmentTitle && (
								<>
									<span className="separator">·</span>
									<span className="tag">{question.assignmentTitle}</span>
								</>
							)}
							{question.problemTitle && (
								<>
									<span className="separator">·</span>
									<span className="tag">{question.problemTitle}</span>
								</>
							)}
						</S.QuestionMeta>

						<S.QuestionContent>
							<pre>{question.content}</pre>
						</S.QuestionContent>

						<S.QuestionActions>
							<S.ActionBtn
								type="button"
								$active={question.isLikedByCurrentUser}
								onClick={handleLikeQuestion}
							>
								<span className="text">추천</span>
								<span className="count">{question.likeCount ?? 0}</span>
							</S.ActionBtn>
						</S.QuestionActions>
					</S.QuestionCard>

					<S.CommentsSection>
						<S.CommentsTitle>댓글 {comments.length}개</S.CommentsTitle>

						<S.CommentForm onSubmit={handleSubmitComment}>
							<S.CommentTextarea
								placeholder="댓글을 작성하세요..."
								value={commentContent}
								onChange={(e) => setCommentContent(e.target.value)}
								rows={4}
								aria-label="댓글 내용"
							/>
							<S.CommentFormFooter>
								<S.CommentOption>
									<input
										type="checkbox"
										checked={commentAnonymous}
										onChange={(e) => setCommentAnonymous(e.target.checked)}
										aria-label="익명으로 작성"
									/>
									<span>익명으로 작성</span>
								</S.CommentOption>
								<S.BtnSubmitComment type="submit" disabled={submittingComment}>
									{submittingComment ? "작성 중..." : "댓글 작성"}
								</S.BtnSubmitComment>
							</S.CommentFormFooter>
						</S.CommentForm>

						<S.CommentsList>
							{comments.length === 0 ? (
								<S.EmptyComments>
									<p>아직 댓글이 없습니다</p>
									<p>첫 번째 댓글을 작성해보세요!</p>
								</S.EmptyComments>
							) : (
								comments.map((comment) => (
									<S.CommentCard
										key={comment.id}
										$accepted={comment.isAccepted}
									>
										<S.CommentHeader>
											<S.CommentAuthorInfo>
												<S.CommentAuthor>
													{comment.authorDisplayName ?? "익명"}
												</S.CommentAuthor>
												{comment.isInstructorAnswer && (
													<S.BadgeInstructor>교수</S.BadgeInstructor>
												)}
												{comment.isAccepted && (
													<S.BadgeAccepted>채택됨</S.BadgeAccepted>
												)}
											</S.CommentAuthorInfo>
											<S.CommentDate>
												{formatDate(comment.createdAt)}
											</S.CommentDate>
										</S.CommentHeader>

										<S.CommentContent>
											<pre>{comment.content}</pre>
										</S.CommentContent>

										<S.CommentActions>
											<S.ActionBtnSmall
												type="button"
												$active={comment.isLikedByCurrentUser}
												onClick={() => handleLikeComment(comment.id)}
											>
												<span className="text">추천</span>
												<span className="count">{comment.likeCount ?? 0}</span>
											</S.ActionBtnSmall>

											{comment.isAuthor && (
												<S.BtnDeleteComment
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleDeleteComment(comment.id);
													}}
												>
													삭제
												</S.BtnDeleteComment>
											)}

											{canManageAccept && (
												<>
													{!comment.isAccepted ? (
														<S.BtnAccept
															type="button"
															onClick={() => handleAcceptComment(comment.id)}
														>
															채택하기
														</S.BtnAccept>
													) : (
														<S.BtnUnaccept
															type="button"
															onClick={() => handleUnacceptComment(comment.id)}
														>
															채택 해제
														</S.BtnUnaccept>
													)}
												</>
											)}
										</S.CommentActions>
									</S.CommentCard>
								))
							)}
						</S.CommentsList>
					</S.CommentsSection>
				</S.Body>
			</S.Content>
		</S.Container>
	);
};

export default QuestionDetailPage;
