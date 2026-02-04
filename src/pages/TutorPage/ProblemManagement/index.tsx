import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import ReactMarkdown from "react-markdown";
import Alert from "../../../components/Alert";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import * as S from "./styles";

interface Problem {
	id: number;
	title: string;
	description?: string;
	timeLimit?: number;
	memoryLimit?: number;
	difficulty?: string;
	createdAt?: string;
	isUsed?: boolean;
	assignmentCount?: number;
	tags?: string[] | string;
}

interface Section {
	sectionId: number;
	courseTitle: string;
	year: number;
	semester: string;
	sectionNumber?: string;
}

interface Assignment {
	id: number;
	title: string;
	assignmentNumber?: string;
}

interface ProblemUsage {
	assignments?: Array<{
		assignmentId: number;
		sectionId: number;
		courseTitle: string;
		year: number;
		semester: string;
		sectionNumber?: string;
		assignmentTitle: string;
		assignmentNumber?: string;
		assignmentStartDate: string;
		assignmentEndDate: string;
	}>;
	problemSets?: Array<{
		problemSetId: number;
		problemSetTitle: string;
		description?: string;
		createdAt: string;
	}>;
	quizzes?: Array<{
		quizId: number;
		sectionId: number;
		courseTitle: string;
		year: number;
		semester: string;
		sectionNumber?: string;
		quizTitle: string;
		startTime: string;
		endTime: string;
	}>;
}

