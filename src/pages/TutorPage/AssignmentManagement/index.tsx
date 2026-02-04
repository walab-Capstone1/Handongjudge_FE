import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import APIService from "../../../services/APIService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useAssignments } from "../../../hooks/useAssignments";
import { useSubmissionStats } from "../../../hooks/useSubmissionStats";
import { useAssignmentProblems } from "../../../hooks/useAssignmentProblems";
import AssignmentAddModal from "../../../components/AssignmentModals/AssignmentAddModal";
import AssignmentEditModal from "../../../components/AssignmentModals/AssignmentEditModal";
import AssignmentTableView from "../../../components/AssignmentViews/AssignmentTableView";
import AssignmentListView from "../../../components/AssignmentViews/AssignmentListView";
import ProblemSelectModal from "../../../components/ProblemModals/ProblemSelectModal";
import ProblemCreateModal from "../../../components/ProblemModals/ProblemCreateModal";
import StandaloneProblemCreateModal from "../../../components/ProblemModals/StandaloneProblemCreateModal";
import BulkProblemCreateModal from "../../../components/ProblemModals/BulkProblemCreateModal";
import ProblemListModal from "../../../components/ProblemModals/ProblemListModal";
import ProblemDetailModal from "../../../components/ProblemModals/ProblemDetailModal";
import type { Assignment, SectionInfo } from "./types";
import * as S from "./styles";
import AssignmentManagementHeader from "./AssignmentManagementHeader";
import ProblemDetailPanel from "./ProblemDetailPanel";
import CopyProblemModal from "./CopyProblemModal";
import "../../../components/AssignmentModals/AssignmentModals.css";

const ASSIGNMENTS_PER_PAGE = 10;

interface AssignmentFormData {
	title: string;
	description: string;
	sectionId: string;
	startDate: string;
	dueDate: string;
	assignmentNumber: string;
}

interface SectionForModal {
	sectionId: number;
	courseTitle: string;
	sectionName: string;
}

interface ProblemFormData {
	title: string;
	descriptionFile: File | null;
	zipFile: File | null;
}

interface BulkProblemItem {
	title: string;
	descriptionFile: File | null;
	zipFile: File | null;
}

