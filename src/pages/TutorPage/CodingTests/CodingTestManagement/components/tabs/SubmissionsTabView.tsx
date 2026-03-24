import type { FC } from "react";
import { removeCopyLabel } from "../../../../../../utils/problemUtils";
import * as S from "../../styles";
import type { CodingTestManagementHookReturn } from "../../hooks/useCodingTestManagement";

interface SubmissionsTabViewProps {
	d: CodingTestManagementHookReturn;
}

function getResultLabel(result: string) {
	const labels: Record<string, string> = {
		AC: "정답",
		WA: "오답",
		TLE: "시간초과",
		RE: "런타임에러",
		CE: "컴파일에러",
		MLE: "메모리초과",
		OLE: "출력초과",
	};
	return labels[result] ?? result ?? "-";
}

function getResultBadgeColor(result: string) {
	switch (result) {
		case "AC":
			return "#10b981";
		case "WA":
			return "#ef4444";
		case "TLE":
		case "MLE":
		case "OLE":
			return "#f59e0b";
		case "RE":
		case "CE":
			return "#8b5cf6";
		default:
			return "#64748b";
	}
}

const SubmissionsTabView: FC<SubmissionsTabViewProps> = ({ d }) => {
	return (
		<>
			<S.SectionTitle style={{ marginBottom: "1rem" }}>제출 기록 (시간순)</S.SectionTitle>
			<S.FiltersSection>
				<S.StatusFilters>
					{["ALL", "AC", "WA", "TLE", "RE", "CE"].map((result) => (
						<S.FilterBtn
							key={result}
							type="button"
							$active={
								result === "ALL"
									? !d.submissionResultFilter || d.submissionResultFilter === "ALL"
									: d.submissionResultFilter === result
							}
							onClick={() => {
								d.setSubmissionResultFilter(result);
								d.setSubmissionRecordsPage(1);
							}}
						>
							{result === "ALL" ? "전체" : result}
						</S.FilterBtn>
					))}
				</S.StatusFilters>
			</S.FiltersSection>
			{d.submissionRecordsLoading ? (
				<S.NoData>
					<p>제출 기록을 불러오는 중...</p>
				</S.NoData>
			) : d.submissionRecords.length === 0 ? (
				<S.NoData>
					<p>제출 기록이 없습니다.</p>
				</S.NoData>
			) : (
				<>
					<S.TableContainer style={{ marginBottom: "1.5rem" }}>
						<S.Table $compact>
							<thead>
								<tr>
									<th>제출시간</th>
									<th>학번</th>
									<th>이름</th>
									<th>문제</th>
									<th>결과</th>
									<th>언어</th>
									<th>상세보기</th>
								</tr>
							</thead>
							<tbody>
								{d.submissionRecords.map((rec) => (
									<tr key={rec.submissionId}>
										<td>{d.formatDateTime(rec.submittedAt)}</td>
										<td>{rec.studentId}</td>
										<td>{rec.studentName}</td>
										<td>{removeCopyLabel(rec.problemTitle)}</td>
										<td>
											<span
												style={{
													display: "inline-block",
													padding: "0.15rem 0.4rem",
													borderRadius: "4px",
													fontSize: "0.75rem",
													fontWeight: 500,
													backgroundColor: `${getResultBadgeColor(rec.result)}20`,
													color: getResultBadgeColor(rec.result),
												}}
											>
												{getResultLabel(rec.result)}
											</span>
										</td>
										<td>{rec.language ?? "-"}</td>
										<td>
											<S.EditButton
												type="button"
												$small
												onClick={() => d.fetchSubmissionCode(rec.submissionId)}
											>
												코드 보기
											</S.EditButton>
										</td>
									</tr>
								))}
							</tbody>
						</S.Table>
					</S.TableContainer>
					{d.submissionRecordsTotalPages > 1 && (
						<S.ProblemSelectPagination style={{ marginBottom: "1.5rem" }}>
							<S.ProblemSelectPaginationBtn
								type="button"
								onClick={() => d.setSubmissionRecordsPage((p) => Math.max(1, p - 1))}
								disabled={d.submissionRecordsPage === 1}
							>
								이전
							</S.ProblemSelectPaginationBtn>
							<span>
								{d.submissionRecordsPage} / {d.submissionRecordsTotalPages} (총{" "}
								{d.submissionRecordsTotal}건)
							</span>
							<S.ProblemSelectPaginationBtn
								type="button"
								onClick={() =>
									d.setSubmissionRecordsPage((p) =>
										Math.min(d.submissionRecordsTotalPages, p + 1),
									)
								}
								disabled={d.submissionRecordsPage === d.submissionRecordsTotalPages}
							>
								다음
							</S.ProblemSelectPaginationBtn>
						</S.ProblemSelectPagination>
					)}
				</>
			)}

		</>
	);
};

export default SubmissionsTabView;
