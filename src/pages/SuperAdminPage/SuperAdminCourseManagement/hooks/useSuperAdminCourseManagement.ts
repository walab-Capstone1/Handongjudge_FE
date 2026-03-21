import { useState, useEffect, useCallback } from "react";
import APIService from "../../../../services/APIService";
import type {
	AssignmentProblem,
	Section,
	SectionAssignment,
	SectionStudent,
} from "../types";

export function useSuperAdminCourseManagement() {
	const [sections, setSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedSectionId, setExpandedSectionId] = useState<number | null>(null);
	const [studentsBySection, setStudentsBySection] = useState<
		Record<number, SectionStudent[]>
	>({});
	const [assignmentsBySection, setAssignmentsBySection] = useState<
		Record<number, SectionAssignment[]>
	>({});
	const [problemsByAssignment, setProblemsByAssignment] = useState<
		Record<string, AssignmentProblem[]>
	>({});

	const fetchSections = useCallback(async () => {
		try {
			setLoading(true);
			const response = await APIService.getAllSectionsForSuperAdmin();
			setSections(response?.data || []);
		} catch (error) {
			console.error("분반 조회 실패:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSections();
	}, [fetchSections]);

	const toggleSectionDetail = useCallback(async (sectionId: number) => {
		if (expandedSectionId === sectionId) {
			setExpandedSectionId(null);
			return;
		}

		setExpandedSectionId(sectionId);

		try {
			const [studentsResponse, assignmentsResponse] = await Promise.all([
				APIService.getSectionStudents(sectionId),
				APIService.getAssignmentsBySection(sectionId),
			]);

			const students = studentsResponse?.data || [];
			const assignments = assignmentsResponse?.data || assignmentsResponse || [];

			setStudentsBySection((prev) => ({ ...prev, [sectionId]: students }));
			setAssignmentsBySection((prev) => ({ ...prev, [sectionId]: assignments }));
		} catch (error) {
			console.error("분반 상세 조회 실패:", error);
		}
	}, [expandedSectionId]);

	const loadAssignmentProblems = useCallback(
		async (sectionId: number, assignmentId: number) => {
			const key = `${sectionId}-${assignmentId}`;
			if (problemsByAssignment[key]) return;

			try {
				const response = await APIService.getAssignmentProblems(
					sectionId,
					assignmentId,
				);
				const problems = response?.data || response || [];
				setProblemsByAssignment((prev) => ({ ...prev, [key]: problems }));
			} catch (error) {
				console.error("과제 문제 조회 실패:", error);
			}
		},
		[problemsByAssignment],
	);

	return {
		sections,
		loading,
		expandedSectionId,
		studentsBySection,
		assignmentsBySection,
		problemsByAssignment,
		toggleSectionDetail,
		loadAssignmentProblems,
	};
}

export type SuperAdminCourseManagementHookReturn = ReturnType<
	typeof useSuperAdminCourseManagement
>;
