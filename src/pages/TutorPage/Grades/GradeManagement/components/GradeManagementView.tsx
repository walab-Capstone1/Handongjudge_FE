import React, { useCallback, useEffect, useMemo, useState } from "react";
import TutorLayout from "../../../../../layouts/TutorLayout";
import SectionNavigation from "../../../../../components/Navigation/SectionNavigation";
import APIService from "../../../../../services/APIService";
import * as S from "../styles";
import type { GradeManagementHookReturn } from "../hooks/useGradeManagement";
import GradeManagementHeader from "./GradeManagementHeader";
import GradeManagementCourseTable from "./GradeManagementCourseTable";
import GradeManagementQuizTable from "./GradeManagementQuizTable";
import GradeManagementAssignmentTable from "./GradeManagementAssignmentTable";
import GradeCodeModal from "./GradeCodeModal";
import GradeBulkInputModal from "./GradeBulkInputModal";
import GradeStatsModal from "./GradeStatsModal";
import GradePointsModal from "./GradePointsModal";
import GradeProblemDetailModal from "./GradeProblemDetailModal";

export default function GradeManagementView(d: GradeManagementHookReturn) {
	const [totalOnly, setTotalOnly] = useState(false);
	const [showLateOnly, setShowLateOnly] = useState(false);
	const [isDownloadingCodeZip, setIsDownloadingCodeZip] = useState(false);
	/** 과제별/코딩테스트별 보기: 상단 헤더 문제 열 필터 */
	const [headerProblemFilter, setHeaderProblemFilter] = useState<number | "all">(
		"all",
	);

	const {
		sectionId,
		currentSection,
		assignments,
		quizzes,
		selectedAssignment,
		setSelectedAssignment,
		selectedQuiz,
		setSelectedQuiz,
		grades,
		loading,
		searchTerm,
		setSearchTerm,
		editingGrade,
		setEditingGrade,
		gradeInputs,
		setGradeInputs,
		comments,
		viewMode,
		setViewMode,
		courseGrades,
		courseLoading,
		showCodeModal,
		setShowCodeModal,
		selectedCode,
		showBulkModal,
		setShowBulkModal,
		showStatsModal,
		setShowStatsModal,
		showPointsModal,
		setShowPointsModal,
		pointsInputs,
		setPointsInputs,
		pointsSaving,
		assignmentProblems,
		setAssignmentProblems,
		loadingProblems,
		allAssignmentProblems,
		setAllAssignmentProblems,
		allQuizProblems,
		setAllQuizProblems,
		bulkInputs,
		setBulkInputs,
		bulkSaving,
		getSectionDisplayName,
		handleSaveGrade,
		handleViewCode,
		handleSaveGradeForAssignment,
		handleViewCodeForAssignment,
		handleSaveGradeForQuiz,
		handleSaveGradeForQuizCourse,
		handleViewCodeForQuiz,
		handleExportCSV,
		sectionId: activeSectionId,
		handleShowBulkModal,
		handleBulkSave,
		handleSavePoints,
		stats,
		filteredGrades,
		filteredCourseStudents,
		gradeSortKey,
		gradeSortDir,
		toggleGradeStudentSort,
		showProblemDetailModal,
		problemDetail,
		openProblemDetail,
		closeProblemDetailModal,
	} = d;

	// biome-ignore lint/correctness/useExhaustiveDependencies: 보기 모드·선택 과제/퀴즈 바뀔 때 헤더 문제 필터만 초기화
	useEffect(() => {
		setHeaderProblemFilter("all");
	}, [viewMode, selectedAssignment?.id, selectedQuiz?.id]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: 분반(section) 변경 시 헤더 문제 필터 초기화
	useEffect(() => {
		setHeaderProblemFilter("all");
	}, [sectionId]);

	const handleClosePointsModal = () => {
		setShowPointsModal(false);
		setPointsInputs({});
		setAssignmentProblems([]);
		setAllAssignmentProblems([]);
		setAllQuizProblems([]);
	};

	const handleDownloadCodeZip = async () => {
		if (!activeSectionId) return;
		setIsDownloadingCodeZip(true);
		try {
			if (viewMode === "assignment") {
				if (!selectedAssignment) {
					const blob = await APIService.exportAllAssignmentSubmissionCodesZip(
						activeSectionId,
					);
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = `section_${activeSectionId}_all_assignments_submission_codes.zip`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
					return;
				}
				const blob = await APIService.exportAssignmentSubmissionCodesZip(
					activeSectionId,
					selectedAssignment.id,
				);
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `assignment_${selectedAssignment.id}_submission_codes.zip`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
				return;
			}
			if (viewMode === "quiz") {
				if (!selectedQuiz) {
					const blob = await APIService.exportAllQuizSubmissionCodesZip(
						activeSectionId,
					);
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = `section_${activeSectionId}_all_quizzes_submission_codes.zip`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
					return;
				}
				const blob = await APIService.exportQuizSubmissionCodesZip(
					activeSectionId,
					selectedQuiz.id,
				);
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `quiz_${selectedQuiz.id}_submission_codes.zip`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			console.error("제출 코드 ZIP 다운로드 실패:", error);
			alert("제출 코드 ZIP 다운로드에 실패했습니다.");
		} finally {
			setIsDownloadingCodeZip(false);
		}
	};

	const scopedCourseGrades = useMemo(() => {
		if (!courseGrades) return null;
		if (viewMode === "assignment" && !selectedAssignment) {
			return {
				...courseGrades,
				items: courseGrades.items.filter((i) => i.type === "assignment"),
			};
		}
		if (viewMode === "quiz" && !selectedQuiz) {
			return {
				...courseGrades,
				items: courseGrades.items.filter((i) => i.type === "quiz"),
			};
		}
		return courseGrades;
	}, [courseGrades, viewMode, selectedAssignment, selectedQuiz]);

	const getLateMinutes = useCallback((submittedAt?: string, dueAt?: string): number => {
		if (!submittedAt || !dueAt) return 0;
		const parse = (raw?: string): number => {
			if (!raw) return Number.NaN;
			const normalized = raw.trim().replace(" ", "T");
			const m = normalized
				.trim()
				.match(
					/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?/,
				);
			if (!m) return new Date(normalized).getTime();
			const ms = Number((m[7] ?? "0").slice(0, 3).padEnd(3, "0"));
			return new Date(
				Number(m[1]),
				Number(m[2]) - 1,
				Number(m[3]),
				Number(m[4]),
				Number(m[5]),
				Number(m[6] ?? "0"),
				ms,
			).getTime();
		};
		const s = parse(submittedAt);
		const d = parse(dueAt);
		if (Number.isNaN(s) || Number.isNaN(d) || s <= d) return 0;
		return Math.floor((s - d) / 60000);
	}, []);

	const isLateFullProblem = useCallback((
		problem:
			| {
					submitted?: boolean;
					isOnTime?: boolean;
					score?: number | null;
					points?: number;
					submittedAt?: string;
			  }
			| undefined,
		fallbackPoints: number,
		dueAt?: string,
	): boolean => {
		if (!problem) return false;
		const pts = Number(problem.points ?? fallbackPoints ?? 0);
		const score = Number(problem.score ?? 0);
		return (
			Boolean(problem.submitted) &&
			problem.isOnTime === false &&
			pts > 0 &&
			score >= pts &&
			getLateMinutes(problem.submittedAt, dueAt) > 0
		);
	}, [getLateMinutes]);

	const filteredGradesByLate = useMemo(() => {
		if (!showLateOnly) return filteredGrades;
		const dueAt =
			viewMode === "assignment"
				? (selectedAssignment?.dueDate ??
					(selectedAssignment as { endDate?: string } | null)?.endDate ??
					(selectedAssignment as { deadline?: string } | null)?.deadline)
				: selectedQuiz?.endTime;
		return filteredGrades.filter((student) =>
			(student.problemGrades ?? []).some((p) => {
				const pts = Number(p.points ?? 0);
				const score = Number(p.score ?? 0);
				return (
					p.submitted &&
					p.isOnTime === false &&
					pts > 0 &&
					score >= pts &&
					getLateMinutes(p.submittedAt, dueAt) > 0
				);
			}),
		);
	}, [
		showLateOnly,
		filteredGrades,
		viewMode,
		selectedAssignment,
		selectedQuiz,
		getLateMinutes,
	]);

	const filteredLateItemIds = useMemo(() => {
		if (!showLateOnly || !scopedCourseGrades?.items?.length) return null;
		const ids = new Set<string>();
		for (const item of scopedCourseGrades.items) {
			const hasLateInItem = filteredCourseStudents.some((student) => {
				const data =
					item.type === "assignment"
						? student.assignments?.[item.id]
						: student.quizzes?.[item.id];
				if (!data) return false;
				return item.problems.some((problem) => {
					const p = data.problems?.[problem.problemId];
					return isLateFullProblem(p, problem.points ?? 0, item.dueAt);
				});
			});
			if (hasLateInItem) {
				ids.add(`${item.type}-${item.id}`);
			}
		}
		return ids;
	}, [showLateOnly, scopedCourseGrades, filteredCourseStudents, isLateFullProblem]);

	const scopedCourseGradesByLate = useMemo(() => {
		if (!scopedCourseGrades || !showLateOnly || !filteredLateItemIds) {
			return scopedCourseGrades;
		}
		return {
			...scopedCourseGrades,
			items: scopedCourseGrades.items.filter((item) =>
				filteredLateItemIds.has(`${item.type}-${item.id}`),
			),
		};
	}, [scopedCourseGrades, showLateOnly, filteredLateItemIds]);

	const headerProblemOptions = useMemo(() => {
		if (viewMode !== "assignment" && viewMode !== "quiz") return [];
		if (viewMode === "assignment" && !selectedAssignment) return [];
		if (viewMode === "quiz" && !selectedQuiz) return [];
		if (!grades[0]?.problemGrades?.length) return [];
		return grades[0].problemGrades.map((p) => ({
			problemId: p.problemId,
			problemTitle: p.problemTitle,
		}));
	}, [viewMode, selectedAssignment, selectedQuiz, grades]);

	const courseGradesDisplay = useMemo(() => {
		if (!scopedCourseGradesByLate) return null;
		if (viewMode === "course") {
			return scopedCourseGradesByLate;
		}
		const hasSpecificItem =
			(viewMode === "assignment" && selectedAssignment) ||
			(viewMode === "quiz" && selectedQuiz);
		if (!hasSpecificItem) {
			return scopedCourseGradesByLate;
		}
		const sel = headerProblemFilter;
		if (sel === undefined || sel === "all") return scopedCourseGradesByLate;
		return {
			...scopedCourseGradesByLate,
			items: scopedCourseGradesByLate.items.map((item) => {
				const fp = item.problems.filter((p) => p.problemId === sel);
				return { ...item, problems: fp.length ? fp : item.problems };
			}),
		};
	}, [
		scopedCourseGradesByLate,
		viewMode,
		headerProblemFilter,
		selectedAssignment,
		selectedQuiz,
	]);

	const filteredCourseStudentsByLate = useMemo(() => {
		if (!showLateOnly || !scopedCourseGradesByLate?.items?.length) {
			return filteredCourseStudents;
		}
		return filteredCourseStudents.filter((student) =>
			scopedCourseGradesByLate.items.some((item) => {
				const data =
					item.type === "assignment"
						? student.assignments?.[item.id]
						: student.quizzes?.[item.id];
				if (!data) return false;
				return item.problems.some((problem) =>
					isLateFullProblem(
						data.problems?.[problem.problemId],
						problem.points ?? 0,
						item.dueAt,
					),
				);
			}),
		);
	}, [showLateOnly, filteredCourseStudents, scopedCourseGradesByLate, isLateFullProblem]);

	if (loading && !grades.length) {
		return (
			<TutorLayout selectedSection={currentSection}>
				<S.Container>
					<S.LoadingContainer>
						<S.LoadingSpinner />
						<p>성적 데이터를 불러오는 중...</p>
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
					sectionName={getSectionDisplayName()}
					enrollmentCode={
						(currentSection as { enrollmentCode?: string }).enrollmentCode
					}
					title="성적 관리"
					showSearch={false}
				/>
			)}

			<S.Container>
				<GradeManagementHeader
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					sectionId={sectionId}
					assignments={assignments}
					quizzes={quizzes}
					viewMode={viewMode}
					setViewMode={setViewMode}
					selectedAssignment={selectedAssignment}
					setSelectedAssignment={setSelectedAssignment}
					selectedQuiz={selectedQuiz}
					setSelectedQuiz={setSelectedQuiz}
					showProblemColumnFilter={
						Boolean(sectionId) &&
						(assignments.length > 0 || quizzes.length > 0) &&
						(viewMode === "assignment" || viewMode === "quiz")
					}
					problemFilterOptions={headerProblemOptions}
					problemFilterValue={headerProblemFilter}
					onProblemFilterChange={setHeaderProblemFilter}
					onShowPointsModal={() => setShowPointsModal(true)}
					onShowBulkModal={handleShowBulkModal}
					onShowStatsModal={() => setShowStatsModal(true)}
					onExportCSV={handleExportCSV}
					onDownloadCodeZip={handleDownloadCodeZip}
					isDownloadingCodeZip={isDownloadingCodeZip}
				/>

				{/* 성적 테이블 - 수업 전체 / 전체 과제 / 전체 퀴즈: CourseTable(고정 열+가로 스크롤); 과제·퀴즈 선택 시 해당 테이블 */}
				{viewMode === "course" ? (
					<GradeManagementCourseTable
						courseLoading={courseLoading}
						courseGrades={courseGradesDisplay}
						filteredCourseStudents={filteredCourseStudentsByLate}
						gradeSortKey={gradeSortKey}
						gradeSortDir={gradeSortDir}
						onSortStudentHeader={toggleGradeStudentSort}
						editingGrade={editingGrade}
						setEditingGrade={setEditingGrade}
						gradeInputs={gradeInputs}
						setGradeInputs={setGradeInputs}
						comments={comments}
						onSaveGrade={handleSaveGradeForAssignment}
						onViewCode={handleViewCodeForAssignment}
						onSaveGradeForQuiz={handleSaveGradeForQuizCourse}
						onViewCodeForQuiz={handleViewCodeForQuiz}
						onProblemDetail={openProblemDetail}
						totalOnly={totalOnly}
						onToggleTotalOnly={setTotalOnly}
						showLateOnly={showLateOnly}
						onToggleShowLateOnly={setShowLateOnly}
					/>
				) : viewMode === "assignment" && !selectedAssignment ? (
					<GradeManagementCourseTable
						courseLoading={courseLoading}
						courseGrades={courseGradesDisplay}
						filteredCourseStudents={filteredCourseStudentsByLate}
						gradeSortKey={gradeSortKey}
						gradeSortDir={gradeSortDir}
						onSortStudentHeader={toggleGradeStudentSort}
						editingGrade={editingGrade}
						setEditingGrade={setEditingGrade}
						gradeInputs={gradeInputs}
						setGradeInputs={setGradeInputs}
						comments={comments}
						onSaveGrade={handleSaveGradeForAssignment}
						onViewCode={handleViewCodeForAssignment}
						onProblemDetail={openProblemDetail}
						totalOnly={totalOnly}
						onToggleTotalOnly={setTotalOnly}
						showLateOnly={showLateOnly}
						onToggleShowLateOnly={setShowLateOnly}
					/>
				) : viewMode === "quiz" && !selectedQuiz ? (
					<GradeManagementCourseTable
						courseLoading={courseLoading}
						courseGrades={courseGradesDisplay}
						filteredCourseStudents={filteredCourseStudentsByLate}
						gradeSortKey={gradeSortKey}
						gradeSortDir={gradeSortDir}
						onSortStudentHeader={toggleGradeStudentSort}
						editingGrade={editingGrade}
						setEditingGrade={setEditingGrade}
						gradeInputs={gradeInputs}
						setGradeInputs={setGradeInputs}
						comments={comments}
						onSaveGradeForQuiz={handleSaveGradeForQuizCourse}
						onViewCodeForQuiz={handleViewCodeForQuiz}
						onProblemDetail={openProblemDetail}
						totalOnly={totalOnly}
						onToggleTotalOnly={setTotalOnly}
						showLateOnly={showLateOnly}
						onToggleShowLateOnly={setShowLateOnly}
					/>
				) : selectedQuiz && viewMode === "quiz" && grades.length > 0 ? (
					<GradeManagementQuizTable
						grades={grades}
						filteredGrades={filteredGradesByLate}
						gradeSortKey={gradeSortKey}
						gradeSortDir={gradeSortDir}
						onSortStudentHeader={toggleGradeStudentSort}
						selectedQuiz={selectedQuiz}
						problemColumnFilter={headerProblemFilter}
						editingGrade={editingGrade}
						setEditingGrade={setEditingGrade}
						gradeInputs={gradeInputs}
						setGradeInputs={setGradeInputs}
						comments={comments}
						handleSaveGrade={handleSaveGradeForQuiz}
						handleViewCode={
							selectedQuiz
								? (userId, problemId) =>
										handleViewCodeForQuiz(selectedQuiz.id, userId, problemId)
								: undefined
						}
						onProblemDetail={openProblemDetail}
						totalOnly={totalOnly}
						onToggleTotalOnly={setTotalOnly}
						showLateOnly={showLateOnly}
						onToggleShowLateOnly={setShowLateOnly}
					/>
				) : selectedQuiz && viewMode === "quiz" ? (
					<S.CourseTableContainer>
						<S.NoData>
							<p>등록된 성적이 없습니다.</p>
						</S.NoData>
					</S.CourseTableContainer>
				) : selectedAssignment && grades.length > 0 ? (
					<GradeManagementAssignmentTable
						grades={grades}
						filteredGrades={filteredGradesByLate}
						gradeSortKey={gradeSortKey}
						gradeSortDir={gradeSortDir}
						onSortStudentHeader={toggleGradeStudentSort}
						selectedAssignment={selectedAssignment}
						problemColumnFilter={headerProblemFilter}
						editingGrade={editingGrade}
						setEditingGrade={setEditingGrade}
						gradeInputs={gradeInputs}
						setGradeInputs={setGradeInputs}
						comments={comments}
						handleSaveGrade={handleSaveGrade}
						handleViewCode={handleViewCode}
						onProblemDetail={openProblemDetail}
						totalOnly={totalOnly}
						onToggleTotalOnly={setTotalOnly}
						showLateOnly={showLateOnly}
						onToggleShowLateOnly={setShowLateOnly}
					/>
				) : selectedAssignment ? (
					<S.CourseTableContainer>
						<S.NoData>
							<p>등록된 성적이 없습니다.</p>
						</S.NoData>
					</S.CourseTableContainer>
				) : (
					<S.CourseTableContainer>
						<S.NoData>
							<p>과제를 선택하여 성적을 확인하세요.</p>
						</S.NoData>
					</S.CourseTableContainer>
				)}

				<GradeCodeModal
					show={showCodeModal}
					selectedCode={selectedCode}
					onClose={() => setShowCodeModal(false)}
				/>

				<GradeBulkInputModal
					show={
						showBulkModal &&
						grades.length > 0 &&
						(!!selectedAssignment || !!selectedQuiz)
					}
					grades={grades}
					bulkInputs={bulkInputs}
					setBulkInputs={setBulkInputs}
					bulkSaving={bulkSaving}
					onClose={() => {
						setShowBulkModal(false);
						setBulkInputs({});
					}}
					onSave={handleBulkSave}
				/>

				<GradeStatsModal
					show={showStatsModal}
					stats={stats}
					onClose={() => setShowStatsModal(false)}
				/>

				<GradePointsModal
					show={showPointsModal}
					viewMode={viewMode}
					hasAssignments={assignments.length > 0}
					hasQuizzes={quizzes.length > 0}
					selectedAssignment={selectedAssignment}
					selectedQuiz={selectedQuiz}
					loadingProblems={loadingProblems}
					allAssignmentProblems={allAssignmentProblems}
					allQuizProblems={allQuizProblems}
					assignmentProblems={assignmentProblems}
					pointsInputs={pointsInputs}
					setPointsInputs={setPointsInputs}
					pointsSaving={pointsSaving}
					onClose={handleClosePointsModal}
					onSave={handleSavePoints}
				/>

				<GradeProblemDetailModal
					isOpen={showProblemDetailModal}
					problemDetail={problemDetail}
					onClose={closeProblemDetailModal}
				/>

				{isDownloadingCodeZip && (
					<S.ModalOverlay>
						<S.LoadingOverlayCard>
							<S.LoadingSpinner />
							<S.LoadingOverlayMessage>
								제출 코드 ZIP을 준비하고 있습니다...
							</S.LoadingOverlayMessage>
						</S.LoadingOverlayCard>
					</S.ModalOverlay>
				)}
			</S.Container>
		</TutorLayout>
	);
}
