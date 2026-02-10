import * as S from "../styles";
import type { ViewMode } from "../types";
import type {
	AssignmentProblemRow,
	AllAssignmentProblemsEntry,
	AllQuizProblemsEntry,
} from "../types";

export interface GradePointsModalProps {
	show: boolean;
	viewMode: ViewMode;
	hasAssignments: boolean;
	hasQuizzes: boolean;
	selectedAssignment: { id: number } | null;
	selectedQuiz: { id: number; title?: string } | null;
	loadingProblems: boolean;
	allAssignmentProblems: AllAssignmentProblemsEntry[];
	allQuizProblems: AllQuizProblemsEntry[];
	assignmentProblems: AssignmentProblemRow[];
	pointsInputs: Record<string, number | "">;
	setPointsInputs: React.Dispatch<
		React.SetStateAction<Record<string, number | "">>
	>;
	pointsSaving: boolean;
	onClose: () => void;
	onSave: () => void;
}

export default function GradePointsModal({
	show,
	viewMode,
	hasAssignments,
	hasQuizzes,
	selectedAssignment,
	selectedQuiz,
	loadingProblems,
	allAssignmentProblems,
	allQuizProblems,
	assignmentProblems,
	pointsInputs,
	setPointsInputs,
	pointsSaving,
	onClose,
	onSave,
}: GradePointsModalProps) {
	const showModal =
		show &&
		(selectedAssignment || selectedQuiz || hasAssignments || hasQuizzes);
	if (!showModal) return null;

	const isSingleItem =
		(selectedAssignment || selectedQuiz) && assignmentProblems.length > 0;
	const modalTitle = isSingleItem ? "배점 설정" : "수업 전체 배점 설정";
	const modalDesc = selectedAssignment
		? "과제의 각 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다."
		: selectedQuiz
			? "퀴즈(코딩 테스트)의 각 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다."
			: "수업의 모든 과제·퀴즈 문제별 배점을 설정할 수 있습니다. 배점을 변경하면 성적 계산에 반영됩니다.";

	return (
		<S.ModalOverlay
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			tabIndex={0}
		>
			<S.ModalContent $large>
				<div
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<S.ModalHeader>
						<h2>{modalTitle}</h2>
						<S.ModalClose type="button" onClick={onClose} aria-label="닫기">
							×
						</S.ModalClose>
					</S.ModalHeader>
					<S.ModalBody>
						<S.BulkInfo>
							<p>{modalDesc}</p>
						</S.BulkInfo>
						{loadingProblems ? (
							<S.LoadingContainer>
								<S.LoadingSpinner />
								<p>문제 목록을 불러오는 중...</p>
							</S.LoadingContainer>
						) : allAssignmentProblems.length > 0 ||
							allQuizProblems.length > 0 ? (
							<>
								{allAssignmentProblems.map(
									({ assignmentId, assignmentTitle, problems }) => {
										if (problems.length === 0) return null;
										const assignmentTotal = problems.reduce((sum, problem) => {
											const problemId = problem.id ?? problem.problemId;
											const key = `${assignmentId}-${problemId}`;
											const defaultPoints =
												problem.points && problem.points > 0
													? problem.points
													: 1;
											const current =
												pointsInputs[key] !== undefined
													? (pointsInputs[key] ?? 0)
													: defaultPoints;
											return sum + (Number(current) || 0);
										}, 0);
										return (
											<S.AssignmentGroup key={assignmentId}>
												<S.AssignmentGroupHeader>
													<S.AssignmentGroupTitle>
														{assignmentTitle}
													</S.AssignmentGroupTitle>
													<S.AssignmentGroupTotal>
														총점: {assignmentTotal}점
													</S.AssignmentGroupTotal>
												</S.AssignmentGroupHeader>
												<S.BulkInputs>
													{problems.map((problem) => {
														const problemId = problem.id ?? problem.problemId;
														const problemTitle =
															problem.title ??
															problem.problemTitle ??
															"제목 없음";
														const defaultPoints =
															problem.points && problem.points > 0
																? problem.points
																: 1;
														const key = `${assignmentId}-${problemId}`;
														const currentPoints =
															pointsInputs[key] !== undefined
																? (pointsInputs[key] ?? 0)
																: defaultPoints;
														return (
															<S.BulkInputRow key={key}>
																<S.BulkLabel
																	as="label"
																	htmlFor={`points-${key}`}
																>
																	{problemTitle}
																</S.BulkLabel>
																<S.BulkInput
																	id={`points-${key}`}
																	type="number"
																	min={0}
																	step={1}
																	value={currentPoints}
																	onChange={(e) => {
																		const v =
																			e.target.value === ""
																				? ""
																				: Number(e.target.value);
																		setPointsInputs((prev) => ({
																			...prev,
																			[key]: v,
																		}));
																	}}
																	placeholder="배점 입력"
																/>
																<S.PointsUnit>점</S.PointsUnit>
															</S.BulkInputRow>
														);
													})}
												</S.BulkInputs>
											</S.AssignmentGroup>
										);
									},
								)}
								{allQuizProblems.map(({ quizId, quizTitle, problems }) => {
									if (problems.length === 0) return null;
									const quizTotal = problems.reduce((sum, problem) => {
										const problemId = problem.id ?? problem.problemId;
										const key = `quiz-${quizId}-${problemId}`;
										const defaultPoints =
											problem.points && problem.points > 0 ? problem.points : 1;
										const current =
											pointsInputs[key] !== undefined
												? (pointsInputs[key] ?? 0)
												: defaultPoints;
										return sum + (Number(current) || 0);
									}, 0);
									return (
										<S.AssignmentGroup key={`quiz-${quizId}`}>
											<S.AssignmentGroupHeader>
												<S.AssignmentGroupTitle>
													{quizTitle} (퀴즈)
												</S.AssignmentGroupTitle>
												<S.AssignmentGroupTotal>
													총점: {quizTotal}점
												</S.AssignmentGroupTotal>
											</S.AssignmentGroupHeader>
											<S.BulkInputs>
												{problems.map((problem) => {
													const problemId = problem.id ?? problem.problemId;
													const problemTitle =
														problem.title ??
														problem.problemTitle ??
														"제목 없음";
													const defaultPoints =
														problem.points && problem.points > 0
															? problem.points
															: 1;
													const key = `quiz-${quizId}-${problemId}`;
													const currentPoints =
														pointsInputs[key] !== undefined
															? (pointsInputs[key] ?? 0)
															: defaultPoints;
													return (
														<S.BulkInputRow key={key}>
															<S.BulkLabel as="label" htmlFor={`points-${key}`}>
																{problemTitle}
															</S.BulkLabel>
															<S.BulkInput
																id={`points-${key}`}
																type="number"
																min={0}
																step={1}
																value={currentPoints}
																onChange={(e) => {
																	const v =
																		e.target.value === ""
																			? ""
																			: Number(e.target.value);
																	setPointsInputs((prev) => ({
																		...prev,
																		[key]: v,
																	}));
																}}
																placeholder="배점 입력"
															/>
															<S.PointsUnit>점</S.PointsUnit>
														</S.BulkInputRow>
													);
												})}
											</S.BulkInputs>
										</S.AssignmentGroup>
									);
								})}
							</>
						) : assignmentProblems.length > 0 ? (
							<>
								<S.BulkInputs>
									{assignmentProblems.map((problem, index) => {
										const problemId = problem.id ?? problem.problemId ?? index;
										const problemTitle =
											problem.title ?? problem.problemTitle ?? "제목 없음";
										const defaultPoints =
											problem.points && problem.points > 0 ? problem.points : 1;
										const currentPoints =
											pointsInputs[problemId] !== undefined
												? (pointsInputs[problemId] ?? 0)
												: defaultPoints;
										return (
											<S.BulkInputRow key={problemId}>
												<S.BulkLabel
													as="label"
													htmlFor={`points-assignment-${problemId}`}
												>
													{problemTitle}
												</S.BulkLabel>
												<S.BulkInput
													id={`points-assignment-${problemId}`}
													type="number"
													min={0}
													step={1}
													value={currentPoints}
													onChange={(e) => {
														const v =
															e.target.value === ""
																? ""
																: Number(e.target.value);
														setPointsInputs((prev) => ({
															...prev,
															[problemId]: v,
														}));
													}}
													placeholder="배점 입력"
												/>
												<S.PointsUnit>점</S.PointsUnit>
											</S.BulkInputRow>
										);
									})}
								</S.BulkInputs>
								<S.TotalPointsSummary>
									<S.TotalPointsLabel>
										{selectedQuiz ? "퀴즈 총점:" : "과제 총점:"}
									</S.TotalPointsLabel>
									<S.TotalPointsValue>
										{assignmentProblems.reduce((sum, problem, index) => {
											const problemId =
												problem.id ?? problem.problemId ?? index;
											const defaultPoints =
												problem.points && problem.points > 0
													? problem.points
													: 1;
											const current =
												pointsInputs[problemId] !== undefined
													? (pointsInputs[problemId] ?? 0)
													: defaultPoints;
											return sum + (Number(current) || 0);
										}, 0)}
										점
									</S.TotalPointsValue>
								</S.TotalPointsSummary>
							</>
						) : !hasAssignments && !hasQuizzes ? (
							<S.NoData>
								<p>과제 또는 퀴즈가 없습니다.</p>
							</S.NoData>
						) : !hasAssignments &&
							hasQuizzes &&
							allQuizProblems.length === 0 ? (
							<S.NoData>
								<p>퀴즈 문제 목록을 불러오는 중이거나 문제가 없습니다.</p>
							</S.NoData>
						) : (
							<S.NoData>
								<p>등록된 문제가 없습니다.</p>
							</S.NoData>
						)}
						<S.ModalActions>
							<S.BtnCancel type="button" onClick={onClose}>
								취소
							</S.BtnCancel>
							<S.BtnSubmit
								type="button"
								onClick={onSave}
								disabled={
									pointsSaving ||
									!(
										(selectedAssignment && assignmentProblems.length > 0) ||
										(selectedQuiz && assignmentProblems.length > 0) ||
										allAssignmentProblems.length > 0 ||
										allQuizProblems.length > 0
									)
								}
							>
								{pointsSaving ? "저장 중..." : "배점 저장"}
							</S.BtnSubmit>
						</S.ModalActions>
					</S.ModalBody>
				</div>
			</S.ModalContent>
		</S.ModalOverlay>
	);
}