const ProblemManagement: React.FC = () => {
	const navigate = useNavigate();
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
	const [showProblemModal, setShowProblemModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [problemToDelete, setProblemToDelete] = useState<Problem | null>(null);
	const [showCopyModal, setShowCopyModal] = useState(false);
	const [problemToCopy, setProblemToCopy] = useState<Problem | null>(null);
	const [copyTitle, setCopyTitle] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [alertType, setAlertType] = useState<"success" | "error">("success");
	const [showUsageModal, setShowUsageModal] = useState(false);
	const [problemUsage, setProblemUsage] = useState<ProblemUsage>({
		assignments: [],
		problemSets: [],
		quizzes: [],
	});
	const [loadingUsage, setLoadingUsage] = useState(false);
	const [problemForUsage, setProblemForUsage] = useState<Problem | null>(null);
	const [filterUsageStatus, setFilterUsageStatus] = useState("ALL");
	const [filterDifficulty, setFilterDifficulty] = useState("ALL");
	const [filterCourse, setFilterCourse] = useState("ALL");
	const [filterAssignment, setFilterAssignment] = useState("ALL");
	const [filterTag, setFilterTag] = useState("ALL");
	const [sections, setSections] = useState<Section[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [problemUsageMap, setProblemUsageMap] = useState<
		Record<number, any[]>
	>({});
	const [loadingUsageData, setLoadingUsageData] = useState(false);
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [openMoreMenu, setOpenMoreMenu] = useState<number | null>(null);

	useEffect(() => {
		fetchProblems();
		fetchSections();
	}, []);

	useEffect(() => {
		if (filterUsageStatus === "USED" && problems.length > 0) {
			fetchProblemUsageData();
		} else {
			setProblemUsageMap({});
		}
	}, [filterUsageStatus, problems.length]);

	useEffect(() => {
		if (filterCourse !== "ALL") {
			fetchAssignmentsForSection(filterCourse);
		} else {
			setAssignments([]);
			setFilterAssignment("ALL");
		}
	}, [filterCourse]);

	const fetchProblems = async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllProblems();

			let problemsData: Problem[] = [];
			if (Array.isArray(response)) {
				problemsData = response;
			} else if (response?.data && Array.isArray(response.data)) {
				problemsData = response.data;
			} else if (response?.data && !Array.isArray(response.data)) {
				problemsData = [response.data];
			} else if (response && typeof response === "object") {
				problemsData = Object.values(response);
			}

			setProblems(problemsData);

			const allTags = new Set<string>();
			problemsData.forEach((problem) => {
				if (problem.tags) {
					if (Array.isArray(problem.tags)) {
						problem.tags.forEach((tag) => {
							if (tag && tag.trim()) {
								allTags.add(tag.trim());
							}
						});
					} else if (typeof problem.tags === "string") {
						try {
							const parsedTags = JSON.parse(problem.tags);
							if (Array.isArray(parsedTags)) {
								parsedTags.forEach((tag: string) => {
									if (tag && tag.trim()) {
										allTags.add(tag.trim());
									}
								});
							} else if (parsedTags && parsedTags.trim()) {
								allTags.add(parsedTags.trim());
							}
						} catch (e) {
							if (problem.tags.trim()) {
								allTags.add(problem.tags.trim());
							}
						}
					}
				}
			});
			setAvailableTags(Array.from(allTags).sort());
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
			setProblems([]);
			setAvailableTags([]);
		} finally {
			setLoading(false);
		}
	};

	const fetchSections = async () => {
		try {
			const response = await APIService.getInstructorDashboard();
			const sectionsData = response?.data || response || [];
			setSections(Array.isArray(sectionsData) ? sectionsData : []);
		} catch (error) {
			console.error("수업 목록 조회 실패:", error);
			setSections([]);
		}
	};

	const fetchAssignmentsForSection = async (sectionId: string) => {
		try {
			const response = await APIService.getAssignmentsBySection(
				Number.parseInt(sectionId),
			);
			const assignmentsData = response?.data || response || [];
			setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
		} catch (error) {
			console.error("과제 목록 조회 실패:", error);
			setAssignments([]);
		}
	};

	const fetchProblemUsageData = async () => {
		if (problems.length === 0) return;

		try {
			setLoadingUsageData(true);
			const usageMap: Record<number, any[]> = {};

			const usedProblems = problems.filter((p) => p.isUsed === true);

			await Promise.all(
				usedProblems.map(async (problem) => {
					try {
						const response = await APIService.getProblemAssignments(problem.id);
						const assignments = Array.isArray(response)
							? response
							: response?.data || [];
						usageMap[problem.id] = assignments;
					} catch (error) {
						console.error(`문제 ${problem.id} 사용 현황 조회 실패:`, error);
						usageMap[problem.id] = [];
					}
				}),
			);

			setProblemUsageMap(usageMap);
		} catch (error) {
			console.error("문제 사용 현황 조회 실패:", error);
			setProblemUsageMap({});
		} finally {
			setLoadingUsageData(false);
		}
	};

	const getProblemTags = (problem: Problem): string[] => {
		if (!problem.tags) return [];

		if (Array.isArray(problem.tags)) {
			return problem.tags
				.map((tag) => tag && tag.trim())
				.filter((tag): tag is string => Boolean(tag));
		}

		if (typeof problem.tags === "string") {
			try {
				const parsedTags = JSON.parse(problem.tags);
				if (Array.isArray(parsedTags)) {
					return parsedTags
						.map((tag: string) => tag && tag.trim())
						.filter((tag): tag is string => Boolean(tag));
				}
				if (parsedTags && parsedTags.trim()) {
					return [parsedTags.trim()];
				}
			} catch (e) {
				if (problem.tags.trim()) {
					return [problem.tags.trim()];
				}
			}
		}

		return [];
	};

	const filteredProblems = problems.filter((problem) => {
		const matchesSearch = problem.title
			?.toLowerCase()
			.includes(searchTerm.toLowerCase());

		let matchesUsage = true;
		if (filterUsageStatus === "USED") {
			matchesUsage = problem.isUsed === true;
		} else if (filterUsageStatus === "UNUSED") {
			matchesUsage = !problem.isUsed;
		}

		let matchesDifficulty = true;
		if (filterDifficulty !== "ALL") {
			matchesDifficulty = problem.difficulty === filterDifficulty;
		}

		let matchesTag = true;
		if (filterTag !== "ALL") {
			const problemTags = getProblemTags(problem);
			matchesTag = problemTags.includes(filterTag);
		}

		let matchesCourseAndAssignment = true;
		if (filterUsageStatus === "USED" && problem.isUsed === true) {
			const usageList = problemUsageMap[problem.id] || [];

			if (filterCourse !== "ALL" || filterAssignment !== "ALL") {
				matchesCourseAndAssignment = usageList.some((usage: any) => {
					const matchesCourse =
						filterCourse === "ALL" ||
						usage.sectionId === Number.parseInt(filterCourse);
					const matchesAssignment =
						filterAssignment === "ALL" ||
						usage.assignmentId === Number.parseInt(filterAssignment);
					return matchesCourse && matchesAssignment;
				});
			}
		}

		return (
			matchesSearch &&
			matchesUsage &&
			matchesDifficulty &&
			matchesTag &&
			matchesCourseAndAssignment
		);
	});

	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

	const handleDeleteClick = (problem: Problem) => {
		setProblemToDelete(problem);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (!problemToDelete) return;

		try {
			setIsDeleting(true);
			await APIService.deleteProblem(problemToDelete.id);
			setAlertMessage("문제가 성공적으로 삭제되었습니다.");
			setAlertType("success");
			setShowDeleteModal(false);
			setProblemToDelete(null);
			fetchProblems();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error: any) {
			console.error("문제 삭제 실패:", error);
			setAlertMessage(
				"문제 삭제에 실패했습니다. " + (error.message || ""),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleCopyClick = (problem: Problem) => {
		setProblemToCopy(problem);
		setCopyTitle(`${problem.title} (복사본)`);
		setShowCopyModal(true);
	};

	const handleCopyConfirm = async () => {
		if (!problemToCopy) return;

		try {
			setIsCopying(true);
			await APIService.copyProblem(problemToCopy.id, copyTitle);
			setAlertMessage("문제가 성공적으로 복사되었습니다.");
			setAlertType("success");
			setShowCopyModal(false);
			setProblemToCopy(null);
			setCopyTitle("");
			fetchProblems();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error: any) {
			console.error("문제 복사 실패:", error);
			setAlertMessage(
				"문제 복사에 실패했습니다. " + (error.message || ""),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsCopying(false);
		}
	};

	const handleUsageClick = async (problem: Problem) => {
		setProblemForUsage(problem);
		setShowUsageModal(true);
		setLoadingUsage(true);
		setProblemUsage({ assignments: [], problemSets: [], quizzes: [] });

		try {
			const response = await APIService.getProblemUsage(problem.id);
			const usage = response?.data || response || {};
			setProblemUsage(usage);
		} catch (error: any) {
			console.error("문제 사용 현황 조회 실패:", error);
			setAlertMessage(
				"문제 사용 현황 조회에 실패했습니다. " + (error.message || ""),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
			setProblemUsage({ assignments: [], problemSets: [], quizzes: [] });
		} finally {
			setLoadingUsage(false);
		}
	};

	const formatDateTime = (dateString?: string) => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<TutorLayout>
				<LoadingSpinner message="문제 목록을 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout>
			<S.Container>
				{alertMessage && (
					<Alert
						type={alertType}
						message={alertMessage}
						onClose={() => setAlertMessage(null)}
					/>
				)}

				<S.TitleHeader>
					<S.TitleLeft>
						<S.Title>문제 관리</S.Title>
						<S.TitleStats>
							<S.StatBadge>총 {problems.length}개 문제</S.StatBadge>
						</S.TitleStats>
					</S.TitleLeft>
					<S.TitleRight>
						<S.CreateButton onClick={() => navigate("/tutor/problems/create")}>
							+ 새 문제 만들기
						</S.CreateButton>
					</S.TitleRight>
				</S.TitleHeader>

				<S.FiltersSection>
					<S.SearchBox>
						<S.SearchInput
							type="text"
							placeholder="문제명으로 검색..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</S.SearchBox>
					<S.FilterGroup>
						<S.FilterSelect
							id="filter-usage"
							value={filterUsageStatus}
							onChange={(e) => {
								setFilterUsageStatus(e.target.value);
								if (e.target.value !== "USED") {
									setFilterCourse("ALL");
									setFilterAssignment("ALL");
								}
							}}
						>
							<option value="ALL">전체 사용 여부</option>
							<option value="USED">사용 중</option>
							<option value="UNUSED">미사용</option>
						</S.FilterSelect>
					</S.FilterGroup>
					{filterUsageStatus === "USED" && (
						<>
							<S.FilterGroup>
								<S.FilterSelect
									id="filter-course"
									value={filterCourse}
									onChange={(e) => {
										setFilterCourse(e.target.value);
										setFilterAssignment("ALL");
									}}
									disabled={loadingUsageData}
								>
									<option value="ALL">전체 수업</option>
									{sections.map((section) => (
										<option key={section.sectionId} value={section.sectionId}>
											{section.courseTitle} ({section.year}년{" "}
											{section.semester === "SPRING"
												? "1학기"
												: section.semester === "SUMMER"
													? "여름학기"
													: section.semester === "FALL"
														? "2학기"
														: "겨울학기"}
											{section.sectionNumber
												? ` - ${section.sectionNumber}분반`
												: ""}
											)
										</option>
									))}
								</S.FilterSelect>
							</S.FilterGroup>
							{filterCourse !== "ALL" && (
								<S.FilterGroup>
									<S.FilterSelect
										id="filter-assignment"
										value={filterAssignment}
										onChange={(e) => setFilterAssignment(e.target.value)}
										disabled={loadingUsageData}
									>
										<option value="ALL">전체 과제</option>
										{assignments.map((assignment) => (
											<option key={assignment.id} value={assignment.id}>
												{assignment.assignmentNumber &&
													`${assignment.assignmentNumber}. `}
												{assignment.title}
											</option>
										))}
									</S.FilterSelect>
								</S.FilterGroup>
							)}
						</>
					)}
					<S.FilterGroup>
						<S.FilterSelect
							id="filter-difficulty"
							value={filterDifficulty}
							onChange={(e) => setFilterDifficulty(e.target.value)}
						>
							<option value="ALL">전체 난이도</option>
							<option value="1">1 (쉬움)</option>
							<option value="2">2 (보통)</option>
							<option value="3">3 (어려움)</option>
							<option value="4">4 (매우 어려움)</option>
							<option value="5">5 (극도 어려움)</option>
						</S.FilterSelect>
					</S.FilterGroup>
					{availableTags.length > 0 && (
						<S.FilterGroup>
							<S.FilterSelect
								id="filter-tag"
								value={filterTag}
								onChange={(e) => setFilterTag(e.target.value)}
							>
								<option value="ALL">전체 태그</option>
								{availableTags.map((tag) => (
									<option key={tag} value={tag}>
										{tag}
									</option>
								))}
							</S.FilterSelect>
						</S.FilterGroup>
					)}
				</S.FiltersSection>

				<S.ResponsiveWrapper>
					<S.TableContainer>
						{filteredProblems.length > 0 ? (
							<S.Table>
								<thead>
									<tr>
										<th className="id-cell">ID</th>
										<th className="title-cell">문제 제목</th>
										<th className="meta-cell">시간 제한</th>
										<th className="meta-cell">메모리 제한</th>
										<th className="meta-cell">생성일</th>
										<th className="actions-cell">관리</th>
									</tr>
								</thead>
								<tbody>
									{filteredProblems.map((problem) => (
										<tr key={problem.id}>
											<S.IdCell>
												<S.IdText>#{problem.id}</S.IdText>
											</S.IdCell>
											<S.TitleCell>
												<S.TitleWrapper>
													<S.TitleContent>
														<S.TitleRow>
															<S.TitleText
																$clickable
																onClick={() => {
																	setSelectedProblem(problem);
																	setShowProblemModal(true);
																}}
															>
																{problem.title}
															</S.TitleText>
															{problem.isUsed && (
																<S.UsageBadge
																	title={`${problem.assignmentCount || 0}개 과제에서 사용 중`}
																>
																	사용 중
																	{problem.assignmentCount && problem.assignmentCount > 0 && (
																		<S.UsageCount>
																			{" "}
																			({problem.assignmentCount})
																		</S.UsageCount>
																	)}
																</S.UsageBadge>
															)}
														</S.TitleRow>
														{getProblemTags(problem).length > 0 && (
															<S.Tags>
																{getProblemTags(problem).map((tag, idx) => (
																	<S.Tag key={idx}>{tag}</S.Tag>
																))}
															</S.Tags>
														)}
													</S.TitleContent>
												</S.TitleWrapper>
											</S.TitleCell>
											<S.MetaCell>
												{problem.timeLimit ? `${problem.timeLimit}초` : "-"}
											</S.MetaCell>
											<S.MetaCell>
												{problem.memoryLimit
													? `${problem.memoryLimit}MB`
													: "-"}
											</S.MetaCell>
											<S.MetaCell>{formatDate(problem.createdAt)}</S.MetaCell>
											<S.ActionsCell>
												<S.ActionsInline>
													<S.PrimaryActions>
														<S.TableActionButton
															$edit
															onClick={() =>
																navigate(`/tutor/problems/${problem.id}/edit`)
															}
														>
															수정
														</S.TableActionButton>
														<S.TableActionButton
															$secondary
															onClick={() => handleCopyClick(problem)}
														>
															복사
														</S.TableActionButton>
														{problem.isUsed && (
															<S.TableActionButton
																$secondary
																onClick={() => handleUsageClick(problem)}
																title="사용 현황 보기"
															>
																사용 현황
															</S.TableActionButton>
														)}
													</S.PrimaryActions>
													<S.SecondaryActions>
														<S.SecondaryActionsLayer>
															<S.MoreMenu>
																<S.TableActionButton
																	$secondary
																	$delete
																	onClick={(e) => {
																		e.stopPropagation();
																		setOpenMoreMenu(
																			openMoreMenu === problem.id
																				? null
																				: problem.id,
																		);
																	}}
																	title="더보기"
																>
																	⋯
																</S.TableActionButton>
																{openMoreMenu === problem.id && (
																	<S.MoreDropdown>
																		<S.MoreMenuItem
																			$delete
																			onClick={(e) => {
																				e.stopPropagation();
																				handleDeleteClick(problem);
																				setOpenMoreMenu(null);
																			}}
																		>
																			삭제
																		</S.MoreMenuItem>
																	</S.MoreDropdown>
																)}
															</S.MoreMenu>
														</S.SecondaryActionsLayer>
													</S.SecondaryActions>
												</S.ActionsInline>
											</S.ActionsCell>
										</tr>
									))}
								</tbody>
							</S.Table>
						) : (
							<EmptyState
								title="등록된 문제가 없습니다"
								message="새로운 문제를 만들어보세요"
								actionLabel="새 문제 만들기"
								onAction={() => navigate("/tutor/problems/create")}
							/>
						)}
					</S.TableContainer>
				</S.ResponsiveWrapper>

				{/* 문제 설명 모달 */}
				{showProblemModal && selectedProblem && (
					<S.ModalOverlay
						onClick={() => {
							setShowProblemModal(false);
							setSelectedProblem(null);
						}}
					>
						<S.ModalContent
							$large
							onClick={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2>{selectedProblem.title}</h2>
								<S.ModalClose
									onClick={() => {
										setShowProblemModal(false);
										setSelectedProblem(null);
									}}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.DescriptionContent>
									{getProblemTags(selectedProblem).length > 0 && (
										<S.TagsInModal>
											{getProblemTags(selectedProblem).map((tag, idx) => (
												<S.TagInModal key={idx}>{tag}</S.TagInModal>
											))}
										</S.TagsInModal>
									)}
									<ReactMarkdown
										components={{
											h1: ({ node, ...props }: any) => (
												<h1 className="problem-description-h1" {...props} />
											),
											h2: ({ node, ...props }: any) => (
												<h2 className="problem-description-h2" {...props} />
											),
											h3: ({ node, ...props }: any) => (
												<h3 className="problem-description-h3" {...props} />
											),
											code: ({ node, className, children, ...props }: any) => {
												const inline = !className;
												return inline ? (
													<code
														className="problem-description-inline-code"
														{...props}
													>
														{children}
													</code>
												) : (
													<pre className="problem-description-code-block">
														<code {...props}>{children}</code>
													</pre>
												);
											},
											p: ({ node, ...props }: any) => (
												<p className="problem-description-paragraph" {...props} />
											),
										}}
									>
										{selectedProblem.description || "*문제 설명이 없습니다.*"}
									</ReactMarkdown>
								</S.DescriptionContent>
							</S.ModalBody>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 삭제 확인 모달 */}
				{showDeleteModal && problemToDelete && (
					<S.ModalOverlay
						onClick={() => {
							if (!isDeleting) {
								setShowDeleteModal(false);
								setProblemToDelete(null);
							}
						}}
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 삭제 확인</h2>
								<S.ModalClose
									onClick={() => {
										if (!isDeleting) {
											setShowDeleteModal(false);
											setProblemToDelete(null);
										}
									}}
									disabled={isDeleting}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<p>정말로 다음 문제를 삭제하시겠습니까?</p>
								<S.BoldText>{problemToDelete.title}</S.BoldText>
								<S.WarningText>⚠️ 이 작업은 되돌릴 수 없습니다.</S.WarningText>
							</S.ModalBody>
							<S.ModalFooter>
								<S.BtnCancel
									onClick={() => {
										setShowDeleteModal(false);
										setProblemToDelete(null);
									}}
									disabled={isDeleting}
								>
									취소
								</S.BtnCancel>
								<S.BtnDanger onClick={handleDeleteConfirm} disabled={isDeleting}>
									{isDeleting ? "삭제 중..." : "삭제"}
								</S.BtnDanger>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 복사 모달 */}
				{showCopyModal && problemToCopy && (
					<S.ModalOverlay
						onClick={() => {
							if (!isCopying) {
								setShowCopyModal(false);
								setProblemToCopy(null);
								setCopyTitle("");
							}
						}}
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 복사</h2>
								<S.ModalClose
									onClick={() => {
										if (!isCopying) {
											setShowCopyModal(false);
											setProblemToCopy(null);
											setCopyTitle("");
										}
									}}
									disabled={isCopying}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<p>다음 문제를 복사합니다:</p>
								<S.CopyPrompt>{problemToCopy.title}</S.CopyPrompt>
								<S.FormGroup>
									<label htmlFor="copy-title">새 문제 제목</label>
									<S.FormInput
										id="copy-title"
										type="text"
										value={copyTitle}
										onChange={(e) => setCopyTitle(e.target.value)}
										placeholder="복사본 문제 제목을 입력하세요"
										disabled={isCopying}
									/>
								</S.FormGroup>
							</S.ModalBody>
							<S.ModalFooter>
								<S.BtnCancel
									onClick={() => {
										setShowCopyModal(false);
										setProblemToCopy(null);
										setCopyTitle("");
									}}
									disabled={isCopying}
								>
									취소
								</S.BtnCancel>
								<S.BtnSubmit
									onClick={handleCopyConfirm}
									disabled={isCopying || !copyTitle.trim()}
								>
									{isCopying ? "복사 중..." : "복사"}
								</S.BtnSubmit>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}

				{/* 사용 현황 모달 */}
				{showUsageModal && problemForUsage && (
					<S.ModalOverlay
						onClick={() => {
							if (!loadingUsage) {
								setShowUsageModal(false);
								setProblemForUsage(null);
								setProblemUsage({
									assignments: [],
									problemSets: [],
									quizzes: [],
								});
							}
						}}
					>
						<S.ModalContent
							$large
							onClick={(e) => e.stopPropagation()}
						>
							<S.ModalHeader>
								<h2>문제 사용 현황</h2>
								<S.ModalClose
									onClick={() => {
										if (!loadingUsage) {
											setShowUsageModal(false);
											setProblemForUsage(null);
											setProblemUsage({
												assignments: [],
												problemSets: [],
												quizzes: [],
											});
										}
									}}
									disabled={loadingUsage}
								>
									×
								</S.ModalClose>
							</S.ModalHeader>
							<S.ModalBody>
								<S.UsagePrompt>{problemForUsage.title}</S.UsagePrompt>

								{loadingUsage ? (
									<S.LoadingMessage>
										<LoadingSpinner message="사용 현황을 불러오는 중..." />
									</S.LoadingMessage>
								) : !problemUsage.assignments?.length &&
								  !problemUsage.problemSets?.length &&
								  !problemUsage.quizzes?.length ? (
									<S.EmptyMessage>
										<p>이 문제는 현재 어떤 곳에서도 사용되지 않습니다.</p>
									</S.EmptyMessage>
								) : (
									<div>
										{problemUsage.assignments &&
											problemUsage.assignments.length > 0 && (
												<S.UsageSection>
													<h3>과제 ({problemUsage.assignments.length}개)</h3>
													<S.UsageTableWrapper>
														<S.UsageTable>
															<thead>
																<tr>
																	<th>수업</th>
																	<th>과제</th>
																	<th>시작일</th>
																	<th>종료일</th>
																</tr>
															</thead>
															<tbody>
																{problemUsage.assignments.map((usage) => (
																	<tr
																		key={`assignment-${usage.assignmentId}`}
																		onClick={() => {
																			if (
																				usage.sectionId &&
																				usage.assignmentId &&
																				problemForUsage?.id
																			) {
																				navigate(
																					`/sections/${usage.sectionId}/assignments/${usage.assignmentId}/detail/problems/${problemForUsage.id}`,
																				);
																			}
																		}}
																	>
																		<td>
																			<div>
																				<div style={{ fontWeight: "500" }}>
																					{usage.courseTitle}
																				</div>
																				<div
																					style={{
																						fontSize: "12px",
																						color: "#666",
																						marginTop: "4px",
																					}}
																				>
																					{usage.year}년{" "}
																					{usage.semester === "SPRING"
																						? "1학기"
																						: usage.semester === "SUMMER"
																							? "여름학기"
																							: usage.semester === "FALL"
																								? "2학기"
																								: "겨울학기"}{" "}
																					{usage.sectionNumber
																						? `- ${usage.sectionNumber}분반`
																						: ""}
																				</div>
																			</div>
																		</td>
																		<td>
																			{usage.assignmentNumber && (
																				<span
																					style={{
																						color: "#666",
																						marginRight: "8px",
																					}}
																				>
																					{usage.assignmentNumber}
																				</span>
																			)}
																			{usage.assignmentTitle}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{formatDateTime(usage.assignmentStartDate)}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{formatDateTime(usage.assignmentEndDate)}
																		</td>
																	</tr>
																))}
															</tbody>
														</S.UsageTable>
													</S.UsageTableWrapper>
												</S.UsageSection>
											)}

										{problemUsage.problemSets &&
											problemUsage.problemSets.length > 0 && (
												<S.UsageSection>
													<h3>문제집 ({problemUsage.problemSets.length}개)</h3>
													<S.UsageTableWrapper>
														<S.UsageTable>
															<thead>
																<tr>
																	<th>문제집 제목</th>
																	<th>설명</th>
																	<th>생성일</th>
																</tr>
															</thead>
															<tbody>
																{problemUsage.problemSets.map((ps) => (
																	<tr
																		key={`problemset-${ps.problemSetId}`}
																		onClick={() => {
																			navigate(
																				`/tutor/problems/sets/${ps.problemSetId}/edit`,
																			);
																		}}
																	>
																		<td style={{ fontWeight: "500" }}>
																			{ps.problemSetTitle}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{ps.description || "-"}
																		</td>
																		<td
																			style={{
																				color: "#666",
																				fontSize: "14px",
																			}}
																		>
																			{formatDateTime(ps.createdAt)}
																		</td>
																	</tr>
																))}
															</tbody>
														</S.UsageTable>
													</S.UsageTableWrapper>
												</S.UsageSection>
											)}

										{problemUsage.quizzes && problemUsage.quizzes.length > 0 && (
											<S.UsageSection>
												<h3>퀴즈 ({problemUsage.quizzes.length}개)</h3>
												<S.UsageTableWrapper>
													<S.UsageTable>
														<thead>
															<tr>
																<th>수업</th>
																<th>퀴즈</th>
																<th>시작일</th>
																<th>종료일</th>
															</tr>
														</thead>
														<tbody>
															{problemUsage.quizzes.map((quiz) => (
																<tr
																	key={`quiz-${quiz.quizId}`}
																	onClick={() => {
																		if (quiz.sectionId && quiz.quizId) {
																			navigate(
																				`/tutor/coding-tests/section/${quiz.sectionId}/${quiz.quizId}`,
																			);
																		}
																	}}
																>
																	<td>
																		<div>
																			<div style={{ fontWeight: "500" }}>
																				{quiz.courseTitle}
																			</div>
																			<div
																				style={{
																					fontSize: "12px",
																					color: "#666",
																					marginTop: "4px",
																				}}
																			>
																				{quiz.year}년{" "}
																				{quiz.semester === "SPRING"
																					? "1학기"
																					: quiz.semester === "SUMMER"
																						? "여름학기"
																						: quiz.semester === "FALL"
																							? "2학기"
																							: "겨울학기"}{" "}
																				{quiz.sectionNumber
																					? `- ${quiz.sectionNumber}분반`
																					: ""}
																			</div>
																		</div>
																	</td>
																	<td style={{ fontWeight: "500" }}>
																		{quiz.quizTitle}
																	</td>
																	<td
																		style={{ color: "#666", fontSize: "14px" }}
																	>
																		{formatDateTime(quiz.startTime)}
																	</td>
																	<td
																		style={{ color: "#666", fontSize: "14px" }}
																	>
																		{formatDateTime(quiz.endTime)}
																	</td>
																</tr>
															))}
														</tbody>
													</S.UsageTable>
												</S.UsageTableWrapper>
											</S.UsageSection>
										)}
									</div>
								)}
							</S.ModalBody>
							<S.ModalFooter>
								<S.BtnCancel
									onClick={() => {
										setShowUsageModal(false);
										setProblemForUsage(null);
										setProblemUsage({
											assignments: [],
											problemSets: [],
											quizzes: [],
										});
									}}
									disabled={loadingUsage}
								>
									닫기
								</S.BtnCancel>
							</S.ModalFooter>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
};

export default ProblemManagement;
