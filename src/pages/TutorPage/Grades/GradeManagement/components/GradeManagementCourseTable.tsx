import React from "react";
import * as S from "../styles";
import type { CourseGradesData, CourseStudentEntry } from "../types";

export interface GradeManagementCourseTableProps {
	courseLoading: boolean;
	courseGrades: CourseGradesData | null;
	filteredCourseStudents: CourseStudentEntry[];
}

export default function GradeManagementCourseTable({
	courseLoading,
	courseGrades,
	filteredCourseStudents,
}: GradeManagementCourseTableProps) {
	return (
		<S.CourseTableContainer>
			{courseLoading ? (
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>수업 전체 성적 데이터를 불러오는 중...</p>
				</S.LoadingContainer>
			) : courseGrades?.items?.length && filteredCourseStudents.length > 0 ? (
				<S.CourseTable>
					<thead>
						<tr>
							<th rowSpan={2}>학생</th>
							<th rowSpan={2}>학번</th>
							{courseGrades.items.map((item) =>
								item.type === "quiz" ? (
									<S.CourseQuizHeader
										key={`${item.type}-${item.id}`}
										colSpan={item.problems.length + 1}
									>
										<S.ItemTitle>
											<S.ItemTypeBadge>퀴즈</S.ItemTypeBadge>
											{item.title}
										</S.ItemTitle>
									</S.CourseQuizHeader>
								) : (
									<S.CourseAssignmentHeader
										key={`${item.type}-${item.id}`}
										colSpan={item.problems.length + 1}
									>
										<S.ItemTitle>{item.title}</S.ItemTitle>
									</S.CourseAssignmentHeader>
								),
							)}
						</tr>
						<tr>
							{courseGrades.items.map((item) => (
								<React.Fragment key={`${item.type}-${item.id}-problems`}>
									{item.problems.map((problem) => (
										<S.ProblemHeader
											key={`${item.type}-${item.id}-${problem.problemId}`}
											as="th"
										>
											<S.ProblemTitle>
												{problem.problemTitle ?? ""}
											</S.ProblemTitle>
											<S.ProblemPoints>
												({problem.points ?? 0}
												점)
											</S.ProblemPoints>
										</S.ProblemHeader>
									))}
									<S.CourseAssignmentTotalHeader
										key={`${item.type}-${item.id}-total`}
										as="th"
									>
										총점
									</S.CourseAssignmentTotalHeader>
								</React.Fragment>
							))}
						</tr>
					</thead>
					<tbody>
						{filteredCourseStudents.map((student) => (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{courseGrades.items.map((item) => {
									if (item.type === "assignment") {
										const assignmentData = student.assignments?.[item.id];
										return (
											<React.Fragment
												key={`${student.userId}-assignment-${item.id}`}
											>
												{item.problems.map((problem) => {
													const problemGrade =
														assignmentData?.problems?.[problem.problemId];
													const score =
														problemGrade?.score !== null &&
														problemGrade?.score !== undefined
															? problemGrade.score
															: null;
													return (
														<td
															key={`${student.userId}-assignment-${item.id}-${problem.problemId}`}
														>
															{score !== null
																? `${score} / ${problem.points ?? 0}`
																: "-"}
														</td>
													);
												})}
												<S.TdCourseAssignmentTotalCell>
													{assignmentData ? (
														<strong>
															{assignmentData.totalScore} /{" "}
															{assignmentData.totalPoints}
														</strong>
													) : (
														"-"
													)}
												</S.TdCourseAssignmentTotalCell>
											</React.Fragment>
										);
									}
									if (item.type === "quiz") {
										const quizData = student.quizzes?.[item.id];
										return (
											<React.Fragment key={`${student.userId}-quiz-${item.id}`}>
												{item.problems.map((problem) => {
													const problemGrade =
														quizData?.problems?.[problem.problemId];
													const score =
														problemGrade?.score !== null &&
														problemGrade?.score !== undefined
															? problemGrade.score
															: null;
													return (
														<td
															key={`${student.userId}-quiz-${item.id}-${problem.problemId}`}
														>
															{score !== null
																? `${score} / ${problem.points ?? 0}`
																: "-"}
														</td>
													);
												})}
												<S.TdCourseAssignmentTotalCell>
													{quizData ? (
														<strong>
															{quizData.totalScore} / {quizData.totalPoints}
														</strong>
													) : (
														"-"
													)}
												</S.TdCourseAssignmentTotalCell>
											</React.Fragment>
										);
									}
									return null;
								})}
							</tr>
						))}
					</tbody>
				</S.CourseTable>
			) : (
				<S.NoData>
					<p>수업 전체 성적 데이터가 없습니다.</p>
				</S.NoData>
			)}
		</S.CourseTableContainer>
	);
}
