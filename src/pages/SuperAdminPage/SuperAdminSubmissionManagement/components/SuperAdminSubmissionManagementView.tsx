import Header from "../../../../components/Layout/Header";
import LoadingSpinner from "../../../../components/UI/LoadingSpinner";
import * as S from "../../../TutorPage/Users/UserManagement/styles";
import type { SuperAdminSubmissionManagementHookReturn } from "../hooks/useSuperAdminSubmissionManagement";
import type { ResultFilter } from "../types";

export default function SuperAdminSubmissionManagementView(
	d: SuperAdminSubmissionManagementHookReturn,
) {
	if (d.loading) {
		return (
			<>
				<Header onUserNameClick={() => {}} />
				<LoadingSpinner message="제출 내역을 불러오는 중..." />
			</>
		);
	}

	return (
		<>
			<Header onUserNameClick={() => {}} />
			<S.Container>
				<S.Header>
					<S.HeaderLeft>
						<S.Title>제출 내역 관리</S.Title>
					</S.HeaderLeft>
				</S.Header>
				<div style={{ marginBottom: "1rem" }}>
					<select
						value={d.resultFilter}
						onChange={(e) => d.setResultFilter(e.target.value as ResultFilter)}
						style={{
							padding: "0.75rem",
							border: "1px solid #e5e7eb",
							borderRadius: "6px",
						}}
					>
						<option value="ALL">전체 결과</option>
						<option value="ACCEPTED">정답</option>
						<option value="WRONG_ANSWER">오답</option>
						<option value="RUNTIME_ERROR">런타임 에러</option>
						<option value="TIME_LIMIT">시간 초과</option>
						<option value="COMPILE_ERROR">컴파일 에러</option>
					</select>
				</div>
				<S.TableContainer>
					<S.Table>
						<thead>
							<tr>
								<S.Th>제출 ID</S.Th>
								<S.Th>사용자</S.Th>
								<S.Th>문제</S.Th>
								<S.Th>언어</S.Th>
								<S.Th>결과</S.Th>
								<S.Th>제출 시간</S.Th>
							</tr>
						</thead>
						<tbody>
							{d.filteredSubmissions.map((submission) => (
								<tr key={submission.id}>
									<S.Td>#{submission.id}</S.Td>
									<S.Td>{submission.userName}</S.Td>
									<S.Td>{submission.problemTitle}</S.Td>
									<S.Td>{submission.language}</S.Td>
									<S.Td>
										<span
											style={{
												padding: "0.25rem 0.6rem",
												borderRadius: "12px",
												fontSize: "0.75rem",
												fontWeight: 600,
												backgroundColor:
													d.getResultColor(submission.result) + "20",
												color: d.getResultColor(submission.result),
											}}
										>
											{submission.result}
										</span>
									</S.Td>
									<S.Td>
										{new Date(submission.submittedAt).toLocaleString("ko-KR")}
									</S.Td>
								</tr>
							))}
						</tbody>
					</S.Table>
				</S.TableContainer>
				{d.filteredSubmissions.length === 0 && (
					<div
						style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}
					>
						{d.resultFilter !== "ALL"
							? "검색 결과가 없습니다."
							: "제출 내역이 없습니다."}
					</div>
				)}
			</S.Container>
		</>
	);
}
