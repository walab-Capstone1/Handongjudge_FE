import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import { removeCopyLabel } from "../../../utils/problemUtils";
import * as S from "./styles";
import type {
	Assignment,
	StudentProgress,
	Problem,
	SectionInfo,
	FilterStatus,
	SubmissionStats,
} from "./types";

const AssignmentStudentProgress: React.FC = () => {
	const { sectionId, assignmentId } = useParams<{
		sectionId: string;
		assignmentId?: string;
	}>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [assignment, setAssignment] = useState<Assignment | null>(null);
	const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
	const [problems, setProblems] = useState<Problem[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [expandedProblems, setExpandedProblems] = useState<Set<number>>(
		new Set(),
	);
	const [selectedStudent, setSelectedStudent] =
		useState<StudentProgress | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [submissionStats, setSubmissionStats] = useState<
		Record<number, SubmissionStats>
	>({});
	const [progressSearchTerm, setProgressSearchTerm] = useState("");
	const [showCodeModal, setShowCodeModal] = useState(false);
	const [selectedCodeData, setSelectedCodeData] = useState<{
		student: StudentProgress;
		problem: Problem;
		codeData?: {
			studentName?: string;
			studentId?: string;
			problemTitle?: string;
			language?: string;
			submittedAt?: string;
			code?: string;
		};
	} | null>(null);
	const [loadingCode, setLoadingCode] = useState(false);
	const detailModalRef = useRef<HTMLDialogElement>(null);

	const fetchSectionInfo = useCallback(async () => {
		if (!sectionId) return;
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];
			const currentSectionData = sectionsData.find(
				(section: SectionInfo) =>
					section.sectionId === Number.parseInt(sectionId),
			);
			setCurrentSection(currentSectionData || null);
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	}, [sectionId]);

	const fetchAssignments = useCallback(async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
			const sectionAssignments = await APIService.getAssignmentsBySection(
				Number.parseInt(sectionId),
			);
			const list = sectionAssignments || [];
			const assignmentsWithDetails = await Promise.all(
				list.map(async (a: Assignment) => {
					try {
						const probs = await APIService.getAssignmentProblems(
							Number.parseInt(sectionId),
							a.id,
						);
						const stats = await APIService.getAssignmentSubmissionStats(
							a.id,
							Number.parseInt(sectionId),
						);
						return {
							...a,
							problemCount: probs?.length || 0,
							problems: probs || [],
							stats: stats || {},
						};
					} catch (error) {
						console.error(`과제 ${a.id} 정보 조회 실패:`, error);
						return {
							...a,
							problemCount: 0,
							problems: [],
							stats: {},
						};
					}
				}),
			);
			setAssignments(assignmentsWithDetails);
			const stats: Record<number, SubmissionStats> = {};
			for (const a of assignmentsWithDetails as Assignment[]) {
				if (a.stats) stats[a.id] = a.stats;
			}
			setSubmissionStats(stats);
		} catch (error) {
			console.error("과제 목록 조회 실패:", error);
			setAssignments([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId]);

	const fetchAssignmentDetail = useCallback(async () => {
		if (!assignmentId || !sectionId) return;
		try {
			const response = await APIService.getAssignmentInfoBySection(
				sectionId,
				assignmentId,
			);
			const data = response?.data ?? response;
			setAssignment(data);
			const problemsData = await APIService.getAssignmentProblems(
				sectionId,
				assignmentId,
			);
			setProblems(problemsData || []);
		} catch (error) {
			console.error("과제 정보 조회 실패:", error);
			alert("과제 정보를 불러오는데 실패했습니다.");
		}
	}, [sectionId, assignmentId]);

	const fetchStudentProgress = useCallback(async () => {
		if (!assignmentId || !sectionId) return;
		try {
			setLoading(true);
			const response = await APIService.getAssignmentStudentProgress(
				assignmentId,
				sectionId,
			);
			setStudentProgress(response || []);
		} catch (error) {
			console.error("학생 진행 현황 조회 실패:", error);
			alert("학생 진행 현황을 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	}, [assignmentId, sectionId]);

	useEffect(() => {
		fetchSectionInfo();
		fetchAssignments();
		if (assignmentId) {
			fetchAssignmentDetail();
			fetchStudentProgress();
		}
	}, [
		assignmentId,
		fetchSectionInfo,
		fetchAssignments,
		fetchAssignmentDetail,
		fetchStudentProgress,
	]);

	useEffect(() => {
		const dialog = detailModalRef.current;
		if (!dialog) return;
		if (showDetailModal) dialog.showModal();
		else dialog.close();
	}, [showDetailModal]);

	const getCompletionStatus = (student: StudentProgress): FilterStatus => {
		const totalProblems = problems.length;
		const solvedProblems = student.solvedProblems?.length || 0;
		if (solvedProblems === 0) return "NOT_STARTED";
		if (solvedProblems === totalProblems) return "COMPLETED";
		return "IN_PROGRESS";
	};

	const getProgressPercentage = (student: StudentProgress): number => {
		const totalProblems = problems.length;
		const solvedProblems = student.solvedProblems?.length || 0;
		return totalProblems > 0
			? Math.round((solvedProblems / totalProblems) * 100)
			: 0;
	};

	const filteredStudents = studentProgress.filter((student) => {
		const matchesSearch =
			student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
		const status = getCompletionStatus(student);
		const matchesStatus = filterStatus === "ALL" || status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	const toggleProblem = (problemId: number) => {
		setExpandedProblems((prev) => {
			const next = new Set(prev);
			if (next.has(problemId)) next.delete(problemId);
			else next.add(problemId);
			return next;
		});
	};

	const handleBadgeClick = async (
		student: StudentProgress,
		problem: Problem,
	) => {
		const isSolved = student.solvedProblems?.includes(problem.id);
		if (!isSolved || !sectionId || !assignmentId) return;
		try {
			setLoadingCode(true);
			setSelectedCodeData({ student, problem });
			const codeData = await APIService.getStudentAcceptedCode(
				Number(sectionId),
				Number(assignmentId),
				student.userId,
				problem.id,
			);
			setSelectedCodeData((prev) =>
				prev ? { ...prev, codeData: codeData?.data ?? codeData } : null,
			);
			setShowCodeModal(true);
		} catch (error) {
			const msg = error instanceof Error ? error.message : "알 수 없는 오류";
			alert(`코드를 불러오는데 실패했습니다: ${msg}`);
		} finally {
			setLoadingCode(false);
		}
	};

	if (loading && !assignmentId) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>학생 진행 현황을 불러오는 중...</p>
				</S.LoadingContainer>
			</TutorLayout>
		);
	}

	if (assignmentId && !assignment) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>과제 정보를 불러오는 중...</p>
				</S.LoadingContainer>
			</TutorLayout>
		);
	}

	// 상세 보기 (assignmentId 있을 때)
	if (assignmentId && assignment) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<S.StudentProgressContainer>
					<S.PageHeaderDetail>
						<S.HeaderLeft>
							<S.BackButtonDetail
								type="button"
								onClick={() =>
									navigate(`/tutor/assignments/section/${sectionId}/progress`)
								}
							>
								← 돌아가기
							</S.BackButtonDetail>
							<div>
								<S.PageTitleDetail>{assignment.title}</S.PageTitleDetail>
								<S.PageSubtitleDetail>
									학생별 문제 풀이 현황
								</S.PageSubtitleDetail>
							</div>
						</S.HeaderLeft>
					</S.PageHeaderDetail>

					{/* 문제별 통계 */}
					{problems.length > 0 && (
						<S.ProblemsSummary>
							<S.SummaryHeader>
								<S.SummaryTitle>문제별 제출 현황</S.SummaryTitle>
								<S.TotalStudentsLabel>
									총 {studentProgress.length}명
								</S.TotalStudentsLabel>
							</S.SummaryHeader>
							<S.ProblemsList>
								{problems.map((problem, index) => {
									const solvedCount = studentProgress.filter((s) =>
										s.solvedProblems?.includes(problem.id),
									).length;
									const totalStudents = studentProgress.length;
									const percentage =
										totalStudents > 0
											? Math.round((solvedCount / totalStudents) * 100)
											: 0;
									const unsolvedCount = totalStudents - solvedCount;
									const isExpanded = expandedProblems.has(problem.id);
									return (
										<S.ProblemStatCard key={problem.id} $expanded={isExpanded}>
											<S.ProblemStatHeader
												$clickable
												$expanded={isExpanded}
												onClick={() => toggleProblem(problem.id)}
											>
												<S.HeaderLeft>
													<S.ProblemNumber>문제 {index + 1}</S.ProblemNumber>
													<S.ProblemTitle>
														{removeCopyLabel(problem.title)}
													</S.ProblemTitle>
												</S.HeaderLeft>
												<S.HeaderRight>
													<S.ProblemSummary>
														{solvedCount}/{totalStudents}명 완료 ({percentage}
														%)
													</S.ProblemSummary>
													<S.ToggleIcon $expanded={isExpanded}>▼</S.ToggleIcon>
												</S.HeaderRight>
											</S.ProblemStatHeader>
											{isExpanded && (
												<S.ProblemStatDetails>
													<S.ProblemStatInfo>
														<S.ProblemStatItem $variant="solved">
															<S.StatLabel>완료</S.StatLabel>
															<S.StatRow>
																<S.StatValue
																	className="admin-stat-value"
																	style={{
																		fontSize: "1.2rem",
																		fontWeight: 700,
																		color: "#10b981",
																	}}
																>
																	{solvedCount}명
																</S.StatValue>
																<S.StatPercent>{percentage}%</S.StatPercent>
															</S.StatRow>
														</S.ProblemStatItem>
														<S.ProblemStatItem $variant="unsolved">
															<S.StatLabel>미완료</S.StatLabel>
															<S.StatRow>
																<S.StatValue
																	style={{
																		fontSize: "1.2rem",
																		fontWeight: 700,
																		color: "#ef4444",
																	}}
																>
																	{unsolvedCount}명
																</S.StatValue>
																<S.StatPercent>
																	{100 - percentage}%
																</S.StatPercent>
															</S.StatRow>
														</S.ProblemStatItem>
													</S.ProblemStatInfo>
													<S.ProblemStatBar>
														<S.ProblemStatFill $width={percentage} />
													</S.ProblemStatBar>
												</S.ProblemStatDetails>
											)}
										</S.ProblemStatCard>
									);
								})}
							</S.ProblemsList>
						</S.ProblemsSummary>
					)}

					{/* 필터 */}
					<S.FiltersSection>
						<S.SearchBox>
							<S.SearchInput
								type="text"
								placeholder="학생 이름 또는 학번 검색..."
								value={searchTerm}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setSearchTerm(e.target.value)
								}
							/>
						</S.SearchBox>
						<S.StatusFilters>
							<S.FilterBtn
								type="button"
								$active={filterStatus === "ALL"}
								onClick={() => setFilterStatus("ALL")}
							>
								전체
							</S.FilterBtn>
							<S.FilterBtn
								type="button"
								$active={filterStatus === "COMPLETED"}
								onClick={() => setFilterStatus("COMPLETED")}
							>
								완료
							</S.FilterBtn>
							<S.FilterBtn
								type="button"
								$active={filterStatus === "IN_PROGRESS"}
								onClick={() => setFilterStatus("IN_PROGRESS")}
							>
								진행중
							</S.FilterBtn>
							<S.FilterBtn
								type="button"
								$active={filterStatus === "NOT_STARTED"}
								onClick={() => setFilterStatus("NOT_STARTED")}
							>
								미시작
							</S.FilterBtn>
						</S.StatusFilters>
					</S.FiltersSection>

					{/* 학생 목록 */}
					<S.StudentsList>
						{filteredStudents.length === 0 ? (
							<S.NoData>
								<p>조건에 맞는 학생이 없습니다.</p>
							</S.NoData>
						) : (
							<S.TableContainer>
								<S.StudentsTable>
									<S.StudentsThead>
										<tr>
											<S.StudentsTh>학번</S.StudentsTh>
											<S.StudentsTh>이름</S.StudentsTh>
											<S.StudentsTh>진행 상태</S.StudentsTh>
											<S.StudentsTh>완료율</S.StudentsTh>
											<S.StudentsTh>문제별 풀이 현황</S.StudentsTh>
											<S.StudentsTh>과제 완료 시간</S.StudentsTh>
										</tr>
									</S.StudentsThead>
									<S.StudentsTbody>
										{filteredStudents.map((student) => {
											const status = getCompletionStatus(student);
											const percentage = getProgressPercentage(student);
											return (
												<S.StudentsTr key={student.userId}>
													<S.StudentsTd>
														<S.StudentId>{student.studentId}</S.StudentId>
													</S.StudentsTd>
													<S.StudentsTd>
														<S.StudentName>{student.studentName}</S.StudentName>
													</S.StudentsTd>
													<S.StudentsTd>
														<S.StatusBadge
															$status={
																status === "ALL"
																	? "NOT_STARTED"
																	: (status as
																			| "COMPLETED"
																			| "IN_PROGRESS"
																			| "NOT_STARTED")
															}
														>
															{status === "COMPLETED"
																? "완료"
																: status === "IN_PROGRESS"
																	? "진행중"
																	: "미시작"}
														</S.StatusBadge>
													</S.StudentsTd>
													<S.StudentsTd>
														<S.ProgressCell>
															<S.MiniProgressBar>
																<S.MiniProgressFill $width={percentage} />
															</S.MiniProgressBar>
															<S.ProgressText>
																{student.solvedProblems?.length || 0}/
																{problems.length}
															</S.ProgressText>
														</S.ProgressCell>
													</S.StudentsTd>
													<S.StudentsTd>
														<S.ProblemsStatus>
															{problems.map((problem, index) => {
																const isSolved =
																	student.solvedProblems?.includes(problem.id);
																return (
																	<S.ProblemBadge
																		key={problem.id}
																		$solved={isSolved}
																		$clickable={isSolved}
																		role={isSolved ? "button" : undefined}
																		title={`${removeCopyLabel(problem.title)} - ${isSolved ? "완료 (클릭하여 코드 조회)" : "미완료"}`}
																		onClick={(e: React.MouseEvent) => {
																			if (isSolved) {
																				e.stopPropagation();
																				handleBadgeClick(student, problem);
																			}
																		}}
																	>
																		{index + 1}
																	</S.ProblemBadge>
																);
															})}
															<S.DetailButton
																type="button"
																onClick={() => {
																	setSelectedStudent(student);
																	setShowDetailModal(true);
																}}
																title="상세보기"
															>
																상세보기
															</S.DetailButton>
														</S.ProblemsStatus>
													</S.StudentsTd>
													<S.StudentsTd>
														{student.assignmentCompletedAt ? (
															<S.CompletionTimeDisplay $completed>
																{new Date(
																	student.assignmentCompletedAt,
																).toLocaleString("ko-KR", {
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</S.CompletionTimeDisplay>
														) : (
															<S.CompletionTimeDisplay>
																미완료
															</S.CompletionTimeDisplay>
														)}
													</S.StudentsTd>
												</S.StudentsTr>
											);
										})}
									</S.StudentsTbody>
								</S.StudentsTable>
							</S.TableContainer>
						)}
					</S.StudentsList>

					{/* 상세보기 모달 */}
					<S.ModalDialog
						ref={detailModalRef}
						onClick={(e: React.MouseEvent<HTMLDialogElement>) => {
							if (e.target === e.currentTarget) setShowDetailModal(false);
						}}
						onCancel={() => setShowDetailModal(false)}
					>
						{selectedStudent && (
							<S.ModalContent
								onClick={(e: React.MouseEvent) => e.stopPropagation()}
							>
								<S.ModalHeader>
									<S.ModalTitle>제출 시간 상세</S.ModalTitle>
									<S.ModalClose
										type="button"
										onClick={() => setShowDetailModal(false)}
									>
										✕
									</S.ModalClose>
								</S.ModalHeader>
								<S.DetailModalBody>
									<S.StudentInfo>
										<h3>
											{selectedStudent.studentName} ({selectedStudent.studentId}
											)
										</h3>
									</S.StudentInfo>
									<S.ProblemsDetailList>
										<h4>문제별 제출 시간</h4>
										<S.DetailTable>
											<thead>
												<tr>
													<th>문제 번호</th>
													<th>문제 제목</th>
													<th>상태</th>
													<th>제출 시간</th>
												</tr>
											</thead>
											<tbody>
												{problems.map((problem, index) => {
													const isSolved =
														selectedStudent.solvedProblems?.includes(
															problem.id,
														);
													const submissionTime =
														selectedStudent.problemSubmissionTimes?.[
															problem.id
														];
													return (
														<tr key={problem.id}>
															<td>{index + 1}</td>
															<td>{removeCopyLabel(problem.title)}</td>
															<td>
																<S.StatusBadgeDetail $completed={isSolved}>
																	{isSolved ? "완료" : "미완료"}
																</S.StatusBadgeDetail>
															</td>
															<td>
																{submissionTime ? (
																	<S.SubmissionTime $completed>
																		{new Date(submissionTime).toLocaleString(
																			"ko-KR",
																			{
																				year: "numeric",
																				month: "long",
																				day: "numeric",
																				hour: "2-digit",
																				minute: "2-digit",
																				second: "2-digit",
																			},
																		)}
																	</S.SubmissionTime>
																) : (
																	<S.SubmissionTime>-</S.SubmissionTime>
																)}
															</td>
														</tr>
													);
												})}
											</tbody>
										</S.DetailTable>
									</S.ProblemsDetailList>
								</S.DetailModalBody>
								<S.ModalActions>
									<S.SecondaryButton
										type="button"
										onClick={() => setShowDetailModal(false)}
									>
										닫기
									</S.SecondaryButton>
								</S.ModalActions>
							</S.ModalContent>
						)}
					</S.ModalDialog>

					{/* 코드 조회 모달 */}
					{showCodeModal && selectedCodeData && (
						<S.ModalOverlay onClick={() => setShowCodeModal(false)}>
							<S.CodeModalContent
								onClick={(e: React.MouseEvent) => e.stopPropagation()}
							>
								<S.CodeModalHeader>
									<div>
										<h2>제출 코드 조회</h2>
										{selectedCodeData.problem && (
											<S.CodeModalSubtitle>
												{removeCopyLabel(selectedCodeData.problem.title)}
											</S.CodeModalSubtitle>
										)}
									</div>
									<S.ModalClose
										type="button"
										onClick={() => setShowCodeModal(false)}
									>
										✕
									</S.ModalClose>
								</S.CodeModalHeader>
								<S.CodeModalBody>
									{loadingCode ? (
										<S.LoadingContainer>
											<S.LoadingSpinner />
											<p>코드를 불러오는 중...</p>
										</S.LoadingContainer>
									) : selectedCodeData.codeData ? (
										<>
											<S.CodeInfo>
												<S.CodeInfoRow>
													<S.CodeLabel>학생:</S.CodeLabel>
													<S.CodeValue>
														{selectedCodeData.codeData.studentName} (
														{selectedCodeData.codeData.studentId})
													</S.CodeValue>
												</S.CodeInfoRow>
												<S.CodeInfoRow>
													<S.CodeLabel>문제:</S.CodeLabel>
													<S.CodeValue>
														{removeCopyLabel(
															selectedCodeData.codeData.problemTitle ?? "",
														)}
													</S.CodeValue>
												</S.CodeInfoRow>
												<S.CodeInfoRow>
													<S.CodeLabel>언어:</S.CodeLabel>
													<S.CodeValue>
														{selectedCodeData.codeData.language ?? "-"}
													</S.CodeValue>
												</S.CodeInfoRow>
												<S.CodeInfoRow>
													<S.CodeLabel>제출 시간:</S.CodeLabel>
													<S.CodeValue>
														{selectedCodeData.codeData.submittedAt
															? new Date(
																	selectedCodeData.codeData.submittedAt,
																).toLocaleString("ko-KR", {
																	year: "numeric",
																	month: "long",
																	day: "numeric",
																	hour: "2-digit",
																	minute: "2-digit",
																	second: "2-digit",
																})
															: "-"}
													</S.CodeValue>
												</S.CodeInfoRow>
												<S.CodeInfoRow>
													<S.CodeLabel>결과:</S.CodeLabel>
													<S.CodeValue $accepted>정답 (AC)</S.CodeValue>
												</S.CodeInfoRow>
											</S.CodeInfo>
											<S.CodeEditorContainer>
												<S.CodeDisplay>
													<code>{selectedCodeData.codeData.code ?? ""}</code>
												</S.CodeDisplay>
											</S.CodeEditorContainer>
										</>
									) : (
										<S.NoData>
											<p>코드 데이터를 불러올 수 없습니다.</p>
										</S.NoData>
									)}
								</S.CodeModalBody>
								<S.ModalActions>
									<S.SecondaryButton
										type="button"
										onClick={() => setShowCodeModal(false)}
									>
										닫기
									</S.SecondaryButton>
								</S.ModalActions>
							</S.CodeModalContent>
						</S.ModalOverlay>
					)}
				</S.StudentProgressContainer>
			</TutorLayout>
		);
	}

	// 리스트 보기 (과제별 풀이 현황)
	const filteredProgressAssignments = assignments.filter((a) => {
		const term = progressSearchTerm.toLowerCase();
		return (
			a.title.toLowerCase().includes(term) ||
			a.description?.toLowerCase().includes(term)
		);
	});

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.AssignmentProgressContainer>
				<S.PageHeader>
					<S.PageTitle>과제별 풀이 현황</S.PageTitle>
				</S.PageHeader>
				<S.FiltersSection>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="과제명으로 검색..."
							value={progressSearchTerm}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setProgressSearchTerm(e.target.value)
							}
						/>
					</S.SearchBox>
				</S.FiltersSection>
				{loading ? (
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<p>과제 목록을 불러오는 중...</p>
					</S.LoadingContainer>
				) : assignments.length === 0 ? (
					<S.NoData>
						<p>등록된 과제가 없습니다.</p>
					</S.NoData>
				) : (
					<S.AssignmentsTableContainer>
						<S.AssignmentsTable>
							<thead>
								<tr>
									<th>과제 제목</th>
									<th>마감일</th>
									<th>문제 수</th>
									<th>제출 현황</th>
								</tr>
							</thead>
							<tbody>
								{filteredProgressAssignments.length === 0 ? (
									<tr>
										<S.TableEmpty colSpan={4}>
											검색 조건에 맞는 과제가 없습니다.
										</S.TableEmpty>
									</tr>
								) : (
									filteredProgressAssignments.map((a) => (
										<tr
											key={a.id}
											className="admin-clickable"
											tabIndex={0}
											onClick={() =>
												navigate(
													`/tutor/assignments/section/${sectionId}/progress/${a.id}`,
												)
											}
											onKeyDown={(e: React.KeyboardEvent) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													navigate(
														`/tutor/assignments/section/${sectionId}/progress/${a.id}`,
													);
												}
											}}
										>
											<S.AssignmentTitleCell>
												<div>
													<div>{a.title}</div>
													{a.description && (
														<S.AssignmentDescription>
															{a.description}
														</S.AssignmentDescription>
													)}
												</div>
											</S.AssignmentTitleCell>
											<S.AssignmentMetaCell>
												{a.endDate
													? new Date(a.endDate).toLocaleDateString("ko-KR", {
															month: "short",
															day: "numeric",
														})
													: a.deadline
														? new Date(a.deadline).toLocaleDateString("ko-KR", {
																month: "short",
																day: "numeric",
															})
														: "미설정"}
											</S.AssignmentMetaCell>
											<S.AssignmentMetaCell>
												{a.problemCount ?? 0}개
											</S.AssignmentMetaCell>
											<S.AssignmentMetaCell>
												{submissionStats[a.id]
													? `${submissionStats[a.id]?.submittedStudents ?? 0}/${submissionStats[a.id]?.totalStudents ?? 0}`
													: "0/0"}
											</S.AssignmentMetaCell>
										</tr>
									))
								)}
							</tbody>
						</S.AssignmentsTable>
					</S.AssignmentsTableContainer>
				)}
			</S.AssignmentProgressContainer>
		</TutorLayout>
	);
};

export default AssignmentStudentProgress;
