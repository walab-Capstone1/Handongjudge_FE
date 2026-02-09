import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import * as S from "../styles";
import type { StudentGradeRow } from "../types";

export interface GradeManagementQuizTableProps {
	grades: StudentGradeRow[];
	filteredGrades: StudentGradeRow[];
}

export default function GradeManagementQuizTable({
	grades,
	filteredGrades,
}: GradeManagementQuizTableProps) {
	if (grades.length === 0) {
		return (
			<S.TableContainer>
				<S.NoData>
					<p>등록된 성적이 없습니다.</p>
				</S.NoData>
			</S.TableContainer>
		);
	}

	return (
		<S.TableContainer>
			<S.Table>
				<thead>
					<tr>
						<th>학생</th>
						<th>학번</th>
						{grades[0]?.problemGrades?.map((p) => (
							<S.ProblemHeader key={p.problemId} as="th">
								<S.ProblemTitle>{p.problemTitle ?? ""}</S.ProblemTitle>
								<S.ProblemPoints>({p.points ?? 0}점)</S.ProblemPoints>
							</S.ProblemHeader>
						))}
						<th>총점</th>
						<th>비율</th>
					</tr>
				</thead>
				<tbody>
					{filteredGrades.map((student) => {
						const totalScore = student.totalScore ?? 0;
						const totalPoints = student.totalPoints ?? 0;
						const ratio =
							totalPoints > 0
								? ((totalScore / totalPoints) * 100).toFixed(1)
								: 0;
						return (
							<tr key={student.userId}>
								<S.TdStudentName>{student.studentName}</S.TdStudentName>
								<S.TdStudentId>{student.studentId}</S.TdStudentId>
								{student.problemGrades?.map((problem) => (
									<td key={problem.problemId}>
										<S.ScoreDisplay>
											<S.ScoreValue>
												{problem.score !== null && problem.score !== undefined
													? `${problem.score} / ${problem.points ?? 0}`
													: "-"}
											</S.ScoreValue>
											{problem.submitted && (
												<S.SubmissionInfo>
													<S.SubmissionStatus $onTime={problem.isOnTime}>
														{problem.isOnTime ? (
															<>
																<FaCheckCircle /> 제시간
															</>
														) : (
															<>
																<FaTimesCircle /> 지연
															</>
														)}
													</S.SubmissionStatus>
													{problem.submittedAt && (
														<S.SubmissionTime>
															<FaClock />{" "}
															{new Date(problem.submittedAt).toLocaleString(
																"ko-KR",
															)}
														</S.SubmissionTime>
													)}
												</S.SubmissionInfo>
											)}
										</S.ScoreDisplay>
									</td>
								))}
								<S.TdTotalCell>
									<strong>
										{totalScore} / {totalPoints}
									</strong>
								</S.TdTotalCell>
								<S.TdRatioCell>
									<strong>{ratio}%</strong>
								</S.TdRatioCell>
							</tr>
						);
					})}
				</tbody>
			</S.Table>
		</S.TableContainer>
	);
}
