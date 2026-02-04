import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import SectionNavigation from "../../../components/SectionNavigation";
import APIService from "../../../services/APIService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { removeCopyLabel } from "../../../utils/problemUtils";
import * as S from "./styles";
import type {
	CodingTest,
	QuizDetail,
	QuizProblem,
	ProblemOption,
	SectionInfo,
	SubmissionStudent,
} from "./types";

const PROBLEMS_PER_PAGE = 10;

const CodingTestManagement: React.FC = () => {
	const { sectionId, quizId } = useParams<{
		sectionId: string;
		quizId?: string;
	}>();
	const navigate = useNavigate();

	const [quizzes, setQuizzes] = useState<CodingTest[]>([]);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showProblemModal, setShowProblemModal] = useState(false);
	const [selectedQuiz, setSelectedQuiz] = useState<CodingTest | null>(null);
	const [selectedQuizDetail, setSelectedQuizDetail] =
		useState<QuizDetail | null>(null);
	const [problems, setProblems] = useState<QuizProblem[]>([]);
	const [submissions, setSubmissions] = useState<SubmissionStudent[]>([]);
	const [activeTab, setActiveTab] = useState("main");
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		startTime: "",
		endTime: "",
		problemIds: [] as number[],
	});
	const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
	const [allProblems, setAllProblems] = useState<ProblemOption[]>([]);
	const [problemSearchTerm, setProblemSearchTerm] = useState("");
	const [currentProblemPage, setCurrentProblemPage] = useState(1);
	const [showAddProblemModal, setShowAddProblemModal] = useState(false);

	useEffect(() => {
		if (sectionId) {
			fetchQuizzes();
			fetchSections();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only run when sectionId changes
	}, [sectionId]);

	useEffect(() => {
		if (quizId && sectionId) {
			fetchQuizDetail();
			fetchQuizProblems();
			fetchSubmissions();
		} else {
			setSelectedQuizDetail(null);
			setProblems([]);
			setSubmissions([]);
			setActiveTab("main");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only run when quizId/sectionId change
	}, [quizId, sectionId]);

	const fetchQuizzes = async () => {
		if (!sectionId) return;
		try {
			setLoading(true);
			const response = await APIService.getQuizzesBySection(sectionId);
			const quizzesData = response?.data ?? response ?? [];
			interface QuizRaw {
				id: number;
				title: string;
				description?: string;
				startTime: string;
				endTime: string;
				status?: "ACTIVE" | "WAITING" | "ENDED";
				problemCount?: number;
			}
			const formattedQuizzes = (
				Array.isArray(quizzesData) ? quizzesData : []
			).map((quiz: QuizRaw) => ({
				...quiz,
				startTime: new Date(quiz.startTime),
				endTime: new Date(quiz.endTime),
			})) as CodingTest[];
			setQuizzes(formattedQuizzes);
		} catch (error) {
			console.error("코딩 테스트 조회 실패:", error);
			setQuizzes([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchSections = async () => {
		try {
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = (dashboardResponse?.data ?? []) as SectionInfo[];
			if (sectionId) {
				const currentSectionData = sectionsData.find(
					(section) => section.sectionId === Number.parseInt(sectionId),
				);
				setCurrentSection(currentSectionData ?? null);
			}
		} catch (error) {
			console.error("분반 정보 조회 실패:", error);
		}
	};

	const fetchAllProblems = async () => {
		try {
			const response = await APIService.getAllProblems();
			let problemsData: ProblemOption[] = [];
			if (Array.isArray(response)) {
				problemsData = response as ProblemOption[];
			} else if (response?.data && Array.isArray(response.data)) {
				problemsData = response.data as ProblemOption[];
			} else if (response?.data && !Array.isArray(response.data)) {
				problemsData = [response.data as ProblemOption];
			} else if (response && typeof response === "object") {
				problemsData = Object.values(response) as ProblemOption[];
			}
			setAllProblems(problemsData);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setAllProblems([]);
		}
	};

	const getFilteredProblems = (): ProblemOption[] => {
		let filtered = allProblems;
		if (problemSearchTerm) {
			const term = problemSearchTerm.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.title?.toLowerCase().includes(term) ||
					p.id?.toString().includes(term),
			);
		}
		return filtered;
	};

	const getPaginatedProblems = (): ProblemOption[] => {
		const filtered = getFilteredProblems();
		const startIndex = (currentProblemPage - 1) * PROBLEMS_PER_PAGE;
		return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
	};

	const getTotalPages = (): number =>
		Math.ceil(getFilteredProblems().length / PROBLEMS_PER_PAGE) || 1;

	const getDifficultyLabel = (difficulty: string): string => {
		const labels: Record<string, string> = {
			"1": "쉬움",
			"2": "보통",
			"3": "어려움",
		};
		return labels[difficulty] ?? difficulty;
	};

	const getDifficultyColor = (difficulty: string): string => {
		const colors: Record<string, string> = {
			"1": "#10b981",
			"2": "#f59e0b",
			"3": "#ef4444",
		};
		return colors[difficulty] ?? "#6b7280";
	};

	const handleCreateQuiz = () => {
		setFormData({
			title: "",
			description: "",
			startTime: "",
			endTime: "",
			problemIds: [],
		});
		setSelectedProblemIds([]);
		setShowCreateModal(true);
	};

	const handleEditQuiz = async (quiz: CodingTest) => {
		if (!sectionId) return;
		try {
			const problemsResponse = await APIService.getQuizProblems(
				sectionId,
				quiz.id,
			);
			const problemsData = (problemsResponse?.data ??
				problemsResponse ??
				[]) as {
				problemId?: number;
				id: number;
			}[];
			const problemIds = problemsData.map((p) => p.problemId ?? p.id);
			const start =
				quiz.startTime instanceof Date
					? quiz.startTime
					: new Date(quiz.startTime);
			const end =
				quiz.endTime instanceof Date ? quiz.endTime : new Date(quiz.endTime);
			setFormData({
				title: quiz.title,
				description: quiz.description ?? "",
				startTime: start.toISOString().slice(0, 16),
				endTime: end.toISOString().slice(0, 16),
				problemIds,
			});
			setSelectedProblemIds(problemIds);
			setSelectedQuiz(quiz);
			setShowEditModal(true);
		} catch (error) {
			console.error("코딩 테스트 정보 조회 실패:", error);
			alert("코딩 테스트 정보를 불러오는데 실패했습니다.");
		}
	};

	const handleDeleteQuiz = async (quizIdToDelete: number) => {
		if (!window.confirm("정말로 이 코딩 테스트를 삭제하시겠습니까?")) {
			return;
		}
		if (!sectionId) return;
		try {
			await APIService.deleteQuiz(sectionId, quizIdToDelete);
			fetchQuizzes();
			if (quizIdToDelete === Number(quizId)) {
				navigate(`/tutor/coding-tests/section/${sectionId}`);
			}
			alert("코딩 테스트가 삭제되었습니다.");
		} catch (error) {
			console.error("코딩 테스트 삭제 실패:", error);
			alert("코딩 테스트 삭제에 실패했습니다.");
		}
	};

	const fetchQuizDetail = async () => {
		if (!sectionId || !quizId) return;
		try {
			const response = await APIService.getQuizInfo(sectionId, quizId);
			const quizData = response?.data ?? response;
			setSelectedQuizDetail({
				...quizData,
				startTime: new Date(quizData.startTime),
				endTime: new Date(quizData.endTime),
			});
		} catch (error) {
			console.error("코딩테스트 정보 조회 실패:", error);
			alert("코딩테스트 정보를 불러오는데 실패했습니다.");
		}
	};

	const fetchQuizProblems = async () => {
		if (!sectionId || !quizId) return;
		try {
			const response = await APIService.getQuizProblems(sectionId, quizId);
			const problemsData = (response?.data ?? response ?? []) as {
				problemId?: number;
				id: number;
				title?: string;
				description?: string;
				problemOrder?: number;
			}[];
			setProblems(
				problemsData.map((p) => ({
					id: p.problemId ?? p.id,
					title: p.title ?? "",
					description: p.description ?? "",
					order: p.problemOrder,
				})),
			);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setProblems([]);
		}
	};

	const fetchSubmissions = async () => {
		if (!sectionId) return;
		try {
			const studentsResponse = await APIService.getSectionStudents(sectionId);
			const students = (studentsResponse?.data ?? studentsResponse ?? []) as {
				id?: number;
				userId?: number;
				email?: string;
				studentId?: string;
				name?: string;
				studentName?: string;
			}[];
			const submissionsData = students.map((student) => ({
				userId: student.id ?? student.userId ?? 0,
				studentId: student.email ?? student.studentId ?? "",
				studentName: student.name ?? student.studentName ?? "",
				solvedProblems: [] as number[],
				problemSubmissionTimes: {},
			}));
			setSubmissions(submissionsData);
		} catch (error) {
			console.error("제출 현황 조회 실패:", error);
			setSubmissions([]);
		}
	};

	const handleStart = () => {
		alert("시작 기능은 백엔드 API 구현이 필요합니다.");
	};

	const handleStop = () => {
		alert("정지 기능은 백엔드 API 구현이 필요합니다.");
	};

	const handleEnd = () => {
		if (window.confirm("정말로 코딩테스트를 종료하시겠습니까?")) {
			alert("종료 기능은 백엔드 API 구현이 필요합니다.");
		}
	};

	const handleSubmitCreate = async () => {
		if (!formData.title.trim()) {
			alert("제목을 입력해주세요.");
			return;
		}
		if (!formData.startTime || !formData.endTime) {
			alert("시작 시간과 종료 시간을 입력해주세요.");
			return;
		}
		if (new Date(formData.startTime) >= new Date(formData.endTime)) {
			alert("종료 시간은 시작 시간보다 늦어야 합니다.");
			return;
		}
		if (selectedProblemIds.length === 0) {
			alert("최소 1개 이상의 문제를 선택해주세요.");
			return;
		}
		if (!sectionId) return;
		try {
			const copiedProblemIds: number[] = [];
			for (const problemId of selectedProblemIds) {
				const newProblemId = await APIService.copyProblem(problemId);
				copiedProblemIds.push(
					typeof newProblemId === "number"
						? newProblemId
						: (newProblemId as { id: number }).id,
				);
			}
			const quizData = {
				title: formData.title,
				description: formData.description,
				startTime: new Date(formData.startTime).toISOString(),
				endTime: new Date(formData.endTime).toISOString(),
				problemIds: copiedProblemIds,
			};
			await APIService.createQuiz(sectionId, quizData);
			setShowCreateModal(false);
			fetchQuizzes();
			alert("코딩 테스트가 생성되었습니다.");
		} catch (error) {
			console.error("코딩 테스트 생성 실패:", error);
			alert("코딩 테스트 생성에 실패했습니다.");
		}
	};

	const handleSubmitEdit = async () => {
		if (!formData.title.trim()) {
			alert("제목을 입력해주세요.");
			return;
		}
		if (!formData.startTime || !formData.endTime) {
			alert("시작 시간과 종료 시간을 입력해주세요.");
			return;
		}
		if (new Date(formData.startTime) >= new Date(formData.endTime)) {
			alert("종료 시간은 시작 시간보다 늦어야 합니다.");
			return;
		}
		if (!selectedQuiz || !sectionId) return;
		try {
			const copiedProblemIds: number[] = [];
			for (const problemId of selectedProblemIds) {
				const newProblemId = await APIService.copyProblem(problemId);
				copiedProblemIds.push(
					typeof newProblemId === "number"
						? newProblemId
						: (newProblemId as { id: number }).id,
				);
			}
			const quizData = {
				title: formData.title,
				description: formData.description,
				startTime: new Date(formData.startTime).toISOString(),
				endTime: new Date(formData.endTime).toISOString(),
				problemIds: copiedProblemIds,
			};
			await APIService.updateQuiz(sectionId, selectedQuiz.id, quizData);
			setShowEditModal(false);
			setSelectedQuiz(null);
			fetchQuizzes();
			alert("코딩 테스트가 수정되었습니다.");
		} catch (error) {
			console.error("코딩 테스트 수정 실패:", error);
			alert("코딩 테스트 수정에 실패했습니다.");
		}
	};

	const handleProblemToggle = (problemId: number) => {
		setSelectedProblemIds((prev) =>
			prev.includes(problemId)
				? prev.filter((id) => id !== problemId)
				: [...prev, problemId],
		);
	};

	const handleSelectAllProblems = () => {
		const filtered = getFilteredProblems();
		const allSelected =
			filtered.length > 0 &&
			filtered.every((p) => selectedProblemIds.includes(p.id));
		if (allSelected) {
			const filteredIds = filtered.map((p) => p.id);
			setSelectedProblemIds((prev) =>
				prev.filter((id) => !filteredIds.includes(id)),
			);
		} else {
			setSelectedProblemIds((prev) => {
				const newIds = filtered.map((p) => p.id);
				return [...new Set([...prev, ...newIds])];
			});
		}
	};

	const handleRemoveProblemFromQuiz = async (problemId: number) => {
		if (!window.confirm("정말로 이 문제를 코딩테스트에서 제거하시겠습니까?")) {
			return;
		}
		alert("문제 제거 기능은 백엔드 API 구현이 필요합니다.");
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return <S.StatusBadge $status="active">진행중</S.StatusBadge>;
			case "WAITING":
				return <S.StatusBadge $status="waiting">대기중</S.StatusBadge>;
			case "ENDED":
				return <S.StatusBadge $status="ended">종료</S.StatusBadge>;
			default:
				return (
					<S.StatusBadge $status={undefined}>{status ?? "-"}</S.StatusBadge>
				);
		}
	};

	const formatDateTime = (dateTime: Date | string): string => {
		const date = new Date(dateTime);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const filteredQuizzes = quizzes.filter((quiz) => {
		const matchesSearch =
			quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			filterStatus === "ALL" || quiz.status === filterStatus;
		return matchesSearch && matchesStatus;
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: only run when modals open; fetchAllProblems is stable
	useEffect(() => {
		if (showProblemModal || showAddProblemModal) {
			fetchAllProblems();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fetchAllProblems is stable
	}, [showProblemModal, showAddProblemModal]);

	// No sectionId: show empty or redirect
	if (!sectionId) {
		return (
			<TutorLayout>
				<S.Container>
					<S.PageHeader>
						<S.PageTitle>코딩 테스트 관리</S.PageTitle>
					</S.PageHeader>
					<S.NoData>
						<p>수업을 선택해주세요.</p>
					</S.NoData>
				</S.Container>
			</TutorLayout>
		);
	}

	// Detail view (quizId present)
	if (quizId && selectedQuizDetail) {
		const tabs = [
			{ id: "main", label: "메인" },
			{ id: "problems", label: "대회 문제" },
			{ id: "submissions", label: "제출 상세정보" },
		];

		return (
			<TutorLayout selectedSection={currentSection}>
				<S.Container>
					{currentSection && sectionId && (
						<SectionNavigation
							title="코딩 테스트 관리"
							sectionId={sectionId}
							sectionName={`${currentSection.courseTitle ?? ""}${currentSection.sectionNumber ? ` - ${currentSection.sectionNumber}분반` : ""}`}
							enrollmentCode={currentSection.enrollmentCode ?? null}
							showSearch={false}
						/>
					)}
					<S.DetailWrapper>
						<S.DetailHeader>
							<S.BackButton
								type="button"
								onClick={() =>
									navigate(`/tutor/coding-tests/section/${sectionId}`)
								}
							>
								← 목록으로
							</S.BackButton>
							<S.DetailTitle>{selectedQuizDetail.title}</S.DetailTitle>
						</S.DetailHeader>

						<S.DetailContent>
							<S.Sidebar>
								<S.TabList>
									{tabs.map((tab) => (
										<S.Tab
											key={tab.id}
											type="button"
											$active={activeTab === tab.id}
											onClick={() => setActiveTab(tab.id)}
										>
											{tab.label}
										</S.Tab>
									))}
								</S.TabList>
							</S.Sidebar>

							<S.MainContent>
								{activeTab === "main" && (
									<S.QuizInfoSection>
										<S.QuizInfoHeader>
											<S.QuizInfoTitle>코딩테스트 정보</S.QuizInfoTitle>
											<S.QuizControlButtons>
												<S.QuizControlBtn
													type="button"
													$variant="start"
													onClick={handleStart}
													disabled={selectedQuizDetail.status === "ACTIVE"}
												>
													시작
												</S.QuizControlBtn>
												<S.QuizControlBtn
													type="button"
													$variant="stop"
													onClick={handleStop}
													disabled={selectedQuizDetail.status !== "ACTIVE"}
												>
													정지
												</S.QuizControlBtn>
												<S.QuizControlBtn
													type="button"
													$variant="end"
													onClick={handleEnd}
													disabled={selectedQuizDetail.status === "ENDED"}
												>
													종료
												</S.QuizControlBtn>
											</S.QuizControlButtons>
										</S.QuizInfoHeader>
										<S.QuizInfoGrid>
											<S.InfoItem>
												<S.InfoLabel>제목</S.InfoLabel>
												<S.InfoValue>{selectedQuizDetail.title}</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>설명</S.InfoLabel>
												<S.InfoValue>
													{selectedQuizDetail.description ?? "-"}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>시작 시간</S.InfoLabel>
												<S.InfoValue>
													{formatDateTime(selectedQuizDetail.startTime)}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>종료 시간</S.InfoLabel>
												<S.InfoValue>
													{formatDateTime(selectedQuizDetail.endTime)}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>상태</S.InfoLabel>
												<S.InfoValue>
													{getStatusBadge(selectedQuizDetail.status ?? "")}
												</S.InfoValue>
											</S.InfoItem>
											<S.InfoItem>
												<S.InfoLabel>문제 수</S.InfoLabel>
												<S.InfoValue>{problems.length}개</S.InfoValue>
											</S.InfoItem>
										</S.QuizInfoGrid>
									</S.QuizInfoSection>
								)}

								{activeTab === "problems" && (
									<>
										<S.ProblemsTabHeader>
											<S.SectionTitle>대회 문제</S.SectionTitle>
											<S.ProblemsTabHeaderRight>
												<S.ProblemsCount>
													총 {problems.length}개
												</S.ProblemsCount>
												<S.ProblemsAddBtn
													type="button"
													onClick={() => {
														setShowAddProblemModal(true);
														setSelectedProblemIds(problems.map((p) => p.id));
													}}
												>
													+ 문제 추가
												</S.ProblemsAddBtn>
											</S.ProblemsTabHeaderRight>
										</S.ProblemsTabHeader>
										{problems.length === 0 ? (
											<S.NoData>
												<p>등록된 문제가 없습니다.</p>
											</S.NoData>
										) : (
											<S.ProblemsTableContainer>
												<S.ProblemsTable>
													<thead>
														<tr>
															<th>문제 번호</th>
															<th>제목</th>
															<th>상태</th>
															<th>제출수</th>
															<th>정답률</th>
															<th>관리</th>
														</tr>
													</thead>
													<tbody>
														{problems.map((problem, index) => (
															<tr key={problem.id}>
																<S.ProblemNumberCell>
																	{index + 1}
																</S.ProblemNumberCell>
																<S.ProblemTitleCell>
																	<S.ProblemTitleMain>
																		{removeCopyLabel(problem.title)}
																	</S.ProblemTitleMain>
																	{problem.description && (
																		<S.ProblemDescriptionPreview>
																			{problem.description.length > 100
																				? `${problem.description.substring(0, 100)}...`
																				: problem.description}
																		</S.ProblemDescriptionPreview>
																	)}
																</S.ProblemTitleCell>
																<td>
																	<span>-</span>
																</td>
																<td>0회</td>
																<td>0%</td>
																<td>
																	<S.ProblemRemoveBtn
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleRemoveProblemFromQuiz(problem.id);
																		}}
																	>
																		제거
																	</S.ProblemRemoveBtn>
																</td>
															</tr>
														))}
													</tbody>
												</S.ProblemsTable>
											</S.ProblemsTableContainer>
										)}
									</>
								)}

								{activeTab === "submissions" && (
									<>
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
											{(() => {
												const getCompletionStatus = (
													student: SubmissionStudent,
												) => {
													const total = problems.length;
													const solved = student.solvedProblems?.length ?? 0;
													if (solved === 0) return "NOT_STARTED";
													if (solved === total) return "COMPLETED";
													return "IN_PROGRESS";
												};
												const getProgressPercentage = (
													student: SubmissionStudent,
												) => {
													const total = problems.length;
													const solved = student.solvedProblems?.length ?? 0;
													return total > 0
														? Math.round((solved / total) * 100)
														: 0;
												};
												const filteredStudents = submissions.filter(
													(student) => {
														const term = searchTerm.toLowerCase();
														const matchSearch =
															student.studentName
																?.toLowerCase()
																.includes(term) ||
															student.studentId?.toLowerCase().includes(term);
														const status = getCompletionStatus(student);
														const matchStatus =
															filterStatus === "ALL" || status === filterStatus;
														return matchSearch && matchStatus;
													},
												);
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
																	const percentage =
																		getProgressPercentage(student);
																	return (
																		<tr key={student.userId}>
																			<td>
																				<S.StudentId>
																					{student.studentId}
																				</S.StudentId>
																			</td>
																			<td>
																				<S.StudentName>
																					{student.studentName}
																				</S.StudentName>
																			</td>
																			<td>
																				<S.SubmissionsStatusBadge
																					$status={
																						status as
																							| "COMPLETED"
																							| "IN_PROGRESS"
																							| "NOT_STARTED"
																					}
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
																						<S.MiniProgressFill
																							$width={percentage}
																						/>
																					</S.MiniProgressBar>
																					<S.ProgressText>
																						{student.solvedProblems?.length ??
																							0}
																						/{problems.length}
																					</S.ProgressText>
																				</S.ProgressCell>
																			</td>
																			<td>
																				<S.ProblemsStatus>
																					{problems.map((problem, index) => {
																						const isSolved =
																							student.solvedProblems?.includes(
																								problem.id,
																							);
																						return (
																							<S.ProblemBadge
																								key={problem.id}
																								$solved={isSolved}
																								$clickable={isSolved}
																								title={`${removeCopyLabel(problem.title)} - ${isSolved ? "완료 (클릭하여 문제 보기)" : "미완료"}`}
																								onClick={() => {
																									if (isSolved) {
																										navigate(
																											`/tutor/coding-tests/section/${sectionId}/${quizId}?problemId=${problem.id}`,
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
								)}
							</S.MainContent>
						</S.DetailContent>
					</S.DetailWrapper>

					{/* 문제 추가 모달 (대회 문제 탭용) */}
					{showAddProblemModal && (
						<S.ModalOverlay
							onClick={() => {
								setShowAddProblemModal(false);
								setProblemSearchTerm("");
								setCurrentProblemPage(1);
							}}
						>
							<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
								<S.ModalHeader>
									<h2>문제 추가 - {selectedQuizDetail?.title}</h2>
									<S.ModalClose
										type="button"
										onClick={() => {
											setShowAddProblemModal(false);
											setProblemSearchTerm("");
											setCurrentProblemPage(1);
										}}
									>
										×
									</S.ModalClose>
								</S.ModalHeader>
								<S.ModalBody>
									<S.SearchBox style={{ marginBottom: "1rem" }}>
										<S.SearchInput
											type="text"
											placeholder="문제명 또는 ID로 검색..."
											value={problemSearchTerm}
											onChange={(e) => {
												setProblemSearchTerm(e.target.value);
												setCurrentProblemPage(1);
											}}
										/>
									</S.SearchBox>
									{getFilteredProblems().length > 0 ? (
										<>
											<S.ProblemSelectModalActions>
												<S.ProblemSelectSelectAll
													type="button"
													onClick={handleSelectAllProblems}
												>
													{getFilteredProblems().length > 0 &&
													getFilteredProblems().every((p) =>
														selectedProblemIds.includes(p.id),
													)
														? "전체 해제"
														: "전체 선택"}
												</S.ProblemSelectSelectAll>
												<S.ProblemSelectSelectedCount>
													{selectedProblemIds.length}개 선택됨
												</S.ProblemSelectSelectedCount>
												<S.ProblemSelectFilterCount>
													총 {getFilteredProblems().length}개 문제
												</S.ProblemSelectFilterCount>
											</S.ProblemSelectModalActions>
											<S.ProblemsList>
												{getPaginatedProblems().map((problem) => {
													const isSelected = selectedProblemIds.includes(
														problem.id,
													);
													const isAlreadyAdded = problems.some(
														(p) => p.id === problem.id,
													);
													return (
														<S.ProblemItem
															key={problem.id}
															$selected={isSelected && !isAlreadyAdded}
															$disabled={isAlreadyAdded}
															onClick={() =>
																!isAlreadyAdded &&
																handleProblemToggle(problem.id)
															}
														>
															<input
																type="checkbox"
																checked={isSelected && !isAlreadyAdded}
																onChange={() =>
																	!isAlreadyAdded &&
																	handleProblemToggle(problem.id)
																}
																onClick={(e) => e.stopPropagation()}
																disabled={isAlreadyAdded}
															/>
															<S.ProblemInfo>
																<div
																	style={{
																		display: "flex",
																		alignItems: "center",
																		gap: "0.75rem",
																		flexWrap: "wrap",
																	}}
																>
																	<S.ProblemIdBadge>
																		#{problem.id}
																	</S.ProblemIdBadge>
																	<S.ProblemTitle>
																		{problem.title}
																	</S.ProblemTitle>
																	{isAlreadyAdded && (
																		<S.AlreadyAddedBadge>
																			이미 추가됨
																		</S.AlreadyAddedBadge>
																	)}
																</div>
																{problem.difficulty && (
																	<S.ProblemDifficulty
																		$color={getDifficultyColor(
																			problem.difficulty,
																		)}
																	>
																		{getDifficultyLabel(problem.difficulty)}
																	</S.ProblemDifficulty>
																)}
															</S.ProblemInfo>
														</S.ProblemItem>
													);
												})}
											</S.ProblemsList>
											{getTotalPages() > 1 && (
												<S.ProblemSelectPagination>
													<S.ProblemSelectPaginationBtn
														type="button"
														onClick={() =>
															setCurrentProblemPage((p) => Math.max(1, p - 1))
														}
														disabled={currentProblemPage === 1}
													>
														이전
													</S.ProblemSelectPaginationBtn>
													<span>
														{currentProblemPage} / {getTotalPages()}
													</span>
													<S.ProblemSelectPaginationBtn
														type="button"
														onClick={() =>
															setCurrentProblemPage((p) =>
																Math.min(getTotalPages(), p + 1),
															)
														}
														disabled={currentProblemPage === getTotalPages()}
													>
														다음
													</S.ProblemSelectPaginationBtn>
												</S.ProblemSelectPagination>
											)}
										</>
									) : (
										<S.NoData>
											<p>
												{problemSearchTerm
													? "검색 결과가 없습니다."
													: "사용 가능한 문제가 없습니다."}
											</p>
										</S.NoData>
									)}
								</S.ModalBody>
								<S.ModalFooter>
									<S.CancelButton
										type="button"
										onClick={() => {
											setShowAddProblemModal(false);
											setProblemSearchTerm("");
											setCurrentProblemPage(1);
										}}
									>
										취소
									</S.CancelButton>
									<S.SubmitButton
										type="button"
										onClick={async () => {
											const newProblemIds = selectedProblemIds.filter(
												(id) => !problems.some((p) => p.id === id),
											);
											if (newProblemIds.length === 0) {
												alert("추가할 문제를 선택해주세요.");
												return;
											}
											try {
												const copiedIds: number[] = [];
												for (const pid of newProblemIds) {
													const res = await APIService.copyProblem(pid);
													copiedIds.push(
														typeof res === "number"
															? res
															: (res as { id: number }).id,
													);
												}
												const currentIds = problems.map((p) => p.id);
												const quizData = {
													title: selectedQuizDetail.title,
													description: selectedQuizDetail.description ?? "",
													startTime:
														selectedQuizDetail.startTime instanceof Date
															? selectedQuizDetail.startTime.toISOString()
															: new Date(
																	selectedQuizDetail.startTime,
																).toISOString(),
													endTime:
														selectedQuizDetail.endTime instanceof Date
															? selectedQuizDetail.endTime.toISOString()
															: new Date(
																	selectedQuizDetail.endTime,
																).toISOString(),
													problemIds: [...currentIds, ...copiedIds],
												};
												await APIService.updateQuiz(
													sectionId,
													quizId,
													quizData,
												);
												setShowAddProblemModal(false);
												setProblemSearchTerm("");
												setCurrentProblemPage(1);
												fetchQuizProblems();
												alert(
													`${newProblemIds.length}개의 문제가 추가되었습니다.`,
												);
											} catch (err) {
												console.error(err);
												alert("문제 추가에 실패했습니다.");
											}
										}}
									>
										추가 (
										{
											selectedProblemIds.filter(
												(id) => !problems.some((p) => p.id === id),
											).length
										}
										개)
									</S.SubmitButton>
								</S.ModalFooter>
							</S.ModalContent>
						</S.ModalOverlay>
					)}
				</S.Container>
			</TutorLayout>
		);
	}

	// List view
	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<LoadingSpinner message="코딩 테스트 목록을 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			<S.Container>
				{currentSection && sectionId && (
					<SectionNavigation
						title="코딩 테스트 관리"
						sectionId={sectionId}
						sectionName={`${currentSection.courseTitle ?? ""}${currentSection.sectionNumber ? ` - ${currentSection.sectionNumber}분반` : ""}`}
						enrollmentCode={currentSection.enrollmentCode ?? null}
						showSearch={true}
						searchTerm={searchTerm}
						onSearchChange={setSearchTerm}
						searchPlaceholder="과제명으로 검색..."
					/>
				)}
				<S.Content>
					<S.PageHeader>
						<S.HeaderLeft>
							<S.PageTitle>코딩 테스트 목록</S.PageTitle>
							<S.QuizCount>
								전체 {quizzes.length}개 / 표시 {filteredQuizzes.length}개
							</S.QuizCount>
						</S.HeaderLeft>
						<S.HeaderRight>
							<S.StatusFilter
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value)}
							>
								<option value="ALL">전체</option>
								<option value="WAITING">대기중</option>
								<option value="ACTIVE">진행중</option>
								<option value="ENDED">종료</option>
							</S.StatusFilter>
							<S.CreateButton type="button" onClick={handleCreateQuiz}>
								+ 새 코딩 테스트 만들기
							</S.CreateButton>
						</S.HeaderRight>
					</S.PageHeader>

					{filteredQuizzes.length === 0 ? (
						<S.EmptyState>
							<p>등록된 코딩 테스트가 없습니다.</p>
						</S.EmptyState>
					) : (
						<S.TableContainer>
							<S.Table>
								<thead>
									<tr>
										<th>제목</th>
										<th>설명</th>
										<th>시작 시간</th>
										<th>종료 시간</th>
										<th>문제 수</th>
										<th>상태</th>
										<th>작업</th>
									</tr>
								</thead>
								<tbody>
									{filteredQuizzes.map((quiz) => (
										<S.ClickableRow
											key={quiz.id}
											onClick={() =>
												navigate(
													`/tutor/coding-tests/section/${sectionId}/${quiz.id}`,
												)
											}
											onKeyDown={(e: React.KeyboardEvent) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													navigate(
														`/tutor/coding-tests/section/${sectionId}/${quiz.id}`,
													);
												}
											}}
											tabIndex={0}
										>
											<td>
												<S.QuizTitle>{quiz.title}</S.QuizTitle>
											</td>
											<td>
												<S.QuizDescription>
													{quiz.description ?? "-"}
												</S.QuizDescription>
											</td>
											<td>{formatDateTime(quiz.startTime)}</td>
											<td>{formatDateTime(quiz.endTime)}</td>
											<td>{quiz.problemCount ?? 0}개</td>
											<td>{getStatusBadge(quiz.status ?? "")}</td>
											<td
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<S.QuizActions>
													<S.EditButton
														type="button"
														onClick={() => handleEditQuiz(quiz)}
													>
														수정
													</S.EditButton>
													<S.DeleteButton
														type="button"
														onClick={() => handleDeleteQuiz(quiz.id)}
													>
														삭제
													</S.DeleteButton>
												</S.QuizActions>
											</td>
										</S.ClickableRow>
									))}
								</tbody>
							</S.Table>
						</S.TableContainer>
					)}
				</S.Content>

				{/* 생성 모달 */}
				{showCreateModal && (
					<S.ModalOverlay
						onClick={() => setShowCreateModal(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setShowCreateModal(false);
						}}
						role="presentation"
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>새 코딩 테스트 만들기</h2>
								<S.ModalClose
									type="button"
									onClick={() => setShowCreateModal(false)}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.FormGroup>
									<label htmlFor="create-quiz-title">제목 *</label>
									<input
										id="create-quiz-title"
										type="text"
										value={formData.title}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												title: e.target.value,
											}))
										}
										placeholder="코딩 테스트 제목을 입력하세요"
									/>
								</S.FormGroup>
								<S.FormGroup>
									<label htmlFor="create-quiz-desc">설명</label>
									<textarea
										id="create-quiz-desc"
										value={formData.description}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="코딩 테스트 설명을 입력하세요"
										rows={4}
									/>
								</S.FormGroup>
								<S.FormRow>
									<S.FormGroup>
										<label htmlFor="create-quiz-start">시작 시간 *</label>
										<input
											id="create-quiz-start"
											type="datetime-local"
											value={formData.startTime}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													startTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
									<S.FormGroup>
										<label htmlFor="create-quiz-end">종료 시간 *</label>
										<input
											id="create-quiz-end"
											type="datetime-local"
											value={formData.endTime}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													endTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
								</S.FormRow>
								<S.FormGroup>
									<span
										id="create-quiz-problems-label"
										style={{
											fontWeight: 500,
											fontSize: "0.875rem",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										문제 선택 *
									</span>
									<S.ProblemSelectSection aria-labelledby="create-quiz-problems-label">
										<S.BtnSelectProblems
											type="button"
											onClick={() => setShowProblemModal(true)}
										>
											문제 선택 ({selectedProblemIds.length}개 선택됨)
										</S.BtnSelectProblems>
										{selectedProblemIds.length > 0 && (
											<S.SelectedCount>
												{selectedProblemIds.length}개의 문제가 선택되었습니다.
											</S.SelectedCount>
										)}
									</S.ProblemSelectSection>
								</S.FormGroup>
								<S.ModalFooter>
									<S.CancelButton
										type="button"
										onClick={() => setShowCreateModal(false)}
									>
										취소
									</S.CancelButton>
									<S.SubmitButton type="button" onClick={handleSubmitCreate}>
										생성
									</S.SubmitButton>
								</S.ModalFooter>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 수정 모달 */}
				{showEditModal && selectedQuiz && (
					<S.ModalOverlay
						onClick={() => {
							setShowEditModal(false);
							setSelectedQuiz(null);
						}}
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>코딩 테스트 수정</h2>
								<S.ModalClose
									type="button"
									onClick={() => {
										setShowEditModal(false);
										setSelectedQuiz(null);
									}}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.FormGroup>
									<label htmlFor="edit-quiz-title">제목 *</label>
									<input
										id="edit-quiz-title"
										type="text"
										value={formData.title}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												title: e.target.value,
											}))
										}
										placeholder="코딩 테스트 제목을 입력하세요"
									/>
								</S.FormGroup>
								<S.FormGroup>
									<label htmlFor="edit-quiz-desc">설명</label>
									<textarea
										id="edit-quiz-desc"
										value={formData.description}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="코딩 테스트 설명을 입력하세요"
										rows={4}
									/>
								</S.FormGroup>
								<S.FormRow>
									<S.FormGroup>
										<label htmlFor="edit-quiz-start">시작 시간 *</label>
										<input
											id="edit-quiz-start"
											type="datetime-local"
											value={formData.startTime}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													startTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
									<S.FormGroup>
										<label htmlFor="edit-quiz-end">종료 시간 *</label>
										<input
											id="edit-quiz-end"
											type="datetime-local"
											value={formData.endTime}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													endTime: e.target.value,
												}))
											}
										/>
									</S.FormGroup>
								</S.FormRow>
								<S.FormGroup>
									<span
										id="edit-quiz-problems-label"
										style={{
											fontWeight: 500,
											fontSize: "0.875rem",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										문제 선택 *
									</span>
									<S.ProblemSelectSection aria-labelledby="edit-quiz-problems-label">
										<S.BtnSelectProblems
											type="button"
											onClick={() => setShowProblemModal(true)}
										>
											문제 선택 ({selectedProblemIds.length}개 선택됨)
										</S.BtnSelectProblems>
										{selectedProblemIds.length > 0 && (
											<S.SelectedCount>
												{selectedProblemIds.length}개의 문제가 선택되었습니다.
											</S.SelectedCount>
										)}
									</S.ProblemSelectSection>
								</S.FormGroup>
								<S.ModalFooter>
									<S.CancelButton
										type="button"
										onClick={() => {
											setShowEditModal(false);
											setSelectedQuiz(null);
										}}
									>
										취소
									</S.CancelButton>
									<S.SubmitButton type="button" onClick={handleSubmitEdit}>
										수정
									</S.SubmitButton>
								</S.ModalFooter>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 문제 선택 모달 (생성/수정용) */}
				{showProblemModal && (
					<S.ModalOverlay
						onClick={() => {
							setShowProblemModal(false);
							setProblemSearchTerm("");
							setCurrentProblemPage(1);
						}}
					>
						<S.ModalContent $large onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 선택</h2>
								<S.ModalClose
									type="button"
									onClick={() => {
										setShowProblemModal(false);
										setProblemSearchTerm("");
										setCurrentProblemPage(1);
									}}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.SearchBox style={{ marginBottom: "1rem" }}>
									<S.SearchInput
										type="text"
										placeholder="문제명 또는 ID로 검색..."
										value={problemSearchTerm}
										onChange={(e) => {
											setProblemSearchTerm(e.target.value);
											setCurrentProblemPage(1);
										}}
									/>
								</S.SearchBox>
								{getFilteredProblems().length > 0 ? (
									<>
										<S.ProblemSelectModalActions>
											<S.ProblemSelectSelectAll
												type="button"
												onClick={handleSelectAllProblems}
											>
												{getFilteredProblems().length > 0 &&
												getFilteredProblems().every((p) =>
													selectedProblemIds.includes(p.id),
												)
													? "전체 해제"
													: "전체 선택"}
											</S.ProblemSelectSelectAll>
											<S.ProblemSelectSelectedCount>
												{selectedProblemIds.length}개 선택됨
											</S.ProblemSelectSelectedCount>
											<S.ProblemSelectFilterCount>
												총 {getFilteredProblems().length}개 문제
											</S.ProblemSelectFilterCount>
										</S.ProblemSelectModalActions>
										<S.ProblemsList>
											{getPaginatedProblems().map((problem) => {
												const isSelected = selectedProblemIds.includes(
													problem.id,
												);
												return (
													<S.ProblemItem
														key={problem.id}
														$selected={isSelected}
														onClick={() => handleProblemToggle(problem.id)}
													>
														<input
															type="checkbox"
															checked={isSelected}
															onChange={() => handleProblemToggle(problem.id)}
															onClick={(e) => e.stopPropagation()}
														/>
														<S.ProblemInfo>
															<div
																style={{
																	display: "flex",
																	alignItems: "center",
																	gap: "0.75rem",
																}}
															>
																<S.ProblemIdBadge>
																	#{problem.id}
																</S.ProblemIdBadge>
																<S.ProblemTitle>{problem.title}</S.ProblemTitle>
															</div>
															{problem.difficulty && (
																<S.ProblemDifficulty
																	$color={getDifficultyColor(
																		problem.difficulty,
																	)}
																>
																	{getDifficultyLabel(problem.difficulty)}
																</S.ProblemDifficulty>
															)}
														</S.ProblemInfo>
													</S.ProblemItem>
												);
											})}
										</S.ProblemsList>
										{getTotalPages() > 1 && (
											<S.ProblemSelectPagination>
												<S.ProblemSelectPaginationBtn
													type="button"
													onClick={() =>
														setCurrentProblemPage((p) => Math.max(1, p - 1))
													}
													disabled={currentProblemPage === 1}
												>
													이전
												</S.ProblemSelectPaginationBtn>
												<span>
													{currentProblemPage} / {getTotalPages()}
												</span>
												<S.ProblemSelectPaginationBtn
													type="button"
													onClick={() =>
														setCurrentProblemPage((p) =>
															Math.min(getTotalPages(), p + 1),
														)
													}
													disabled={currentProblemPage === getTotalPages()}
												>
													다음
												</S.ProblemSelectPaginationBtn>
											</S.ProblemSelectPagination>
										)}
									</>
								) : (
									<S.NoData>
										<p>
											{problemSearchTerm
												? "검색 결과가 없습니다."
												: "사용 가능한 문제가 없습니다."}
										</p>
									</S.NoData>
								)}
							</S.ModalBody>
							<S.ModalFooter>
								<S.CancelButton
									type="button"
									onClick={() => {
										setShowProblemModal(false);
										setProblemSearchTerm("");
										setCurrentProblemPage(1);
									}}
								>
									닫기
								</S.CancelButton>
								<S.SubmitButton
									type="button"
									onClick={() => setShowProblemModal(false)}
								>
									확인 ({selectedProblemIds.length}개 선택됨)
								</S.SubmitButton>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
};

export default CodingTestManagement;
