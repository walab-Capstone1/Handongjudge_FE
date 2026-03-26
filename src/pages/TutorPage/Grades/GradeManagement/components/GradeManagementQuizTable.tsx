import { useMemo, type Dispatch, type SetStateAction } from "react";
import * as S from "../styles";
import type { StudentGradeRow, QuizItem, EditingGrade } from "../types";
import type { StudentSortDir, StudentSortKey } from "../../../../../utils/studentSort";
import { SortableStudentColumnHeader } from "../../../../../components/SortableStudentColumnHeader";
import {
	GradeProblemCellDisplay,
	GradeStatusLegendBar,
} from "./GradeProblemCellDisplay";

export interface GradeManagementQuizTableProps {
	grades: StudentGradeRow[];
	filteredGrades: StudentGradeRow[];
	gradeSortKey: StudentSortKey;
	gradeSortDir: StudentSortDir;
	onSortStudentHeader: (key: StudentSortKey) => void;
	selectedQuiz: QuizItem | null;
	editingGrade?: EditingGrade | null;
	setEditingGrade?: (v: EditingGrade | null) => void;
	gradeInputs?: Record<string, number | "">;
	setGradeInputs?: Dispatch<SetStateAction<Record<string, number | "">>>;
	comments?: Record<string, string>;
	handleSaveGrade?: (
		userId: number,
		problemId: number,
		score: number | "",
		comment: string,
	) => void;
	handleViewCode?: (userId: number, problemId: number) => void;
	onProblemDetail?: (problemId: number) => void;
	totalOnly?: boolean;
	onToggleTotalOnly?: (v: boolean) => void;
	showLateOnly?: boolean;
	onToggleShowLateOnly?: (v: boolean) => void;
	problemColumnFilter?: number | "all";
}

export default function GradeManagementQuizTable({
	grades,
	filteredGrades,
	gradeSortKey,
	gradeSortDir,
	onSortStudentHeader,
	selectedQuiz,
	editingGrade = null,
	setEditingGrade = () => {},
	gradeInputs = {},
	setGradeInputs = () => {},
	comments = {},
	handleSaveGrade,
	handleViewCode,
	onProblemDetail,
	totalOnly = false,
	onToggleTotalOnly,
	showLateOnly = false,
	onToggleShowLateOnly,
	problemColumnFilter = "all",
}: GradeManagementQuizTableProps) {
	const allProblemGrades = grades[0]?.problemGrades ?? [];
	const problemGrades = useMemo(() => {
		if (problemColumnFilter === "all") return allProblemGrades;
		const fp = allProblemGrades.filter(
			(p) => p.problemId === problemColumnFilter,
		);
		return fp.length ? fp : allProblemGrades;
	}, [allProblemGrades, problemColumnFilter]);
	const quizTitle = selectedQuiz?.title ?? "퀴즈";
	const quizDueAt = selectedQuiz?.endTime;

	if (grades.length === 0) {
		return (
			<S.CourseTableContainer>
				<S.NoData>
					<p>등록된 성적이 없습니다.</p>
				</S.NoData>
			</S.CourseTableContainer>
		);
	}

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
					{!totalOnly &&
						problemGrades.map((p) => (
							<col key={p.problemId} style={{ width: S.COL_PROBLEM_WIDTH }} />
						))}
					<col style={{ width: S.COL_SCORE_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_TOTAL_WIDTH }} />
					<col style={{ width: S.STICKY_RIGHT_RATIO_WIDTH }} />
				</colgroup>
				<thead>
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
						{!totalOnly && (
							<S.CourseQuizHeader as="th" colSpan={problemGrades.length + 1}>
								<div>
									<S.ItemTitle>
										<S.ItemTypeBadge>퀴즈</S.ItemTypeBadge>
										{quizTitle}
									</S.ItemTitle>
								</div>
							</S.CourseQuizHeader>
						)}
						<th rowSpan={2}>전체 총점</th>
						<th rowSpan={2}>비율</th>
					</tr>
					{!totalOnly && (
						<tr>
							{problemGrades.map((p) => (
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
							<S.CourseAssignmentTotalHeader as="th">
								총점
							</S.CourseAssignmentTotalHeader>
						</tr>
					)}
				</thead>
				<tbody>
					{filteredGrades.map((student) => {
						const totalScore = student.totalScore ?? 0;
						const totalPoints = student.totalPoints ?? 0;
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{!totalOnly &&
									problemGrades.map((col) => {
										const problem = student.problemGrades?.find(
											(pg) => pg.problemId === col.problemId,
										);
										return (
											<S.TdCourseProblemCell key={col.problemId}>
												<GradeProblemCellDisplay
													problem={problem}
													fallbackPoints={col.points ?? 1}
													dueAt={quizDueAt}
													showLateOnly={showLateOnly}
												/>
											</S.TdCourseProblemCell>
										);
									})}
								{!totalOnly && (
									<S.TdCourseAssignmentTotalCell>
										<strong>
											{totalScore} / {totalPoints}
										</strong>
									</S.TdCourseAssignmentTotalCell>
								)}
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
