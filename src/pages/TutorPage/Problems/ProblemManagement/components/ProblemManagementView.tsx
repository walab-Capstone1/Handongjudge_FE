import type React from "react";
import TutorLayout from "../../../../../layouts/TutorLayout";
import ReactMarkdown from "react-markdown";
import Alert from "../../../../../components/UI/Alert";
import EmptyState from "../../../../../components/UI/EmptyState";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import * as S from "../styles";
import type { ProblemManagementHookReturn } from "../hooks/useProblemManagement";

export default function ProblemManagementView(d: ProblemManagementHookReturn) {
	if (d.loading) {
		return (
			<TutorLayout>
				<LoadingSpinner message="문제 목록을 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.Container>
				{d.alertMessage && (
					<Alert
						type={d.alertType}
						message={d.alertMessage}
						onClose={() => d.setAlertMessage(null)}
					/>
				)}

				<S.TitleHeader>
					<S.TitleLeft>
						<S.Title>문제 관리</S.Title>
						<S.TitleStats>
							<S.StatBadge>총 {d.problems.length}개 문제</S.StatBadge>
						</S.TitleStats>
					</S.TitleLeft>
					<S.TitleRight>
						<S.CreateButton
							onClick={() => d.navigate("/tutor/problems/create")}
						>
							+ 새 문제 만들기
						</S.CreateButton>
					</S.TitleRight>
				</S.TitleHeader>

				<S.FiltersSection>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="문제명으로 검색..."
							value={d.searchTerm}
							onChange={(e) => d.setSearchTerm(e.target.value)}
						/>
					</S.SearchBox>
					<S.FilterGroup>
						<S.FilterSelect
							id="filter-usage"
							value={d.filterUsageStatus}
							onChange={(e) => {
								d.setFilterUsageStatus(e.target.value);
								if (e.target.value !== "USED") {
									d.setFilterCourse("ALL");
									d.setFilterAssignment("ALL");
								}
							}}
						>
							<option value="ALL">전체 사용 여부</option>
							<option value="USED">사용 중</option>
							<option value="UNUSED">미사용</option>
						</S.FilterSelect>
					</S.FilterGroup>
					{d.filterUsageStatus === "USED" && (
						<>
							<S.FilterGroup>
								<S.FilterSelect
									id="filter-course"
									value={d.filterCourse}
									onChange={(e) => {
										d.setFilterCourse(e.target.value);
										d.setFilterAssignment("ALL");
									}}
									disabled={d.loadingUsageData}
								>
									<option value="ALL">전체 수업</option>
									{d.sections.map((section) => (
										<option key={section.sectionId} value={section.sectionId}>
											{section.courseTitle} ({section.year}년{" "}
											{section.semester === "SPRING"
												? "1학기"
												: section.semester === "SUMMER"
													? "여름학기"
													: section.semester === "FALL"
														? "2학기"
														: "겨울학기"}
											{section.sectionNumber
												? ` - ${section.sectionNumber}분반`
												: ""}
											)
										</option>
									))}
								</S.FilterSelect>
							</S.FilterGroup>
							{d.filterCourse !== "ALL" && (
								<S.FilterGroup>
									<S.FilterSelect
										id="filter-assignment"
										value={d.filterAssignment}
										onChange={(e) => d.setFilterAssignment(e.target.value)}
										disabled={d.loadingUsageData}
									>
										<option value="ALL">전체 과제</option>
										{d.assignments.map((assignment) => (
											<option key={assignment.id} value={assignment.id}>
												{assignment.assignmentNumber &&
													`${assignment.assignmentNumber}. `}
												{assignment.title}
											</option>
										))}
									</S.FilterSelect>
								</S.FilterGroup>
							)}
						</>
					)}
					<S.FilterGroup>
						<S.FilterSelect
							id="filter-difficulty"
							value={d.filterDifficulty}
							onChange={(e) => d.setFilterDifficulty(e.target.value)}
						>
							<option value="ALL">전체 난이도</option>
							<option value="1">1 (쉬움)</option>
							<option value="2">2 (보통)</option>
							<option value="3">3 (어려움)</option>
							<option value="4">4 (매우 어려움)</option>
							<option value="5">5 (극도 어려움)</option>
						</S.FilterSelect>
					</S.FilterGroup>
					{d.availableTags.length > 0 && (
						<S.FilterGroup>
							<S.FilterSelect
								id="filter-tag"
								value={d.filterTag}
								onChange={(e) => d.setFilterTag(e.target.value)}
							>
								<option value="ALL">전체 태그</option>
								{d.availableTags.map((tag) => (
									<option key={tag} value={tag}>
										{tag}
									</option>
								))}
							</S.FilterSelect>
						</S.FilterGroup>
					)}
				</S.FiltersSection>

				<S.ResponsiveWrapper>
					<S.TableContainer>
						{d.filteredProblems.length > 0 ? (
							<S.Table>
								<thead>
									<tr>
										<th className="id-cell">ID</th>
										<th className="title-cell">문제 제목</th>
										<th className="meta-cell">시간 제한</th>
										<th className="meta-cell">메모리 제한</th>
										<th className="meta-cell">생성일</th>
										<th className="actions-cell">관리</th>
									</tr>
								</thead>
								<tbody>
									{d.filteredProblems.map((problem) => (
										<tr key={problem.id}>
											<S.IdCell>
												<S.IdText>#{problem.id}</S.IdText>
											</S.IdCell>
											<S.TitleCell>
												<S.TitleWrapper>
													<S.TitleContent>
														<S.TitleRow>
															<S.TitleText
																$clickable
																onClick={() => {
																	d.setSelectedProblem(problem);
																	d.setShowProblemModal(true);
																}}
															>
																{problem.title}
															</S.TitleText>
															{problem.isUsed &&
																(problem.assignmentCount ?? 0) > 0 && (
																	<S.UsageBadge
																		title={`${problem.assignmentCount}개 과제에서 사용 중`}
																	>
																		사용 중
																		<S.UsageCount>
																			{" "}
																			({problem.assignmentCount})
																		</S.UsageCount>
																	</S.UsageBadge>
																)}
														</S.TitleRow>
														{d.getProblemTags(problem).length > 0 && (
															<S.Tags>
																{d.getProblemTags(problem).map((tag, idx) => (
																	<S.Tag key={idx}>{tag}</S.Tag>
																))}
															</S.Tags>
														)}
													</S.TitleContent>
												</S.TitleWrapper>
											</S.TitleCell>
											<S.MetaCell>
												{problem.timeLimit ? `${problem.timeLimit}초` : "-"}
											</S.MetaCell>
											<S.MetaCell>
												{problem.memoryLimit ? `${problem.memoryLimit}MB` : "-"}
											</S.MetaCell>
											<S.MetaCell>{d.formatDate(problem.createdAt)}</S.MetaCell>
											<S.ActionsCell>
												<S.ActionsInline>
													<S.PrimaryActions>
														<S.TableActionButton
															$edit
															onClick={() =>
																d.navigate(`/tutor/problems/${problem.id}/edit`)
															}
														>
															수정
														</S.TableActionButton>
														<S.TableActionButton
															$secondary
															onClick={() => d.handleCopyClick(problem)}
														>
															복사
														</S.TableActionButton>
														{problem.isUsed && (
															<S.TableActionButton
																$secondary
																onClick={() => d.handleUsageClick(problem)}
																title="사용 현황 보기"
															>
																사용 현황
															</S.TableActionButton>
														)}
													</S.PrimaryActions>
													<S.SecondaryActions>
														<S.SecondaryActionsLayer>
															<S.MoreMenu>
																<S.TableActionButton
																	$secondary
																	$delete
																	onClick={(e) => {
																		e.stopPropagation();
																		d.setOpenMoreMenu(
																			d.openMoreMenu === problem.id
																				? null
																				: problem.id,
																		);
																	}}
																	title="더보기"
																>
																	⋯
																</S.TableActionButton>
																{d.openMoreMenu === problem.id && (
																	<S.MoreDropdown>
																		<S.MoreMenuItem
																			$delete
																			onClick={(e) => {
																				e.stopPropagation();
																				d.handleDeleteClick(problem);
																				d.setOpenMoreMenu(null);
																			}}
																		>
																			삭제
																		</S.MoreMenuItem>
																	</S.MoreDropdown>
																)}
															</S.MoreMenu>
														</S.SecondaryActionsLayer>
													</S.SecondaryActions>
												</S.ActionsInline>
											</S.ActionsCell>
										</tr>
									))}
								</tbody>
							</S.Table>
						) : (
							<EmptyState
								title="등록된 문제가 없습니다"
								message="새로운 문제를 만들어보세요"
								actionLabel="새 문제 만들기"
								onAction={() => d.navigate("/tutor/problems/create")}
							/>
						)}
					</S.TableContainer>
				</S.ResponsiveWrapper>

				{/* 문제 설명 모달 */}
				{d.showProblemModal && d.selectedProblem && (
					<S.ModalOverlay onClick={d.closeProblemModal}>
						<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>{d.selectedProblem.title}</h2>
								<S.ModalClose onClick={d.closeProblemModal}>×</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								{d.getProblemTags(d.selectedProblem).length > 0 && (
									<S.TagsInModal>
										{d.getProblemTags(d.selectedProblem).map((tag, idx) => (
											<S.TagInModal key={idx}>{tag}</S.TagInModal>
										))}
									</S.TagsInModal>
								)}
								{(() => {
									const desc =
										d.selectedProblem.description || "*문제 설명이 없습니다.*";
									const isHtml =
										typeof desc === "string" && /<[^>]+>/.test(desc);
									return isHtml ? (
										<div dangerouslySetInnerHTML={{ __html: desc }} />
									) : (
										<S.DescriptionContent>
											<ReactMarkdown
												components={{
													h1: ({ node, ...props }: any) => (
														<h1 className="problem-description-h1" {...props} />
													),
													h2: ({ node, ...props }: any) => (
														<h2 className="problem-description-h2" {...props} />
													),
													h3: ({ node, ...props }: any) => (
														<h3 className="problem-description-h3" {...props} />
													),
													code: ({ node, className, children, ...props }: any) => {
														const inline = !className;
														return inline ? (
															<code
																className="problem-description-inline-code"
																{...props}
															>
																{children}
															</code>
														) : (
															<pre className="problem-description-code-block">
																<code {...props}>{children}</code>
															</pre>
														);
													},
													p: ({ node, ...props }: any) => (
														<p
															className="problem-description-paragraph"
															{...props}
														/>
													),
												}}
											>
												{desc}
											</ReactMarkdown>
										</S.DescriptionContent>
									);
								})()}
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 삭제 확인 모달 */}
				{d.showDeleteModal && d.problemToDelete && (
					<S.ModalOverlay onClick={d.closeDeleteModal}>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 삭제 확인</h2>
								<S.ModalClose
									onClick={d.closeDeleteModal}
									disabled={d.isDeleting}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<p>정말로 다음 문제를 삭제하시겠습니까?</p>
								<S.BoldText>{d.problemToDelete.title}</S.BoldText>
								<S.WarningText>⚠️ 이 작업은 되돌릴 수 없습니다.</S.WarningText>
							</S.ModalBody>
							<S.ModalFooter>
								<S.BtnCancel
									onClick={d.closeDeleteModal}
									disabled={d.isDeleting}
								>
									취소
								</S.BtnCancel>
								<S.BtnDanger
									onClick={d.handleDeleteConfirm}
									disabled={d.isDeleting}
								>
									{d.isDeleting ? "삭제 중..." : "삭제"}
								</S.BtnDanger>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 복사 모달 */}
				{d.showCopyModal && d.problemToCopy && (
					<S.ModalOverlay onClick={d.closeCopyModal}>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 복사</h2>
								<S.ModalClose onClick={d.closeCopyModal} disabled={d.isCopying}>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<p>다음 문제를 복사합니다:</p>
								<S.CopyPrompt>{d.problemToCopy.title}</S.CopyPrompt>
								<S.FormGroup>
									<label htmlFor="copy-title">새 문제 제목</label>
									<S.FormInput
										id="copy-title"
										type="text"
										value={d.copyTitle}
										onChange={(e) => d.setCopyTitle(e.target.value)}
										placeholder="복사본 문제 제목을 입력하세요"
										disabled={d.isCopying}
									/>
								</S.FormGroup>
							</S.ModalBody>
							<S.ModalFooter>
								<S.BtnCancel onClick={d.closeCopyModal} disabled={d.isCopying}>
									취소
								</S.BtnCancel>
								<S.BtnSubmit
									onClick={d.handleCopyConfirm}
									disabled={d.isCopying || !d.copyTitle.trim()}
								>
									{d.isCopying ? "복사 중..." : "복사"}
								</S.BtnSubmit>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 사용 현황 모달 */}
				{d.showUsageModal && d.problemForUsage && (
					<S.ModalOverlay onClick={d.closeUsageModal}>
						<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 사용 현황</h2>
								<S.ModalClose
									onClick={d.closeUsageModal}
									disabled={d.loadingUsage}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.UsagePrompt>{d.problemForUsage.title}</S.UsagePrompt>

								{d.loadingUsage ? (
									<S.LoadingMessage>
										<LoadingSpinner message="사용 현황을 불러오는 중..." />
									</S.LoadingMessage>
								) : !d.problemUsage.assignments?.length &&
									!d.problemUsage.problemSets?.length &&
									!d.problemUsage.quizzes?.length ? (
									<S.EmptyMessage>
										<p>이 문제는 현재 어떤 곳에서도 사용되지 않습니다.</p>
									</S.EmptyMessage>
								) : (
									<div>
										{d.problemUsage.assignments &&
											d.problemUsage.assignments.length > 0 && (
												<S.UsageSection>
													<h3>과제 ({d.problemUsage.assignments.length}개)</h3>
													<S.UsageTableWrapper>
														<S.UsageTable>
															<thead>
																<tr>
																	<th>수업</th>
																	<th>과제</th>
																	<th>시작일</th>
																	<th>종료일</th>
																</tr>
															</thead>
															<tbody>
																{d.problemUsage.assignments.map((usage) => (
																	<tr
																		key={`assignment-${usage.assignmentId}`}
																		onClick={() => {
																			if (
																				usage.sectionId &&
																				usage.assignmentId &&
																				d.problemForUsage?.id
																			) {
																				d.navigate(
																					`/sections/${usage.sectionId}/assignments/${usage.assignmentId}/detail/problems/${d.problemForUsage.id}`,
																				);
																			}
																		}}
																	>
																		<td>
																			<div>
																				<div style={{ fontWeight: "500" }}>
																					{usage.courseTitle}
																				</div>
																				<div
																					style={{
																						fontSize: "12px",
																						color: "#666",
																						marginTop: "4px",
																					}}
																				>
																					{usage.year}년{" "}
																					{usage.semester === "SPRING"
																						? "1학기"
																						: usage.semester === "SUMMER"
																							? "여름학기"
																							: usage.semester === "FALL"
																								? "2학기"
																								: "겨울학기"}{" "}
																					{usage.sectionNumber
																						? `- ${usage.sectionNumber}분반`
																						: ""}
																				</div>
																			</div>
																		</td>
																		<td>
																			{usage.assignmentNumber && (
																				<span
																					style={{
																						color: "#666",
																						marginRight: "8px",
																					}}
																				>
																					{usage.assignmentNumber}
																				</span>
																			)}
																			{usage.assignmentTitle}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{d.formatDateTime(
																				usage.assignmentStartDate,
																			)}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{d.formatDateTime(
																				usage.assignmentEndDate,
																			)}
																		</td>
																	</tr>
																))}
															</tbody>
														</S.UsageTable>
													</S.UsageTableWrapper>
												</S.UsageSection>
											)}

										{d.problemUsage.problemSets &&
											d.problemUsage.problemSets.length > 0 && (
												<S.UsageSection>
													<h3>
														문제집 ({d.problemUsage.problemSets.length}개)
													</h3>
													<S.UsageTableWrapper>
														<S.UsageTable>
															<thead>
																<tr>
																	<th>문제집 제목</th>
																	<th>설명</th>
																	<th>생성일</th>
																</tr>
															</thead>
															<tbody>
																{d.problemUsage.problemSets.map((ps) => (
																	<tr
																		key={`problemset-${ps.problemSetId}`}
																		onClick={() => {
																			d.navigate(
																				`/tutor/problems/sets/${ps.problemSetId}/edit`,
																			);
																		}}
																	>
																		<td style={{ fontWeight: "500" }}>
																			{ps.problemSetTitle}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{ps.description || "-"}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{d.formatDateTime(ps.createdAt)}
																		</td>
																	</tr>
																))}
															</tbody>
														</S.UsageTable>
													</S.UsageTableWrapper>
												</S.UsageSection>
											)}

										{d.problemUsage.quizzes &&
											d.problemUsage.quizzes.length > 0 && (
												<S.UsageSection>
													<h3>퀴즈 ({d.problemUsage.quizzes.length}개)</h3>
													<S.UsageTableWrapper>
														<S.UsageTable>
															<thead>
																<tr>
																	<th>수업</th>
																	<th>퀴즈</th>
																	<th>시작일</th>
																	<th>종료일</th>
																</tr>
															</thead>
															<tbody>
																{d.problemUsage.quizzes.map((quiz) => (
																	<tr
																		key={`quiz-${quiz.quizId}`}
																		onClick={() => {
																			if (quiz.sectionId && quiz.quizId) {
																				d.navigate(
																					`/tutor/coding-tests/section/${quiz.sectionId}/${quiz.quizId}`,
																				);
																			}
																		}}
																	>
																		<td>
																			<div>
																				<div style={{ fontWeight: "500" }}>
																					{quiz.courseTitle}
																				</div>
																				<div
																					style={{
																						fontSize: "12px",
																						color: "#666",
																						marginTop: "4px",
																					}}
																				>
																					{quiz.year}년{" "}
																					{quiz.semester === "SPRING"
																						? "1학기"
																						: quiz.semester === "SUMMER"
																							? "여름학기"
																							: quiz.semester === "FALL"
																								? "2학기"
																								: "겨울학기"}{" "}
																					{quiz.sectionNumber
																						? `- ${quiz.sectionNumber}분반`
																						: ""}
																				</div>
																			</div>
																		</td>
																		<td style={{ fontWeight: "500" }}>
																			{quiz.quizTitle}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{d.formatDateTime(quiz.startTime)}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{d.formatDateTime(quiz.endTime)}
																		</td>
																	</tr>
																))}
															</tbody>
														</S.UsageTable>
													</S.UsageTableWrapper>
												</S.UsageSection>
											)}
									</div>
								)}
							</S.ModalBody>
							<S.ModalFooter>
								<S.BtnCancel
									onClick={d.closeUsageModal}
									disabled={d.loadingUsage}
								>
									닫기
								</S.BtnCancel>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
}
