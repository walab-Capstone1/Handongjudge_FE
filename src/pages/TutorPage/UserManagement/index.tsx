import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import TutorLayout from "../../../layouts/TutorLayout";
import SectionNavigation from "../../../components/SectionNavigation";
import APIService from "../../../services/APIService";
import UserManagementHeader from "./UserManagementHeader";
import UserManagementFilters from "./UserManagementFilters";
import UserManagementTable from "./UserManagementTable";
import StudentDetailModal from "./StudentDetailModal";
import * as S from "./styles";
import type {
	Student,
	SectionInfo,
	Assignment,
	ProblemStatus,
	SortField,
	SortDirection,
	RoleFilter,
} from "./types";

const STUDENTS_PER_PAGE = 10;

const UserManagement: React.FC = () => {
	const { sectionId } = useParams<{ sectionId?: string }>();
	const [students, setStudents] = useState<Student[]>([]);
	const [, setSections] = useState<SectionInfo[]>([]);
	const [currentSection, setCurrentSection] = useState<SectionInfo | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterSection, setFilterSection] = useState("ALL");
	const [filterRole, setFilterRole] = useState<RoleFilter>("ALL");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(STUDENTS_PER_PAGE);
	const [userRoles, setUserRoles] = useState<Record<number, string>>({});
	const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

	const [sortField, setSortField] = useState<SortField>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const [showDetailModal, setShowDetailModal] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [studentAssignments, setStudentAssignments] = useState<Assignment[]>(
		[],
	);
	const [expandedAssignment, setExpandedAssignment] = useState<number | null>(
		null,
	);
	const [assignmentProblemsDetail, setAssignmentProblemsDetail] = useState<
		Record<number, ProblemStatus[]>
	>({});

	const fetchStudents = useCallback(async () => {
		try {
			setLoading(true);

			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];

			if (sectionId) {
				const parsedSectionId = Number.parseInt(sectionId);
				if (Number.isNaN(parsedSectionId)) {
					console.error("잘못된 sectionId:", sectionId);
					setLoading(false);
					return;
				}

				const currentSectionData = (sectionsData as SectionInfo[]).find(
					(section) => section.sectionId === parsedSectionId,
				);
				setCurrentSection((currentSectionData ?? null) as SectionInfo | null);

				try {
					const studentsResponse =
						await APIService.getSectionStudents(parsedSectionId);
					const studentsData = studentsResponse?.data || studentsResponse || [];
					setStudents(studentsData);

					try {
						const roleResponse =
							await APIService.getMyRoleInSection(parsedSectionId);
						setCurrentUserRole(roleResponse?.role || null);
					} catch (error) {
						console.error("역할 조회 실패:", error);
					}

					await fetchUserRoles(parsedSectionId, studentsData);
				} catch (error) {
					console.error("분반 학생 목록 조회 실패:", error);
					setStudents([]);
				}
			} else {
				const studentsResponse = await APIService.getInstructorStudents();
				const studentsData = studentsResponse?.data || [];
				setStudents(studentsData);
			}

			setSections(sectionsData);
			setLoading(false);
		} catch (error) {
			console.error("학생 목록 조회 실패:", error);
			setStudents([]);
			setSections([]);
			setLoading(false);
		}
	}, [sectionId]);

	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);

	const fetchUserRoles = async (sectionId: number, studentsData: Student[]) => {
		if (!sectionId) return;

		try {
			const rolesResponse = await APIService.getAllSectionRoles();
			const allRoles = rolesResponse?.data || [];

			interface RoleItem {
				sectionId: number;
				userId: number;
				role: string;
			}
			const sectionRoles = (allRoles as RoleItem[]).filter(
				(role) => role.sectionId === Number.parseInt(String(sectionId), 10),
			);

			const rolesMap: Record<number, string> = {};
			for (const role of sectionRoles) {
				rolesMap[role.userId] = role.role;
			}

			setUserRoles(rolesMap);
		} catch (error) {
			console.error("역할 정보 조회 실패:", error);
			setUserRoles({});
		}
	};

	const handleAddTutor = async (userId: number) => {
		if (!sectionId) {
			alert("수업을 선택해주세요.");
			return;
		}

		if (!window.confirm("이 사용자를 튜터로 추가하시겠습니까?")) {
			return;
		}

		try {
			await APIService.addTutorToSection(sectionId, userId);
			alert("튜터가 추가되었습니다.");
			await fetchStudents();
		} catch (error) {
			console.error("튜터 추가 실패:", error);
			alert(`튜터 추가에 실패했습니다: ${(error as Error).message || ""}`);
		}
	};

	const handleRemoveTutor = async (userId: number) => {
		if (!sectionId) {
			alert("수업을 선택해주세요.");
			return;
		}

		if (!window.confirm("이 사용자의 튜터 권한을 제거하시겠습니까?")) {
			return;
		}

		try {
			await APIService.removeTutorFromSection(sectionId, userId);
			alert("튜터가 제거되었습니다.");
			await fetchStudents();
		} catch (error) {
			console.error("튜터 제거 실패:", error);
			alert(`튜터 제거에 실패했습니다: ${(error as Error).message || ""}`);
		}
	};

	const handleStudentDetailView = async (student: Student) => {
		setSelectedStudent(student);
		setShowDetailModal(true);

		try {
			const response = await APIService.getStudentAssignmentsProgress(
				student.userId,
				student.sectionId,
			);
			const progressData = response.data || response;

			setStudentAssignments(progressData || []);
		} catch (error) {
			console.error("학생 과제 정보 조회 실패:", error);
			setStudentAssignments([]);
		}
	};

	const handleToggleAssignmentDetail = async (assignmentId: number) => {
		if (expandedAssignment === assignmentId) {
			setExpandedAssignment(null);
			return;
		}

		setExpandedAssignment(assignmentId);

		if (assignmentProblemsDetail[assignmentId]) {
			return;
		}

		if (!selectedStudent) return;
		try {
			const response = await APIService.getStudentAssignmentProblemsStatus(
				selectedStudent.userId,
				selectedStudent.sectionId,
				assignmentId,
			);
			const problemsData = response.data || response;

			setAssignmentProblemsDetail((prev) => ({
				...prev,
				[assignmentId]: problemsData || [],
			}));
		} catch (error) {
			console.error("과제 문제 상태 조회 실패:", error);
			setAssignmentProblemsDetail((prev) => ({
				...prev,
				[assignmentId]: [],
			}));
		}
	};

	const handleCloseDetailModal = () => {
		setShowDetailModal(false);
		setSelectedStudent(null);
		setStudentAssignments([]);
		setExpandedAssignment(null);
		setAssignmentProblemsDetail({});
	};

	const filteredStudents = students.filter((student) => {
		const matchesSearch =
			student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(student.teamId?.toLowerCase().includes(searchTerm.toLowerCase()) ??
				false);
		const matchesSection =
			filterSection === "ALL" ||
			(student.sectionName?.includes(filterSection) ?? false);

		let matchesRole = true;
		if (sectionId && filterRole !== "ALL") {
			const userRole = userRoles[student.userId];
			if (filterRole === "STUDENT") {
				matchesRole = userRole === "STUDENT" || !userRole;
			} else if (filterRole === "TUTOR") {
				matchesRole = userRole === "TUTOR";
			} else if (filterRole === "ADMIN") {
				matchesRole = userRole === "ADMIN";
			}
		}

		return matchesSearch && matchesSection && matchesRole;
	});

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
		setCurrentPage(1);
	};

	const sortedStudents = [...filteredStudents].sort((a, b) => {
		let aValue: string | number;
		let bValue: string | number;

		switch (sortField) {
			case "name":
				aValue = a.name || "";
				bValue = b.name || "";
				break;
			case "email":
				aValue = a.email || "";
				bValue = b.email || "";
				break;
			case "progress":
				aValue = a.assignmentCompletionRate ?? 0;
				bValue = b.assignmentCompletionRate ?? 0;
				break;
			case "joinedAt":
				aValue = a.joinedAt ? new Date(a.joinedAt).getTime() : 0;
				bValue = b.joinedAt ? new Date(b.joinedAt).getTime() : 0;
				break;
			default:
				return 0;
		}

		if (typeof aValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(String(bValue), "ko")
				: String(bValue).localeCompare(aValue, "ko");
		}
		return sortDirection === "asc"
			? Number(aValue) - Number(bValue)
			: Number(bValue) - Number(aValue);
	});

	const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
	const paginatedStudents = sortedStudents.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	useEffect(() => {
		setCurrentPage(1);
		void searchTerm;
		void filterSection;
		void filterRole;
	}, [searchTerm, filterSection, filterRole]);

	const uniqueSections = [
		...new Set(students.map((student) => student.sectionName)),
	].filter(Boolean);

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) {
			return <S.SortIcon>⇅</S.SortIcon>;
		}
		return sortDirection === "asc" ? (
			<S.SortIcon className="asc">↑</S.SortIcon>
		) : (
			<S.SortIcon className="desc">↓</S.SortIcon>
		);
	};

	if (loading) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<S.Container>
					<S.LoadingContainer>
						<S.Spinner />
						<p>학생 데이터를 불러오는 중...</p>
					</S.LoadingContainer>
				</S.Container>
			</TutorLayout>
		);
	}

	return (
		<TutorLayout selectedSection={currentSection}>
			{sectionId && currentSection && (
				<SectionNavigation
					sectionId={sectionId}
					sectionName={(() => {
						const s = currentSection as {
							courseTitle?: string;
							sectionNumber?: string;
							sectionInfo?: {
								courseTitle?: string;
								sectionNumber?: string;
							};
						};
						const title = s.courseTitle ?? s.sectionInfo?.courseTitle ?? "";
						const num = s.sectionNumber ?? s.sectionInfo?.sectionNumber ?? "";
						return num ? `${title} - ${num}분반` : title;
					})()}
					enrollmentCode={
						(currentSection as { enrollmentCode?: string }).enrollmentCode
					}
				/>
			)}

			{!sectionId && (
				<UserManagementHeader
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterSection={filterSection}
					onFilterSectionChange={setFilterSection}
					uniqueSections={uniqueSections}
				/>
			)}

			{sectionId && (
				<UserManagementFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					filterRole={filterRole}
					onFilterRoleChange={setFilterRole}
				/>
			)}

			<UserManagementTable
				sectionId={sectionId}
				paginatedStudents={paginatedStudents}
				studentsLength={students.length}
				userRoles={userRoles}
				currentUserRole={currentUserRole}
				sortField={sortField}
				sortDirection={sortDirection}
				currentPage={currentPage}
				itemsPerPage={itemsPerPage}
				totalItems={sortedStudents.length}
				totalPages={totalPages}
				onSort={handleSort}
				onPageChange={setCurrentPage}
				onItemsPerPageChange={setItemsPerPage}
				onStudentDetail={handleStudentDetailView}
				onAddTutor={handleAddTutor}
				onRemoveTutor={handleRemoveTutor}
				getSortIcon={getSortIcon}
			/>

			<StudentDetailModal
				open={showDetailModal && selectedStudent !== null}
				onClose={handleCloseDetailModal}
				studentAssignments={studentAssignments}
				expandedAssignment={expandedAssignment}
				assignmentProblemsDetail={assignmentProblemsDetail}
				onToggleAssignmentDetail={handleToggleAssignmentDetail}
			/>
		</TutorLayout>
	);
};

export default UserManagement;
