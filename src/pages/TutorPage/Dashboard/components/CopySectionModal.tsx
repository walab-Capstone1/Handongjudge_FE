import type React from "react";
import * as S from "../styles";
import { getSemesterLabel } from "../hooks/useDashboard";
import type {
	DashboardSection,
	DashboardCopyFormData,
	DashboardNotice,
	DashboardAssignment,
} from "../types";

interface CopySectionModalProps {
	isOpen: boolean;
	onClose: () => void;
	copyStep: number;
	setCopyStep: React.Dispatch<React.SetStateAction<number>>;
	copyFormData: DashboardCopyFormData;
	setCopyFormData: React.Dispatch<React.SetStateAction<DashboardCopyFormData>>;
	sections: DashboardSection[];
	sourceNotices: DashboardNotice[];
	sourceAssignments: DashboardAssignment[];
	loadingNotices: boolean;
	loadingAssignments: boolean;
	editingNoticeId: number | null;
	setEditingNoticeId: React.Dispatch<React.SetStateAction<number | null>>;
	editingAssignmentId: number | null;
	setEditingAssignmentId: React.Dispatch<React.SetStateAction<number | null>>;
	editingProblemId: number | null;
	setEditingProblemId: React.Dispatch<React.SetStateAction<number | null>>;
	expandedAssignments: Record<number, boolean>;
	toggleAssignmentExpand: (assignmentId: number) => void;
	handleSourceSectionChange: (value: string) => void;
	handleNoticeToggle: (noticeId: number) => void;
	handleSelectAllNotices: () => void;
	handleNoticeEdit: (
		noticeId: number,
		field: "title" | "content",
		value: string,
	) => void;
	handleAssignmentToggle: (assignmentId: number) => void;
	handleSelectAllAssignments: () => void;
	handleAssignmentEdit: (
		assignmentId: number,
		field: "title" | "description",
		value: string,
	) => void;
	handleProblemToggle: (assignmentId: number, problemId: number) => void;
	handleSelectAllProblems: (assignmentId: number) => void;
	handleProblemEdit: (problemId: number, title: string) => void;
	handleCopySection: () => void;
	onViewNotice: (noticeId: number) => void;
}

