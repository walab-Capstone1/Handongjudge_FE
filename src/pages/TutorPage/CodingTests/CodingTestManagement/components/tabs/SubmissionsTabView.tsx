import type { FC } from "react";
import { removeCopyLabel } from "../../../../../../utils/problemUtils";
import * as S from "../../styles";
import type { SubmissionStudent } from "../../types";
import type { CodingTestManagementHookReturn } from "../../hooks/useCodingTestManagement";

interface SubmissionsTabViewProps {
	d: CodingTestManagementHookReturn;
}

function getResultLabel(result: string) {
	const labels: Record<string, string> = {
		AC: "정답",
		WA: "오답",
		TLE: "시간초과",
		RE: "런타임에러",
		CE: "컴파일에러",
		MLE: "메모리초과",
		OLE: "출력초과",
	};
	return labels[result] ?? result ?? "-";
}

function getResultBadgeColor(result: string) {
	switch (result) {
		case "AC":
			return "#10b981";
		case "WA":
			return "#ef4444";
		case "TLE":
		case "MLE":
		case "OLE":
			return "#f59e0b";
		case "RE":
		case "CE":
			return "#8b5cf6";
		default:
			return "#64748b";
	}
}

const SubmissionsTabView: FC<SubmissionsTabViewProps> = ({ d }) => {
	return (
		<>
			<S.SectionTitle style={{ marginBottom: "1rem" }}>제출 기록 (시간순)</S.SectionTitle>
			<S.FiltersSection>
				<S.StatusFilters>
					{["ALL", "AC", "WA", "TLE", "RE", "CE"].map((result) => (
						<S.FilterBtn
							key={result}
							type="button"
							$active={
								result === "ALL"
									? !d.submissionResultFilter || d.submissionResultFilter === "ALL"
									: d.submissionResultFilter === result
							}
							onClick={() => {
								d.setSubmissionResultFilter(result);
								d.setSubmissionRecordsPage(1);
							}}
						>
							{result === "ALL" ? "전체" : result}
						</S.FilterBtn>
					))}
				</S.StatusFilters>
			</S.FiltersSection>
			{d.submissionRecordsLoading ? (
				<S.NoData>
					<p>제출 기록을 불러오는 중...</p>
				</S.NoData>
			) : d.submissionRecords.length === 0 ? (
				<S.NoData>
					<p>제출 기록이 없습니다.</p>
				</S.NoData>
			) : (
				<>
					<S.TableContainer style={{ marginBottom: "1.5rem" }}>
						<S.Table $compact>
							<thead>
								<tr>
									<th>제출시간</th>
									<th>학번</th>
									<th>이름</th>
									<th>문제</th>
									<th>결과</th>
									<th>언어</th>
									<th>상세보기</th>
								</tr>
							</thead>
							<tbody>
								{d.submissionRecords.map((rec) => (
									<tr key={rec.submissionId}>
										<td>{d.formatDateTime(rec.submittedAt)}</td>
										<td>{rec.studentId}</td>
										<td>{rec.studentName}</td>
										<td>{removeCopyLabel(rec.problemTitle)}</td>
										<td>
											<span
												style={{
													display: "inline-block",
													padding: "0.15rem 0.4rem",
													borderRadius: "4px",
													fontSize: "0.75rem",
													fontWeight: 500,
													backgroundColor: `${getResultBadgeColor(rec.result)}20`,
													color: getResultBadgeColor(rec.result),
												}}
											>
												{getResultLabel(rec.result)}
											</span>
										</td>
										<td>{rec.language ?? "-"}</td>
										<td>
											<S.EditButton
												type="button"
												$small
												onClick={() => d.fetchSubmissionCode(rec.submissionId)}
											>
												코드 보기
											</S.EditButton>
										</td>
									</tr>
								))}
							</tbody>
						</S.Table>
					</S.TableContainer>
					{d.submissionRecordsTotalPages > 1 && (
						<S.ProblemSelectPagination style={{ marginBottom: "1.5rem" }}>
							<S.ProblemSelectPaginationBtn
								type="button"
								onClick={() => d.setSubmissionRecordsPage((p) => Math.max(1, p - 1))}
								disabled={d.submissionRecordsPage === 1}
							>
								이전
							</S.ProblemSelectPaginationBtn>
							<span>
								{d.submissionRecordsPage} / {d.submissionRecordsTotalPages} (총{" "}
								{d.submissionRecordsTotal}건)
							</span>
							<S.ProblemSelectPaginationBtn
								type="button"
								onClick={() =>
									d.setSubmissionRecordsPage((p) =>
										Math.min(d.submissionRecordsTotalPages, p + 1),
									)
								}
								disabled={d.submissionRecordsPage === d.submissionRecordsTotalPages}
							>
								다음
							</S.ProblemSelectPaginationBtn>
						</S.ProblemSelectPagination>
					)}
				</>
			)}

			<S.SectionTitle style={{ marginTop: "2rem", marginBottom: "1rem" }}>
				학생 진행 현황
			</S.SectionTitle>
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

export default SubmissionsTabView;
