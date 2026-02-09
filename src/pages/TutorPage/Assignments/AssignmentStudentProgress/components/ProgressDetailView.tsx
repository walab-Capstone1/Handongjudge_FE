import type React from "react";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { removeCopyLabel } from "../../../../../utils/problemUtils";
import * as S from "../styles";
import type {
	Assignment,
	StudentProgress,
	Problem,
	FilterStatus,
} from "../types";

interface ProgressDetailViewProps {
	sectionId: string | undefined;
	assignment: Assignment;
	problems: Problem[];
	studentProgress: StudentProgress[];
	searchTerm: string;
	setSearchTerm: (v: string) => void;
	filterStatus: FilterStatus;
	setFilterStatus: (v: FilterStatus) => void;
	expandedProblems: Set<number>;
	toggleProblem: (id: number) => void;
	filteredStudents: StudentProgress[];
	getCompletionStatus: (s: StudentProgress) => FilterStatus;
	getProgressPercentage: (s: StudentProgress) => number;
	handleBadgeClick: (student: StudentProgress, problem: Problem) => void;
	selectedStudent: StudentProgress | null;
	showDetailModal: boolean;
	setShowDetailModal: (v: boolean) => void;
	setSelectedStudent: (s: StudentProgress | null) => void;
	detailModalRef: React.RefObject<HTMLDialogElement | null>;
	showCodeModal: boolean;
	setShowCodeModal: (v: boolean) => void;
	selectedCodeData: {
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
	} | null;
	loadingCode: boolean;
}

const ProgressDetailView: FC<ProgressDetailViewProps> = (props) => {
	const navigate = useNavigate();
	const {
		sectionId,
		assignment,
		problems,
		studentProgress,
		searchTerm,
		setSearchTerm,
		filterStatus,
		setFilterStatus,
		expandedProblems,
		toggleProblem,
		filteredStudents,
		getCompletionStatus,
		getProgressPercentage,
		handleBadgeClick,
		selectedStudent,
		showDetailModal,
		setShowDetailModal,
		setSelectedStudent,
		detailModalRef,
		showCodeModal,
		setShowCodeModal,
		selectedCodeData,
		loadingCode,
	} = props;

	return (
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
						<S.PageSubtitleDetail>학생별 문제 풀이 현황</S.PageSubtitleDetail>
					</div>
				</S.HeaderLeft>
			</S.PageHeaderDetail>

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
												{solvedCount}/{totalStudents}명 완료 ({percentage}%)
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
														<S.StatPercent>{100 - percentage}%</S.StatPercent>
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

			<S.FiltersSection>
				<S.SearchBox>
					<S.SearchInput
						type="text"
						placeholder="학생 이름 또는 학번 검색..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
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
														const isSolved = student.solvedProblems?.includes(
															problem.id,
														);
														return (
															<S.ProblemBadge
																key={problem.id}
																$solved={isSolved}
																$clickable={isSolved}
																role={isSolved ? "button" : undefined}
																title={`${removeCopyLabel(problem.title)} - ${isSolved ? "완료 (클릭하여 코드 조회)" : "미완료"}`}
																onClick={(e) => {
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

			<S.ModalDialog
				ref={detailModalRef}
				onClick={(e) => {
					if (e.target === e.currentTarget) setShowDetailModal(false);
				}}
				onCancel={() => setShowDetailModal(false)}
			>
				{selectedStudent && (
					<S.ModalContent onClick={(e) => e.stopPropagation()}>
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
									{selectedStudent.studentName} ({selectedStudent.studentId})
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
											const isSolved = selectedStudent.solvedProblems?.includes(
												problem.id,
											);
											const submissionTime =
												selectedStudent.problemSubmissionTimes?.[problem.id];
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

			{showCodeModal && selectedCodeData && (
				<S.ModalOverlay onClick={() => setShowCodeModal(false)}>
					<S.CodeModalContent onClick={(e) => e.stopPropagation()}>
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
	);
};

export default ProgressDetailView;
