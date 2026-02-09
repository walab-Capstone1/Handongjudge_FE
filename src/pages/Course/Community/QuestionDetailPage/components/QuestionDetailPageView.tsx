import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
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
								onClick={d.handleLikeQuestion}
							>
								<span className="text">추천</span>
								<span className="count">{question.likeCount ?? 0}</span>
							</S.ActionBtn>
						</S.QuestionActions>
					</S.QuestionCard>

					<S.CommentsSection>
						<S.CommentsTitle>댓글 {d.comments.length}개</S.CommentsTitle>

						<S.CommentForm onSubmit={d.handleSubmitComment}>
							<S.CommentTextarea
								placeholder="댓글을 작성하세요..."
								value={d.commentContent}
								onChange={(e) => d.setCommentContent(e.target.value)}
								rows={4}
								aria-label="댓글 내용"
							/>
							<S.CommentFormFooter>
								<S.CommentOption>
									<input
										type="checkbox"
										checked={d.commentAnonymous}
										onChange={(e) => d.setCommentAnonymous(e.target.checked)}
										aria-label="익명으로 작성"
									/>
									<span>익명으로 작성</span>
								</S.CommentOption>
								<S.BtnSubmitComment
									type="submit"
									disabled={d.submittingComment}
								>
									{d.submittingComment ? "작성 중..." : "댓글 작성"}
								</S.BtnSubmitComment>
							</S.CommentFormFooter>
						</S.CommentForm>

						<S.CommentsList>
							{d.comments.length === 0 ? (
								<S.EmptyComments>
									<p>아직 댓글이 없습니다</p>
									<p>첫 번째 댓글을 작성해보세요!</p>
								</S.EmptyComments>
							) : (
								d.comments.map((comment) => (
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

											{d.canManageAccept && (
												<>
													{!comment.isAccepted ? (
														<S.BtnAccept
															type="button"
															onClick={() => d.handleAcceptComment(comment.id)}
														>
															채택하기
														</S.BtnAccept>
													) : (
														<S.BtnUnaccept
															type="button"
															onClick={() =>
																d.handleUnacceptComment(comment.id)
															}
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
}