const CopySectionModal: React.FC<CopySectionModalProps> = (props) => {
	const {
		isOpen,
		onClose,
		copyStep,
		setCopyStep,
		copyFormData,
		setCopyFormData,
		sections,
		sourceNotices,
		sourceAssignments,
		loadingNotices,
		loadingAssignments,
		editingNoticeId,
		setEditingNoticeId,
		editingAssignmentId,
		setEditingAssignmentId,
		editingProblemId,
		setEditingProblemId,
		expandedAssignments,
		toggleAssignmentExpand,
		handleSourceSectionChange,
		handleNoticeToggle,
		handleSelectAllNotices,
		handleNoticeEdit,
		handleAssignmentToggle,
		handleSelectAllAssignments,
		handleAssignmentEdit,
		handleProblemToggle,
		handleSelectAllProblems,
		handleProblemEdit,
		handleCopySection,
		onViewNotice,
	} = props;

	const handleNext = () => {
		if (copyStep === 1 && !copyFormData.sourceSectionId) {
			alert("복사할 수업을 선택해주세요.");
			return;
		}
		if (copyStep === 1 && !copyFormData.courseTitle) {
			alert("새 수업 제목을 입력해주세요.");
			return;
		}
		if (
			copyStep === 2 &&
			copyFormData.copyNotices &&
			copyFormData.selectedNoticeIds.length === 0
		) {
			if (
				!window.confirm("공지사항을 선택하지 않았습니다. 계속하시겠습니까?")
			) {
				return;
			}
		}
		if (
			copyStep === 3 &&
			copyFormData.copyAssignments &&
			copyFormData.selectedAssignmentIds.length === 0
		) {
			if (!window.confirm("과제를 선택하지 않았습니다. 계속하시겠습니까?")) {
				return;
			}
		}
		setCopyStep(copyStep + 1);
	};

	if (!isOpen) return null;

	return (
		<S.ModalOverlay onClick={onClose}>
			<S.ModalContent
				$large={copyStep > 1}
				onClick={(e) => e.stopPropagation()}
			>
				<S.ModalHeader>
					<h2 style={{ color: "white" }}>기존 수업 복사</h2>
					<S.ModalClose onClick={onClose}>×</S.ModalClose>
				</S.ModalHeader>
				<S.ModalBody $large={copyStep > 1}>
					{copyStep === 1 && (
						<S.StepContent>
							<S.StepTitle>1단계: 기본 정보 입력</S.StepTitle>
							<S.FormGroup>
								<label htmlFor="copy-source-section">복사할 수업 선택 *</label>
								<S.FormSelect
									id="copy-source-section"
									value={copyFormData.sourceSectionId}
									onChange={(e) => handleSourceSectionChange(e.target.value)}
								>
									<option value="">수업을 선택하세요</option>
									{sections.map((section) => (
										<option key={section.sectionId} value={section.sectionId}>
											{section.courseTitle} ({section.year || "2024"}년{" "}
											{getSemesterLabel(section.semester)})
										</option>
									))}
								</S.FormSelect>
							</S.FormGroup>
							<S.FormGroup>
								<label htmlFor="copy-course-title">새 수업 제목 *</label>
								<S.FormInput
									id="copy-course-title"
									type="text"
									value={copyFormData.courseTitle}
									onChange={(e) =>
										setCopyFormData((prev) => ({
											...prev,
											courseTitle: e.target.value,
										}))
									}
									placeholder="예: 자바프로그래밍"
								/>
							</S.FormGroup>
							<S.FormGroup>
								<label htmlFor="copy-description">수업 설명</label>
								<S.FormTextarea
									id="copy-description"
									value={copyFormData.description}
									onChange={(e) =>
										setCopyFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder="수업에 대한 설명을 입력하세요 (선택사항)"
									rows={4}
								/>
							</S.FormGroup>
							<S.FormRow>
								<S.FormGroup>
									<label htmlFor="copy-year">년도 *</label>
									<S.FormInput
										id="copy-year"
										type="number"
										value={copyFormData.year}
										onChange={(e) =>
											setCopyFormData((prev) => ({
												...prev,
												year: e.target.value,
											}))
										}
										placeholder="2025"
										min={2020}
										max={2099}
									/>
								</S.FormGroup>
								<S.FormGroup>
									<label htmlFor="copy-semester">구분 *</label>
									<S.FormSelect
										id="copy-semester"
										value={copyFormData.semester}
										onChange={(e) =>
											setCopyFormData((prev) => ({
												...prev,
												semester: e.target.value,
											}))
										}
									>
										<option value="SPRING">1학기</option>
										<option value="SUMMER">여름학기</option>
										<option value="FALL">2학기</option>
										<option value="WINTER">겨울학기</option>
										<option value="CAMP">캠프</option>
										<option value="SPECIAL">특강</option>
										<option value="IRREGULAR">비정규 세션</option>
									</S.FormSelect>
								</S.FormGroup>
							</S.FormRow>
							<S.FormGroup>
								<S.CheckboxLabel $large>
									<input
										type="checkbox"
										checked={copyFormData.copyNotices}
										onChange={(e) =>
											setCopyFormData((prev) => ({
												...prev,
												copyNotices: e.target.checked,
											}))
										}
									/>
									<S.CheckboxContent>
										<S.CheckboxTitle>공지사항 복사</S.CheckboxTitle>
										<S.CheckboxDescription>
											복사할 공지사항을 선택할 수 있습니다
										</S.CheckboxDescription>
									</S.CheckboxContent>
								</S.CheckboxLabel>
							</S.FormGroup>
							<S.FormGroup>
								<S.CheckboxLabel $large>
									<input
										type="checkbox"
										checked={copyFormData.copyAssignments}
										onChange={(e) =>
											setCopyFormData((prev) => ({
												...prev,
												copyAssignments: e.target.checked,
											}))
										}
									/>
									<S.CheckboxContent>
										<S.CheckboxTitle>과제 및 문제 복사</S.CheckboxTitle>
										<S.CheckboxDescription>
											복사할 과제와 문제를 선택할 수 있습니다
										</S.CheckboxDescription>
									</S.CheckboxContent>
								</S.CheckboxLabel>
							</S.FormGroup>
						</S.StepContent>
					)}

					{copyStep === 2 && (
						<S.StepContent>
							<S.StepTitle>2단계: 공지사항 선택 및 수정</S.StepTitle>
							<S.StepDescription>
								가져올 공지사항을 선택하고 제목/내용을 수정할 수 있습니다.
								<S.StepHighlight>
									선택하지 않은 공지사항은 복사되지 않습니다.
								</S.StepHighlight>
							</S.StepDescription>
							{loadingNotices ? (
								<S.LoadingItems>공지사항을 불러오는 중...</S.LoadingItems>
							) : sourceNotices.length === 0 ? (
								<S.NoItems>가져올 공지사항이 없습니다.</S.NoItems>
							) : (
								<S.SelectionBoxLarge>
									<S.SelectionHeader>
										<S.CheckboxLabel>
											<input
												type="checkbox"
												checked={
													copyFormData.selectedNoticeIds.length ===
														sourceNotices.length && sourceNotices.length > 0
												}
												onChange={handleSelectAllNotices}
											/>
											<span>전체 선택</span>
										</S.CheckboxLabel>
										<S.ItemCount>
											{copyFormData.selectedNoticeIds.length} /{" "}
											{sourceNotices.length}개 선택됨
										</S.ItemCount>
									</S.SelectionHeader>
									<S.ItemListLarge $compact>
										{sourceNotices.map((notice) => {
											const isSelected =
												copyFormData.selectedNoticeIds.includes(notice.id);
											const isEditing = editingNoticeId === notice.id;
											const editData =
												copyFormData.noticeEdits[notice.id] || {};
											const displayTitle = editData.title || notice.title;
											return (
												<S.ListItemLarge key={notice.id} $selected={isSelected}>
													{isEditing ? (
														<S.EditForm $inline>
															<S.EditInput
																type="text"
																value={editData.title || notice.title}
																onChange={(e) =>
																	handleNoticeEdit(
																		notice.id,
																		"title",
																		e.target.value,
																	)
																}
																placeholder="제목"
															/>
															<S.EditTextarea
																value={editData.content || notice.content}
																onChange={(e) =>
																	handleNoticeEdit(
																		notice.id,
																		"content",
																		e.target.value,
																	)
																}
																placeholder="내용"
																rows={4}
															/>
															<S.EditFormActions>
																<S.BtnSaveEdit
																	onClick={(e) => {
																		e.stopPropagation();
																		setEditingNoticeId(null);
																	}}
																>
																	저장
																</S.BtnSaveEdit>
																<S.BtnCancel
																	onClick={(e) => {
																		e.stopPropagation();
																		setEditingNoticeId(null);
																	}}
																>
																	취소
																</S.BtnCancel>
															</S.EditFormActions>
														</S.EditForm>
													) : (
														<>
															<S.CheckboxLabel $item>
																<input
																	type="checkbox"
																	checked={isSelected}
																	onChange={() => handleNoticeToggle(notice.id)}
																/>
																<S.ItemInfo>
																	<S.ItemTitleLarge>
																		{displayTitle}
																	</S.ItemTitleLarge>
																	<S.ItemMeta>
																		{new Date(
																			notice.createdAt,
																		).toLocaleDateString("ko-KR")}
																	</S.ItemMeta>
																</S.ItemInfo>
															</S.CheckboxLabel>
															<S.BtnView
																onClick={(e) => {
																	e.stopPropagation();
																	onViewNotice(notice.id);
																}}
																title="공지사항 내용 보기"
															>
																조회
															</S.BtnView>
														</>
													)}
												</S.ListItemLarge>
											);
										})}
									</S.ItemListLarge>
								</S.SelectionBoxLarge>
							)}
						</S.StepContent>
					)}

					{copyStep === 3 && (
						<S.StepContent>
							<S.StepTitle>3단계: 과제 및 문제 선택 및 수정</S.StepTitle>
							<S.StepDescription>
								가져올 과제와 문제를 선택하고 제목/내용을 수정할 수 있습니다.
								<S.StepHighlight>
									선택하지 않은 과제나 문제는 복사되지 않습니다.
								</S.StepHighlight>
							</S.StepDescription>
							{loadingAssignments ? (
								<S.LoadingItems>과제를 불러오는 중...</S.LoadingItems>
							) : sourceAssignments.length === 0 ? (
								<S.NoItems>가져올 과제가 없습니다.</S.NoItems>
							) : (
								<S.SelectionBoxLarge>
									<S.SelectionHeader>
										<S.CheckboxLabel>
											<input
												type="checkbox"
												checked={
													copyFormData.selectedAssignmentIds.length ===
														sourceAssignments.length &&
													sourceAssignments.length > 0
												}
												onChange={handleSelectAllAssignments}
											/>
											<span>전체 선택</span>
										</S.CheckboxLabel>
										<S.ItemCount>
											{copyFormData.selectedAssignmentIds.length} /{" "}
											{sourceAssignments.length}개 과제 선택됨
										</S.ItemCount>
									</S.SelectionHeader>
									<S.AssignmentListLarge>
										{sourceAssignments.map((assignment) => {
											const isAssignmentSelected =
												copyFormData.selectedAssignmentIds.includes(
													assignment.id,
												);
											const selectedProblems =
												copyFormData.assignmentProblems[assignment.id] || [];
											const isExpanded = expandedAssignments[assignment.id];
											const isEditingAssignment =
												editingAssignmentId === assignment.id;
											const assignmentEditData =
												copyFormData.assignmentEdits[assignment.id] || {};
											const displayAssignmentTitle =
												assignmentEditData.title || assignment.title;
											return (
												<S.AssignmentItemLarge
													key={assignment.id}
													$selected={isAssignmentSelected}
												>
													<S.AssignmentHeader>
														<S.CheckboxLabel>
															<input
																type="checkbox"
																checked={isAssignmentSelected}
																onChange={() =>
																	handleAssignmentToggle(assignment.id)
																}
															/>
															<S.AssignmentInfo>
																{isEditingAssignment ? (
																	<S.EditForm>
																		<S.EditInput
																			type="text"
																			value={
																				assignmentEditData.title ||
																				assignment.title
																			}
																			onChange={(e) =>
																				handleAssignmentEdit(
																					assignment.id,
																					"title",
																					e.target.value,
																				)
																			}
																			placeholder="과제 제목"
																		/>
																		<S.EditTextarea
																			value={
																				assignmentEditData.description ||
																				assignment.description
																			}
																			onChange={(e) =>
																				handleAssignmentEdit(
																					assignment.id,
																					"description",
																					e.target.value,
																				)
																			}
																			placeholder="과제 설명"
																			rows={3}
																		/>
																		<S.BtnSaveEdit
																			onClick={(e) => {
																				e.stopPropagation();
																				setEditingAssignmentId(null);
																			}}
																		>
																			저장
																		</S.BtnSaveEdit>
																	</S.EditForm>
																) : (
																	<>
																		<S.AssignmentTitle>
																			{displayAssignmentTitle}
																		</S.AssignmentTitle>
																		<S.AssignmentMeta>
																			{new Date(
																				assignment.startDate,
																			).toLocaleDateString("ko-KR")}{" "}
																			~{" "}
																			{new Date(
																				assignment.endDate,
																			).toLocaleDateString("ko-KR")}
																		</S.AssignmentMeta>
																	</>
																)}
															</S.AssignmentInfo>
														</S.CheckboxLabel>
														{!isEditingAssignment && (
															<S.AssignmentActions>
																<S.BtnExpand
																	onClick={(e) => {
																		e.stopPropagation();
																		toggleAssignmentExpand(assignment.id);
																	}}
																>
																	{isExpanded ? "접기" : "펼치기"}
																</S.BtnExpand>
															</S.AssignmentActions>
														)}
													</S.AssignmentHeader>
													{isExpanded &&
														isAssignmentSelected &&
														assignment.problems &&
														assignment.problems.length > 0 && (
															<S.ProblemsList>
																<S.ProblemsHeader>
																	<S.CheckboxLabel>
																		<input
																			type="checkbox"
																			checked={
																				selectedProblems.length ===
																				assignment.problems.length
																			}
																			onChange={() =>
																				handleSelectAllProblems(assignment.id)
																			}
																		/>
																		<span>전체 문제 선택</span>
																	</S.CheckboxLabel>
																	<S.ItemCount>
																		{selectedProblems.length} /{" "}
																		{assignment.problems.length}개 선택됨
																	</S.ItemCount>
																</S.ProblemsHeader>
																{assignment.problems.map((problem) => {
																	const isProblemSelected =
																		selectedProblems.includes(problem.id);
																	const isEditingProblem =
																		editingProblemId === problem.id;
																	const problemEditData =
																		copyFormData.problemEdits[problem.id] || {};
																	const displayProblemTitle =
																		problemEditData.title || problem.title;
																	return (
																		<S.ProblemItem
																			key={problem.id}
																			$selected={isProblemSelected}
																		>
																			<S.CheckboxLabel>
																				<input
																					type="checkbox"
																					checked={isProblemSelected}
																					onChange={() =>
																						handleProblemToggle(
																							assignment.id,
																							problem.id,
																						)
																					}
																				/>
																				<S.ProblemInfo>
																					{isEditingProblem ? (
																						<S.EditForm>
																							<S.EditInput
																								type="text"
																								value={
																									problemEditData.title ||
																									problem.title
																								}
																								onChange={(e) =>
																									handleProblemEdit(
																										problem.id,
																										e.target.value,
																									)
																								}
																								placeholder="문제 제목"
																							/>
																							<S.BtnSaveEdit
																								onClick={(e) => {
																									e.stopPropagation();
																									setEditingProblemId(null);
																								}}
																							>
																								저장
																							</S.BtnSaveEdit>
																						</S.EditForm>
																					) : (
																						<S.ProblemTitle>
																							{displayProblemTitle}
																						</S.ProblemTitle>
																					)}
																				</S.ProblemInfo>
																			</S.CheckboxLabel>
																		</S.ProblemItem>
																	);
																})}
															</S.ProblemsList>
														)}
												</S.AssignmentItemLarge>
											);
										})}
									</S.AssignmentListLarge>
								</S.SelectionBoxLarge>
							)}
						</S.StepContent>
					)}

					{copyStep === 4 && (
						<S.StepContent>
							<S.StepTitle>4단계: 최종 확인</S.StepTitle>
							<S.SummaryBox>
								<S.SummaryItem>
									<strong>새 수업 제목:</strong> {copyFormData.courseTitle}
								</S.SummaryItem>
								<S.SummaryItem>
									<strong>년도/학기:</strong> {copyFormData.year}년{" "}
									{getSemesterLabel(copyFormData.semester)}
								</S.SummaryItem>
								{copyFormData.copyNotices && (
									<S.SummaryItem>
										<strong>공지사항:</strong>{" "}
										{copyFormData.selectedNoticeIds.length}개 선택
									</S.SummaryItem>
								)}
								{copyFormData.copyAssignments && (
									<S.SummaryItem>
										<strong>과제:</strong>{" "}
										{copyFormData.selectedAssignmentIds.length}개 선택
									</S.SummaryItem>
								)}
							</S.SummaryBox>
						</S.StepContent>
					)}
				</S.ModalBody>
				<S.ModalFooter>
					{copyStep > 1 && (
						<S.BtnCancel onClick={() => setCopyStep(copyStep - 1)}>
							이전
						</S.BtnCancel>
					)}
					<S.BtnCancel onClick={onClose}>취소</S.BtnCancel>
					{copyStep < 4 ? (
						<S.BtnSubmit onClick={handleNext}>다음</S.BtnSubmit>
					) : (
						<S.BtnSubmit onClick={handleCopySection}>복사하기</S.BtnSubmit>
					)}
				</S.ModalFooter>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default CopySectionModal;
