import type { FC } from "react";
import { removeCopyLabel } from "../../../../../../utils/problemUtils";
import * as S from "../../styles";
import type { CodingTestManagementHookReturn } from "../../hooks/useCodingTestManagement";

interface ProblemsTabViewProps {
	d: CodingTestManagementHookReturn;
}

const ProblemsTabView: FC<ProblemsTabViewProps> = ({ d }) => {
	return (
		<>
			<S.ProblemsTabHeader>
				<S.SectionTitle>대회 문제</S.SectionTitle>
				<S.ProblemsTabHeaderRight>
					<S.ProblemsCount>총 {d.problems.length}개</S.ProblemsCount>
					<S.ProblemsAddBtn
						type="button"
						onClick={() => {
							d.setShowAddProblemModal(true);
							d.setSelectedProblemIds(d.problems.map((p) => p.id));
						}}
					>
						+ 문제 추가
					</S.ProblemsAddBtn>
				</S.ProblemsTabHeaderRight>
			</S.ProblemsTabHeader>
			{d.problems.length === 0 ? (
				<S.NoData>
					<p>등록된 문제가 없습니다.</p>
				</S.NoData>
			) : (
				<S.ProblemsTableContainer>
					<S.ProblemsTable>
						<thead>
							<tr>
								<th>문제 번호</th>
								<th>제목</th>
								<th>배점</th>
								<th>제출수</th>
								<th>푼 사람 수</th>
								<th>정답률</th>
								<th>관리</th>
							</tr>
						</thead>
						<tbody>
							{d.problems.map((problem, index) => {
								const stat = d.problemStats?.find((s) => s.problemId === problem.id);
								return (
									<tr key={problem.id}>
										<S.ProblemNumberCell>{index + 1}</S.ProblemNumberCell>
										<S.ProblemTitleCell>
											<S.ProblemTitleMain>
												{removeCopyLabel(problem.title)}
											</S.ProblemTitleMain>
											{problem.description && (
												<S.ProblemDescriptionPreview>
													{problem.description.length > 100
														? `${problem.description.substring(0, 100)}...`
														: problem.description}
												</S.ProblemDescriptionPreview>
											)}
										</S.ProblemTitleCell>
										<td>{problem.points ?? 1}점</td>
										<td>{stat ? `${stat.submittedStudents ?? 0}회` : "0회"}</td>
										<td>{stat ? `${stat.correctSubmissions ?? 0}명` : "0명"}</td>
										<td>
											{stat && stat.correctRate != null
												? `${Math.round(stat.correctRate)}%`
												: "0%"}
										</td>
										<td>
											<S.ProblemRemoveBtn
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													d.handleRemoveProblemFromQuiz(problem.id);
												}}
											>
												제거
											</S.ProblemRemoveBtn>
										</td>
									</tr>
								);
							})}
						</tbody>
					</S.ProblemsTable>
				</S.ProblemsTableContainer>
			)}
		</>
	);
};

export default ProblemsTabView;
