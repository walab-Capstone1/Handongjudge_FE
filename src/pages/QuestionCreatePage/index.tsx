import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CourseSidebar from "../../components/CourseSidebar";
import CourseHeader from "../../components/CourseHeader";
import TipTapEditor from "../../components/TipTapEditor";
import APIService from "../../services/APIService";
import { useRecoilState } from "recoil";
import { sidebarCollapsedState } from "../../recoil/atoms";
import * as S from "./styles";
import type { SectionInfo, Assignment, QuestionFormData } from "./types";

const initialFormData: QuestionFormData = {
	title: "",
	content: "",
	isAnonymous: false,
	isPublic: true,
	assignmentId: "",
	problemId: "",
};

const QuestionCreatePage: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useRecoilState(
		sidebarCollapsedState,
	);
	const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
	const [assignmentsWithProblems, setAssignmentsWithProblems] = useState<
		Assignment[]
	>([]);

	const [formData, setFormData] = useState<QuestionFormData>(initialFormData);

	const [nickname, setNickname] = useState("");
	const [showNicknameModal, setShowNicknameModal] = useState(false);
	const [nicknameInput, setNicknameInput] = useState("");
	const [nicknameError, setNicknameError] = useState("");

	useEffect(() => {
		fetchInitialData();
	}, [sectionId]);

	useEffect(() => {
		if (formData.isAnonymous && !nickname) {
			fetchNickname();
		}
	}, [formData.isAnonymous]);

	const fetchInitialData = async () => {
		if (!sectionId) return;
		try {
			const sectionData = await APIService.getSectionInfo(sectionId);
			setSectionInfo(sectionData?.data ?? sectionData);

			const assignmentsData =
				await APIService.getAssignmentsBySection(sectionId);
			const list = Array.isArray(assignmentsData)
				? assignmentsData
				: (assignmentsData?.data ?? assignmentsData ?? []);

			const withProblems = await Promise.all(
				list.map(async (assignment: Assignment) => {
					try {
						const problemsData = await APIService.getAssignmentProblems(
							sectionId,
							assignment.id,
						);
						const problems =
							problemsData?.problems ??
							problemsData?.data ??
							(Array.isArray(problemsData) ? problemsData : []);
						return {
							...assignment,
							problems,
						};
					} catch (err) {
						console.error(`과제 ${assignment.id}의 문제 조회 실패:`, err);
						return { ...assignment, problems: [] };
					}
				}),
			);
			setAssignmentsWithProblems(withProblems);
		} catch (err) {
			console.error("Error fetching initial data:", err);
		}
	};

	const fetchNickname = async () => {
		if (!sectionId) return;
		try {
			const data = await APIService.request(
				`/community/nicknames?sectionId=${sectionId}`,
			);
			if (data?.success && data?.data?.nickname) {
				setNickname(data.data.nickname);
			} else {
				setShowNicknameModal(true);
			}
		} catch (err) {
			console.error("Error fetching nickname:", err);
			setShowNicknameModal(true);
		}
	};

	const handleNicknameSubmit = async () => {
		if (!nicknameInput.trim()) {
			setNicknameError("별명을 입력해주세요");
			return;
		}
		if (nicknameInput.length < 2 || nicknameInput.length > 50) {
			setNicknameError("별명은 2-50자 사이여야 합니다");
			return;
		}
		if (!sectionId) return;

		try {
			const checkData = await APIService.request(
				`/community/nicknames/check?sectionId=${sectionId}&nickname=${encodeURIComponent(nicknameInput)}`,
			);
			if (!checkData?.data?.isAvailable) {
				setNicknameError("이미 사용 중인 별명입니다");
				return;
			}

			const data = await APIService.request("/community/nicknames", {
				method: "POST",
				body: JSON.stringify({
					sectionId: Number.parseInt(sectionId, 10),
					nickname: nicknameInput,
				}),
			});
			if (data?.success) {
				setNickname(data.data.nickname);
				setShowNicknameModal(false);
				setNicknameError("");
			}
		} catch (err) {
			console.error("Error setting nickname:", err);
			setNicknameError("별명 설정 중 오류가 발생했습니다");
		}
	};

	const getSelectValue = (): string => {
		if (formData.assignmentId && formData.problemId) {
			return `assignment-${formData.assignmentId}-problem-${formData.problemId}`;
		}
		if (formData.assignmentId) {
			return `assignment-${formData.assignmentId}`;
		}
		return "";
	};

	const handleSelectChange = (value: string) => {
		if (!value) {
			setFormData((prev) => ({
				...prev,
				assignmentId: "",
				problemId: "",
			}));
			return;
		}
		if (value.startsWith("assignment-") && value.includes("-problem-")) {
			const parts = value.split("-problem-");
			const assignmentId = parts[0].replace("assignment-", "");
			const problemId = parts[1] ?? "";
			setFormData((prev) => ({
				...prev,
				assignmentId,
				problemId,
			}));
		} else if (value.startsWith("assignment-")) {
			const assignmentId = value.replace("assignment-", "");
			setFormData((prev) => ({
				...prev,
				assignmentId,
				problemId: "",
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				assignmentId: "",
				problemId: "",
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!sectionId) return;

		if (!formData.title.trim()) {
			alert("제목을 입력해주세요");
			return;
		}

		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = formData.content;
		const textContent = tempDiv.textContent || tempDiv.innerText || "";
		if (!textContent.trim()) {
			alert("내용을 입력해주세요");
			return;
		}

		if (formData.isAnonymous && !nickname) {
			alert("익명으로 질문하려면 별명을 설정해주세요");
			setShowNicknameModal(true);
			return;
		}

		try {
			setLoading(true);
			const requestData: Record<string, unknown> = {
				sectionId: Number.parseInt(sectionId, 10),
				title: formData.title,
				content: formData.content,
				isAnonymous: formData.isAnonymous,
				isPublic: formData.isPublic,
			};
			if (formData.assignmentId) {
				requestData.assignmentId = Number.parseInt(formData.assignmentId, 10);
			}
			if (formData.problemId) {
				requestData.problemId = Number.parseInt(formData.problemId, 10);
			}

			const data = await APIService.request("/community/questions", {
				method: "POST",
				body: JSON.stringify(requestData),
			});

			const questionId = data?.data?.id ?? data?.id;
			if (questionId != null) {
				alert("질문이 작성되었습니다!");
				navigate(`/sections/${sectionId}/community/${questionId}`);
			} else {
				throw new Error("질문 작성 실패");
			}
		} catch (err) {
			console.error("Error creating question:", err);
			alert("질문 작성 중 오류가 발생했습니다");
		} finally {
			setLoading(false);
		}
	};

	const handleToggleSidebar = () => {
		setIsSidebarCollapsed((prev) => !prev);
	};

	return (
		<S.Container $isCollapsed={isSidebarCollapsed}>
			<CourseSidebar
				sectionId={sectionId}
				activeMenu="커뮤니티"
				isCollapsed={isSidebarCollapsed}
				onMenuClick={() => {}}
			/>
			<S.Content $isCollapsed={isSidebarCollapsed}>
				<CourseHeader
					courseName={
						sectionInfo?.courseTitle ?? sectionInfo?.courseName ?? "질문 작성"
					}
					onToggleSidebar={handleToggleSidebar}
					isSidebarCollapsed={isSidebarCollapsed}
				/>
				<S.Body>
					<S.PageHeader>
						<h1>질문 작성</h1>
						<p>궁금한 점을 자유롭게 질문해주세요</p>
					</S.PageHeader>

					<S.Form onSubmit={handleSubmit}>
						<S.FormGroup>
							<S.FormLabel>
								제목 <S.Required>*</S.Required>
							</S.FormLabel>
							<S.FormInput
								type="text"
								placeholder="질문 제목을 입력하세요"
								value={formData.title}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										title: e.target.value,
									}))
								}
								maxLength={200}
								aria-label="질문 제목"
							/>
							<S.CharCount>{formData.title.length}/200</S.CharCount>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel>관련 과제/문제 (선택)</S.FormLabel>
							<S.FormSelect
								value={getSelectValue()}
								onChange={(e) => handleSelectChange(e.target.value)}
								aria-label="관련 과제/문제 선택"
							>
								<option value="">과제/문제를 선택하세요</option>
								{assignmentsWithProblems.map((assignment) => (
									<React.Fragment key={assignment.id}>
										<option
											value={`assignment-${assignment.id}`}
											style={{
												fontWeight: "bold",
												backgroundColor: "#f0f0f0",
											}}
										>
											📁 {assignment.title}
										</option>
										{assignment.problems &&
											assignment.problems.length > 0 &&
											assignment.problems.map((problem) => (
												<option
													key={problem.id ?? problem.problemId}
													value={`assignment-${assignment.id}-problem-${problem.id ?? problem.problemId}`}
													style={{
														paddingLeft: "24px",
													}}
												>
													&nbsp;&nbsp;└{" "}
													{problem.title ??
														problem.problemTitle ??
														`문제 ${problem.id ?? problem.problemId}`}
												</option>
											))}
									</React.Fragment>
								))}
							</S.FormSelect>
						</S.FormGroup>

						<S.FormGroup>
							<S.FormLabel>
								내용 <S.Required>*</S.Required>
							</S.FormLabel>
							<TipTapEditor
								content={formData.content}
								onChange={(html) =>
									setFormData((prev) => ({
										...prev,
										content: html,
									}))
								}
								placeholder="질문 내용을 자세히 작성해주세요&#10;&#10;예시:&#10;1. 무엇을 구현하려고 했나요?&#10;2. 어떤 문제가 발생했나요?&#10;3. 어떤 시도를 해보셨나요?"
							/>
						</S.FormGroup>

						<S.FormOptions>
							<S.OptionGroup>
								<S.OptionLabel>
									<input
										type="checkbox"
										checked={formData.isAnonymous}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												isAnonymous: e.target.checked,
											}))
										}
										aria-label="익명으로 질문하기"
									/>
									<span>익명으로 질문하기</span>
									{formData.isAnonymous && nickname && (
										<S.NicknameDisplay>(별명: {nickname})</S.NicknameDisplay>
									)}
								</S.OptionLabel>
								<S.OptionDescription>
									익명으로 질문하면 이름 대신 별명이 표시됩니다
								</S.OptionDescription>
							</S.OptionGroup>

							<S.OptionGroup>
								<S.OptionLabel>
									<input
										type="checkbox"
										checked={!formData.isPublic}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												isPublic: !e.target.checked,
											}))
										}
										aria-label="비공개 질문"
									/>
									<span>비공개 질문 (교수만 볼 수 있음)</span>
								</S.OptionLabel>
								<S.OptionDescription>
									비공개로 설정하면 교수님만 질문을 볼 수 있습니다
								</S.OptionDescription>
							</S.OptionGroup>
						</S.FormOptions>

						<S.FormActions>
							<S.BtnCancel
								type="button"
								onClick={() => navigate(`/sections/${sectionId}/community`)}
							>
								취소
							</S.BtnCancel>
							<S.BtnSubmit type="submit" disabled={loading}>
								{loading ? "작성 중..." : "질문 작성"}
							</S.BtnSubmit>
						</S.FormActions>
					</S.Form>
				</S.Body>
			</S.Content>

			{showNicknameModal && (
				<S.ModalOverlay
					onClick={() => setShowNicknameModal(false)}
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter") {
							setShowNicknameModal(false);
						}
					}}
					aria-label="닫기"
				>
					<S.ModalContent
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-labelledby="nickname-modal-title"
					>
						<h2 id="nickname-modal-title">별명 설정</h2>
						<p>익명으로 질문하려면 별명을 설정해주세요</p>
						<S.ModalFormGroup>
							<input
								type="text"
								placeholder="별명 입력 (2-50자)"
								value={nicknameInput}
								onChange={(e) => {
									setNicknameInput(e.target.value);
									setNicknameError("");
								}}
								maxLength={50}
								aria-label="별명 입력"
							/>
							{nicknameError && (
								<S.ErrorMessage>{nicknameError}</S.ErrorMessage>
							)}
						</S.ModalFormGroup>
						<S.ModalActions>
							<S.BtnModalCancel
								type="button"
								onClick={() => {
									setShowNicknameModal(false);
									setFormData((prev) => ({
										...prev,
										isAnonymous: false,
									}));
								}}
							>
								취소
							</S.BtnModalCancel>
							<S.BtnModalSubmit type="button" onClick={handleNicknameSubmit}>
								설정
							</S.BtnModalSubmit>
						</S.ModalActions>
					</S.ModalContent>
				</S.ModalOverlay>
			)}
		</S.Container>
	);
};

export default QuestionCreatePage;
