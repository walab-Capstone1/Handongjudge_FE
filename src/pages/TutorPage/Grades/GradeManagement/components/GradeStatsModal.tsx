import * as S from "../styles";

export interface GradeStatsModalProps {
	show: boolean;
	stats: {
		problemStats: Array<{
			problemId: number;
			problemTitle: string;
			points: number;
			avg: number;
			max: number;
			min: number;
			submittedCount: number;
			totalCount: number;
		}>;
		overall: {
			avg: number;
			max: number;
			min: number;
			totalPoints: number;
			totalStudents: number;
		};
	} | null;
	onClose: () => void;
}

export default function GradeStatsModal({
	show,
	stats,
	onClose,
}: GradeStatsModalProps) {
	if (!show || !stats) return null;

	return (
		<S.ModalOverlay
			onClick={onClose}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			role="button"
			tabIndex={0}
		>
			<S.ModalContent $large>
				<div
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<S.ModalHeader>
						<h2>성적 통계</h2>
						<S.ModalClose type="button" onClick={onClose} aria-label="닫기">
							×
						</S.ModalClose>
					</S.ModalHeader>
					<S.ModalBody>
						<S.StatsSection>
							<S.StatsTitle>전체 통계</S.StatsTitle>
							<S.StatsGrid>
								<S.StatCard>
									<S.StatLabel>평균 점수</S.StatLabel>
									<S.StatValue>
										{stats.overall.avg} / {stats.overall.totalPoints}
									</S.StatValue>
								</S.StatCard>
								<S.StatCard>
									<S.StatLabel>최고 점수</S.StatLabel>
									<S.StatValue>
										{stats.overall.max} / {stats.overall.totalPoints}
									</S.StatValue>
								</S.StatCard>
								<S.StatCard>
									<S.StatLabel>최저 점수</S.StatLabel>
									<S.StatValue>
										{stats.overall.min} / {stats.overall.totalPoints}
									</S.StatValue>
								</S.StatCard>
								<S.StatCard>
									<S.StatLabel>학생 수</S.StatLabel>
									<S.StatValue>{stats.overall.totalStudents}명</S.StatValue>
								</S.StatCard>
							</S.StatsGrid>
						</S.StatsSection>
						<S.StatsSection>
							<S.StatsTitle>문제별 통계</S.StatsTitle>
							<S.ProblemStatsTable>
								<S.StatsTable>
									<thead>
										<tr>
											<th>문제</th>
											<th>배점</th>
											<th>평균</th>
											<th>최고</th>
											<th>최저</th>
											<th>제출률</th>
										</tr>
									</thead>
									<tbody>
										{stats.problemStats.map((stat) => {
											const submissionRate =
												stat.totalCount > 0
													? (
															(stat.submittedCount / stat.totalCount) *
															100
														).toFixed(1)
													: "0";
											return (
												<tr key={stat.problemId}>
													<td>
														<S.StatProblemTitle>
															{stat.problemTitle}
														</S.StatProblemTitle>
													</td>
													<td>{stat.points}점</td>
													<td>{stat.avg.toFixed(1)}</td>
													<td>{stat.max}</td>
													<td>{stat.min}</td>
													<td>
														<S.SubmissionRate>
															<span>{submissionRate}%</span>
															<S.ProgressBar>
																<S.ProgressFill
																	$width={Number(submissionRate)}
																/>
															</S.ProgressBar>
														</S.SubmissionRate>
													</td>
												</tr>
											);
										})}
									</tbody>
								</S.StatsTable>
							</S.ProblemStatsTable>
						</S.StatsSection>
					</S.ModalBody>
				</div>
			</S.ModalContent>
		</S.ModalOverlay>
	);
}
