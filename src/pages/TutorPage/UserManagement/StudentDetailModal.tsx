import type React from "react";
import * as S from "./styles";
import type { Assignment, ProblemStatus } from "./types";

interface StudentDetailModalProps {
	open: boolean;
	onClose: () => void;
	studentAssignments: Assignment[];
	expandedAssignment: number | null;
	assignmentProblemsDetail: Record<number, ProblemStatus[]>;
	onToggleAssignmentDetail: (assignmentId: number) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
	open,
	onClose,
	studentAssignments,
	expandedAssignment,
	assignmentProblemsDetail,
	onToggleAssignmentDetail,
}) => {
	if (!open) return null;

	return (
		<S.ModalOverlay onClick={onClose}>
			<S.ModalContent onClick={(e) => e.stopPropagation()}>
				<S.ModalHeader>
					<h2>과제별 진도율</h2>
					<S.ModalCloseButton type="button" onClick={onClose}>
						✕
					</S.ModalCloseButton>
				</S.ModalHeader>

				<S.ModalBody>
					<S.AssignmentsProgressSection>
						{studentAssignments.length === 0 ? (
							<S.NoAssignments>등록된 과제가 없습니다.</S.NoAssignments>
						) : (
							<S.AssignmentsList>
								{studentAssignments.map((assignment) => (
									<S.AssignmentCard key={assignment.assignmentId}>
										<S.AssignmentHeader>
											<S.AssignmentTitleSection>
												<h4>{assignment.assignmentTitle}</h4>
												{assignment.description && (
													<S.AssignmentDescription>
														{assignment.description}
													</S.AssignmentDescription>
												)}
											</S.AssignmentTitleSection>
											<S.ProgressBadge>
												{assignment.progressRate || 0}%
											</S.ProgressBadge>
										</S.AssignmentHeader>
										<S.AssignmentBody>
											<S.ProgressStats>
												완료: {assignment.solvedProblems || 0} /{" "}
												{assignment.totalProblems || 0} 문제
											</S.ProgressStats>
											<S.ProgressBarContainer>
												<S.ProgressBarFill
													style={{
														width: `${assignment.progressRate || 0}%`,
													}}
												/>
											</S.ProgressBarContainer>
										</S.AssignmentBody>
										<S.ToggleDetailButton
											type="button"
											onClick={() =>
												onToggleAssignmentDetail(assignment.assignmentId)
											}
										>
											{expandedAssignment === assignment.assignmentId
												? "상세보기 닫기 ▲"
												: "상세보기 ▼"}
										</S.ToggleDetailButton>

										{expandedAssignment === assignment.assignmentId && (
											<S.ProblemsDetailSection>
												{assignmentProblemsDetail[assignment.assignmentId]
													?.length > 0 ? (
													<S.ProblemsGrid>
														{assignmentProblemsDetail[
															assignment.assignmentId
														].map((problem) => (
															<S.ProblemCard
																key={problem.problemId}
																className={`problem-${problem.status}`}
															>
																<S.ProblemInfo>
																	<S.ProblemTitle>
																		{problem.problemTitle}
																	</S.ProblemTitle>
																	<S.StatusBadge
																		className={`status-${problem.status}`}
																	>
																		{problem.status === "ACCEPTED"
																			? "✓ 완료"
																			: problem.status === "SUBMITTED"
																				? "⋯ 제출함"
																				: "○ 미제출"}
																	</S.StatusBadge>
																</S.ProblemInfo>
																{problem.submissionCount > 0 && (
																	<S.SubmissionCount>
																		제출 횟수: {problem.submissionCount}회
																	</S.SubmissionCount>
																)}
															</S.ProblemCard>
														))}
													</S.ProblemsGrid>
												) : (
													<S.NoProblems>
														문제 정보를 불러오는 중...
													</S.NoProblems>
												)}
											</S.ProblemsDetailSection>
										)}
									</S.AssignmentCard>
								))}
							</S.AssignmentsList>
						)}
					</S.AssignmentsProgressSection>
				</S.ModalBody>
			</S.ModalContent>
		</S.ModalOverlay>
	);
};

export default StudentDetailModal;
