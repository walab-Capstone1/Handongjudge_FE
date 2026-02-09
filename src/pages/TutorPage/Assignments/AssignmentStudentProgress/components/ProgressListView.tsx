import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "../styles";
import type { Assignment, SubmissionStats } from "../types";

interface ProgressListViewProps {
	sectionId: string | undefined;
	loading: boolean;
	assignmentsLength: number;
	filteredAssignments: Assignment[];
	progressSearchTerm: string;
	onProgressSearchChange: (value: string) => void;
	submissionStats: Record<number, SubmissionStats>;
}

const ProgressListView: FC<ProgressListViewProps> = ({
	sectionId,
	loading,
	assignmentsLength,
	filteredAssignments,
	progressSearchTerm,
	onProgressSearchChange,
	submissionStats,
}) => {
	const navigate = useNavigate();

	return (
		<S.AssignmentProgressContainer>
			<S.PageHeader>
				<S.PageTitle>과제별 풀이 현황</S.PageTitle>
			</S.PageHeader>
			<S.FiltersSection>
				<S.SearchBox>
					<S.SearchInput
						type="text"
						placeholder="과제명으로 검색..."
						value={progressSearchTerm}
						onChange={(e) => onProgressSearchChange(e.target.value)}
					/>
				</S.SearchBox>
			</S.FiltersSection>
			{loading ? (
				<S.LoadingContainer>
					<S.LoadingSpinner />
					<p>과제 목록을 불러오는 중...</p>
				</S.LoadingContainer>
			) : assignmentsLength === 0 ? (
				<S.NoData>
					<p>등록된 과제가 없습니다.</p>
				</S.NoData>
			) : (
				<S.AssignmentsTableContainer>
					<S.AssignmentsTable>
						<thead>
							<tr>
								<th>과제 제목</th>
								<th>마감일</th>
								<th>문제 수</th>
								<th>제출 현황</th>
							</tr>
						</thead>
						<tbody>
							{filteredAssignments.length === 0 ? (
								<tr>
									<S.TableEmpty colSpan={4}>
										검색 조건에 맞는 과제가 없습니다.
									</S.TableEmpty>
								</tr>
							) : (
								filteredAssignments.map((a) => (
									<tr
										key={a.id}
										className="admin-clickable"
										tabIndex={0}
										onClick={() =>
											sectionId &&
											navigate(
												`/tutor/assignments/section/${sectionId}/progress/${a.id}`,
											)
										}
										onKeyDown={(e) => {
											if ((e.key === "Enter" || e.key === " ") && sectionId) {
												e.preventDefault();
												navigate(
													`/tutor/assignments/section/${sectionId}/progress/${a.id}`,
												);
											}
										}}
									>
										<S.AssignmentTitleCell>
											<div>
												<div>{a.title}</div>
												{a.description && (
													<S.AssignmentDescription>
														{a.description}
													</S.AssignmentDescription>
												)}
											</div>
										</S.AssignmentTitleCell>
										<S.AssignmentMetaCell>
											{a.endDate
												? new Date(a.endDate).toLocaleDateString("ko-KR", {
														month: "short",
														day: "numeric",
													})
												: a.deadline
													? new Date(a.deadline).toLocaleDateString("ko-KR", {
															month: "short",
															day: "numeric",
														})
													: "미설정"}
										</S.AssignmentMetaCell>
										<S.AssignmentMetaCell>
											{a.problemCount ?? 0}개
										</S.AssignmentMetaCell>
										<S.AssignmentMetaCell>
											{submissionStats[a.id]
												? `${submissionStats[a.id]?.submittedStudents ?? 0}/${submissionStats[a.id]?.totalStudents ?? 0}`
												: "0/0"}
										</S.AssignmentMetaCell>
									</tr>
								))
							)}
						</tbody>
					</S.AssignmentsTable>
				</S.AssignmentsTableContainer>
			)}
		</S.AssignmentProgressContainer>
	);
};

export default ProgressListView;