const AssignmentManagement: React.FC = () => {
	const { sectionId } = useParams<{ sectionId: string }>();

	const {
		assignments,
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
	const [selectedProblemDetail, setSelectedProblemDetail] = useState<any>(null);
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
		useState<any>(null);
	const [showProblemDetailModal, setShowProblemDetailModal] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [problemListSearchTerm, setProblemListSearchTerm] = useState("");
	const [openMoreMenu, setOpenMoreMenu] = useState<number | null>(null);

	// 모달용 sections (sectionId, courseTitle, sectionName)
	const sectionsForModal: SectionForModal[] = (sections as any[]).map(
		(s: any) => ({
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

	const handleAddAssignment = () => {
		setShowAddModal(true);
		resetForm();
		setFormData((prev) => ({ ...prev, sectionId: sectionId || "" }));
	};

	const handleCloseAddModal = () => {
		setShowAddModal(false);
		resetForm();
	};

	const handleSubmitAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const sid = formData.sectionId || sectionId;
			if (!sid) {
				alert("수업 정보가 없습니다.");
				return;
			}
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
		}
	};

	const handleEdit = (assignment: Assignment) => {
		setSelectedAssignment(assignment);
		const a = assignment as Assignment & {
			startDate?: string;
			endDate?: string;
			assignmentNumber?: string;
		};
		const endDate = a.endDate ?? (assignment as any).deadline ?? "";
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
	};

	const handleCloseEditModal = () => {
		setShowEditModal(false);
		setSelectedAssignment(null);
		resetForm();
	};

	const handleSubmitEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedAssignment) return;
		try {
			const sid = selectedAssignment.sectionId ?? sectionId;
			if (!sid) {
				alert("수업 정보가 없습니다.");
				return;
			}
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
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleDelete = async (assignmentId: number) => {
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
	};

	const handleToggleActive = async (
		secId: number,
		assignmentId: number,
		currentActive?: boolean,
	) => {
		try {
			const newActive = !currentActive;
			await APIService.toggleAssignmentActive(secId, assignmentId, newActive);
			refetchAssignments();
		} catch (error) {
			console.error("과제 활성화 상태 변경 실패:", error);
			alert("과제 활성화 상태 변경에 실패했습니다.");
		}
	};

	// 문제 추가
	const handleAddProblem = async (assignment: Assignment) => {
		setSelectedAssignment(assignment);
		setShowProblemModal(true);
		setSelectedProblemIds([]);
		setSelectedProblemDetail(null);
		setProblemSearchTerm("");
		await fetchAvailableProblems();
	};

	const handleSectionChangeForProblemWrapper = async (secId: string) => {
		setSelectedSectionForProblem(secId);
		setSelectedProblemIds([]);
		setCopyProblemSearchTerm("");
		await handleSectionChangeForProblem(secId || "");
	};

	const handleProblemToggleForAdd = (
		assignmentId: number,
		problemId: number,
	) => {
		setSelectedProblemIds((prev) =>
			prev.includes(problemId)
				? prev.filter((id) => id !== problemId)
				: [...prev, problemId],
		);
	};

	const handleSelectAllProblemsForAssignment = (assignmentId: number) => {
		const problems = assignmentProblems[assignmentId] || [];
		const problemIds = problems.map((p: any) => p.id);
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
				problemIds.forEach((id: number) => {
					if (!newIds.includes(id)) newIds.push(id);
				});
				return newIds;
			});
		}
	};

	const handleCopyProblem = async (
		problemId: number,
		newTitle: string | null = null,
	) => {
		try {
			const newProblemId = await APIService.copyProblem(problemId, newTitle);
			alert("문제가 성공적으로 복사되었습니다.");
			setShowCopyProblemModal(false);
			if (selectedAssignment) {
				await APIService.addProblemToAssignment(
					selectedAssignment.id,
					newProblemId,
				);
				alert("복사된 문제가 과제에 추가되었습니다.");
				refetchAssignments();
			}
		} catch (error) {
			console.error("문제 복사 실패:", error);
			alert((error as Error).message || "문제 복사에 실패했습니다.");
		}
	};

	const handleSelectProblem = async (problemIds: number[]) => {
		if (!selectedAssignment) return;
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
			alert("문제 추가에 실패했습니다. " + ((error as Error).message || ""));
		}
	};

	const filteredProblems = availableProblems.filter((problem: any) =>
		problem.title?.toLowerCase().includes(problemSearchTerm.toLowerCase()),
	);

	const handleProblemToggle = (problemId: number) => {
		setSelectedProblemIds((prev) =>
			prev.includes(problemId)
				? prev.filter((id) => id !== problemId)
				: [...prev, problemId],
		);
	};

	const handleSelectAllProblems = () => {
		if (
			selectedProblemIds.length === filteredProblems.length &&
			filteredProblems.length > 0
		) {
			setSelectedProblemIds([]);
		} else {
			setSelectedProblemIds(filteredProblems.map((p: any) => p.id));
		}
	};

	const handleRemoveProblem = async (
		assignmentId: number,
		problemId: number,
	) => {
		if (!window.confirm("이 문제를 과제에서 제거하시겠습니까?")) return;
		try {
			await APIService.removeProblemFromAssignment(assignmentId, problemId);
			alert("문제가 성공적으로 제거되었습니다.");
			refetchAssignments();
		} catch (error) {
			console.error("문제 제거 실패:", error);
			alert("문제 제거에 실패했습니다.");
		}
	};

	const handleCreateNewProblem = () => {
		setShowProblemModal(false);
		setShowCreateProblemModal(true);
	};

	const handleProblemInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, files } = e.target;
		if (files && files[0]) {
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
	};

	const handleCreateProblemSubmit = async (e: React.FormEvent) => {
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
				typeof response === "number" ? response : (response as any).id;
			alert(
				"문제가 성공적으로 생성되었습니다. 문제 목록에서 원하는 과제에 추가할 수 있습니다.",
			);
			setShowCreateProblemModal(false);
			resetProblemForm();
			refetchAssignments();
		} catch (error) {
			console.error("문제 생성 실패:", error);
			alert("문제 생성에 실패했습니다.\n" + ((error as Error).message || ""));
		}
	};

	const resetProblemForm = () => {
		setProblemFormData({ title: "", descriptionFile: null, zipFile: null });
	};

	const closeProblemModals = () => {
		setShowProblemModal(false);
		setShowCreateProblemModal(false);
		setSelectedAssignment(null);
		setProblemSearchTerm("");
		setSelectedProblemIds([]);
		setSelectedProblemDetail(null);
		resetProblemForm();
	};

	const closeCopyModal = () => {
		setShowCopyProblemModal(false);
		setSelectedSectionForProblem("");
		setAssignmentsForProblem([]);
		setExpandedAssignmentsForProblem({});
		setAssignmentProblems({});
		setSelectedProblemIds([]);
		setCopyProblemSearchTerm("");
		setProblemViewMode("list");
		setSelectedProblemDetail(null);
	};

	const handleStandaloneProblemCreate = () => {
		setShowStandaloneProblemModal(true);
		resetProblemForm();
	};

	const closeStandaloneProblemModal = () => {
		setShowStandaloneProblemModal(false);
		resetProblemForm();
	};

	const handleStandaloneProblemSubmit = async (e: React.FormEvent) => {
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
				typeof response === "number" ? response : (response as any).id;
			alert(
				`문제가 성공적으로 생성되었습니다.\n문제 ID: ${problemId}\n\n원하는 과제에서 "문제 추가" 버튼으로 추가할 수 있습니다.`,
			);
			closeStandaloneProblemModal();
			fetchAvailableProblems();
		} catch (error) {
			console.error("독립적인 문제 생성 실패:", error);
			alert("문제 생성에 실패했습니다.\n" + ((error as Error).message || ""));
		}
	};

	const handleBulkProblemCreate = () => {
		setShowBulkProblemModal(true);
		setBulkProblemData({
			problems: [{ title: "", descriptionFile: null, zipFile: null }],
		});
	};

	const closeBulkProblemModal = () => {
		setShowBulkProblemModal(false);
		setBulkProblemData({
			problems: [{ title: "", descriptionFile: null, zipFile: null }],
		});
	};

	const addProblemRow = () => {
		setBulkProblemData((prev) => ({
			...prev,
			problems: [
				...prev.problems,
				{ title: "", descriptionFile: null, zipFile: null },
			],
		}));
	};

	const removeProblemRow = (index: number) => {
		if (bulkProblemData.problems.length > 1) {
			setBulkProblemData((prev) => ({
				...prev,
				problems: prev.problems.filter((_, i) => i !== index),
			}));
		}
	};

	const handleBulkProblemInputChange = (
		index: number,
		field: string,
		value: string,
	) => {
		setBulkProblemData((prev) => ({
			...prev,
			problems: prev.problems.map((p, i) =>
				i === index ? { ...p, [field]: value } : p,
			),
		}));
	};

	const handleBulkProblemFileChange = (
		index: number,
		field: string,
		file: File | null,
	) => {
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
	};

	const handleBulkProblemSubmit = async (e: React.FormEvent) => {
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
				if (p.descriptionFile) fd.append("descriptionFile", p.descriptionFile);
				if (p.zipFile) fd.append("zipFile", p.zipFile);
				try {
					const res = await APIService.createProblem(fd);
					const id = typeof res === "number" ? res : (res as any).id;
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
	};

	const toggleAssignment = (assignmentId: number) => {
		setExpandedAssignments((prev) => ({
			...prev,
			[assignmentId]: !prev[assignmentId],
		}));
	};

	const filteredAssignments = assignments.filter((a: any) => {
		const matchSearch =
			a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			a.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchSection =
			filterSection === "ALL" ||
			(a.sectionName && a.sectionName.includes(filterSection));
		return matchSearch && matchSection;
	});

	const totalPages = Math.ceil(
		filteredAssignments.length / ASSIGNMENTS_PER_PAGE,
	);
	const startIndex = (currentPage - 1) * ASSIGNMENTS_PER_PAGE;
	const endIndex = startIndex + ASSIGNMENTS_PER_PAGE;
	const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

	const uniqueSections = [
		...new Set(assignments.map((a: any) => a.sectionName).filter(Boolean)),
	] as string[];

	const itemsPerPage = ASSIGNMENTS_PER_PAGE;
	const onItemsPerPageChange = () => {};

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection as SectionInfo | null}>
				<LoadingSpinner message="과제 데이터를 불러오는 중..." />
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection as SectionInfo | null}>
			<S.Container>
				<AssignmentManagementHeader
					sectionId={sectionId}
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterSection={filterSection}
					onFilterSectionChange={setFilterSection}
					uniqueSections={uniqueSections}
					onAddAssignment={handleAddAssignment}
					onStandaloneProblemCreate={handleStandaloneProblemCreate}
					onBulkProblemCreate={handleBulkProblemCreate}
				/>

				{sectionId ? (
					<S.TableViewWrapper>
						<AssignmentTableView
							paginatedAssignments={paginatedAssignments}
							submissionStats={
								submissionStats as Record<
									number,
									{ submittedStudents: number; totalStudents: number }
								>
							}
							openMoreMenu={openMoreMenu}
							onToggleMoreMenu={(id) =>
								setOpenMoreMenu(openMoreMenu === id ? null : id)
							}
							onProblemListManage={(assignment) => {
								setSelectedAssignmentForProblemList(assignment as Assignment);
								setShowProblemListModal(true);
								setProblemListSearchTerm("");
							}}
							onAddProblem={handleAddProblem}
							onEdit={handleEdit}
							onToggleActive={handleToggleActive}
							onDelete={handleDelete}
							paginationProps={{
								currentPage,
								totalItems: filteredAssignments.length,
								itemsPerPage,
								onPageChange: setCurrentPage,
								onItemsPerPageChange,
								showItemsPerPage: false,
							}}
						/>
					</S.TableViewWrapper>
				) : (
					<S.ListViewWrapper>
						<AssignmentListView
							filteredAssignments={filteredAssignments}
							submissionStats={
								submissionStats as Record<
									number,
									{
										submittedStudents: number;
										totalStudents: number;
										problemStats?: {
											problemId: number;
											totalStudents: number;
										}[];
									}
								>
							}
							expandedAssignments={expandedAssignments}
							searchTerm={searchTerm}
							filterSection={filterSection}
							openMoreMenu={openMoreMenu}
							onToggleAssignment={toggleAssignment}
							onToggleMoreMenu={(id) =>
								setOpenMoreMenu(openMoreMenu === id ? null : id)
							}
							onAddProblem={handleAddProblem}
							onEdit={handleEdit}
							onToggleActive={handleToggleActive}
							onDelete={handleDelete}
							onRemoveProblem={handleRemoveProblem}
						/>
					</S.ListViewWrapper>
				)}
			</S.Container>

			<AssignmentAddModal
				isOpen={showAddModal}
				formData={formData}
				sections={sectionsForModal}
				onClose={handleCloseAddModal}
				onSubmit={handleSubmitAdd}
				onInputChange={handleInputChange}
			/>

			<AssignmentEditModal
				isOpen={showEditModal}
				formData={formData}
				selectedAssignment={selectedAssignment}
				sections={sectionsForModal}
				onClose={handleCloseEditModal}
				onSubmit={handleSubmitEdit}
				onInputChange={handleInputChange}
			/>

			<ProblemSelectModal
				isOpen={showProblemModal}
				selectedAssignment={selectedAssignment}
				filteredProblems={filteredProblems}
				selectedProblemIds={selectedProblemIds}
				problemSearchTerm={problemSearchTerm}
				onClose={closeProblemModals}
				onProblemToggle={handleProblemToggle}
				onSelectAll={handleSelectAllProblems}
				onSearchChange={setProblemSearchTerm}
				onSelectProblems={handleSelectProblem}
				onCopyProblem={() => {
					setShowProblemModal(false);
					setShowCopyProblemModal(true);
					setSelectedSectionForProblem("");
					handleSectionChangeForProblem("");
					setCopyProblemSearchTerm("");
					setProblemViewMode("list");
				}}
				onCreateNew={handleCreateNewProblem}
				onProblemDetail={async (problemId: number) => {
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
				}}
			/>

			<ProblemCreateModal
				isOpen={showCreateProblemModal}
				formData={problemFormData}
				onClose={closeProblemModals}
				onSubmit={handleCreateProblemSubmit}
				onInputChange={handleProblemInputChange}
			/>

			<StandaloneProblemCreateModal
				isOpen={showStandaloneProblemModal}
				formData={problemFormData}
				onClose={closeStandaloneProblemModal}
				onSubmit={handleStandaloneProblemSubmit}
				onInputChange={handleProblemInputChange}
			/>

			<BulkProblemCreateModal
				isOpen={showBulkProblemModal}
				bulkProblemData={bulkProblemData}
				onClose={closeBulkProblemModal}
				onSubmit={handleBulkProblemSubmit}
				onInputChange={handleBulkProblemInputChange}
				onFileChange={handleBulkProblemFileChange}
				onAddRow={addProblemRow}
				onRemoveRow={removeProblemRow}
			/>

			{selectedProblemDetail &&
				createPortal(
					<ProblemDetailPanel
						detail={selectedProblemDetail}
						onClose={() => setSelectedProblemDetail(null)}
					/>,
					document.body,
				)}

			{showCopyProblemModal &&
				createPortal(
					<CopyProblemModal
						isOpen={showCopyProblemModal}
						selectedAssignmentTitle={selectedAssignment?.title}
						sections={sections as any[]}
						selectedSectionForProblem={selectedSectionForProblem}
						onSelectedSectionChange={(sid) => {
							setSelectedSectionForProblem(sid);
							setSelectedProblemIds([]);
							setCopyProblemSearchTerm("");
							if (sid) handleSectionChangeForProblem(sid);
							else {
								setAssignmentsForProblem([]);
								setExpandedAssignmentsForProblem({});
								setAssignmentProblems({});
							}
						}}
						assignmentsForProblem={assignmentsForProblem}
						assignmentProblems={assignmentProblems}
						expandedAssignmentsForProblem={expandedAssignmentsForProblem}
						loadingAssignmentsForProblem={loadingAssignmentsForProblem}
						copyProblemSearchTerm={copyProblemSearchTerm}
						onCopyProblemSearchTermChange={setCopyProblemSearchTerm}
						problemViewMode={problemViewMode}
						onProblemViewModeChange={setProblemViewMode}
						selectedProblemIds={selectedProblemIds}
						onProblemToggle={handleProblemToggle}
						onProblemToggleForAdd={handleProblemToggleForAdd}
						onSelectAllProblemsForAssignment={
							handleSelectAllProblemsForAssignment
						}
						toggleAssignmentForProblem={toggleAssignmentForProblem}
						onClose={closeCopyModal}
						onBack={() => {
							setShowCopyProblemModal(false);
							setShowProblemModal(true);
						}}
						onSelectProblems={(ids) => {
							handleSelectProblem(ids);
							closeCopyModal();
						}}
						onSelectAllInList={setSelectedProblemIds}
						onOpenProblemDetail={(detail) => setSelectedProblemDetail(detail)}
					/>,
					document.body,
				)}

			<ProblemListModal
				isOpen={showProblemListModal}
				selectedAssignment={selectedAssignmentForProblemList}
				submissionStats={submissionStats}
				searchTerm={problemListSearchTerm}
				onClose={() => {
					setShowProblemListModal(false);
					setSelectedAssignmentForProblemList(null);
					setSelectedProblemForDetail(null);
					setShowProblemDetailModal(false);
				}}
				onAddProblem={handleAddProblem}
				onRemoveProblem={handleRemoveProblem}
				onProblemDetail={async (problemId: number) => {
					try {
						const detail = await APIService.getProblemInfo(problemId);
						setSelectedProblemForDetail({
							...(detail?.data || detail),
							id: problemId,
						});
						setShowProblemDetailModal(true);
					} catch (err) {
						console.error("문제 상세 정보 조회 실패:", err);
						alert("문제 상세 정보를 불러오는데 실패했습니다.");
					}
				}}
				onProblemViewDetail={async (problemId: number) => {
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
				}}
				onSearchChange={setProblemListSearchTerm}
				onProblemUpdated={() => {
					refetchAssignments();
					refetchSubmissionStats();
				}}
			/>

			<ProblemDetailModal
				isOpen={showProblemDetailModal}
				problemDetail={selectedProblemForDetail}
				onClose={() => {
					setShowProblemDetailModal(false);
					setSelectedProblemForDetail(null);
				}}
			/>
		</TutorLayout>
	);
};

export default AssignmentManagement;
