import type { FC } from "react";
import { removeCopyLabel } from "../../../../../../utils/problemUtils";
import * as S from "../../styles";
import type { SubmissionStudent } from "../../types";
import type { CodingTestManagementHookReturn } from "../../hooks/useCodingTestManagement";

interface StudentProgressTabViewProps {
	d: CodingTestManagementHookReturn;
}

const StudentProgressTabView: FC<StudentProgressTabViewProps> = ({ d }) => {
	return (
		<>
			<S.SectionTitle style={{ marginBottom: "1rem" }}>학생 진행 현황</S.SectionTitle>
			<S.FiltersSection>
				<S.SearchBox>
					<S.SearchInput
						type="text"
						placeholder="학생 이름 또는 학번 검색..."
						value={d.searchTerm}
						onChange={(e) => d.setSearchTerm(e.target.value)}
					/>
				</S.SearchBox>
				<S.StatusFilters>
					<S.FilterBtn
						type="button"
						$active={d.filterStatus === "ALL"}
						onClick={() => d.setFilterStatus("ALL")}
					>
						전체
					</S.FilterBtn>
					<S.FilterBtn
						type="button"
						$active={d.filterStatus === "COMPLETED"}
						onClick={() => d.setFilterStatus("COMPLETED")}
					>
						완료
					</S.FilterBtn>
					<S.FilterBtn
						type="button"
						$active={d.filterStatus === "IN_PROGRESS"}
						onClick={() => d.setFilterStatus("IN_PROGRESS")}
					>
						진행중
					</S.FilterBtn>
					<S.FilterBtn
						type="button"
						$active={d.filterStatus === "NOT_STARTED"}
						onClick={() => d.setFilterStatus("NOT_STARTED")}
					>
						미시작
					</S.FilterBtn>
				</S.StatusFilters>
			</S.FiltersSection>
			<S.StudentsList>
				{(() => {
					const getCompletionStatus = (student: SubmissionStudent) => {
						const total = d.problems.length;
						const solved = student.solvedProblems?.length ?? 0;
						if (solved === 0) return "NOT_STARTED";
						if (solved === total) return "COMPLETED";
						return "IN_PROGRESS";
					};
					const getProgressPercentage = (student: SubmissionStudent) => {
						const total = d.problems.length;
						const solved = student.solvedProblems?.length ?? 0;
						return total > 0 ? Math.round((solved / total) * 100) : 0;
					};
					const filteredStudents = d.submissions.filter((student) => {
						const term = d.searchTerm.toLowerCase();
						const matchSearch =
							student.studentName?.toLowerCase().includes(term) ||
							student.studentId?.toLowerCase().includes(term);
						const status = getCompletionStatus(student);
						const matchStatus = d.filterStatus === "ALL" || status === d.filterStatus;
						return matchSearch && matchStatus;
					});
					if (filteredStudents.length === 0) {
						return (
							<S.NoData>
								<p>조건에 맞는 학생이 없습니다.</p>
							</S.NoData>
						);
					}
					return (
						<S.TableContainer>
							<S.StudentsTable>
								<thead>
									<tr>
										<th>학번</th>
										<th>이름</th>
										<th>진행 상태</th>
										<th>완료율</th>
										<th>문제별 풀이 현황</th>
									</tr>
								</thead>
								<tbody>
									{filteredStudents.map((student) => {
										const status = getCompletionStatus(student);
										const percentage = getProgressPercentage(student);
										return (
											<tr key={student.userId}>
												<td>
													<S.StudentId>{student.studentId}</S.StudentId>
												</td>
												<td>
													<S.StudentName>{student.studentName}</S.StudentName>
												</td>
												<td>
													<S.SubmissionsStatusBadge
														$status={status as "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED"}
													>
														{status === "COMPLETED"
															? "완료"
															: status === "IN_PROGRESS"
																? "진행중"
																: "미시작"}
													</S.SubmissionsStatusBadge>
												</td>
												<td>
													<S.ProgressCell>
														<S.MiniProgressBar>
															<S.MiniProgressFill $width={percentage} />
														</S.MiniProgressBar>
														<S.ProgressText>
															{student.solvedProblems?.length ?? 0}/{d.problems.length}
														</S.ProgressText>
													</S.ProgressCell>
												</td>
												<td>
													<S.ProblemsStatus>
														{d.problems.map((problem, index) => {
															const isSolved = student.solvedProblems?.includes(problem.id);
															return (
																<S.ProblemBadge
																	key={problem.id}
																	$solved={isSolved}
																	$clickable={isSolved}
																	title={`${removeCopyLabel(problem.title)} - ${isSolved ? "완료 (클릭하여 문제 보기)" : "미완료"}`}
																	onClick={() => {
																		if (isSolved) {
																			d.navigate(
																				`/tutor/coding-tests/section/${d.sectionId}/${d.quizId}?problemId=${problem.id}`,
																			);
																		}
																	}}
																>
																	{index + 1}
																</S.ProblemBadge>
															);
														})}
													</S.ProblemsStatus>
												</td>
											</tr>
										);
									})}
								</tbody>
							</S.StudentsTable>
						</S.TableContainer>
					);
				})()}
			</S.StudentsList>
		</>
	);
};

export default StudentProgressTabView;
