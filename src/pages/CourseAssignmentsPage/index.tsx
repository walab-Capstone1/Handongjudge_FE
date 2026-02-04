import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, sidebarCollapsedState } from "../../recoil/atoms";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import APIService from "../../services/APIService";
import * as S from "./styles";
import type { Assignment, SectionInfo } from "./types";

const CourseAssignmentsPage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const auth = useRecoilValue(authState);

	const [activeMenu, setActiveMenu] = useState("과제");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);

	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [expandedAssignmentIds, setExpandedAssignmentIds] = useState<number[]>(
		[],
	);

	useEffect(() => {
		if (sectionId && auth.user) {
			fetchAssignmentsData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sectionId, auth.user]);

	useEffect(() => {
		const assignmentId = searchParams.get("assignmentId");
		if (assignmentId && assignments.length > 0) {
			const assignmentIdNum = Number.parseInt(assignmentId, 10);
			if (!expandedAssignmentIds.includes(assignmentIdNum)) {
				setExpandedAssignmentIds((prev) => [...prev, assignmentIdNum]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, assignments]);

	const fetchAssignmentsData = async () => {
		if (!sectionId) return;

		try {
			setLoading(true);
			setError(null);

			const sectionResponse = await APIService.getSectionInfo(sectionId);
			const sectionData = sectionResponse.data || sectionResponse;
			setSectionInfo(sectionData);

			const assignmentsResponse =
				await APIService.getAssignmentsBySection(sectionId);
			const assignmentsList = assignmentsResponse.data || assignmentsResponse;

			const assignmentsWithProgress = await Promise.all(
				assignmentsList.map(async (assignment: any) => {
					try {
						const problemsResponse = await APIService.getAssignmentProblems(
							sectionId,
							assignment.id,
						);
						const problemsList = problemsResponse.data || problemsResponse;

						let problemsStatus: any[] = [];
						try {
							const statusResponse =
								await APIService.getStudentAssignmentProblemsStatus(
									auth.user.id,
									sectionId,
									assignment.id,
								);
							problemsStatus = statusResponse.data || statusResponse;
						} catch (statusErr) {
							console.warn(`과제 ${assignment.id} 상태 조회 실패:`, statusErr);
						}

						const problems = problemsList.map((problem: any) => {
							const status = problemsStatus.find(
								(s: any) => s.problemId === problem.id,
							);
							const isSubmitted =
								status &&
								(status.status === "SUBMITTED" ||
									status.status === "COMPLETED");
							return {
								id: problem.id,
								title: problem.title,
								description: problem.description,
								submitted: isSubmitted,
								status: status ? status.status : "NOT_SUBMITTED",
							};
						});

						const totalProblems = problems.length;
						const submittedProblems = problems.filter(
							(p: any) => p.submitted,
						).length;
						const progress =
							totalProblems > 0
								? Math.round((submittedProblems / totalProblems) * 100)
								: 0;
						const dDay = calculateDDay(assignment.endDate);

						return {
							...assignment,
							progress,
							dDay,
							totalProblems,
							submittedProblems,
							problems,
						};
					} catch (err) {
						console.error(`과제 ${assignment.id} 정보 조회 실패:`, err);
						return {
							...assignment,
							progress: 0,
							dDay: calculateDDay(assignment.endDate),
							totalProblems: 0,
							submittedProblems: 0,
							problems: [],
						};
					}
				}),
			);

			setAssignments(assignmentsWithProgress);
		} catch (err: any) {
			console.error("과제 데이터 조회 실패:", err);
			setError(err.message || "데이터를 불러오는데 실패했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const toggleAssignment = (assignmentId: number) => {
		if (expandedAssignmentIds.includes(assignmentId)) {
			setExpandedAssignmentIds(
				expandedAssignmentIds.filter((id) => id !== assignmentId),
			);
		} else {
			setExpandedAssignmentIds([...expandedAssignmentIds, assignmentId]);
		}
	};

	const calculateDDay = (endDate: string): number | null => {
		if (!endDate) return null;
		const now = new Date();
		const end = new Date(endDate);
		const diffTime = end.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	const formatDate = (dateString: string): string => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}.${month}.${day}`;
	};

	const handleMenuClick = (menuId: string) => {
		switch (menuId) {
			case "dashboard":
				navigate(`/sections/${sectionId}/dashboard`);
				break;
			case "assignment":
				break;
			case "notice":
				navigate(`/sections/${sectionId}/course-notices`);
				break;
			case "notification":
				break;
			default:
				break;
		}
	};

	const handleProblemClick = (assignmentId: number, problemId: number) => {
		navigate(
			`/sections/${sectionId}/assignments/${assignmentId}/detail/problems/${problemId}`,
		);
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	if (loading) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu={activeMenu}
					onMenuClick={handleMenuClick}
					isCollapsed={isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (error) {
		return (
			<S.Container $isCollapsed={isSidebarCollapsed}>
				<CourseSidebar
					sectionId={sectionId}
					activeMenu={activeMenu}
					onMenuClick={handleMenuClick}
					isCollapsed={isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={isSidebarCollapsed}>
					<S.ErrorMessage>
						<p>{error}</p>
						<button onClick={fetchAssignmentsData}>다시 시도</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu={activeMenu}
				onMenuClick={handleMenuClick}
				isCollapsed={isSidebarCollapsed}
			/>

			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle
							? sectionInfo.courseTitle
							: sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>

				<S.AssignmentsBody>
					<S.AssignmentsHeader>
						<S.AssignmentsTitle>과제</S.AssignmentsTitle>
						<S.AssignmentsSummary>
							과제 {assignments.length} · 문제{" "}
							{assignments.reduce((sum, a) => sum + a.totalProblems, 0)}
						</S.AssignmentsSummary>
					</S.AssignmentsHeader>

					<S.AssignmentsAccordion>
						{assignments.length > 0 ? (
							assignments.map((assignment, index) => (
								<S.AccordionItem key={assignment.id}>
									<S.AccordionHeader
										$expanded={expandedAssignmentIds.includes(assignment.id)}
										onClick={() => toggleAssignment(assignment.id)}
									>
										<S.AccordionHeaderLeft>
											<S.AccordionArrow>
												{expandedAssignmentIds.includes(assignment.id)
													? "▼"
													: "▶"}
											</S.AccordionArrow>
											<S.AccordionNumber>
												{String(index + 1).padStart(2, "0")}
											</S.AccordionNumber>
											<S.AccordionTitle>{assignment.title}</S.AccordionTitle>
											{assignment.dDay !== null && (
												<S.AccordionDDay $expired={assignment.dDay < 0}>
													{assignment.dDay < 0
														? `D+${Math.abs(assignment.dDay)}`
														: `D-${assignment.dDay}`}
												</S.AccordionDDay>
											)}
										</S.AccordionHeaderLeft>
										<S.AccordionHeaderRight>
											<S.AccordionDeadline>
												[마감일 | {formatDate(assignment.endDate)} 23:59 까지
												제출]
											</S.AccordionDeadline>
											<S.ProgressInfo>
												<S.MiniProgressBar>
													<S.MiniProgressFill $progress={assignment.progress} />
												</S.MiniProgressBar>
												<S.AccordionProgress>
													{assignment.submittedProblems}/
													{assignment.totalProblems}
												</S.AccordionProgress>
											</S.ProgressInfo>
										</S.AccordionHeaderRight>
									</S.AccordionHeader>

									{expandedAssignmentIds.includes(assignment.id) && (
										<S.AccordionContent>
											<S.AccordionDescription>
												<p>
													{assignment.description ||
														`${assignment.title}을 시작합니다.`}
												</p>
											</S.AccordionDescription>

											<S.AccordionProblemsSection>
												<S.ProblemsSubtitle>문제</S.ProblemsSubtitle>
												{assignment.problems &&
												assignment.problems.length > 0 ? (
													<S.AccordionProblemsList>
														{assignment.problems.map((problem) => (
															<S.AccordionProblemItem
																key={problem.id}
																onClick={() =>
																	handleProblemClick(assignment.id, problem.id)
																}
															>
																<S.ProblemTitle>{problem.title}</S.ProblemTitle>
																<S.ProblemBadge $submitted={problem.submitted}>
																	{problem.submitted ? "제출" : "미제출"}
																</S.ProblemBadge>
															</S.AccordionProblemItem>
														))}
													</S.AccordionProblemsList>
												) : (
													<S.NoProblemsMessage>
														<p>등록된 문제가 없습니다.</p>
													</S.NoProblemsMessage>
												)}
											</S.AccordionProblemsSection>
										</S.AccordionContent>
									)}
								</S.AccordionItem>
							))
						) : (
							<S.NoAssignmentsMessage>
								<p>등록된 과제가 없습니다.</p>
							</S.NoAssignmentsMessage>
						)}
					</S.AssignmentsAccordion>
				</S.AssignmentsBody>
			</S.Content>
		</S.Container>
	);
};

export default CourseAssignmentsPage;
