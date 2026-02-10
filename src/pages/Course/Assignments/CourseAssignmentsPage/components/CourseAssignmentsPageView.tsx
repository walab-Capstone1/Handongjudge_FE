import CourseSidebar from "../../../../../components/Course/CourseSidebar";
import CourseHeader from "../../../../../components/Course/CourseHeader";
import LoadingSpinner from "../../../../../components/UI/LoadingSpinner";
import type { CourseAssignmentsPageHookReturn } from "../hooks/useCourseAssignmentsPage";
import * as S from "../styles";

export default function CourseAssignmentsPageView(
	d: CourseAssignmentsPageHookReturn,
) {
	if (d.loading) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu={d.activeMenu}
					onMenuClick={d.handleMenuClick}
					isCollapsed={d.isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<LoadingSpinner />
				</S.Content>
			</S.Container>
		);
	}

	if (d.error) {
		return (
			<S.Container $isCollapsed={d.isSidebarCollapsed}>
				<CourseSidebar
					sectionId={d.sectionId}
					activeMenu={d.activeMenu}
					onMenuClick={d.handleMenuClick}
					isCollapsed={d.isSidebarCollapsed}
				/>
				<S.Content $isCollapsed={d.isSidebarCollapsed}>
					<S.ErrorMessage>
						<p>{d.error}</p>
						<button onClick={d.fetchAssignmentsData}>다시 시도</button>
					</S.ErrorMessage>
				</S.Content>
			</S.Container>
		);
	}

	return (
		<S.Container $isCollapsed={d.isSidebarCollapsed}>
			<CourseSidebar
				sectionId={d.sectionId}
				activeMenu={d.activeMenu}
				onMenuClick={d.handleMenuClick}
				isCollapsed={d.isSidebarCollapsed}
			/>

			<S.Content $isCollapsed={d.isSidebarCollapsed}>
				<CourseHeader
					courseName={
						d.sectionInfo?.courseTitle
							? d.sectionInfo.courseTitle
							: d.sectionInfo?.courseName || "강의"
					}
					onToggleSidebar={d.handleToggleSidebar}
					isSidebarCollapsed={d.isSidebarCollapsed}
				/>

				<S.AssignmentsBody>
					<S.AssignmentsHeader>
						<S.AssignmentsTitle>과제</S.AssignmentsTitle>
						<S.AssignmentsSummary>
							과제 {d.assignments.length} · 문제{" "}
							{d.assignments.reduce((sum, a) => sum + a.totalProblems, 0)}
						</S.AssignmentsSummary>
					</S.AssignmentsHeader>

					<S.AssignmentsAccordion>
						{d.assignments.length > 0 ? (
							d.assignments.map((assignment, index) => (
								<S.AccordionItem 
									key={assignment.id}
									$inactive={d.isManager && assignment.active === false}
								>
									<S.AccordionHeader
										$expanded={d.expandedAssignmentIds.includes(assignment.id)}
										$inactive={d.isManager && assignment.active === false}
										onClick={() => d.toggleAssignment(assignment.id)}
									>
										<S.AccordionHeaderLeft>
											<S.AccordionArrow>
												{d.expandedAssignmentIds.includes(assignment.id)
													? "▼"
													: "▶"}
											</S.AccordionArrow>
											<S.AccordionNumber>
												{String(index + 1).padStart(2, "0")}
											</S.AccordionNumber>
											<S.AccordionTitle>{assignment.title}</S.AccordionTitle>
											{d.isManager && assignment.active === false && (
												<S.InactiveBadge>비활성화</S.InactiveBadge>
											)}
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
												[마감일 | {d.formatDate(assignment.endDate)} 23:59 까지
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

									{d.expandedAssignmentIds.includes(assignment.id) && (
										<S.AccordionContent>
											<S.AccordionDescription>
												<p>
													{assignment.description ||
														`${assignment.title}을 시작합니다.`}
												</p>
											</S.AccordionDescription>

											<S.AccordionProblemsSection>
												<S.ProblemsSubtitle>문제</S.ProblemsSubtitle>
												{assignment.problems && assignment.problems.length > 0 ? (
													<S.AccordionProblemsList>
														{assignment.problems.map((problem) => (
															<S.AccordionProblemItem
																key={problem.id}
																onClick={() =>
																	d.handleProblemClick(assignment.id, problem.id)
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
}
