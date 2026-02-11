import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import { useAssignments } from "../../../../../hooks/useAssignments";
import { useSubmissionStats } from "../../../../../hooks/useSubmissionStats";
import { useAssignmentProblems } from "../../../../../hooks/useAssignmentProblems";
import type {
	Assignment,
	AssignmentFormData,
	SectionForModal,
	ProblemFormData,
	BulkProblemItem,
} from "../types";

const ASSIGNMENTS_PER_PAGE = 10;

export function useAssignmentManagement() {
	const { sectionId } = useParams<{ sectionId: string }>();
	const navigate = useNavigate();
	const location = useLocation();

	const {
		assignments,
		setAssignments,
		sections,
		currentSection,
		loading,
		refetch: refetchAssignments,
	} = useAssignments(sectionId ?? null);
	const { submissionStats, refetch: refetchSubmissionStats } =
		useSubmissionStats(assignments, sectionId ?? null);
	const {
		availableProblems,
		assignmentsForProblem,
		setAssignmentsForProblem,
		assignmentProblems,
		setAssignmentProblems,
		expandedAssignmentsForProblem,
		setExpandedAssignmentsForProblem,
		loadingAssignmentsForProblem,
		fetchAvailableProblems,
		handleSectionChangeForProblem,
		toggleAssignmentForProblem,
	} = useAssignmentProblems();

	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showProblemModal, setShowProblemModal] = useState(false);
	const [showCreateProblemModal, setShowCreateProblemModal] = useState(false);
	const [showStandaloneProblemModal, setShowStandaloneProblemModal] =
		useState(false);
	const [showBulkProblemModal, setShowBulkProblemModal] = useState(false);
	const [showCopyProblemModal, setShowCopyProblemModal] = useState(false);
	const [copyProblemSearchTerm, setCopyProblemSearchTerm] = useState("");
	const [selectedSectionForProblem, setSelectedSectionForProblem] =
		useState("");
	const [selectedProblemIds, setSelectedProblemIds] = useState<number[]>([]);
	const [selectedProblemDetail, setSelectedProblemDetail] =
		useState<unknown>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSection, setFilterSection] = useState("ALL");
	const [problemViewMode, setProblemViewMode] = useState<"list" | "hierarchy">(
		"list",
	);
	const [selectedAssignment, setSelectedAssignment] =
		useState<Assignment | null>(null);
	const [problemSearchTerm, setProblemSearchTerm] = useState("");
	const [formData, setFormData] = useState<AssignmentFormData>({
		title: "",
		description: "",
		sectionId: "",
		startDate: "",
		dueDate: "",
		assignmentNumber: "",
	});
	const [problemFormData, setProblemFormData] = useState<ProblemFormData>({
		title: "",
		descriptionFile: null,
		zipFile: null,
	});
	const [bulkProblemData, setBulkProblemData] = useState<{
		problems: BulkProblemItem[];
	}>({
		problems: [{ title: "", descriptionFile: null, zipFile: null }],
	});
	const [expandedAssignments, setExpandedAssignments] = useState<
		Record<number, boolean>
	>({});
	const [showProblemListModal, setShowProblemListModal] = useState(false);
	const [
		selectedAssignmentForProblemList,
		setSelectedAssignmentForProblemList,
	] = useState<Assignment | null>(null);
	const [selectedProblemForDetail, setSelectedProblemForDetail] =
		useState<unknown>(null);
	const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [problemListSearchTerm, setProblemListSearchTerm] = useState("");
	const [openMoreMenu, setOpenMoreMenu] = useState<number | null>(null);
	const [isAddingProblems, setIsAddingProblems] = useState(false);
	const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
	const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

	const sectionsForModal: SectionForModal[] = sections.map(
		(s: {
			sectionId: number;
			courseTitle: string;
			sectionNumber?: string;
		}) => ({
			sectionId: s.sectionId,
			courseTitle: s.courseTitle,
			sectionName: s.sectionNumber
				? `${s.courseTitle} - ${s.sectionNumber}분반`
				: s.courseTitle,
		}),
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				openMoreMenu !== null &&
				!(event.target as Element).closest(".tutor-more-menu")
			) {
				setOpenMoreMenu(null);
			}
		};
		if (openMoreMenu !== null) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [openMoreMenu]);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterSection]);

	const openProblemListForAssignmentId = (
		location.state as { openProblemListForAssignmentId?: number } | null
	)?.openProblemListForAssignmentId;
	// 수정 페이지에서 뒤로가기 시 문제 목록 관리 모달이 다시 열리도록 처리
	useEffect(() => {
		if (openProblemListForAssignmentId == null || !assignments.length) return;
		const assignmentId = Number(openProblemListForAssignmentId);
		const assignment = assignments.find((a) => Number(a.id) === assignmentId);
		if (assignment) {
			setSelectedAssignmentForProblemList(assignment as Assignment);
			setShowProblemListModal(true);
			setProblemListSearchTerm("");
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [
		openProblemListForAssignmentId,
		assignments,
		navigate,
		location.pathname,
	]);

	const resetForm = useCallback(() => {
		setFormData({
			title: "",
			description: "",
			sectionId: sectionId || "",
			startDate: "",
			dueDate: "",
			assignmentNumber: "",
		});
	}, [sectionId]);

	const handleAddAssignment = useCallback(() => {
		setShowAddModal(true);
		resetForm();
		setFormData((prev) => ({ ...prev, sectionId: sectionId || "" }));
	}, [resetForm, sectionId]);

	const handleCloseAddModal = useCallback(() => {
		setShowAddModal(false);
		resetForm();
	}, [resetForm]);

	const handleSubmitAdd = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			const sid = formData.sectionId || sectionId;
			if (!sid) {
				alert("수업 정보가 없습니다.");
				return;
			}
			setIsSubmittingAdd(true);
			try {
				const assignmentData: Record<string, string> = {
					title: formData.title,
					description: formData.description,
					assignmentNumber: formData.assignmentNumber,
				};
				if (formData.startDate) {
					assignmentData.startDate = new Date(formData.startDate).toISOString();
				}
				if (formData.dueDate) {
					assignmentData.endDate = new Date(formData.dueDate).toISOString();
				}
				await APIService.createAssignment(Number.parseInt(sid), assignmentData);
				alert("과제가 생성되었습니다.");
				handleCloseAddModal();
				refetchAssignments();
			} catch (error) {
				console.error("과제 생성 실패:", error);
				alert("과제 생성에 실패했습니다.");
			} finally {
				setIsSubmittingAdd(false);
			}
		},
		[formData, sectionId, handleCloseAddModal, refetchAssignments],
	);

	const handleEdit = useCallback(
		(assignment: Assignment) => {
			setSelectedAssignment(assignment);
			const a = assignment as Assignment & {
				startDate?: string;
				endDate?: string;
				assignmentNumber?: string;
			};
			const endDate =
				a.endDate ??
				(assignment as Assignment & { deadline?: string }).deadline ??
				"";
			setFormData({
				title: assignment.title || "",
				description: assignment.description || "",
				sectionId: sectionId || String(assignment.sectionId ?? ""),
				startDate: a.startDate
					? new Date(a.startDate).toISOString().slice(0, 16)
					: "",
				dueDate: endDate ? new Date(endDate).toISOString().slice(0, 16) : "",
				assignmentNumber: a.assignmentNumber || "",
			} as AssignmentFormData);
			setShowEditModal(true);
		},
		[sectionId],
	);

	const handleCloseEditModal = useCallback(() => {
		setShowEditModal(false);
		setSelectedAssignment(null);
		resetForm();
	}, [resetForm]);

	const handleSubmitEdit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!selectedAssignment) return;
			const sid = selectedAssignment.sectionId ?? sectionId;
			if (!sid) {
				alert("수업 정보가 없습니다.");
				return;
			}
			setIsSubmittingEdit(true);
			try {
				const assignmentData: Record<string, string> = {
					title: formData.title,
					description: formData.description,
					assignmentNumber: formData.assignmentNumber,
				};
				if (formData.startDate) {
					assignmentData.startDate = new Date(formData.startDate).toISOString();
				}
				if (formData.dueDate) {
					assignmentData.endDate = new Date(formData.dueDate).toISOString();
				}
				await APIService.updateAssignment(
					Number(sid),
					selectedAssignment.id,
					assignmentData,
				);
				alert("과제가 수정되었습니다.");
				handleCloseEditModal();
				refetchAssignments();
			} catch (error) {
				console.error("과제 수정 실패:", error);
				alert("과제 수정에 실패했습니다.");
			} finally {
				setIsSubmittingEdit(false);
			}
		},
		[
			selectedAssignment,
			sectionId,
			formData,
			handleCloseEditModal,
			refetchAssignments,
		],
	);

	const handleInputChange = useCallback(
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
			>,
		) => {
			const { name, value } = e.target;
			setFormData((prev) => ({ ...prev, [name]: value }));
		},
		[],
	);

	const handleDelete = useCallback(
		async (assignmentId: number) => {
			if (
				!window.confirm(
					"정말로 이 과제를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없으며, 관련된 모든 제출 기록도 함께 삭제됩니다.",
				)
			) {
				return;
			}
			try {
				if (!sectionId) {
					alert("수업 정보가 없습니다.");
					return;
				}
				await APIService.deleteAssignment(Number(sectionId), assignmentId);
				alert("과제가 삭제되었습니다.");
				refetchAssignments();
			} catch (error) {
				console.error("과제 삭제 실패:", error);
				alert("과제 삭제에 실패했습니다.");
			}
		},
		[sectionId, refetchAssignments],
	);

	const handleToggleActive = useCallback(
		async (secId: number, assignmentId: number, currentActive?: boolean) => {
			try {
				const newActive = !currentActive;
				await APIService.toggleAssignmentActive(secId, assignmentId, newActive);
				refetchAssignments();
			} catch (error) {
				console.error("과제 활성화 상태 변경 실패:", error);
				alert("과제 활성화 상태 변경에 실패했습니다.");
			}
		},
		[refetchAssignments],
	);

	const handleAddProblem = useCallback(
		async (assignment: Assignment) => {
			setSelectedAssignment(assignment);
			setShowProblemModal(true);
			setSelectedProblemIds([]);
			setSelectedProblemDetail(null);
			setProblemSearchTerm("");
			await fetchAvailableProblems();
		},
		[fetchAvailableProblems],
	);

	const handleSectionChangeForProblemWrapper = useCallback(
		async (secId: string) => {
			setSelectedSectionForProblem(secId);
			setSelectedProblemIds([]);
			setCopyProblemSearchTerm("");
			await handleSectionChangeForProblem(secId || "");
		},
		[handleSectionChangeForProblem],
	);

	const handleProblemToggleForAdd = useCallback(
		(assignmentId: number, problemId: number) => {
			setSelectedProblemIds((prev) =>
				prev.includes(problemId)
					? prev.filter((id) => id !== problemId)
					: [...prev, problemId],
			);
		},
		[],
	);

	const handleSelectAllProblemsForAssignment = useCallback(
		(assignmentId: number) => {
			const problems = assignmentProblems[assignmentId] || [];
			const problemIds = problems.map((p: { id: number }) => p.id);
			const allSelected = problemIds.every((id: number) =>
				selectedProblemIds.includes(id),
			);
			if (allSelected) {
				setSelectedProblemIds((prev) =>
					prev.filter((id) => !problemIds.includes(id)),
				);
			} else {
				setSelectedProblemIds((prev) => {
					const newIds = [...prev];
					for (const id of problemIds) {
						if (!newIds.includes(id)) newIds.push(id);
					}
					return newIds;
				});
			}
		},
		[assignmentProblems, selectedProblemIds],
	);

	const handleSelectProblem = useCallback(
		async (problemIds: number[]) => {
			if (!selectedAssignment) return;
			setIsAddingProblems(true);
			try {
				for (const problemId of problemIds) {
					const newProblemId = await APIService.copyProblem(problemId);
					await APIService.addProblemToAssignment(
						selectedAssignment.id,
						newProblemId,
					);
				}
				alert(
					`${problemIds.length}개의 문제가 성공적으로 복사되어 추가되었습니다.`,
				);
				setShowProblemModal(false);
				setSelectedProblemIds([]);
				refetchAssignments();
			} catch (error) {
				console.error("문제 추가 실패:", error);
				alert(`문제 추가에 실패했습니다. ${(error as Error).message || ""}`);
			} finally {
				setIsAddingProblems(false);
			}
		},
		[selectedAssignment, refetchAssignments],
	);

	const existingProblemIds = new Set(
		(selectedAssignment?.problems ?? []).map((p: { id: number }) => p.id),
	);
	const existingProblemTitles = new Set(
		(selectedAssignment?.problems ?? [])
			.map((p: { title?: string }) => p.title)
			.filter(Boolean),
	);

	const filteredProblems = availableProblems.filter(
		(problem: { id: number; title?: string }) =>
			problem.title?.toLowerCase().includes(problemSearchTerm.toLowerCase()) &&
			!existingProblemIds.has(problem.id) &&
			!(problem.title && existingProblemTitles.has(problem.title)),
	);

	const handleProblemToggle = useCallback((problemId: number) => {
		setSelectedProblemIds((prev) =>
			prev.includes(problemId)
				? prev.filter((id) => id !== problemId)
				: [...prev, problemId],
		);
	}, []);

	const handleSelectAllProblems = useCallback(() => {
		if (
			selectedProblemIds.length === filteredProblems.length &&
			filteredProblems.length > 0
		) {
			setSelectedProblemIds([]);
		} else {
			setSelectedProblemIds(filteredProblems.map((p: { id: number }) => p.id));
		}
	}, [selectedProblemIds.length, filteredProblems]);

	const handleRemoveProblem = useCallback(
		async (assignmentId: number, problemId: number) => {
			if (!window.confirm("이 문제를 과제에서 제거하시겠습니까?")) return;
			try {
				// 낙관적 업데이트: 화면에서 바로 제거
				setAssignments((prev) =>
					prev.map((a) => {
						if (a.id !== assignmentId) return a;
						const nextProblems = (a.problems || []).filter(
							(p: { id: number }) => p.id !== problemId,
						);
						return {
							...a,
							problems: nextProblems,
							problemCount: nextProblems.length,
						};
					}),
				);
				await APIService.removeProblemFromAssignment(assignmentId, problemId);
				alert("문제가 성공적으로 제거되었습니다.");
				// 서버와 동기화
				await refetchAssignments();
			} catch (error) {
				console.error("문제 제거 실패:", error);
				alert("문제 제거에 실패했습니다.");
				// 실패 시 목록 다시 불러오기
				await refetchAssignments();
			}
		},
		[refetchAssignments, setAssignments],
	);

	const handleCreateNewProblem = useCallback(() => {
		setShowProblemModal(false);
		setShowCreateProblemModal(true);
	}, []);

	/** 문제 추가 모달에서 "새 문제 만들기" 클릭 시 → 문제 생성 페이지로 이동 (해당 과제에 나중에 자동 추가되도록 state 전달) */
	const handleNavigateToCreatePage = useCallback(() => {
		setShowProblemModal(false);
		if (selectedAssignment && sectionId) {
			navigate("/tutor/problems/create", {
				state: {
					fromAssignmentId: selectedAssignment.id,
					sectionId,
				},
			});
		} else {
			navigate("/tutor/problems/create");
		}
	}, [selectedAssignment, sectionId, navigate]);

	const handleProblemInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const { name, value, files } = e.target;
			if (files?.[0]) {
				const file = files[0];
				if (name === "descriptionFile") {
					const allowed = [".md", ".txt", ".tex"];
					const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
					if (!allowed.includes(ext)) {
						alert("문제 설명 파일은 .md, .txt, .tex 형식만 업로드 가능합니다.");
						e.target.value = "";
						return;
					}
				}
				if (name === "zipFile") {
					if (!file.name.toLowerCase().endsWith(".zip")) {
						alert("문제 파일은 .zip 형식만 업로드 가능합니다.");
						e.target.value = "";
						return;
					}
					if (file.size > 50 * 1024 * 1024) {
						alert("파일 크기는 50MB를 초과할 수 없습니다.");
						e.target.value = "";
						return;
					}
				}
				setProblemFormData((prev) => ({ ...prev, [name]: file }));
			} else {
				setProblemFormData((prev) => ({ ...prev, [name]: value }));
			}
		},
		[],
	);

	const resetProblemForm = useCallback(() => {
		setProblemFormData({
			title: "",
			descriptionFile: null,
			zipFile: null,
		});
	}, []);

	const handleCreateProblemSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!problemFormData.title.trim()) {
				alert("문제 제목을 입력해주세요.");
				return;
			}
			if (!problemFormData.zipFile) {
				alert("문제 파일(.zip)을 업로드해주세요.");
				return;
			}
			try {
				const fd = new FormData();
				fd.append("title", problemFormData.title);
				if (problemFormData.descriptionFile)
					fd.append("descriptionFile", problemFormData.descriptionFile);
				if (problemFormData.zipFile)
					fd.append("zipFile", problemFormData.zipFile);
				const createResult = await APIService.createProblem(fd);
				const newProblemId =
					typeof createResult === "number"
						? createResult
						: (createResult?.id ?? createResult?.data);

				if (
					selectedAssignment &&
					newProblemId != null &&
					!Number.isNaN(Number(newProblemId))
				) {
					await APIService.addProblemToAssignment(
						selectedAssignment.id,
						Number(newProblemId),
					);
					alert(
						"문제가 생성되어 해당 과제에 추가되었습니다. 과제 목록에서 확인할 수 있습니다.",
					);
				} else {
					alert(
						"문제가 성공적으로 생성되었습니다. 문제 목록에서 원하는 과제에 추가할 수 있습니다.",
					);
				}
				setShowCreateProblemModal(false);
				resetProblemForm();
				refetchAssignments();
			} catch (error) {
				console.error("문제 생성 실패:", error);
				alert(`문제 생성에 실패했습니다.\n${(error as Error).message || ""}`);
			}
		},
		[problemFormData, resetProblemForm, refetchAssignments, selectedAssignment],
	);

	const closeProblemModals = useCallback(() => {
		setShowProblemModal(false);
		setShowCreateProblemModal(false);
		setSelectedAssignment(null);
		setProblemSearchTerm("");
		setSelectedProblemIds([]);
		setSelectedProblemDetail(null);
		resetProblemForm();
	}, [resetProblemForm]);

	const closeCopyModal = useCallback(() => {
		setShowCopyProblemModal(false);
		setSelectedSectionForProblem("");
		setAssignmentsForProblem([]);
		setExpandedAssignmentsForProblem({});
		setAssignmentProblems({});
		setSelectedProblemIds([]);
		setCopyProblemSearchTerm("");
		setProblemViewMode("list");
		setSelectedProblemDetail(null);
	}, [
		setAssignmentsForProblem,
		setExpandedAssignmentsForProblem,
		setAssignmentProblems,
	]);

	const handleStandaloneProblemCreate = useCallback(() => {
		setShowStandaloneProblemModal(true);
		resetProblemForm();
	}, [resetProblemForm]);

	const closeStandaloneProblemModal = useCallback(() => {
		setShowStandaloneProblemModal(false);
		resetProblemForm();
	}, [resetProblemForm]);

	const handleStandaloneProblemSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!problemFormData.title.trim()) {
				alert("문제 제목을 입력해주세요.");
				return;
			}
			if (!problemFormData.zipFile) {
				alert("문제 파일(.zip)을 업로드해주세요.");
				return;
			}
			try {
				const fd = new FormData();
				fd.append("title", problemFormData.title);
				if (problemFormData.descriptionFile)
					fd.append("descriptionFile", problemFormData.descriptionFile);
				if (problemFormData.zipFile)
					fd.append("zipFile", problemFormData.zipFile);
				const response = await APIService.createProblem(fd);
				const problemId =
					typeof response === "number"
						? response
						: (response as { id: number }).id;
				alert(
					`문제가 성공적으로 생성되었습니다.\n문제 ID: ${problemId}\n\n원하는 과제에서 "문제 추가" 버튼으로 추가할 수 있습니다.`,
				);
				closeStandaloneProblemModal();
				fetchAvailableProblems();
			} catch (error) {
				console.error("독립적인 문제 생성 실패:", error);
				alert(`문제 생성에 실패했습니다.\n${(error as Error).message || ""}`);
			}
		},
		[problemFormData, closeStandaloneProblemModal, fetchAvailableProblems],
	);

	const handleBulkProblemCreate = useCallback(() => {
		setShowBulkProblemModal(true);
		setBulkProblemData({
			problems: [{ title: "", descriptionFile: null, zipFile: null }],
		});
	}, []);

	const closeBulkProblemModal = useCallback(() => {
		setShowBulkProblemModal(false);
		setBulkProblemData({
			problems: [{ title: "", descriptionFile: null, zipFile: null }],
		});
	}, []);

	const addProblemRow = useCallback(() => {
		setBulkProblemData((prev) => ({
			...prev,
			problems: [
				...prev.problems,
				{ title: "", descriptionFile: null, zipFile: null },
			],
		}));
	}, []);

	const removeProblemRow = useCallback((index: number) => {
		setBulkProblemData((prev) => {
			if (prev.problems.length <= 1) return prev;
			return {
				...prev,
				problems: prev.problems.filter((_, i) => i !== index),
			};
		});
	}, []);

	const handleBulkProblemInputChange = useCallback(
		(index: number, field: string, value: string) => {
			setBulkProblemData((prev) => ({
				...prev,
				problems: prev.problems.map((p, i) =>
					i === index ? { ...p, [field]: value } : p,
				),
			}));
		},
		[],
	);

	const handleBulkProblemFileChange = useCallback(
		(index: number, field: string, file: File | null) => {
			if (!file) return;
			if (field === "descriptionFile") {
				const allowed = [".md", ".txt", ".tex"];
				const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
				if (!allowed.includes(ext)) {
					alert("문제 설명 파일은 .md, .txt, .tex 형식만 업로드 가능합니다.");
					return;
				}
			}
			if (field === "zipFile") {
				if (!file.name.toLowerCase().endsWith(".zip")) {
					alert("문제 파일은 .zip 형식만 업로드 가능합니다.");
					return;
				}
				if (file.size > 50 * 1024 * 1024) {
					alert("파일 크기는 50MB를 초과할 수 없습니다.");
					return;
				}
			}
			setBulkProblemData((prev) => ({
				...prev,
				problems: prev.problems.map((p, i) =>
					i === index ? { ...p, [field]: file } : p,
				),
			}));
		},
		[],
	);

	const handleBulkProblemSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			for (let i = 0; i < bulkProblemData.problems.length; i++) {
				const p = bulkProblemData.problems[i];
				if (!p.title.trim()) {
					alert(`${i + 1}번째 문제의 제목을 입력해주세요.`);
					return;
				}
				if (!p.zipFile) {
					alert(`${i + 1}번째 문제의 파일(.zip)을 업로드해주세요.`);
					return;
				}
			}
			try {
				const created: { id: number; title: string }[] = [];
				for (let i = 0; i < bulkProblemData.problems.length; i++) {
					const p = bulkProblemData.problems[i];
					const fd = new FormData();
					fd.append("title", p.title);
					if (p.descriptionFile)
						fd.append("descriptionFile", p.descriptionFile);
					if (p.zipFile) fd.append("zipFile", p.zipFile);
					try {
						const res = await APIService.createProblem(fd);
						const id =
							typeof res === "number" ? res : (res as { id: number }).id;
						created.push({ id, title: p.title });
					} catch (err) {
						console.error(`문제 생성 실패: ${p.title}`, err);
						alert(
							`${p.title} 문제 생성에 실패했습니다. 지금까지 ${created.length}개 생성됨.`,
						);
						break;
					}
				}
				if (created.length > 0) {
					alert(
						`${created.length}개의 문제가 성공적으로 생성되었습니다!\n\n${created.map((c) => `• ${c.title} (ID: ${c.id})`).join("\n")}`,
					);
					closeBulkProblemModal();
					fetchAvailableProblems();
				}
			} catch (error) {
				console.error("대량 문제 생성 실패:", error);
				alert("문제 생성 중 오류가 발생했습니다.");
			}
		},
		[bulkProblemData, closeBulkProblemModal, fetchAvailableProblems],
	);

	const toggleAssignment = useCallback((assignmentId: number) => {
		setExpandedAssignments((prev) => ({
			...prev,
			[assignmentId]: !prev[assignmentId],
		}));
	}, []);

	const filteredAssignments = assignments.filter((a: Assignment) => {
		const matchSearch =
			a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			a.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchSection =
			filterSection === "ALL" || a.sectionName?.includes(filterSection);
		return matchSearch && matchSection;
	});

	const totalPages = Math.ceil(
		filteredAssignments.length / ASSIGNMENTS_PER_PAGE,
	);
	const startIndex = (currentPage - 1) * ASSIGNMENTS_PER_PAGE;
	const endIndex = startIndex + ASSIGNMENTS_PER_PAGE;
	const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

	const uniqueSections = [
		...new Set(
			assignments.map((a: Assignment) => a.sectionName).filter(Boolean),
		),
	] as string[];

	const itemsPerPage = ASSIGNMENTS_PER_PAGE;
	const onItemsPerPageChange = useCallback(() => {}, []);

	const openProblemDetail = useCallback(async (problemId: number) => {
		try {
			const detail = await APIService.getProblemInfo(problemId);
			setSelectedProblemForDetail({
				...(detail?.data || detail),
				id: problemId,
			});
			setShowProblemDetailModal(true);
		} catch (err) {
			console.error("문제 정보 조회 실패:", err);
			alert("문제 정보를 불러오는데 실패했습니다.");
		}
	}, []);

	const closeProblemDetailModal = useCallback(() => {
		setShowProblemDetailModal(false);
		setSelectedProblemForDetail(null);
	}, []);

	const closeProblemListModal = useCallback(() => {
		setShowProblemListModal(false);
		setSelectedAssignmentForProblemList(null);
		setSelectedProblemForDetail(null);
		setShowProblemDetailModal(false);
	}, []);

	// 튜터는 과제 관리에서 활성/비활성·삭제만 가능, 추가/수정/문제추가는 어드민만
	const isTutorOnly =
		(currentSection as { roleInSection?: string } | null)?.roleInSection ===
		"TUTOR";

	return {
		loading,
		sectionId,
		currentSection,
		isTutorOnly,
		assignments,
		searchTerm,
		setSearchTerm,
		filterSection,
		setFilterSection,
		uniqueSections,
		paginatedAssignments,
		filteredAssignments,
		submissionStats,
		openMoreMenu,
		setOpenMoreMenu,
		expandedAssignments,
		formData,
		sectionsForModal,
		showAddModal,
		showEditModal,
		selectedAssignment,
		showProblemModal,
		setShowProblemModal,
		filteredProblems,
		selectedProblemIds,
		problemSearchTerm,
		setProblemSearchTerm,
		problemFormData,
		showCreateProblemModal,
		showStandaloneProblemModal,
		showBulkProblemModal,
		bulkProblemData,
		showProblemListModal,
		selectedAssignmentForProblemList,
		problemListSearchTerm,
		setProblemListSearchTerm,
		showProblemDetailModal,
		selectedProblemForDetail,
		currentPage,
		setCurrentPage,
		itemsPerPage,
		onItemsPerPageChange,
		showCopyProblemModal,
		selectedSectionForProblem,
		setSelectedSectionForProblem,
		copyProblemSearchTerm,
		setCopyProblemSearchTerm,
		problemViewMode,
		setProblemViewMode,
		assignmentsForProblem,
		setAssignmentsForProblem,
		setExpandedAssignmentsForProblem,
		setAssignmentProblems,
		assignmentProblems,
		expandedAssignmentsForProblem,
		loadingAssignmentsForProblem,
		selectedProblemDetail,
		setSelectedProblemDetail,
		handleAddAssignment,
		handleCloseAddModal,
		handleSubmitAdd,
		handleEdit,
		handleCloseEditModal,
		handleSubmitEdit,
		handleInputChange,
		handleDelete,
		handleToggleActive,
		handleAddProblem,
		isAddingProblems,
		isSubmittingAdd,
		isSubmittingEdit,
		handleSectionChangeForProblemWrapper,
		handleProblemToggleForAdd,
		handleSelectAllProblemsForAssignment,
		handleSectionChangeForProblem,
		handleSelectProblem,
		handleProblemToggle,
		handleSelectAllProblems,
		handleRemoveProblem,
		handleCreateNewProblem,
		handleNavigateToCreatePage,
		handleProblemInputChange,
		handleCreateProblemSubmit,
		closeProblemModals,
		closeCopyModal,
		handleStandaloneProblemCreate,
		closeStandaloneProblemModal,
		handleStandaloneProblemSubmit,
		handleBulkProblemCreate,
		closeBulkProblemModal,
		addProblemRow,
		removeProblemRow,
		handleBulkProblemInputChange,
		handleBulkProblemFileChange,
		handleBulkProblemSubmit,
		toggleAssignment,
		refetchAssignments,
		refetchSubmissionStats,
		navigate,
		openProblemDetail,
		closeProblemDetailModal,
		closeProblemListModal,
		toggleAssignmentForProblem,
		setShowProblemListModal,
		setSelectedAssignmentForProblemList,
		setShowCopyProblemModal,
		setSelectedProblemIds,
	};
}
