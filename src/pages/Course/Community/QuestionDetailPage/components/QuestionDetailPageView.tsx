import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import TipTapEditor from "../../../../../components/Editor/TipTapEditor";
import {
	formatDate,
	type QuestionDetailPageHookReturn,
} from "../hooks/useQuestionDetailPage";
import * as S from "../styles";

export default function QuestionDetailPageView(
	d: QuestionDetailPageHookReturn,
) {
	const courseNameDisplay = d.sectionInfo
		? d.sectionInfo.sectionNumber
			? `[${d.sectionInfo.courseTitle ?? ""}] ${d.sectionInfo.sectionNumber}분반`
			: (d.sectionInfo.courseTitle ?? "질문 상세")
		: "로딩 중...";

	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="커뮤니티"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
					onToggleSidebar={d.handleToggleSidebar}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={courseNameDisplay}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.Body>
						<S.LoadingMessage>로딩 중...</S.LoadingMessage>
					</S.Body>
				</S.Content>
			</S.Container>
		);
	}

	if (!d.question) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu="커뮤니티"
					isCollapsed={d.isSidebarCollapsed}
					onMenuClick={() => {}}
					onToggleSidebar={d.handleToggleSidebar}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<CourseHeader
						courseName={courseNameDisplay}
						onToggleSidebar={d.handleToggleSidebar}
						isSidebarCollapsed={d.isSidebarCollapsed}
					/>
					<S.Body>
						<S.ErrorMessage>질문을 찾을 수 없습니다</S.ErrorMessage>
					</S.Body>
				</S.Content>
			</S.Container>
		);
	}

	const question = d.question;

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu="커뮤니티"
				isCollapsed={d.isSidebarCollapsed}
				onMenuClick={() => {}}
				onToggleSidebar={d.handleToggleSidebar}
			/>
			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={d.sectionInfo?.courseTitle ?? "질문 상세"}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
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
									onClick={() =>
										d.navigate(`/sections/${d.sectionId}/community`)
									}
								>
									← 목록으로
								</S.BtnBack>
								{question.isAuthor && (
									<>
										<S.BtnEdit
											type="button"
											onClick={() =>
												d.navigate(
													`/sections/${d.sectionId}/community/${d.questionId}/edit`,
												)
											}
										>
											수정
										</S.BtnEdit>
										<S.BtnDelete type="button" onClick={d.handleDeleteQuestion}>
											삭제
										</S.BtnDelete>
										<S.BtnResolve
											type="button"
											onClick={d.handleResolveQuestion}
										>
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
							{question.isAuthor && <S.MyPostBadge>내 글</S.MyPostBadge>}
							{d.isSectionStaff && question.authorRealNameForStaff ? (
								<>
									<span className="separator">·</span>
									<S.StaffIdentityNote>
										실명: {question.authorRealNameForStaff}
									</S.StaffIdentityNote>
								</>
							) : null}
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
						<div dangerouslySetInnerHTML={{ __html: question.content }} />
					</S.QuestionContent>

						<S.QuestionActions>
							<S.ActionBtn
								type="button"
								$active={question.isLikedByCurrentUser}
								onClick={d.handleLikeQuestion}
							>
								<span className="text">추천</span>
								<span className="count">{question.likeCount ?? 0}</span>
							</S.ActionBtn>
						</S.QuestionActions>
					</S.QuestionCard>

					<S.CommentsSection>
						<S.CommentsListBlock>
							<S.CommentsListTitle>댓글 {d.comments.length}개</S.CommentsListTitle>
							<S.CommentsList>
							{d.comments.length === 0 ? (
								<S.EmptyComments>
									<p>아직 댓글이 없습니다</p>
									<p>첫 번째 댓글을 작성해보세요!</p>
								</S.EmptyComments>
							) : (
								d.comments.map((comment) => (
									<S.CommentCard key={comment.id}>
										<S.CommentHeader>
											<S.CommentAuthorInfo>
												<S.CommentAuthor>
													{comment.authorDisplayName ?? "익명"}
												</S.CommentAuthor>
												{comment.isAuthor && (
													<S.MyPostBadge>내 글</S.MyPostBadge>
												)}
												{d.isSectionStaff && comment.authorRealNameForStaff ? (
													<S.StaffIdentityNote>
														실명: {comment.authorRealNameForStaff}
													</S.StaffIdentityNote>
												) : null}
												{comment.isInstructorAnswer &&
													!comment.isAnonymous && (
														<S.BadgeInstructor>교수/TA</S.BadgeInstructor>
													)}
											</S.CommentAuthorInfo>
											<S.CommentDate>
												{formatDate(comment.createdAt)}
											</S.CommentDate>
										</S.CommentHeader>

									<S.CommentContent>
										<div dangerouslySetInnerHTML={{ __html: comment.content }} />
									</S.CommentContent>

										<S.CommentActions>
											<S.ActionBtnSmall
												type="button"
												$active={comment.isLikedByCurrentUser}
												onClick={() => d.handleLikeComment(comment.id)}
											>
												<span className="text">추천</span>
												<span className="count">{comment.likeCount ?? 0}</span>
											</S.ActionBtnSmall>

											{comment.isAuthor && (
												<S.BtnDeleteComment
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														d.handleDeleteComment(comment.id);
													}}
												>
													삭제
												</S.BtnDeleteComment>
											)}
										</S.CommentActions>
									</S.CommentCard>
								))
							)}
							</S.CommentsList>
						</S.CommentsListBlock>

						<S.CommentComposerBlock>
							<S.CommentComposerTitle>댓글 작성</S.CommentComposerTitle>
							<S.CommentForm onSubmit={d.handleSubmitComment}>
								<S.EditorWrapper>
									<TipTapEditor
										content={d.commentContent}
										onChange={(html) => d.setCommentContent(html)}
										placeholder="댓글을 작성하세요..."
									/>
								</S.EditorWrapper>
								<S.CommentFormFooter>
									<S.CommentOption>
										<input
											type="checkbox"
											checked={d.commentAnonymous}
											onChange={(e) => d.setCommentAnonymous(e.target.checked)}
											aria-label="익명으로 작성"
										/>
										<span>익명으로 작성</span>
										<S.CommentOptionHint>
											(이 글에서 익명 1, 2… 순으로 표시)
										</S.CommentOptionHint>
									</S.CommentOption>
									<S.BtnSubmitComment
										type="submit"
										disabled={d.submittingComment}
									>
										{d.submittingComment ? "작성 중..." : "댓글 작성"}
									</S.BtnSubmitComment>
								</S.CommentFormFooter>
							</S.CommentForm>
						</S.CommentComposerBlock>
						</S.CommentsSection>
				</S.Body>
			</S.Content>
		</S.Container>
	);
}
