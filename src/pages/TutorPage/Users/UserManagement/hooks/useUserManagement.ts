import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import APIService from "../../../../../services/APIService";
import type {
	Student,
	SectionInfo,
	SortField,
	SortDirection,
	RoleFilter,
} from "../types";

const STUDENTS_PER_PAGE = 10;

export function useUserManagement() {
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
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(STUDENTS_PER_PAGE);
	const [userRoles, setUserRoles] = useState<Record<number, string>>({});
	const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
	const [sortField, setSortField] = useState<SortField>("name");
	const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

	const fetchUserRoles = useCallback(
		async (sid: number, studentsData: Student[]) => {
			if (!sid) return;
			try {
				const rolesResponse = await APIService.getAllSectionRoles();
				const allRoles = rolesResponse?.data || [];
				interface RoleItem {
					sectionId: number;
					userId: number;
					role: string;
				}
				const sectionRoles = (allRoles as RoleItem[]).filter(
					(role) => role.sectionId === Number.parseInt(String(sid), 10),
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
		},
		[],
	);

	const fetchStudents = useCallback(async () => {
		try {
			setLoading(true);
			const dashboardResponse = await APIService.getInstructorDashboard();
			const sectionsData = dashboardResponse?.data || [];

			if (sectionId) {
				const parsedSectionId = Number.parseInt(sectionId, 10);
				if (Number.isNaN(parsedSectionId)) {
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
					} catch {
						// ignore
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
		} catch (error) {
			console.error("학생 목록 조회 실패:", error);
			setStudents([]);
			setSections([]);
		} finally {
			setLoading(false);
		}
	}, [sectionId, fetchUserRoles]);

	useEffect(() => {
		fetchStudents();
	}, [fetchStudents]);

	const handleAddTutor = useCallback(
		async (userId: number) => {
			if (!sectionId) {
				alert("수업을 선택해주세요.");
				return;
			}
			if (!window.confirm("이 사용자를 튜터로 추가하시겠습니까?")) return;
			try {
				await APIService.addTutorToSection(sectionId, userId);
				alert("튜터가 추가되었습니다.");
				await fetchStudents();
			} catch (error) {
				console.error("튜터 추가 실패:", error);
				alert(`튜터 추가에 실패했습니다: ${(error as Error).message || ""}`);
			}
		},
		[sectionId, fetchStudents],
	);

	const handleRemoveTutor = useCallback(
		async (userId: number) => {
			if (!sectionId) {
				alert("수업을 선택해주세요.");
				return;
			}
			if (!window.confirm("이 사용자의 튜터 권한을 제거하시겠습니까?")) return;
			try {
				await APIService.removeTutorFromSection(sectionId, userId);
				alert("튜터가 제거되었습니다.");
				await fetchStudents();
			} catch (error) {
				console.error("튜터 제거 실패:", error);
				alert(`튜터 제거에 실패했습니다: ${(error as Error).message || ""}`);
			}
		},
		[sectionId, fetchStudents],
	);

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

	const handleSort = useCallback(
		(field: SortField) => {
			if (sortField === field) {
				setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
			} else {
				setSortField(field);
				setSortDirection("asc");
			}
			setCurrentPage(1);
		},
		[sortField],
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, filterSection, filterRole]);

	const roleSortOrder = (role: string | undefined): number => {
		if (role === "ADMIN") return 0;
		if (role === "TUTOR") return 1;
		return 2; // STUDENT or 미지정
	};

	const sortedStudents = [...filteredStudents].sort((a, b) => {
		// 수강관리 분반 페이지: 기본으로 관리자(ADMIN)가 항상 위, 그다음 튜터, 그다음 수강생
		if (sectionId) {
			const aRole = userRoles[a.userId] ?? a.role;
			const bRole = userRoles[b.userId] ?? b.role;
			const aRoleOrder = roleSortOrder(aRole);
			const bRoleOrder = roleSortOrder(bRole);
			if (aRoleOrder !== bRoleOrder) return aRoleOrder - bRoleOrder;
		}

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

	const uniqueSections = [
		...new Set(students.map((s) => s.sectionName)),
	].filter(Boolean) as string[];

	const getSectionDisplayName = () => {
		if (!currentSection) return "";
		const s = currentSection as {
			courseTitle?: string;
			sectionNumber?: string;
			sectionInfo?: { courseTitle?: string; sectionNumber?: string };
		};
		const title = s.courseTitle ?? s.sectionInfo?.courseTitle ?? "";
		const num = s.sectionNumber ?? s.sectionInfo?.sectionNumber ?? "";
		return num ? `${title} - ${num}분반` : title;
	};

	return {
		sectionId,
		currentSection,
		loading,
		students,
		searchTerm,
		setSearchTerm,
		filterSection,
		setFilterSection,
		filterRole,
		setFilterRole,
		currentPage,
		setCurrentPage,
		itemsPerPage,
		setItemsPerPage,
		userRoles,
		currentUserRole,
		sortField,
		sortDirection,
		paginatedStudents,
		sortedStudents,
		totalPages,
		uniqueSections,
		getSectionDisplayName,
		fetchStudents,
		handleSort,
		handleAddTutor,
		handleRemoveTutor,
	};
}
