import type React from "react";
import * as S from "../styles";
import type { StudentGradeRow, EditingGrade, AssignmentItem } from "../types";
import type { StudentSortDir, StudentSortKey } from "../../../../../utils/studentSort";
import { SortableStudentColumnHeader } from "../../../../../components/SortableStudentColumnHeader";
import {
	GradeProblemCellDisplay,
	GradeStatusLegendBar,
} from "./GradeProblemCellDisplay";
import {
	getVisibleProblemColumns,
	getTotalsForVisibleProblemColumns,
} from "../utils/gradeTableProblemFilter";

export interface GradeManagementAssignmentTableProps {
	grades: StudentGradeRow[];
	filteredGrades: StudentGradeRow[];
	gradeSortKey: StudentSortKey;
	gradeSortDir: StudentSortDir;
	onSortStudentHeader: (key: StudentSortKey) => void;
	selectedAssignment: AssignmentItem | null;
	editingGrade: EditingGrade | null;
	setEditingGrade: (v: EditingGrade | null) => void;
	gradeInputs: Record<string, number | "">;
	setGradeInputs: React.Dispatch<
		React.SetStateAction<Record<string, number | "">>
	>;
	comments: Record<string, string>;
	handleSaveGrade: (
		userId: number,
		problemId: number,
		score: number | "",
		comment: string,
	) => void;
	handleViewCode: (userId: number, problemId: number) => void;
	onProblemDetail?: (problemId: number) => void;
	totalOnly?: boolean;
	onToggleTotalOnly?: (v: boolean) => void;
	showLateOnly?: boolean;
	onToggleShowLateOnly?: (v: boolean) => void;
	problemFilterId?: number | null;
}

