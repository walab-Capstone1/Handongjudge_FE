import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Alert from "../../../components/Alert";
import * as S from "./styles";
import type { ProblemSet, Problem, FilterType, AlertType } from "./types";

const ProblemSetEdit: React.FC = () => {
	const { problemSetId } = useParams<{ problemSetId: string }>();
	const navigate = useNavigate();
	const [problemSet, setProblemSet] = useState<ProblemSet | null>(null);
	const [problems, setProblems] = useState<Problem[]>([]);
	const [allProblems, setAllProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const [alertMessage, setAlertMessage] = useState<string | null>(null);
	const [alertType, setAlertType] = useState<AlertType>("success");
	const [currentPage, setCurrentPage] = useState(1);
	const [filterType, setFilterType] = useState<FilterType>("available");
	const PROBLEMS_PER_PAGE = 10;

	useEffect(() => {
		if (problemSetId) {
			fetchProblemSet();
			fetchAllProblems();
		}
	}, [problemSetId]);

	useEffect(() => {
		if (showAddModal) {
			document.body.classList.add("section-modal-open");
		} else {
			document.body.classList.remove("section-modal-open");
		}

		return () => {
			document.body.classList.remove("section-modal-open");
		};
	}, [showAddModal]);

	const fetchProblemSet = async () => {
		try {
			setLoading(true);
			const response = await APIService.getProblemSet(problemSetId!);
			const data = response?.data || response;
			setProblemSet(data);
			setProblems(data.problems || []);
		} catch (error) {
			console.error("문제집 조회 실패:", error);
			setAlertMessage(
				"문제집 조회에 실패했습니다: " +
					((error as any).message || "알 수 없는 오류"),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setLoading(false);
		}
	};

	const fetchAllProblems = async () => {
		try {
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
			setAllProblems(problemsData);
		} catch (error) {
			console.error("문제 목록 조회 실패:", error);
		}
	};

	const handleAddProblems = async () => {
		if (selectedProblemIds.length === 0) {
			setAlertMessage("추가할 문제를 선택해주세요.");
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 3000);
			return;
		}

		try {
			setIsAdding(true);
			const existingProblemIds = problems.map((p) => p.id);
			const newProblemIds = selectedProblemIds.filter(
				(id) => !existingProblemIds.includes(id),
			);

			if (newProblemIds.length === 0) {
				setAlertMessage("선택한 문제가 이미 문제집에 포함되어 있습니다.");
				setAlertType("error");
				setTimeout(() => setAlertMessage(null), 3000);
				setIsAdding(false);
				return;
			}

			for (const problemId of newProblemIds) {
				try {
					await APIService.addProblemToSet(problemSetId!, problemId);
				} catch (error) {
					console.error(`문제 ${problemId} 추가 실패:`, error);
				}
			}

			setAlertMessage(
				`${newProblemIds.length}개의 문제가 성공적으로 추가되었습니다.`,
			);
			setAlertType("success");
			setShowAddModal(false);
			setSelectedProblemIds([]);
			fetchProblemSet();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error) {
			console.error("문제 추가 실패:", error);
			setAlertMessage(
				"문제 추가에 실패했습니다: " +
					((error as any).message || "알 수 없는 오류"),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsAdding(false);
		}
	};

	const handleRemoveProblem = async (problemId: number) => {
		if (!window.confirm("정말로 이 문제를 문제집에서 제거하시겠습니까?")) {
			return;
		}

		try {
			setIsRemoving(true);
			await APIService.removeProblemFromSet(problemSetId!, problemId);
			setAlertMessage("문제가 성공적으로 제거되었습니다.");
			setAlertType("success");
			fetchProblemSet();
			setTimeout(() => setAlertMessage(null), 3000);
		} catch (error) {
			console.error("문제 제거 실패:", error);
			setAlertMessage(
				"문제 제거에 실패했습니다: " +
					((error as any).message || "알 수 없는 오류"),
			);
			setAlertType("error");
			setTimeout(() => setAlertMessage(null), 5000);
		} finally {
			setIsRemoving(false);
		}
	};

	const handleProblemToggle = (problemId: number) => {
		if (isProblemAdded(problemId)) {
			return;
		}

		setSelectedProblemIds((prev) => {
			if (prev.includes(problemId)) {
				return prev.filter((id) => id !== problemId);
			} else {
				return [...prev, problemId];
			}
		});
	};

	const handleSelectAll = () => {
		const filtered = getFilteredProblems();
		const availableProblems = filtered.filter((p) => !isProblemAdded(p.id));
		const allSelected =
			availableProblems.length > 0 &&
			availableProblems.every((p) => selectedProblemIds.includes(p.id));

		if (allSelected) {
			const availableIds = availableProblems.map((p) => p.id);
			setSelectedProblemIds((prev) =>
				prev.filter((id) => !availableIds.includes(id)),
			);
		} else {
			setSelectedProblemIds((prev) => {
				const newIds = availableProblems.map((p) => p.id);
				const combined = [...new Set([...prev, ...newIds])];
				return combined;
			});
		}
	};

	const getAvailableProblems = (): Problem[] => {
		const existingProblemIds = problems.map((p) => p.id);
		return allProblems.filter((p) => !existingProblemIds.includes(p.id));
	};

	const getAddedProblems = (): Problem[] => {
		const existingProblemIds = problems.map((p) => p.id);
		return allProblems.filter((p) => existingProblemIds.includes(p.id));
	};

	const isProblemAdded = (problemId: number): boolean => {
		return problems.some((p) => p.id === problemId);
	};

	const getFilteredProblems = (): Problem[] => {
		let filtered: Problem[];

		if (filterType === "available") {
			filtered = getAvailableProblems();
		} else if (filterType === "added") {
			filtered = getAddedProblems();
		} else {
			filtered = allProblems;
		}

		if (searchTerm) {
			filtered = filtered.filter(
				(p) =>
					p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.id?.toString().includes(searchTerm),
			);
		}

		return filtered;
	};

	const paginatedProblems = (): Problem[] => {
		const filtered = getFilteredProblems();
		const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
		return filtered.slice(startIndex, startIndex + PROBLEMS_PER_PAGE);
	};

	const totalPages = Math.ceil(
		getFilteredProblems().length / PROBLEMS_PER_PAGE,
	);

	const getDifficultyLabel = (difficulty?: string): string => {
		const labels: Record<string, string> = {
			"1": "쉬움",
			"2": "보통",
			"3": "어려움",
		};
		return labels[difficulty || ""] || difficulty || "";
	};

	const getDifficultyColor = (difficulty?: string): string => {
		const colors: Record<string, string> = {
			"1": "#10b981",
			"2": "#f59e0b",
			"3": "#ef4444",
		};
		return colors[difficulty || ""] || "#6b7280";
	};

	const formatDate = (dateString?: string): string => {
		if (!dateString) return "-";
		const date = new Date(dateString);
		return date.toLocaleDateString("ko-KR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

	if (loading) {
		return (
			<TutorLayout>
				<LoadingSpinner message="문제집 정보를 불러오는 중..." />
			</TutorLayout>
		);
	}

	if (!problemSet) {
		return (
			<TutorLayout>
				<S.Container>
					<EmptyState
						title="문제집을 찾을 수 없습니다"
						message="존재하지 않거나 접근 권한이 없는 문제집입니다"
						actionLabel="돌아가기"
						onAction={() => navigate("/tutor/problems/sets")}
					/>
				</S.Container>
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

				<S.Header>
					<S.BackButton onClick={() => navigate("/tutor/problems/sets")}>
						← 문제집 목록으로
					</S.BackButton>
					<S.Title>{problemSet.title}</S.Title>
					{problemSet.description && (
						<S.Description>{problemSet.description}</S.Description>
					)}
				</S.Header>

				<S.Actions>
					<S.AddButton onClick={() => setShowAddModal(true)}>
						+ 문제 추가
					</S.AddButton>
				</S.Actions>

				{problems.length > 0 ? (
					<S.ProblemsGrid>
						{problems.map((problem, index) => (
							<S.ProblemCard key={problem.id}>
								<S.ProblemHeader>
									<S.ProblemInfo>
										<S.ProblemTitle>
											{index + 1}. {problem.title}
										</S.ProblemTitle>
										<S.ProblemMeta>
											<S.Badge
												style={{
													background: "#f3f4f6",
													color: "#6b7280",
												}}
											>
												#{problem.id}
											</S.Badge>
											<S.Badge
												style={{
													backgroundColor:
														getDifficultyColor(problem.difficulty) + "20",
													color: getDifficultyColor(problem.difficulty),
												}}
											>
												{getDifficultyLabel(problem.difficulty)}
											</S.Badge>
										</S.ProblemMeta>
									</S.ProblemInfo>
									<S.RemoveButton
										onClick={() => handleRemoveProblem(problem.id)}
										disabled={isRemoving}
									>
										제거
									</S.RemoveButton>
								</S.ProblemHeader>
							</S.ProblemCard>
						))}
					</S.ProblemsGrid>
				) : (
					<EmptyState
						title="등록된 문제가 없습니다"
						message="문제를 추가하여 문제집을 구성해보세요"
						actionLabel="문제 추가"
						onAction={() => setShowAddModal(true)}
					/>
				)}

				{showAddModal && (
					<S.ModalOverlay
						onClick={() => {
							if (!isAdding) {
								setShowAddModal(false);
								setSelectedProblemIds([]);
								setSearchTerm("");
								setCurrentPage(1);
								setFilterType("available");
							}
						}}
					>
						<S.ModalContent onClick={(e) => e.stopPropagation()}>
							<S.ModalHeader>
								<h2>문제 추가</h2>
								<S.ModalCloseButton
									onClick={() => {
										if (!isAdding) {
											setShowAddModal(false);
											setSelectedProblemIds([]);
											setSearchTerm("");
											setCurrentPage(1);
											setFilterType("available");
										}
									}}
									disabled={isAdding}
								>
									×
								</S.ModalCloseButton>
							</S.ModalHeader>

							<S.SearchInput
								type="text"
								placeholder="문제명 또는 ID로 검색..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
							/>

							<div
								style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
							>
								<S.SelectAllButton
									className={filterType === "all" ? "active" : ""}
									onClick={() => {
										setFilterType("all");
										setCurrentPage(1);
									}}
								>
									모든 문제
								</S.SelectAllButton>
								<S.SelectAllButton
									className={filterType === "available" ? "active" : ""}
									onClick={() => {
										setFilterType("available");
										setCurrentPage(1);
									}}
								>
									추가 가능
								</S.SelectAllButton>
								<S.SelectAllButton
									className={filterType === "added" ? "active" : ""}
									onClick={() => {
										setFilterType("added");
										setCurrentPage(1);
									}}
								>
									이미 추가됨
								</S.SelectAllButton>
							</div>

							{getFilteredProblems().length > 0 ? (
								<>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "1rem",
										}}
									>
										{filterType !== "added" && (
											<S.SelectAllButton onClick={handleSelectAll}>
												{getFilteredProblems().filter(
													(p) => !isProblemAdded(p.id),
												).length > 0 &&
												getFilteredProblems()
													.filter((p) => !isProblemAdded(p.id))
													.every((p) => selectedProblemIds.includes(p.id))
													? "전체 해제"
													: "전체 선택"}
											</S.SelectAllButton>
										)}
										<span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
											{selectedProblemIds.length}개 선택됨 / 총{" "}
											{getFilteredProblems().length}개
										</span>
									</div>

									<div
										style={{
											maxHeight: "400px",
											overflowY: "auto",
											marginBottom: "1rem",
										}}
									>
										{paginatedProblems().map((problem) => {
											const isAdded = isProblemAdded(problem.id);
											const isSelected = selectedProblemIds.includes(
												problem.id,
											);

											return (
												<div
													key={problem.id}
													style={{
														padding: "1rem",
														border: `1px solid ${isSelected ? "#667eea" : isAdded ? "#d1d5db" : "#e5e7eb"}`,
														borderRadius: "6px",
														marginBottom: "0.5rem",
														cursor: isAdded ? "not-allowed" : "pointer",
														background: isSelected
															? "#f0f4ff"
															: isAdded
																? "#f9fafb"
																: "white",
														opacity: isAdded ? 0.6 : 1,
														display: "flex",
														alignItems: "center",
														gap: "1rem",
													}}
													onClick={() => handleProblemToggle(problem.id)}
												>
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handleProblemToggle(problem.id)}
														onClick={(e) => e.stopPropagation()}
														disabled={isAdded}
													/>
													<div style={{ flex: 1 }}>
														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: "0.5rem",
																marginBottom: "0.25rem",
															}}
														>
															<span
																style={{
																	fontSize: "0.75rem",
																	padding: "0.2rem 0.5rem",
																	background: "#f3f4f6",
																	borderRadius: "4px",
																	color: "#6b7280",
																}}
															>
																#{problem.id}
															</span>
															<span
																style={{ fontWeight: 600, color: "#1f2937" }}
															>
																{problem.title}
															</span>
															{isAdded && (
																<span
																	style={{
																		fontSize: "0.75rem",
																		padding: "0.2rem 0.6rem",
																		background: "#e5e7eb",
																		borderRadius: "12px",
																		color: "#6b7280",
																	}}
																>
																	이미 추가됨
																</span>
															)}
														</div>
														<span
															style={{
																fontSize: "0.75rem",
																padding: "0.2rem 0.6rem",
																borderRadius: "12px",
																backgroundColor:
																	getDifficultyColor(problem.difficulty) + "20",
																color: getDifficultyColor(problem.difficulty),
															}}
														>
															{getDifficultyLabel(problem.difficulty)}
														</span>
													</div>
												</div>
											);
										})}
									</div>

									{totalPages > 1 && (
										<div
											style={{
												display: "flex",
												justifyContent: "center",
												gap: "1rem",
												marginBottom: "1rem",
											}}
										>
											<S.SelectAllButton
												onClick={() =>
													setCurrentPage((prev) => Math.max(1, prev - 1))
												}
												disabled={currentPage === 1}
											>
												이전
											</S.SelectAllButton>
											<span
												style={{
													display: "flex",
													alignItems: "center",
													color: "#6b7280",
												}}
											>
												{currentPage} / {totalPages}
											</span>
											<S.SelectAllButton
												onClick={() =>
													setCurrentPage((prev) =>
														Math.min(totalPages, prev + 1),
													)
												}
												disabled={currentPage === totalPages}
											>
												다음
											</S.SelectAllButton>
										</div>
									)}
								</>
							) : (
								<div
									style={{
										padding: "3rem",
										textAlign: "center",
										color: "#9ca3af",
									}}
								>
									{searchTerm
										? "검색 결과가 없습니다."
										: "추가할 수 있는 문제가 없습니다."}
								</div>
							)}

							<S.ModalActions>
								<S.CancelButton
									onClick={() => {
										setShowAddModal(false);
										setSelectedProblemIds([]);
										setSearchTerm("");
										setCurrentPage(1);
										setFilterType("available");
									}}
									disabled={isAdding}
								>
									취소
								</S.CancelButton>
								<S.SubmitButton
									onClick={handleAddProblems}
									disabled={isAdding || selectedProblemIds.length === 0}
								>
									{isAdding
										? "추가 중..."
										: `추가 (${selectedProblemIds.length})`}
								</S.SubmitButton>
							</S.ModalActions>
						</S.ModalContent>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
};

export default ProblemSetEdit;