export default function GradeManagementAssignmentTable({
	grades,
	filteredGrades,
	gradeSortKey,
	gradeSortDir,
	onSortStudentHeader,
	selectedAssignment,
	editingGrade,
	setEditingGrade,
	gradeInputs,
	setGradeInputs,
	comments,
	handleSaveGrade,
	handleViewCode,
	onProblemDetail,
	totalOnly = false,
	onToggleTotalOnly,
	showLateOnly = false,
	onToggleShowLateOnly,
	problemFilterId = null,
}: GradeManagementAssignmentTableProps) {
	const assignmentDueAt =
		selectedAssignment?.dueDate ??
		(selectedAssignment as { endDate?: string } | null)?.endDate ??
		(selectedAssignment as { deadline?: string } | null)?.deadline;
	const hasProblems =
		grades[0]?.problemGrades && grades[0].problemGrades.length > 0;

	const problemGradesForCol = grades[0]?.problemGrades ?? [];
	const visibleProblems = getVisibleProblemColumns(grades, problemFilterId);

	return (
		<S.GradeTablePageWrapper>
			<GradeStatusLegendBar
				totalOnly={totalOnly}
				onToggleTotalOnly={onToggleTotalOnly}
				showLateOnly={showLateOnly}
				onToggleShowLateOnly={onToggleShowLateOnly}
			/>
			<S.GradeTableHorizontalScroll>
			<S.CourseTableWithStickyRight>
				<colgroup>
					<col style={{ width: S.STICKY_COL_1_WIDTH }} />
					<col style={{ width: S.STICKY_COL_2_WIDTH }} />
					{!totalOnly && hasProblems
						? visibleProblems.map((p) => (
								<col key={p.problemId} style={{ width: S.COL_PROBLEM_WIDTH }} />
							))
						: null}
					<col style={{ width: S.COL_SCORE_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_TOTAL_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_RATIO_WIDTH }} />
				</colgroup>
				<thead>
					{!totalOnly && hasProblems ? (
						<>
							<tr>
								<S.SortableStudentHeaderTh
									rowSpan={2}
									scope="col"
									onClick={() => onSortStudentHeader("studentName")}
									title="이름순 정렬 (클릭 시 오름·내림)"
								>
									<SortableStudentColumnHeader
										label="학생"
										sortKey="studentName"
										activeKey={gradeSortKey}
										dir={gradeSortDir}
									/>
								</S.SortableStudentHeaderTh>
								<S.SortableStudentHeaderTh
									rowSpan={2}
									scope="col"
									onClick={() => onSortStudentHeader("studentId")}
									title="학번순 정렬 (클릭 시 오름·내림)"
								>
									<SortableStudentColumnHeader
										label="학번"
										sortKey="studentId"
										activeKey={gradeSortKey}
										dir={gradeSortDir}
									/>
								</S.SortableStudentHeaderTh>
								<S.CourseAssignmentHeader
									as="th"
									colSpan={visibleProblems.length}
								>
									<S.ItemTitle>
										{selectedAssignment?.title ?? "과제"}
									</S.ItemTitle>
								</S.CourseAssignmentHeader>
								<th rowSpan={2}>총점</th>
								<th rowSpan={2}>전체 총점</th>
								<th rowSpan={2}>비율</th>
							</tr>
							<tr>
								{visibleProblems.map((p) => (
									<S.ProblemHeader key={p.problemId} as="th">
										{onProblemDetail ? (
											<button
												type="button"
												onClick={() => onProblemDetail(p.problemId)}
												style={{
													background: "none",
													border: "none",
													cursor: "pointer",
													textAlign: "center",
													padding: 0,
													font: "inherit",
													width: "100%",
												}}
											>
												<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
											</button>
										) : (
											<>
												<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
											</>
										)}
									</S.ProblemHeader>
								))}
							</tr>
						</>
					) : (
						<tr>
							<S.SortableStudentHeaderTh
								scope="col"
								onClick={() => onSortStudentHeader("studentName")}
								title="이름순 정렬 (클릭 시 오름·내림)"
							>
								<SortableStudentColumnHeader
									label="학생"
									sortKey="studentName"
									activeKey={gradeSortKey}
									dir={gradeSortDir}
								/>
							</S.SortableStudentHeaderTh>
							<S.SortableStudentHeaderTh
								scope="col"
								onClick={() => onSortStudentHeader("studentId")}
								title="학번순 정렬 (클릭 시 오름·내림)"
							>
								<SortableStudentColumnHeader
									label="학번"
									sortKey="studentId"
									activeKey={gradeSortKey}
									dir={gradeSortDir}
								/>
							</S.SortableStudentHeaderTh>
							<th>총점</th>
							<th>전체 총점</th>
							<th>비율</th>
						</tr>
					)}
				</thead>
				<tbody>
					{filteredGrades.map((student) => {
						const { score: totalScore, points: totalPoints } =
							getTotalsForVisibleProblemColumns(
								student,
								problemFilterId,
								visibleProblems,
							);
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{!totalOnly && hasProblems ? (
									visibleProblems.map((col) => {
										const problem = student.problemGrades?.find(
											(pg) => pg.problemId === col.problemId,
										);
										return (
											<S.TdCourseProblemCell key={col.problemId}>
												{problem ? (
													<GradeProblemCellDisplay
														problem={problem}
														fallbackPoints={problem.points ?? 1}
														dueAt={assignmentDueAt}
														showLateOnly={showLateOnly}
													/>
												) : (
													<span style={{ color: "#94a3b8" }}>—</span>
												)}
											</S.TdCourseProblemCell>
										);
									})
								) : null}
								<S.TdCourseAssignmentTotalCell>
									<strong>
										{totalScore} / {totalPoints}
									</strong>
								</S.TdCourseAssignmentTotalCell>
								<td>
									<strong>
										{totalScore} / {totalPoints}
									</strong>
								</td>
								<td>
									{totalPoints > 0
										? `${((totalScore / totalPoints) * 100).toFixed(1)}%`
										: "-"}
								</td>
							</tr>
						);
					})}
				</tbody>
			</S.CourseTableWithStickyRight>
			</S.GradeTableHorizontalScroll>
		</S.GradeTablePageWrapper>
	);
}
